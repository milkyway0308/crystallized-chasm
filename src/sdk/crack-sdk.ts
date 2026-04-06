import { CrackAttendApi } from "./crack/attend-util";
import { CrackCookieApi } from "./crack/cookie-util";
import { CrackNetworkApi } from "./crack/network-util";
import { CrackThemeApi } from "./crack/theme-util";

export class CrackSdk {
  static readonly cookieApi = new CrackCookieApi();
  static readonly networkApi = new CrackNetworkApi(this.cookieApi);
  static readonly attendApi = new CrackAttendApi(this.networkApi);
  static readonly themeApi = new CrackThemeApi();

  /**
   * 크랙 출석 유틸리티를 반환합니다.
   * @returns 출석 유틸리티
   */
  static attend(): CrackAttendApi {
    return this.attendApi;
  }

  /**
   * 크랙 쿠키 유틸리티를 반환합니다.
   * @returns 쿠키 유틸리티
   */
  static cookie(): CrackCookieApi {
    return this.cookieApi;
  }

  /**
   * 크랙 네트워크 유틸리티를 반환합니다.
   * @returns 네트워크 유틸리티
   */
  static network(): CrackNetworkApi {
    return this.networkApi;
  }

  /**
   * 크랙 테마 유틸리티를 반환합니다.
   * @returns 테마 유틸리티
   */
  static theme(): CrackThemeApi {
    return this.themeApi;
  }
}
