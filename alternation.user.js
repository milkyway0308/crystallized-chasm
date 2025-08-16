// ==UserScript==
// @name        Chasm Crystallized Alternation (결정화 캐즘 차원이동)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-ALTR-v1.1.1
// @description 채팅 로그 복사 및 새 채팅방으로 포크. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/alternation.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/alternation.user.js
// @grant        GM_addStyle
// ==/UserScript==
//

GM_addStyle(
  "@keyframes chasm-rotate { from { transform: rotate(0deg); } to {  transform: rotate(360deg); }}" +
    "@keyframes chasm-blinker { 70% { opacity: 0;} }" +
    ".chasm-altr-button { font-size: 16px; line-height: 110%; font-weight: 500; }" +
    'body[data-theme="light"] .chasm-altr-button { color: #1A1918; transition: color 0.1s ease;}' +
    'body[data-theme="dark"] .chasm-altr-button { color: #F0EFEB; transition: color 0.1s ease;}' +
    'body[data-theme="light"] .chasm-altr-button[disabled="true"] { color: #adadadff; transition: color 0.1s ease;}' +
    'body[data-theme="dark"] .chasm-altr-button[disabled="true"] { color: #6e6e6eff; transition: color 0.1s ease;}' +
    ".chasm-altr-button .warning-icon { display: none; margin-left: 40px; animation: chasm-blinker 1s infinite;}" +
    '.chasm-altr-button[warning="true"] .warning-icon { display: block; }' +
    ".chasm-altr-button .loading-icon { display: none; margin-left: 40px; animation: chasm-rotate 1s infinite; }" +
    '.chasm-altr-button[loading="true"] .loading-icon { display: block; }'
);
!(async function () {
  // =================================================
  //                    클래스 선언
  // =================================================
  class ChattingLog {
    /**
     *
     * @param {boolean} isUser
     * @param {string} message
     */
    constructor(isUser, message) {
      this.isUser = isUser;
      this.message = message;
    }
  }
  class StartingSets {
    /**
     *
     * @param {string} baseSetId
     * @param {string} name
     */
    constructor(baseSetId, name) {
      this.baseSetId = baseSetId;
      this.name = name;
    }
  }
  class SimplifiedCharacterData {
    /**
     *
     * @param {StartingSets[]} startingSets
     * @param {string} startingSetId
     */
    constructor(startingSets, startingSetId) {
      this.startingSets = startingSets;
      this.startingSetId = startingSetId;
      this.nameMappedSets = {};
      this.idMappedSets = {};
      for (let set of startingSets) {
        this.nameMappedSets[set.name] = set;
        this.idMappedSets[set.baseSetId] = set;
      }
    }
  }

  class SimplifiedChatRoomData {
    /**
     *
     * @param {string} roomId
     * @param {string} baseSetId
     * @param {string} userNote
     * @param {boolean} doesUserNoteExtended
     */
    constructor(roomId, baseSetId, userNote, doesUserNoteExtended) {
      this.roomId = roomId;
      this.baseSetId = baseSetId;
      this.userNote = userNote;
      this.doesUserNoteExtended = doesUserNoteExtended;
    }
  }

  // =================================================
  //                      변수
  // =================================================
  let processing = false;

  // =================================================
  //                      로직
  // =================================================
  /**
   * 새 캐릭터 채팅을 만들어 ID를 반환합니다.
   * @param {string} unitId 캐릭터 ID
   * @param {string} baseSetId 현재 시작 설정 ID
   * @param {string} userNote 유저노트
   * @param {boolean} userNoteExtended 유저노트 확장 여부
   * @returns {Promise<string|undefined>} 캐릭터 ID 혹은 undefined
   */
  async function createChat(unitId, baseSetId, userNote, userNoteExtended) {
    const result = await fetch(
      "https://contents-api.wrtn.ai/character-chat/chat",
      {
        method: "POST",
        body: JSON.stringify({
          baseSetId: baseSetId,
          crackerModel: "normalchat",
          maxOutputSetting: {
            hyperchat: "default",
            powerchat: "default",
            powerchatPlus: "default",
            superchat: "default",
            superchatPlus: "default",
          },
          type: "character",
          unitId: unitId,
          userNote: {
            content: userNote,
            isExtend: userNoteExtended,
          },
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${extractAccessToken()}`,
        },
      }
    );
    if (!result.ok) {
      logError("채팅 데이터 가져오기 실패");
      return undefined;
    }
    return (await result.json()).data._id;
  }

  /**
   * 방 ID에서 채팅 로그를 가능하다면 50개 이상 추출합니다.
   * @param {string} chatRoomId 채팅방 ID
   * @returns {Promise<ChattingLog[]>} 추출된 채팅 목록
   */
  async function extractChattingLog(chatRoomId) {
    const chats = [];
    let errorCount = 0;
    let cursor = undefined;
    while (chats.length < 50) {
      const nextUrl =
        cursor === undefined
          ? `https://contents-api.wrtn.ai/character-chat/api/v2/chat-room/${chatRoomId}/messages?limit=20`
          : `https://contents-api.wrtn.ai/character-chat/api/v2/chat-room/${chatRoomId}/messages?limit=20&cursorId=${cursor}`;
      const result = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${extractAccessToken()}`,
        },
      });
      if (result.ok) {
        const json = await result.json();
        for (let message of json.data.list) {
          chats.unshift(
            new ChattingLog(message.role === "user", message.content)
          );
        }
        cursor = json.data.nextCursor;
        if (cursor === undefined || cursor === null) {
          break;
        }
        errorCount = 0;
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        if (errorCount++ > 5) {
          logError("채팅 목록 가져오기 실패 (재시도 횟수 초과)");
          alert("채팅방을 가져오는데에 실패하였습니다.");
          return undefined;
        }
        await new Promise((resolve) => setTimeout(resolve, 50 * errorCount));
      }
    }
    return chats;
  }

  /**
   * 지정한 채팅방에 유저 메시지를 전송하고, ID를 반환합니다.
   * @param {string} roomId
   * @param {string} chatting
   * @returns {Promise<string|undefined>} 방 ID 혹은 undefined
   */
  async function emitUserMessage(roomId, chatting) {
    const result = await fetch(
      `https://contents-api.wrtn.ai/character-chat/characters/chat/${roomId}/message?platform=web&user=&model=SONNET`,
      {
        method: "post",
        body: JSON.stringify({
          crackerModel: "normalchat",
          images: [],
          isSuperMode: false,
          message: chatting,
          reroll: false,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${extractAccessToken()}`,
        },
      }
    );
    if (result.ok) {
      return (await result.json()).data;
    }
    return undefined;
  }

  /**
   * 지정된 채팅방에 채팅을 강제로 설정합니다.
   * @param {string} roomId 채팅방 ID
   * @param {ChattingLog[]} chattings 채팅 목록
   * @returns {Promise<boolean>} 성공 여부
   */
  async function injectChat(roomId, chattings) {
    log("채팅방에 메시지 " + chattings.length + "개 설정 시작");
    let errorCount = 0;
    let messageId = undefined;
    let skipped = false;
    let phase = 0;
    let count = 0;
    for (let message of chattings) {
      document.getElementsByClassName(
        "chasm-altr-description"
      )[0].textContent = `프롬프트 설정 (${++count} / ${chattings.length})`;
      if (!skipped && !message.isUser && messageId === undefined) {
        log("첫 메시지 무시됨 (초기에 어시스턴트 메시지 설정 불가)");
        // Skip, first message must be user message
        skipped = true;
        continue;
      }
      skipped = true;
      errorCount = 0;
      while (true) {
        if (errorCount > 5) {
          logError("메시지 수정 실패 (재시도 횟수 초과)");
          alert("패치 작업 수행중 오류가 발생하였습니다.");
          return false;
        }
        // If message id is undefined, maybe assistant generated more content
        // But we don't have stable way to generate assistant message, so go through detour with user message
        // User message and assistant generated message will share same logic but with empty message
        if (messageId === undefined) {
          const result = await emitUserMessage(
            roomId,
            message.isUser ? message.message : "<PLACEHOLDER>"
          );
          // If result is OK,
          if (result) {
            messageId = result;
            phase = 1;
          } else {
            continue;
          }
          // ..If current loop is for user message, no need to continue message modification
          // If succeed, break loop, or continue loop - user message MUST NOT contains ai assistant logic so manually configure flow
          if (message.isUser) {
            // So, just break here because error flow already configured with before if flow
            break;
          }
        }

        if (!message.isUser) {
          if (phase < 2) {
            document.getElementsByClassName(
              "chasm-altr-description"
            )[0].textContent = `패치 (${count} / ${chattings.length} | 페이즈 1)`;
            // Phase 1 - Append message text
            const result = await fetch(
              `https://contents-api.wrtn.ai/character-chat/characters/chat/${roomId}/message/${messageId}/result`,
              {
                method: "get",
                headers: {
                  Authorization: `Bearer ${extractAccessToken()}`,
                },
              }
            );
            if (result.ok) {
              phase = 2;
            }
          }
          if (phase === 2) {
            document.getElementsByClassName(
              "chasm-altr-description"
            )[0].textContent = `패치 (${count} / ${chattings.length} | 페이즈 2)`;
            // Phase 2 - Consume event stream
            const result = await fetch(
              `https://contents-api.wrtn.ai/character-chat/characters/chat/${roomId}/message/${messageId}?model=SONNET&platform=web&user=`,
              {
                method: "get",
                headers: {
                  Authorization: `Bearer ${extractAccessToken()}`,
                },
              }
            );
            const reader = result.body.getReader();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
            }
            phase = 3;
          }
          if (phase === 3) {
            document.getElementsByClassName(
              "chasm-altr-description"
            )[0].textContent = `패치 (${count} / ${chattings.length} | 페이즈 3)`;
            // Phase 3 - Patch stream text
            const result = await fetch(
              `https://contents-api.wrtn.ai/character-chat/characters/chat/${roomId}/message/${messageId}`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  message: message.message,
                }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${extractAccessToken()}`,
                },
              }
            );
            if (result.ok) {
              messageId = undefined;
              lastPatchTargetId = undefined;
              await new Promise((resolve) =>
                setTimeout(resolve, 10 * errorCount)
              );
              break;
            }
          }
        }
        errorCount++;
        await new Promise((resolve) => setTimeout(resolve, 50 * errorCount));
      }
    }
    log("메시지 설정 작업 완료.");
    return true;
  }
  /**
   * 채팅방 데이터를 가져옵니다.
   * @param {string} chatRoomId 채팅방 ID
   * @returns {Promise<SimplifiedChatRoomData|undefined>} 채팅방 데이터 혹은 undefined
   */
  async function fetchRoomData(chatRoomId) {
    const result = await fetch(
      `https://contents-api.wrtn.ai/character-chat/api/v2/chat-room/${chatRoomId}`,
      {
        headers: {
          Authorization: `Bearer ${extractAccessToken()}`,
        },
      }
    );

    if (!result.ok) {
      return undefined;
    }
    const jsonResult = (await result.json()).data;
    return new SimplifiedChatRoomData(
      chatRoomId,
      jsonResult.character.baseSetId,
      jsonResult.character.userNote.content,
      jsonResult.character.userNote.isExtend
    );
  }
  /**
   * 차원 이동을 수행합니다.
   * @param {string} characterId 캐릭터 ID
   * @param {string} chatRoomId 채팅방 ID
   * @returns
   */
  async function doDimentionShift(characterId, chatRoomId) {
    if (processing) return;
    processing = true;
    if (
      !confirm(
        "차원 이동은 현재의 대화 기록을 강제로 새 캐릭터에 삽입하여 새로운 가능성을 만들어냅니다.\n이는 플레이에는 이상적이나, 서버에는 전혀 아닐 수 있습니다.\n결정화 캐즘 프로젝트의 개발자는 이 기능의 사용을 최소한으로 줄이기를 권장하고 있습니다.\n각 기능의 사용은 최소 5분의 간격이 권장됩니다.\n**경고: 차원 이동이 끝나기 전에는 이동하지 마세요.**\n**또한, 차원 이동 메뉴 옆의 경고 표시가 사라지기 전에는 채팅을 입력하지 마세요.**\n**AI 응답이 진행중일 경우에는 모든 생성이 완료되거나 중단된 후에 차원 이동을 수행하세요.**\n\n정말로 차원 이동을 수행하시겠습니까?"
      )
    ) {
      return;
    }
    const result = await fetchRoomData(chatRoomId);
    if (!result) {
      alert("채팅방 데이터 가져오기에 실패하였습니다.");
      return;
    }
    if (result.doesUserNoteExtended) {
      if (!confirm("**경고: 유저 노트 확장이 활성화되어 있습니다.**\n유저노트 확장이 활성화된 채팅방은 삽입되는 대화당 10개의 크래커를 추가로 소모합니다.\n만약 이러한 지출을 원치 않으신다면, 유저노트 확장을 끄고 사용해주세요.\n\n정말로 이 상태로 차원 이동을 수행하시겠습니까?")) {
        return
      }
    }
    document.getElementsByClassName(
      "chasm-altr-description"
    )[0].textContent = `채팅 데이터 가져오는 중`;
    const createdChatRoomId = await createChat(
      characterId,
      result.baseSetId,
      result.userNote,
      result.doesUserNoteExtended
    );
    if (!createdChatRoomId) {
      alert("생성에 실패하였습니다.");
      return;
    }

    document.getElementsByClassName(
      "chasm-altr-description"
    )[0].textContent = `채팅 로그 추출중`;
    const extractedChats = await extractChattingLog(chatRoomId);
    if (!extractedChats) {
      alert("채팅 추출에 실패하였습니다.");
      return;
    }
    if (
      extractedChats.length <= 0 ||
      (extractedChats.length === 1 && !extractedChats[0].isUser)
    ) {
      alert("최소 1개 이상의 메시지를 보낸 상태여야 차원 이동이 가능합니다.");
      return;
    }

    document
      .getElementsByClassName("chasm-altr-button")[0]
      .removeAttribute("warning");
    document
      .getElementsByClassName("chasm-altr-button")[0]
      .setAttribute("loading", "true");
    const injectResult = await injectChat(createdChatRoomId, extractedChats);
    if (injectResult) {
      if (confirm("새 평행 우주가 준비되었습니다.\n새로 고치시겠습니까?")) {
        window.location.reload();
      }
    } else {
      alert("채팅 삽입에 실패하였습니다.");
    }
  }

  // =================================================
  //                  크랙 종속성 유틸리티
  // =================================================
  /**
   * 사이드 패널의 요소를 찾아 반환합니다.
   * @returns {boolean} 사이드 패널 요소
   */
  function extractSidePanel() {
    return isDarkMode()
      ? document.getElementsByClassName("css-uxwch2")[0]
      : document.getElementsByClassName("css-uxwch2")[0];
  }

  // =================================================
  //                     유틸리티
  // =================================================
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
      "%cChasm Crystallized Alternation: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Alternation: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Alternation: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }
  // =================================================
  //                    초기화
  // =================================================
  function setup() {
    if (!/\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)) return;
    const item = document.getElementsByClassName("chasm-altr-button");
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
    topContainer.appendChild(createTeleportSvg());
    // Text Container (Middle)
    const textContainer = document.createElement("div");
    textContainer.style.cssText =
      "display: flex; flex-direction: column; margin-left: 12px;";
    // Title
    const titleElement = document.createElement("p");
    titleElement.textContent = "평행세계로 이동";
    textContainer.appendChild(titleElement);

    const progressElement = document.createElement("p");
    progressElement.textContent = "차원 이동 준비 완료";
    progressElement.className = "chasm-altr-description";
    progressElement.style.cssText =
      "font-size: 11px; color: var(--text_tertiary);";
    textContainer.appendChild(progressElement);

    topContainer.append(textContainer);

    topContainer.appendChild(createWarningSvg());

    topContainer.appendChild(createLoadingIcon());

    button.appendChild(topContainer);
    button.onclick = () => {};
    button.classList.add("chasm-altr-button");

    button.addEventListener("click", async (event) => {
      if (processing) {
        return;
      }
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      const chatRoomId = split[3];
      document
        .getElementsByClassName("chasm-altr-button")[0]
        .setAttribute("warning", "true");
      document
        .getElementsByClassName("chasm-altr-button")[0]
        .setAttribute("disabled", "true");
      await doDimentionShift(characterId, chatRoomId);
      processing = false;
      document
        .getElementsByClassName("chasm-altr-button")[0]
        .removeAttribute("warning");
      document
        .getElementsByClassName("chasm-altr-button")[0]
        .removeAttribute("loading");
      document
        .getElementsByClassName("chasm-altr-button")[0]
        .setAttribute("disabled", "false");

      document.getElementsByClassName(
        "chasm-altr-description"
      )[0].textContent = `차원 이동 준비 완료`;
    });
    // button.childNodes[1].textContent = "평행세계로 이동";
    menu.appendChild(button);
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
  // =================================================
  //                      SVG
  // =================================================
  function createTeleportSvg() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/321565/teleport
    element.innerHTML =
      '<svg viewBox="0 0 512 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="var(--icon_secondary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="var(--icon_secondary)" d="M249.334 22.717c-18.64 2.424-35.677 23.574-37.043 51.49v.02c-.057 1.186-.097 2.38-.097 3.59 0 16.362 5.658 30.827 13.942 40.818l10.127 12.213-15.592 2.933c-10.75 2.025-18.622 7.702-25.373 16.978-2.285 3.14-4.384 6.707-6.31 10.62-57.54-6.44-97.91-21.06-97.91-37.952 0-17.363 42.647-31.983 102.75-37.97-.213-2.51-.323-5.057-.323-7.636v-.002c0-.84.024-1.674.047-2.51-96.43 6.77-167.298 29.15-167.3 55.71-.002 25.33 64.462 46.86 154.074 54.67-.19.742-.394 1.465-.576 2.216-2.36 9.72-4.05 20.22-5.268 31.03-.01 0-.02 0-.03.002-.418 3.653-.78 7.34-1.095 11.046l.05-.005c-1.316 15.777-1.772 31.88-1.893 46.95h35.894l2.115 28.4c-68.24-4.994-118.444-21.004-118.444-39.843 0-13.243 24.83-24.89 63.27-32.33.3-4.056.66-8.115 1.076-12.162-76.42 9.353-129.17 29.168-129.172 52.086-.002 28.17 79.71 51.643 185.098 56.768l5.94 79.77c10.5 2.648 24.84 4.162 39.017 4.068 13.79-.092 27.235-1.71 36.45-4l5.263-79.846c105.308-5.14 184.935-28.605 184.935-56.76 0-23.013-53.196-42.895-130.13-52.2.304 4.02.557 8.047.755 12.07 38.883 7.43 63.965 19.17 63.965 32.536 0 18.84-49.804 34.85-117.908 39.844l1.87-28.402h34.18c-.012-15.113-.127-31.27-1.033-47.094.01 0 .02.002.032.004-.214-3.687-.472-7.352-.782-10.986l-.02-.002c-.94-11.157-2.367-21.984-4.546-31.967-.09-.405-.184-.803-.275-1.206 89.518-7.826 153.893-29.344 153.893-54.656 0-26.787-72.076-49.332-169.77-55.887.025.895.053 1.788.053 2.688 0 2.5-.104 4.97-.304 7.407 61.19 5.836 104.61 20.61 104.61 38.2 0 16.805-39.633 31.355-96.524 37.848-2.01-4.283-4.26-8.15-6.762-11.505-6.83-9.167-15.063-14.81-27.14-16.682l-15.913-2.47 10.037-12.59c6.928-8.69 11.912-20.715 13.057-34.268h.002c.163-1.95.25-3.93.25-5.938 0-.77-.022-1.532-.048-2.29-.015-.48-.033-.958-.057-1.434h-.002c-1.48-29.745-20.507-51.3-41.076-51.3-2.528 0-3.966-.087-4.03-.08h-.003zM194.54 355.822c-97.11 6.655-168.573 29.11-168.573 55.8 0 31.932 102.243 57.815 228.367 57.815S482.7 443.555 482.7 411.623c0-26.608-71.02-49.004-167.67-55.736l-.655 9.93c60.363 6.055 103.074 20.956 103.074 38.394 0 22.81-73.032 41.298-163.12 41.298-90.088 0-163.12-18.49-163.12-41.297 0-17.533 43.18-32.502 104.07-38.493l-.74-9.895z"></path></g></svg>';
    element.style.cssText = "margin-top: 2px;";
    return element;
  }

  function createWarningSvg() {
    const element = document.createElement("div");
    element.classList.add("warning-icon");
    // https://www.svgrepo.com/svg/502912/warning-1
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="17" r="1" fill="var(--icon_secondary)"></circle> <path d="M12 10L12 14" stroke="var(--icon_secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z" stroke="var(--icon_secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    return element;
  }

  function createLoadingIcon() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/448500/loading
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" class="hds-flight-icon--animation-loading"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="var(--icon_secondary)" fill-rule="evenodd" clip-rule="evenodd"> <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2"></path> <path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"></path> </g> </g></svg>';
    element.childNodes[0].classList.add("loading-icon");
    element.style.cssText = "margin-top: -3px";
    return element;
  }
})();
