// ==UserScript==
// @name        Chasm Crystallized Accordion (결정화 캐즘 아코디언)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-ACCO-v1.0.0
// @description * 여기에 슬픈 아코디언 음악 입력 *
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/accordiaon.user.js
// @updateURL   https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/accordion.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.2.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @grant       GM_addStyle
// ==/UserScript==
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />
GM_addStyle(`
   .chasm-acco-flagged-textarea {
        resize: vertical !important;
        max-height: 999999px !important;
   } 
`);
(function () {
  /**
   * @returns {boolean}
   */
  function isEditorPage() {
    return /^\/builder\/story(\/.*)?$/.test(location.pathname);
  }

  /**
   * @returns {boolean}
   */
  function matchContent(matcher) {
    return document.getElementsByClassName("css-cis1hu")[0]?.textContent === matcher;
  }

  function getTextAreaEditor() {
    return document.getElementsByTagName("textarea");
  }

  GenericUtil.onPageReady(() => {
    GenericUtil.attachObserver(document.body, () => {
      // matchContent("스토리 설정")
      if (isEditorPage()) {
        for (let area of getTextAreaEditor()) {
          if (!area.classList.contains("chasm-acco-flagged-textarea")) {
            area.classList.add("chasm-acco-flagged-textarea");
          }
        }
      }
    });
  });
})();
