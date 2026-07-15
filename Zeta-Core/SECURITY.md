# Security Policy — Zeta-Core

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

Contact: **bramadna718@gmail.com**
Subject prefix: `[ZETA-CORE SECURITY]`

Include:

- Affected engine version (`v1.0-standard-core`, `v1.1-adaptive-engine`,
  `v2.0-spatial-multi-axis`).
- Reproduction steps and, where possible, a minimal signal fixture.
- Impact assessment (RCE / DoS / license-bypass / information disclosure).
- Whether the finding requires a valid license token or is exploitable
  pre-authentication.

Initial acknowledgement within 5 working days. Coordinated disclosure
window: 90 days from acknowledgement, extendable by mutual agreement.

## Scope

In scope:

- The compiled shared objects under `v*.*-*/` (`.so`).
- The reference Python wrapper `bindings/zeta_client.txt`.
- License token verification (`ZC1.<payload>.<signature>`).

Out of scope:

- Third-party runtime dependencies of client integrations (NumPy, glibc,
  operating system kernels).
- Denial-of-service caused by supplying obviously malformed input where the
  engine already returns error code `-1 INVALID_ARGS`.
- Findings against draft / documentation-only files under `docs/`.

## Hardening notes for integrators

- Load `.so` binaries with `RTLD_LOCAL` (default in the reference wrapper) to
  avoid symbol collisions with other native libraries.
- Do not log license tokens or the raw `output[]` buffer at INFO level.
- Rotate machine-bound tokens when replacing hardware; a bound token cannot
  be transferred and will return `-5 MACHINE_BINDING_FAILED`.
- Treat any non-zero return code from the C ABI as a hard failure — never
  proceed to use `output[]` if `rc != 0`.

## Cryptography

- License tokens are signed with HMAC-SHA256.
- The signing secret is stored inside each binary XOR-obfuscated with a
  rotating pad and reassembled only during verification.
- No client-supplied data is executed; the ABI accepts numeric arrays only.
