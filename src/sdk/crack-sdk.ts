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
import { CrackSessionFetcherApi } from "./crack/session-fetcher-util";
import { CrackNotificationApi } from "./crack/notification-util";
import { CrackStoryApi } from "./crack/story-util";
import { CrackSummaryApi } from "./crack/summary-util";

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
export function pageComponent(): typeof CrackComponentApi {
  return CrackComponentApi;
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
export function sessionFetcher(): typeof CrackSessionFetcherApi {
  return CrackSessionFetcherApi;
}

/**
 * 크랙 알림 유틸리티를 반환합니다.
 * @returns 알림 유틸리티
 */
export function notification(): typeof CrackNotificationApi {
  return CrackNotificationApi;
}

/**
 * 크랙 스토리 유틸리티를 반환합니다.
 * @returns 스토리 유틸리티
 */
export function story(): typeof CrackStoryApi {
  return CrackStoryApi;
}


/**
 * 크랙 장기기억 관련 유틸리티를 반환합니다.
 * @returns 스토리 유틸리티
 */
export function summary(): typeof CrackSummaryApi {
  return CrackSummaryApi;
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
