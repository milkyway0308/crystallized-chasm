function isDesktop(): boolean {
  return window.matchMedia("(min-width: 768px)").matches;
}

function isMobile(): boolean {
  return !isDesktop();
}
export const CrackEnvironmentUtil = {
  isDesktop,
  isMobile,
} as const;
