# Tryby audio SENTINEL-718 i audyt gotowości

## Zakres interfejsu
- Zachować Manifest, strukturę strony głównej, dostęp testowy bez opłat oraz istniejący panel PRO.
- W panelu, po krokach i specyfikacji technicznej, dodać kartę „✦ Architektura Strumienia Audio vs Kompresja MP3 ✦” z przekazaną informacją o lokalnym, nieskompresowanym generowaniu sygnału.
- Bezpośrednio pod kartą i nad przyciskiem START dodać responsywny wybór „Wybór Trybu Strumienia Audio Ψ” z trybem Statycznym i Dynamicznym, parametrami 718.570125 Hz, jitterem oraz RAW PCM / 44100 Hz.
- Zapewnić pełne teksty polskie i angielskie oraz układ bez poziomego przewijania na ekranie 384 px.

## Silnik audio i synchronizacja
- Utworzyć osobny komponent wyboru trybu oparty na istniejącym systemie przycisków i tokenach kolorów.
- Generować sygnał lokalnie przez Web Audio API w pamięci przeglądarki; nie pobierać ani nie dekodować MP3/AAC.
- Tryb Statyczny utrzyma stałą sinusoidę 718.57012515 Hz bez modulacji fazy.
- Tryb Dynamiczny zastosuje łagodny mikro-jitter zależny od bezwzględnego błędu fazy DPLL według wskazanego wzoru; przy fazie 0.0 rad wskaźnik i modulacja zejdą do 0.000 ms.
- Przekazać aktualny błąd fazy ze skanera Polar H10 do panelu i silnika audio przez kontrolowany stan React.
- Uruchamianie dźwięku pozostanie świadomą akcją użytkownika i otrzyma kontrolę start/stop oraz bezpieczne wyciszenie przy zamknięciu panelu lub zmianie widoku.

## Weryfikacja
- Sprawdzić wybór obu trybów, zmianę wyświetlanego jittera i działanie lokalnego generatora audio.
- Sprawdzić, że skaner nadal uruchamia się w fazie testowej bez płatności, a istniejące pobieranie i zabezpieczenia pozostają bez zmian.
- Zweryfikować panel w języku polskim i angielskim oraz widoki 384 px i desktop bez nakładania lub poziomego przewijania.

## Raport końcowy
- Przygotować pełny raport: funkcje wdrożone od początku w panelu SENTINEL-718, stan skanera przeglądarkowego, telemetrii Polar H10, DPLL, soczewki Ψ, trybów audio, pobieranych launcherów, bezpieczeństwa, kont i płatności.
- Wyraźnie rozdzielić elementy gotowe od ograniczeń i braków wymaganych przed publicznym startem, w tym realne testy sprzętowe, podpisy systemowe aplikacji, dostępność Web Bluetooth oraz pozostawioną blokadę sprzedaży.
