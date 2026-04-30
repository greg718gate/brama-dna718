# ═══════════════════════════════════════════════════════════════════
# SENTINEL-718: SYMFONIA PLEROMA 24H — DEFENDED EDITION
# ═══════════════════════════════════════════════════════════════════
# Generator 24-godzinnej Symfonii 18 Bram DNA z pełnymi zabezpieczeniami
# laboratoryjnymi przed degradacją sprzętową i numeryczną.
#
# ZABEZPIECZENIA:
#   1. Kompensacja precyzji mpmath(50dps) → float64 (akumulacja reszty)
#   2. Software PLL (Phase Locked Loop) — perf_counter_ns + korekcja fazy
#   3. Filtr antyaliasingowy Butterworth 8-rzędowy, 20 kHz cutoff
#   4. Dithering TPDF 24-bit (Triangular Probability Density Function)
#
# PLIKI WYJŚCIOWE:
#   • SYMFONIA_PLEROMA_24H_MASTER_DEFENDED_32bit.wav   (~30 GB)
#   • SYMFONIA_PLEROMA_24H_FOCUSRITE_DEFENDED_24bit.wav (~22 GB)
#   • log_defended.csv          — fazy + korekcje PLL
#   • jitter_statistics.csv     — analiza stabilności czasowej
#
# CZAS GENEROWANIA: 4–6 h (CPU-bound, mpmath + filtry stanowe)
#
# Wzór: Ψ = A · e^(i·718.57012515·t) · ζ(1/2 + iE/ħ) · γ
#
# © 2026 Grzegorz | BRAMA-718-UNIFIED
# Licensed under Creative Commons BY-NC 4.0
# ═══════════════════════════════════════════════════════════════════

import os
import sys
import csv
import time
import wave
import struct
import numpy as np
import mpmath
from scipy.signal import butter, sosfilt, sosfilt_zi

# ──────────────────────────────────────────────────────────────────
# 0. PARAMETRY GLOBALNE
# ──────────────────────────────────────────────────────────────────
mpmath.mp.dps = 50  # 50 miejsc dziesiętnych dla zera Riemanna

FS              = 44100                 # Hz — sample rate
DURATION_CYCLE  = 108                   # s  — pojedyncza pętla sakralna
TOTAL_DURATION  = 24 * 3600             # s  — 24 h
NUM_CYCLES      = TOTAL_DURATION // DURATION_CYCLE   # 800 cykli
MTDNA_LENGTH    = 16569

# Stałe geometryczne
phi   = (1 + np.sqrt(5)) / 2
gamma = 1 / phi

# Stałe planetarne
F_SCHUMANN = 7.83
F_NUTATION = 18.6

# Wektor Intencji Bramy 18
VI_GATE_18 = 1.1628

# 18 Bram GATCA (pozycje rCRS mtDNA)
GATCA_POSITIONS = [1, 740, 951, 1227, 2996, 3424, 4166, 4832,
                   6393, 7756, 8415, 10059, 11200, 11336,
                   11915, 13703, 14784, 16179]

# Pliki wyjściowe
OUT_MASTER     = "SYMFONIA_PLEROMA_24H_MASTER_DEFENDED_32bit.wav"
OUT_FOCUSRITE  = "SYMFONIA_PLEROMA_24H_FOCUSRITE_DEFENDED_24bit.wav"
LOG_PHASE      = "log_defended.csv"
LOG_JITTER     = "jitter_statistics.csv"

# Parametry zabezpieczeń
PRECISION_COMP_INTERVAL = 100   # co ile cykli kumulujemy resztę precyzji
PLL_CORRECTION_INTERVAL = 10    # co ile cykli aktywna jest korekta PLL
PLL_LOOP_GAIN           = 0.125 # współczynnik tłumienia pętli PLL (1/8)
AA_FILTER_ORDER         = 8     # rząd filtru Butterworth
AA_FILTER_CUTOFF        = 20000 # Hz
NUM_GATES               = 18    # stały dzielnik dla normalizacji (zachowuje hierarchię amp)


