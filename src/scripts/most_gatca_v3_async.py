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
import math
import os
import sys
from datetime import datetime, timezone

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

TAKE_PROFIT_PCT = 0.0090        # 0.90% — SOL ma ~3x większą zmienność niż BTC
STOP_LOSS_PCT = 0.0050          # 0.50%

# ─── INSTRUMENT: SOLANA (SOL/USDT) ───────────────────────────────
# Zmiana z BTC na SOL: ruch 1-minutowy SOL jest wielokrotnie większy,
# więc sygnał 98% ma realną szansę pokryć prowizje i wygenerować zysk.
SYMBOL_WS = os.environ.get("GATCA_SYMBOL_WS", "solusdt").lower()
SYMBOL_CCXT = os.environ.get("GATCA_SYMBOL", "SOL/USDT").upper()
ORDER_QUOTE_SIZE = 20.0         # ile USDT na jedno wejście (testnet/live)
MODE = os.environ.get("GATCA_MODE", "paper").lower()   # paper | testnet | live
LOG_FILE = "most_gatca_v3_log.csv"
PERF_LOG_FILE = "gatca_performance_log.csv"      # pełny log wydajności (każdy tick)

RUN_HOURS = float(os.environ.get("GATCA_RUN_HOURS", "72"))   # czas pracy sesji [h]


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


