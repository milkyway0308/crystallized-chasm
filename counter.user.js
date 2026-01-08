/// <reference path="decentralized-modal.js" />
// ==UserScript==
// @name        Chasm Crystallized Counter (결정화 캐즘 계수기)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-CNTR-v1.2.12p
// @description 채팅에 캐릭터 채팅 턴 계수기 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/counter.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/counter.user.js
// @require     https://cdn.jsdelivr.net/npm/dexie@4.2.1/dist/dexie.min.js#sha256-STeEejq7AcFOvsszbzgCDL82AjypbLLjD5O6tUByfuA=
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.11/decentralized-modal.js
// @grant       GM_addStyle
// ==/UserScript==
GM_addStyle(`
  .chasm-counter-flex-adjuster {
    display: flex;
    flex-direction: column;
  }
  .chasm-counter-shared-bar-wrapper {
    display: flex;
    justify-content: center;
  }
  .chasm-counter-shared-bar {
    display: flex;
    flex-direction: row;
    margin-left: 8px;
    margin-bottom: 0px;
    width: calc(100% - 80px);
    max-width: 768px;
  }
`);
!(async function () {
  let lastDetectedMessageCount = {};
  const db = new Dexie("chasm-counter");
  await db.version(1).stores({
    chatStore: `combinedId, chatId, messageId`,
    chatData: `chatId, time`,
  });
  // =====================================================
  //                      유틸리티
  // =====================================================
  function log(message) {
    console.log(
      "%cChasm Crystallized Counter: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Counter: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Counter: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
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

  // =====================================================
  //                  크랙 종속 유틸리티
  // =====================================================

  /**
   * 현재 URL이 스토리챗의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isStoryPath() {
    // 2025-09-17 Path
    return (
      /\/stories\/[a-f0-9]+\/episodes\/[a-f0-9]+/.test(location.pathname) ||
      // Legacy Path
      /\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)
    );
  }

  /**
   * 현재 URL이 캐릭터챗의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isCharacterPath() {
    return /\/characters\/[a-f0-9]+\/chats\/[a-f0-9]+/.test(location.pathname);
  }

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

  /**
   * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
   * @param {string} method 요청 메서드
   * @param {string} url 요청 URL
   * @param {any | undefined} body 요청 바디 파라미터
   * @returns {any | Error} 파싱된 값 혹은 오류
   */
  async function authFetch(method, url, body) {
    try {
      const param = {
        method: method,
        headers: {
          Authorization: `Bearer ${extractAccessToken()}`,
          "Content-Type": "application/json",
        },
      };
      if (body) {
        param.body = JSON.stringify(body);
      }
      const result = await fetch(url, param);
      if (!result.ok)
        return new Error(
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`
        );
      return await result.json();
    } catch (t) {
      return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
    }
  }

  async function retryAuthFetch(maxRetry, method, url, body) {
    let count = 0;
    let result = undefined;
    while (count++ < maxRetry) {
      try {
        const fetched = authFetch(method, url, body);
        if (fetched instanceof Error) {
          result = fetched;
        } else {
          return fetched;
        }
      } catch (e) {
        result = e;
      }
    }
    return result;
  }

  function getRenderedMessageCount() {
    if (isCharacterPath()) {
      // 2025-10-04 기준으로 스토리에는 소설형 UI가 존재하지 않음
      return document.getElementsByClassName(
        isDarkMode() ? "css-f5nv21" : "css-1xhj18k"
      ).length;
    }
    // 첫번째 클래스가 채팅형 UI, 두번째 클래스가 소설형 UI.
    return (
      isDarkMode()
        ? getHigherNodes("css-1ifxcjt", "css-15hxmwz")
        : getHigherNodes("css-1ifxcjt", "css-15hxmwz")
    ).length;
  }

  /**
   * 두개의 클래스를 받아 더 많은 수의 컴포넌트가 존재하는 컴포넌트 배열을 반환합니다.
   * @param {string} clsFirst 첫번째 클래스
   * @param {string} clsSecond 두번쨰 클래스
   * @returns {HTMLElement[]} 더 많은 수의 컴포넌트 배열
   */
  function getHigherNodes(clsFirst, clsSecond) {
    const selectedFirst = document.getElementsByClassName(clsFirst);
    const selectedSecond = document.getElementsByClassName(clsSecond);
    return selectedFirst.length > selectedSecond.length
      ? selectedFirst
      : selectedSecond;
  }

  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    enableStoryCounter: true,
    enableCharacterCounter: true,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-cntr-settings");
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

  // =====================================================
  //                      로직
  // =====================================================

  function getChattingLogState(chatId) {
    let currentLoadingData = lastDetectedMessageCount[chatId];
    if (!currentLoadingData) {
      currentLoadingData = lastDetectedMessageCount[chatId] = {
        isLoading: false,
        lastDetected: -1,
      };
    }
    return currentLoadingData;
  }

  function isRenderedMessageChanged(chatId) {
    const state = getChattingLogState(chatId);
    const rendered = getRenderedMessageCount();
    if (rendered != state.lastDetected) {
      return true;
    }
    return false;
  }

  function setCachedRenderedMessage(chatId, count) {
    getChattingLogState(chatId).lastDetected = count;
  }

  function isChattingLogLoading(chatId) {
    return getChattingLogState(chatId).isLoading;
  }

  function setChattingLogLoading(chatId, loading) {
    getChattingLogState(chatId).isLoading = loading;
  }

  function invalidateOthers() {
    if (!isStoryPath() && !isCharacterPath()) {
      for (let key in Object.getOwnPropertyNames(lastDetectedMessageCount)) {
        delete lastDetectedMessageCount[key];
      }
    } else {
      const split = window.location.pathname.substring(1).split("/");
      const chatRoomId = split[3];
      for (let key of Object.keys(lastDetectedMessageCount)) {
        if (chatRoomId !== key) {
          delete lastDetectedMessageCount[key];
        }
      }
    }
  }

  async function doFetchMessageCounts(chatId, turnIndicatorElement) {
    try {
      if (!isRenderedMessageChanged(chatId) || isChattingLogLoading(chatId)) {
        return;
      }
      setCachedRenderedMessage(chatId, getRenderedMessageCount());
      setChattingLogLoading(chatId, true);
      const count = isStoryPath()
        ? await fetchMessageCount(chatId, (count) => {
            turnIndicatorElement.textContent = `${count}턴`;
          })
        : await fetchCharacterMessageCount(chatId, (count) => {
            turnIndicatorElement.textContent = `${count}턴`;
          });
      turnIndicatorElement.textContent = `${count}턴`;
    } catch (err) {
      if (turnIndicatorElement.textContent !== "오류!") {
        turnIndicatorElement.textContent = "오류!";
      }
      console.error(err);
    }
    setChattingLogLoading(chatId, false);
  }
  /**
   *
   * @param {string} chatRoomId
   * @param {string} messageId
   */
  async function isMessageCached(chatRoomId, messageId) {
    return (
      (await db.chatStore
        .where("combinedId")
        .equals(`${chatRoomId}+${messageId}`)
        .count()) > 0
    );
  }

  async function setMessageCached(chatRoomId, messageId) {
    await db.chatStore.put({
      combinedId: `${chatRoomId}+${messageId}`,
      chatId: chatRoomId,
      messageId: messageId,
    });
  }

  async function getMessageCount(chatRoomId) {
    return await db.chatStore.where("chatId").equals(chatRoomId).count();
  }

  // Will update later - Auto delete expired data to reduce internal web storage limit
  async function setLastAccess(chatRoomId) {
    await db.chatData.put({
      chatId: chatRoomId,
      time: new Date().getTime(),
    });
  }

  async function setMessageCount(chatRoomId) {
    await db.chatData.put({
      chatId: chatRoomId,
      time: new Date().getTime(),
    });
  }

  async function fetchMessageCount(chatId, liveReceiver) {
    await setLastAccess(chatId);
    let chatCounts = await getMessageCount(chatId);
    let changed = false;
    let url = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=20`;
    let continueFetch = true;
    while (continueFetch) {
      const result = await retryAuthFetch(3, "GET", url);
      if (!result || result instanceof Error) {
        throw result ?? new Error("Unknwon error from request");
      }
      const dataMessages = result.data.messages;
      for (let message of dataMessages) {
        const messageId = message._id;
        if (message.role === "user") continue;
        if (!(await isMessageCached(chatId, messageId))) {
          await setMessageCached(chatId, messageId);
          changed = true;
          liveReceiver(++chatCounts);
          // Let's add some "Modification animation"
          await new Promise((resolve) => setTimeout(resolve, 2));
        } else {
          // Message ID already cached, stop fetching
          continueFetch = false;
          break;
        }
      }
      if (result.data.hasNext && result.data.nextCursor) {
        url = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=20&cursor=${result.data.nextCursor}`;
        // Waiting 50ms to avoid ratelimiting
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        break;
      }
    }
    return chatCounts;
  }

  async function fetchCharacterMessageCount(chatId, liveReceiver) {
    await setLastAccess(chatId);
    let chatCounts = await getMessageCount(chatId);
    let changed = false;
    let url = `https://crack-api.wrtn.ai/crack-gen/character-chats/${chatId}/messages?limit=40`;
    let continueFetch = true;
    while (continueFetch) {
      const result = await retryAuthFetch(3, "GET", url);
      if (!result || result instanceof Error) {
        throw result ?? new Error("Unknwon error from request");
      }
      const dataMessages = result.data.messages;
      for (let message of dataMessages) {
        const messageId = message._id;
        if (message.role === "user") continue;
        if (!(await isMessageCached(chatId, messageId))) {
          await setMessageCached(chatId, messageId);
          changed = true;
          liveReceiver(++chatCounts);
          // Let's add some "Modification animation"
          await new Promise((resolve) => setTimeout(resolve, 2));
        } else {
          // Message ID already cached, stop fetching
          continueFetch = false;
          break;
        }
      }
      if (result.data.hasNext && result.data.nextCursor) {
        url = `https://crack-api.wrtn.ai/crack-gen/character-chats/${chatId}/messages?limit=40&cursor=${result.data.nextCursor}`;
        // Waiting 50ms to avoid ratelimiting
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        break;
      }
    }
    return chatCounts;
  }

  // =====================================================
  //                      SVG
  // =====================================================
  // https://www.svgrepo.com/svg/446075/time-history
  function createHistorySvg() {
    return `<svg width="16px" height="16px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="var(--text_primary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>time-history</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="icons_Q2" data-name="icons Q2"> <path d="M46,24A22,22,0,0,1,4.3,33.7a2,2,0,0,1,.5-2.6,2,2,0,0,1,3,.7A18,18,0,1,0,10.6,12h5.3A2.1,2.1,0,0,1,18,13.7,2,2,0,0,1,16,16H6a2,2,0,0,1-2-2V4.1A2.1,2.1,0,0,1,5.7,2,2,2,0,0,1,8,4V8.9A22,22,0,0,1,46,24Z"></path> <path d="M34,32a1.7,1.7,0,0,1-1-.3L22,25.1V14a2,2,0,0,1,4,0v8.9l9,5.4a1.9,1.9,0,0,1,.7,2.7A1.9,1.9,0,0,1,34,32Z"></path> </g> </g> </g></svg>`;
  }

  // https://www.svgrepo.com/svg/491399/dot-small
  function createDotSvg() {
    return `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="var(--text_primary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="#FFFFFF"></path> </g></svg>`;
  }

  // =====================================================
  //                      UI
  // =====================================================
  function createLoadingDivision() {
    const div = document.createElement("div");
    div.style.cssText =
      "display: flex; flex-direction: row; width: fit-content; height: fit-content; align-content: center;";
    let element = document.createElement("div");
    element.innerHTML = createDotSvg();
    element.style.cssText = "width: 16px; height: 16px;";
    element.classList.add("chasm-counter-dot-01");
    div.append(element);
    element = document.createElement("div");
    element.innerHTML = createDotSvg();
    element.style.cssText = "width: 16px; height: 16px;";
    element.classList.add("chasm-counter-dot-02");
    div.append(element);
    element = document.createElement("div");
    element.innerHTML = createDotSvg();
    element.style.cssText = "width: 16px; height: 16px;";
    element.classList.add("chasm-counter-dot-03");
    div.append(element);
    return div;
  }

  // =====================================================
  //                 Element Injection
  // =====================================================

  function getTopSharedDivision() {
    let upperBar = document.getElementById("chasm-shared-chatting-bar");
    if (!upperBar) {
      let parentElement;
      if (isCharacterPath()) {
        parentElement = document.getElementsByClassName(
          isDarkMode() ? "css-12u91zd" : "css-12u91zd"
        );
      } else {
        parentElement = document.getElementsByClassName(
          isDarkMode() ? "css-nqviro" : "css-nqviro"
        );
      }
      if (!parentElement || parentElement.length <= 0) {
        return undefined;
      }
      upperBar = document.createElement("div");
      upperBar.id = "chasm-shared-chatting-bar";
      upperBar.className = "chasm-counter-shared-bar";
      if (isCharacterPath()) {
        parentElement[0].classList.add("chasm-counter-flex-adjuster");
        parentElement[0].insertBefore(upperBar, parentElement[0].childNodes[0]);
      } else {
        const wrapper = document.createElement("div");
        wrapper.className = "chasm-counter-shared-bar-wrapper";
        wrapper.appendChild(upperBar);
        parentElement[0].classList.add("chasm-counter-flex-adjuster");
        parentElement[0].insertBefore(wrapper, parentElement[0].childNodes[0]);
      }
    }
    return upperBar;
  }

  function injectElement() {
    const split = window.location.pathname.substring(1).split("/");
    const chatRoomId = split[3];
    if (document.getElementById("chasm-counter-indicator")) {
      const messageNode = document.getElementById(
        "chasm-counter-indicator-container"
      );
      if (!messageNode) return;
      doFetchMessageCounts(chatRoomId, messageNode);
      return;
    }
    const division = getTopSharedDivision();
    if (!division) return;
    const element = document.createElement("div");
    element.id = "chasm-counter-indicator";
    element.style.cssText =
      "display: flex; flex-direction: row; align-items: center;";

    const icon = document.createElement("div");
    icon.style.cssText = "width: 16px; height: 16px;";
    icon.innerHTML = createHistorySvg();
    element.append(icon);

    const text = document.createElement("div");
    text.id = "chasm-counter-indicator-container";
    text.style.cssText =
      "color: var(--text_primary); margin-left: 4px; font-size: 14px;";
    text.textContent = "--";
    element.append(text);
    division.append(element);
    doFetchMessageCounts(chatRoomId, text);
  }

  // =====================================================
  //                   Initialization
  // =====================================================

  function setup() {
    if (!isStoryCounterEnabled() && !isCharacterCounterEnabled()) return;
    injectElement();
  }

  function prepare() {
    setup();
    attachObserver(document, () => {
      setup();
    });
    attachHrefObserver(document, () => {
      invalidateOthers();
      const textNode = document.getElementById(
        "chasm-counter-indicator-container"
      );
      if (textNode) {
        textNode.textContent = "--";
      }
    });
  }

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 계수기", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addSwitchBox(
          "cntr-story",
          "스토리 채팅 계수기",
          "스토리 채팅에서의 계수기 표시를 활성화합니다.",
          {
            defaultValue: settings.enableStoryCounter,
            action: (_, value) => {
              settings.enableStoryCounter = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "cntr-character",
          "캐릭터 채팅 계수기",
          "캐릭터 채팅에서의 계수기 표시를 활성화합니다.",
          {
            defaultValue: settings.enableCharacterCounter,
            action: (_, value) => {
              settings.enableCharacterCounter = value;
              saveSettings();
            },
          }
        );
      }, "결정화 캐즘 계수기");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 계수기");
      panel
        .addText("결정화 캐즘 계수기의 모든 아이콘은 SVGRepo에서 가져왔습니다.")
        .addText(
          "또한, 일부의 외부 프레임워크를 통해 웹 내부 데이터베이스를 관리하고 있습니다."
        )
        .addText(
          "- 시계 아이콘 (https://www.svgrepo.com/svg/446075/time-history)"
        )
        .addText("- dexie.js 프레임워크 (https://dexie.org/)")
        .addText(
          "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)"
        );
    });
  }

  document.testClear = async () => {
    return await db.chatStore.clear();
  };

  loadSettings();
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
          const clonedElement = item.cloneNode(true);
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
          item.parentElement.append(clonedElement);
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
          const clonedElement = element.cloneNode(true);
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
          element.parentElement.append(clonedElement);
        }
      }
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
