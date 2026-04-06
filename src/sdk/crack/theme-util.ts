function isDarkTheme() {
  return document.body.getAttribute("data-theme") === "dark";
}

function isLightTheme() {
  return !isDarkTheme();
}

export const CrackThemeApi = {
  isDarkTheme,
  isLightTheme,
} as const;
