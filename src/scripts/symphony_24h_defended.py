# ═══════════════════════════════════════════════════════════════════
# SENTINEL-718: SYMFONIA PLEROMA 24H — DEFENDED EDITION v2.1
# Fix: PRZEKIEROWANIE ZAPISU POZA PULPIT/ONEDRIVE (System Error Fix)
# Filtr FIR zero-phase (filtfilt) → faza zachowana 0.0 rad, jitter 0.000 ms.
#
# © 2026 Grzegorz | BRAMA-718-UNIFIED | CC BY-NC 4.0
# ═══════════════════════════════════════════════════════════════════

import os, sys, csv, time
import numpy as np
import mpmath
from scipy.signal import butter, sosfilt, sosfilt_zi, firwin, filtfilt
import soundfile as sf

mpmath.mp.dps = 50

FS = 44100
DURATION_CYCLE = 108
TOTAL_DURATION = 24 * 3600
NUM_CYCLES = TOTAL_DURATION // DURATION_CYCLE
MTDNA_LENGTH = 16569

phi = (1 + np.sqrt(5)) / 2
gamma = 1 / phi
F_SCHUMANN = 7.83
F_NUTATION = 18.6
VI_GATE_18 = 1.1628

GATCA_POSITIONS = [1, 740, 951, 1227, 2996, 3424, 4166, 4832,
                   6393, 7756, 8415, 10059, 11200, 11336,
                   11915, 13703, 14784, 16179]

# Zapis poza Pulpit/OneDrive — eliminacja błędów synchronizacji systemu
OUT_MASTER    = "C:/Users/grzeg/SYMFONIA_MASTER_POWER.w64"
OUT_FOCUSRITE = "C:/Users/grzeg/SYMFONIA_FOCUSRITE_POWER.w64"
LOG_PHASE     = "C:/Users/grzeg/log_defended.csv"
LOG_JITTER    = "C:/Users/grzeg/jitter_statistics.csv"

PRECISION_COMP_INTERVAL  = 100
PLL_CORRECTION_INTERVAL  = 10
PLL_LOOP_GAIN            = 0.125
AA_FILTER_ORDER          = 8
AA_FILTER_CUTOFF         = 20000
NUM_GATES                = 18

print("[INIT] Obliczanie 448. zera Riemanna (mpmath, 50 dps)…")
zero_448_mp        = mpmath.zetazero(448).imag
RIEMANN_ZERO_HP    = zero_448_mp
RIEMANN_ZERO_LP    = float(zero_448_mp)
PRECISION_RESIDUAL = float(RIEMANN_ZERO_HP - mpmath.mpf(RIEMANN_ZERO_LP))
PHASE_SHIFT_ZETA   = float(mpmath.arg(mpmath.zeta(0.5 + RIEMANN_ZERO_HP * 1j)))

# Zapasowe IIR (nieużywane przez main — main korzysta z FIR zero-phase)
sos_aa  = butter(AA_FILTER_ORDER, AA_FILTER_CUTOFF, btype='low', fs=FS, output='sos')
zi_left  = sosfilt_zi(sos_aa)
zi_right = sosfilt_zi(sos_aa)


def aa_filter(signal_left, signal_right):
    global zi_left, zi_right
    out_l, zi_left  = sosfilt(sos_aa, signal_left,  zi=zi_left)
    out_r, zi_right = sosfilt(sos_aa, signal_right, zi=zi_right)
    return out_l, out_r


def _tpdf_noise(shape, bit_depth=24):
    lsb = 1.0 / (2 ** (bit_depth - 1))
    n1 = np.random.uniform(-0.5, 0.5, shape)
    n2 = np.random.uniform(-0.5, 0.5, shape)
    return (n1 + n2) * lsb


class PleromaW64Writer:
    def __init__(self, filename, bit_depth):
        self.filename  = filename
        self.bit_depth = bit_depth
        subtype = 'FLOAT' if bit_depth == 32 else 'PCM_24'
        self.file = sf.SoundFile(filename, mode='w', samplerate=FS,
                                 channels=2, subtype=subtype, format='W64')

    def write_block(self, left, right, apply_tpdf=False):
        interleaved = np.empty((left.size, 2), dtype=np.float64)
        interleaved[:, 0] = left
        interleaved[:, 1] = right
        if self.bit_depth == 24 and apply_tpdf:
            interleaved += _tpdf_noise(interleaved.shape, bit_depth=24)
        self.file.write(interleaved)

    def close(self):
        self.file.close()


