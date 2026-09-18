# SENTINEL-718 / SCIENCE.GOD — Open Test Phase

**Status subskrypcji: `test_phase` / faza testowa — dostęp otwarty, bez opłat.**

Publiczne repozytorium: https://github.com/greg718gate/brama-dna718

Platforma działa wyłącznie w bezpiecznej piaskownicy przeglądarki. Nie dystrybuuje instalatorów ani natywnych plików wykonywalnych. Intensywne obliczenia są wykonywane lokalnie przez typowany Web Worker, aby nie blokować głównego wątku interfejsu.

## Rdzeń obliczeniowy

Worker obejmuje:

- całkowanie numeryczne Wektora Intencji VI;
- ewolucję funkcji falowej Ψ z komponentem ζ na linii krytycznej;
- konstrukcję i ewolucję Hamiltonianu 18×18;
- resampling RR, widmo z oknem Hanna i mapowanie fazy DPLL;
- pełną ścieżkę UNIFICATION.

Wzorce integracji znajdują się w:

- `src/lib/browserMathCore.ts` — czyste funkcje obliczeniowe;
- `src/workers/math.worker.ts` — lokalny worker;
- `src/lib/mathWorkerClient.ts` — typowany klient Promise.

## Zachowane stałe

Źródłem prawdy pozostaje `src/lib/gatca718Constants.ts`:

- `718.57012515426885574359120304128340312332181477461 Hz`;
- `7.83 Hz`;
- `18.6 Hz`;
- `φ = (1 + √5) / 2`;
- 18 pozycji mtDNA rCRS;
- referencja Gate 18: `VI = 1.1628`.

JavaScript wykonuje działania jako liczby IEEE-754 (około 17 cyfr znaczących). Pełny zapis dziesiętny stałej pozostaje w kodzie dla identyfikowalności danych wejściowych.

## Znaczenie terminów i ograniczenia

„Bramy DNA”, „Geometria fotonowa”, „Soczewki” i „Rytuał” oznaczają interaktywny model matematyczno-lingwistyczny oraz artystyczną wizualizację naukową. Nie są narzędziami diagnostycznymi, medycznymi ani kardiologicznymi.

> Platforma SENTINEL-718/SCIENCE.GOD działa w otwartej fazie testowej (`test_phase`). Prezentowane dane i wizualizacje są wynikiem matematycznego mapowania sygnału i nie stanowią analizy medycznej ani klinicznej oceny stanu zdrowia.

## Testy

```text
bunx vitest run
```

Pakiet regresyjny kontroluje między innymi `VI = 1.1628`, wymiar macierzy 18×18, skończone wartości Ψ oraz istniejące funkcje referencyjne Zeta-Core.

## Licencja

© 2026 Grzegorz | NovaStream88 Ltd | BRAMA-718-UNIFIED

Licencja projektu: [LICENSE.md](LICENSE.md)
