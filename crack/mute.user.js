/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized Mute (결정화 캐즘 뮤트)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-MUTE-v1.1.12p
// @description  TTS 버튼 제거. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/mute.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/mute.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.11/decentralized-modal.js
// @grant       GM_addStyle
// ==/UserScript==
GM_addStyle(`
  .chasm-mute-disabled {
    display: none !important;
  }  
`);
(function () {
  // =====================================================
  //                     유틸리티
  // =====================================================

  function attachObserver(observeTarget, lambda) {
    const Observer = window.MutationObserver || window.WebKitMutationObserver;
    if (observeTarget && Observer) {
      let instance = new Observer(lambda);
      instance.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  }

  function log(message) {
    console.log(
      "%cChasm Crystallized Mute: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  // =====================================================
  //                  크랙 종속 유틸리티
  // =====================================================

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
   * 현재 크랙의 테마가 다크 모드인지 반환합니다.
   * @returns 다크 모드가 적용되었는지의 여부
   */
  function isDarkMode() {
    return document.body.getAttribute("data-theme") === "dark";
  }
  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    enableStoryMute: true,
    enableCharacterMute: true,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-mute-settings");
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
    localStorage.setItem("chasm-mute-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }

  function isCharacterMuteEnabled() {
    return settings.enableCharacterMute && isCharacterPath();
  }

  function isStoryMuteEnabled() {
    return settings.enableStoryMute && isStoryPath();
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
      const dropdown = document.querySelector("div[data-radix-popper-content-wrapper] div[data-radix-menu-content]");
      if (dropdown && dropdown.childNodes.length > 0) {
        for (let button of dropdown.childNodes) {
          const buttonText = button.childNodes[button.childNodes.length - 1];
          console.log(buttonText.innerText);
          if (
            buttonText &&
            buttonText.textContent === "목소리 재생"
          ) {
            button.remove();
            break;
          }
        }
      }
      const elements = document.querySelectorAll(
        ".css-n55rwb .css-1bamzls :not(.chasm-mute-disabled)"
      );
      if (!elements || elements.length <= 0) {
        return;
      }
      for (let element of elements) {
        if (!element.classList.contains("chasm-mute-disabled")) {
          element.classList.add(".chasm-mute-disabled");
          const emptyDiv = document.createElement("div");
          emptyDiv.classList.add("chasm-mute-placeholder");
          element.parentElement.insertBefore(emptyDiv, element);
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
    attachObserver(document, () => {
      if (isCharacterMuteEnabled() || isStoryMuteEnabled()) {
        check();
      }
    });
  }

  // =====================================================
  //                       초기화
  // =====================================================
  loadSettings();
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);

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
            defaultValue: settings.enableStoryMute,
            action: (_, value) => {
              settings.enableStoryMute = value;
              saveSettings();
            },
          }
        );

        panel.addSwitchBox(
          "character-mute-enabled",
          "캐릭터 TTS 버튼 제거",
          "캐릭터 작품에서 TTS 버튼을 제거할지의 여부입니다.",
          {
            defaultValue: settings.enableCharacterMute,
            action: (_, value) => {
              settings.enableCharacterMute = value;
              saveSettings();
            },
          }
        );
      }, "결정화 캐즘 뮤트");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 뮤트");
      panel.addText(
        "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)"
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
})();
