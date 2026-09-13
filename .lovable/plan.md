# Panel Operacyjny SENTINEL-718 v3.0

## Zakres
- Zachować Manifest, kolejność sekcji i pozostały wygląd strony głównej bez zmian.
- Po kliknięciu „Aktywuj Dostęp PRO” otwierać panel aplikacji zamiast obecnego widoku rejestracji.
- Panel otrzyma nagłówek „Panel Operacyjny SENTINEL-718 v3.0”, trzy wskazane kroki połączenia oraz duży, pulsujący przycisk „URUCHOM SKANER SPEKTRALNY”.
- Dodać pełne tłumaczenie polskie i angielskie zgodne z obecnym przełącznikiem języka.

## Dostęp i płatność
- Przy otwarciu panelu oraz kliknięciu START bezpiecznie sprawdzać stan zalogowania i aktywnej subskrypcji.
- Brak aktywnej subskrypcji otworzy okno £19/miesiąc z istniejącym formularzem konta; zalogowany użytkownik przejdzie do bezpiecznej płatności Stripe.
- Utworzyć stały produkt i miesięczną cenę Stripe; aplikacja nie będzie tworzyć tymczasowych cen przy każdym zakupie.
- Po powrocie z płatności ponownie sprawdzić status. Aktywny abonament zmieni przycisk na „Silnik gotowy do synchronizacji”.
- Sprawdzanie abonamentu będzie wykonywane po stronie chronionej funkcji, na podstawie zalogowanego konta — stan nie będzie przechowywany jako możliwa do podrobienia flaga w przeglądarce.

## Szczegóły techniczne
- Rozbudować obecną integrację Stripe, bez usuwania istniejących darowizn i bez migracji do nowego operatora.
- Dodać funkcję rozpoczęcia miesięcznej subskrypcji oraz funkcję sprawdzania jej aktywności; webhook nie jest potrzebny do tego zakresu.
- Formularz w aplikacji nie będzie zbierał numeru karty. Dane płatnicze obsłuży bezpieczna strona Stripe, po czym użytkownik wróci do panelu.
- Stany panelu: sprawdzanie dostępu, brak konta, brak abonamentu, przekierowanie do płatności, aktywny abonament i błąd ponowienia.

## Weryfikacja
- Sprawdzić otwieranie panelu, trzy kroki, pulsujący START i oba przebiegi: brak subskrypcji oraz aktywna subskrypcja.
- Sprawdzić rejestrację/logowanie, powrót z płatności, komunikaty PL/EN i brak poziomego przewijania na telefonie 384 px.
- Potwierdzić, że dotychczasowa sekcja biometryczna, Manifest i płatności darowizn działają bez zmian.
