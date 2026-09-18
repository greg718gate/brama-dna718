# Roadmap — Brama DNA 718

## Zrealizowane w `test_phase`

- [x] Usunięto przyciski, linki i publiczne artefakty instalatorów oraz natywnych silników.
- [x] Aktywny rdzeń działa wyłącznie lokalnie w piaskownicy przeglądarki.
- [x] Dodano typowany Web Worker dla VI, Ψ/ζ, Hamiltonianu 18×18, unifikacji i analizy RR.
- [x] Podłączono Worker do kalkulatora VI, panelu unifikacji i skanera SENTINEL-718.
- [x] Zachowano stałe 718.5701251542688 Hz, 7.83 Hz, 18.6 Hz i φ.
- [x] Zachowano regresję Gate 18: VI = 1.1628.
- [x] Opublikowano odnośnik do otwartego kodu: https://github.com/greg718gate/brama-dna718.
- [x] Wyeksponowano status `test_phase` — dostęp otwarty, bez opłat.
- [x] Dodano disclaimer o matematycznym mapowaniu i braku zastosowania medycznego.
- [x] Oznaczono terminy semantyczne jako model matematyczno-lingwistyczny i metaforę wizualną.
- [x] Zachowano cztery tryby 0.11 → 0.10 → 0.085 → 0.075 Hz, adaptację i sesje po 108 s.
- [x] Zachowano rzeczywistą historię sesji z Supabase bez danych demonstracyjnych.
- [x] Płatności i aktywacja PRO pozostają wyłączone w fazie testowej.

## Otwarte testy

- [ ] Pełny test sesji z fizycznym pasem Polar H10.
- [ ] Profilowanie Workera na urządzeniach mobilnych o małej mocy.
- [ ] Opcjonalny moduł WebAssembly po potwierdzeniu równoważności numerycznej z kodem TypeScript.
- [ ] Dalsze testy dostępności i kompatybilności Web Bluetooth.

## Zasada dystrybucji

Projekt nie planuje dystrybucji desktopowych instalatorów ani natywnych plików wykonywalnych w fazie `test_phase`. Raporty tekstowe, JSON, CSV, PDF i generowane lokalnie WAV pozostają zwykłymi eksportami danych użytkownika, nie programami wykonywalnymi.
