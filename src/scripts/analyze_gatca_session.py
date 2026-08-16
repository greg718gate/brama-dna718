"""Dokładne podsumowanie jednej sesji GATCA v3.

Liczy wykonania wyłącznie z kolumny ``action``. Kolumna ``signal`` opisuje
propozycję filtra i nigdy nie jest traktowana jako faktyczny zakup/sprzedaż.
"""

import csv
import glob
import os
import sys


def newest_session_file():
    files = glob.glob("gatca_performance_*.csv")
    if not files:
        raise FileNotFoundError("Brak pliku gatca_performance_*.csv w tym folderze")
    return max(files, key=os.path.getmtime)


def analyze(path):
    rows = signals_buy = signals_sell = signals_wait = 0
    opened = closed = tp = sl = reversal = holds = 0
    first_session = first_symbol = None

    with open(path, "r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        required = {"session_id", "symbol", "signal", "action"}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(
                "To jest stary log bez wiarygodnych zdarzeń transakcyjnych "
                f"(brakuje: {', '.join(sorted(missing))}). Uruchom poprawiony skrypt."
            )
        for row in reader:
            rows += 1
            first_session = first_session or row["session_id"]
            first_symbol = first_symbol or row["symbol"]
            signal = row["signal"].strip().upper()
            action = row["action"].strip().upper()
            signals_buy += signal == "BUY"
            signals_sell += signal == "SELL"
            signals_wait += signal == "WAIT"
            opened += action == "EXECUTE_BUY"
            is_close = action.startswith("CLOSE_")
            closed += is_close
            tp += action == "CLOSE_TAKE_PROFIT"
            sl += action == "CLOSE_STOP_LOSS"
            reversal += action in {"CLOSE_ON_REVERSAL", "CLOSE_OPPOSITE_SIGNAL"}
            holds += action == "HOLD_LONG"

    print("\nGATCA V3 — PODSUMOWANIE JEDNEJ SESJI")
    print(f"Plik: {path}")
    print(f"Sesja: {first_session or '-'} | Rynek: {first_symbol or '-'}")
    print(f"Wiersze diagnostyczne: {rows}")
    print(f"Sygnały filtra: BUY={signals_buy}, SELL={signals_sell}, WAIT={signals_wait}")
    print(f"Faktyczne otwarcia BUY: {opened}")
    print(f"Faktyczne zamknięcia SELL: {closed} (TP={tp}, SL={sl}, rewers={reversal})")
    print(f"Zablokowane ponowne BUY / HOLD_LONG: {holds}")
    print(f"Pozycje nadal otwarte na końcu: {max(0, opened - closed)}")


if __name__ == "__main__":
    analyze(sys.argv[1] if len(sys.argv) > 1 else newest_session_file())