/**
 * 크랙 테마 관련 유틸리티입니다.
 */
export class CrackThemeApi {
  isDarkTheme() {
    return document.body.getAttribute("data-theme") === "dark";
  }
  isLightTheme() {
    return !this.isDarkTheme();
  }
}
