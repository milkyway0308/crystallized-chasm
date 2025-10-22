// ==UserScript==
// @name        Chasm Crystallized Navigator (결정화 캐즘 신호수)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-NAVI-v1.0.0
// @description 현재 채팅방에 검색 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/navigator.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/navigator.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.js
// @grant       GM_addStyle
// ==/UserScript==
GM_addStyle(
    ".chasm-navigator-search-bar { display: flex; flex-direction: row; padding: 8px; background-color: var(--text-primary);  }"
);
!(async function () {
  const db = new Dexie("chasm-navigator");
  await db.version(1).stores({
    chatStore: `combinedId, chatId, messageId`,
    chatData: `chatId, time`,
  });

  function injectElement() {
    const element = document.createElement("div");
    element.className = "chasm-navigator-search-bar";
    
  }
  // =================================================
  //               스크립트 초기 실행
  // =================================================
  function setup() {}
  function prepare() {}
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
  // =================================================
  //                      SVG
  // =================================================
  // https://www.svgrepo.com/svg/522266/search
  function createSEarchIcon() {
    const element = document.createElement("div");
    element.innerHTML =
      '<svg width="16px" height="16px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="var(--text_primary)" stroke="var(--text_primary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>search</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-256.000000, -1139.000000)" fill="FFFFFF"> <path d="M269.46,1163.45 C263.17,1163.45 258.071,1158.44 258.071,1152.25 C258.071,1146.06 263.17,1141.04 269.46,1141.04 C275.75,1141.04 280.85,1146.06 280.85,1152.25 C280.85,1158.44 275.75,1163.45 269.46,1163.45 L269.46,1163.45 Z M287.688,1169.25 L279.429,1161.12 C281.591,1158.77 282.92,1155.67 282.92,1152.25 C282.92,1144.93 276.894,1139 269.46,1139 C262.026,1139 256,1144.93 256,1152.25 C256,1159.56 262.026,1165.49 269.46,1165.49 C272.672,1165.49 275.618,1164.38 277.932,1162.53 L286.224,1170.69 C286.629,1171.09 287.284,1171.09 287.688,1170.69 C288.093,1170.3 288.093,1169.65 287.688,1169.25 L287.688,1169.25 Z" id="search" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>';
    return element;
  }
})();
