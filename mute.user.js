// ==UserScript==
// @name         Chasm Crystallized Mute (결정화 캐즘 뮤트)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-MUTE-v1.0.0
// @description  TTS 버튼 제거. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/mute.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/mute.user.js
// @grant        none
// ==/UserScript==
(async function () {
  let checkEnabled = false;
  let updating = false;
  let lastSelected = 0;
  function check() {
    if (updating) return;
    const elements = document.querySelectorAll(".css-n55rwb .css-1bamzls");
    if (!elements) {
      return;
    }
    if (lastSelected === elements.length) return;

    updating = true;
    lastSelected = elements.length;
    for (let element of elements) {
      if (!element.hasAttribute("chasm-mute-disabled")) {
        element.style.cssText = "display: none;";
        element.setAttribute("chasm-mute-disabled", "true");
      }
    }
    updating = false;
  }
  function prepare() {
    check();
    attachChatChangeObserver();
    let oldHref = location.href;
    attachObserver(document, () => {
      // Check last page href and test path
      if (location.href !== oldHref && /^\/u\/(.*)?$/.test(location.pathname)) {
        oldHref = location.href;
        checkEnabled = true;
        attachChatChangeObserver();
      } else {
        checkEnabled = false;
        lastSelected = 0;
      }
    });
  }

  function attachChatChangeObserver() {
    let observableElement = document.getElementById("character-message-list");
    if (!observableElement) {
      logError(
        "Cannot find character message list. Does Crack updated, or bug occured?"
      );
      return;
    }
    if (observableElement.hasAttribute("chasm-mute-attached")) {
      return;
    }
    observableElement.setAttribute("chasm-mute-attached", "true");
    attachObserver(observableElement, () => {
      check();
    });
  }

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

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Mute: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Mute: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }

  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
})();
