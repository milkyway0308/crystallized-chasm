import { fail, Result, success } from "../../utils/flow-handler";
import { CrackCookieApi } from "./cookie-util";

export interface HttpError extends Error {
  code: number;
}

export interface HttpErrorConstructor {
  new (message: string, code: number): HttpError;
}

declare var HttpError: HttpErrorConstructor;

/**
 * 크랙 네트워크 통신용 클래스입니다.
 */
export class CrackNetworkApi {
  /**
   * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
   * @param  method 요청 메서드
   * @param  url 요청 URL
   * @param  body 요청 바디 파라미터
   * @returns 파싱된 값 혹은 오류
   */
  async authFetch<T = any>(method: string, url: string, body?: any): Promise<Result<T>> {
    try {
      const param: RequestInit = {
        method: method,
        headers: {
          Authorization: `Bearer ${CrackCookieApi.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      };
      if (body) {
        param.body = JSON.stringify(body);
      }
      const result = await fetch(url, param);
      if (!result.ok) {
        const errorItem = new Error();
        Object.assign(errorItem, { code: result.status });
        return fail(new HttpError(await result.text(), result.status));
      }
      return success((await result.json()) as T);
    } catch (t) {
      return fail(new Error(`알 수 없는 오류 (${t instanceof Error ? t.message : JSON.stringify(t)})`, { cause: t }));
    }
  }
}
