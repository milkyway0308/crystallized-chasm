import { CrackAttendApi } from "./crack/attend-util";
import { CrackComponentApi } from "./crack/component-util";
import { CrackCookieApi } from "./crack/cookie-util";
import { CrackCrackerApi } from "./crack/cracker-util";
import { CrackEnvironmentUtil as CrackEnvironmentApi } from "./crack/environment-util";
import { CrackNetworkApi } from "./crack/network-util";
import { CrackPathApi } from "./crack/path-util";
import { CrackThemeApi } from "./crack/theme-util";

export class CrackSdk {
  static readonly cookieApi = new CrackCookieApi();
  static readonly themeApi = new CrackThemeApi();
  static readonly pathApi = new CrackPathApi();
  static readonly environmentApi = new CrackEnvironmentApi();
  static readonly componentApi = new CrackComponentApi();
  static readonly networkApi = new CrackNetworkApi(this.cookieApi);
  static readonly attendApi = new CrackAttendApi(this.networkApi);
  static readonly crackerApi = new CrackCrackerApi(this.networkApi);

  /**
   * 크랙 출석 유틸리티를 반환합니다.
   * @returns 출석 유틸리티
   */
  static attend(): CrackAttendApi {
    return this.attendApi;
  }

  /**
   * 크랙 페이지 환경 유틸리티를 반환합니다.
   * @returns 환경 유틸리티
   */
  static environment(): CrackEnvironmentApi {
    return this.environmentApi;
  }

  /**
   * 크랙 페이지 컴포넌트 유틸리티를 반환합니다.
   * @returns 컴포넌트 유틸리티
   */
  static component(): CrackComponentApi {
    return this.componentApi;
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

  /**
   * 크랙 경로 유틸리티를 반환합니다.
   * @returns 경로 유틸리티
   */
  static path(): CrackPathApi {
    return this.pathApi;
  }

  /**
   * 크랙 크래커 유틸리티를 반환합니다.
   * @returns 크래커 유틸리티
   */
  static cracker(): CrackCrackerApi {
    return this.crackerApi;
  }
}