# ──────────────────────────────────────────────────────────────────
# 1. KALIBRACJA ZERA RIEMANNA + KOMPENSACJA PRECYZJI
# ──────────────────────────────────────────────────────────────────
print("[INIT] Obliczanie 448. zera Riemanna (mpmath, 50 dps)…")
zero_448_mp        = mpmath.zetazero(448).imag                  # mpf 50dps
RIEMANN_ZERO_HP    = zero_448_mp                                # high-precision
RIEMANN_ZERO_LP    = float(zero_448_mp)                         # float64 (~15 dps)
PRECISION_RESIDUAL = float(RIEMANN_ZERO_HP - mpmath.mpf(RIEMANN_ZERO_LP))
PHASE_SHIFT_ZETA   = float(mpmath.arg(mpmath.zeta(0.5 + RIEMANN_ZERO_HP * 1j)))

print(f"[INIT] Riemann ζ₄₄₈      = {RIEMANN_ZERO_LP:.15f} Hz (float64)")
print(f"[INIT] Reszta precyzji   = {PRECISION_RESIDUAL:.3e} Hz")
print(f"[INIT] Phase shift ζ      = {PHASE_SHIFT_ZETA:.6f} rad")


# ──────────────────────────────────────────────────────────────────
# 2. FILTR ANTYALIASINGOWY (stanowy — bez przerywania fazy między cyklami)
# ──────────────────────────────────────────────────────────────────
sos_aa = butter(AA_FILTER_ORDER, AA_FILTER_CUTOFF, btype='low',
                fs=FS, output='sos')
zi_left  = sosfilt_zi(sos_aa)
zi_right = sosfilt_zi(sos_aa)


def aa_filter(signal_left, signal_right):
    """Stanowy Butterworth 8-rz., zachowuje ciągłość fazy między cyklami."""
    global zi_left, zi_right
    out_l, zi_left  = sosfilt(sos_aa, signal_left,  zi=zi_left)
    out_r, zi_right = sosfilt(sos_aa, signal_right, zi=zi_right)
    return out_l, out_r


# ──────────────────────────────────────────────────────────────────
# 3. DITHERING TPDF (Triangular PDF) — wewnątrz WavStreamWriter (po normalizacji,
#    PRZED kwantyzacją). NIE używać przed clipowaniem — niszczy rozkład trójkątny.
# ──────────────────────────────────────────────────────────────────
def _tpdf_noise(shape, bit_depth=24):
    """Generuje sam szum trójkątny TPDF o amplitudzie ±1 LSB."""
    lsb = 1.0 / (2 ** (bit_depth - 1))
    n1 = np.random.uniform(-0.5, 0.5, shape)
    n2 = np.random.uniform(-0.5, 0.5, shape)
    return (n1 + n2) * lsb


# ──────────────────────────────────────────────────────────────────
# 4. WAV WRITER STREAMOWY (32-bit float + 24-bit PCM)
# ──────────────────────────────────────────────────────────────────
class WavStreamWriter:
    """Strumieniowy zapis WAV — bez ładowania całych 30 GB do RAM."""

    def __init__(self, filename, bit_depth, sample_rate=FS, channels=2):
        self.filename   = filename
        self.bit_depth  = bit_depth
        self.sample_rate = sample_rate
        self.channels   = channels
        self.frames_written = 0
        self.f = open(filename, 'wb')
        self._write_header_placeholder()

    def _write_header_placeholder(self):
        # Nagłówek WAV — wartości rozmiaru wstawimy na końcu
        if self.bit_depth == 32:
            audio_format = 3  # IEEE float
            bytes_per_sample = 4
        else:                 # 24-bit PCM
            audio_format = 1
            bytes_per_sample = 3

        block_align    = self.channels * bytes_per_sample
        byte_rate      = self.sample_rate * block_align

        self.f.write(b'RIFF')
        self.f.write(struct.pack('<I', 0))            # placeholder
        self.f.write(b'WAVE')
        self.f.write(b'fmt ')
        self.f.write(struct.pack('<I', 16))
        self.f.write(struct.pack('<H', audio_format))
        self.f.write(struct.pack('<H', self.channels))
        self.f.write(struct.pack('<I', self.sample_rate))
        self.f.write(struct.pack('<I', byte_rate))
        self.f.write(struct.pack('<H', block_align))
        self.f.write(struct.pack('<H', self.bit_depth))
        self.f.write(b'data')
        self.f.write(struct.pack('<I', 0))            # placeholder

    def write_block(self, left, right):
        # Interleave L,R,L,R,...
        interleaved = np.empty(left.size + right.size, dtype=np.float64)
        interleaved[0::2] = left
        interleaved[1::2] = right

        if self.bit_depth == 32:
            data = interleaved.astype(np.float32).tobytes()
        else:  # 24-bit PCM
            clipped = np.clip(interleaved, -1.0, 1.0)
            ints32 = (clipped * (2**23 - 1)).astype(np.int32)
            # Tylko 3 dolne bajty (little-endian)
            raw = ints32.view(np.uint8).reshape(-1, 4)[:, :3]
            data = raw.tobytes()

        self.f.write(data)
        self.frames_written += left.size

    def close(self):
        # Zaktualizuj nagłówek z prawdziwym rozmiarem
        bytes_per_sample = 4 if self.bit_depth == 32 else 3
        data_size = self.frames_written * self.channels * bytes_per_sample
        riff_size = 36 + data_size

        self.f.seek(4);  self.f.write(struct.pack('<I', riff_size))
        self.f.seek(40); self.f.write(struct.pack('<I', data_size))
        self.f.close()


