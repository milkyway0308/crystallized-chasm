// ==UserScript==
// @name         Chasm Crystallized Fold (결정화 캐즘 폴드)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-FOLD-v1.1.0
// @description  채팅창 병합 및 접힘 기능 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/fold.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/fold.user.js
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(
  "@keyframes rotate { from { transform: rotate(0deg); } to {  transform: rotate(360deg); }}" +
    ".chasm-fold-listings { user-select: none; font-family: Pretendard; }" +
    ".chasm-fold-button { color: gray; transition: color 0.1s ease;}" +
    'body[data-theme="light"] .chasm-fold-button[data-theme=white] { color: gray; transition: color 0.1s ease;}' +
    'body[data-theme="dark"] .chasm-fold-button:hover { color: #F0EFEB; transition: color 0.1s ease;}' +
    'body[data-theme="light"] .chasm-fold-button:hover { color: #1A1918; transition: color 0.1s ease;}' +
    '.chasm-fold-button[expanded="true"] { color: white; transition: color 0.1s ease; }' +
    ".chasm-fold-title { font-size: 14px; }" +
    ".chasm-fold-description { font-size: 11px; color: gray; margin-top: 5px; font-weight: light; }" +
    'body[data-theme="dark"] .chasm-fold-title { color: #F0EFEB; font-weight: bold;}' +
    'body[data-theme="light"] .chasm-fold-title {color: #1A1918; font-weight: bold;}' +
    ".chasm-fold-listings .chasm-fold-contents { visibility: hidden; max-height: 0px;}" +
    '.chasm-fold-listings[expanded="true"] .chasm-fold-contents { visibility: visible; max-height: 100%;}' +
    ".chasm-fold-hide-all { display: none; }"
);
(async function () {
  const EXCLUDE_CLASS_NAME = "chasm-fold-excludes";
  const FOLD_BUTTON_NAME = "chasm-fold-button";
  const FOLDED_CONTENTS = "chasm-fold-contents";
  const CLASS_ALLOW_REMOVAL = "chasm-fold-allow-removal";
  const CLASS_DISALLOW_REMOVAL = "chasm-fold-disallow-removal";
  const CLASS_LOADING = "chasm-fold-loading";
  const CLASS_LISTING = "chasm-fold-listings";
  // To prevent duplicated initialization
  let doesUpdateCalled = false;
  let lastUpdate = new Date();

  async function doInitialize() {
    let sideBar = document.getElementsByClassName("css-ks2xqc");
    if (!sideBar || sideBar.length <= 0) {
      logWarning("Cannot acquire sidebar; Does crack updated, or bug occured?");
      return;
    }
    attachObserver(sideBar[0], async () => {
      // Soft-delete sidebar
      clearSidebar(false);
      if (doesUpdateCalled) return;
      // If all empty, maybe ui cleared by framework
      // ..or, more than 5 seconds passed from last update
      // Anyway, we have to re-update it if condition matched
      if (
        document.getElementsByClassName(CLASS_LISTING).length <= 0
        //  ||new Date() - lastUpdate > 5000
      ) {
        lastUpdate = new Date();
        doesUpdateCalled = true;
        deleteAllListings(sideBar[0]);
        clearSidebar(true);
        appendLoading(sideBar[0]);
        await doLoad(sideBar[0]);
        deleteLoading(sideBar[0]);
        lastUpdate = new Date();
        doesUpdateCalled = false;
      }
    });
    doesUpdateCalled = true;
    deleteAllListings(sideBar[0]);
    clearSidebar(true);
    appendLoading(sideBar[0]);
    await doLoad(sideBar[0]);
    deleteLoading(sideBar[0]);
    lastUpdate = new Date();
    doesUpdateCalled = false;
  }

  function clearSidebar(force) {
    let sideBar = document.getElementsByClassName("css-ks2xqc");
    if (!sideBar || sideBar.length <= 0) {
      logWarning("Cannot acquire sidebar; Does crack updated, or bug occured?");
      return;
    }
    sideBar = sideBar[0];
    let nodeToRemove = [];
    for (let node of sideBar.childNodes) {
      if (node.classList.contains(CLASS_DISALLOW_REMOVAL)) {
        continue;
      }
      if (force || !node.classList.contains(EXCLUDE_CLASS_NAME)) {
        nodeToRemove.push(node);
      }
    }
    for (let node of nodeToRemove) {
      if (node.classList.contains(CLASS_ALLOW_REMOVAL)) {
        node.remove();
      } else {
        if (node.style.cssText.length <= 0) {
          node.style.cssText = "display: none;";
        }
      }
    }
  }

  async function doLoad(sideBar) {
    doesUpdateCalled = true;
    const map = {};
    const urls = [];
    let nextURL =
      "https://contents-api.wrtn.ai/character-chat/api/v2/chat?type=character&limit=40";
    let retry = 0;
    while (true) {
      const start = new Date();
      let result = await fetch(nextURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${extractAccessToken()}`,
          "Content-Type": "application/json",
        },
      });
      if (result.ok) {
        retry = 0;
        // No Content
        if (result.status === 204) {
          // All request completed
          break;
        }
        let json = await result.json();
        const data = json.data;
        const sessionContainer = data.chats;
        for (let session of sessionContainer) {
          const sessionId = session._id;
          const characterId = session.character._id;
          const characterName = session.character.name;
          const sessionTitle = session.title;
          // URL Format: https://crack.wrtn.ai/u/{character_id}/c/{session_id}
          // "https://crack.wrtn.ai/u/{character_id}/c/{_id}"
          const url = `/u/${characterId}/c/${sessionId}`;
          if (urls.includes(url)) {
            logWarning(
              "Duplicated element returned from server ( URL " + url + " )"
            );
            continue;
          }

          urls.push(url);
          let elements = map[characterId];
          if (elements === undefined) {
            elements = [];
            map[characterId] = elements;
          }
          elements.push({
            name: characterName,
            title: sessionTitle,
            url: url,
            lastUpdate: new Date(session.updatedAt),
          });
        }
        if (data.nextCursor === null || data.nextCursor === undefined) {
          // Request completed (maybe)
          log("Exiting loop - no next cursor");
          break;
        }
        // Map next URL
        nextURL =
          "https://contents-api.wrtn.ai/character-chat/api/v2/chat?type=character&limit=40&cursor=" +
          data.nextCursor;
        const elapsed = new Date() - start;
        if (elapsed < 30) {
          await new Promise((resolve) => setTimeout(resolve, 30 - elapsed));
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        if (result.status === 500) {
          logError(
            "Crack server returned internal server error. Force exiting code (HTTP " +
              result.status +
              " / " +
              result.statusText +
              ")"
          );
          break;
        }
        // Retry
        if (retry++ >= 10) {
          logError(
            "Max retry count reached (HTTP " +
              result.status +
              " / " +
              result.statusText +
              " / URL " +
              nextURL +
              ")"
          );
          // TODO: Add load failure scren
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    const byMonth = {};
    for (let entries of Object.entries(map)) {
      // [1][0] = [1] -> Value, [0] -> First element of sessions
      const date = entries[1][0].lastUpdate;
      const key = `${date.getFullYear()}.${date.getMonth()}`;
      let contents = byMonth[key];
      if (!contents) {
        contents = [];
        byMonth[key] = contents;
      }
      contents.push(entries[1]);
    }
    const rearranged = Object.values(byMonth);
    rearranged.sort((a, b) => {
      return a[0].lastUpdate > b[0].lastUpdate;
    });
    // All comparing complete, update display
    clearSidebar(true);
    let index = 0;
    for (let entries of Object.values(rearranged)) {
      const entryDate = entries[0][0].lastUpdate;
      const topEntryName = `${entryDate.getFullYear()}년 ${
        entryDate.getMonth() + 1
      }월`;
      appendDivider(sideBar, topEntryName, index++ == 0);
      entries = entries.sort(function (a, b) {
        return a[0].lastUpdate < b[0].lastUpdate;
      });
      for (let sessions of entries) {
        const foldedNode = appendElement(
          sideBar,
          sessions[0].name,
          `${sessions[0].name} (${sessions.length})`
        );
        for (let session of sessions) {
          appendOriginElement(
            foldedNode,
            session.title,
            session.lastUpdate,
            session.url
          );
        }
      }
    }
  }

  // ==================================================
  //                  노드 / 태그 생성
  // ==================================================
  /**
   * 분리선을 생성해 반환합니다.
   * 분리선의 첫 부분에는 지정한 텍스트가 입력되며, 텍스트의 끝부터는 선이 그어집니다.
   * @param {HTMLElement} root
   * @param {string} text
   * @param {boolean} isFirst
   */
  function appendDivider(root, text, isFirst) {
    let container = document.createElement("div");
    container.className = EXCLUDE_CLASS_NAME;
    if (isFirst) {
      container.style.cssText =
        "color: gray; display: flex; align-items: center; ";
    } else {
      container.style.cssText =
        "color: gray; display: flex; align-items: center; margin-top: 15px;";
    }
    let node = document.createElement("p");
    node.style.cssText =
      "margin-left: 10px; font-size: 15px;width: fit-content; white-space: nowrap; color: gray; font-family: Pretendard; font-weight: bold;";
    node.innerHTML = text;
    container.append(node);
    let line = document.createElement("div");
    line.style.cssText =
      "width: 100%; height: 1px; background: gray; margin-left: 5px;margin-right: 5px;";
    container.append(line);
    root.append(container);
  }

  function appendElement(root, origin, text) {
    const node = document.createElement("div");
    node.className = `${EXCLUDE_CLASS_NAME} ${CLASS_LISTING}`;
    node.style =
      "display: flex; flex-direction: column; width: 100%;margin-top: 10px; font-size: 15px; font-weight: bolder;";
    node.setAttribute("fold-origin", text);
    const collapsable = document.createElement("div");
    collapsable.className = FOLD_BUTTON_NAME;
    collapsable.style.cssText = "display: flex; flex-direction:row;";
    collapsable.onclick = () => {
      // To prevent unexpected update call
      if (doesUpdateCalled) return;
      doesUpdateCalled = true;
      if (node.hasAttribute("expanded")) {
        node.removeAttribute("expanded");
      } else {
        node.setAttribute("expanded", "true");
      }
      lastUpdate = new Date();
      doesUpdateCalled = false;
    };
    const collapsableText = document.createElement("p");
    collapsableText.textContent = text;
    collapsableText.style.cssText =
      "width: fit-contents; margin-left: 15px; white-space: nowrap;";
    collapsable.append(collapsableText);
    const markerText = document.createElement("p");
    markerText.innerText = "▼";
    markerText.style.cssText =
      "width: 100%; margin-right: 15px; text-align: right; white-space: nowrap; font-size: 12px;";
    collapsable.append(markerText);
    let integrationNode = document.createElement("div");
    integrationNode.className = "chasm-fold-category-integration";
    integrationNode.style.cssText = "display: flex; flex-direction: column;";
    integrationNode.setAttribute("chasm-fold-article-origin", origin);
    integrationNode.append(collapsable);
    node.append(integrationNode);
    const contents = document.createElement("div");
    contents.className = FOLDED_CONTENTS;
    node.append(contents);
    root.append(node);
    return contents;
  }

  function appendOriginElement(parent, text, time, url) {
    const node = document.createElement("a");
    node.href = url;
    const infoContainer = document.createElement("div");
    infoContainer.className = `${CLASS_DISALLOW_REMOVAL}`;
    // infoContainer.className = "css-hwxbww efhw7t80";
    infoContainer.style.cssText = "margin-left: 30px; margin-top: 10px;";
    const titleContainer = document.createElement("div");
    // titleContainer.className = "css-mz5j7e efhw7t80";
    const titleElement = document.createElement("p");
    titleElement.className = "chasm-fold-title";
    titleElement.textContent = text;
    titleContainer.append(titleElement);
    infoContainer.append(titleContainer);

    const descriptionContainer = document.createElement("div");
    // descriptionContainer.className = "css-1xcsjrx efhw7t80";
    const descriptionElement = document.createElement("p");
    descriptionElement.className = "chasm-fold-description";
    descriptionElement.textContent = formatTime(time);
    descriptionContainer.append(descriptionElement);
    infoContainer.append(descriptionContainer);
    node.append(infoContainer);
    parent.append(node);
  }

  function deleteAllListings(root) {
    const elements = root.getElementsByClassName(CLASS_LISTING);
    // Removing from direct array occurs incompleted removal
    const toRemove = [];
    for (let element of elements) {
      toRemove.push(element);
    }
    for (let element of toRemove) {
      element.remove();
    }
  }

  function appendLoading(root) {
    const container = document.createElement("div");
    container.className = `${EXCLUDE_CLASS_NAME} ${CLASS_DISALLOW_REMOVAL} ${CLASS_LOADING}`;
    container.style.cssText =
      "color: gray; margin-top: auto; margin-bottom: auto; display: flex; flex-direction: column; justify-items: center;align-items: center;";
    const svgContainer = document.createElement("div");
    svgContainer.innerHTML =
      '<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --><svg fill="#949494" width="32px" height="32px" viewBox="-1.5 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7.5 21 2.999-3v1.5c4.143 0 7.501-3.359 7.501-7.502 0-2.074-.842-3.952-2.202-5.309l2.114-2.124c1.908 1.901 3.088 4.531 3.088 7.437 0 5.798-4.7 10.498-10.498 10.498-.001 0-.001 0-.002 0v1.5zm-7.5-9c.007-5.796 4.704-10.493 10.499-10.5h.001v-1.5l3 3-3 3v-1.5s-.001 0-.002 0c-4.143 0-7.502 3.359-7.502 7.502 0 2.074.842 3.952 2.203 5.31l-2.112 2.124c-1.907-1.89-3.088-4.511-3.088-7.407 0-.01 0-.02 0-.03v.002z"/></svg>';
    svgContainer.style.cssText =
      " height: 32px; width: 32px; animation: 2s rotate linear infinite;";
    container.append(svgContainer);
    const loadingText = document.createElement("p");
    loadingText.innerText = "불러오는 중";
    loadingText.style.cssText = "margin-top: 5px";
    container.append(loadingText);
    root.append(container);
  }

  function deleteLoading(root) {
    const elements = root.getElementsByClassName(CLASS_LOADING);
    if (elements && elements.length > 0) {
      elements[0].remove();
    }
  }
  // ==================================================
  //                     크랙 유틸리티
  // ==================================================

  /**
   * 현재 크랙의 테마가 다크 모드인지 반환합니다.
   * @returns 다크 모드가 적용되었는지의 여부
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

  // ==================================================
  //                     범용 유틸리티
  // ==================================================
  function formatTime(date) {
    const current = new Date();
    const difference = (current - date) / 1000;
    if (difference < 60) {
      return parseInt(difference) + "초 전";
    }
    if (difference < 3600) {
      return parseInt(difference / 60) + "분 전";
    }
    if (difference < 86400) {
      return parseInt(difference / 3600) + "시간 전";
    }
    if (difference < 86400 * 31) {
      return parseInt(difference / 86400) + "일 전";
    }
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
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
  // ==================================================
  //                 로그 관련 유틸리티
  // ==================================================
  function log(message) {
    console.log(
      "%cChasm Crystallized Fold: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Fold: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Fold: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }
  // ==================================================
  //                       초기화
  // ==================================================
  "loading" === document.readyState
    ? (document.addEventListener("DOMContentLoaded", B),
      window.addEventListener("load", B))
    : "interactive" === document.readyState ||
      "complete" === document.readyState
    ? await doInitialize()
    : setTimeout(doInitialize, 100);
})();
