// ==UserScript==
// @name        Chasm Crystallized AbsoluteZero (결정화 캐즘 절대영도)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-AZRO-v1.0.0
// @description 선택하거나 호버하지 않은 작품의 GIF 차단. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/absolutezero.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/absolutezero.user.js
// @grant       GM_addStyle
// ==/UserScript==

// Code referenced from https://github.com/johan/stop-chrome-gifanim
GM_addStyle(
  "[freeze-out] { display: none; }" + "[melt-in] { display: block !important; }"
);
!(async function () {
  let lastProceedImages = 0;
  let lastPointing = [];

  function isDashboardPath() {
    // 2025-09-17 Path
    return "/" === location.pathname;
  }

  // =================================================
  //                유틸리티성 메서드
  // =================================================
  /**
   * 대상 노드의 필드에서 리액트 속성(React Property)를 찾아 람다에 파라미터로 전달합니다.
   * @param {Node} node 리액트 속성을 찾을 대상 노드
   * @param {Function} lambda 만약 리액트 속성이 존재한다면 실행될 람다
   * @returns 람다의 결과값 혹은 undefined
   */
  function findReactProperty(node, lambda) {
    for (let key of Object.keys(node)) {
      if (key.startsWith("__reactProps")) {
        return lambda(node[key]);
      }
    }
    return undefined;
  }
  /**
   * 크랙 페이지의 테마가 다크 모드인지 확인합니다.
   * @returns 다크 모드 여부
   */
  function isDarkMode() {
    return document.body.getAttribute("data-theme") === "dark";
  }
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
   * 지정한 노드 혹은 요소에 URL 변동 감지성 변경 옵저버를 등록합니다.
   * 이 펑션으로 등록된 옵저버는 이전과 현재 URL이 다를때만 작동합니다.
   * @param {*} runIfFirst 첫 초기화시 작동 여부
   * @param {*} node 변경 감지 대상
   * @param {*} lambda 실행할 람다
   */
  function attachHrefObserver(node, lambda) {
    let oldHref = location.href;
    attachObserver(node, () => {
      if (oldHref !== location.href) {
        oldHref = location.href;
        lambda();
      }
    });
  }
  /**
   * 콘솔에 지정한 포맷으로 디버그를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function log(message) {
    console.log(
      "%cChasm Crystallized Nebulizer: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }
  /**
   * 콘솔에 지정한 포맷으로 경고를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Nebulizer: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }
  /**
   * 콘솔에 지정한 포맷으로 오류를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function logError(message) {
    console.log(
      "%cChasm Crystallized Nebulizer: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }

  function getProceedImages() {
    return document.getElementsByClassName("chasm-absolute-zero-freeze").length;
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
    imageNode.setAttribute("freeze-out", "true");
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

    imageNode.setAttribute("freeze-out", "true");
    imageNode.parentNode.insertBefore(c, imageNode);
  }

  function setup() {
    if (!isDashboardPath() || lastProceedImages === document.images.length)
      return;
    for (let imageNode of document.images) {
      if (imageNode.classList.contains("chasm-absolute-zero-freeze")) {
        continue;
      }
      if (
        !imageNode.src.includes("cloudfront.net") ||
        imageNode.alt === "character_thumbnail" ||
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

  function prepare() {
    setup();
    attachObserver(document, () => {
      setup();
    });
    setInterval(() => {
      const hoverer = Array.from(document.querySelectorAll("div:hover"))
        .filter((e) => e.querySelector("div > canvas ~ img"))
        .filter(
          (e) =>
            e.childNodes.length > 0 && e.childNodes[0].tagName === "CANVAS"
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

  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
})();
