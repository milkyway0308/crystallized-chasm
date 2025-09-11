// ==UserScript==
// @name         Chasm Crystallized TMI (캐즘 과포화)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-TMI-v1.3.2
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
  let updating = false;
  let updateStoppedAt = new Date();
  let fetched = false;
  let requireReupdate = false;

  function updateCracker(cracker) {
    initialCracker = cracker;
    updateCrackerText(cracker);
    updateARPGRemainingText(cracker);
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

  function updateCrackerText(cracker) {
    const buttonElements = document.getElementsByClassName("css-5q07im");
    if (!buttonElements || buttonElements.length <= 0) {
      logWarning("No cracker button found; Does crack updated?");
      return;
    }
    if (cracker === undefined) {
      return;
    }
    let elementsText = document.getElementsByClassName("chasm-cracker-text");
    if (!elementsText || elementsText.length <= 0) {
      const tag = document.createElement("p");
      tag.id = "chasm-cracker-text";
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
      const nextText = cracker.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      tag.textContent = nextText;
      tag.setAttribute("chasm-tmi-current", cracker.toString());
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
    if (tag.getAttribute("chasm-tmi-target") !== cracker.toString()) {
      tag.setAttribute("chasm-tmi-target", cracker.toString());
    }
  }

  function updateARPGRemainingText(cracker) {
    if (isARPGPath()) {
      const leftButton = document.getElementsByClassName(
        isDarkMode() ? "css-l2pvvz" : "css-mxh4ma"
      );
      if (leftButton && leftButton.length > 0) {
        if (leftButton[0].getAttribute("last-cracker") !== cracker.toString()) {
          leftButton[0].setAttribute("last-cracker", cracker.toString());
          leftButton[0].childNodes[0].childNodes[1].childNodes[1].textContent =
            "110 | " + parseInt(cracker / 110) + "회";
        }
      } else {
        return;
      }
      const rightButton = leftButton[0].parentElement.childNodes[1];
      if (rightButton.getAttribute("last-cracker") !== cracker.toString()) {
        rightButton.setAttribute("last-cracker", cracker.toString());
        rightButton.childNodes[0].childNodes[1].childNodes[1].textContent =
          "55 | " + parseInt(cracker / 55) + "회";
      }
    }
    if (isARPGBuilderPath()) {
      const confirmButton = document.getElementsByClassName(
        isDarkMode() ? "css-l2pvvz" : "css-mxh4ma"
      );
      if (confirmButton && confirmButton.length > 0) {
        if (
          confirmButton[0].childNodes[0].childNodes[0].textContent ===
          "캐릭터 생성"
        ) {
          if (
            confirmButton[0].getAttribute("last-cracker") !== cracker.toString()
          ) {
            confirmButton[0].setAttribute("last-cracker", cracker.toString());
            confirmButton[0].childNodes[0].childNodes[1].childNodes[1].textContent =
              "50 | " + parseInt(cracker / 50) + "회";
          }
        }
      }
    }
  }

  function updateRemainingText(cracker) {
    let targets = document.getElementsByClassName("css-1bhbevm");
    if (!targets || targets.length <= 0) {
      return;
    }
    targets = targets[0].childNodes;
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
    } else if (currentColor == "text_cracker_secondary") {
      expectedChatType = "파워챗+";
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
    } else if (chatType === "파워챗+") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 45) + "회";
    } else if (chatType === "슈퍼챗") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 35) + "회";
    } else if (chatType === "슈퍼챗+") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 35) + "회";
    } else if (chatType === "하이퍼챗") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 175) + "회";
    }
    return nextText;
  }
  async function extractCharacterCracker() {
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

  async function extractARPGCracker() {
    const root = document.getElementsByClassName(
      isDarkMode() ? "css-ywu28u" : "css-1akfzan"
    );
    if (!root || root.length <= 0) {
      return undefined;
    }
    const expectedCrackerNodes = root[0].getElementsByTagName("p");
    if (expectedCrackerNodes.length > 1) {
      return parseInt(expectedCrackerNodes[1].textContent.replace(",", ""));
    }
    return undefined;
  }

  async function extractCracker() {
    // let cracker = extractARPGCracker();
    // if (cracker && cracker !== NaN) {
    //   return cracker;
    // }
    cracker = extractCharacterCracker();
    if (cracker && cracker !== NaN) {
      return cracker;
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
    if (updating) return;
    if (!doesInitialized) {
      doesInitialized = true;
      attachObserver(document.body, doInitialize);
      runSchedule();
    }
    if (initialCracker === undefined) {
      updating = true;
      const lastCracker = await getCrackerFromServer();
      if (lastCracker !== undefined) {
        updateCracker(lastCracker);
        updating = false;
        return;
      }
        updating = false;
    }
    if (requireReupdate) {
      requireReupdate = false;
      updateCracker(initialCracker);
    }
    if (isARPGPath()) {
      // Let's use more modern and solid solution
      updateStoppedAt = new Date();
      updating = false;
      fetched = false;
    } else if (isARPGBuilderPath()) {
      if (initialCracker !== undefined) {
        updateARPGRemainingText(initialCracker);
      }
    } else {
      let nextCracker = await extractCracker();
      if (nextCracker !== undefined) {
        updateCracker(await extractCracker());
      }
    }
  }

  function isARPGPath() {
    return /\/arpg\/[a-f0-9]+\/play\/[a-f0-9]+/.test(location.pathname);
  }

  function isARPGBuilderPath() {
    return /\/arpg\/[a-f0-9]+\/builder/.test(location.pathname);
  }

  function runSchedule() {
    setInterval(async () => {
      if (!isARPGPath()) return;
      if (updating) return;
      if (!fetched && new Date() - updateStoppedAt > 500) {
        fetched = true;
        const lastCracker = await getCrackerFromServer();
        if (lastCracker !== undefined) {
          updateCracker(lastCracker);
          updating = false;
        }
      }
    }, 50);
    // Text delta movement
    setInterval(() => {
      const element = document.getElementById("chasm-cracker-text");
      if (element) {
        const objective = parseInt(element.getAttribute("chasm-tmi-target"));
        const current = parseInt(element.getAttribute("chasm-tmi-current"));
        const abs = Math.abs(current - objective);
        const delta = abs > 300 ? 16 : abs > 100 ? 8 : abs > 50 ? 2 : 1;
        if (current > objective) {
          const next = current - delta;
          element.setAttribute("chasm-tmi-current", next);
          element.textContent = next.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        } else if (current < objective) {
          const next = current + delta;
          element.setAttribute("chasm-tmi-current", next);
          element.textContent = next.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        }
      }
    }, 7);
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
    ? (document.addEventListener("DOMContentLoaded", doInitialize),
      window.addEventListener("load", doInitialize))
    : "interactive" === document.readyState ||
      "complete" === document.readyState
    ? await doInitialize()
    : setTimeout(doInitialize, 100);
})();
