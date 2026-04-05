import { CrackCookieApi } from "./cookie-util";

/**
 * 크랙 네트워크 통신용 클래스입니다.
 */
export class CrackNetworkApi {
  private readonly cookieApi: CrackCookieApi;

  constructor(cookie: CrackCookieApi) {
    this.cookieApi = cookie;
  }

  /**
   * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
   * @param  method 요청 메서드
   * @param  url 요청 URL
   * @param  body 요청 바디 파라미터
   * @returns 파싱된 값 혹은 오류
   */
  async authFetch(method: string, url: string, body?: any): Promise<(Error & { code: number }) | any> {
    try {
      const param: RequestInit = {
        method: method,
        headers: {
          Authorization: `Bearer ${this.cookieApi.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: undefined,
      };
      if (body) {
        param.body = JSON.stringify(body);
      }
      const result = await fetch(url, param);
      if (!result.ok) {
        const errorItem = new Error(`HTTP 요청 실패 (${result.status}) [${await result.json()}]`);
        Object.assign(errorItem, { code: result.status });
        return errorItem;
      }
      return await result.json();
    } catch (t) {
      if (t instanceof Error) {
        return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
      }
    }
  }
}
