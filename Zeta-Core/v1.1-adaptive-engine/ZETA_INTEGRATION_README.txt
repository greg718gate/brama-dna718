===========================================================================================
ZETA-CORE v1.1 ADAPTIVE ENGINE — INTEGRATION GUIDE
PRODUCT FORMAT: Stripped native ELF shared object (.so)
COMPILER: GCC, -O2 -fPIC -fvisibility=hidden -Wl,--strip-all
EXPORTED SYMBOLS: run_zeta_diagnostic  (single gate; all other symbols are local)

1. PUBLIC ABI

int run_zeta_diagnostic(
        const double* input,        // raw time-series (mono, PCM double)
        double*       output,       // caller-allocated buffer, >= 8 doubles
        int           length,       // number of samples
        int           sample_rate,  // Hz
        double        target_freq,  // Hz (nominal rotational / carrier freq)
        const char*   license_key   // signed license token, format "ZC1.xxx.yyy"
);

Return codes:
    0 = OK
   -1 = invalid input arguments
   -2 = malformed license token
   -3 = signature mismatch (tampered / wrong secret)
   -4 = license expired
   -5 = machine binding failed
   -6 = product mismatch (this token is not for v1.1)
   -7 = required feature bit not licensed

Output buffer on success:
    output[0] = phase coherence  (0..1)
    output[1] = topological friction Tf  (0..1)
    output[2] = fault condensation Mc    (0..1)
    output[3] = adaptive tracked frequency (Hz)

2. QUICK-START (Python / ctypes)

import ctypes
lib = ctypes.CDLL("./ZETA-CORE_v1.1.so")
lib.run_zeta_diagnostic.restype  = ctypes.c_int
lib.run_zeta_diagnostic.argtypes = [
    ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double),
    ctypes.c_int, ctypes.c_int, ctypes.c_double, ctypes.c_char_p ]

LICENSE = b"ZC1.<payload>.<sig>"        # provided by Zeta-Core support
signal  = (ctypes.c_double * n)(*samples)
out     = (ctypes.c_double * 8)()

rc = lib.run_zeta_diagnostic(signal, out, n, 44100, 150.0, LICENSE)
assert rc == 0, f"Zeta-Core error {rc}"

print("coherence:", out[0], "Tf:", out[1], "Mc:", out[2], "f_tracked:", out[3])

3. NOTES
- License token is a plain ASCII string, safe for email / config files.
- Filter state is per-process; call the engine from a single thread per stream.
- For streaming windows, feed contiguous chunks — bandpass state is preserved.

===========================================================================================
SUPPORT: contact@zeta-core-dns.com | REGION: ABERDEEN, UK
