# Domknięcie platformy SENTINEL-718

## Zakres
- Przenieść wejście do logowania i rejestracji na górę strony głównej. Po zalogowaniu pokazać zielony status operatora z adresem e-mail i usunąć dolny element logowania.
- Przebudować skaner na automatyczną sekwencję czterech trybów oddechu. Każdy tryb trwa 108 sekund, zapisuje własny wynik, czyści bufor impulsów i przełącza następny tryb.
- Wyświetlić ekran końcowy dopiero po ukończeniu wszystkich czterech trybów. Raport pokaże średnią koherencję oraz właściwą wskazówkę dla wyniku poniżej 50% albo co najmniej 94%.
- Poprawić historię tak, aby wykres i podsumowanie liczyły wyłącznie rekordy zapisane w bazie, z widocznym trybem oddechowym i bez danych demonstracyjnych.
- Sprawdzić całą ścieżkę na ekranie 384 px, w tym brak przewijania poziomego, poprawne przejścia trybów i brak błędów.

## Szczegóły techniczne
- Wykorzystać istniejącą tabelę sesji i jej zabezpieczenia dostępu zamiast tworzyć równoległą tabelę.
- Zapisywać osobny rekord dla każdego ukończonego trybu oraz odświeżać historię po każdym poprawnym zapisie.
- Zablokować ręczną zmianę trybu podczas aktywnego pełnego badania, aby kolejność i wyniki pozostały spójne.
- Nie wprowadzać testowych punktów ani domyślnych wartości 100%.