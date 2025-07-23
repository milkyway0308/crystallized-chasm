// ==UserScript==
// @name         Chasm Crystallized Fold (결정화 캐즘 폴드)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-FOLD-v1.0.4
// @description  채팅창 병합 및 접힘 기능 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/fold.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/fold.user.js
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(
  "@keyframes rotate { from { transform: rotate(0deg); } to {  transform: rotate(360deg); }}" +
    ".chasm-fold { user-select: none; font-family: Pretendard; }" +
    ".chasm-fold-button { color: gray; transition: color 0.1s ease;}" +
    'body[data-theme="light"] .chasm-fold-button[data-theme=white] { color: gray; transition: color 0.1s ease;}' +
    'body[data-theme="dark"] .chasm-fold-button:hover { color: #F0EFEB; transition: color 0.1s ease;}' +
    'body[data-theme="light"] .chasm-fold-button:hover { color: #1A1918; transition: color 0.1s ease;}' +
    '.chasm-fold-button[expanded="true"] { color: white; transition: color 0.1s ease; }' +
    '.chasm-fold-title { font-size: 14px; }' +
    '.chasm-fold-description { font-size: 11px; color: gray; margin-top: 5px; font-weight: light; }' +
    'body[data-theme="dark"] .chasm-fold-title { color: #F0EFEB; font-weight: bold;}' +
    'body[data-theme="light"] .chasm-fold-title {color: #1A1918; font-weight: bold;}' +
    ".chasm-fold .chasm-fold-contents { visibility: hidden; max-height: 0px;}" +
    '.chasm-fold[expanded="true"] .chasm-fold-contents { visibility: visible; max-height: 100%;}'
);
(async function () {
  const EXCLUDE_CLASS_NAME = "chasm-fold";
  const FOLD_BUTTON_NAME = "chasm-fold-button";
  const FOLDED_CONTENTS = "chasm-fold-contents";

  async function doInitialize() {
    let sideBar = document.getElementsByClassName("css-ks2xqc");
    if (!sideBar || sideBar.length <= 0) {
      logWarning("Cannot acquire sidebar; Does crack updated, or bug occured?");
      return;
    }
    clearSidebar(false);
    attachObserver(sideBar[0], () => {
      clearSidebar(false);
    });
    appendLoading(sideBar[0]);
    await doLoad(sideBar[0]);
  }

  function clearSidebar(force) {
    // let sideBar = document.getElementsByClassName("css-kvsjdq");
    let sideBar = document.getElementsByClassName("css-ks2xqc");
    if (!sideBar || sideBar.length <= 0) {
      logWarning("Cannot acquire sidebar; Does crack updated, or bug occured?");
      return;
    }
    sideBar = sideBar[0];
    let nodeToRemove = [];
    for (let node of sideBar.childNodes) {
      if (force || !node.className.includes(EXCLUDE_CLASS_NAME)) {
        nodeToRemove.push(node);
      }
    }
    for (let node of nodeToRemove) {
      node.remove();
    }
  }

  async function doLoad(sideBar) {
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
        if (elapsed < 10) {
          await new Promise((resolve) => setTimeout(resolve, 10 - elapsed));
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        if (result.status === 500) {
          logError("Crack server returned internal server error. Force exiting code (HTTP " + result.status + " / " + result.statusText + ")");  
          break;
        }
        // Retry
        if (retry++ >= 10) {
          logError("Max retry count reached (HTTP " + result.status + " / " + result.statusText + " / URL " + nextURL + ")");
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
    for (let entries of Object.values(rearranged)) {
      const entryDate = entries[0][0].lastUpdate;
      const topEntryName = `${entryDate.getFullYear()}년 ${
        entryDate.getMonth() + 1
      }월`;
      appendDivider(sideBar, topEntryName);
      entries = entries.sort(function (a, b) {
        return a[0].lastUpdate < b[0].lastUpdate;
      });
      for (let sessions of entries) {
        const foldedNode = appendElement(
          sideBar,
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

  function appendDivider(root, text) {
    let container = document.createElement("div");
    container.className = EXCLUDE_CLASS_NAME;
    container.style.cssText =
      "color: gray; display: flex; align-items: center; margin-top: 15px;";
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

  function appendElement(root, text) {
    const node = document.createElement("div");
    node.className = EXCLUDE_CLASS_NAME;
    node.style =
      "display: flex; flex-direction: column; width: 100%;margin-top: 10px; font-size: 15px; font-weight: bolder;";
    node.setAttribute("fold-origin", text);
    const collapsable = document.createElement("div");
    collapsable.className = FOLD_BUTTON_NAME;
    collapsable.style.cssText = "display: flex; flex-direction:row;";
    collapsable.onclick = () => {
      if (node.hasAttribute("expanded")) {
        node.removeAttribute("expanded");
      } else {
        node.setAttribute("expanded", "true");
      }
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
    node.append(collapsable);
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

  function appendLoading(root) {
    const container = document.createElement("div");
    container.className = EXCLUDE_CLASS_NAME;
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
  "loading" === document.readyState
    ? (document.addEventListener("DOMContentLoaded", B),
      window.addEventListener("load", B))
    : "interactive" === document.readyState ||
      "complete" === document.readyState
    ? await doInitialize()
    : setTimeout(doInitialize, 100);
})();
