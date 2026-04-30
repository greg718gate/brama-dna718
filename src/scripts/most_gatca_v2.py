# ═══════════════════════════════════════════════════════════════════
# MOST GATCA-718 v2 — BOT Z ZARZĄDZANIEM POZYCJĄ
# Take-Profit / Stop-Loss / Filtr Prowizji
#
# © 2026 Grzegorz | BRAMA-718-UNIFIED
# Licensed under Creative Commons BY-NC 4.0
# ═══════════════════════════════════════════════════════════════════
#
# Logika:
#   1. Co 2s pobiera cenę BTC/USDT z Binance.
#   2. Bufor 32 ostatnich cen wysyła do Quantum Filter.
#   3. Backend zwraca decyzję BUY/SELL/WAIT z filtrem prowizji.
#   4. Jeśli BUY i nie ma otwartej pozycji → otwórz LONG (zapisz cenę wejścia).
#   5. Jeśli pozycja otwarta → monitoruj cenę:
#        - cena ≥ entry × (1 + TP)   → zamknij z zyskiem
#        - cena ≤ entry × (1 - SL)   → zamknij ze stratą
#        - sygnał SELL z silnika      → zamknij (sygnał przeciwny)
#   6. Po zamknięciu liczy realny PnL po prowizji.
#
# UWAGA: To jest tryb PAPER TRADE (symulacja). Nie składa zleceń na Binance.
# Żeby przełączyć na realny handel, zaimplementuj funkcje
# `binance_market_buy()` i `binance_market_sell()` z użyciem `ccxt` i swojego API key.
# ═══════════════════════════════════════════════════════════════════

import ccxt
import requests
import csv
import time
from datetime import datetime

# --- KONFIGURACJA ---
GATCA_QF_URL = "https://merbqqbjeauqafflfcja.supabase.co/functions/v1/quantum-filter"
HASLO = "2912"

# Parametry zarządzania pozycją (po stronie bota)
TAKE_PROFIT_PCT = 0.0035   # 0.35% — musi być > 0.27% (próg backendu) z marginesem
STOP_LOSS_PCT   = 0.0020   # 0.20% — krótki stop, asymetria 1:1.75 ryzyko/zysk
FEE_PER_SIDE    = 0.001    # 0.10% prowizja Binance Spot na każdą stronę

# Bufor cen
exchange = ccxt.binance()
historia_cen = []
MAX_HISTORIA = 32

# Stan pozycji (paper trade)
pozycja = None  # None lub dict: {"side": "LONG", "entry": float, "time": str}
statystyki = {"wygrane": 0, "przegrane": 0, "zysk_netto_pct": 0.0}


