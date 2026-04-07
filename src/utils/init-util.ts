import { Runnable } from "./generic-types";

declare function GM_addStyle(css: string): void;
export class BrowserInitUtil {
  /**
   * 브라우저 환경일 경우, 펑션이 실행되도록 구성합니다.
   * @param runner 초기화 펑션
   */
  static init(runner: Runnable) {
    if (typeof document !== "undefined") {
      runner();
    }
  }

  /**
   * 페이지가 준비되었을 때 펑션이 실행되도록 구성합니다.
   * 이 펑션은 BrowserInitUtil.init과 같이 사용하는 것을 권장합니다.
   * @param runner 초기화 펑션
   * @see BrowserInitUtil.init
   */
  static onPagePrepare(runner: Runnable) {
    let executed = false;
    const singleExecutionLambda = () => {
      if (executed) return;
      executed = true;
      runner();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", singleExecutionLambda);
    } else {
      singleExecutionLambda();
    }
    window.addEventListener("load", singleExecutionLambda);
  }

  /**
   * GM_addStyle이 존재할 때만 실행하도록 안전하게 스타일을 추가합니다.
   * @param style CSS 스타일시트
   * @returns 추가 성공 여부
   */
  static callGMAddStyle(style: string): boolean {
    if (typeof GM_addStyle !== "undefined") {
      GM_addStyle(style);
      return true;
    }
    return false;
  }
}
