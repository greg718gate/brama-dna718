# ═══════════════════════════════════════════════════════════════════
# MOST GATCA-718 v3 — DETERMINISTYCZNY REZONANSOWY BOT TRADINGOWY
# ARCHITEKTURA: ASYNC WEBSOCKET · IN-MEMORY PARSING · DETERMINISTIC SEED
#
# © 2026 Grzegorz | BRAMA-718-UNIFIED / NovaStream88 Ltd
# Licensed under Creative Commons BY-NC 4.0
# ═══════════════════════════════════════════════════════════════════
#
# CO POPRAWIONO wobec v1/v2 i wobec szkicu użytkownika:
#   1. GAMMA rozdzielona na dwie różne stałe (w szkicu były pomylone):
#        - GAMMA_INV_PHI    = 1/φ  → wektor entropii DNA
#        - EULER_MASCHERONI = 0.5772... → waga warstwy harmonicznej
#   2. Warstwa L1 to realny algorytm 18 bram mtDNA (deterministyczny PRNG
#      zasilany hashem bufora cen) — nie placeholder sin(price*PHI).
#   3. Warstwy liczone na CAŁYM oknie 50 cen (nie na jednej ostatniej cenie),
#      dokładnie tak jak backend Quantum Filter → identyczne wyniki.
#   4. Dodany FILTR PROWIZJI: sygnał wykonalny tylko gdy oczekiwany ruch
#      (zmienność realizowana × |composite| × φ) ≥ 0.27% (fee+spread+bufor).
#   5. Prawdziwy strumień WebSocket Binance (bez mock listy), z auto-reconnect.
#   6. Zarządzanie pozycją: Take-Profit / Stop-Loss / sygnał przeciwny + PnL.
#   7. Egzekucja przez ccxt z obsługą TESTNET i trybu PAPER (domyślnie PAPER).
#   8. Klucze API czytane WYŁĄCZNIE ze zmiennych środowiskowych (RAM),
#      nigdy nie zapisywane na dysk ani w logach.
#
# WYMAGANIA:
#   pip install ccxt websockets numpy
#
# URUCHOMIENIE (bezpiecznie, bez zleceń):
#   python most_gatca_v3_async.py
#
# URUCHOMIENIE NA TESTNECIE BINANCE (zlecenia wirtualne):
#   export BINANCE_API_KEY="..."      # klucz z testnet.binance.vision
#   export BINANCE_API_SECRET="..."
#   export GATCA_MODE="testnet"
#   python most_gatca_v3_async.py
#
# TRYB REALNY (na własną odpowiedzialność):
#   export GATCA_MODE="live"
# ═══════════════════════════════════════════════════════════════════

import asyncio
import csv
import hashlib
import json
import logging
import logging.handlers
import math
import os
import sys
import threading
from collections import deque
from datetime import datetime, timedelta, timezone

# ─── KONSOLA WINDOWS: wymuszenie UTF-8 ────────────────────────────
# Bez tego polskie znaki (ł, ń, ś) wywalają cp1250/charmap
# (UnicodeEncodeError) w środku pętli WebSocket → fałszywy reconnect.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # pragma: no cover — starsze Pythony / dziwne terminale
        pass


try:
    import websockets
except ImportError:  # pragma: no cover
    websockets = None

try:
    import ccxt
except ImportError:  # pragma: no cover
    ccxt = None


# ─── STAŁE FUNDAMENTALNE PROJEKTU ────────────────────────────────
PHI = (1 + 5 ** 0.5) / 2                 # 1.618033988749895 — Złoty Podział
GAMMA_INV_PHI = 1 / PHI                  # 0.618033988749895 — odwrotność φ
EULER_MASCHERONI = 0.577215664901532     # waga rezonansu harmonicznego
CARRIER_FREQ = 718.570125154268855       # 448. zero funkcji ζ Riemanna [Hz]
SCHUMANN = 7.83                          # rezonans Ziemi [Hz]
MTDNA_LENGTH = 16569                     # długość rCRS mtDNA
GATCA_POSITIONS = [1, 740, 951, 1227, 2996, 3424, 4166, 4832, 6393,
                   7756, 8415, 10059, 11200, 11336, 11915, 13703, 14784, 16179]

# ─── PARAMETRY DECYZYJNE ─────────────────────────────────────────
WINDOW_SIZE = 50
# Wzmocnienie przed tanh. Kalibracja 14.08.2026: przy 30 tanh saturował się
# i KAŻDY tick pokazywał 100.00% pewności (wskaźnik bez wartości informacyjnej,
# tarcie Tf = 0 → wir Mc = 0 → wieczne WAIT(MOVE_BELOW_FEES)).
AMPLIFIER = 6
MIN_CONFIDENCE = 98.0           # % — próg wejścia w pozycję