def log_event(typ, opis, cena=None, pnl_pct=None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("most_gatca_v2_log.csv", "a", newline="") as f:
        w = csv.writer(f)
        w.writerow([timestamp, typ, opis, cena or "", pnl_pct if pnl_pct is not None else ""])


def otworz_pozycje(cena, gate):
    global pozycja
    pozycja = {"side": "LONG", "entry": cena, "time": datetime.now().isoformat()}
    print(f"[OTWARTO LONG] cena={cena:.2f} | TP={cena*(1+TAKE_PROFIT_PCT):.2f} | SL={cena*(1-STOP_LOSS_PCT):.2f} | {gate}")
    log_event("OPEN_LONG", gate, cena)


def zamknij_pozycje(cena, powod):
    global pozycja, statystyki
    if pozycja is None:
        return
    entry = pozycja["entry"]
    # PnL brutto (long): (exit - entry) / entry
    pnl_brutto = (cena - entry) / entry
    # Koszty: prowizja przy wejściu + prowizja przy wyjściu
    pnl_netto = pnl_brutto - (2 * FEE_PER_SIDE)
    statystyki["zysk_netto_pct"] += pnl_netto * 100
    if pnl_netto > 0:
        statystyki["wygrane"] += 1
        wynik_str = "ZYSK"
    else:
        statystyki["przegrane"] += 1
        wynik_str = "STRATA"
    print(f"[ZAMKNIĘTO {wynik_str}] entry={entry:.2f} exit={cena:.2f} | "
          f"brutto={pnl_brutto*100:+.3f}% netto={pnl_netto*100:+.3f}% | powód={powod}")
    print(f"  ↳ Statystyki: W={statystyki['wygrane']} P={statystyki['przegrane']} "
          f"Σ netto={statystyki['zysk_netto_pct']:+.3f}%")
    log_event(f"CLOSE_{wynik_str}", powod, cena, pnl_netto * 100)
    pozycja = None


def sprawdz_tp_sl(cena_aktualna):
    """Zwraca powód zamknięcia lub None."""
    if pozycja is None:
        return None
    entry = pozycja["entry"]
    if cena_aktualna >= entry * (1 + TAKE_PROFIT_PCT):
        return "TAKE_PROFIT"
    if cena_aktualna <= entry * (1 - STOP_LOSS_PCT):
        return "STOP_LOSS"
    return None


def uruchom_most():
    print("=" * 70)
    print(" MOST GATCA-718 v2 — PAPER TRADE z TP/SL i filtrem prowizji")
    print("=" * 70)
    print(f" TP: +{TAKE_PROFIT_PCT*100:.2f}% | SL: -{STOP_LOSS_PCT*100:.2f}% | "
          f"Prowizja round-trip: {2*FEE_PER_SIDE*100:.2f}%")
    print("=" * 70)

    while True:
        try:
            ticker = exchange.fetch_ticker("BTC/USDT")
            cena = ticker["last"]
            historia_cen.append(cena)
            if len(historia_cen) > MAX_HISTORIA:
                historia_cen.pop(0)

            # 1) Najpierw sprawdź TP/SL — to ma priorytet nad sygnałem
            if pozycja is not None:
                powod = sprawdz_tp_sl(cena)
                if powod:
                    zamknij_pozycje(cena, powod)
                    time.sleep(2)
                    continue

            # 2) Pytamy silnik dopiero gdy mamy pełny bufor
            if len(historia_cen) < MAX_HISTORIA:
                print(f"[BUFOR] {len(historia_cen)}/{MAX_HISTORIA} cena={cena:.2f}")
                time.sleep(2)
                continue

            r = requests.post(
                GATCA_QF_URL,
                json={"data": historia_cen, "price": cena, "threshold": 0.98},
                headers={"x-qf-key": HASLO, "Content-Type": "application/json"},
                timeout=10,
            )
            if r.status_code != 200:
                print(f"[!] HTTP {r.status_code}: {r.text[:200]}")
                time.sleep(5)
                continue

            wynik = r.json()
            decision = wynik.get("decision", 0)
            label = wynik.get("decisionLabel", "WAIT")
            conf = wynik.get("confidence", 0)
            gate = wynik.get("gateSignature", "?")
            prof = wynik.get("profitability", {})
            block = wynik.get("blockReason")

            status_pos = f"POS:LONG@{pozycja['entry']:.2f}" if pozycja else "POS:NONE"
            print(f"[{label}] {conf:.1f}% | move~{prof.get('expectedMovePct',0):.3f}% "
                  f"(req {prof.get('requiredMovePct',0):.2f}%) | {status_pos} | "
                  f"{block or 'OK'} | {gate}")

            # 3) Reakcja na sygnał
            if decision == 1 and pozycja is None:
                otworz_pozycje(cena, gate)
            elif decision == -1 and pozycja is not None:
                zamknij_pozycje(cena, "SIGNAL_REVERSAL")

            time.sleep(2)

        except KeyboardInterrupt:
            print("\n[STOP] Przerwane ręcznie.")
            print(f"Końcowe statystyki: {statystyki}")
            break
        except Exception as e:
            print(f"[!] Wyjątek: {e}")
            time.sleep(5)


if __name__ == "__main__":
    uruchom_most()