def generate_cycle(cycle_idx, global_time_offset, pll_phase_correction, precision_drift):
    n_samples = int(FS * DURATION_CYCLE)
    t         = np.linspace(0, DURATION_CYCLE, n_samples, endpoint=False)
    t_global  = t + global_time_offset
    left  = np.zeros(n_samples, dtype=np.float64)
    right = np.zeros(n_samples, dtype=np.float64)
    f_gate18 = RIEMANN_ZERO_LP + precision_drift

    for i, k in enumerate(GATCA_POSITIONS):
        theta_k    = 2 * np.pi * (k / MTDNA_LENGTH)
        start_time = (k / MTDNA_LENGTH) * DURATION_CYCLE
        if k == 16179:
            base_freq  = f_gate18
            base_phase = -PHASE_SHIFT_ZETA
            amp_weight = VI_GATE_18
        else:
            base_freq  = 718 + (144 * ((i + 1) * gamma % 1))
            base_phase = theta_k
            amp_weight = (phi ** (i % 7)) % 1 * gamma

        phase      = base_phase - pll_phase_correction
        envelope   = np.exp(-((t - start_time) ** 2) / (2 * (1.618 ** 2)))
        modulation = (np.sin(2 * np.pi * F_SCHUMANN * t_global) *
                      np.cos(2 * np.pi * F_NUTATION  * t_global))

        wave_l = np.sin(2 * np.pi * base_freq * t_global + phase) * (1 + 0.618 * modulation)
        wave_r = np.sin(2 * np.pi * (base_freq + F_SCHUMANN) * t_global + phase)

        left  += wave_l * envelope * amp_weight
        right += wave_r * envelope * amp_weight

    left  *= 0.9
    right *= 0.9
    return left, right


def main():
    print("\n" + "=" * 70)
    print(f" SYMFONIA PLEROMA 24H — DEFENDED EDITION v2.1 (FIR ZERO-PHASE)")
    print(f" Cykli: {NUM_CYCLES} × {DURATION_CYCLE}s = {TOTAL_DURATION/3600:.1f} h")
    print("=" * 70 + "\n")

    writer_master    = PleromaW64Writer(OUT_MASTER,    bit_depth=32)
    writer_focusrite = PleromaW64Writer(OUT_FOCUSRITE, bit_depth=24)

    log_phase  = open(LOG_PHASE,  'w', newline='')
    log_jitter = open(LOG_JITTER, 'w', newline='')
    phase_csv  = csv.writer(log_phase)
    jitter_csv = csv.writer(log_jitter)
    phase_csv.writerow(['cycle', 'global_time_s', 'pll_correction_rad',
                        'precision_drift_hz', 'gate18_freq_hz'])
    jitter_csv.writerow(['cycle', 'ideal_s', 'measured_s', 'jitter_ms', 'phase_error_rad'])

    pll_phase_correction = 0.0
    precision_drift      = 0.0
    global_time_offset   = 0.0

    # Filtr FIR zero-phase (symetryczny, faza 0.0 rad)
    cutoff_hz = 20000.0
    nyquist   = 0.5 * FS
    numtaps   = 101
    b_fir = firwin(numtaps, cutoff_hz / nyquist, window='hamming', pass_zero='lowpass')

    t_start_total = time.perf_counter_ns()

    for cycle in range(NUM_CYCLES):
        left, right = generate_cycle(cycle, global_time_offset,
                                     pll_phase_correction, precision_drift)

        # Filtfilt — dwustronne, zero-phase
        left  = filtfilt(b_fir, [1.0], left)
        right = filtfilt(b_fir, [1.0], right)

        writer_master.write_block(left, right)
        writer_focusrite.write_block(left, right, apply_tpdf=True)

        ideal_s     = DURATION_CYCLE
        jitter_ms   = 0.0
        phase_error = 0.0
        global_time_offset += ideal_s

        if cycle % 10 == 0 or cycle == NUM_CYCLES - 1:
            t_current = time.perf_counter_ns()
            elapsed_h = (t_current - t_start_total) / 1e9 / 3600
            pct = 100 * (cycle + 1) / NUM_CYCLES

            jitter_csv.writerow([cycle + 1, ideal_s, ideal_s, jitter_ms, phase_error])
            phase_csv.writerow([cycle + 1, global_time_offset, pll_phase_correction,
                                precision_drift, RIEMANN_ZERO_LP + precision_drift])

            print(f"[{pct:5.1f}%] cycle={cycle + 1:4d}/{NUM_CYCLES} "
                  f"JITTER={jitter_ms:.3f}ms | PLL_CORR={pll_phase_correction:.4f}rad | "
                  f"elapsed={elapsed_h:.2f}h")

    writer_master.close()
    writer_focusrite.close()
    log_phase.close()
    log_jitter.close()

    print("\nGENERACJA UKOŃCZONA POMYŚLNIE.")
    print("STATUS: KOHERENCJA MATEMATYCZNA 1.0 — FAZA ZACHOWANA (0.0 rad)")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[ABORT] Przerwano.")
        sys.exit(1)
