// ==UserScript==
// @name         Chasm Crystallized CopyCat (결정화 캐즘 복사기)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-CCAT-v1.1.0
// @description  웹에 롱클릭 복사 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/copycat.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/copycat.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-toastify-injection@v1.0.0/crack/libraries/toastify-injection.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.0.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==

// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />
// C-C-COPY THAT, COPYCAT!
(function () {
  // =====================================================
  //                      설정
  // =====================================================
  const settings = new LocaleStorageConfig("chasm-ccat-settings", {
    copyBotMessage: true,
    copyUserMessage: true,
    copyPromptSection: true,
  });
  // =================================================
  //                     메뉴
  // =================================================
  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 복사기", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addText(
          "경고: 해당 모듈은 메시지 길게 누르기로 인한 컨텍스트 메뉴 호출을 막습니다.\n예상치 못한 동작이 발생할 수 있습니다.",
        );
        panel.addSwitchBox(
          "cntr-ccat-copy-user-prompt",
          "프롬프트 복사",
          "활성화시, 프롬프트 입력칸을 길게 클릭하면 메시지를 복사합니다.",
          {
            defaultValue: settings.config.copyPromptSection,
            onChange: (_, value) => {
              settings.config.copyPromptSection = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "cntr-ccat-copy-user-message",
          "유저 메시지 복사",
          "활성화시, 유저 메시지를 길게 클릭하면 메시지를 복사합니다.",
          {
            defaultValue: settings.config.copyUserMessage,
            onChange: (_, value) => {
              settings.config.copyUserMessage = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "cntr-ccat-copy-bot-message",
          "AI 메시지 복사",
          "활성화시, AI 메시지를 길게 클릭하면 메시지를 복사합니다.",
          {
            defaultValue: settings.config.copyBotMessage,
            onChange: (_, value) => {
              settings.config.copyBotMessage = value;
              settings.save();
            },
          },
        );
      }, "결정화 캐즘 복사기");
    });
  }
  // =================================================
  //               스크립트 초기 실행
  // =================================================
  /** @type {(() => Promise<string | undefined>) | undefined} */
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
   * @param {Element} element
   * @returns {(() => Promise<string | undefined>) | undefined}
   */
  function findValidPointerElement(element) {
    /** @type {Element | null} */
    let base = element;
    while (base) {
      if (base.hasAttribute("data-message-group-id")) {
        const split = window.location.pathname.substring(1).split("/");
        const chatRoomId = split[3];
        const messageId = base.getAttribute("data-message-group-id");
        return async () => {
          if (!messageId) {
            return "크랙의 업데이트로 인해 메시지 가져오기가 비활성화되었어요.\n지원 채널에 제보해주시면 빠르게 수정될 예정이예요.";
          }
          const message = await CrackUtil.chatRoom().getMessage(
            chatRoomId,
            messageId,
          );
          if (message instanceof Error) {
            return "오류로 인해 메시지를 복사하지 못했어요.";
          } else {
            if (message.isBot() && settings.config.copyBotMessage) {
              await navigator.clipboard.writeText(message.content);
            } else if (message.isUser() && settings.config.copyUserMessage) {
              await navigator.clipboard.writeText(message.content);
            } else {
              return undefined;
            }
            return "메시지가 복사되었어요.";
          }
        };
      }
      if (
        settings.config.copyPromptSection &&
        base.tagName.toLowerCase() === "textarea" &&
        base.getAttribute("placeholder") === "메시지 보내기"
      ) {
        return async () => {
          await navigator.clipboard.writeText(GenericUtil.refine(base).value);
          return "작성중인 프롬프트가 복사되었어요.";
        };
      }
      base = base.parentElement;
    }
    return undefined;
  }

  function prepare() {
    document.addEventListener("mousedown", (event) => {
      if (!CrackUtil.path().isChattingPath()) return;
      const clicked = document.elementFromPoint(event.pageX, event.pageY);
      if (!clicked) return;
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
      if (!CrackUtil.path().isChattingPath()) return;
      const clicked = document.elementFromPoint(
        event.touches[0].pageX,
        event.touches[0].pageY,
      );
      if (!clicked) return;
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
  settings.load();
  addMenu();
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare));

  // =================================================
  //                  메뉴 강제 추가
  // =================================================
  function __updateModalMenu() {
    const modal = document.getElementById("web-modal");
    if (modal && !document.getElementById("chasm-decentral-menu")) {
      const itemFound = modal.getElementsByTagName("a");
      for (let item of itemFound) {
        if (item.getAttribute("href") === "/setting") {
          const clonedElement = GenericUtil.clone(item);
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
          item.parentElement?.append(clonedElement);
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
          const clonedElement = GenericUtil.clone(element);
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
          element.parentElement?.append(clonedElement);
        }
      }
    }
  }

  function __doModalMenuInit() {
    const refined = GenericUtil.refine(document);
    if (refined.c2ModalInit) return;
    refined.c2ModalInit = true;
    GenericUtil.attachObserver(document, () => {
      __updateModalMenu();
    });
  }
  __doModalMenuInit();
})();
