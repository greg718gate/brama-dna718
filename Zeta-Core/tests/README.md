# Zeta-Core tests

Two layers:

- `unit/` — reference-engine regression tests. Exercise the pure-Python
  reference implementation in `bindings/zeta_reference_engine.txt`. No
  licensed `.so` needed. Kept as `.txt` so GitHub does not treat them as
  runnable CI code — rename to `.py` locally to execute:

  ```
  cp bindings/zeta_reference_engine.txt /tmp/zeta_reference_engine.py
  cp tests/unit/test_reference_engine.txt /tmp/test_reference_engine.py
  PYTHONPATH=/tmp pytest /tmp/test_reference_engine.py -q
  ```

- `integration/` — tests the licensed `.so` binaries through the
  `ctypes` wrapper. Requires a valid license token in `ZETA_LICENSE`
  and the correct architecture (`x86_64` Linux). Not included in the
  public repo; shipped only to holders of a signed evaluation NDA.

## Golden fixtures

Golden expected values are captured with a fixed RNG seed
(`np.random.default_rng(0)`) and a fixed engine build tag. When the
DSP contract changes (see ADR-002, ADR-003), fixtures are re-frozen
against the reference engine and both the ADR and the CHANGELOG are
updated in the same commit — never independently.

## What is deliberately NOT tested here

- The HMAC signing secret and license-verifier internals. Those live
  inside the compiled binary and are covered by a private test suite
  that ships with the build toolchain, not the distribution.
