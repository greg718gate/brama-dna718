# Komercyjna aktualizacja SENTINEL-718 w fazie BETA

## Zakres
- Dodać na górze strony przycisk „✦ AKTYWUJ DOSTĘP PRO ✦” z pulsującą fioletową ramką; ma otwierać cennik niezależnie od stanu logowania.
- Przebudować cennik na cztery responsywne karty: £19/miesiąc, £48/kwartał, £84/pół roku i £114/rok; dodać wybór pakietu oraz walidowane pole kodu `LAUNCH718`.
- Zachować sprzedaż wstrzymaną: karty i kod działają jako interfejs BETA, bez uruchamiania płatności.
- Wymusić potwierdzanie adresu e-mail i po każdej rejestracji pokazać komunikat „Weryfikacja Matrycy”; nie wpuszczać nowego konta do aktywnej sesji przed potwierdzeniem.
- W każdym z czterech trybów skanera dodać pierwsze 30 sekund adaptacji: licznik działa, lecz próbki nie trafiają do obliczeń koherencji ani historii; przy zmianie trybu zerować fazę i bufory.

## Weryfikacja
- Sprawdzić przycisk i cennik na szerokości 384 px oraz komputerze, w obu językach.
- Sprawdzić wybór pakietu, kod poprawny i błędny oraz brak możliwości zapłaty w BETA.
- Sprawdzić komunikat po rejestracji i brak natychmiastowego zalogowania.
- Sprawdzić reset fazy, komunikat adaptacji i rozpoczęcie zbierania danych dopiero po 30 sekundach.
