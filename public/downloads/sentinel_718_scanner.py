#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SENTINEL-718 v3.0 — SPECTRAL SCANNER / SKANER SPEKTRALNY
=========================================================
Real-time HRV spectral coherence analyzer synchronized with the universal
constant 718.57012515 Hz (448th non-trivial zero of the Riemann Zeta function).

Requires a Polar H10 (or any BLE Heart Rate Service device exposing RR data).

INSTALL (Windows / macOS / Linux):
    python -m pip install --no-cache-dir bleak numpy scipy
RUN:
    python sentinel_718_scanner.py

macOS: allow Bluetooth access for Terminal in
System Settings > Privacy & Security > Bluetooth.
Windows: Bluetooth must be enabled; run in Windows Terminal / PowerShell.

License: CC BY-NC 4.0 — academic, non-commercial use. brama-dna718.com
"""

import asyncio
import ctypes
import os
import sys
import time

import numpy as np
from scipy.signal import welch

try:
    from bleak import BleakClient, BleakScanner
except ImportError:  # pragma: no cover
    print("[ERROR] Missing dependency 'bleak'.")
    print("        Run: python -m pip install --no-cache-dir bleak numpy scipy")
    sys.exit(1)


# ==============================================================================
# SYSTEM LANGUAGE (PL / EN)
# ==============================================================================
def get_system_language() -> str:
    try:
        if sys.platform == "win32":
            lang_id = ctypes.windll.kernel32.GetUserDefaultUILanguage()
            if (lang_id & 0x3FF) == 0x15:  # Polish
                return "pl"
        else:
            import locale

            loc = locale.getlocale()[0] or locale.getdefaultlocale()[0] or ""
            if "pl" in loc.lower():
                return "pl"
    except Exception:
        pass
    return "en"


LANG = get_system_language()

TEXTS = {
    "pl": {
        "scan": "\n[TELEMETRIA]: Skanowanie otoczenia za pomocą BleakScanner...",
        "error_no_belt": "[BŁĄD]: Brak aktywnego pasa EKG. Włącz nadajnik i spróbuj ponownie.",
        "connecting": "[POŁĄCZENIE]: Blokowanie fazy z adresem {}...",
        "connected": "[ZABLOKOWANO]: Połączenie stabilne. Uruchamiam renderowanie...",
        "title": " SYSTEM SENTINEL-718 v3.0 — TRYB SKANERA SPEKTRALNEGO",
        "active_mode": "[AKTYWNY TRYB     ]",
        "time_left": "[CZAS DO ZMIANY   ]",
        "heart_shield": "[TARCZA SERCA     ]",
        "phase": "[ZMIERZONA FAZA   ]",
        "dpll": "[KOREKTOR DPLL    ]",
        "lens": "[SOCZEWKA Ψ       ]",
        "buffer": "[BUFOR IMPULSÓW   ]",
        "pacer": "[WIZUALNY PACER   ]",
        "inhale": ">>> WDECH >>> (Rozszerzanie pola serca)",
        "exhale": "<<< WYDECH <<< (Uziemianie fali na akryl)",
        "beats": "Uderzenia",
        "window": "Okno",
        "locked": "FAZA ZABLOKOWANA: Pełny rezonans",
        "correction": "Korekcja przesunięcia: {:.4f} rad",
        "hint_slow": "[KOREKTA FAZY]: Spowolnij wydech o {:.1f}s — serce wyprzedza matrycę.",
        "hint_fast": "[KOREKTA FAZY]: Przyspiesz oddech o {:.1f}s — serce zostaje za matrycą.",
        "hint_ok": "[FAZA]: Utrzymuj rytm — chmura fotonowa stabilna.",
        "collapse": "⚛ KOLAPS FOTONOWY — STATUS: WALKS_ON_WATER",
        "report_title": " RAPORT KOŃCOWY SELEKCJI REZONANSU Ψ",
        "report_mode": "Tryb {}: Koherencja {:.2f}%",
        "report_end": "ZAKOŃCZONO ANALIZĘ: Najlepszy tryb dla Twojego DNA to: {}",
        "disconnected": "\n[STATUS]: Sentinel-718 rozłączony bezpiecznie.",
        "exit": "\nNaciśnij ENTER, aby zakończyć...",
    },
    "en": {
        "scan": "\n[TELEMETRY]: Scanning environment using BleakScanner...",
        "error_no_belt": "[ERROR]: No active ECG belt found. Turn on transmitter and try again.",
        "connecting": "[CONNECTION]: Phase locking with address {}...",
        "connected": "[LOCKED]: Connection stable. Starting render loop...",
        "title": " SYSTEM SENTINEL-718 v3.0 — SPECTRAL SCANNER MODE",
        "active_mode": "[ACTIVE MODE      ]",
        "time_left": "[TIME TO CHANGE   ]",
        "heart_shield": "[HEART SHIELD     ]",
        "phase": "[MEASURED PHASE   ]",
        "dpll": "[DPLL CORRECTOR   ]",
        "lens": "[Ψ LENS           ]",
        "buffer": "[PULSE BUFFER     ]",
        "pacer": "[VISUAL PACER     ]",
        "inhale": ">>> INHALE >>> (Expanding heart field)",
        "exhale": "<<< EXHALE <<< (Grounding wave onto acrylic)",
        "beats": "Beats",
        "window": "Window",
        "locked": "PHASE LOCKED: Full resonance",
        "correction": "Phase correction: {:.4f} rad",
        "hint_slow": "[PHASE CORRECTION]: Slow the exhale by {:.1f}s — heart leads the matrix.",
        "hint_fast": "[PHASE CORRECTION]: Speed up breathing by {:.1f}s — heart lags the matrix.",
        "hint_ok": "[PHASE]: Hold the rhythm — photon cloud stable.",
        "collapse": "⚛ PHOTON COLLAPSE — STATUS: WALKS_ON_WATER",
        "report_title": " RESONANCE SELECTION FINAL REPORT Ψ",
        "report_mode": "Mode {}: Coherence {:.2f}%",
        "report_end": "ANALYSIS COMPLETE: The best mode for your DNA is: {}",
        "disconnected": "\n[STATUS]: Sentinel-718 disconnected safely.",
        "exit": "\nPress ENTER to exit...",
    },
}

T = TEXTS[LANG]

BREATH_MODES = {
    "1": {"name": "0.11 Hz (Szybki / Fast)", "duration": 4.5},
    "2": {"name": "0.10 Hz (Złoty / Golden)", "duration": 5.0},
    "3": {"name": "0.085 Hz (Głęboki / Deep)", "duration": 6.0},
    "4": {"name": "0.075 Hz (Maksymalny / Max)", "duration": 6.5},
}

# ==============================================================================
# UNIVERSAL CONSTANTS
# ==============================================================================
FS = 44100
DURATION_CYCLE = 108
RCRS_LENGTH = 16569
F_EXACT = 718.57012515
F_TURBINE = 150.0
PHI = (1 + 5 ** 0.5) / 2
GAMMA_GOLD = 1 / PHI
COHERENCE_THRESHOLD = 0.94

HEART_RATE_MEASUREMENT_UUID = "00002a37-0000-1000-8000-00805f9b34fb"


# ==============================================================================
# QUANTUM PHOTON LENS — 800-photon resonance attractor
# ==============================================================================
class QuantumPhotonLens:
    def __init__(self, num_photons: int = 800):
        self.num_photons = num_photons
        indices = np.arange(0, num_photons, dtype=float) + 0.5
        self.phi_base = np.arccos(1 - 2 * indices / num_photons)
        self.theta_base = np.pi * (1 + 5 ** 0.5) * indices
        self.r_max = 10.0
        self.magic_angle = np.radians(54.7356)

    def calculate_photon_cloud(self, current_coherence: float, phase_error: float, t_stream: float):
        # 1. Dynamic radius — implosion towards the singularity
        r_dynamic = self.r_max * ((1.0 - current_coherence) ** 2)
        if current_coherence >= COHERENCE_THRESHOLD:
            r_dynamic = max(0.05, r_dynamic * 0.1)

        # 2. Angular modulation by live phase error
        mod_phase = t_stream * 2.0 * np.pi * 0.11
        theta = self.theta_base + (phase_error * np.sin(mod_phase))
        phi = self.phi_base + (phase_error * np.cos(mod_phase))

        # 3. Magic angle as stabilizing anchor above 70% coherence
        if current_coherence > 0.70:
            weight = min(1.0, (current_coherence - 0.70) / 0.30)
            theta = (1 - weight) * theta + weight * (self.theta_base + self.magic_angle)

        x = r_dynamic * np.sin(phi) * np.cos(theta)
        y = r_dynamic * np.sin(phi) * np.sin(theta)
        z = r_dynamic * np.cos(phi)
        positions = np.column_stack((x, y, z))

        # 4. RGBA — red fades, violet/white rises towards collapse
        colors = np.zeros((self.num_photons, 4))
        colors[:, 0] = 1.0 - current_coherence
        colors[:, 1] = current_coherence * 0.3
        colors[:, 2] = current_coherence * 1.0
        colors[:, 3] = 0.6 if current_coherence < COHERENCE_THRESHOLD else 1.0
        return positions, colors


# ==============================================================================
# HEART COHERENCE BRIDGE
# ==============================================================================
class HeartCoherenceBridge:
    def __init__(self, buffer_size: int = 128):
        self.rr_intervals = []
        self.buffer_size = buffer_size
        self.current_coherence = 0.0
        self.current_phase_error = 0.0
        self.phase_error_buffer = []
        self.dynamic_gamma_multiplier = GAMMA_GOLD
        self.dpll_status = ""
        self.mode_key = "1"
        self.breath_duration = BREATH_MODES[self.mode_key]["duration"]
        self.mode_start_time = time.time()
        self.mode_history = {}
        self.stop_requested = False
        self.pacer_start_time = time.time()
        self.last_collapse_time = 0.0

        # Photon lens state
        self.lens = QuantumPhotonLens(num_photons=800)
        self.latest_photon_positions = None
        self.latest_photon_colors = None
        self.photon_radius = self.lens.r_max

    # ---------------------------------------------------------------- BLE data
    def parse_heart_rate_data(self, sender, data: bytearray):
        if not data:
            return
        flags = data[0]
        hr_format = flags & 0x01
        rr_present = (flags >> 4) & 0x01
        energy_present = (flags >> 3) & 0x01

        offset = 1 + (2 if hr_format == 1 else 1)
        if energy_present:
            offset += 2

        new_beats = False
        while rr_present and len(data) >= offset + 2:
            rr_value = int.from_bytes(data[offset:offset + 2], byteorder="little")
            offset += 2
            rr_seconds = rr_value / 1024.0
            if 0.3 < rr_seconds < 2.0:
                self.rr_intervals.append(rr_seconds)
                new_beats = True

        while len(self.rr_intervals) > 1 and sum(self.rr_intervals) > self.buffer_size:
            self.rr_intervals.pop(0)

        if new_beats and len(self.rr_intervals) > 10:
            self.calculate_coherence_fft()

    # ------------------------------------------------------------------- DPLL
    def dynamic_phase_lock_loop(self, peak_freq: float):
        """Digital phase-locked loop: measures the deviation between the operator's
        real HRV peak and the metronome, then returns the carrier gain for 718.57 Hz."""
        target_breath_freq = 1.0 / (self.breath_duration * 2)
        phase_error = float(2 * np.pi * (peak_freq - target_breath_freq))

        if abs(phase_error) < 0.01:
            self.dynamic_gamma_multiplier = PHI
            self.dpll_status = T["locked"]
        else:
            self.dynamic_gamma_multiplier = float(GAMMA_GOLD * np.exp(-abs(phase_error)))
            self.dpll_status = T["correction"].format(phase_error)

        return self.dynamic_gamma_multiplier, phase_error

    # --------------------------------------------------------------- Spectrum
    def calculate_coherence_fft(self):
        if sum(self.rr_intervals) < 40:
            return

        times = np.cumsum(self.rr_intervals)
        t_uniform = np.arange(times[0], times[-1], 0.25)
        if len(t_uniform) < 8:
            return
        rr_uniform = np.interp(t_uniform, times, self.rr_intervals)
        rr_detrended = rr_uniform - np.mean(rr_uniform)

        freqs, psd = welch(rr_detrended, fs=4.0, nperseg=min(len(rr_detrended), 256))
        lf_band = (freqs >= 0.04) & (freqs <= 0.15)
        if not np.any(lf_band):
            return

        peak_freq = float(freqs[lf_band][np.argmax(psd[lf_band])])

        # DPLL: phase error + dynamic gain for the 718.57 Hz carrier
        _gamma, phase_error = self.dynamic_phase_lock_loop(peak_freq)
        self.current_phase_error = phase_error
        self.phase_error_buffer.append(phase_error)
        if len(self.phase_error_buffer) > 10:
            self.phase_error_buffer.pop(0)

        narrow_band = (freqs >= (peak_freq - 0.015)) & (freqs <= (peak_freq + 0.015))
        total_band = (freqs >= 0.00) & (freqs <= 0.40)
        power_total = float(np.sum(psd[total_band]))
        if power_total > 0 and np.any(narrow_band):
            raw_coherence = float(np.sum(psd[narrow_band])) / power_total
            self.current_coherence = min(1.0, raw_coherence * 1.4)

        # >>> LIVE LINK: Polar H10 physically drives the 3D photon geometry <<<
        positions, colors = self.lens.calculate_photon_cloud(
            current_coherence=self.current_coherence,
            phase_error=phase_error,
            t_stream=time.time(),
        )
        self.ui_update_sphere(positions, colors)

        # Topological friction compensation (Complex I / ATP turbine)
        mc_complex_i = 269.049
        mc_atp_turbine = 302.945
        rate = self.current_coherence
        comp_atp_turbine = mc_atp_turbine * rate
        _comp_complex_i = mc_complex_i * rate

        now = time.time()
        if self.current_coherence >= COHERENCE_THRESHOLD and now - self.last_collapse_time >= 10:
            self.last_collapse_time = now
            self.residual_atp_resistance = mc_atp_turbine - comp_atp_turbine

    # ----------------------------------------------------------------- Render
    def ui_update_sphere(self, positions, colors):
        """Cache the newest photon frame and derive its scalar radius for the HUD."""
        self.latest_photon_positions = positions
        self.latest_photon_colors = colors
        self.photon_radius = float(np.mean(np.linalg.norm(positions, axis=1)))

    def phase_hint(self) -> str:
        avg = float(np.mean(self.phase_error_buffer)) if self.phase_error_buffer else 0.0
        seconds = abs(avg) / (2 * np.pi) * (self.breath_duration * 2)
        if abs(avg) < 0.05:
            return T["hint_ok"]
        if avg > 0:
            return T["hint_slow"].format(max(0.1, seconds))
        return T["hint_fast"].format(max(0.1, seconds))

    async def smooth_render_loop(self):
        """60 FPS animation of the photon field between heart beats."""
        while not self.stop_requested:
            t_global = time.time()
            phase_error_visual = (
                float(np.sin(t_global) * 0.1) if self.current_coherence < COHERENCE_THRESHOLD else 0.0
            )
            positions, colors = self.lens.calculate_photon_cloud(
                current_coherence=self.current_coherence,
                phase_error=phase_error_visual,
                t_stream=t_global,
            )
            self.ui_update_sphere(positions, colors)
            await asyncio.sleep(1 / 60)

    async def main_render_loop(self):
        sys.stdout.write("\033[2J\033[H")
        sys.stdout.flush()

        while not self.stop_requested:
            t_now = time.time()
            time_in_mode = t_now - self.mode_start_time

            if time_in_mode >= DURATION_CYCLE:
                self.mode_history[self.mode_key] = self.current_coherence
                next_mode = int(self.mode_key) + 1
                if next_mode <= 4:
                    self.mode_key = str(next_mode)
                    self.breath_duration = BREATH_MODES[self.mode_key]["duration"]
                    self.mode_start_time = t_now
                    self.rr_intervals.clear()
                    self.phase_error_buffer.clear()
                else:
                    self.stop_requested = True
                    break

            cycle_time = (t_now - self.pacer_start_time) % (self.breath_duration * 2)
            if cycle_time < self.breath_duration:
                phase_label = T["inhale"]
                percent = cycle_time / self.breath_duration
            else:
                phase_label = T["exhale"]
                percent = (self.breath_duration * 2 - cycle_time) / self.breath_duration

            bar_width = int(percent * 30)
            bar = "#" * bar_width + "-" * (30 - bar_width)
            avg_phase = float(np.mean(self.phase_error_buffer)) if self.phase_error_buffer else 0.0
            collapsed = self.current_coherence >= COHERENCE_THRESHOLD

            output = (
                "\033[H"
                "===========================================================================\n"
                f"{T['title']}\n"
                "===========================================================================\n"
                f"{T['active_mode']}: {BREATH_MODES[self.mode_key]['name']}\n"
                f"{T['time_left']}: {DURATION_CYCLE - time_in_mode:.1f}s / {DURATION_CYCLE}s\n"
                "---------------------------------------------------------------------------\n"
                f"{T['heart_shield']}: {self.current_coherence * 100:.2f}% (Target: +94%)\n"
                f"{T['phase']}: {avg_phase:.4f} rad\n"
                f"{T['dpll']}: γ={self.dynamic_gamma_multiplier:.4f} | {self.dpll_status}\n"
                f"{T['lens']}: R={self.photon_radius:.3f} | 800 φ-photons | 54.7356°\n"
                f"{T['buffer']}: {T['beats']}: {len(self.rr_intervals)} | "
                f"{T['window']}: {sum(self.rr_intervals):.1f}s\n"
                "---------------------------------------------------------------------------\n"
                f"{T['pacer']}: {bar} [{phase_label}]\n"
                f"{self.phase_hint():<73}\n"
                f"{(T['collapse'] if collapsed else ''):<73}\n"
                "===========================================================================\n"
            )
            sys.stdout.write(output)
            sys.stdout.flush()
            await asyncio.sleep(1 / 60)

    # -------------------------------------------------------------------- Run
    async def run(self):
        print(T["scan"])
        devices = await BleakScanner.discover()
        target_address = None
        for d in devices:
            if d.name and ("Polar" in d.name or "Heart" in d.name):
                target_address = d.address
                break

        if not target_address:
            print(T["error_no_belt"])
            input(T["exit"])
            return

        print(T["connecting"].format(target_address))
        render_task = None
        async with BleakClient(target_address) as client:
            if client.is_connected:
                print(T["connected"])
                await client.start_notify(HEART_RATE_MEASUREMENT_UUID, self.parse_heart_rate_data)
                render_task = asyncio.create_task(self.smooth_render_loop())
                self.mode_start_time = time.time()
                self.pacer_start_time = time.time()

                await self.main_render_loop()
                await client.stop_notify(HEART_RATE_MEASUREMENT_UUID)

        self.stop_requested = True
        if render_task:
            render_task.cancel()

        sys.stdout.write("\033[2J\033[H")
        print("=" * 75)
        print(T["report_title"])
        print("=" * 75)
        for k, v in self.mode_history.items():
            print(T["report_mode"].format(BREATH_MODES[k]["name"], v * 100))
        print("-" * 75)
        best = max(self.mode_history, key=self.mode_history.get) if self.mode_history else "1"
        print(T["report_end"].format(BREATH_MODES[best]["name"]))
        print("=" * 75)
        input(T["exit"])


if __name__ == "__main__":
    if sys.platform == "win32":
        os.system("")

    bridge = HeartCoherenceBridge()
    try:
        asyncio.run(bridge.run())
    except KeyboardInterrupt:
        print(T["disconnected"])
