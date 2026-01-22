/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name        Chasm Crystallized Counter (결정화 캐즘 계수기)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-CNTR-v1.3.0
// @description 채팅에 캐릭터 채팅 턴 계수기 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/counter.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/counter.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@4.2.1/dist/dexie.min.js#sha256-STeEejq7AcFOvsszbzgCDL82AjypbLLjD5O6tUByfuA=
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-toastify-injection@v1.0.0/crack/libraries/toastify-injection.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.0.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant       GM_addStyle
// ==/UserScript==
// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />

// @ts-ignore
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
  class MessageDetectionState {
    /**
     *
     * @param {boolean} isLoading
     * @param {number} lastDetected
     */
    constructor(isLoading, lastDetected) {
      this.isLoading = isLoading;
      this.lastDetected = lastDetected;
    }
  }
  /** @type {Map<string, MessageDetectionState>} */
  let lastDetectedMessageCount = new Map();
  // @ts-ignore
  const db = new Dexie("chasm-counter");
  await db.version(1).stores({
    chatStore: `combinedId, chatId, messageId`,
    chatData: `chatId, time`,
  });

  // =====================================================
  //                  크랙 종속 유틸리티
  // =====================================================

  function getRenderedMessageCount() {
    if (CrackUtil.path().isChattingPath()) {
      // 2025-10-04 기준으로 스토리에는 소설형 UI가 존재하지 않음
      return document.getElementsByClassName(
        CrackUtil.theme().isDarkTheme() ? "css-f5nv21" : "css-1xhj18k",
      ).length;
    }
    // 첫번째 클래스가 채팅형 UI, 두번째 클래스가 소설형 UI.
    return (
      CrackUtil.theme().isDarkTheme()
        ? getHigherNodes("css-1ifxcjt", "css-15hxmwz")
        : getHigherNodes("css-1ifxcjt", "css-15hxmwz")
    ).length;
  }

  /**
   * 두개의 클래스를 받아 더 많은 수의 컴포넌트가 존재하는 컴포넌트 배열을 반환합니다.
   * @param {string} clsFirst 첫번째 클래스
   * @param {string} clsSecond 두번쨰 클래스
   * @returns {Element[]} 더 많은 수의 컴포넌트 배열
   */
  function getHigherNodes(clsFirst, clsSecond) {
    const selectedFirst = document.getElementsByClassName(clsFirst);
    const selectedSecond = document.getElementsByClassName(clsSecond);
    return selectedFirst.length > selectedSecond.length
      ? Array.from(selectedFirst)
      : Array.from(selectedSecond);
  }

  // =====================================================
  //                      설정
  // =====================================================
  const settings = new LocaleStorageConfig("chasm-cntr-settings", {
    enableStoryCounter: true,
    enableCharacterCounter: true,
  });

  function isCharacterCounterEnabled() {
    return (
      settings.config.enableCharacterCounter &&
      CrackUtil.path().isCharacterPath()
    );
  }

  function isStoryCounterEnabled() {
    return settings.config.enableStoryCounter && CrackUtil.path().isStoryPath();
  }

  // =====================================================
  //                      로직
  // =====================================================

  /**
   *
   * @param {string} chatId
   * @returns
   */
  function getChattingLogState(chatId) {
    let currentLoadingData = lastDetectedMessageCount.get(chatId);
    if (!currentLoadingData) {
      currentLoadingData = new MessageDetectionState(false, -1);
      lastDetectedMessageCount.set(chatId, currentLoadingData);
    }
    return currentLoadingData;
  }

  /**
   *
   * @param {string} chatId
   * @returns {boolean}
   */
  function isRenderedMessageChanged(chatId) {
    const state = getChattingLogState(chatId);
    const rendered = getRenderedMessageCount();
    if (rendered != state.lastDetected) {
      return true;
    }
    return false;
  }

  /**
   *
   * @param {string} chatId
   * @param {number} count
   */
  function setCachedRenderedMessage(chatId, count) {
    getChattingLogState(chatId).lastDetected = count;
  }

  /**
   *
   * @param {string} chatId
   * @returns {boolean}
   */
  function isChattingLogLoading(chatId) {
    return getChattingLogState(chatId).isLoading;
  }

  /**
   *
   * @param {string} chatId
   * @param {boolean} loading
   */
  function setChattingLogLoading(chatId, loading) {
    getChattingLogState(chatId).isLoading = loading;
  }

  function invalidateOthers() {
    if (!CrackUtil.path().isChattingPath()) {
      for (let key in Object.getOwnPropertyNames(lastDetectedMessageCount)) {
        lastDetectedMessageCount.delete(key);
      }
    } else {
      const split = window.location.pathname.substring(1).split("/");
      const chatRoomId = split[3];
      for (let key of Object.keys(lastDetectedMessageCount)) {
        if (chatRoomId !== key) {
          lastDetectedMessageCount.delete(key);
        }
      }
    }
  }

  /**
   *
   * @param {string} chatId
   * @param {Element} turnIndicatorElement
   * @returns
   */
  async function doFetchMessageCounts(chatId, turnIndicatorElement) {
    try {
      if (!isRenderedMessageChanged(chatId) || isChattingLogLoading(chatId)) {
        return;
      }
      setCachedRenderedMessage(chatId, getRenderedMessageCount());
      setChattingLogLoading(chatId, true);
      const count = await fetchMessageCount(chatId, (count) => {
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

  /**
   *
   * @param {string} chatRoomId
   * @param {string} messageId
   */
  async function setMessageCached(chatRoomId, messageId) {
    await db.chatStore.put({
      combinedId: `${chatRoomId}+${messageId}`,
      chatId: chatRoomId,
      messageId: messageId,
    });
  }

  /**
   *
   * @param {string} chatRoomId
   * @returns {Promise<number>}
   */
  async function getMessageCount(chatRoomId) {
    return await db.chatStore.where("chatId").equals(chatRoomId).count();
  }

  // Will update later - Auto delete expired data to reduce internal web storage limit
  /**
   *
   * @param {string} chatRoomId
   */
  async function setLastAccess(chatRoomId) {
    await db.chatData.put({
      chatId: chatRoomId,
      time: new Date().getTime(),
    });
  }

  /**
   *
   * @param {string} chatRoomId
   */
  async function setMessageCount(chatRoomId) {
    await db.chatData.put({
      chatId: chatRoomId,
      time: new Date().getTime(),
    });
  }

  /**
   *
   * @param {string} chatId
   * @param {(count: number) => void} liveReceiver
   * @returns
   */
  async function fetchMessageCount(chatId, liveReceiver) {
    await setLastAccess(chatId);
    let chatCounts = await getMessageCount(chatId);
    const iterator = CrackUtil.chatRoom().iterateLogs(chatId);
    for await (let log of iterator) {
      if (log.isUser()) continue;
      if (await isMessageCached(chatId, log.id)) {
        break;
      } else {
        await setMessageCached(chatId, log.id);
        liveReceiver(++chatCounts);
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
      if (CrackUtil.path().isCharacterPath()) {
        parentElement = document.getElementsByClassName(
          CrackUtil.theme().isDarkTheme() ? "css-12u91zd" : "css-12u91zd",
        );
      } else {
        parentElement = document.getElementsByClassName(
          CrackUtil.theme().isDarkTheme() ? "css-nqviro" : "css-nqviro",
        );
      }
      if (!parentElement || parentElement.length <= 0) {
        return undefined;
      }
      upperBar = document.createElement("div");
      upperBar.id = "chasm-shared-chatting-bar";
      upperBar.className = "chasm-counter-shared-bar";
      if (CrackUtil.path().isCharacterPath()) {
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
        "chasm-counter-indicator-container",
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
    GenericUtil.attachObserver(document, () => {
      setup();
    });
    GenericUtil.attachHrefObserver(document, () => {
      invalidateOthers();
      const textNode = document.getElementById(
        "chasm-counter-indicator-container",
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
            defaultValue: settings.config.enableStoryCounter,
            onChange: (_, value) => {
              settings.config.enableStoryCounter = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "cntr-character",
          "캐릭터 채팅 계수기",
          "캐릭터 채팅에서의 계수기 표시를 활성화합니다.",
          {
            defaultValue: settings.config.enableCharacterCounter,
            onChange: (_, value) => {
              settings.config.enableCharacterCounter = value;
              settings.save();
            },
          },
        );
      }, "결정화 캐즘 계수기");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 계수기");
      panel
        .addText("결정화 캐즘 계수기의 모든 아이콘은 SVGRepo에서 가져왔습니다.")
        .addText(
          "또한, 일부의 외부 프레임워크를 통해 웹 내부 데이터베이스를 관리하고 있습니다.",
        )
        .addText(
          "- 시계 아이콘 (https://www.svgrepo.com/svg/446075/time-history)",
        )
        .addText("- dexie.js 프레임워크 (https://dexie.org/)")
        .addText(
          "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)",
        );
    });
  }

  // @ts-ignore
  document.testClear = async () => {
    return await db.chatStore.clear();
  };

  settings.load();
  addMenu();
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare));

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
          const clonedElement = GenericUtil.clone(element);
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
