import { Nullable } from "../../utils/generic-types";

/**
 * 크랙 쿠키 유틸리티 클래스입니다.
 */
export class CrackCookieApi {
  /**
   * 쿠키에서 대상 값을 가져와 반환합니다.
   * @param  key 쿠키 키
   * @returns 쿠키 값 혹은 null
   */
  getCookie(key: string): Nullable<string> {
    const e = document.cookie.match(new RegExp(`(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`));
    return e ? decodeURIComponent(e[1]) : null;
  }

  /**
   * 현재 페이지에 할당된 크랙 인증 토큰을 가져와 반환합니다.
   * 인증 토큰은 만료된 상태일 수 있습니다.
   * @returns 인증 토큰
   */
  getAuthToken(): Nullable<string> {
    return this.getCookie("access_token");
  }
}
