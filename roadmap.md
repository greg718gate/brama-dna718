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

## Otwarte
- [ ] Test sesji z prawdziwym pasem Polar H10 (wymaga sprzętu użytkownika)
- [ ] Wykupienie certyfikatów: Windows Authenticode (OV/EV) i Apple Developer ID
- [ ] Samodzielne aplikacje .exe / .app z podpisem i notaryzacją
- [ ] Testy płatności przed włączeniem sprzedaży (PRO_SALES_ENABLED = false)

