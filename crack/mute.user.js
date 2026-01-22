/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized Mute (결정화 캐즘 뮤트)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-MUTE-v1.2.0
// @description  TTS 버튼 제거. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/mute.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/mute.user.js
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

// @ts-ignore
GM_addStyle(`
  .chasm-mute-disabled {
    display: none !important;
  }  
`);
(function () {
  const logger = new LogUtil("Chasm Crystallized Mute", false);
  // =====================================================
  //                      설정
  // =====================================================
  const settings = new LocaleStorageConfig("chasm-mute-settings", {
    enableStoryMute: true,
    enableCharacterMute: true,
  });

  function isCharacterMuteEnabled() {
    return settings.config.enableCharacterMute && CrackUtil.path().isCharacterPath();
  }

  function isStoryMuteEnabled() {
    return settings.config.enableStoryMute && CrackUtil.path().isStoryPath();
  }

  // =====================================================
  //                      로직
  // =====================================================
  let __updating = false;

  /**
   * 현재 페이지에서 캐즘 뮤트가 적용되지 않은 TTS 버튼을 확인하고, 제거합니다.
   */
  function check() {
    if (__updating) return;
    try {
      __updating = true;
      const dropdown = document.querySelector(
        "div[data-radix-popper-content-wrapper] div[data-radix-menu-content]",
      );
      if (dropdown && dropdown.childNodes.length > 0) {
        for (let button of dropdown.childNodes) {
          const buttonText = button.childNodes[button.childNodes.length - 1];
          if (buttonText && buttonText.textContent === "목소리 재생") {
            button.remove();
            break;
          }
        }
      }
      const elements = document.querySelectorAll(
        ".css-n55rwb .css-1bamzls :not(.chasm-mute-disabled)",
      );
      if (!elements || elements.length <= 0) {
        return;
      }
      for (let element of elements) {
        if (!element.classList.contains("chasm-mute-disabled")) {
          element.classList.add(".chasm-mute-disabled");
          const emptyDiv = document.createElement("div");
          emptyDiv.classList.add("chasm-mute-placeholder");
          GenericUtil.refine(element.parentElement).insertBefore(emptyDiv, element);
        }
      }
    } finally {
      __updating = false;
    }
  }

  function prepare() {
    if (isCharacterMuteEnabled() || isStoryMuteEnabled()) {
      check();
    }
    GenericUtil.attachObserver(document, () => {
      if (isCharacterMuteEnabled() || isStoryMuteEnabled()) {
        check();
      }
    });
  }

  // =====================================================
  //                       초기화
  // =====================================================
  settings.load();
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare));

  // =====================================================
  //                     설정 메뉴
  // =====================================================
  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 뮤트", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addSwitchBox(
          "story-mute-enabled",
          "스토리 TTS 버튼 제거",
          "스토리 작품에서 TTS 버튼을 제거할지의 여부입니다.",
          {
            defaultValue: settings.config.enableStoryMute,
            onChange: (_, value) => {
              settings.config.enableStoryMute = value;
              settings.save();
            },
          },
        );

        panel.addSwitchBox(
          "character-mute-enabled",
          "캐릭터 TTS 버튼 제거",
          "캐릭터 작품에서 TTS 버튼을 제거할지의 여부입니다.",
          {
            defaultValue: settings.config.enableCharacterMute,
            onChange: (_, value) => {
              settings.config.enableCharacterMute = value;
              settings.save();
            },
          },
        );
      }, "결정화 캐즘 뮤트");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 뮤트");
      panel.addText(
        "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)",
      );
    });
  }
  addMenu();


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
