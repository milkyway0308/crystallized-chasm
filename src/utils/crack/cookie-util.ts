/**
 * 크랙 쿠키 유틸리티 클래스입니다.
 */
export class CrackCookieApi {
  /**
   * 쿠키에서 대상 값을 가져와 반환합니다.
   * @param  key 쿠키 키
   * @returns 쿠키 값 혹은 undefined
   */
  getCookie(key: string): string | undefined {
    const e = document.cookie.match(new RegExp(`(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`));
    return e ? decodeURIComponent(e[1]) : undefined;
  }

  /**
   * 현재 페이지에 할당된 크랙 인증 토큰을 가져와 반환합니다.
   * 인증 토큰은 만료된 상태일 수 있습니다.
   * @returns 인증 토큰
   */
  getAuthToken(): string {
    const token = this.getCookie("access_token");
    if (!token) {
      throw new Error("쿠키에 인증 토큰이 없습니다.");
    }
    return token;
  }
}
