// ==UserScript==
// @name        Chasm Crystallized Sanitizer (결정화 캐즘 손소독제)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-SANI-v1.0.0
// @description 모바일 앱 권유 팝업 제거. 손도 깔끔!
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/sanitizer.user.js
// @updateURL   https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/sanitizer.user.js
// @grant       GM_addStyle
// ==/UserScript==
(function () {
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
      "%cChasm Crystallized Sanitizer: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }
  // ==========================================
  //                초기화
  // ==========================================

  function monitor() {
    if (!window.matchMedia("(min-width: 768px)").matches) {
      let scannerIndex = 0;
      for (let element of document.querySelectorAll('div[height="64"]')) {
        if (++scannerIndex >= 30) return;
        for (let button of element.getElementsByTagName("button")) {
          if (button.textContent === "다운로드") {
            button.parentElement.nextSibling.click();
            log("모바일 권유 배너 1개를 제거하였습니다.");
            return;
          }
        }
      }
    }
  }

  function setup() {
    attachObserver(document.body, monitor);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", setup)
    : setup();
  window.addEventListener("load", setup);
})();
