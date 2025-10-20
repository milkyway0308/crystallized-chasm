// ==UserScript==
// @name         Chasm Crystallized TMI (캐즘 과포화)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-TMI-v1.4.0p
// @description  크랙 UI에 추가 정보 제공. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js
// @require      https://raw.githubusercontent.com/milkyway0308/crystallized-chasm/6fe6a18fccb9da6806e3891ac18110f880b7c3bc/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==
(async function () {
  let initialCracker = undefined;
  let doesInitialized = false;
  let updating = false;
  let updateStoppedAt = new Date();
  let fetched = false;
  let requireReupdate = false;

  // =====================================================
  //                      유틸리티
  // =====================================================

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

  // =====================================================
  //                   크랙 종속 유틸리티
  // =====================================================

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

  function isDarkMode() {
    return document.body.getAttribute("data-theme") === "dark";
  }

  function isARPGPath() {
    return /\/arpg\/[a-f0-9]+\/[a-f0-9]+\/play/.test(location.pathname);
  }

  function isARPGBuilderPath() {
    return /\/arpg\/[a-f0-9]+\/builder/.test(location.pathname);
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

  // =====================================================
  //                  크랙 데이터 통신 펑션
  // =====================================================
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

  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    enableLeftCracker: true,
    enableCrackerDelta: true,
    enableStoryChatLeft: true,
    enableModelPopupLeft: true,
    enableArpgRerollLeft: true,
    enableArpgChatLeft: true,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-tmi-settings");
    if (loadedSettings) {
      const json = JSON.parse(loadedSettings);
      for (let key of Object.keys(json)) {
        // Merge setting for version compatibility support
        settings[key] = json[key];
      }
    }
  }

  function saveSettings() {
    log("설정 저장중..");
    // Yay, no need to filtering anything!
    localStorage.setItem("chasm-tmi-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }

  function doStoryChatCalc() {
    return isStoryPath() && settings.enableStoryChatLeft;
  }

  function doStoryModelCalc() {
    return isStoryPath() && settings.enableModelPopupLeft;
  }

  function doArpgRerollCalc() {
    return isARPGBuilderPath() && settings.enableArpgRerollLeft;
  }

  function doArpgChatCalc() {
    return isARPGPath() && settings.enableArpgChatLeft;
  }

  // =====================================================
  //                      로직
  // =====================================================

  function updateCracker(cracker) {
    initialCracker = cracker;
    updateCrackerText(cracker);
    updateARPGRemainingText(cracker);
    updateRemainingText(cracker);
    updateModalText(cracker);
  }

  function updateCrackerText(cracker) {
    if (!settings.enableLeftCracker) return;
    const buttonElements = document.getElementsByClassName("css-5q07im");
    if (!buttonElements || buttonElements.length <= 0) {
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
      if (settings.enableCrackerDelta) {
        tag.setAttribute("chasm-tmi-current", cracker.toString());
      } else {
        tag.setAttribute("chasm-tmi-current", cracker.toString());
        tag.setAttribute("chasm-tmi-target", cracker.toString());
        tag.textContent = cracker.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
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
    if (tag.getAttribute("chasm-tmi-target") !== cracker.toString()) {
      tag.setAttribute("chasm-tmi-target", cracker.toString());
    }
  }

  function updateARPGRemainingText(cracker) {
    if (doArpgChatCalc()) {
      const leftButton = document.getElementsByClassName(
        isDarkMode() ? "css-7xxnit" : "css-1w6u7sl"
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
    if (doArpgRerollCalc()) {
      const confirmButton = document.getElementsByClassName(
        isDarkMode() ? "css-7xxnit" : "css-1w6u7sl"
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
    if (!doStoryChatCalc()) return;
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
      expectedChatType = "슈퍼챗 2.0";
    } else if (currentColor === "action_blue_primary") {
      expectedChatType = "슈퍼챗 1.5";
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
    if (!doStoryModelCalc()) return;
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
    } else if (chatType === "슈퍼챗 1.5") {
      nextText = chatType + " | 잔여 " + Math.floor(cracker / 35) + "회";
    } else if (chatType === "슈퍼챗 2.0") {
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

  async function extractCracker() {
    cracker = extractCharacterCracker();
    if (cracker && cracker !== NaN) {
      return cracker;
    }
    return undefined;
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

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 과포화", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addTitleText("일반 설정");
        panel.addSwitchBox(
          "tmi-display-cracker",
          "잔여 크래커 표시",
          "잔여 크래커를 표시할지의 여부입니다.",
          {
            defaultValue: settings.enableLeftCracker,
            action: (_, value) => {
              settings.enableLeftCracker = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "tmi-chat-calc",
          "스토리 채팅 잔여 채팅 횟수 표시",
          "스토리 채팅에서 잔여 채팅 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.enableStoryChatLeft,
            action: (_, value) => {
              settings.enableStoryChatLeft = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "tmi-chat-model-calc",
          "스토리 채팅 모델 팝업 잔여 채팅 횟수 표시",
          "스토리 채팅 모델 팝업에서 잔여 채팅 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.enableModelPopupLeft,
            action: (_, value) => {
              settings.enableModelPopupLeft = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "tmi-cracker-delta",
          "델타 애니메이션",
          "크래커의 감소 뎉라 애니메이션을 적용할지의 여부입니다.",
          {
            defaultValue: settings.enableCrackerDelta,
            action: (_, value) => {
              settings.enableStoryChatLeft = value;
              saveSettings();
            },
          }
        );
        panel.addTitleText("ARPG 설정");
        panel.addSwitchBox(
          "tmi-arpg-left",
          "ARPG 잔여 횟수 표시",
          "ARPG의 잔여 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.enableArpgChatLeft,
            action: (_, value) => {
              settings.enableArpgChatLeft = value;
              saveSettings();
            },
          }
        );
        panel.addSwitchBox(
          "tmi-arpg-reroll-left",
          "ARPG 리롤 잔여 횟수 표기",
          "ARPG의 리롤 잔여 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.enableArpgRerollLeft,
            action: (_, value) => {
              settings.enableArpgRerollLeft = value;
              saveSettings();
            },
          }
        );
      }, "결정화 캐즘 과포화");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 과포화");
      panel.addText(
        "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized-modal.js)"
      );
    });
  }

  loadSettings();
  addMenu();
  "loading" === document.readyState
    ? (document.addEventListener("DOMContentLoaded", doInitialize),
      window.addEventListener("load", doInitialize))
    : "interactive" === document.readyState ||
      "complete" === document.readyState
    ? await doInitialize()
    : setTimeout(doInitialize, 100);
})();