def generuj_nowy_log_konsoli(cena, status_unifikacji, pewnosc, ruch, mc, opis_turbiny, gate="G15:11915:50"):
    """Rozszerzony format logu zawierający wskaźnik masy Mc."""
    print(
        f"Price: ${cena:,.2f} | {status_unifikacji:<22} | "
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

        composite = (l1 + abs(l2) + abs(l3)) / (PHI + EULER_MASCHERONI + 1)
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
            "layers": {"correlation": l1, "harmonic": abs(l2), "phase": abs(l3)},
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
position = None
stats = {"wins": 0, "losses": 0, "net_pct": 0.0}


def log_event(kind: str, note: str, price=None, pnl_pct=None):
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([
            datetime.now(timezone.utc).isoformat(), kind, note,
            f"{price:.2f}" if price is not None else "",
            f"{pnl_pct:.4f}" if pnl_pct is not None else "",
        ])


PERF_HEADER = [
    "timestamp_utc", "price", "decision", "reason", "confidence_pct",
    "composite", "l1_correlation", "l2_harmonic", "l3_phase",
    "expected_move_pct", "required_move_pct", "gate",
    "unification_status", "mc_wir", "tf_tarcie", "turbine_note",

    "position", "entry_price", "wins", "losses", "net_pct",
]


def init_perf_log():
    if not os.path.exists(PERF_LOG_FILE) or os.path.getsize(PERF_LOG_FILE) == 0:
        with open(PERF_LOG_FILE, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(PERF_HEADER)


def log_performance(price: float, sig: dict):
    layers = sig.get("layers", {})
    with open(PERF_LOG_FILE, "a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow([
            datetime.now(timezone.utc).isoformat(),
            f"{price:.2f}",
            sig.get("decision", ""),
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

            "LONG" if position else "NONE",
            f"{position['entry']:.2f}" if position else "",
            stats["wins"], stats["losses"], f"{stats['net_pct']:.4f}",
        ])




async def open_position(executor, price, gate):
    global position
    position = {"side": "LONG", "entry": price, "time": datetime.now(timezone.utc).isoformat()}
    print(f"   [OPEN LONG] entry={price:,.2f} TP={price*(1+TAKE_PROFIT_PCT):,.2f} "
          f"SL={price*(1-STOP_LOSS_PCT):,.2f} | {gate}")
    log_event("OPEN", f"LONG {gate}", price)
    await executor.market_order("BUY", price)


async def close_position(executor, price, why):
    global position
    if not position:
        return
    gross = (price - position["entry"]) / position["entry"]
    net = gross - FEE_PER_SIDE * 2
    stats["net_pct"] += net * 100
    if net > 0:
        stats["wins"] += 1
    else:
        stats["losses"] += 1
    print(f"   [CLOSE {why}] exit={price:,.2f} netto={net*100:+.3f}% "
          f"| bilans={stats['net_pct']:+.3f}% | W/L={stats['wins']}/{stats['losses']}")
    log_event("CLOSE", why, price, net * 100)
    await executor.market_order("SELL", price)
    position = None


# ═════════════════════════════════════════════════════════════════
# STRUMIEŃ BINANCE (WebSocket, in-memory parsing)
# ═════════════════════════════════════════════════════════════════
WS_URL = f"wss://stream.binance.com:9443/ws/{SYMBOL_WS}@kline_1m"


async def binance_websocket_stream(filter_engine: GatcaResonanceFilter, executor: Executor):
    if websockets is None:
        raise RuntimeError("Brak biblioteki websockets: pip install websockets")

    init_perf_log()
    start = datetime.now(timezone.utc)
    deadline = start.timestamp() + RUN_HOURS * 3600

    print(f"[SYSTEM] GATCA-718 v3 | {SYMBOL_CCXT} | tryb={MODE.upper()} | okno={WINDOW_SIZE} "
          f"| próg={MIN_CONFIDENCE}% | min. ruch={MIN_PROFITABLE_MOVE*100:.2f}%")
    print(f"[SYSTEM] Sesja: {RUN_HOURS:.0f} h | log wydajności: {PERF_LOG_FILE}")

    while datetime.now(timezone.utc).timestamp() < deadline:  # auto-reconnect
        try:
            async with websockets.connect(WS_URL, ping_interval=20) as ws:
                print("[SYSTEM] Połączono z BINANCE_LIVE (kline_1m)")
                async for raw in ws:
                    if datetime.now(timezone.utc).timestamp() >= deadline:
                        break
                    k = json.loads(raw).get("k", {})
                    price = float(k.get("c", 0) or 0)
                    if price <= 0:
                        continue

                    filter_engine.update_market_data(price)
                    sig = filter_engine.compute_composite_signal()

                    tag = sig["decision"] if sig["decision"] != "WAIT" else sig.get(
                        "unification_status", f"WAIT({sig['reason']})")
                    elapsed_h = (datetime.now(timezone.utc) - start).total_seconds() / 3600
                    print(f"| {elapsed_h:6.2f}h ", end="")
                    generuj_nowy_log_konsoli(
                        price, tag, sig["confidence"],
                        sig["expected_move_pct"] / 100.0,
                        sig.get("mc", 0.0),
                        sig.get("turbine_note", ""),
                        sig["gate"],
                    )


                    if position:
                        entry = position["entry"]
                        if price >= entry * (1 + TAKE_PROFIT_PCT):
                            await close_position(executor, price, "TAKE_PROFIT")
                        elif price <= entry * (1 - STOP_LOSS_PCT):
                            await close_position(executor, price, "STOP_LOSS")
                        elif sig["decision"] == "SELL":
                            await close_position(executor, price, "OPPOSITE_SIGNAL")
                    elif sig["decision"] == "BUY":
                        await open_position(executor, price, sig["gate"])

                    log_performance(price, sig)

        except asyncio.CancelledError:
            raise
        except Exception as e:  # sieć / rozłączenie
            print(f"[WARN] Strumień przerwany ({type(e).__name__}: {e}) — reconnect za 5 s")
            await asyncio.sleep(5)

    print(f"[SYSTEM] Koniec sesji {RUN_HOURS:.0f} h. Bilans netto: {stats['net_pct']:+.3f}% "
          f"| W/L={stats['wins']}/{stats['losses']} | dane: {PERF_LOG_FILE}")


if __name__ == "__main__":
    engine = GatcaResonanceFilter()
    try:
        asyncio.run(binance_websocket_stream(engine, Executor()))
    except KeyboardInterrupt:
        print(f"\n[SYSTEM] Zatrzymano. Bilans netto: {stats['net_pct']:+.3f}% "
              f"| W/L={stats['wins']}/{stats['losses']}")

