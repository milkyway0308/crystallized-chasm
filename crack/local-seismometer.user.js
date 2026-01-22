/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized Local Sesimometer (캐즘 국소지진계)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-LSEM-v1.1.0
// @description  요약 메모리가 변경될 때 마다 알림 전송. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/local-seismometer.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/local-seismometer.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@4.2.1/dist/dexie.min.js#sha256-STeEejq7AcFOvsszbzgCDL82AjypbLLjD5O6tUByfuA=
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-toastify-injection@v1.0.0/crack/libraries/toastify-injection.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.0.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==

// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />

!(async function () {
  const STANDARD_NOTIFICATION_TIME = 3000;
  const logger = new LogUtil("Chasm Crystallized Local Sesimometer", false);
  /** @type {string | undefined} */
  let lastErrorToken = undefined;
  // @ts-ignore
  const db = new Dexie("chasm-local-seismometer");
  await db.version(1).stores({
    cache: `roomId, summaryId`,
  });
  async function check() {
    if (!CrackUtil.path().isChattingPath()) return;
    const split = window.location.pathname.substring(1).split("/");
    const chatRoomId = split[3];
    const url = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatRoomId}/summaries?limit=1`;
    if (
      lastErrorToken &&
      lastErrorToken === CrackUtil.cookie().getAuthToken()
    ) {
      // To prevent console error spamming
      return;
    }
    const usedToken = CrackUtil.cookie().getAuthToken();
    const fetch = await CrackUtil.network().authFetch("GET", url);
    if (fetch instanceof Error) {
      // @ts-ignore
      if (fetch.code && fetch.code === 401) {
        lastErrorToken = usedToken;
        logger.log(
          "인증 토큰 만료로 인해 요청에 실패하여 요약 메모리 감시 태스크를 뒤로 미룹니다.",
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
      STANDARD_NOTIFICATION_TIME,
    );
  }
  setInterval(check, 1500);
})();
