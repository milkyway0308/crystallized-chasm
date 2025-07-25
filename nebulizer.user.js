// ==UserScript==
// @name        Chasm Crystallized Nebulizer (결정화 캐즘 네뷸라이저)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-NEBL-v1.1.0
// @description 차단 목록의 제작자의 댓글을 블러 처리 및 차단된 댓글 대량 삭제. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/nebulizer.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/nebulizer.user.js
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(
  ".chasm-nebulizer-text { font-family: Pretendard; font-weight: bold; font-size: 24px; }" +
    'body[data-theme="dark"] .chasm-nebulizer-text { color: #F0EFEB; }' +
    'body[data-theme="light"] .chasm-nebulizer-text { color: #1A1918; }' +
    ".chasm-nebulizer-hidden { user-select: none; filter: blur(10px);}"
);
(async function () {
  const LOCAL_KEY_USER_LIST = "chasm-nebulizer-cached-ban-list";
  const CLASS_COMMENT_HIDDEN = "chasm-nebulizer-hidden";
  let cache = undefined;
  let updating = false;
  let deleting = false;
  let elementSize = 0;
  async function setup() {
    appendSyncButton();
    if (updating) return;
    if (/^\/detail(\/.*)?$/.test(location.pathname)) {
      injectDestroyButtons();
      let elements = getAllCommentary();
      if (elementSize === elements.length) {
        return;
      }
      if (cache === undefined) {
        await fillCache();
      }
      updating = true;
      elementSize = elements.length;
      for (let element of elements) {
        const writerId = extractWriterNicknameFrom(element);
        if (!cache.includes(writerId)) {
          continue;
        }
        for (let childElement of element.childNodes) {
          if (childElement.nodeName.toLowerCase() === "p") {
            childElement.classList.add(CLASS_COMMENT_HIDDEN);
            childElement.onclick = () => {
              childElement.onclick = null;
              childElement.classList.remove(CLASS_COMMENT_HIDDEN);
            };
            break;
          }
        }
      }
      updating = false;
    }
  }

  function injectDestroyButtons() {
    const existings = document.getElementsByClassName(
      "chasm-nebulizer-destroy-button"
    );
    if (existings && existings.length > 0) {
      return;
    }
    const rootNode = document.querySelectorAll(".css-3id9oj .css-8v90jo");
    if (!rootNode || rootNode.length <= 0) {
      return;
    }
    const top = document.createElement("button");
    top.className = "chasm-nebulizer-destroy-button";
    top.style.cssText = "display: inline-flex; align-items: center;";
    top.title = "차단된 제작자의 댓글 모두 삭제";
    top.innerHTML =
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools --><svg fill="#ff0000" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 60.167 60.167" xml:space="preserve" stroke="#ff0000"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <path d="M54.5,11.667H39.88V3.91c0-2.156-1.754-3.91-3.91-3.91H24.196c-2.156,0-3.91,1.754-3.91,3.91v7.756H5.667 c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.042v40.5c0,3.309,2.691,6,6,6h32.75c3.309,0,6-2.691,6-6v-40.5H54.5c0.552,0,1-0.448,1-1 S55.052,11.667,54.5,11.667z M22.286,3.91c0-1.053,0.857-1.91,1.91-1.91H35.97c1.053,0,1.91,0.857,1.91,1.91v7.756H22.286V3.91z M50.458,54.167c0,2.206-1.794,4-4,4h-32.75c-2.206,0-4-1.794-4-4v-40.5h40.75V54.167z M38.255,46.153V22.847c0-0.552,0.448-1,1-1 s1,0.448,1,1v23.306c0,0.552-0.448,1-1,1S38.255,46.706,38.255,46.153z M29.083,46.153V22.847c0-0.552,0.448-1,1-1s1,0.448,1,1 v23.306c0,0.552-0.448,1-1,1S29.083,46.706,29.083,46.153z M19.911,46.153V22.847c0-0.552,0.448-1,1-1s1,0.448,1,1v23.306 c0,0.552-0.448,1-1,1S19.911,46.706,19.911,46.153z"/> </g></svg>';
    rootNode[0].append(top);
    top.onclick = async () => {
      if (deleting) return;
      await fillCache();
      if (cache.length <= 0) {
        alert(
          "동기화된 차단 목록이 존재하지 않거나, 차단한 제작자가 없습니다.\n" +
            "차단 관리 페이지로 이동하여 '목록 동기화' 버튼으로 차단 목록을 동기화해주세요."
        );
        return;
      }
      if (
        confirm(
          "정말로 이 캐릭터에서 차단된 제작자의 댓글을 모두 삭제하시겠습니까?\n" +
            "이 작업은 되돌릴 수 없습니다."
        )
      ) {
        const href = location.href;
        if (!href.startsWith("https://crack.wrtn.ai/detail/")) {
          alert(
            "알 수 없는 오류가 발생하였습니다:\n현재 URL이 캐릭터 URL이 아닙니다."
          );
          return;
        }
        deleting = true;
        let characterId = href.substring(
          "https://crack.wrtn.ai/detail/".length
        );
        if (characterId.includes("?")) {
          characterId = characterId.substring(0, characterId.indexOf("?"));
        }
        const expectedCommentIds = [];
        const expectedWriterIds = [];
        let nextUrl = `https://contents-api.wrtn.ai/character/characters/${characterId}/comments?`;
        let retry = 0;
        while (true) {
          const result = await fetch(nextUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${extractAccessToken()}`,
              "Content-Type": "application/json",
            },
          });
          if (result.ok) {
            const json = await result.json();
            const data = json.data;
            for (let comment of data.comments) {
              if (cache.includes(comment.writer.nickname)) {
                if (!expectedWriterIds.includes(comment.writer.nickname)) {
                  expectedWriterIds.push(comment.writer.nickname);
                }
                expectedCommentIds.push(comment._id);
              }
            }
            if (data.nextCursor !== undefined && data.nextCursor !== null) {
              nextUrl = `https://contents-api.wrtn.ai/character/characters/${characterId}/comments?cursor=${data.nextCursor}`;
            } else {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          } else {
            if (retry++ >= 10) {
              logError("Max retry count reached");
              confirm(
                "삭제중 오류가 발생하였습니다:\n코멘트 가져오기에 실패하였습니다. 서버에서 지정된 횟수 이상 오류를 반환하였습니다."
              );
              deleting = false;
              return;
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
        log(
          `${expectedCommentIds.length} banned comments found from ${expectedWriterIds.length} user, Entering delete phase`
        );
        let success = 0;
        let failure = 0;
        for (let commentId of expectedCommentIds) {
          const result = await fetch(
            `https://contents-api.wrtn.ai/character/characters/${characterId}/comments/${commentId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${extractAccessToken()}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (result.ok) {
            success++;
          } else {
            failure++;
          }
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        if (
          confirm(
            `모든 처리가 정상적으로 완료되었습니다:\n` +
              `- ${expectedWriterIds.length}명의 차단된 제작자가 작성한 ${expectedCommentIds.length}개의 댓글을 가져왔습니다.\n` +
              `- ${success}개의 댓글 제거에 성공하였습니다.\n` +
              `- ${failure}개의 댓글 제거를 오류로 인해 실패하였습니다.\n\n` +
              `페이지를 새로 고칠까요?`
          )
        ) {
          location.reload();
        } else {
          deleting = false;
        }
      }
    };
  }

  function modifyTitle() {
    try {
      const existings = document.getElementsByClassName(
        "chasm-nebulizer-sync-divider"
      );
      if (existings && existings.length > 0) {
        return;
      }
      const rootNode = document.getElementsByClassName("css-18nhf9q");
      if (!rootNode || rootNode.length === 0) {
        logWarning("Cannot modify title; Crack updated, or bug occured?");
        return;
      }
      const top = document.createElement("div");
      top.className = "chasm-nebulizer-sync-divider";
      top.style.cssText = "display: flex; flex-direction: row; width: 100%;";
      const title = document.createElement("p");
      title.textContent = "차단 관리";
      title.className = "chasm-nebulizer-text";
      top.append(title);
      const originTitleNode = rootNode[0].childNodes[0];
      originTitleNode.style.cssText = "display: none;";
      rootNode[0].insertBefore(top, originTitleNode);
    } catch (e) {
      console.log(e);
    }
  }

  function appendSyncButton() {
    if (/^\/block-center(\/.*)?$/.test(location.pathname)) {
      modifyTitle();
      let root = document.getElementsByClassName(
        "chasm-nebulizer-sync-divider"
      );
      if (!root || root.length === 0) {
        return;
      }
      root = root[0];
      const expectedClass = isDarkMode()
        ? "css-sv3fmv efhw7t80"
        : "css-xohevx efhw7t80";
      // Pre-condition check - Prevent duplicated button
      const existing = document.getElementsByClassName("nebulizer-sync-button");
      if (existing && existing.length > 0) {
        const button = existing[0].childNodes[0];
        if (button.className !== expectedClass) {
          button.className = expectedClass;
        }
        return;
      }
      const div = document.createElement("div");
      div.className = "css-8v90jo efhw7t80 nebulizer-sync-button";
      div.display = "flex";
      div.style.cssText = "margin-left: auto";
      const button = document.createElement("button");
      button.className = expectedClass;
      button.display = "flex";
      button.setAttribute("color", "text_primary");
      // button.style.cssText = "margin-right: 5px";
      button.innerHTML =
        '<div display="flex" width="100%" class="css-1gs21jv efhw7t80">목록 동기화</div>';
      const textElement = button.childNodes[0];
      button.onclick = async () => {
        textElement.textContent = "불러오는 중...";
        button.style.cssText = "background-color: #9c9c9c87;";
        await reloadCache();
        textElement.textContent = "목록 동기화";
        button.style.cssText = "";
      };
      div.append(button);

      root.append(div);
    }
  }
  function prepare() {
    setup();
    attachObserver(document, () => {
      setup();
    });
    let oldHref = location.href;
    attachObserver(document, () => {
      if (location.href !== oldHref) {
        oldHref = location.href;
        if (location.href.startsWith("https://crack.wrtn.ai/detail/")) {
          elementSize = 0;
        }
        setup();
      }
    });
  }

  async function extractAllBanList() {
    let page = 1;
    let banList = [];
    while (true) {
      const result = await fetch(
        `https://contents-api.wrtn.ai/character/block?type=profile&page=${page++}&limit=20`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${extractAccessToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!result.ok) {
        // Maybe fetch completed?
        break;
      }
      const json = await result.json();
      if (!json.data || !json.data.blocks || json.data.blocks.length <= 0) {
        // Fetch completed (Really)
        break;
      }
      const dataList = json.data.blocks;

      for (let data of dataList) {
        if (!banList.includes(data.name)) {
          banList.push(data.name);
        }
      }
    }
    return banList;
  }

  function getAllCommentary() {
    return document.getElementsByClassName("css-sj8vxf");
  }

  function extractWriterIdFrom(commentary) {
    for (let key of Object.keys(commentary)) {
      if (key.startsWith("__reactProps")) {
        return commentary[key].children[5].props.children[3].props.comment
          .writer.userId;
      }
    }
    return undefined;
  }

  function extractWriterNicknameFrom(commentary) {
    for (let key of Object.keys(commentary)) {
      if (key.startsWith("__reactProps")) {
        return commentary[key].children[5].props.children[3].props.comment
          .writer.nickname;
      }
    }
    return undefined;
  }

  async function reloadCache() {
    const banList = await extractAllBanList();
    cache = banList;
    localStorage.setItem(LOCAL_KEY_USER_LIST, JSON.stringify(banList));
    log(`Loaded ${cache.length} banlist`);
  }

  async function fillCache() {
    if (localStorage.getItem(LOCAL_KEY_USER_LIST)) {
      cache = await JSON.parse(localStorage.getItem(LOCAL_KEY_USER_LIST));
    } else {
      cache = [];
    }
  }

  // =================================================
  //                유틸리티성 메서드
  // =================================================
  /**
   * 크랙 페이지의 테마가 다크 모드인지 확인합니다.
   * @returns 다크 모드 여부
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
   * 콘솔에 지정한 포맷으로 디버그를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function log(message) {
    console.log(
      "%cChasm Crystallized Nebulizer: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }
  /**
   * 콘솔에 지정한 포맷으로 경고를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Nebulizer: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }
  /**
   * 콘솔에 지정한 포맷으로 오류를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function logError(message) {
    console.log(
      "%cChasm Crystallized Nebulizer: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
})();