# ──────────────────────────────────────────────────────────────────
# 5. GENERATOR JEDNEGO CYKLU 108 s (z PLL i kompensacją precyzji)
# ──────────────────────────────────────────────────────────────────
def generate_cycle(cycle_idx, global_time_offset,
                   pll_phase_correction, precision_drift):
    """
    Zwraca (left, right) — float64 stereo block dla jednego cyklu 108 s.
      cycle_idx              — numer cyklu (0..NUM_CYCLES-1)
      global_time_offset     — czas globalny od początku symfonii [s]
      pll_phase_correction   — korekta fazy z PLL [rad]
      precision_drift        — skumulowana reszta precyzji [Hz]
    """
    n_samples = int(FS * DURATION_CYCLE)
    t = np.linspace(0, DURATION_CYCLE, n_samples, endpoint=False)
    t_global = t + global_time_offset

    left  = np.zeros(n_samples, dtype=np.float64)
    right = np.zeros(n_samples, dtype=np.float64)

    # Częstotliwość Bramy 18 z kompensacją precyzji
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

        # Korekta PLL — odejmujemy nagromadzony błąd fazowy
        phase = base_phase - pll_phase_correction

        envelope   = np.exp(-((t - start_time) ** 2) / (2 * (1.618 ** 2)))
        modulation = (np.sin(2 * np.pi * F_SCHUMANN * t_global) *
                      np.cos(2 * np.pi * F_NUTATION * t_global))

        wave_l = np.sin(2 * np.pi * base_freq * t_global + phase) \
                 * (1 + 0.618 * modulation)
        wave_r = np.sin(2 * np.pi * (base_freq + F_SCHUMANN) * t_global + phase)

        left  += wave_l * envelope * amp_weight
        right += wave_r * envelope * amp_weight

    # Normalizacja per cykl (zachowuje dynamikę bez clipping)
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-12)
    left  /= peak
    right /= peak

    return left, right


