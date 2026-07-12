export function openExternalQrUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;

    const tab = window.open(url.toString(), "_blank", "noopener,noreferrer");
    return tab !== null;
  } catch {
    return false;
  }
}
