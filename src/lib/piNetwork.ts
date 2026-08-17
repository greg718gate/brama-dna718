/**
 * Pi Network integration placeholder (Pi App Studio → "Use External AI").
 *
 * IMPORTANT — current state:
 *  - No Pi SDK script is loaded yet.
 *  - No Pi authentication is implemented yet.
 *  - No Pi payments are implemented yet.
 *  - No API keys, secrets or tokens are stored in this repository.
 *
 * This module only exposes small, safe helpers so the integration prompt
 * generated later by Pi App Studio can be applied without refactoring the app.
 *
 * When the integration prompt arrives, the expected steps are:
 *  1. Load the official Pi SDK script in index.html.
 *  2. Call Pi.init({ version: "2.0", sandbox: <bool> }).
 *  3. Add Pi authentication (scopes provided by the prompt).
 *  4. Only then add payments, using a server-side (backend) approval/completion flow.
 */

/** True when the app is being rendered inside Pi Browser. */
export const isPiBrowser = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /PiBrowser/i.test(navigator.userAgent);
};

/** True once an official Pi SDK has been added to the page (not yet the case). */
export const isPiSdkAvailable = (): boolean =>
  typeof window !== "undefined" && typeof (window as unknown as { Pi?: unknown }).Pi !== "undefined";

/** Route of the app surface that will be registered in Pi App Studio. */
export const PI_APP_ROUTE = "/decoder";