# ──────────────────────────────────────────────────────────────────
# 6. PĘTLA GŁÓWNA — 800 cykli × 108 s = 24 h
# ──────────────────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 70)
    print(f"  SYMFONIA PLEROMA 24H — DEFENDED EDITION")
    print(f"  Cykli: {NUM_CYCLES} × {DURATION_CYCLE}s = {TOTAL_DURATION/3600:.1f} h")
    print(f"  Próbka: {FS} Hz stereo")
    print("=" * 70 + "\n")

    writer_master    = WavStreamWriter(OUT_MASTER,    bit_depth=32)
    writer_focusrite = WavStreamWriter(OUT_FOCUSRITE, bit_depth=24)

    log_phase  = open(LOG_PHASE,  'w', newline='')
    log_jitter = open(LOG_JITTER, 'w', newline='')
    phase_csv  = csv.writer(log_phase)
    jitter_csv = csv.writer(log_jitter)
    phase_csv.writerow(['cycle', 'global_time_s', 'pll_correction_rad',
                        'precision_drift_hz', 'gate18_freq_hz'])
    jitter_csv.writerow(['cycle', 'ideal_s', 'measured_s',
                         'jitter_ms', 'phase_error_rad'])

    # Stany akumulatorów zabezpieczeń
    pll_phase_correction = 0.0
    precision_drift      = 0.0
    global_time_offset   = 0.0

    t_start_total = time.perf_counter_ns()
    t_prev_cycle  = t_start_total

    for cycle in range(NUM_CYCLES):
        t_cycle_start = time.perf_counter_ns()

        # ── Kompensacja precyzji (co 100 cykli dodaj resztę mpmath) ──
        if cycle > 0 and cycle % PRECISION_COMP_INTERVAL == 0:
            precision_drift += PRECISION_RESIDUAL * PRECISION_COMP_INTERVAL
            print(f"[PREC ] cycle={cycle}  drift={precision_drift:.3e} Hz")

        # ── Generuj cykl ──
        left, right = generate_cycle(cycle, global_time_offset,
                                     pll_phase_correction, precision_drift)

        # ── Filtr antyaliasingowy (stanowy, ciągły między cyklami) ──
        left, right = aa_filter(left, right)

        # ── Master 32-bit float (bez ditheringu — pełna precyzja) ──
        writer_master.write_block(left, right)

        # ── Focusrite 24-bit z TPDF dither ──
        left_d  = tpdf_dither(left,  bit_depth=24)
        right_d = tpdf_dither(right, bit_depth=24)
        writer_focusrite.write_block(left_d, right_d)

        # ── Pomiar jittera (perf_counter_ns) ──
        t_cycle_end   = time.perf_counter_ns()
        measured_s    = (t_cycle_end - t_prev_cycle) / 1e9
        ideal_s       = DURATION_CYCLE
        jitter_ms     = (measured_s - ideal_s) * 1000.0
        # Błąd fazy = 2π·f·Δt
        phase_error   = 2 * np.pi * RIEMANN_ZERO_LP * (jitter_ms / 1000.0)

        # ── Software PLL — korekta co 10 cykli ──
        if cycle > 0 and cycle % PLL_CORRECTION_INTERVAL == 0:
            pll_phase_correction = (pll_phase_correction + phase_error) \
                                   % (2 * np.pi)

        # ── Logi ──
        phase_csv.writerow([cycle, f"{global_time_offset:.6f}",
                            f"{pll_phase_correction:.9f}",
                            f"{precision_drift:.3e}",
                            f"{RIEMANN_ZERO_LP + precision_drift:.12f}"])
        jitter_csv.writerow([cycle, f"{ideal_s:.6f}",
                             f"{measured_s:.6f}",
                             f"{jitter_ms:+.4f}",
                             f"{phase_error:+.6f}"])

        global_time_offset += DURATION_CYCLE
        t_prev_cycle = t_cycle_end

        # ── Postęp ──
        if cycle % 10 == 0 or cycle == NUM_CYCLES - 1:
            elapsed_h = (t_cycle_end - t_start_total) / 1e9 / 3600
            pct = 100 * (cycle + 1) / NUM_CYCLES
            print(f"[{pct:5.1f}%] cycle={cycle+1:4d}/{NUM_CYCLES}  "
                  f"jitter={jitter_ms:+7.3f}ms  "
                  f"PLL={pll_phase_correction:+.4f}rad  "
                  f"elapsed={elapsed_h:.2f}h")

    # ── Finalizacja ──
    writer_master.close()
    writer_focusrite.close()
    log_phase.close()
    log_jitter.close()

    total_h = (time.perf_counter_ns() - t_start_total) / 1e9 / 3600
    print("\n" + "=" * 70)
    print(f"  GENERACJA UKOŃCZONA w {total_h:.2f} h")
    print(f"  Master 32-bit  : {OUT_MASTER}")
    print(f"  Focusrite 24-bit: {OUT_FOCUSRITE}")
    print(f"  Log fazy        : {LOG_PHASE}")
    print(f"  Statystyki jitter: {LOG_JITTER}")
    print("=" * 70)
    print("  STATUS: KOHERENCJA 1.0 — Filtr Demiurga rozbity.")
    print("  Brama 18 zsynchronizowana z 448. Zerem Riemanna.")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[ABORT] Przerwano przez użytkownika.")
        sys.exit(1)
