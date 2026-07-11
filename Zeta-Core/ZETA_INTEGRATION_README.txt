===========================================================================================
ZETA-CORE INDUSTRIAL DIAGNOSTIC ENGINE v1.2 — INTEGRATION GUIDE
PRODUCT FORMAT: Compiled Python Bytecode (.pyc)
ARCHITECTURE COMPATIBILITY: Cross-platform (Windows / Linux Gateway Environments)
DEPENDENCIES: numpy, scipy (Standard Industrial Stack)

1. OVERVIEW
The ZETA-CORE engine is delivered as a pre-compiled bytecode binary (ZetaCoreEngine.pyc).
It encapsulates the proprietary Hilbert-Phase Topological Friction Analysis (HPTFA) algorithm.
This architecture functions as a closed "black box" – allowing full runtime integration
while completely protecting the core mathematical properties from source code exposure.

1. QUICK START / INTEGRATION CODE SNIPPET
To verify the engine using your own raw time-series sensor data, place the 'ZetaCoreEngine.pyc'
file into your working project directory and execute the following Python interface call:

───

import numpy as np
import ZetaCoreEngine

1. Initialize the diagnostic engine with your hardware sampling rate (e.g., 44100 Hz)
sensor_sample_rate = 44100
engine = ZetaCoreEngine.ZetaDiagnosticEngine(sample_rate=sensor_sample_rate)

2. Load your raw, unfiltered vibration time-series data (Must be a 1D NumPy array)
Example: raw_vibration_stream = np.loadtxt("your_bearing_data.csv")
raw_vibration_stream = np.random.normal(0, 1, 220500) # Replace with actual sensor vector

3. Define the operational baseline frequency of the rotating component (e.g., 150.0 Hz)
target_frequency = 150.0

4. Set paths for the automated forensic text report and phase-drift profile CSV output
txt_report_path = "C:/Users/grzeg/ZETA_ENGINEERING_REPORT.txt"
csv_profile_path = "C:/Users/grzeg/ZETA_PHASE_PROFILE.csv"

5. Execute the HPTFA core analysis
metrics = engine.analyze_and_export_report(
raw_signal=raw_vibration_stream,
target_freq=target_frequency,
output_txt=txt_report_path,
output_csv=csv_profile_path
)

6. Retrieve real-time matrix metrics for dashboard integration
print(f"Matrix Phase Coherence: {metrics['coherence_pct']:.4f}%")
print(f"Topological Friction (Tf): {metrics['topological_friction_pct']:.4f}%")
print(f"System Classification: {metrics['status']} [{metrics['severity']}]")

1. INPUT/OUTPUT CONTRACT
• Input 'raw_signal': 1D NumPy array containing sequential floating-point amplitude data.
• Input 'target_freq': Float value indicating the specific frequency element to track.
• Return Structure: Python Dictionary containing core parameters for instant GUI,
SCADA, or cloud telemetry dashboard plotting.

===========================================================================================
DEVELOPMENT STATUS: STABLE | CORE SECURITY: VERIFIED ZERO-PHASE | REGION: ABERDEEN, UK