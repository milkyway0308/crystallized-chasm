import { Runnable } from "./generic-types";

export class ObserverUtil {
  /**
   * 지정한 노드 혹은 요소에 변경 옵저버를 등록합니다.
   * @param observeTarget 변경 감지 대상
   * @param lambda 실행할 람다
   */
  static attachObserver(observeTarget: Node, lambda: Runnable) {
    const Observer = window.MutationObserver || (window as any).WebKitMutationObserver;
    if (observeTarget && Observer) {
      let instance = new Observer(lambda);
      instance.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  }

  /**
   * 지정한 노드 혹은 요소에 URL 변동 감지성 변경 옵저버를 등록합니다.
   * 이 펑션으로 등록된 옵저버는 이전과 현재 URL이 다를때만 작동합니다.
   * @param node 변경 감지 대상
   * @param lambda 실행할 람다
   */
  static attachHrefObserver(node: Node, lambda: Runnable) {
    let oldHref = location.href;
    this.attachObserver(node, () => {
      if (oldHref !== location.href) {
        oldHref = location.href;
        lambda();
      }
    });
  }

  /**
   * 페이지가 준비되면 제공된 람다 펑션이 실행되도록 설정합니다.
   * @param {() => any} runner 실행될 람다 펑션
   */
  static onPageReady(runner: Runnable) {
    ("loading" === document.readyState ? document.addEventListener("DOMContentLoaded", runner) : runner(), window.addEventListener("load", runner));
  }
}
