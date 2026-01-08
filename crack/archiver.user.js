/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name        Chasm Crystallized Archiver (결정화 캐즘 기록관)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-ARCV-v1.0.0
// @description 입력중인 프롬프트 보관 및 이전 기록 저장. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @require      https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.js
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/archiver.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/archiver.user.js
// @grant       GM_addStyle
// ==/UserScript==
!(async function () {
  const db = new Dexie("chasm-archiver");
  await db.version(1).stores({
    chatStore: `logTime, logId, isFullyModified, text`,
  });
  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    enableStoryArchive: true,
    enableCharacterArchive: true,
    restoreLastArchiveAtJoin: false,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-arcv-settings");
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
    localStorage.setItem("chasm-cntr-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }

  function isCharacterCounterEnabled() {
    return settings.enableCharacterCounter && isCharacterPath();
  }

  function isStoryCounterEnabled() {
    return settings.enableStoryCounter && isStoryPath();
  }

  // =================================================
  //                    초기화
  // =================================================
  function setup() {
    if (!isChattingPath()) return;
    const item = document.getElementsByClassName("chasm-rcrd-button");
    if (item && item.length !== 0) {
      return;
    }
    const panel = extractSidePanel();
    if (!panel) {
      logWarning(
        "No side panel found, does page initialized yet or Crack updated?"
      );
      return;
    }
    const menu = panel.childNodes[0];

    const button = menu.childNodes[1].cloneNode(true);
    button.childNodes[0].remove();
    button.childNodes[0].remove();
    button.childNodes[0].remove();
    const topContainer = document.createElement("div");
    topContainer.style.cssText =
      "display: flex; flex-direction: row; align-items: center;";
    topContainer.appendChild(createLogSvg());
    // Text Container (Middle)
    const textContainer = document.createElement("div");
    textContainer.style.cssText =
      "display: flex; flex-direction: column; margin-left: 12px;";
    // Title
    const titleElement = document.createElement("p");
    titleElement.textContent = "기록 패널";
    textContainer.appendChild(titleElement);
    topContainer.append(textContainer);

    button.appendChild(topContainer);
    button.onclick = () => {};
    button.classList.add("chasm-rcrd-button");

    button.addEventListener("click", async (event) => {
      if (processing) {
        return;
      }
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      const chatRoomId = split[3];
    });
    // button.childNodes[1].textContent = "평행세계로 이동";
    menu.appendChild(button);
  }

  function extractInputPanel() {
    return document.getElementsByClassName("");
  }

  function prepare() {
    setup();
    attachObserver(document, () => {
      setup();
    });
  }
  // =================================================
  //               스크립트 초기 실행
  // =================================================
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
})();
