// ==UserScript==
// @name        Chasm Crystallized Neo-Copy (결정화 캐즘 네오-카피)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-NCPY-v2.2.0p
// @description 크랙의 캐릭터 퍼블리시/복사/붙여넣기 기능 구현 및 오류 수정. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js
// @grant       GM_addStyle
// ==/UserScript==

const VERSION = "CRYS-COPY-v2.1.0";
GM_addStyle(
  // Basic: 172px
  "#chasm-copy-dropdown-container { display: flex; flex-direction: row; min-width: 98px; background-color: var(--bg_screen); border-left: 1px solid var(--surface_chat_primary); border-top: 1px solid var(--surface_chat_primary); border-bottom: 1px solid var(--surface_chat_primary); padding: 0px 0px; border-radius: 1px; box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px; z-index: 11 !important; position: fixed !important; }" +
    "#chasm-copy-dropdowns { display: flex; flex-direction: column; width: calc(100% - 2px); height: 100%; z-index: 11 !important;}" +
    "#chasm-copy-partial-border { width: 1px; margin-top: 30px; height: calc(100% - 30px); background-color: var(--surface_chat_primary); }" +
    "[chasm-dropdown-enabled] { border-top: 1px solid var(--surface_chat_primary) !important; border-bottom: 1px solid var(--surface_chat_primary) !important; border-right: 1px solid var(--surface_chat_primary) !important; }"
);
!(function () {
  const menuElementClass = "chasm-copy-menu";
  class ExtractedCharacterInfo {
    constructor(type, id) {
      /**@type {string} */
      this.type = type;
      /**@type {string} */
      this.id = id;
    }

    /**
     * 선택한 데이터가 스토리챗인지 확인합니다.
     * @returns {boolean} 데이터의 스토리챗 여부
     */
    isStory() {
      return !this.type || this.type.length <= 0 || this.type === "story";
    }

    /**
     * 선택한 데이터가 캐릭터챗인지 확인합니다.
     * @returns {boolean} 데이어틔 캐릭터챗 여부
     */
    isCharacter() {
      return this.type === "character";
    }
  }
  // =====================================================
  //                      유틸리티
  // =====================================================
  function log(message) {
    console.log(
      "%cChasm Crystallized Copy: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Copy: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Copy: %cError: %c" + message,
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

  /**
   * 크랙의 토큰을 쿠키에 넣어 인증 수단으로 사용하여 요청을 보냅니다.
   * @param {string} method 요청 메서드
   * @param {string} url 요청 URL
   * @param {any | undefined} body 요청 바디 파라미터
   * @returns {any | Error} 파싱된 값 혹은 오류
   */
  async function authCookieFetch(method, url, body) {
    try {
      const param = {
        method: method,
        headers: {
          Cookie: `access_token=${extractAccessToken()};`,
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

  // =====================================================
  //                  크랙 종속 유틸리티
  // =====================================================
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

  function acquireMenuElements() {
    return document.querySelectorAll(
      isDarkMode() ? ".css-19fu3mx" : ".css-19fu3mx"
    );
  }

  /**
   *
   * @returns {HTMLElement | undefined}
   */
  function acquireMenu() {
    const menu = document.querySelectorAll(
      isDarkMode() ? ".css-bf6s57" : ".css-10lwp0d"
    );
    if (menu && menu.length > 0) {
      return menu[0];
    }
    return undefined;
  }

  // =====================================================
  //                    드롭다운 로직
  // =====================================================

  function removeOriginalDropdown() {
    document.body.dispatchEvent(
      new Event("mousedown", { bubbles: true, cancelable: true })
    );
  }
  /**
   * 새 메뉴 버튼 요소를 등록합니다.
   * @param {HTMLElement} menu 상위 메뉴
   * @param {string} text 버튼 텍스트
   * @param {(articleId: string) => any} onClick 버튼 클릭시 수행할 액션
   */
  function appendNewMenu(menu, text, onClick) {
    const node = cloneButton(
      text,
      () => {
        const currentArticleId = extractCurrentArticle(node);
        if (!currentArticleId) {
          alert(
            "크랙의 UI 업데이트로 인해 ID 추출이 비활성화된 것으로 추측됩니다.\n결정화 캐즘 지원 채널에 해당 오류를 알려주세요."
          );
          return;
        }
        document.currentArticleId = currentArticleId;
        onClick(currentArticleId);
      },
      menu.childNodes[0].cloneNode(true)
    );
    node.classList.add(menuElementClass);
    menu.appendChild(node);
  }

  /**
   * 새 드롭다운 메뉴 버튼 요소를 등록합니다.
   * @param {HTMLElement} menu 상위 메뉴
   * @param {string} text 버튼 텍스트
   * @param {(dropdownAppender: (text: string, worker: (articleId: string) => any)) => any} dropdownAccepter 드롭다운 메뉴 등록 람다
   */
  function appendDropdownMenu(menu, text, dropdownAccepter) {
    const node = cloneButton(
      `◂ ${text}`,
      () => {
        const currentArticleId = extractCurrentArticle(node);
        document.currentArticleId = currentArticleId;
        removeAdditionalDropdown();
        if (!node.hasAttribute("chasm-dropdown-enabled")) {
          node.setAttribute("chasm-dropdown-enabled", "true");
          const dropdown = clearAndRepositionDropdown(node);
          dropdownAccepter((text, worker) => {
            const button = cloneButton(
              text,
              (event) => {
                const currentArticleId = extractCurrentArticle(node);
                if (!currentArticleId) {
                  alert(
                    "크랙의 UI 업데이트로 인해 ID 추출이 비활성화된 것으로 추측됩니다.\n결정화 캐즘 지원 채널에 해당 오류를 알려주세요."
                  );
                  return;
                }
                document.currentArticleId = currentArticleId;

                worker(currentArticleId);
              },
              menu.childNodes[0].cloneNode(true)
            );
            button.onmousedown = (event) => {
              event.preventDefault();
              event.stopPropagation();
            };
            button.style.cssText = "z-index: 18 !important;";
            dropdown.append(button);
          });
          repositionDropdown(node);
        }
      },
      menu.childNodes[0].cloneNode(true)
    );

    node.classList.add(menuElementClass);
    menu.appendChild(node);
  }

  /**
   * 수정 가능한 추가 드롭다운 메뉴 컨테이너를 가져옵니다.
   * @returns {HTMLElement} 추가 드롭다운 메뉴 컨테이너
   */
  function accessAdditionalDropdown() {
    let element = document.getElementById("chasm-copy-dropdown-container");
    if (!element) {
      element = document.createElement("div");
      element.id = "chasm-copy-dropdown-container";
      const dropdownElement = document.createElement("div");
      dropdownElement.id = "chasm-copy-dropdowns";
      element.append(dropdownElement);
      const rightBorderElement = document.createElement("div");
      rightBorderElement.id = "chasm-copy-partial-border";
      element.append(rightBorderElement);
      document.body.append(element);
    }
    return element.childNodes[0];
  }

  /**
   * 추가 드롭다운 메뉴를 제거합니다.
   */
  function removeAdditionalDropdown() {
    for (let menuNode of document.getElementsByClassName("chasm-copy-menu")) {
      menuNode.removeAttribute("chasm-dropdown-enabled");
    }
    document.getElementById("chasm-copy-dropdown-container")?.remove();
  }

  /**
   * 추가 드롭다운 컨테이너의 내용을 비우고, 지정한 메뉴 요소에 맞춰 위치를 변경합니다.
   * @param {HTMLElement} targetElement 대상 메뉴 요소
   * @returns {HTMLElement} 재조정된 추가 드롭다운 컨테이너
   */
  function clearAndRepositionDropdown(targetElement) {
    const element = accessAdditionalDropdown();
    element.innerHTML = "";
    repositionDropdown(targetElement);
    return element;
  }

  /**
   * 추가 드롭다운 컨테이너를 지정한 메뉴 요소에 맞춰 위치를 변경합니다.
   * @param {HTMLElement} targetElement 대상 메뉴 요소
   */
  function repositionDropdown(targetElement) {
    const element = accessAdditionalDropdown();
    const nextX =
      targetElement.getBoundingClientRect().x -
      element.parentNode.getBoundingClientRect().width;
    const nextY = targetElement.getBoundingClientRect().y;
    element.parentNode.style = `top: ${nextY}px; left: ${nextX}px;`;
    const rightBorder = document.getElementById("chasm-copy-partial-border");
    if (rightBorder) {
      rightBorder.style.cssText = `height: ${
        element.getBoundingClientRect().height - 30
      }px`;
    }
  }
  // =====================================================
  //                      UI 컨트롤러
  // =====================================================
  /**
   * 현재 작품의 ID를 메뉴 요소에서 추출합니다.
   * @param {HTMLElement} element 메뉴 요소
   * @returns {ExtractedCharacterInfo | null} 작품 ID 혹은 null
   */
  function extractCurrentArticle(element) {
    try {
      const parentSector = element.parentElement?.parentElement;
      if (!parentSector) return null;
      const reactPropertyName = Object.keys(parentSector).find((t) =>
        t.startsWith("__reactProps")
      );
      if (!reactPropertyName) return null;
      const reactProperty = parentSector[reactPropertyName];
      if (!reactProperty?.children) return null;
      const propertyChilds = Array.isArray(reactProperty.children)
        ? reactProperty.children
        : [reactProperty.children];
      for (const child of propertyChilds) {
        if (child?.props?.content?.sourceId) {
          return new ExtractedCharacterInfo(
            child.props.content.type,
            child.props.content.sourceId
          );
        }
      }
      return null;
    } catch (t) {
      return null;
    }
  }

  /**
   * 존재하는 버튼의 속성을 복사해 새로운 버튼으로 만듭니다.
   * @param {string} textContent 버튼 텍스트
   * @param {() => any} clickListener 버튼의 클릭 리스너
   * @param {HTMLElement} origin 원본 버튼
   * @returns {HTMLElement} 복사된 버튼
   */
  function cloneButton(textContent, clickListener, origin) {
    const cloned = origin.cloneNode(true);
    const buttonNode = document.createElement("button");
    buttonNode.innerHTML = cloned.innerHTML;
    buttonNode.className = origin.className;
    const textNode = buttonNode.querySelector("p");
    textNode.textContent = textContent;
    buttonNode.removeAttribute("onClick");
    buttonNode.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      clickListener(event);
    });
    return buttonNode;
  }

  /**
   * 모든 메뉴 요소에 ID 추출 펑션을 설정합니다.
   */
  function bindArticleExtractor() {
    acquireMenuElements().forEach((element) => {
      element.onclick = () => {
        removeAdditionalDropdown();
        const currentArticleId = extractCurrentArticle(element);
        document.currentArticleId = currentArticleId;
      };
    });
  }

  function extractArticle() {
    const menu = acquireMenu();
    if (!menu) {
      return undefined;
    }
    return extractCurrentArticle(menu.childNodes[0]);
  }

  // For debug, do not use it if not emergency situation
  function doDebugExtraction() {
    for (let element of document.querySelectorAll("*")) {
      const extracted = extractCurrentArticle(element);
      if (extracted) {
        console.log("ARTICLE EXTRACTED!");
        console.log(element);
      }
    }
  }

  // =====================================================
  //                  네트워크 상호작용 로직
  // =====================================================

  /**
   * 클립보드 데이터로부터 캐릭터 데이터를 구축합니다.
   * @param {any} clipboard 클립보드 JSON
   * @returns {any} 구축된 캐릭터 데이터
   */
  function __constructStory(clipboard) {
    return {
      name: clipboard.name,
      description: clipboard.description,
      profileImageUrl:
        clipboard.profileImage?.origin || clipboard.profileImageUrl,
      model: clipboard.model.toLowerCase(),
      characterDetails: clipboard.characterDetails,
      chatExamples: clipboard.chatExamples,
      categoryIds: clipboard.categories?.length
        ? [clipboard.categories[0]._id]
        : clipboard.categoryIds,
      tags: clipboard.tags,
      promptTemplate:
        clipboard.promptTemplate?.template || clipboard.promptTemplate,
      isCommentBlocked: clipboard.isCommentBlocked,
      defaultStartingSetName: clipboard.defaultStartingSetName,
      customPrompt: clipboard.customPrompt,
      defaultSuperChatModel:
        "object" == typeof clipboard.defaultSuperChatModel &&
        clipboard.defaultSuperChatModel?.model
          ? clipboard.defaultSuperChatModel.model
          : clipboard.defaultSuperChatModel || "SONNET3.7",
      genreId: clipboard.genreId,
      defaultCrackerModel: clipboard.defaultCrackerModel,
      target: clipboard.target,
      visibility: clipboard.visibility ? clipboard.visibility : "private",
      isMovingImage: clipboard.isMovingImage ? clipboard.isMovingImage : false,
      chatType: clipboard.chatType ? clipboard.chatType : "simulation",
    };
  }

  /**
   * 클립보드의 구버전 데이터를 캐릭터 데이터로 구축한 후 최신 크랙 스키마로 변환합니다.
   * @param {any} clipboard 클립보드 JSON 데이터
   * @returns {any} 최신 스키마로 변환된 구축된 캐릭터 스키마
   */
  function __convertLegacyStructure(clipboard) {
    const constructed = __constructStory(clipboard);
    if (clipboard.initialMessages) {
      if (clipboard.initialMessages.length <= 0) {
        delete constructed.initialMessages;
      } else {
        constructed.initialMessages = clipboard.initialMessages;
      }
    }
    if (clipboard.replySuggestions) {
      if (clipboard.replySuggestions.length <= 0) {
        delete constructed.replySuggestions;
      } else {
        constructed.replySuggestions = clipboard.replySuggestions;
      }
    }
    if (clipboard.situationImages) {
      if (clipboard.situationImages.length <= 0) {
        delete constructed.situationImages;
      } else {
        constructed.situationImages = clipboard.situationImages;
      }
    }
    if (clipboard.keywordBook) {
      if (clipboard.keywordBook.length <= 0) {
        delete constructed.keywordBook;
      } else {
        constructed.keywordBook = clipboard.keywordBook;
      }
    }
    if (clipboard.defaultStartingSetSituationPrompt) {
      if (clipboard.defaultStartingSetSituationPrompt.length <= 0) {
        delete constructed.defaultStartingSetSituationPrompt;
      } else {
        constructed.defaultStartingSetSituationPrompt =
          clipboard.defaultStartingSetSituationPrompt;
      }
    }
    if (clipboard.startingSets && clipboard.startingSets.length > 0) {
      constructed.startingSets = clipboard.startingSets.map(
        (t) => (delete (t = { ...t })._id, t)
      );
    }
    return constructed;
  }

  /**
   * 원격 데이터의 시작 설정 ID를 제거하여 새 데이터로 변환하고, 구축된 데이터를 빈 데이터로 변환합니다.
   * @param {string} defaultBaseId 기반 시작설정 ID
   * @param {any} remote 원격 데이터
   * @param {any} constructed 구축된 데이터
   */
  function __emptifyStory(defaultBaseId, remote, constructed) {
    for (let index = 0; index < constructed.startingSets.length; index++) {
      if (remote.startingSets[index] && remote.startingSets[index].baseSetId) {
        delete remote.startingSets[index].baseSetId;
      }
      if (
        clipboard.startingSets[index] &&
        clipboard.startingSets[index].baseSetId
      ) {
        delete clipboard.startingSets[index].baseSetId;
      }
    }
    remote.startingSets[0].baseSetId = defaultBaseId;
    clipboard.startingSets[0].baseSetId = defaultBaseId;
    constructed.startingSets = [
      {
        baseSetId: defaultBaseId,
        name: "강제 덮어씌우기 진행중",
        initialMessages: [
          "강제 덮어씌우기 작업이 진행중입니다. ",
          "이 작업은 결정화 캐즘에 의해 진행되고 있습니다.",
          "잠시만 기다려주세요.",
        ],
        situationPrompt:
          "캐릭터 점검중 - 점검 안내 외에는 다른 응답을 하지 말 것",
        replySuggestions: ["점검중"],
        situationImages: [],
        keywordBook: [],
      },
    ];
  }

  function __constructCharacterFrom(chatId, remote, state) {
    const data = {
      associatedStoryIds: remote.associatedStoryIds,
      detailDescription: remote.detailDescription,
      exampleMessages: remote.exampleMessages,
      genreId: remote.genreId,
      introInitialMessages: remote.introInitialMessages,
      isCommentBlocked: remote.isCommentBlocked,
      isMovingImage: remote.isMovingImage,
      name: remote.name,
      profileImageUrl: remote.profileImageUrl,
      simpleDescription: remote.simpleDescription,
      situationImages: remote.situationImages,
      systemPrompt: remote.systemPrompt,
      tags: remote.tags,
      target: remote.target,
      visibility:
        typeof state === "string"
          ? state
          : state === 0
          ? "public"
          : state === 1
          ? "private"
          : "linkonly",
    };
    if (chatId) {
      data.singleCharacterId = chatId;
    }

    return data;
  }

  function __constructStoryFrom(remote, categoryId, state, safety) {
    return {
      name: remote.name,
      description: remote.description,
      profileImageUrl: remote.profileImage.origin,
      model: remote.model,
      initialMessages: remote.initialMessages,
      characterDetails: remote.characterDetails,
      replySuggestions: remote.replySuggestions,
      chatExamples: remote.chatExamples,
      situationImages: remote.situationImages,
      categoryIds: [categoryId],
      tags: remote.tags,
      visibility: state === 0 ? "public" : state === 1 ? "private" : "linkonly",
      promptTemplate: remote.promptTemplate?.template || remote.promptTemplate,
      isCommentBlocked: remote.isCommentBlocked,
      defaultStartingSetName: remote.defaultStartingSetName,
      keywordBook: remote.keywordBook,
      customPrompt: remote.customPrompt,
      defaultStartingSetSituationPrompt:
        remote.defaultStartingSetSituationPrompt || " ",
      isAdult: safety === undefined ? remote.isAdult : !safety,
      defaultSuperChatModel:
        "object" == typeof remote.defaultSuperChatModel &&
        remote.defaultSuperChatModel?.model
          ? remote.defaultSuperChatModel.model
          : remote.defaultSuperChatModel || "SONNET3.7",
      defaultCrackerModel: remote.defaultCrackerModel,
      target: remote.target,
      isMovingImage: remote.isMovingImage ? remote.isMovingImage : false,
      chatType: remote.chatType ? remote.chatType : "simulation",
    };
  }

  function __convertStoryPublishcation(origin, cloned) {
    if (origin.startingSets && origin.startingSets.length > 0) {
      cloned.startingSets = origin.startingSets.map(
        (t) => (delete (t = { ...t })._id, t)
      );
    }
    if (origin.initialMessages) {
      if (origin.initialMessages.length <= 0) {
        delete cloned.initialMessages;
      } else {
        cloned.initialMessages = origin.initialMessages;
      }
    }
    if (origin.replySuggestions) {
      if (origin.replySuggestions.length <= 0) {
        delete cloned.replySuggestions;
      } else {
        cloned.replySuggestions = origin.replySuggestions;
      }
    }
    if (origin.situationImages) {
      if (origin.situationImages.length <= 0) {
        delete cloned.situationImages;
      } else {
        cloned.situationImages = origin.situationImages;
      }
    }
    if (origin.keywordBook) {
      if (origin.keywordBook.length <= 0) {
        delete cloned.keywordBook;
      } else {
        cloned.keywordBook = origin.keywordBook;
      }
    }
    if (origin.defaultStartingSetSituationPrompt) {
      if (origin.defaultStartingSetSituationPrompt.length <= 0) {
        delete cloned.defaultStartingSetSituationPrompt;
      } else {
        cloned.defaultStartingSetSituationPrompt =
          origin.defaultStartingSetSituationPrompt;
      }
    }
    if (cloned.startingSets.length > 0) {
      for (let index = 0; index < cloned.startingSets.length; index++) {
        if (
          cloned.startingSets[index] &&
          cloned.startingSets[index].baseSetId
        ) {
          delete cloned.startingSets[index].baseSetId;
        }
      }
    }
  }
  /**
   * 오류를 방지하기 위해 설정할 세트 ID를 원격 ID로 덮어씌웁니다.
   * @param {any} remote 원격 데이터
   * @param {any} constructed 구축된 데이터
   */
  function __overwriteStorySetId(remote, constructed) {
    if (constructed.startingSets.length > 0) {
      for (let index = 0; index < constructed.startingSets.length; index++) {
        if (
          remote.startingSets[index] &&
          remote.startingSets[index].baseSetId
        ) {
          constructed.startingSets[index].baseSetId =
            remote.startingSets[index].baseSetId;
        }
      }
    }
  }

  /**
   * 캐릭터 데이터를 크랙 서버에서 가져옵니다.
   * @param {ExtractedCharacterInfo} idData 채팅 ID 데이터
   * @param {boolean} anonymization 개인 정보 삭제 여부
   * @returns {Promise<any | Error>} 캐릭터 데이터 혹은 오류
   */
  async function getChatData(idData, anonymization) {
    if (!idData) return new Error("스토리 ID가 잘못 입력되었습니다.");
    const result = await authFetch(
      "GET",
      idData.isCharacter()
        ? `https://contents-api.wrtn.ai/character/single-characters/me/${idData.id}`
        : `https://contents-api.wrtn.ai/character/characters/me/${idData.id}`
    );
    if (result instanceof Error) {
      return result;
    }
    if (anonymization && result.data) {
      const keyToDelete = [
        "_id",
        "userId",
        "wrtnUid",
        "creator",
        "createdAt",
        "updatedAt",
        "chatCount",
        "chatUserCount",
        "likeCount",
        "imageCount",
        "isLiked",
        "isDisliked",
        "countryCode",
        "status",
        "visibility",
        "firstPublicAt",
        "isCommentBlocked",
        "commentCount",
        "badges",
        "snapshotId",
        "commentCount",
        "dislikeCount",
      ];
      for (let key of keyToDelete) {
        delete result.data[key];
      }
    }
    return result.data ?? new Error("캐릭터 데이터 응답이 잘못되었습니다.");
  }

  /**
   * 캐릭터를 클립보드 데이터로 덮어씌웁니다.
   * @param {ExtractedCharacterInfo} id 캐릭터 ID
   * @param {any} remote 원격 데이터
   * @param {any} clipboard 클립보드 데이터
   * @param {any} force 강제 설정 여부. true일 경우, 캐릭터 데이터를 비운 후 클립보드 데이터로 재설정합니다.
   * @returns {Promise<any | Error>} 설정 후 파싱된 값 혹은 오류
   */
  async function setChat(id, remote, clipboard, force) {
    if (id.isStory()) {
      let defaultBaseId = remote.startingSets[0].baseSetId;
      for (var sets of clipboard.startingSets || []) delete sets._id;
      const constructed = __convertLegacyStructure(clipboard);
      // Overwriting visibility to origin
      constructed.visibility = remote.visibility;
      if (force) {
        __emptifyStory(defaultBaseId, remote, constructed);
        await authFetch(
          "PATCH",
          `https://contents-api.wrtn.ai/character/characters/${id.id}`,
          constructed
        );
        return await this.setCharacter(id, remote, clipboard, false);
      }
      __overwriteStorySetId(remote, constructed);
      return await authFetch(
        "PATCH",
        `https://contents-api.wrtn.ai/character/characters/${id.id}`,
        constructed
      );
    } else {
      return await authFetch(
        "PUT",
        `https://contents-api.wrtn.ai/character/single-characters/${id.id}`,
        __constructCharacterFrom(id.id, clipboard, remote.visibility)
      );
    }
  }

  async function getNewCharacterId() {
    const result = await authFetch(
      "POST",
      "https://contents-api.wrtn.ai/character/single-characters/new"
    );
    if (!result) {
      return result;
    }
    if (!result.data || !result.data.characterId) {
      return new Error("서버에서 잘못된 응답을 전송하였습니다.");
    }
    return result.data.characterId;
  }

  /**
   * 캐릭터를 새로 배포합니다.
   * @param {ExtractedCharacterInfo} originInfo 추출된 원본 데이터 ID
   * @param {any} origin 원본 작품의 JSON 데이터입니다.
   * @param {number} state 작품의 상태를 뜻합니다. [0 = 공개 / 1 = 비공개 / 2 = 일부 공개]
   * @param {boolean|undefined} safety 작품의 세이프티 상태를 뜻합니다. undefined일 경우 기존 작품을 따라가며, true일 경우 세이프티, false일 경우 언세이프티로 배포됩니다.
   * @returns {Promise<0 | 1 | Error>} 결과 상태 혹은 오류. 0일 경우 정상, 1일 경우 정상이나 카테고리 하드코딩을 의미합니다.
   */
  async function publishChat(originInfo, state, safety) {
    const origin = await getChatData(originInfo, false);
    if (origin instanceof Error) {
      return origin;
    }
    if (originInfo.isStory()) {
      let categoryForceUpdated = false;
      let categoryId = origin.categories[0]?._id;
      if (!categoryId) {
        categoryForceUpdated = true;
        categoryId = "65e808c01a9eea7b2f66092c";
      }
      for (const t of origin.startingSets || []) delete t._id;
      let cloned = __constructStoryFrom(origin, categoryId, state, safety);
      __convertStoryPublishcation(origin, cloned);
      let result = await authFetch(
        "POST",
        "https://contents-api.wrtn.ai/character/characters",
        cloned
      );
      if (result instanceof Error) {
        return result;
      }
      return categoryForceUpdated ? 1 : 0;
    } else {
      const newId = await getNewCharacterId();
      if (newId instanceof Error) {
        alert(
          "새로운 캐릭터 ID를 가져오는 도중 오류가 발생하였습니다. (" +
            JSON.stringify(newId) +
            ")"
        );
        return;
      }
      let cloned = __constructCharacterFrom(newId, origin, state);
      let result = await authFetch(
        "POST",
        `https://contents-api.wrtn.ai/character/single-characters/${newId}`,
        cloned
      );
      if (result instanceof Error) {
        return result;
      }
      return 0;
    }
  }

  // =====================================================
  //                      버튼 동작
  // =====================================================

  /**
   * 캐릭터를 새로 배포합니다.
   * @param {ExtractedCharacterInfo} id 작품의 추출된 ID입니다.
   * @param {any} origin 원본 작품의 JSON 데이터입니다.
   * @param {number} state 작품의 상태를 뜻합니다. [0 = 공개 / 1 = 비공개 / 2 = 일부 공개]
   * @param {boolean|undefined} safety 작품의 세이프티 상태를 뜻합니다. undefined일 경우 기존 작품을 따라가며, true일 경우 세이프티, false일 경우 언세이프티로 배포됩니다.
   */
  async function publish(id, state, safety) {
    removeOriginalDropdown();
    const characterData = await getChatData(id, false);
    if (characterData instanceof Error) {
      alert(
        "캐릭터를 가져오는데에 실패하였습니다 : 인증 정보가 올바르지 않거나, 잘못된 캐릭터입니다."
      );
      return;
    }
    const result = await publishChat(id, state, safety);
    if (result instanceof Error) {
      alert(`처리에 실패하였습니다. (${result.message})`);
    } else if (result === 0) {
      const doReload = confirm(
        `${id.isStory() ? "스토리" : "캐릭터"} '${characterData.name}'을 ${
          safety ? "세이프티" : "언세이프티"
        } ${
          state === 0 ? "공개" : state === 1 ? "비공개" : "링크 공개"
        } 캐릭터로 새로 복사하여 게시하였습니다.\n페이지를 새로 고칠까요?`
      );
      if (doReload) {
        window.location.reload();
      }
    } else if (result === 1) {
      alert(
        "서버에서 카테고리 ID를 반환하지 않아 하드코딩된 ID로 지정되었습니다.\n이는 추후 문제를 발생시킬 수 있습니다.\n기본 값: 65e808c01a9eea7b2f66092c, 엔터테인먼트"
      );
      const doReload = confirm(
        `캐릭터 '${characterData.name}'을 ${
          safety ? "세이프티" : "언세이프티"
        } ${
          state === 0 ? "공개" : state === 1 ? "비공개" : "링크 공개"
        } 캐릭터로 새로 복사하여 게시하였습니다.\n페이지를 새로 고칠까요?`
      );
      if (doReload) {
        window.location.reload();
      }
    } else {
      console.log(result);
      alert(
        "알 수 없는 결과값이 함수에서 반환되었습니다. 이게 가능한 것이였나요?"
      );
    }
  }

  /**
   *
   * @param {ExtractedCharacterInfo} id
   * @param {boolean} force
   * @param boolean} doubleCheck
   * @returns
   */
  async function pasteCharacter(id, force, doubleCheck) {
    removeOriginalDropdown();
    if (force) {
      const doPaste =
        confirm(
          "클립보드의 JSON 데이터로 캐릭터를 강제로 덮어씌우시겠습니까? 이 작업은 되돌릴 수 없습니다.\n **경고**: 강제 붙여넣기 기능은 기존 캐릭터를 망가뜨릴 수 있습니다.\n이 기능은 모든 다른 기능이 비활성화되어 작동하지 않을 때, 최후의 방법으로만 사용되어야 합니다."
        ) &&
        confirm(
          "정말로 캐릭터 데이터를 덮어씌우시겠습니까? 기존 데이터는 모두 삭제됩니다."
        ) &&
        prompt(
          "최종 확인입니다.\n**정말로** 캐릭터 데이터의 강제 덮어쓰기를 실행하시겠습니까?\n결정화 캐즘의 개발자와 관련자는 이 작업으로 이루어지는 손상 및 손해, 혹은 이익에 대해 어떠한 책임도 지지 않습니다.\n정말로 동의한다면, '동의한다'를 적고 확인을 누르세요."
        ) === "동의한다";
      if (!doPaste) return;
    } else {
      const doPaste =
        confirm(
          "선택한 캐릭터의 데이터를 클립보드에 복사된 데이터로 덮어씌울까요?"
        ) &&
        confirm(
          "최종 확인입니다.\n선택한 캐릭터의 데이터를 클립보드에 복사된 데이터로 덮어씌울까요? 이 작업은 되돌릴 수 없습니다. \n선택한 캐릭터의 데이터는 영구적으로 클립보드의 데이터로 덮어씌워집니다."
        );
      if (!doPaste) return;
    }
    var clipboard = await (async function () {
      try {
        const text = await navigator.clipboard.readText();
        return text ? JSON.parse(text) : null;
      } catch (t) {
        return null;
      }
    })();
    if (!clipboard) {
      alert("클립보드 데이터가 유효한 JSON 형식이 아닙니다.");
      return;
    }
    if (id.isStory() && clipboard.type && clipboard.type === "character") {
      alert(
        "대상 작품이 스토리입니다. 클립보드 데이터는 캐릭터임으로, 이 작품에 붙여넣을 수 없습니다."
      );
      return;
    }
    if (id.isCharacter() && (!clipboard.type || clipboard.type === "story")) {
      alert(
        "대상 작품이 캐릭터입니다. 클립보드 데이터는 스토리임으로, 이 작품에 붙여넣을 수 없습니다."
      );
      return;
    }
    const characterData = await getChatData(id, false);
    if (characterData instanceof Error) {
      alert("캐릭터 데이터를 가져오던 중 오류가 발생하였습니다.");
      return;
    }
    if (doubleCheck) {
      if (characterData.startingSets.length !== clipboard.startingSets.length) {
        alert(
          "원본 시작 설정 개수와 클립보드 데이터의 시작 설정 개수가 다릅니다.\n" +
            "결정화 캐즘의 현재 버전에서는 시작 설정 개수가 다를 경우 복사가 불가능합니다."
        );
        return;
      }
    }
    const pasteResult = await setChat(id, characterData, clipboard, false);
    if (pasteResult instanceof Error) {
      console.error(pasteCharacter);
      alert(
        "오류로 인해 캐릭터 덮어쓰기에 실패하였습니다. 콘솔을 확인하여 상세한 오류를 확인하세요."
      );
      return;
    }
    if (
      confirm(
        "캐릭터 데이터의 덮어씌우기에 성공하였습니다.\n페이지를 새로 고칠까요?"
      )
    ) {
      window.location.reload();
    }
  }

  /**
   *
   * @param {ExtractedCharacterInfo} id
   * @returns
   */
  async function exportToFile(id) {
    removeOriginalDropdown();
    const characterData = await getChatData(id, true);
    if (characterData instanceof Error) {
      alert(
        "캐릭터를 가져오는데에 실패하였습니다 : 인증 정보가 올바르지 않거나, 잘못된 캐릭터입니다."
      );
      return;
    }
    const blob = new Blob([
      JSON.stringify(
        {
          type: "chasm-neocopy",
          version: VERSION,
          chatType: id.isCharacter()
            ? "character"
            : id.isStory()
            ? "story"
            : id.type,
          exported: new Date().getTime(),
          prompt: characterData,
        },
        null,
        2
      ),
    ]);
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, `${characterData.name}.neocopy.json`);
    } else {
      const element = window.document.createElement("a");
      element.href = window.URL.createObjectURL(blob);
      element.download = `${characterData.name}.neocopy.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  /**
   *
   * @param {ExtractedCharacterInfo} id
   */
  async function importFromFile(id) {
    removeOriginalDropdown();
    const tempElement = document.createElement("input");
    tempElement.setAttribute("type", "file");
    tempElement.setAttribute("accept", "application/json");
    tempElement.addEventListener("change", (event) => {
      if (event.target.files.length <= 0) {
        return;
      }
      const file = event.target.files[0];
      if (!file.name.endsWith(".json")) {
        alert("*.neocopy.json 형태의 파일만 불러올 수 있습니다.");
        return;
      } else {
        const splitted = file.name.split(".");
        const suffix = splitted[splitted.length - 2];
        if (
          suffix !== "neocopy" &&
          (suffix.lastIndexOf("(") === -1 ||
            suffix.substring(0, suffix.lastIndexOf("(")).trim() !== "neocopy")
        ) {
          alert("*.neocopy.json 형태의 파일만 불러올 수 있습니다.");
          return;
        }
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target.result) {
          alert("파일 읽기에 실패하였습니다.");
          return;
        }
        try {
          const loaded = JSON.parse(event.target.result);
          if (loaded.type !== "chasm-neocopy") {
            alert("이 파일은 네오카피 JSON 파일이 아닙니다.");
            return;
          }
          const type = loaded.chatType ?? "story";
          if (id.isStory()) {
            if (type !== "story") {
              alert(
                "파일에서 스토리챗이 감지되었으나, 대상 채팅이 스토리챗이 아닙니다."
              );
              return;
            }
          } else if (id.isCharacter()) {
            if (type !== "character") {
              alert(
                "파일에서 캐릭터챗이 감지되었으나, 대상 채팅이 스토리챗이 아닙니다."
              );
              return;
            }
          } else {
            alert(
              `이 버전의 결정화 캐즘에서 지원되지 않는 타입니다. (${type})`
            );
            return;
          }
          let imageCount = 0;
          if (type === "story") {
            if (
              !loaded.prompt.startingSets ||
              loaded.prompt.startingSets.length <= 0
            ) {
              alert(
                "이 캐릭터는 시작 설정이 존재하지 않습니다 - 배포자가 잘못 수정되었거나, 크랙 레거시 포맷입니다."
              );
              return;
            }
            for (let data of loaded.prompt.startingSets) {
              imageCount += data.situationImages.length;
            }
          } else if (type === "character") {
            imageCount = loaded.prompt.situationImages.length;
          }
          if (
            !confirm(
              `이 파일에서 캐릭터를 불러와 선택한 캐릭터에 덮어씌우시겠습니까?\n캐릭터명: ${
                loaded.prompt.name
              }\n이미지: ${imageCount}개\n생성 버전: C2 Neocopy ${
                loaded.version
              }\n추출 시간: ${new Date(loaded.exported).toLocaleTimeString()}`
            ) ||
            !confirm(
              "최종 확인입니다.\n선택한 캐릭터의 데이터를 파일에서 불러온 데이터로 덮어씌울까요? 이 작업은 되돌릴 수 없습니다. \n선택한 캐릭터의 데이터는 영구적으로 파일에서 불러온 데이터로 덮어씌워집니다."
            )
          ) {
            return;
          }
          try {
            const characterData = await getChatData(id, false);
            if (characterData instanceof Error) {
              alert("캐릭터 데이터를 가져오던 중 오류가 발생하였습니다.");
              return;
            }
            const pasteResult = await setChat(
              id,
              characterData,
              loaded.prompt,
              false
            );
            if (pasteResult instanceof Error) {
              console.error(pasteCharacter);
              alert(
                "오류로 인해 캐릭터 덮어쓰기에 실패하였습니다. 콘솔을 확인하여 상세한 오류를 확인하세요."
              );
              return;
            }
            if (
              confirm(
                "캐릭터 데이터의 덮어씌우기에 성공하였습니다.\n페이지를 새로 고칠까요?"
              )
            ) {
              window.location.reload();
            }
          } catch (e2) {
            alert("불러온 캐릭터의 크랙 업로드에 실패하였습니다.");
            console.error(e);
          }
        } catch (e) {
          alert("파일이 오염되었거나 JSON 형태가 아닙니다.");
          console.error(e);
        }
      };
      reader.onerror = () => {
        alert("파일을 불러오는 중 오류가 발생하였습니다.");
      };
      reader.readAsText(file);
    });
    tempElement.click();
  }

  // =====================================================
  //                      초기화
  // =====================================================
  async function setup() {
    if (!/^\/my(\/.*)?$/.test(location.pathname)) return;
    const menu = acquireMenu();
    if (!menu) {
      removeAdditionalDropdown();
      return;
    }
    if (document.getElementsByClassName(menuElementClass).length > 0) {
      return;
    }
    const id = extractArticle();
    console.log(id);
    if (!id) {
      return;
    }
    if (id.isStory()) {
      setupStoryDropdown(menu);
    } else {
      setupCharacterDropdown(menu);
    }
  }

  function setupCharacterDropdown(menu) {
    appendDropdownMenu(menu, "✦ 재게시", (appender) => {
      appender("✦ 공개", async (id) => {
        await publish(id, 0, false);
      });
      appender("✦ 링크 공개", async (id) => {
        await publish(id, 2, false);
      });
      appender("✦ 비공개", async (id) => {
        await publish(id, 1, false);
      });
    });
    appendDropdownMenu(menu, "✦ 파일 관리", (appender) => {
      appender("✦ 파일로 내보내기", async (id) => {
        await exportToFile(id);
      });
      appender("✦ 파일에서 가져오기", async (id) => {
        await importFromFile(id);
      });
    });
    appendNewMenu(menu, "↙ JSON 복사", async (id) => {
      removeOriginalDropdown();
      const characterData = await getChatData(id, false);
      if (characterData instanceof Error) {
        alert(
          "캐릭터를 가져오는데에 실패하였습니다 : 인증 정보가 올바르지 않거나, 잘못된 캐릭터입니다."
        );
        return;
      }
      navigator.clipboard.writeText(JSON.stringify(characterData, null, 2));
      alert("캐릭터 데이터가 클립보드로 복사되었습니다.");
    });
    appendNewMenu(menu, "↗ JSON 붙여넣기", async (id) => {
      await pasteCharacter(id, false, false);
    });
  }

  function setupStoryDropdown(menu) {
    appendDropdownMenu(menu, "✦ 세이프티 재게시", (appender) => {
      appender("✦ 공개", async (id) => {
        await publish(id, 0, true);
      });
      appender("✦ 링크 공개", async (id) => {
        await publish(id, 2, true);
      });
      appender("✦ 비공개", async (id) => {
        await publish(id, 1, true);
      });
    });
    appendDropdownMenu(menu, "✦ 언세이프티 재게시", (appender) => {
      appender("✦ 공개", async (id) => {
        await publish(id, 0, false);
      });
      appender("✦ 링크 공개", async (id) => {
        await publish(id, 2, false);
      });
      appender("✦ 비공개", async (id) => {
        await publish(id, 1, false);
      });
    });
    appendDropdownMenu(menu, "✦ 파일 관리", (appender) => {
      appender("✦ 파일로 내보내기", async (id) => {
        await exportToFile(id);
      });
      appender("✦ 파일에서 가져오기", async (id) => {
        await importFromFile(id);
      });
    });
    appendNewMenu(menu, "↙ JSON 복사", async (id) => {
      removeOriginalDropdown();
      const characterData = await getChatData(id, false);
      if (characterData instanceof Error) {
        alert(
          "캐릭터를 가져오는데에 실패하였습니다 : 인증 정보가 올바르지 않거나, 잘못된 캐릭터입니다."
        );
        return;
      }
      navigator.clipboard.writeText(JSON.stringify(characterData, null, 2));
      alert("캐릭터 데이터가 클립보드로 복사되었습니다.");
    });
    appendNewMenu(menu, "↗ JSON 붙여넣기", async (id) => {
      await pasteCharacter(id, false, true);
    });
  }

  function prepare() {
    setup();
    attachObserver(document, setup);
  }
  document.neo_copy_debug = doDebugExtraction;

  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
})();
