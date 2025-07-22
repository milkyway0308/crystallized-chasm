// ==UserScript==
// @name         Chasm Crystallized TMI (캐즘 과포화)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-TMI-v1.0.0
// @description  크랙 UI에 추가 정보 제공. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js
// @grant        none
// ==/UserScript==
(async function () {
  let initialCracker = undefined;
  let doesInitialized = false;

  function updateCracker(cracker) {
    initialCracker = cracker;
    updateCrackerText();
    updateRemainingText(cracker);
    updateModalText(cracker);
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

  function updateCrackerText() {
    const buttonElements = document.getElementsByClassName("css-1jrgdy");
    if (!buttonElements || buttonElements.length <= 0) {
      logWarning("No cracker button found; Does crack updated?");
      return;
    }
    if (initialCracker === undefined) {
      return;
    }

    let elementsText = document.getElementsByClassName("chasm-cracker-text");
    if (!elementsText || elementsText.length <= 0) {
      const tag = document.createElement("p");
      tag.className = "chasm-cracker-text";
      if (isDarkMode()) {
        tag.setAttribute("chasm-tmi-dark-mode", "true");
        tag.style.cssText =
          "margin-left: 5px; font-weight: bolder; font-size: 16px; color: #FFFFFF; transition: color 0.2s;";
      } else {
        tag.setAttribute("chasm-tmi-dark-mode", "false");
        tag.style.cssText =
          "margin-left: 5px; font-weight: bolder; font-size: 16px; color: #000000; transition: color 0.2s;";
      }
      buttonElements[0].append(tag);
      elementsText = document.getElementsByClassName("chasm-cracker-text");
    }
    const tag = elementsText[0];
    if (isDarkMode().toString() != tag.getAttribute("chasm-tmi-dark-mode")) {
           if (isDarkMode()) {
        tag.setAttribute("chasm-tmi-dark-mode", "true");
        tag.style.cssText =
          "margin-left: 5px; font-weight: bolder; font-size: 16px; color: #FFFFFF; transition: color 0.2s;";
      } else {
        tag.setAttribute("chasm-tmi-dark-mode", "false");
        tag.style.cssText =
          "margin-left: 5px; font-weight: bolder; font-size: 16px; color: #000000; transition: color 0.2s;";
      }
    }

    let nextText = initialCracker.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    if (tag.textContent === nextText) {
      return;
    }
    tag.textContent = nextText;
  }

  function updateRemainingText(cracker) {
    const targets = document.getElementsByClassName("css-1bhbevm");
    if (!targets || targets.length <= 0) return;
    const currentTarget = targets[targets.length - 1];
    const textTag = currentTarget.getElementsByTagName("p")[0];
    let expectedChatType = "";
    const currentColor = textTag.parentElement.getAttribute("color");
    if (currentColor === null) {
      return;
    }
    if (currentColor === "sub_creator_red") {
      expectedChatType = "하이퍼챗";
    } else if (currentColor === "sub_violet") {
      expectedChatType = "슈퍼챗+";
    } else if (currentColor === "action_blue_primary") {
      expectedChatType = "슈퍼챗";
    } else if (currentColor === "sub_green") {
      expectedChatType = "파워챗";
    } else if (currentColor === "text_tertiary") {
      expectedChatType = "일반챗";
    }
    let nextText = formatChatLeft(expectedChatType, cracker);
    if (nextText === textTag.textContent) {
      return;
    }
    textTag.textContent = nextText;
  }

  function updateModalText(cracker) {
    const elements = document.getElementsByClassName(
      isDarkMode() ? "css-ef8yqo" : "css-1a5wekv"
    );
    if (!elements || elements.length <= 0) return;
    for (let textNode of elements) {
      if (textNode.nodeName.toLowerCase() !== "p") {
        continue;
      }
      if (!textNode.hasAttribute("chasm-tmi-modal-origin")) {
        textNode.setAttribute("chasm-tmi-modal-origin", textNode.textContent);
      }
      const nextText = formatChatLeft(
        textNode.getAttribute("chasm-tmi-modal-origin"),
        cracker
      );

      if (nextText !== textNode.textContent) {
        textNode.textContent = nextText;
      }
    }
  }

  function formatChatLeft(chatType, cracker) {
    let nextText = chatType + " | ???";
    if (chatType === "일반챗") {
      nextText = chatType + " | ∞";
    } else if (chatType === "파워챗") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 15) + "회";
    } else if (chatType === "슈퍼챗") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 35) + "회";
    } else if (chatType === "슈퍼챗+") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 35) + "회";
    } else if (chatType === "하이퍼챗") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 175) + "회";
    }
    return nextText;
  }
  async function extractCracker() {
    const root = document.getElementsByClassName("css-uxwch2");
    if (!root || root.length <= 0) {
      return undefined;
    }
    const menuElements = root[0].getElementsByClassName("css-j7qwjs");
    if (!menuElements || menuElements.length <= 0) {
      return undefined;
    }
    for (let element of menuElements) {
      let expectedLabel = element.childNodes[0];
      if (
        expectedLabel.nodeName.toLowerCase() === "p" &&
        expectedLabel.textContent === "나의 크래커"
      ) {
        return parseInt(
          element.childNodes[1]
            .getElementsByTagName("p")[0]
            .textContent.replace(",", "")
        );
      }
    }
    return undefined;
  }

  async function getCrackerFromServer() {
    let result = await fetch(
      "https://contents-api.wrtn.ai/superchat/crackers",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${extractAccessToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!result.ok) {
      logWarning("서버에서 크래커 개수를 가져오는데에 실패하였습니다.");
      return -1;
    }
    let json = await result.json();
    return json.data.quantity;
  }

  function log(message) {
    console.log(
      "%cChasm Crystallized TMI: %cInfo: %c" + message,
      "color: yellow;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized TMI: %cWarning: %c" + message,
      "color: yellow;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized TMI: %cError: %c" + message,
      "color: yellow;",
      "color: red;",
      "color: inherit;"
    );
  }

  function isDarkMode() {
    return document.body.getAttribute("data-theme") === "dark";
  }

  async function doInitialize() {
    if (!doesInitialized) {
      doesInitialized = true;
      attachObserver(document.body, doInitialize);
    }

    if (initialCracker === undefined) {
      initialCracker = await getCrackerFromServer();
      if (initialCracker !== undefined) {
        updateCracker(initialCracker);
      }
    }
    if (initialCracker === undefined) {
      // Failed to fetch - just stop
      return;
    }
    updateCracker(await extractCracker());
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
  "loading" === document.readyState
    ? (document.addEventListener("DOMContentLoaded", B),
      window.addEventListener("load", B))
    : "interactive" === document.readyState ||
      "complete" === document.readyState
    ? await doInitialize()
    : setTimeout(doInitialize, 100);
})();