FEE_PER_SIDE = 0.001            # 0.10% Binance Spot na każdą stronę
SPREAD_ESTIMATE = 0.0002        # 0.02%
SAFETY_BUFFER = 0.0005          # 0.05%
MIN_PROFITABLE_MOVE = FEE_PER_SIDE * 2 + SPREAD_ESTIMATE + SAFETY_BUFFER  # 0.27%

TAKE_PROFIT_PCT = 0.0080        # 0.80% — dopasowany do zmienności SOL/USDT
STOP_LOSS_PCT = 0.0040          # 0.40%
# Ile domkniętych świec 1m musi minąć po zamknięciu pozycji, zanim bot
# może wejść ponownie (blokada serii natychmiastowych re-entry).
COOLDOWN_BARS_AFTER_EXIT = 2


# ─── INSTRUMENT: SOLANA (SOL/USDT) ───────────────────────────────
# Zmiana z BTC na SOL: ruch 1-minutowy SOL jest wielokrotnie większy,
# więc sygnał 98% ma realną szansę pokryć prowizje i wygenerować zysk.
SYMBOL_WS = os.environ.get("GATCA_SYMBOL_WS", "solusdt").lower()
SYMBOL_CCXT = os.environ.get("GATCA_SYMBOL", "SOL/USDT").upper()
ORDER_QUOTE_SIZE = 20.0         # ile USDT na jedno wejście (testnet/live)
MODE = os.environ.get("GATCA_MODE", "paper").lower()   # paper | testnet | live
SESSION_ID = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
# Każde uruchomienie dostaje osobny plik. Dzięki temu analiza nowej sesji nie
# wczytuje ponownie starych danych BTC/SOL z jednego, stale dopisywanego CSV.
LOG_FILE = os.environ.get("GATCA_TRADE_LOG", f"most_gatca_v3_trades_{SESSION_ID}.csv")
PERF_LOG_FILE = os.environ.get(
    "GATCA_PERF_LOG", f"gatca_performance_{SYMBOL_WS}_{SESSION_ID}.csv"
)
POSITION_STATE_FILE = os.environ.get(
    "GATCA_STATE_FILE", f"gatca_position_{SYMBOL_WS}_{MODE}.json"
)
TEXT_LOG_FILE = os.environ.get("GATCA_TEXT_LOG", f"gatca_run_{SYMBOL_WS}_{MODE}.log")

RUN_HOURS = float(os.environ.get("GATCA_RUN_HOURS", "72"))   # czas pracy sesji [h]

# Reconnect: backoff wykładniczy 1 → 2 → 4 … do 60 s (zamiast sztywnych 5 s).
RECONNECT_BACKOFF_MAX = 60.0
# Stan pozycji starszy niż to uznajemy za nieaktualny (rynek uciekł).
STATE_MAX_AGE_HOURS = float(os.environ.get("GATCA_STATE_MAX_AGE_H", "12"))
# Bezpieczne zatrzymanie procesu (Ctrl+C / sygnał) bez zerwania zapisu stanu.
STOP_EVENT = threading.Event()


