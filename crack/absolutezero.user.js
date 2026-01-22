// ==UserScript==
// @name        Chasm Crystallized AbsoluteZero (결정화 캐즘 절대영도)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-AZRO-v1.2.0
// @description 선택하거나 호버하지 않은 작품의 GIF 차단. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/absolutezero.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/absolutezero.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-toastify-injection@v1.0.0/crack/libraries/toastify-injection.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.0.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==

// =====================================================
//                      IDE 설정
// =====================================================

// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />

// =====================================================
//                       CSS
// =====================================================
// @ts-ignore
GM_addStyle(
  "[freeze-out] { display: none; }" + "[melt-in] { display: block !important; }"
);
!(async function () {
  let lastProceedImages = 0;
  /** @type {HTMLElement[]} */
  let lastPointing = [];

  // =====================================================
  //                      설정
  // =====================================================
  const settings = new LocaleStorageConfig("chasm-azro-settings", {
    enableFreeze: true,
    enableHoverResume: true,
    enableStopDetailPage: false,
  });

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
      const canvas = parentElement(element).getElementsByTagName("canvas");
      const img = parentElement(element).getElementsByTagName("img");
      if (canvas.length <= 0 || img.length <= 0) continue;
      if (
        img[0].getAttribute("alt") &&
        !isAttributeEquals(img[0], canvas[0], "alt")
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

  /**
   *
   * @param {HTMLImageElement} imageNode
   * @returns
   */
  function applyStopper(imageNode) {
    if (imageNode.classList.contains("chasm-absolute-zero-freeze-prepare")) {
      return;
    }
    imageNode.classList.add("chasm-absolute-zero-freeze-prepare");
    var canvas = document.createElement("canvas");
    var width = (canvas.width = imageNode.width);
    var height = (canvas.height = imageNode.height);
    canvas.getContext("2d")?.drawImage(imageNode, 0, 0, width, height);
    const refinedCanvas = GenericUtil.refine(canvas);
    imageNode.classList.add("chasm-absolute-zero-freeze");
    for (var j = 0, a; (a = imageNode.attributes[j]); j++) {
      canvas.setAttribute(a.name, a.value);
    }
    if (settings.config.enableHoverResume) {
      const standardHoverAction = () => {
        canvas.setAttribute("freeze-out", "true");
        imageNode.setAttribute("melt-in", "true");
        GenericUtil.refine(imageNode).onexittriggered = () => {
          canvas.removeAttribute("freeze-out");
          imageNode.removeAttribute("melt-in");
          GenericUtil.refine(imageNode).onexittriggered = undefined;
          refinedCanvas.onhovertriggered = standardHoverAction;
        };
        lastPointing.push(imageNode);
        refinedCanvas.onhovertriggered = undefined;
      };
      refinedCanvas.onhovertriggered = standardHoverAction;
    }
    imageNode.setAttribute("freeze-out", "true");
    imageNode.parentNode?.insertBefore(canvas, imageNode);
  }

  function setup() {
    if (!settings.config.enableFreeze) return;
    if (
      !CrackUtil.path().isDashboardPath() ||
      lastProceedImages === document.images.length
    )
      return;
    deleteIncompatibleImages();
    for (let imageNode of document.images) {
      if (imageNode.classList.contains("chasm-absolute-zero-freeze")) {
        continue;
      }
      if (
        !imageNode.src.includes("cloudfront.net") ||
        (imageNode.alt === "character_thumbnail" &&
          !settings.config.enableStopDetailPage) ||
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

  /**
   *
   * @param {HTMLElement} e
   * @returns {boolean}
   */
  function isSelected(e) {
    return parentElement(e).querySelectorAll(":hover").length > 0;
  }

  function prepare() {
    setup();
    GenericUtil.attachObserver(document, () => {
      setup();
    });
    setInterval(() => {
      const hoverer = Array.from(document.querySelectorAll("div:hover"))
        .filter((e) => e.querySelector("div > canvas ~ img"))
        .filter((e) => {
          childNodes(e).length > 0 && childNodes(e)[0].tagName === "CANVAS";
        });
      for (let parent of hoverer) {
        const element = childNodes(parent)[0];
        if (
          element.classList.contains("chasm-absolute-zero-freeze") &&
          // @ts-ignore
          element.onhovertriggered
        ) {
          // @ts-ignore
          element.onhovertriggered();
        }
      }
      for (let element of Array.from(lastPointing)) {
        if (!isSelected(element)) {
          const refined = _refine(element);
          refined?.onexittriggered?.();
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
            defaultValue: settings.config.enableFreeze,
            onChange: (_, value) => {
              settings.config.enableFreeze = value;
              settings.save();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-azro-enable-hover",
          "정지 애니메이션 호버링 재활성화",
          "호버한 이미지에 한해 GIF / WEBP를 재생할지의 여부입니다.",
          {
            defaultValue: settings.config.enableHoverResume,
            onChange: (_, value) => {
              settings.config.enableHoverResume = value;
              settings.save();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-azro-disable-setting",
          "상세 페이지 애니메이션 정지",
          "상세 페이지의 애니메이션을 정지할지의 여부입니다.",
          {
            defaultValue: settings.config.enableStopDetailPage,
            onChange: (_, value) => {
              settings.config.enableStopDetailPage = value;
              settings.save();
            },
          }
        );
      }, "결정화 캐즘 절대영도");
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

  settings.load();
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
          const clonedElement = _clone(element);
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
