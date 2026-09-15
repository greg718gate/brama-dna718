# SENTINEL-718 — archiwum ustaleń produkcyjnych po BETA

Realizacja ma nastąpić w jednym cyklu deweloperskim dopiero po formalnym zakończeniu fazy testowej. Do tego czasu sprzedaż pozostaje wyłączona (`PRO_SALES_ENABLED = false`), a obecne stabilne funkcje nie powinny być zmieniane.

## Zakres cyklu

1. **Widoczność PRO:** przycisk „✦ AKTYWUJ DOSTĘP PRO ✦” / „WYBIERZ PAKIET PREMIUM” na samej górze, obok logowania lub statusu operatora, z delikatną pulsującą ramką `#cc33ff`.
2. **Cztery pakiety:** £19/miesiąc, £48/kwartał, £84/pół roku i £114/rok; każda oferta jako osobna karta, z podanym przeliczeniem i oszczędnością. Kod `LAUNCH718` ma obniżać cenę o 50% dla pierwszych operatorów.
3. **Weryfikacja e-mail:** obowiązkowe potwierdzenie nowego konta. Po rejestracji komunikat „✦ Weryfikacja Matrycy ✦ Na Twój adres e-mail wysłaliśmy link aktywacyjny. Potwierdź go, aby wygenerować unikalny Token Autoryzacji Silnika.” Token ma być dostępny dopiero po potwierdzeniu adresu.
4. **Adaptacja pomiaru:** po każdym przejściu 0.11 → 0.10 → 0.085 → 0.075 Hz zresetować `current_phase_error`, wyczyścić właściwy bufor i rozpocząć 30 sekund adaptacji. Próbek z adaptacji nie wolno uwzględniać w średniej ani na wykresie historii.

## Kryteria gotowości

- Pełne wersje PL/EN i brak poziomego przewijania przy 384 px.
- Poprawne stałe ceny i procesy Stripe dla wszystkich pakietów.
- Test kodu `LAUNCH718`, zakupu, anulowania i powrotu do aplikacji.
- Rejestracja nie tworzy aktywnej sesji przed potwierdzeniem e-mail.
- Token silnika nie jest wydawany przed potwierdzeniem e-mail.
- Każdy tryb ma 30 sekund nieuwzględnianej adaptacji, a historia zawiera wyłącznie dane pomiarowe.
- Końcowy raport zawiera wdrożone elementy, testy, blokery zewnętrzne i ocenę gotowości produkcyjnej.