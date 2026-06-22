/** True when running inside the packaged Electron desktop shell. */
export function isDesktopBuild(): boolean {
  return new URLSearchParams(window.location.search).get("desktop") === "1";
}
