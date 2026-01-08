// ==UserScript==
// @name         Chasm Crystallized Fold (결정화 캐즘 폴드)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-FOLD-v2.0.0
// @description  채팅창 병합 및 접힘 기능 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/fold.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/fold.user.js
// @require     https://cdn.jsdelivr.net/npm/dexie@4.2.1/dist/dexie.min.js#sha256-STeEejq7AcFOvsszbzgCDL82AjypbLLjD5O6tUByfuA=
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(`
  @keyframes slide-out {
    0% {
      opacity: 1;
      transform: translateX(0%); 

    }
    65% {
    }
    100% {
      opacity: 0;
      transform: translateX(-50%); 
    }
  }
  .chasm-fold-hide {
    position: absolute;
    top: 50px;
    animation: slide-out 0.5s ease-in;
    animation-fill-mode: forwards;
    overflow-x: hidden;
    pointer-events: none;
    margin-top: 45px;
  }

  .chasm-toggle-button {
    width: fit-content;
    height: 24px;
    align-items: center;
    display: flex;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: rgb(97, 96, 90);
    border: 1px solid rgb(199, 197, 189);
    justify-content: center;
    padding-left: 12px;
    padding-right: 12px;
    gap: 4px;
    border-radius: 100px;
    overflow: hidden;
    flex-direction: row;
  }

  .chasm-fold-divider {
    margin-left: 10px; 
    font-size: 15px;
    width: fit-content; 
    white-space: nowrap; 
    color: gray; 
    font-family: Pretendard; 
    font-weight: bold;
  }

  .chasm-fold-container {
    padding: 0px 8px;
  }

  .chasm-fold-wrapper {
    display: flex;
    flex-direction: row;
    height: 64px;
    width: 100%;
    padding: 0px 8px;
    gap: 4px;
    align-items: center;
  }

  .chasm-fold-thumbnail {
    width: 36px;
    height: 36px;
    overflow: hidden;
    border-radius: 50%;
  }

  .chasm-fold-text-wrapper {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
  }

  .chasm-fold-title {
    color: rgb(26, 25, 24);
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
  }

  .chasm-fold-description {
    color: rgb(97, 96, 90);
    font-weight: 500;
    font-size: 12px;
    margin-top: 4px;
    whitespace: nowrap;
  }


`);
(async function () {
  const db = new Dexie("chasm-fold");
  await db.version(1).stores({
    characters: `characterId, title, image, lastPlayed`,
    sessions: `chatId, characterId, title, lastPlayed`,
  });
  // ==================================================
  //                       로직
  // ==================================================
  function clearOutSidebar() {
    const sideBar = document.getElementsByClassName("css-kvsjdq");
    if (sideBar.length > 0) {
      sideBar[0].classList.add("chasm-fold-hide");
    }
  }
  document.format = formatLayout;
  document.testClearSide = clearOutSidebar;
  document.displayLayout = displayLayout;

  function formatLayout() {
    const parentItem = document.getElementsByClassName("css-8v90jo");
    if (parentItem.length > 0) {
      parentItem[0].append(createToggleButton());
    }
  }

  async function displayLayout() {
    if (!document.getElementById("chasm-fold-container")) {
      const container = createFoldContainer();
      container.id = "chasm-fold-container";
      const parentItem = document.getElementsByClassName("css-8arv0c");
      if (parentItem.length > 0) {
        parentItem[0].appendChild(container);
      }
    }
    if (!document.getElementById("chasm-fold-container")) {
      return;
    }
    if (!document.getElementById("chasm-toggle-button")) {
      const parentItem = document.getElementsByClassName("css-8v90jo");
      if (parentItem.length > 0) {
        const button = createToggleButton();
        button.id = "chasm-toggle-button";
        parentItem[0].append(button);
      }
    }
    const fetched = await db.characters.reverse().sortBy("lastPlayed");
    const container = document.getElementById("chasm-fold-container");
    for (let item of fetched) {
      const sessions = await db.sessions
        .where({ characterId: item.characterId })
        .reverse()
        .sortBy("lastPlayed");
      console.log(item);
      container.appendChild(
        createTitleDivider(
          item.title,
          item.image,
          item.lastPlayed,
          sessions.length
        )
      );
    }
  }

  async function reloadStoryData(force) {
    let nextCursor = undefined;
    while (true) {
      const result = await authFetch(
        "GET",
        `https://crack-api.wrtn.ai/crack-gen/v3/chats?limit=40${
          nextCursor === undefined ? "" : `&cursor=${nextCursor}`
        }`
      );
      if (result instanceof Error) {
        return;
      }
      const data = result.data;
      for (let item of data.chats) {
        const characterId = item.story._id;
        const chatId = item._id;
        const lastPlayed = item.messagedAt ?? item.updatedAt ?? item.createdAt;
        const parsedLastPlayed = new Date(lastPlayed);
        if (await isDataUpdated(chatId, parsedLastPlayed.getTime())) {
          if (await isStoryUpdated(characterId, parsedLastPlayed.getTime())) {
            await updateStory(
              characterId,
              item.story.name,
              item.story.profileImage.origin,
              parsedLastPlayed.getTime()
            );
          }
          await updateSession(
            chatId,
            characterId,
            item.title,
            parsedLastPlayed.getTime()
          );
        } else {
          if (!force) break;
        }
      }

      if (data.nextCursor) {
        nextCursor = data.nextCursor;
      } else {
        break;
      }
    }
  }
  // ==================================================
  //                  노드 / 태그 생성
  // ==================================================

  function createDivider(text, isFirst) {
    let container = document.createElement("div");

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
    return container;
  }

  function createTitleDivider(title, imageSrc, time, amount) {
    const container = document.createElement("div");
    container.className = "chasm-fold-wrapper";
    // Image
    {
      const image = document.createElement("img");
      image.src = imageSrc;
      image.className = "chasm-fold-thumbnail";
      container.append(image);
    }
    // Text container (Vertical)
    {
      const textContainer = document.createElement("div");
      textContainer.className = "chasm-fold-text-wrapper";
      {
        const titleElement = document.createElement("span");
        titleElement.textContent = title;
        titleElement.className = "chasm-fold-title";
        textContainer.append(titleElement);
      }
      {
        const titleElement = document.createElement("span");
        titleElement.textContent = `${amount}개의 세션`;
        const elapsed = (new Date().getTime() - time) / 1000;
        console.log(elapsed);
        if (elapsed < 60) {
          titleElement.textContent = `${titleElement.textContent}, ${Math.floor(
            elapsed
          )}초 전 갱신`;
        } else if (elapsed < 60 * 60) {
          titleElement.textContent = `${titleElement.textContent}, ${Math.floor(
            elapsed / 60
          )}분 전 갱신`;
        } else if (elapsed < 60 * 60 * 24) {
          titleElement.textContent = `${titleElement.textContent}, ${Math.floor(
            elapsed / 60 / 60
          )}시간 전 갱신`;
        } else if (elapsed < 60 * 60 * 24 * 31) {
          titleElement.textContent = `${titleElement.textContent}, ${Math.floor(
            elapsed / 60 / 60 / 24
          )}일 전 갱신`;
        } else if (elapsed < 60 * 60 * 24 * 31 * 12) {
          titleElement.textContent = `${titleElement.textContent}, ${Math.floor(
            elapsed / 60 / 60 / 24 / 31
          )}개월 전 갱신`;
        } else {
          titleElement.textContent = `${titleElement.textContent}, ${Math.floor(
            elapsed / 60 / 60 / 24 / 31 / 12
          )}년 전 갱신`;
        }
        titleElement.className = "chasm-fold-description";
        textContainer.append(titleElement);
      }
      container.append(textContainer);
    }
    // Navigation arrow
    {
      const arrow = document.createElement("div");
      arrow.className = "chasm-fold-arrow";
      container.append(arrow);
    }
    return container;
  }

  function createFoldContainer() {
    const element = document.createElement("div");
    element.className = "chasm-fold-container";
    return element;
  }

  function createArticleElement(title) {
    const element = document.createElement("div");
  }

  function createToggleButton() {
    const element = document.createElement("button");
    element.className = "chasm-toggle-button";
    element.textContent = "모드 변경";
    element.onclick = () => {
      ToastifyInjector.findInjector().doToastifyAlert(
        "폴드 모듈이 데이터 불러오기를 시작했어요.\n데이터 오염을 피하기 위해 이 페이지를 닫지 말아주세요.",
        3000
      );
      reloadStoryData().then(() => {
        ToastifyInjector.findInjector().doToastifyAlert(
          "폴드 모듈이 초기 데이터 불러오기를 완료했어요.\n앞으로는 로딩이 짧아져요.",
          3000
        );
      });
    };
    return element;
  }
  // ==================================================
  //                    데이터 유틸리티
  // ==================================================

  /**
   *
   * @param {string} roomId
   * @param {number} updateTime
   * @returns {Promise<boolean>}
   */
  async function isDataUpdated(roomId, updateTime) {
    const selectResult = await db.sessions.get({ chatId: roomId });
    if (selectResult) {
      return selectResult.lastPlayed > updateTime;
    }
    return true;
  }

  /**
   *
   * @param {string} chatId
   * @param {number} updateTime
   * @returns {Promise<boolean>}
   */
  async function isStoryUpdated(chatId, updateTime) {
    const selectResult = await db.characters.get({ characterId: chatId });
    if (selectResult) {
      return selectResult.lastPlayed > updateTime;
    }
    return true;
  }

  async function updateStory(characterId, title, image, updateTime) {
    await db.characters.put({
      characterId: characterId,
      title: title,
      image: image,
      lastPlayed: updateTime,
    });
  }

  async function updateSession(chatId, characterId, title, updateTime) {
    await db.sessions.put({
      chatId: chatId,
      characterId: characterId,
      title: title,
      lastPlayed: updateTime,
    });
  }
  // ==================================================
  //                  크랙 통신 유틸리티
  // ==================================================

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
          accept: "application/json",
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
  // "loading" === document.readyState
  //   ? (document.addEventListener("DOMContentLoaded", doInitialize),
  //     window.addEventListener("load", doInitialize))
  //   : "interactive" === document.readyState ||
  //     "complete" === document.readyState
  //   ? await doInitialize()
  //   : setTimeout(doInitialize, 100);

  function createTriangleSvg() {
    const item = document.createElement("div");
    item.innerHTML = `<svg fill="#000000" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" xml:space="preserve" width="64px" height="64px"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;} </style> <path d="M18.5,15.5l-6-7l-6,7H18.5z"></path> <rect class="st0" width="24" height="24"></rect> <rect class="st0" width="24" height="24"></rect> </g></svg>`;
    return item;
  }
  // =====================================================
  //                 Toastify Injection
  // =====================================================
  /**
   * 크랙 플랫폼의 Toastify 인젝션을 쉽게 해주는 유틸리티 클래스입니다.
   */
  class ToastifyInjector {
    /**
     * 마지막으로 등록된 인젝터를 가져오거나, 등록합니다.
     * @returns {ToastifyInjector} 등록된 인스턴스
     */
    static findInjector() {
      if (document.__toastifyInjector) {
        return document.__toastifyInjector;
      }
      document.__toastifyInjector = new ToastifyInjector();
      return document.__toastifyInjector;
    }

    /**
     * ToastifyInjector을 초기화합니다.
     */
    constructor() {
      this.#init();
    }

    /**
     * 삽입된 알림 요소의 트래킹을 진행합니다.
     */
    #trackNotification() {
      const current = new Date().getTime();
      const toastifies = document.getElementsByClassName("Toastify");
      if (toastifies.length <= 0) {
        return;
      }
      const rootNode = toastifies[0];
      if (rootNode.childNodes.length > 0) {
        if (
          rootNode.getElementsByClassName("chasm-toastify-track").length !=
          rootNode.childNodes.length
        ) {
          for (const element of Array.from(
            rootNode.getElementsByClassName("chasm-toastify-track")
          )) {
            if (element.hasAttribute("completed")) {
              element.removeAttribute("completed");
              element.removeAt = current + 1000;
            }
          }
        }
      }
      for (const element of rootNode.getElementsByClassName(
        "chasm-toastify-track"
      )) {
        if (element.expireAt < current && element.hasAttribute("completed")) {
          element.removeAttribute("completed");
          element.removeAt = current + 1000;
        } else if (element.removeAt < current) {
          element.remove();
        }
      }
    }
    #init() {
      GM_addStyle(`
        .chasm-toastify-track {
            transform: translateY(-200%);
            transition: transform 0.4s;
        }

        .chasm-toastify-track[completed="true"] {
            transform: translateY(0);
            transition: transform 0.4s;
        }
    `);

      setInterval(this.#trackNotification, 50);
    }

    /**
     * 알림 요소를 삽입합니다.
     * 해당 펑션으로 삽입된 알림은 기존 알림을 강제로 제거합니다.
     *
     * 해당 펑션은 크랙 스타일 알림을 생성합니다.
     * @param {string} message 표시할 메시지
     * @param {number} expires 유지 시간 (ms)
     */
    doToastifyAlert(message, expires = 3000) {
      const textNode = document.createElement("p");
      textNode.textContent = message;
      textNode.style =
        "color: #FFFFFF; text-align: center; font-size: 16px; line-height: 140%; font-weight: 600; white-space: pre-line;";

      const containerNode = document.createElement("div");
      containerNode.style =
        "background-color: rgb(46, 45, 43); padding: 16px; border-radius: 10px; width: 100%; max-width: 95vw; height: 100%;";

      containerNode.append(textNode);

      const wrapperNode = document.createElement("div");
      wrapperNode.className =
        "Toastify__toast-container Toastify__toast-container--top-center chasm-toastify-track";
      wrapperNode.style.cssText =
        "background: transparent; min-width: 461px; min-height: 0px; height: fit-content; border-radius: 10px; justify-content: center; left: auto; justify-self: center;";
      wrapperNode.append(containerNode);

      wrapperNode.expireAt = new Date().getTime() + expires;

      const toastifies = document.getElementsByClassName("Toastify");
      if (toastifies.length <= 0) {
        return;
      }
      if (toastifies.length > 0) {
        for (const element of Array.from(toastifies[0].childNodes)) {
          element.remove();
        }
      }
      const rootNode = toastifies[0];
      rootNode.append(wrapperNode);
      setTimeout(() => {
        wrapperNode.setAttribute("completed", "true");
      });
    }
  }
})();
