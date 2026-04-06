import { NodeUtil } from "../../utils/node-util";

type ToastedDocument = Document & { __toastifyInjector?: ToastifyInjector };

declare function GM_addStyle(css: string): void;

/**
 * 크랙 플랫폼의 Toastify 인젝션을 쉽게 해주는 유틸리티 클래스입니다.
 */
export class ToastifyInjector {
  /**
   * 마지막으로 등록된 인젝터를 가져오거나, 등록합니다.
   * @returns 등록된 인스턴스
   */
  static findInjector(): ToastifyInjector {
    const toastDoc = document as ToastedDocument;
    if (toastDoc.__toastifyInjector) {
      return toastDoc.__toastifyInjector;
    }
    toastDoc.__toastifyInjector = new ToastifyInjector();
    return toastDoc.__toastifyInjector;
  }

  /**
   * ToastifyInjector을 초기화합니다.
   */
  constructor() {
    this.init();
  }

  private init() {
    try {
      GM_addStyle(`
        .chasm-toastify-track {
            transform: translateY(-200%);
            transition: transform 0.4s;
        }

        .chasm-toastify-track[completed="true"] {
            transform: translateY(0);
            transition: transform 0.4s;
        }
    `);
    } catch (ex) {
      console.warn("!! WARNING !!");
      console.warn("!! WARNING !! GM_addStyle 콜에 실패하였습니다.\n브라우저가 아닌 환경에서 toastify-injection이 초기화되었을 가능성이 존재합니다.\n해당 환경에서는 toastify-injection.js가 오작동할 가능성이 존재합니다.");
    }
    setInterval(this.trackNotification, 50);
  }

  /**
   * 삽입된 알림 요소의 트래킹을 진행합니다.
   */
  private trackNotification(current: number = Date.now()) {
    const toastifies = document.getElementsByClassName("Toastify");
    if (toastifies.length <= 0) {
      return;
    }
    const rootNode = toastifies[0];
    const trackers = rootNode.getElementsByClassName("chasm-toastify-track");
    if (rootNode.childNodes.length > 0 && trackers.length != rootNode.childNodes.length) {
      Array.from(trackers).forEach((element) => {
        if (element.hasAttribute("completed")) {
          element.removeAttribute("completed");
          element.setAttribute("remove-at", `${current + 1000}`);
        }
      });
    }
    Array.from(trackers).forEach((element) => {
      const expireAt = parseInt(element.getAttribute("expires-at") ?? "0");
      if (expireAt < current && element.hasAttribute("completed")) {
        element.removeAttribute("completed");
        element.setAttribute("remove-at", `${current + 1000}`);
      } else if (expireAt < current) {
        element.remove();
      }
    });
  }

  /**
   * 알림 요소를 삽입합니다.
   * 해당 펑션으로 삽입된 알림은 기존 알림을 강제로 제거합니다.
   *
   * 해당 펑션은 크랙 스타일 알림을 생성합니다.
   * @param message 표시할 메시지
   * @param expires 유지 시간 (ms)
   */
  doToastifyAlert(message: string, expires: number = 3000) {
    const textNode = NodeUtil.setupParagraphNode({
      text: message,
      style: "color: #FFFFFF; text-align: center; font-size: 16px; line-height: 140%; font-weight: 600; white-space: pre-line;",
    });

    const containerNode = NodeUtil.setupNode("div", {
      style: "background-color: rgb(46, 45, 43); padding: 16px; border-radius: 10px; width: 100%; max-width: 95vw; height: 100%;",
      onInit: (node) => {
        node.append(textNode);
      },
    });

    const wrapperNode = NodeUtil.setupNode("div", {
      cls: "Toastify__toast-container Toastify__toast-container--top-center chasm-toastify-track",
      style: "background: transparent; min-width: 461px; min-height: 0px; height: fit-content; border-radius: 10px; justify-content: center; left: auto; justify-self: center;",
      onInit: (node) => {
        node.append(containerNode);
        node.setAttribute("expires-at", `${new Date().getTime() + expires}`);
      },
    });

    const toastifies = document.getElementsByClassName("Toastify");
    if (toastifies.length <= 0) {
      return;
    }
    if (toastifies.length > 0) {
      Array.from(toastifies[0].childNodes).forEach((element) => element.remove());
    }
    toastifies[0].append(wrapperNode);
    setTimeout(() => {
      wrapperNode.setAttribute("completed", "true");
    });
  }
}