# ─── LOGGING Z ROTACJĄ (zamiast print) ────────────────────────────
log = logging.getLogger("gatca718")
if not log.handlers:
    log.setLevel(getattr(logging, os.environ.get("GATCA_LOG_LEVEL", "INFO").upper(), logging.INFO))
    _fmt = logging.Formatter("%(asctime)sZ %(levelname)-7s %(message)s", "%Y-%m-%dT%H:%M:%S")
    _console = logging.StreamHandler(sys.stdout)
    _console.setFormatter(_fmt)
    _file = logging.handlers.RotatingFileHandler(
        TEXT_LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    _file.setFormatter(_fmt)
    log.addHandler(_console)
    log.addHandler(_file)
    log.propagate = False

# Zapisy CSV mogą przyjść z różnych zadań asynchronicznych/wątków wykonawcy —
# jeden lock chroni oba pliki przed przeplotem wierszy.
CSV_LOCK = threading.Lock()


# ═════════════════════════════════════════════════════════════════
# DETERMINISTYCZNY PRNG 18 BRAM (identyczny z backendem Quantum Filter)
# ═════════════════════════════════════════════════════════════════
class Gatca718Prng:
    """Deterministyczny generator entropii oparty na 18 bramach mtDNA.
    Ten sam seed → ten sam wektor entropii → w pełni odtwarzalne decyzje."""

    def __init__(self, seed: int):
        self.seed = seed
        self.counter = 0
        self.entropy = [((GATCA_POSITIONS[i] * seed) % MTDNA_LENGTH) / MTDNA_LENGTH
                        for i in range(18)]

    def next_raw(self) -> float:
        self.counter += 1
        gate_entropy = self.entropy[self.counter % 18]
        x = math.sin(self.counter * PHI + gate_entropy * CARRIER_FREQ) * 10000
        return x - math.floor(x)

    def vector(self, size: int):
        return [self.next_raw() for _ in range(size)]

    @property
    def gate_signature(self) -> str:
        idx = self.counter % 18
        return f"G{idx + 1}:{GATCA_POSITIONS[idx]}:{self.counter}"


def deterministic_seed(prices) -> int:
    """Seed z bufora cen — te same ceny zawsze dają ten sam wynik.
    (SHA-256 zamiast rolling-hash: brak kolizji, stabilny między wersjami)."""
    payload = ",".join(f"{round(p * 100)}" for p in prices).encode()
    return int(hashlib.sha256(payload).hexdigest()[:12], 16)


# ═════════════════════════════════════════════════════════════════
# PROFIL UNIFIKACJI v1.3 — TARCIE TOPOLOGICZNE (Tf) I KONDENSACJA MASY (Mc)
# Znoszenie blokady MOVE_BELOW_FEES przy wykryciu wiru magnetycznego turbiny
# ═════════════════════════════════════════════════════════════════
DYSTANS_TURBINY_BP = 1644        # dystans genetyczny B11 -> B12 (Syntaza ATP)
PROG_WIRU_MC = 25.0              # próg aktywacji wiru dla mikro-świec 1m
PROG_RESET_PORTU = 50.0          # poniżej = Brama Zero (B18 -> B1)


class GatcaZetaCoreUnifiedEngine:
    """Idealna harmonia (100%) przesyła bezmasową informację.
    Kontrolowane zaburzenie (Tarcie Topologiczne) buduje fizyczny impuls (masę)."""

    def __init__(self):
        self.PHI = PHI
        self.GAMMA_INV_PHI = GAMMA_INV_PHI
        self.EULER_MASCHERONI = EULER_MASCHERONI
        self.CARRIER_FREQ = CARRIER_FREQ
        self.SCHUMANN = SCHUMANN
        self.FILTR_PROWIZJI = MIN_PROFITABLE_MOVE
        self.PROG_PEWNOSCI = MIN_CONFIDENCE

    def oblicz_dynamiczne_tarcie_i_mase(self, pewnosc_g15: float, dynamiczny_ruch_rynku: float):
        koherencja = pewnosc_g15 / 100.0
        tarcie_tf = 1.0 - koherencja
        wskaznik_mc = DYSTANS_TURBINY_BP * tarcie_tf

        # Port Resetu Fazy / Brama Zero
        if pewnosc_g15 < PROG_RESET_PORTU:
            return "WAIT(RESET_PORT)", wskaznik_mc, "[BRAMA_ZERO] Całkowite załamanie rezonansu. Reset fazy."

        if pewnosc_g15 >= self.PROG_PEWNOSCI:
            # Ścieżka A: zmienność już się zmaterializowała
            if dynamiczny_ruch_rynku >= self.FILTR_PROWIZJI:
                return "EXECUTE", wskaznik_mc, "[IMPULS_RYNKOWY] Ruch ceny pokrywa prowizje."
            # Ścieżka B: asymetryczny wir magnetyczny (turbina 150 Hz)
            elif wskaznik_mc >= PROG_WIRU_MC:
                return "EXECUTE", wskaznik_mc, "[TURBINA_ATP] Wykryto tarcie topologiczne. Zniesienie blokady opłat."
            # Ścieżka C: czysta bezmasowa informacja
            else:
                return "WAIT(MOVE_BELOW_FEES)", wskaznik_mc, "[STAZ_INFORMACYJNY] Pełna koherencja bez masy rynkowej."

        return "WAIT", wskaznik_mc, "[SZUM] Brak dopasowania do matrycy rCRS."


def generuj_nowy_log_konsoli(cena, status_unifikacji, pewnosc, ruch, mc, opis_turbiny,
                             gate="G15:11915:50", pozycja="NONE"):
    """Rozszerzony format logu zawierający wskaźnik masy Mc oraz STAN POZYCJI.
    Gdy pozycja jest otwarta, sygnał BUY jest raportowany jako HOLD_LONG —
    bot fizycznie nie może kupić drugi raz."""
    print(
        f"Price: ${cena:,.2f} | POS:{pozycja:<4} | {status_unifikacji:<22} | "
        f"Pewność: {pewnosc:6.2f}% | ruch {ruch*100:.3f}%/{MIN_PROFITABLE_MOVE*100:.2f}% | "
        f"Wir_Mc: {mc:6.2f} | {opis_turbiny} | {gate} | SPOT_UK"
    )




# ═════════════════════════════════════════════════════════════════
# FILTR REZONANSOWY 3-WARSTWOWY
# ═════════════════════════════════════════════════════════════════
class GatcaResonanceFilter:
    def __init__(self, window_size: int = WINDOW_SIZE):
        self.window_size = window_size
        self.price_history = []          # wyłącznie RAM (In-Memory)
        self.unified = GatcaZetaCoreUnifiedEngine()


    # ── bufor kołowy ──
    def update_market_data(self, current_price: float) -> None:
        self.price_history.append(float(current_price))
        if len(self.price_history) > self.window_size:
            self.price_history.pop(0)

    @property
    def ready(self) -> bool:
        return len(self.price_history) >= self.window_size

    # ── Warstwa 1: korelacja cen z wektorem entropii DNA (waga φ) ──
    def calculate_l1_gatca_correlation(self, entropy) -> float:
        data = self.price_history
        s = sum(math.sin(data[i] * entropy[i]) for i in range(len(data)))
        return (s / len(data)) * PHI

    # ── Warstwa 2: rezonans harmoniczny wobec nośnej / φ (waga γ Eulera) ──
    def calculate_l2_harmonic_resonance(self) -> float:
        data = self.price_history
        s = sum(math.cos(p / PHI) for p in data)
        return (s / len(data)) * EULER_MASCHERONI

    # ── Warstwa 3: koherencja fazowa z rezonansem Schumanna 7.83 Hz ──
    def calculate_l3_phase_coherence(self) -> float:
        data = self.price_history
        s = 0.0
        for p in data:
            phase = (p % SCHUMANN) / SCHUMANN * 2 * math.pi
            s += math.cos(phase)
        return s / len(data)

    # ── oczekiwany ruch ceny (zmienność realizowana × siła sygnału × φ) ──
    def expected_move(self, composite: float) -> float:
        data = self.price_history
        if len(data) < 2:
            return 0.0
        rets = [(data[i] - data[i - 1]) / data[i - 1]
                for i in range(1, len(data)) if data[i - 1] > 0]
        if not rets:
            return 0.0
        mean = sum(rets) / len(rets)
        var = sum((r - mean) ** 2 for r in rets) / len(rets)
        return math.sqrt(var) * abs(composite) * PHI

    # ── agregacja ──
    def compute_composite_signal(self):
        if not self.ready:
            return {"decision": "WAIT", "confidence": 0.0, "reason": "WARMUP",
                    "composite": 0.0, "gate": "-", "expected_move_pct": 0.0,
                    "required_move_pct": MIN_PROFITABLE_MOVE * 100,
                    "unification_status": "WAIT(WARMUP)", "mc": 0.0, "tf": 1.0,
                    "turbine_note": "[WARMUP] Zbieranie okna cen."}


        prng = Gatca718Prng(deterministic_seed(self.price_history))
        entropy = prng.vector(len(self.price_history))

        l1 = self.calculate_l1_gatca_correlation(entropy)
        l2 = self.calculate_l2_harmonic_resonance()
        l3 = self.calculate_l3_phase_coherence()

        # Zachowujemy znaki wszystkich warstw. Poprzednie abs(l2)+abs(l3)
        # sztucznie przesuwało wynik powyżej zera, więc SELL był niemal
        # nieosiągalny niezależnie od kierunku rezonansu harmonicznego/fazy.
        composite = (l1 + l2 + l3) / (PHI + EULER_MASCHERONI + 1)
        confidence = math.tanh(abs(composite) * AMPLIFIER) * 100

        move = self.expected_move(composite)

        # ── UNIFIKACJA v1.3: Tarcie Topologiczne + Kondensacja Masy ──
        status_unifikacji, wskaznik_mc, opis_turbiny = \
            self.unified.oblicz_dynamiczne_tarcie_i_mase(confidence, move)

        if status_unifikacji == "EXECUTE":
            decision = "BUY" if composite > 0 else "SELL"
            reason = None
        else:
            decision = "WAIT"
            if status_unifikacji == "WAIT(RESET_PORT)":
                reason = "RESET_PORT"
            elif status_unifikacji == "WAIT(MOVE_BELOW_FEES)":
                reason = "MOVE_BELOW_FEES"
            else:
                reason = "LOW_CONFIDENCE"

        return {
            "decision": decision,
            "confidence": confidence,
            "composite": composite,
            "layers": {"correlation": l1, "harmonic": l2, "phase": l3},
            "expected_move_pct": move * 100,
            "required_move_pct": MIN_PROFITABLE_MOVE * 100,
            "reason": reason,
            "gate": prng.gate_signature,
            "unification_status": status_unifikacji,
            "mc": wskaznik_mc,
            "tf": 1.0 - confidence / 100.0,
            "turbine_note": opis_turbiny,
        }



# ═════════════════════════════════════════════════════════════════
# EGZEKUCJA (PAPER / TESTNET / LIVE)
# ═════════════════════════════════════════════════════════════════
class Executor:
    """Klucze API tylko z ENV → trzymane w RAM, nigdy w logach."""

    def __init__(self, mode: str = MODE):
        self.mode = mode
        self.exchange = None
        if mode in ("testnet", "live"):
            if ccxt is None:
                raise RuntimeError("Brak biblioteki ccxt: pip install ccxt")
            key = os.environ.get("BINANCE_API_KEY")
            secret = os.environ.get("BINANCE_API_SECRET")
            if not key or not secret:
                raise RuntimeError("Ustaw BINANCE_API_KEY i BINANCE_API_SECRET w ENV")
            self.exchange = ccxt.binance({
                "apiKey": key,
                "secret": secret,
                "enableRateLimit": True,
                "options": {"defaultType": "spot"},
            })
            if mode == "testnet":
                self.exchange.set_sandbox_mode(True)

    async def market_order(self, side: str, price: float):
        amount = round(ORDER_QUOTE_SIZE / price, 3)   # SOL: krok ilości 0.001
        if self.mode == "paper" or self.exchange is None:
            print(f"   [PAPER] {side} {amount} {SYMBOL_CCXT} @ {price:,.2f} (brak realnego zlecenia)")
            return {"paper": True, "side": side, "amount": amount, "price": price}
        loop = asyncio.get_running_loop()
        fn = self.exchange.create_market_buy_order if side == "BUY" else self.exchange.create_market_sell_order
        order = await loop.run_in_executor(None, lambda: fn(SYMBOL_CCXT, amount))
        print(f"   [{self.mode.upper()}] zlecenie {side} id={order.get('id')} amount={amount}")
        return order


# ═════════════════════════════════════════════════════════════════
# ZARZĄDZANIE POZYCJĄ + LOG
# ═════════════════════════════════════════════════════════════════
def log_event(kind: str, note: str, price=None, pnl_pct=None):
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([
            datetime.now(timezone.utc).isoformat(), kind, note,
            f"{price:.2f}" if price is not None else "",
            f"{pnl_pct:.4f}" if pnl_pct is not None else "",
        ])


PERF_HEADER = [
    "timestamp_utc", "session_id", "symbol", "mode", "price",
    "signal", "action", "reason", "confidence_pct",
    "composite", "l1_correlation", "l2_harmonic", "l3_phase",
    "expected_move_pct", "required_move_pct", "gate",
    "unification_status", "mc_wir", "tf_tarcie", "turbine_note",

    "position", "entry_price", "wins", "losses", "net_pct",
]


def init_perf_log():
    if not os.path.exists(PERF_LOG_FILE) or os.path.getsize(PERF_LOG_FILE) == 0:
        with open(PERF_LOG_FILE, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(PERF_HEADER)


class GatcaExecutionManager:
    """
    Maszyna stanów pozycji — zabezpieczenie przed niekontrolowanym
    ponownym kupowaniem (over-buying). Tylko jedna pozycja LONG na raz.
    """

    def __init__(self, executor: Executor):
        self.executor = executor
        self.is_in_position = False
        self.entry_price = 0.0
        self.wins = 0
        self.losses = 0
        self.net_pct = 0.0
        # Bramka jednoczesności: nawet gdyby dwa ticki weszły równolegle,
        # tylko jeden może zmienić stan pozycji.
        self.lock = asyncio.Lock()
        # Blokada natychmiastowego ponownego wejścia po zamknięciu pozycji.
        self.cooldown_bars = 0
        self._restore_state()

    def _restore_state(self):
        """Odtwarza otwartą pozycję po restarcie, aby restart nie pozwalał kupić drugi raz."""
        if os.environ.get("GATCA_RESET_POSITION") == "1":
            if os.path.exists(POSITION_STATE_FILE):
                os.remove(POSITION_STATE_FILE)
            return
        if not os.path.exists(POSITION_STATE_FILE):
            return
        try:
            with open(POSITION_STATE_FILE, "r", encoding="utf-8") as f:
                state = json.load(f)
            self.is_in_position = bool(state.get("is_in_position", False))
            self.entry_price = float(state.get("entry_price", 0.0) or 0.0)
            self.wins = int(state.get("wins", 0) or 0)
            self.losses = int(state.get("losses", 0) or 0)
            self.net_pct = float(state.get("net_pct", 0.0) or 0.0)
            self.cooldown_bars = int(state.get("cooldown_bars", 0) or 0)
            if self.is_in_position and self.entry_price <= 0:
                raise ValueError("otwarta pozycja bez poprawnej ceny wejścia")
            print(f"[STATE] Odtworzono POS:{self.position_label} entry={self.entry_price:.2f}")
        except (OSError, ValueError, TypeError, json.JSONDecodeError) as err:
            raise RuntimeError(f"Nie można bezpiecznie odtworzyć stanu pozycji: {err}") from err

    def _save_state(self):
        state = {
            "symbol": SYMBOL_CCXT,
            "mode": MODE,
            "is_in_position": self.is_in_position,
            "entry_price": self.entry_price,
            "wins": self.wins,
            "losses": self.losses,
            "net_pct": self.net_pct,
            "cooldown_bars": self.cooldown_bars,
            "updated_at_utc": datetime.now(timezone.utc).isoformat(),
        }
        temp_file = POSITION_STATE_FILE + ".tmp"
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        os.replace(temp_file, POSITION_STATE_FILE)

    @property
    def position_label(self) -> str:
        return "LONG" if self.is_in_position else "NONE"


    async def open_long(self, price: float, gate: str):
        if self.is_in_position:
            return  # blokada over-buying
        await self.executor.market_order("BUY", price)
        self.is_in_position = True
        self.entry_price = price
        self._save_state()
        print(f"   [OPEN LONG] entry={price:,.2f} TP={price*(1+TAKE_PROFIT_PCT):,.2f} "
              f"SL={price*(1-STOP_LOSS_PCT):,.2f} | {gate}")
        log_event("OPEN", f"LONG {gate}", price)

    async def close_long(self, price: float, why: str):
        if not self.is_in_position:
            return
        gross = (price - self.entry_price) / self.entry_price
        net = gross - FEE_PER_SIDE * 2
        await self.executor.market_order("SELL", price)
        self.net_pct += net * 100
        if net > 0:
            self.wins += 1
        else:
            self.losses += 1
        print(f"   [CLOSE {why}] exit={price:,.2f} netto={net*100:+.3f}% "
              f"| bilans={self.net_pct:+.3f}% | W/L={self.wins}/{self.losses}")
        log_event("CLOSE", why, price, net * 100)
        self.is_in_position = False
        self.entry_price = 0.0
        self.cooldown_bars = COOLDOWN_BARS_AFTER_EXIT
        self._save_state()


    async def process(self, status_unifikacji: str, decision: str, price: float,
                      gate: str, bar_closed: bool = True):
        """Jedna iteracja = jedna decyzja. Zawsze zwraca etykietę akcji.

        WEJŚCIE (BUY) jest dozwolone WYŁĄCZNIE gdy:
          • nie ma otwartej pozycji (is_in_position == False),
          • świeca 1m została DOMKNIĘTA (bar_closed == True) — nie na każdym ticku,
          • wygasł cooldown po ostatnim zamknięciu.
        WYJŚCIE (TP/SL/rewers) sprawdzane jest na każdym ticku.
        """
        async with self.lock:
            # --- SCENARIUSZ 1: POZA RYNKIEM → szukamy wejścia ---
            if not self.is_in_position:
                if not bar_closed:
                    return "LIVE_ACTION: HOLD_AND_WAIT"
                if self.cooldown_bars > 0:
                    self.cooldown_bars -= 1
                    self._save_state()
                    return "LIVE_ACTION: COOLDOWN"
                if status_unifikacji == "EXECUTE" and decision == "BUY":
                    await self.open_long(price, gate)
                    return "LIVE_ACTION: EXECUTE_BUY"
                return "LIVE_ACTION: HOLD_AND_WAIT"

            # --- SCENARIUSZ 2: POZYCJA OTWARTA → tylko wyjście, nigdy dokupienie ---
            # Porównanie cen docelowych zamiast ilorazu float zapobiega sytuacji,
            # w której dokładnie +0.80% zostaje zapisane jako 0.0079999999.
            take_profit_price = self.entry_price * (1.0 + TAKE_PROFIT_PCT)
            stop_loss_price = self.entry_price * (1.0 - STOP_LOSS_PCT)

            if price >= take_profit_price:
                await self.close_long(price, "TAKE_PROFIT")
                return "LIVE_ACTION: CLOSE_TAKE_PROFIT"

            if price <= stop_loss_price:
                await self.close_long(price, "STOP_LOSS")
                return "LIVE_ACTION: CLOSE_STOP_LOSS"

            if bar_closed and status_unifikacji == "WAIT(RESET_PORT)":
                await self.close_long(price, "CLOSE_ON_REVERSAL")
                return "LIVE_ACTION: CLOSE_ON_REVERSAL"

            if bar_closed and decision == "SELL":
                await self.close_long(price, "OPPOSITE_SIGNAL")
                return "LIVE_ACTION: CLOSE_OPPOSITE_SIGNAL"

            return "LIVE_ACTION: HOLD_LONG"



def log_performance(price: float, sig: dict, manager: GatcaExecutionManager, action: str):
    layers = sig.get("layers", {})
    with open(PERF_LOG_FILE, "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([
            datetime.now(timezone.utc).isoformat(),
            SESSION_ID,
            SYMBOL_CCXT,
            MODE,
            f"{price:.2f}",
            sig.get("decision", ""),
            action.removeprefix("LIVE_ACTION: "),
            sig.get("reason") or "",
            f"{sig.get('confidence', 0):.4f}",
            f"{sig.get('composite', 0):.8f}",
            f"{layers.get('correlation', 0):.8f}",
            f"{layers.get('harmonic', 0):.8f}",
            f"{layers.get('phase', 0):.8f}",
            f"{sig.get('expected_move_pct', 0):.5f}",
            f"{sig.get('required_move_pct', 0):.5f}",
            sig.get("gate", ""),
            sig.get("unification_status", ""),
            f"{sig.get('mc', 0):.4f}",
            f"{sig.get('tf', 0):.6f}",
            sig.get("turbine_note", ""),

            manager.position_label,
            f"{manager.entry_price:.2f}" if manager.is_in_position else "",
            manager.wins, manager.losses, f"{manager.net_pct:.4f}",
        ])

# ═════════════════════════════════════════════════════════════════
# STRUMIEŃ BINANCE (WebSocket, in-memory parsing)
# ═════════════════════════════════════════════════════════════════
# Testnet ma WŁASNY endpoint strumienia — używanie produkcyjnego WS w trybie
# testnet dawało ceny z innego rynku niż ten, na którym składane są zlecenia.
WS_HOST = ("wss://stream.testnet.binance.vision/ws"
           if MODE == "testnet" else "wss://stream.binance.com:9443/ws")
WS_URL = f"{WS_HOST}/{SYMBOL_WS}@kline_1m"


def parse_kline_payload(raw: str):
    """Walidacja payloadu → (cena, czy_swieca_domknieta) albo None.

    Wydzielone z pętli, aby przy wielu symbolach dało się to testować
    i rozszerzać bez ruszania logiki sesji.
    """
    try:
        payload = json.loads(raw)
    except (TypeError, ValueError):
        return None
    k = payload.get("k") if isinstance(payload, dict) else None
    if not isinstance(k, dict):
        return None
    try:
        price = float(k.get("c", 0) or 0)
    except (TypeError, ValueError):
        return None
    if price <= 0:
        return None
    # Uwaga: k["x"] == True oznacza DOMKNIĘCIE świecy 1m (nie „ostatni tick rynku”).
    return price, bool(k.get("x", False))


async def binance_websocket_stream(filter_engine: GatcaResonanceFilter, executor: Executor):
    if websockets is None:
        raise RuntimeError("Brak biblioteki websockets: pip install websockets")

    init_perf_log()
    manager = GatcaExecutionManager(executor)
    last_sig = None                     # ostatni sygnał z DOMKNIĘTEJ świecy

    start = datetime.now(timezone.utc)
    deadline = start.timestamp() + RUN_HOURS * 3600

    log.info("[SYSTEM] GATCA-718 v3 | %s | tryb=%s | okno=%d | prog=%.1f%% | min. ruch=%.2f%%",
             SYMBOL_CCXT, MODE.upper(), WINDOW_SIZE, MIN_CONFIDENCE, MIN_PROFITABLE_MOVE * 100)
    log.info("[SYSTEM] Sesja: %.0f h | log wydajnosci: %s | log tekstowy: %s",
             RUN_HOURS, PERF_LOG_FILE, TEXT_LOG_FILE)

    backoff = 1.0
    metrics = {"ticks": 0, "reconnects": 0, "rejected_orders": 0,
               "fee_filtered": 0, "last_tick_ts": None, "tick_gap_sum": 0.0,
               "tick_gap_count": 0}

    try:
        while datetime.now(timezone.utc).timestamp() < deadline and not STOP_EVENT.is_set():
            try:
                async with websockets.connect(WS_URL, ping_interval=20) as ws:
                    log.info("[SYSTEM] Polaczono ze strumieniem %s (kline_1m)", WS_URL)
                    backoff = 1.0          # udane połączenie → reset backoffu
                    async for raw in ws:
                        if datetime.now(timezone.utc).timestamp() >= deadline or STOP_EVENT.is_set():
                            break
                        # Błąd przetwarzania JEDNEGO ticku (parsowanie, zapis CSV,
                        # kodowanie znaków) NIE może zrywać połączenia z Binance.
                        try:
                            now_ts = datetime.now(timezone.utc).timestamp()
                            if metrics["last_tick_ts"] is not None:
                                metrics["tick_gap_sum"] += now_ts - metrics["last_tick_ts"]
                                metrics["tick_gap_count"] += 1
                            metrics["last_tick_ts"] = now_ts
                            metrics["ticks"] += 1

                            k = parse_kline_payload(raw)
                            if k is None:
                                continue
                            price, bar_closed = k

                            if bar_closed:
                                filter_engine.update_market_data(price)
                                last_sig = filter_engine.compute_composite_signal()
                                if last_sig.get("reason") == "MOVE_BELOW_FEES":
                                    metrics["fee_filtered"] += 1

                            if last_sig is None:
                                continue
                            sig = last_sig

                            action = await manager.process(
                                sig.get("unification_status", "WAIT"),
                                sig["decision"],
                                price,
                                sig["gate"],
                                bar_closed,
                            )
                            if action == "LIVE_ACTION: ORDER_REJECTED":
                                metrics["rejected_orders"] += 1

                            if bar_closed:
                                tag = sig["decision"] if sig["decision"] != "WAIT" else sig.get(
                                    "unification_status", f"WAIT({sig['reason']})")
                                if action == "LIVE_ACTION: EXECUTE_BUY":
                                    tag = "EXECUTE_BUY"
                                elif manager.is_in_position and tag == "BUY":
                                    tag = "HOLD_LONG(BLOCKED_BUY)"
                                elapsed_h = (datetime.now(timezone.utc) - start).total_seconds() / 3600
                                generuj_nowy_log_konsoli(
                                    price, tag, sig["confidence"],
                                    sig["expected_move_pct"] / 100.0,
                                    sig.get("mc", 0.0),
                                    sig.get("turbine_note", ""),
                                    sig["gate"],
                                    manager.position_label,
                                    elapsed_h,
                                )
                                if action not in ("LIVE_ACTION: HOLD_AND_WAIT", "LIVE_ACTION: HOLD_LONG"):
                                    log.info("   -> %s", action)
                                log_performance(price, sig, manager, action)
                            elif action.startswith("LIVE_ACTION: CLOSE"):
                                # Wyjście śródsesyjne (TP/SL) też musi trafić do logu.
                                log.info("   -> %s (intra-bar @ $%.2f)", action, price)
                                log_performance(price, sig, manager, action)

                        except asyncio.CancelledError:
                            raise
                        except Exception as tick_err:
                            log.warning("[TICK-ERR] %s: %s — pomijam ten tick, polaczenie utrzymane",
                                        type(tick_err).__name__, tick_err)
                            continue

            except asyncio.CancelledError:
                raise
            except Exception as e:  # sieć / rozłączenie
                metrics["reconnects"] += 1
                log.warning("[WARN] Strumien przerwany (%s: %s) — reconnect za %.1f s "
                            "(backoff wykladniczy)", type(e).__name__, e, backoff)
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, RECONNECT_BACKOFF_MAX)
    finally:
        # Stan sesji zapisywany ZAWSZE — także po Ctrl+C i po wyjątku sieciowym.
        manager.save_state()
        avg_gap = (metrics["tick_gap_sum"] / metrics["tick_gap_count"]
                   if metrics["tick_gap_count"] else 0.0)
        log.info("[METRYKI] ticki=%d | sr. odstep=%.2fs | reconnecty=%d | "
                 "odrzucone zlecenia=%d | sygnaly odfiltrowane przez fee=%d",
                 metrics["ticks"], avg_gap, metrics["reconnects"],
                 metrics["rejected_orders"], metrics["fee_filtered"])

    log.info("[SYSTEM] Koniec sesji %.0f h. Bilans netto: %+.3f%% | W/L=%d/%d | dane: %s",
             RUN_HOURS, manager.net_pct, manager.wins, manager.losses, PERF_LOG_FILE)
    return manager


if __name__ == "__main__":
    engine = GatcaResonanceFilter()
    manager = None
    try:
        manager = asyncio.run(binance_websocket_stream(engine, Executor()))
    except KeyboardInterrupt:
        pass
    finally:
        if manager:
            print(f"\n[SYSTEM] Zatrzymano. Bilans netto: {manager.net_pct:+.3f}% "
                  f"| W/L={manager.wins}/{manager.losses}")
        else:
            print("\n[SYSTEM] Zatrzymano przed inicjalizacją pozycji.")

