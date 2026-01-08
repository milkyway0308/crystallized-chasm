// toastify-injection.js - 크랙 Toastify 알림 인젝션

// =====================================================
//                 Toastify Injection
// =====================================================
/**
 * 크랙 플랫폼의 Toastify 인젝션을 쉽게 해주는 유틸리티 클래스입니다.
 */
class ToastifyInjector {
  /**
   * 마지막으로 등록된 인젝터를 가져오거나, 등록합니다.
   * @returns {ToastifyInjector} 등록된 인스턴스
   */
  static findInjector() {
    if (document.__toastifyInjector) {
      return document.__toastifyInjector;
    }
    document.__toastifyInjector = new ToastifyInjector();
    return document.__toastifyInjector;
  }

  /**
   * ToastifyInjector을 초기화합니다.
   */
  constructor() {
    super();
    this.#init();
  }

  /**
   * 삽입된 알림 요소의 트래킹을 진행합니다.
   */
  #trackNotification() {
    const current = new Date().getTime();
    const toastifies = document.getElementsByClassName("Toastify");
    if (toastifies.length <= 0) {
      return;
    }
    const rootNode = toastifies[0];
    if (rootNode.childNodes.length > 0) {
      if (
        rootNode.getElementsByClassName("chasm-toastify-track").length !=
        rootNode.childNodes.length
      ) {
        for (const element of Array.from(
          rootNode.getElementsByClassName("chasm-toastify-track")
        )) {
          if (element.hasAttribute("completed")) {
            element.removeAttribute("completed");
            element.removeAt = current + 1000;
          }
        }
      }
    }
    for (const element of rootNode.getElementsByClassName(
      "chasm-toastify-track"
    )) {
      if (element.expireAt < current && element.hasAttribute("completed")) {
        element.removeAttribute("completed");
        element.removeAt = current + 1000;
      } else if (element.removeAt < current) {
        element.remove();
      }
    }
  }
  #init() {
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

    setInterval(this.#trackNotification, 50);
  }

  /**
   * 알림 요소를 삽입합니다.
   * 해당 펑션으로 삽입된 알림은 기존 알림을 강제로 제거합니다.
   *
   * 해당 펑션은 크랙 스타일 알림을 생성합니다.
   * @param {string} message 표시할 메시지
   * @param {number} expires 유지 시간 (ms)
   */
  doToastifyAlert(message, expires = 3000) {
    const textNode = document.createElement("p");
    textNode.textContent = message;
    textNode.style =
      "color: #FFFFFF; text-align: center; font-size: 16px; line-height: 140%; font-weight: 600; white-space: pre-line;";

    const containerNode = document.createElement("div");
    containerNode.style =
      "background-color: rgb(46, 45, 43); padding: 16px; border-radius: 10px; width: 100%; max-width: 95vw; height: 100%;";

    containerNode.append(textNode);

    const wrapperNode = document.createElement("div");
    wrapperNode.className =
      "Toastify__toast-container Toastify__toast-container--top-center chasm-toastify-track";
    wrapperNode.style.cssText =
      "background: transparent; min-width: 461px; min-height: 0px; height: fit-content; border-radius: 10px; justify-content: center; left: auto; justify-self: center;";
    wrapperNode.append(containerNode);

    wrapperNode.expireAt = new Date().getTime() + expires;

    const toastifies = document.getElementsByClassName("Toastify");
    if (toastifies.length <= 0) {
      return;
    }
    if (toastifies.length > 0) {
      for (const element of Array.from(toastifies[0].childNodes)) {
        element.remove();
      }
    }
    const rootNode = toastifies[0];
    rootNode.append(wrapperNode);
    setTimeout(() => {
      wrapperNode.setAttribute("completed", "true");
    });
  }
}
