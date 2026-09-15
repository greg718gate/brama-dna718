# Roadmap — Brama DNA 718

## Zrobione
- [x] Tryby audio (statyczny / dynamiczny jitter) w panelu SENTINEL-718
- [x] Podstrona /privacy — regulamin i polityka danych biometrycznych (PL/EN)
- [x] Wymagana zgoda na regulamin w rejestracji konta (panel PRO + /auth)
- [x] Tabela profili z tokenem licencyjnym i statusem subskrypcji (domyślnie test_phase)
- [x] Widget "Twój Klucz Autoryzacji Silnika (Token)" w sekcji pobierania
- [x] Endpoint autoryzacji licencji + zapis raportów sesji z aplikacji lokalnej
- [x] Weryfikacja 384 px bez poziomego przewijania
- [x] Klucz AES usunięty z launcherów — wydawany do pamięci po weryfikacji tokenu
- [x] Wykres historii postępów koherencji na bazie zapisanych sesji
- [x] Uproszczony widok mobilny: puls, stan synchronizacji, licznik rytuału 108 s
- [x] Automatyczny zapis sesji po 108 s + odświeżenie wykresu historii
- [x] Sekcja "Status Certyfikacji i Sygnatur Cyfrowych" w panelu pobierania
- [x] Runbook podpisywania aplikacji (Zeta-Core/docs/CODE_SIGNING.md)
- [x] Logowanie/rejestracja na górze strony + status zalogowanego operatora
- [x] Automatyczna pętla czterech trybów po 108 s z zapisem wyników cząstkowych
- [x] Końcowa wskazówka na podstawie średniej koherencji całego badania
- [x] Wykres i statystyki historii wyłącznie z rzeczywistych sesji i trybów oddechu

## Otwarte
- [ ] Test sesji z prawdziwym pasem Polar H10 (wymaga sprzętu użytkownika)
- [ ] Wykupienie certyfikatów: Windows Authenticode (OV/EV) i Apple Developer ID
- [ ] Samodzielne aplikacje .exe / .app z podpisem i notaryzacją
- [ ] Testy płatności przed włączeniem sprzedaży (PRO_SALES_ENABLED = false)

## Po zakończeniu fazy BETA — jeden cykl produkcyjny

### 1. Lejek PRO na górze strony
- [ ] Obok logowania/statusu operatora dodać wyraźny przycisk „✦ AKTYWUJ DOSTĘP PRO ✦” / „WYBIERZ PAKIET PREMIUM”.
- [ ] Zastosować delikatnie pulsującą neonową ramkę w kolorze fioletowym `#cc33ff`.
- [ ] Zachować ciemny styl premium, pełne PL/EN i dopasowanie do szerokości 384 px.

### 2. Matryca cenowa i Stripe
- [ ] Zastąpić pojedynczą ofertę czterema kartami subskrypcji:
  - 1 miesiąc: £19/miesiąc — pełny dostęp PRO, elastyczna subskrypcja.
  - 3 miesiące: £48/kwartał — 15% oszczędności, £16/miesiąc.
  - 6 miesięcy: £84/pół roku — 25% oszczędności, £14/miesiąc.
  - 1 rok: £114/rok — najlepsza wartość, 50% oszczędności, £9.50/miesiąc, płatność z góry.
- [ ] Utworzyć stałe produkty/ceny Stripe i powiązać każdą kartę z właściwym procesem płatności.
- [ ] Zachować pole kodu promocyjnego `LAUNCH718`, dającego 50% zniżki pierwszym operatorom.
- [ ] Przed uruchomieniem sprzedaży przetestować zakup, anulowanie, powrót do aplikacji i rozpoznawanie aktywnego pakietu.

### 3. Potwierdzanie adresu e-mail
- [ ] Włączyć obowiązkowe potwierdzanie adresu e-mail dla nowych kont.
- [ ] Po rejestracji nie traktować użytkownika jako zalogowanego do czasu potwierdzenia linku.
- [ ] Wyświetlać komunikat: „✦ Weryfikacja Matrycy ✦ Na Twój adres e-mail wysłaliśmy link aktywacyjny. Potwierdź go, aby wygenerować unikalny Token Autoryzacji Silnika.”
- [ ] Zweryfikować generowanie i udostępnienie tokenu dopiero po potwierdzeniu adresu.

### 4. Adaptacja i uśrednianie w czterech trybach
- [ ] Przy każdym automatycznym przejściu 0.11 → 0.10 → 0.085 → 0.075 Hz resetować `current_phase_error` do wartości początkowej.
- [ ] Po zmianie trybu uruchamiać dokładnie 30 sekund adaptacji bez naliczania próbek do średniej koherencji i historii.
- [ ] Po adaptacji zbierać dane przez właściwe okno pomiarowe, zachowując poprawny reset bufora i ciągłość pętli.
- [ ] Oznaczyć fazę adaptacji czytelnym komunikatem PL/EN i nie zapisywać jej jako sesji pomiarowej.

### Raport zamknięcia produkcyjnego
- [ ] Po wykonaniu powyższego cyklu wygenerować raport: wdrożone elementy, wyniki testów, pozostałe blokery zewnętrzne i gotowość systemu do uruchomienia.

