# Refaktoryzacja SENTINEL-718 do otwartej fazy testowej

## Cel
Platforma będzie działać bez instalatorów i binarnych wersji desktopowych. Obliczenia pozostaną lokalne w przeglądarce, a interfejs i dokumentacja jednoznacznie opiszą status `test_phase`, otwarty kod oraz niemedyczny charakter modelu.

## Zakres zmian

### 1. Usunięcie dystrybucji desktopowej
- Usunąć z panelu SENTINEL sekcję pobierania Windows / macOS / Linux, procedurę certyfikacji, sumę pliku binarnego i obsługę launcherów.
- Usunąć publiczne launchery oraz zaszyfrowany plik silnika z katalogu pobierania.
- Usunąć skompilowane artefakty natywne Zeta-Core z repozytorium oraz opisy sprzedaży/licencjonowania plików `.exe`, `.app` i `.so`.
- Pozostawić eksporty raportów i WAV, ponieważ są wynikami użytkownika, a nie wykonywalnymi instalatorami.

### 2. Lokalny rdzeń obliczeniowy Web Worker
- Utworzyć typowany protokół żądań i odpowiedzi oraz dedykowany Worker ładowany przez Vite.
- Przenieść do Workera trzy ciężkie operacje:
  - budowę i ewolucję czasową macierzy Hamiltona 18×18,
  - obliczenia funkcji falowej Ψ z przybliżeniem ζ na linii krytycznej,
  - numeryczne całkowanie Wektora Intencji VI i generowanie próbek wykresu.
- Podłączyć kalkulator VI i interaktywne wywołania matematyczne do Workera; UI dostanie stan obliczania oraz bezpieczne anulowanie odpowiedzi po odmontowaniu.
- Przenieść analizę widmową RR używaną przez skaner do tego samego lokalnego modelu pracy poza głównym wątkiem.
- Zachować dokładnie istniejące stałe i wzory: 718.57012515426885574359120304128340312332181477461 Hz, 7.83 Hz, 18.6 Hz, φ oraz współrzędne rCRS.

### 3. Transparentność Open Source
- W widocznym panelu dodać informację, że kod obliczeniowy jest otwarty i możliwy do sprawdzenia przed uruchomieniem pomiaru.
- Kierować do publicznego repozytorium `https://github.com/greg718gate/brama-dna718`.
- Usunąć z dokumentacji sformułowania o zamkniętych testach, NDA, kodzie własnościowym i binarnych sekretach; opisać model jako audytowalny kod przeglądarkowy.

### 4. Terminologia i disclaimer fazy testowej
- Dodać nad panelem pomiarowym widoczny, dwujęzyczny status: `test_phase / faza testowa — dostęp otwarty, bez opłat`.
- Dodać wymagany disclaimer SENTINEL-718/SCIENCE.GOD w pełnym brzmieniu PL oraz równoważnej wersji EN.
- Oznaczyć „Bramy DNA”, „Geometrię fotonową”, „Soczewki” i „Rytuał” jako interaktywny model matematyczno-lingwistyczny i artystyczną metaforę wizualną, bez zastosowania diagnostycznego lub kardiologicznego.
- Skorygować komunikaty skanera sugerujące ocenę układu nerwowego lub efekt biologiczny, nie zmieniając progów i matematyki.

### 5. Porządkowanie dokumentacji i roadmapy
- Zaktualizować dokumentację Zeta-Core, FAQ oraz instrukcję integracji tak, aby nie promowały natywnych binariów ani zamkniętego modelu dystrybucji.
- Usunąć z roadmapy zadania dotyczące `.exe/.app`, Authenticode i Apple Developer ID; odnotować zakończenie migracji do przeglądarki i Workera.

## Weryfikacja
- Uruchomić testy matematyczne i dodać test porównujący wyniki Workera/rdzenia z dotychczasowymi wartościami referencyjnymi, w tym VI Gate 18 = 1.1628.
- Sprawdzić kontrolę typów i brak odwołań do usuniętych plików lub przycisków pobierania.
- Sprawdzić w przeglądarce widok desktopowy i mobilny: status testowy, disclaimer, link Open Source, uruchomienie skanera i obliczenia VI bez błędów konsoli.

## Uwagi techniczne
- Worker będzie modułem TypeScript tworzonym przez `new Worker(new URL(..., import.meta.url), { type: "module" })`; dane wejściowe i wyniki będą kopiowane jako zwykłe struktury.
- Rdzeń pozostaje w 100% po stronie użytkownika. Zapis ukończonej sesji do profilu pozostaje bez zmian i nadal wymaga świadomego uruchomienia oraz zalogowania.
- JavaScript zachowuje precyzję IEEE-754; pełny zapis stałej 718.570125… pozostaje w źródle jako wartość kanoniczna. Refaktoryzacja nie będzie przedstawiana jako zwiększenie precyzji numerycznej względem obecnej implementacji.
