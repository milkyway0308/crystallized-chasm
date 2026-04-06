import { CrackAttendApi } from "./crack/attend-util";
import { CrackComponentApi } from "./crack/component-util";
import { CrackCookieApi } from "./crack/cookie-util";
import { CrackCrackerApi } from "./crack/cracker-util";
import { CrackAddonModalApi } from "./crack/addon-modal-util";
import { CrackEnvironmentApi } from "./crack/environment-util";
import { CrackNetworkApi } from "./crack/network-util";
import { CrackPathApi } from "./crack/path-util";
import { CrackThemeApi } from "./crack/theme-util";
import { ToastifyInjector } from "./crack/toastify-util";
import { CrackSessionApi } from "./crack/session-util";

const componentApi = new CrackComponentApi();

/**
 * 크랙 출석 유틸리티를 반환합니다.
 * @returns 출석 유틸리티
 */
export function attend(): typeof CrackAttendApi {
  return CrackAttendApi;
}

/**
 * 크랙 페이지 환경 유틸리티를 반환합니다.
 * @returns 환경 유틸리티
 */
export function environment(): typeof CrackEnvironmentApi {
  return CrackEnvironmentApi;
}

/**
 * 크랙 페이지 컴포넌트 유틸리티를 반환합니다.
 * @returns 컴포넌트 유틸리티
 */
export function component(): CrackComponentApi {
  return componentApi;
}

/**
 * 크랙 쿠키 유틸리티를 반환합니다.
 * @returns 쿠키 유틸리티
 */
export function cookie(): typeof CrackCookieApi {
  return CrackCookieApi;
}

/**
 * 크랙 네트워크 유틸리티를 반환합니다.
 * @returns 네트워크 유틸리티
 */
export function network(): typeof CrackNetworkApi {
  return CrackNetworkApi;
}

/**
 * 크랙 테마 유틸리티를 반환합니다.
 * @returns 테마 유틸리티
 */
export function theme(): typeof CrackThemeApi {
  return CrackThemeApi;
}

/**
 * 크랙 경로 유틸리티를 반환합니다.
 * @returns 경로 유틸리티
 */
export function path(): typeof CrackPathApi {
  return CrackPathApi;
}

/**
 * 크랙 크래커 유틸리티를 반환합니다.
 * @returns 크래커 유틸리티
 */
export function cracker(): typeof CrackCrackerApi {
  return CrackCrackerApi;
}

/**
 * 크랙 세션(채팅방) 유틸리티를 반환합니다.
 * @returns 세션 유틸리티
 */
export function session(): typeof CrackSessionApi {
  return CrackSessionApi;
}

/**
 * 크랙 Toastify 관련 유틸리티를 반환합니다.
 * @returns Toastify 유틸리티
 */
export function toastify(): ToastifyInjector {
  return ToastifyInjector.findInjector();
}

export function addonModal(): typeof CrackAddonModalApi {
  return CrackAddonModalApi;
}


export * as CrackSdk from "./crack-sdk";
