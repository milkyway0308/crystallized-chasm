/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized Lyophilization (결정화 캐즘 동결건조)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-LYOP-v1.0.0
// @description  채팅방 백업 및 완전한 아카이브화 지원. 이 기능은 원본 채팅 백업 확장 스크립트의 유지보수 버전입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/lyophilization.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/lyophilization.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.13/decentralized-modal.js#sha256-tt5YRTDFPCoQwcSaw4d4QnjTytPbyVNLzM3g8rkdi8Q=
// @grant        GM_addStyle
// ==/UserScript==
(function () {
  class PlatformMessage {
    /**
     *
     * @param {string} role
     * @param {string} userName
     * @param {string} message
     */
    constructor(role, userName, message) {
      this.role = role;
      this.userName = userName;
      this.message = message;
    }

    anonymize() {
      return {
        role: this.role,
        message: this.message,
      };
    }

    withPersona(persona) {
      return new PlatformMessage(this.role, persona, this.message);
    }
  }

  function createCopySVG() {
    return `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z" fill="var(--icon_tertiary)"></path> </g></svg>`;
  }

  function createDownloadSVG() {
    return `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.625 15C5.625 14.5858 5.28921 14.25 4.875 14.25C4.46079 14.25 4.125 14.5858 4.125 15H5.625ZM4.875 16H4.125H4.875ZM19.275 15C19.275 14.5858 18.9392 14.25 18.525 14.25C18.1108 14.25 17.775 14.5858 17.775 15H19.275ZM11.1086 15.5387C10.8539 15.8653 10.9121 16.3366 11.2387 16.5914C11.5653 16.8461 12.0366 16.7879 12.2914 16.4613L11.1086 15.5387ZM16.1914 11.4613C16.4461 11.1347 16.3879 10.6634 16.0613 10.4086C15.7347 10.1539 15.2634 10.2121 15.0086 10.5387L16.1914 11.4613ZM11.1086 16.4613C11.3634 16.7879 11.8347 16.8461 12.1613 16.5914C12.4879 16.3366 12.5461 15.8653 12.2914 15.5387L11.1086 16.4613ZM8.39138 10.5387C8.13662 10.2121 7.66533 10.1539 7.33873 10.4086C7.01212 10.6634 6.95387 11.1347 7.20862 11.4613L8.39138 10.5387ZM10.95 16C10.95 16.4142 11.2858 16.75 11.7 16.75C12.1142 16.75 12.45 16.4142 12.45 16H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM4.125 15V16H5.625V15H4.125ZM4.125 16C4.125 18.0531 5.75257 19.75 7.8 19.75V18.25C6.61657 18.25 5.625 17.2607 5.625 16H4.125ZM7.8 19.75H15.6V18.25H7.8V19.75ZM15.6 19.75C17.6474 19.75 19.275 18.0531 19.275 16H17.775C17.775 17.2607 16.7834 18.25 15.6 18.25V19.75ZM19.275 16V15H17.775V16H19.275ZM12.2914 16.4613L16.1914 11.4613L15.0086 10.5387L11.1086 15.5387L12.2914 16.4613ZM12.2914 15.5387L8.39138 10.5387L7.20862 11.4613L11.1086 16.4613L12.2914 15.5387ZM12.45 16V5H10.95V16H12.45Z" fill="var(--icon_tertiary)"></path> </g></svg>`;
  }

  function createHTMLSVG() {
    return `<svg width="24px" height="24px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="var(--icon_tertiary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M4 16v-2H2v2H1v-5h1v2h2v-2h1v5H4zM7 16v-4H5.6v-1h3.7v1H8v4H7zM10 16v-5h1l1.4 3.4h.1L14 11h1v5h-1v-3.1h-.1l-1.1 2.5h-.6l-1.1-2.5H11V16h-1zM19 16h-3v-5h1v4h2v1zM9.4 4.2L7.1 6.5l2.3 2.3-.6 1.2-3.5-3.5L8.8 3l.6 1.2zm1.2 4.6l2.3-2.3-2.3-2.3.6-1.2 3.5 3.5-3.5 3.5-.6-1.2z"></path> </g> </g></svg>`;
  }

  // =================================================
  //                    HTML 추출 유틸리티
  // =================================================
  // =================================================
  //                 크랙 종속성 유틸리티
  // =================================================

  function getCurrentChatId() {
    if (isChattingPath()) {
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      const chatRoomId = split[3];
      return chatRoomId;
    }
    return undefined;
  }

  function getCharacterId() {
    if (isChattingPath()) {
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      const chatRoomId = split[3];
      return characterId;
    }
    return undefined;
  }

  async function getCharacterInfo(characterId) {
    const url = `https://crack-api.wrtn.ai/crack-gen/v3/chats/stories/${characterId}`;
    const result = await authFetch("GET", url);
    if (result instanceof Error) {
      return result;
    }
    return result.data ?? new Error("알 수 없는 오류가 발생하였습니다.");
  }

  async function fetchMessages(chatId, maxCount) {
    const messages = [];
    let url = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=20`;
    let currentCursor = undefined;
    while (maxCount === 0 || messages.length < maxCount) {
      const fetchResult = await authFetch("GET", url);
      if (fetchResult instanceof Error) {
        throw fetchResult;
      }
      const rawMessage = fetchResult.data?.list ?? fetchResult.data.messages;
      if (!rawMessage) {
        throw new Error("메시지를 가져오는데에 실패하였습니다.");
      }
      for (let message of rawMessage) {
        if (maxCount !== 0 && messages.length >= maxCount) break;
        messages.unshift(
          new PlatformMessage(message.role, "user", message.content)
        );
      }
      if (
        fetchResult.data.nextCursor &&
        fetchResult.data.nextCursor != currentCursor
      ) {
        currentCursor = fetchResult.data.nextCursor;
        url = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=20&cursor=${fetchResult.data.nextCursor}`;
      } else {
        break;
      }
    }
    return messages;
  }

  async function getRepresentivePersona(chatId) {
    const userIdFetch = await authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-api/profiles"
    );
    if (userIdFetch instanceof Error) {
      return userIdFetch;
    }
    const wrtnId = userIdFetch.data?.wrtnUid;
    if (!wrtnId) {
      return new Error("Wrtn UID not found");
    }
    const userId = userIdFetch.data?._id;
    if (!userId) {
      return new Error("User ID not found");
    }
    const personaFetch = await authFetch(
      "GET",
      `https://crack-api.wrtn.ai/crack-api/profiles/${userId}/chat-profiles`
    );
    if (personaFetch instanceof Error) {
      return personaFetch;
    }
    const personaResult = personaFetch.data?.chatProfiles;
    if (!personaResult) {
      return new Error("Persona list not found");
    }
    const roomData = await authFetch(
      "GET",
      `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}`
    );
    if (!roomData) {
      return new Error("Chatting room not found");
    }
    if (roomData.data?.chatProfile?._id) {
      return roomData.data?.chatProfile?._id;
    } else {
      for (let data of personaResult) {
        if (data.isRepresentative === true) {
          return data._id;
        }
      }

      return new Error("No active representive persona");
    }
  }
  /**
   * 현재 URL이 채팅방의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isChattingPath() {
    // 2025-09-17 Path
    return (
      /\/stories\/[a-f0-9]+\/episodes\/[a-f0-9]+/.test(location.pathname) ||
      // 2025-09-11 Path
      /\/characters\/[a-f0-9]+\/chats\/[a-f0-9]+/.test(location.pathname) ||
      // Legacy Path
      /\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)
    );
  }
  /**
   * 사이드 패널의 요소를 찾아 반환합니다.
   * @returns {HTMLElement} 사이드 패널 요소
   */
  function extractSidePanel() {
    const node = isDarkMode()
      ? document.getElementsByClassName("css-c82bbp")[0]
      : document.getElementsByClassName("css-c82bbp")[0];

    if (node) {
      return node.childNodes[0].childNodes[0];
    }
    return undefined;
  }

  /**
   * 크랙 페이지의 테마가 다크 모드인지 확인합니다.
   * @returns {boolean} 다크 모드 여부
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
  function extractCookie(key) {
    const e = document.cookie.match(
      new RegExp(
        `(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`
      )
    );
    return e ? decodeURIComponent(e[1]) : null;
  }
  // =================================================
  //                     유틸리티
  // =================================================
  /**
   * 인증키를 통해 HTTP 요청을 보냅니다.
   * @param {string} url URL
   * @param {string} method 메서드
   * @param {*|undefined} body 바디 데이터
   * @param {string|undefined} authKey 인증 키 혹은 undefined
   * @param {string|undefined} contentsType 컨텐츠 타입 혹은 undefined
   * @returns {Promise<Response>} 응답
   */
  function fetchWithAuth(url, method, body, authKey, contentsType) {
    const init = {
      method: method,
      headers: {},
    };
    if (body) {
      init.body = JSON.stringify(body);
    }
    if (authKey) {
      init.headers.Authorization = authKey;
    }
    if (contentsType) {
      init.headers["Content-Type"] = contentsType;
    }
    return fetch(url, init);
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

  function log(message) {
    console.log(
      "%cChasm Crystallized Lyophilization: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Lyophilization: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Lyophilization: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }

  // =================================================
  //                    초기화
  // =================================================
  function setup() {
    if (!isChattingPath()) return;
    injectButton(
      "chasm-lyop-extract-raw-copy",
      createCopySVG(),
      "로그 복사",
      () => {
        const currentId = getCurrentChatId();
        if (!currentId) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "채팅방 ID를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요.",
            3000
          );
          return;
        }
        ToastifyInjector.findInjector().doToastifyAlert(
          "메시지를 불러오고 있어요.",
          3000
        );
        const amount = parseInt(
          prompt(
            "최대 몇 개의 메시지를 가져올까요?\n0으로 입력시, 모든 메시지를 가져옵니다.",
            "0"
          )
        );
        if (amount === undefined || amount === null || amount === Number.NaN) {
          return;
        }
        if (amount < 0) {
          confirm("0개 미만의 개수는 가져올 수 없습니다.");
          return;
        }
        fetchMessages(currentId, amount)
          .then(async (result) => {
            try {
              await window.navigator.clipboard.writeText(
                JSON.stringify(
                  {
                    messages: result,
                  },
                  undefined,
                  2
                )
              );
              ToastifyInjector.findInjector().doToastifyAlert(
                "클립보드로 채팅방 데이터를 복사했어요."
              );
            } catch (e) {
              ToastifyInjector.findInjector().doToastifyAlert(
                "클립보드로 데이터를 붙여넣는 도중 오류가 발생했어요."
              );
            }
          })
          .catch((err) => {
            console.error(err);
            ToastifyInjector.findInjector().doToastifyAlert(
              "메시지를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요."
            );
          });
      }
    );
    injectButton(
      "chasm-lyop-extract-raw",
      createDownloadSVG(),
      "로그 추출",
      () => {
        const currentId = getCurrentChatId();
        if (!currentId) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "채팅방 ID를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요.",
            3000
          );
          return;
        }
        ToastifyInjector.findInjector().doToastifyAlert(
          "메시지를 불러오고 있어요.",
          3000
        );
        const amount = parseInt(
          prompt(
            "최대 몇 개의 메시지를 가져올까요?\n0으로 입력시, 모든 메시지를 가져옵니다.",
            "0"
          )
        );
        if (amount === undefined || amount === null || amount === Number.NaN) {
          return;
        }
        if (amount < 0) {
          confirm("0개 미만의 개수는 가져올 수 없습니다.");
          return;
        }
        fetchMessages(currentId, amount)
          .then(async (result) => {
            const blob = new Blob(
              [
                JSON.stringify({
                  messages: result,
                }),
              ],
              { type: "text/plain;charset=UTF-8" }
            );

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${getCurrentChatId()}.txt`;
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
          })
          .catch((err) => {
            console.error(err);
            ToastifyInjector.findInjector().doToastifyAlert(
              "메시지를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요."
            );
          });
      }
    );
    // injectButton(
    //   "chasm-lyop-extract-html",
    //   createHTMLSVG(),
    //   "HTML로 추출",
    //   () => {
        
    //   }
    // );
  }

  function injectButton(id, svg, title, action) {
    const item = document.getElementsByClassName(id);
    if (item.length > 0) {
      return;
    }
    const panel = extractSidePanel();
    if (!panel) {
      return;
    }
    let appendingTarget = document.getElementById("chasm-lyop-eof");
    if (!appendingTarget) {
      for (let element of panel.getElementsByTagName("p")) {
        if (element.textContent === "나의 크래커") {
          const itemElement = element.cloneNode(true);
          itemElement.textContent = "채팅 내역 추출";
          panel.insertBefore(itemElement, element);
          const divier = document.createElement("div");
          divier.style.cssText = "height: 40px;";
          divier.id = "chasm-lyop-eof";
          itemElement.after(divier);
          break;
        }
      }
      appendingTarget = document.getElementById("chasm-lyop-eof");
    }
    if (!appendingTarget) return;
    const button = panel.childNodes[1].cloneNode(true);
    button.onclick = () => {};
    button.classList.add(id);
    button.addEventListener("click", action);
    if (svg) {
      const svgElements = button.getElementsByTagName("svg");
      if (svgElements.length > 0) {
        svgElements[0].outerHTML = svg;
      }
    }
    const components = button.getElementsByTagName("span");
    components[components.length - 1].textContent = title;

    panel.insertBefore(button, appendingTarget);
  }
  function prepare() {
    setup();
    attachObserver(document, () => {
      setup();
    });
  }
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);

  // toastify-injection.js - 크랙 Toastify 알림 인젝션

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
