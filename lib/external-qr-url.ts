/**
 * Parse a scanned QR payload into an external web link.
 *
 * Returns null for anything that is not an http(s) URL — other schemes
 * (intent:, javascript:, file: …) must never be handed to the browser.
 *
 * Opening is deliberately NOT done here: a scan settles asynchronously, so a
 * window.open() at that point is outside a user gesture and iOS Safari / the
 * Tang Rat WebView block it. Callers show a confirmation dialog and open from
 * the click handler, which also stops a QR code from silently navigating a
 * government app to an attacker's page.
 */
export function parseExternalQrUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

/** Open a link that the user has just confirmed. Call from a click handler. */
export function openConfirmedExternalUrl(url: URL) {
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
