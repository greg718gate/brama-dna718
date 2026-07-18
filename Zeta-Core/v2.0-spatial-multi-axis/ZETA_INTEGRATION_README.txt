===========================================================================================
ZETA-CORE v2.0 SPATIAL MULTI-AXIS — INTEGRATION GUIDE
PRODUCT FORMAT: Stripped native ELF shared object (.so)
EXPORTED SYMBOLS: run_zeta_spatial  (single gate)

1. PUBLIC ABI

int run_zeta_spatial(
        const double* input,        // interleaved [x0,y0,z0, x1,y1,z1, ...]
        double*       output,       // caller-allocated, >= 8 doubles
        int           n_samples,    // samples per axis
        int           sample_rate,  // Hz
        double        target_freq,  // Hz
        const char*   license_key   // "ZC1.xxx.yyy"
);

Return codes:  same as v1.1 (0, -1..-7).

Output buffer on success:
    output[0..2] = per-axis coherence (X, Y, Z)
    output[3..5] = per-axis Tf
    output[6]    = global spatial friction  ||Tf||_2 / sqrt(3)
    output[7]    = target_freq

Required license features: CORE (0x0001) + SPATIAL (0x0002).

2. QUICK-START (Python / ctypes)

import ctypes
lib = ctypes.CDLL("./ZETA-CORE_v2.0.so")
lib.run_zeta_spatial.restype  = ctypes.c_int
lib.run_zeta_spatial.argtypes = [
    ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double),
    ctypes.c_int, ctypes.c_int, ctypes.c_double, ctypes.c_char_p ]

# n_samples per axis; buffer length = n_samples * 3
buf = (ctypes.c_double * (n*3))(*interleaved_xyz)
out = (ctypes.c_double * 8)()
rc  = lib.run_zeta_spatial(buf, out, n, 44100, 150.0, LICENSE)

===========================================================================================
SUPPORT: contact@zeta-core-dsp.com
