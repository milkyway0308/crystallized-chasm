/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name        BabeChat / Chasm Crystallized AbsoluteZero (베이비챗 / 결정화 캐즘 절대영도)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     BABE-AZRO-v1.0.1
// @description 베이비챗 플랫폼에서 선택하거나 호버하지 않은 작품의 GIF 차단. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://babechat.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/babechat/absolutezero.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/babechat/absolutezero.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.10/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(
  "[freeze-out] { display: none; }" + "[melt-in] { display: block !important; }"
);
!(async function () {
  let lastProceedImages = 0;
  let lastPointing = [];

  function isDashboardPath() {
    return /\/(.*?)\/dashboard/.test(location.pathname);
  }

  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    enableFreeze: true,
    enableHoverResume: true,
    enableStopDetailPage: false,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-babe-azro-settings");
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
    localStorage.setItem("chasm-babe-azro-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }

  // =================================================
  //                유틸리티성 메서드
  // =================================================
  /**
   * 지정한 노드 혹은 요소에 변경 옵저버를 등록합니다.
   * @param {*} observeTarget 변경 감지 대상
   * @param {*} lambda 실행할 람다
   */
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
  /**
   * 콘솔에 지정한 포맷으로 디버그를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function log(message) {
    console.log(
      "%cChasm Crystallized AbsoluteZero: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  // =================================================
  //                     로직
  // =================================================
  function getProceedImages() {
    return document.getElementsByClassName("chasm-absolute-zero-freeze").length;
  }

  function deleteIncompatibleImages() {
    const toRemove = [];
    const freezed = document.querySelectorAll("img.chasm-absolute-zero-freeze");
    for (let element of freezed) {
      const canvas = element.parentElement.getElementsByTagName("canvas");
      const img = element.parentElement.getElementsByTagName("img");
      if (canvas.length <= 0 || img.length <= 0) continue;
      if (
        img[0].getAttribute("alt") &&
        canvas[0].getAttribute("alt") !== img[0].getAttribute("alt")
      ) {
        img[0].classList.remove("chasm-absolute-zero-freeze-prepare");
        img[0].classList.remove("chasm-absolute-zero-freeze");
        img[0].removeAttribute("freeze-out");
        img[0].removeAttribute("melt-in");
        toRemove.push(canvas[0]);
      }
    }
    if (toRemove.length > 0) {
      for (let element of toRemove) {
        element.remove();
      }
    }
  }

  function applyStopper(imageNode) {
    if (imageNode.classList.contains("chasm-absolute-zero-freeze-prepare")) {
      return;
    }
    imageNode.classList.add("chasm-absolute-zero-freeze-prepare");
    var c = document.createElement("canvas");
    var w = (c.width = imageNode.width);
    var h = (c.height = imageNode.height);
    c.getContext("2d").drawImage(imageNode, 0, 0, w, h);

    imageNode.classList.add("chasm-absolute-zero-freeze");
    for (var j = 0, a; (a = imageNode.attributes[j]); j++)
      c.setAttribute(a.name, a.value);
    if (settings.enableHoverResume) {
      const standardHoverAction = () => {
        c.setAttribute("freeze-out", "true");
        imageNode.setAttribute("melt-in", "true");
        imageNode.onexittriggered = () => {
          c.removeAttribute("freeze-out");
          imageNode.removeAttribute("melt-in");
          imageNode.onexittriggered = undefined;
          c.onhovertriggered = standardHoverAction;
        };
        lastPointing.push(imageNode);
        c.onhovertriggered = undefined;
      };
      c.onhovertriggered = standardHoverAction;
    }
    imageNode.setAttribute("freeze-out", "true");
    imageNode.parentNode.insertBefore(c, imageNode);
  }

  function setup() {
    if (!settings.enableFreeze) return;
    if (!isDashboardPath() || lastProceedImages === document.images.length)
      return;
    deleteIncompatibleImages();
    for (let imageNode of document.images) {
      if (imageNode.classList.contains("chasm-absolute-zero-freeze")) {
        continue;
      }
      // If srcset used, it's probably not thumbnail
      if (
        (imageNode.srcset.length > 0 && !settings.enableStopDetailPage) ||
        (!imageNode.src.endsWith("webp") && !imageNode.src.endsWith("gif"))
      ) {
        imageNode.classList.add("chasm-absolute-zero-freeze");
        continue;
      }

      if (!imageNode.complete) {
        imageNode.onload = () => {
          applyStopper(imageNode);
        };
      } else {
        applyStopper(imageNode);
      }
    }
    lastProceedImages = getProceedImages();
  }
  // =================================================
  //                  초기화
  // =================================================

  function prepare() {
    setup();
    attachObserver(document, () => {
      setup();
    });
    setInterval(() => {
      const hoverer = Array.from(document.querySelectorAll("div:hover"))
        .filter((e) => e.querySelector("div > canvas ~ img"))
        .filter(
          (e) => e.childNodes.length > 0 && e.childNodes[0].tagName === "CANVAS"
        );
      for (let parent of hoverer) {
        const element = parent.childNodes[0];
        if (
          element.classList.contains("chasm-absolute-zero-freeze") &&
          element.onhovertriggered
        ) {
          element.onhovertriggered();
        }
      }
      const isSelected = (e) =>
        e.parentNode.querySelectorAll(":hover").length > 0;
      for (let element of Array.from(lastPointing)) {
        if (!isSelected(element)) {
          if (element.onexittriggered) element.onexittriggered();
          lastPointing.splice(lastPointing.indexOf(element), 1);
        }
      }
    }, 20);
  }

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 절대영도", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addSwitchBox(
          "cntr-azro-enable",
          "애니메이션 정지",
          "메인 페이지에서의 GIF / WEBP 정지를 활성화합니다.",
          {
            defaultValue: settings.enableFreeze,
            action: (_, value) => {
              settings.enableFreeze = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-azro-enable-hover",
          "정지 애니메이션 호버링 재활성화",
          "호버한 이미지에 한해 GIF / WEBP를 재생할지의 여부입니다.",
          {
            defaultValue: settings.enableHoverResume,
            action: (_, value) => {
              settings.enableHoverResume = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-azro-disable-setting",
          "상세 페이지 애니메이션 정지",
          "상세 페이지의 애니메이션을 정지할지의 여부입니다.",
          {
            defaultValue: settings.enableStopDetailPage,
            action: (_, value) => {
              settings.enableStopDetailPage = value;
              saveSettings();
            },
          }
        );
      }, "결정화 캐즘 뮤트");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 절대영도");
      panel.addText(
        "- stop-chrome-gifanim 애드온 소스 코드 (https://github.com/johan/stop-chrome-gifanim)"
      );
      panel.addText(
        "- decentralized-modal.js 프레임워크 사용 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)"
      );
    });
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

  /**
   *
   * @param {string} buttonName
   * @returns {HTMLElement | undefined}
   */
  function extractPanelButton(buttonName) {
    const expectedPanel = document.querySelectorAll(
      `[data-radix-popper-content-wrapper]`
    );
    if (expectedPanel.length > 0) {
      for (const panel of expectedPanel) {
        for (const element of panel.getElementsByTagName("button")) {
          if (
            element.childNodes[element.childNodes.length - 1].textContent ===
            buttonName
          ) {
            console.log("PANEL FOUND!");
            return element;
          }
        }
      }
    }
    return undefined;
  }

  function __updateModalMenu() {
    let expectedPanelButton = undefined;
    if (
      !document.getElementById("chasm-decentral-menu") &&
      (expectedPanelButton = extractPanelButton("설정"))
    ) {
      const newItem = expectedPanelButton.cloneNode(true);
      newItem.id = "chasm-decentral-menu";
      newItem.onclick = undefined;
      newItem.addEventListener("click", (event) => {
        ModalManager.getOrCreateManager("c2")
          .withLicenseCredential()
          .display(true);
      });
      console.log(newItem.childNodes[0]);
      console.log(newItem.childNodes[0].childNodes);
      const expectedTextNode = newItem.childNodes[0].childNodes[newItem.childNodes[0].childNodes.length - 1];
      expectedTextNode.textContent = "결정화 캐즘";
      expectedPanelButton.parentElement.insertBefore(
        newItem,
        expectedPanelButton
      );
      console.log("Injected!");
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
