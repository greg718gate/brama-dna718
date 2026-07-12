import numpy as np
from scipy.signal import hilbert, butter, sosfilt, sosfilt_zi


class ZetaDiagnosticEngine:

    def __init__(self, sample_rate: int):
        self.fs = sample_rate
        # Inicjalizacja stanów filtrów dla stabilnego przetwarzania ciągłego
        self.sos_bandpass = None
        self.zi_bp = None

    def _init_bandpass_filter(self, target_freq: float, bandwidth: float = 20.0):
        """Projektuje wąskopasmowy filtr Butterwortha wokół częstotliwości wału."""
        low = max(0.1, target_freq - (bandwidth / 2.0))
        high = min(self.fs / 2.0 - 0.1, target_freq + (bandwidth / 2.0))
        # 4. rząd dla ostrego odcięcia szumów tła przemysłowego
        self.sos_bandpass = butter(4, [low, high], btype='bandpass', fs=self.fs, output='sos')
        self.zi_bp = sosfilt_zi(self.sos_bandpass)

    def calculate_topological_friction(self, raw_signal: np.ndarray, target_freq: float, adaptive_tracking: bool = True) -> dict:
        """
        Zoptymalizowany silnik analizy dekoherencji fazowej.
        Zawiera adaptacyjny filtr wejściowy i dynamiczną korektę dryfu RPM.
        """
        n_samples = len(raw_signal)
        t = np.linspace(0, n_samples / self.fs, n_samples, endpoint=False)

        # 1. Filtrowanie pasmowe (Kluczowe: Hilbert wymaga sygnału wąskopasmowego)
        if self.sos_bandpass is None:
            self._init_bandpass_filter(target_freq)

        # Filtrowanie ze stanem początkowym/końcowym zapobiega błędom krawędziowym
        filtered_signal, self.zi_bp = sosfilt(self.sos_bandpass, raw_signal, zi=self.zi_bp)

        # 2. Wyciągnięcie fazy chwilowej sygnału rzeczywistego
        analytic_signal = hilbert(filtered_signal)
        phase_signal = np.unwrap(np.angle(analytic_signal))

        # 3. Generowanie adaptacyjnej fali odniesienia (Śledzenie dryfu RPM)
        if adaptive_tracking:
            # Obliczamy chwilową częstotliwość sygnału, aby dostosować bazę
            inst_freq = np.diff(phase_signal) * self.fs / (2.0 * np.pi)
            # Wygładzanie częstotliwości środkowej (odrzucenie uderzeń szumowych)
            median_freq = np.median(inst_freq)
            # Jeśli dryf mieści się w granicach tolerancji mechanicznej (np. +-5Hz)
            if abs(median_freq - target_freq) < 5.0:
                target_freq = median_freq

        reference_wave = np.sin(2 * np.pi * target_freq * t)
        analytic_reference = hilbert(reference_wave)
        phase_reference = np.unwrap(np.angle(analytic_reference))

        # 4. Obliczenie błędu przesunięcia fazowego (Delta Phase)
        phase_error = np.abs(phase_signal - phase_reference)
        mean_phase_error_rad = np.mean(phase_error) % (2 * np.pi)

        # 5. Wyliczanie wskaźników koherencji i tarcia topologicznego
        coherence = float(np.exp(-mean_phase_error_rad))
        topological_friction = 1.0 - coherence
        mass_condensation_index = n_samples * topological_friction

        # 6. Klasyfikacja stanu operacyjnego
        if coherence > 0.94:
            status = "NOMINAL_KOHERENTNY"
            action = "BRAK"
        elif coherence > 0.85:
            status = "MIKRO_TARCIE_TOPOLOGICZNE"
            action = "PLANOWA_INSPEKCJA_LOZYSKA"
        else:
            status = "DEKOHERENCJA_KRYTYCZNA"
            action = "STOP_NATYCHMIASTOWY"

        return {
            "coherence_pct": coherence * 100,
            "topological_friction_pct": topological_friction * 100,
            "mass_condensation_index": mass_condensation_index,
            "phase_error_rad": mean_phase_error_rad,
            "actual_tracked_freq_hz": target_freq,
            "status": status,
            "recommended_action": action,
        }
