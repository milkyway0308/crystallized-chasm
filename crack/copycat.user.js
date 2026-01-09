// ==UserScript==
// @name         Chasm Crystallized CopyCat (결정화 캐즘 복사기)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-CCAT-v1.0.0
// @description  웹에 롱클릭 복사 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/copycat.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/copycat.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.13/decentralized-modal.js#sha256-tt5YRTDFPCoQwcSaw4d4QnjTytPbyVNLzM3g8rkdi8Q=
// @grant        GM_addStyle
// ==/UserScript==

// C-C-COPY THAT, COPYCAT!
(function () {
  // =====================================================
  //                  크랙 종속 유틸리티
  // =====================================================
  /**
   * 쿠키에서 액세스 토큰을 추출해 반환합니다.
   * @returns 액세스 토큰
   */
  function extractAccessToken() {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      if (key === "access_token") return value;
    }
    return null;
  }

  /**
   * 현재 URL이 스토리챗의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isStoryPath() {
    // 2025-09-17 Path
    return (
      /\/stories\/[a-f0-9]+\/episodes\/[a-f0-9]+/.test(location.pathname) ||
      // Legacy Path
      /\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)
    );
  }

  /**
   * 현재 URL이 캐릭터챗의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isCharacterPath() {
    return /\/characters\/[a-f0-9]+\/chats\/[a-f0-9]+/.test(location.pathname);
  }

  /**
   * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
   * @param {string} method 요청 메서드
   * @param {string} url 요청 URL
   * @param {any | undefined} body 요청 바디 파라미터
   * @returns {any | Error} 파싱된 값 혹은 오류
   */
  async function authFetch(method, url, body) {
    try {
      const param = {
        method: method,
        headers: {
          Authorization: `Bearer ${extractAccessToken()}`,
          "Content-Type": "application/json",
        },
      };
      if (body) {
        param.body = JSON.stringify(body);
      }
      const result = await fetch(url, param);
      if (!result.ok)
        return new Error(
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`
        );
      return await result.json();
    } catch (t) {
      return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
    }
  }
  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    copyBotMessage: true,
    copyUserMessage: true,
    copyPromptSection: true,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-ccat-settings");
    if (loadedSettings) {
      const json = JSON.parse(loadedSettings);
      for (let key of Object.keys(json)) {
        // Merge setting for version compatibility support
        settings[key] = json[key];
      }
    }
  }

  function saveSettings() {
    log("설정 저장중..");
    // Yay, no need to filtering anything!
    localStorage.setItem("chasm-ccat-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }
  // =================================================
  //                     메뉴
  // =================================================
  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 복사기", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addText(
          "경고: 해당 모듈은 메시지 길게 누르기로 인한 컨텍스트 메뉴 호출을 막습니다.\n예상치 못한 동작이 발생할 수 있습니다."
        );
        panel.addSwitchBox(
          "cntr-ccat-copy-user-prompt",
          "프롬프트 복사",
          "활성화시, 프롬프트 입력칸을 길게 클릭하면 메시지를 복사합니다.",
          {
            defaultValue: settings.copyPromptSection,
            action: (_, value) => {
              settings.copyPromptSection = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-ccat-copy-user-message",
          "유저 메시지 복사",
          "활성화시, 유저 메시지를 길게 클릭하면 메시지를 복사합니다.",
          {
            defaultValue: settings.copyUserMessage,
            action: (_, value) => {
              settings.copyUserMessage = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-ccat-copy-bot-message",
          "AI 메시지 복사",
          "활성화시, AI 메시지를 길게 클릭하면 메시지를 복사합니다.",
          {
            defaultValue: settings.copyBotMessage,
            action: (_, value) => {
              settings.copyBotMessage = value;
              saveSettings();
            },
          }
        );
      }, "결정화 캐즘 복사기");
    });
  }
  // =================================================
  //               스크립트 초기 실행
  // =================================================
  let lastPointed = undefined;
  let isCopyTriggered = false;
  let clickedTick = 0;

  function monitor() {
    if (lastPointed === undefined) return;
    if (clickedTick++ > 20) {
      lastPointed().then((message) => {
        if (message) {
          ToastifyInjector.findInjector().doToastifyAlert(message);
          try {
            navigator.vibrate(200);
          } catch (err) {}
        }
      });
      lastPointed = undefined;
      isCopyTriggered = true;
    }
  }

  /**
   *
   * @param {HTMLElement} element
   * @returns {() => Promise<string | undefined>}
   */
  function findValidPointerElement(element) {
    let base = element;
    while (base) {
      if (base.hasAttribute("data-message-group-id")) {
        const split = window.location.pathname.substring(1).split("/");
        const chatRoomId = split[3];
        const messageId = base.getAttribute("data-message-group-id");
        return async () => {
          const message = await authFetch(
            "GET",
            `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatRoomId}/messages/${messageId}`
          );

          if (message instanceof Error) {
            return "오류로 인해 메시지를 복사하지 못했어요.";
          } else {
            if (message.data.role === "assistant" && settings.copyBotMessage) {
              await navigator.clipboard.writeText(message.data.content);
            } else if (
              message.data.role === "user" &&
              settings.copyUserMessage
            ) {
              await navigator.clipboard.writeText(message.data.content);
            } else {
              return undefined;
            }
            return "메시지가 복사되었어요.";
          }
        };
      }
      if (
        settings.copyPromptSection &&
        base.tagName.toLowerCase() === "textarea" &&
        base.getAttribute("placeholder") === "메시지 보내기"
      ) {
        return async () => {
          await navigator.clipboard.writeText(base.value);
          return "작성중인 프롬프트가 복사되었어요.";
        };
      }
      base = base.parentElement;
    }
    return undefined;
  }

  function prepare() {
    document.addEventListener("mousedown", (event) => {
      if (!isCharacterPath() && !isStoryPath()) return;
      const clicked = document.elementFromPoint(event.pageX, event.pageY);
      const validElement = findValidPointerElement(clicked);
      isCopyTriggered = false;
      if (validElement) {
        lastPointed = validElement;
        clickedTick = 0;
      }
    });
    document.addEventListener("mouseup", () => {
      lastPointed = undefined;
    });
    document.addEventListener("touchstart", (event) => {
      if (!isCharacterPath() && !isStoryPath()) return;
      const clicked = document.elementFromPoint(
        event.touches[0].pageX,
        event.touches[0].pageY
      );
      const validElement = findValidPointerElement(clicked);
      if (validElement) {
        lastPointed = validElement;
        clickedTick = 0;
      }
    });
    document.addEventListener("touchend", () => {
      lastPointed = undefined;
    });
    document.addEventListener("touchcancel", () => {
      lastPointed = undefined;
    });
    document.addEventListener("contextmenu", (event) => {
      if (isCopyTriggered) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    setInterval(monitor, 100);
  }
  loadSettings();
  addMenu();
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
  // =================================================
  //                  메뉴 강제 추가
  // =================================================
  function __updateModalMenu() {
    const modal = document.getElementById("web-modal");
    if (modal && !document.getElementById("chasm-decentral-menu")) {
      const itemFound = modal.getElementsByTagName("a");
      for (let item of itemFound) {
        if (item.getAttribute("href") === "/setting") {
          const clonedElement = item.cloneNode(true);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("span")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          item.parentElement.append(clonedElement);
          break;
        }
      }
    } else if (
      !document.getElementById("chasm-decentral-menu") &&
      !window.matchMedia("(min-width: 768px)").matches
    ) {
      // Probably it's mobile, lets try scanning
      const selected = document.getElementsByTagName("a");
      for (const element of selected) {
        if (element.getAttribute("href") === "/my-page") {
          const clonedElement = element.cloneNode(true);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("span")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          element.parentElement.append(clonedElement);
        }
      }
    }
  }

  function __doModalMenuInit() {
    if (document.c2ModalInit) return;
    document.c2ModalInit = true;
    attachObserver(document, () => {
      __updateModalMenu();
    });
  }
  __doModalMenuInit();

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
})();
