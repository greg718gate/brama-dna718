# ═══════════════════════════════════════════════════════════════════
# BACKTEST GATCA-718 — symulacja silnika na danych historycznych
#
# © 2026 Grzegorz | BRAMA-718-UNIFIED
# Licensed under Creative Commons BY-NC 4.0
# ═══════════════════════════════════════════════════════════════════
#
# Co robi:
#   1. Pobiera N dni historycznych świec 1-min BTC/USDT z Binance.
#   2. Iteruje krok po kroku — każda świeca = nowy "tick" ceny.
#   3. Dla każdego ticku wysyła ostatnie 32 ceny do Quantum Filter.
#   4. Symuluje LONG-only z TP/SL i prowizją (te same parametry co bot).
#   5. Na końcu drukuje raport: liczba transakcji, % wygranych, łączny PnL netto.
#
# Użycie:
#   python backtest_gatca.py            # domyślnie 7 dni
#   python backtest_gatca.py 30         # 30 dni
# ═══════════════════════════════════════════════════════════════════

import sys
import time
import requests
import ccxt
from datetime import datetime, timedelta

# --- KONFIGURACJA (musi się zgadzać z most_gatca_v2.py) ---
GATCA_QF_URL    = "https://merbqqbjeauqafflfcja.supabase.co/functions/v1/quantum-filter"
HASLO           = "2912"
TAKE_PROFIT_PCT = 0.0035
STOP_LOSS_PCT   = 0.0020
FEE_PER_SIDE    = 0.001
WINDOW          = 32  # bufor cen wysyłany do silnika

DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 7


def pobierz_historie(dni: int):
    """Pobiera świece 1-min z Binance dla zadanej liczby dni."""
    exchange = ccxt.binance()
    since = exchange.parse8601((datetime.utcnow() - timedelta(days=dni)).isoformat() + "Z")
    wszystkie = []
    print(f"[POBIERANIE] {dni} dni świec 1-min BTC/USDT...")
    while True:
        klines = exchange.fetch_ohlcv("BTC/USDT", timeframe="1m", since=since, limit=1000)
        if not klines:
            break
        wszystkie.extend(klines)
        since = klines[-1][0] + 60_000
        if len(klines) < 1000:
            break
        time.sleep(0.25)  # rate-limit
    closes = [k[4] for k in wszystkie]
    print(f"[POBRANO] {len(closes)} świec ({len(closes)/60/24:.1f} dni)")
    return closes


def zapytaj_silnik(bufor):
    try:
        r = requests.post(
            GATCA_QF_URL,
            json={"data": bufor, "threshold": 0.98},
            headers={"x-qf-key": HASLO, "Content-Type": "application/json"},
            timeout=15,
        )
        if r.status_code != 200:
            return None
        return r.json()
    except Exception:
        return None


def backtest(ceny):
    pozycja = None
    transakcje = []
    print(f"[START] {len(ceny) - WINDOW} kroków symulacji")
    print(f"[PARAMS] TP=+{TAKE_PROFIT_PCT*100:.2f}% SL=-{STOP_LOSS_PCT*100:.2f}% "
          f"prowizja round-trip={2*FEE_PER_SIDE*100:.2f}%\n")

    krok = 0
    for i in range(WINDOW, len(ceny)):
        cena = ceny[i]
        bufor = ceny[i - WINDOW:i]
        krok += 1

        # 1) TP/SL ma priorytet
        if pozycja is not None:
            entry = pozycja["entry"]
            powod = None
            if cena >= entry * (1 + TAKE_PROFIT_PCT):
                powod = "TP"
            elif cena <= entry * (1 - STOP_LOSS_PCT):
                powod = "SL"
            if powod:
                pnl = (cena - entry) / entry - 2 * FEE_PER_SIDE
                transakcje.append({"entry": entry, "exit": cena, "pnl": pnl, "powod": powod})
                pozycja = None
                continue

        # 2) Pytamy silnik tylko co 2 świece (oszczędność requestów; bufor i tak się zmienia)
        if krok % 2 != 0:
            continue

        wynik = zapytaj_silnik(bufor)
        if wynik is None:
            continue

        decision = wynik.get("decision", 0)

        if decision == 1 and pozycja is None:
            pozycja = {"entry": cena, "i": i}
        elif decision == -1 and pozycja is not None:
            entry = pozycja["entry"]
            pnl = (cena - entry) / entry - 2 * FEE_PER_SIDE
            transakcje.append({"entry": entry, "exit": cena, "pnl": pnl, "powod": "REV"})
            pozycja = None

        if krok % 200 == 0:
            zysk = sum(t["pnl"] for t in transakcje) * 100
            print(f"  ... krok {krok}/{len(ceny)-WINDOW} | trans={len(transakcje)} | Σ netto={zysk:+.2f}%")

    return transakcje


def raport(transakcje):
    print("\n" + "=" * 70)
    print(" RAPORT BACKTESTU")
    print("=" * 70)
    if not transakcje:
        print(" Brak transakcji — silnik nie wygenerował żadnego sygnału przekraczającego progi.")
        print(" To DOBRY znak: filtr prowizji działa i blokuje nieopłacalne ruchy.")
        return
    n = len(transakcje)
    wygrane = [t for t in transakcje if t["pnl"] > 0]
    przegrane = [t for t in transakcje if t["pnl"] <= 0]
    suma = sum(t["pnl"] for t in transakcje) * 100
    sredni = (suma / n) if n else 0
    win_rate = 100 * len(wygrane) / n
    powody = {}
    for t in transakcje:
        powody[t["powod"]] = powody.get(t["powod"], 0) + 1

    print(f" Liczba transakcji:    {n}")
    print(f" Wygrane:              {len(wygrane)} ({win_rate:.1f}%)")
    print(f" Przegrane:            {len(przegrane)} ({100-win_rate:.1f}%)")
    print(f" Średni zysk netto:    {sredni:+.4f}% / transakcję")
    print(f" Łączny zysk netto:    {suma:+.3f}%")
    print(f" Powody zamknięcia:    {powody}")
    print("=" * 70)
    if suma > 0:
        print(" ✅ Strategia zyskowna na tym okresie.")
    else:
        print(" ❌ Strategia stratna — wymaga dostrojenia (TP/SL/próg).")
    print("=" * 70)


if __name__ == "__main__":
    ceny = pobierz_historie(DAYS)
    if len(ceny) < WINDOW + 100:
        print("Za mało danych.")
        sys.exit(1)
    trans = backtest(ceny)
    raport(trans)
