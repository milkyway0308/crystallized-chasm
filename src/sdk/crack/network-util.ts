import { fail, Result, success } from "../../utils/flow-handler";
import { CrackCookieApi } from "./cookie-util";

export class HttpError extends Error {
  constructor(message: string, public readonly code: number) {
    super(message);
    this.code = code;
  }
}

/**
 * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
 * @param  method 요청 메서드
 * @param  url 요청 URL
 * @param  body 요청 바디 파라미터
 * @returns 파싱된 값 혹은 오류
 */
async function authFetch<T = any>(method: string, url: string, body?: any): Promise<Result<T>> {
  try {
    const param: RequestInit = {
      method: method,
      headers: {
        Authorization: `Bearer ${CrackCookieApi.getAuthToken()}`,
        "Content-Type": "application/json",
      },
    };
    if (body) {
      param.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    const result = await fetch(url, param);
    if (!result.ok) {
      return fail(new HttpError(await result.text(), result.status));
    }
    return success((await result.json()) as T);
  } catch (t) {
    return fail(new Error(`알 수 없는 오류 (${t instanceof Error ? t.message : JSON.stringify(t)})`, { cause: t }));
  }
}

export const CrackNetworkApi = {
  authFetch,
} as const;
