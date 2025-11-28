/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized Local Sesimometer (캐즘 국소지진계)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-LSEM-v1.0.0
// @description  요약 메모리가 변경될 때 마다 알림 전송. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/local-seismometer.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/local-seismometer.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.js
// @grant        GM_addStyle
// ==/UserScript==
// =================================================
//                 Toastify 인젝션
// =================================================
!(async function () {
  const STANDARD_NOTIFICATION_TIME = 3000;
  let lastErrorToken = undefined;
  const db = new Dexie("chasm-local-seismometer");
  await db.version(1).stores({
    cache: `roomId, summaryId`,
  });
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
      if (!result.ok) {
        const err = new Error(
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`
        );
        err.code = result.status;
        return err;
      }
      return await result.json();
    } catch (t) {
      return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
    }
  }

  function log(message) {
    console.log(
      "%cChasm Crystallized Local Seismometer: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Local Seismometer: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }

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
  async function check() {
    if (!isStoryPath() && !isCharacterPath()) return;
    const split = window.location.pathname.substring(1).split("/");
    const chatRoomId = split[3];
    const url = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatRoomId}/summaries?limit=1`;
    if (lastErrorToken && lastErrorToken === extractAccessToken()) {
      // To prevent console error spamming
      return;
    }
    const usedToken = extractAccessToken();
    const fetch = await authFetch("GET", url);
    if (fetch instanceof Error) {
      if (fetch.code && fetch.code === 401) {
        lastErrorToken = usedToken;
        log(
          "인증 토큰 만료로 인해 요청에 실패하여 요약 메모리 감시 태스크를 뒤로 미룹니다."
        );
      }
      return;
    }
    lastErrorToken = undefined;
    const data = fetch.data?.summaries;
    if (!data || data.length <= 0) {
      return;
    }
    const result = await db.cache.where("roomId").anyOf(chatRoomId).toArray();
    if (result.length > 0) {
      if (result[0].summaryId === data[0]._id) {
        return;
      }
    }
    await db.cache.put({
      roomId: chatRoomId,
      summaryId: data[0]._id,
    });
    ToastifyInjector.findInjector().doToastifyAlert(
      "요약 메모리의 변경이 감지되었어요.",
      STANDARD_NOTIFICATION_TIME
    );
  }
  setInterval(check, 1500);
})();
