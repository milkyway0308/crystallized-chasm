/// <reference path="decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized TMI (캐즘 과포화)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-TMI-v1.6.2
// @description  크랙 UI에 추가 정보 제공. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/tmi.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.11/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(`
  body[data-theme="light"] {
    --chasm-tmi-font-color: #242424;
  }
  body[data-theme="dark"] {
    --chasm-tmi-font-color: #CDCDCD;
  }
  .chasm-tmi-indicator {
    font-size: 12px;
    color: var(--chasm-tmi-font-color);
    font-weight: 600;
  }

`);
(async function () {
  // =====================================================
  //                      클래스 선언
  // =====================================================
  class CrackerModels {
    /**
     *
     * @param {string} id
     * @param {string} name
     * @param {number} quantity
     * @param {string} serviceType
     */
    constructor(id, name, quantity, serviceType) {
      this.id = id;
      this.name = name;
      this.quantity = quantity;
      this.serviceType = serviceType;
    }
  }

  // =====================================================
  //                        상수
  // =====================================================

  let initialCracker = undefined;
  let doesInitialized = false;
  let updating = false;
  let updateStoppedAt = new Date();
  let fetched = false;
  let requireReupdate = false;
  /** @type {Map<string, CrackerModels> | Error} */
  let cachedModels = await getCrackerModels();

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
    let result = await fetch("https://crack-api.wrtn.ai/crack-cash/crackers", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${extractAccessToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!result.ok) {
      logWarning("서버에서 크래커 개수를 가져오는데에 실패하였습니다.");
      return -1;
    }
    let json = await result.json();
    return json.data.quantity;
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

  function findCrackerButton() {
    const buttonElements = document.getElementsByClassName("css-5q07im");
    if (!buttonElements || buttonElements.length <= 0) {
      return;
    }
    for (let button of buttonElements) {
      if (button.parentElement.getAttribute("href") === "/cracker") {
        return button;
      }
    }
    return undefined;
  }

  function updateCrackerText(cracker) {
    if (!settings.enableLeftCracker) return;
    if (cracker === undefined) {
      return;
    }
    const buttonElement = findCrackerButton();

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
      buttonElement.append(tag);
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
        isDarkMode() ? "css-td6bk9" : "css-1rrnf8q"
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
        isDarkMode() ? "css-td6bk9" : "css-1rrnf8q"
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

    if (!textTag.hasAttribute("chasm-tmi-model-type")) {
      if (textTag.textContent.trim().length <= 0) {
        // To prevent pre-load replacement
        return;
      }
      textTag.setAttribute("chasm-tmi-model-type", textTag.textContent);
    }
    let nextText = formatChatLeft(
      textTag.getAttribute("chasm-tmi-model-type"),
      cracker,
      true
    );
    if (nextText === textTag.textContent) {
      return;
    }
    textTag.textContent = nextText;
  }

  function updateModalText(cracker) {
    if (!doStoryModelCalc()) return;
    let indicatorEntity = document.getElementsByClassName(
      "chasm-tmi-indicator"
    );
    if (indicatorEntity.length <= 0) {
      // Inject small indicator
      const elements = document.getElementsByClassName(
        isDarkMode() ? "css-m78xu9" : "css-12698ad"
      );
      for (let element of elements) {
        if (element.nodeName.toLowerCase() !== "p") {
          continue;
        }
        const indicator = document.createElement("p");
        indicator.className = "chasm-tmi-indicator";
        indicator.setAttribute("target-model", element.textContent);
        element.parentElement.parentElement.parentElement.appendChild(
          indicator
        );
      }
      indicatorEntity = document.getElementsByClassName("chasm-tmi-indicator");
    }
    if (!indicatorEntity || indicatorEntity.length <= 0) return;

    for (let textNode of indicatorEntity) {
      const nextText = formatChatLeft(
        textNode.getAttribute("target-model"),
        cracker,
        false
      );
      if (nextText !== textNode.textContent) {
        textNode.textContent = nextText;
      }
    }
  }

  function formatChatLeft(chatType, cracker, includeModelName) {
    if (cachedModels.has(chatType)) {
      /** @type {CrackerModels} */
      const model = cachedModels.get(chatType);
      if (model.quantity <= 0) {
        if (includeModelName) {
          return chatType + " | 잔여 ∞회";
        } else {
          return "잔여 ∞회";
        }
      }
      if (includeModelName) {
        return (
          chatType + " | 잔여 " + Math.floor(cracker / model.quantity) + "회"
        );
      } else {
        return "잔여 " + Math.floor(cracker / model.quantity) + "회";
      }
    }
    if (includeModelName) {
      return chatType + " | ???";
    } else {
      return "잔여 횟수 알 수 없음";
    }
  }

  async function extractCharacterCracker() {
    const root = document.getElementsByClassName("css-1v8my8o");
    if (!root || root.length <= 0) {
      return undefined;
    }
    for (const menuElement of root) {
      const menuElements = menuElement.getElementsByClassName("css-uxwch2");
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
            element.childNodes[1].childNodes[1].childNodes[0].textContent.replace(
              ",",
              ""
            )
          );
        }
      }
    }
    return undefined;
  }

  /**
   * @returns {Promise<Map<string, CrackerModels>|Error>}
   */
  async function getCrackerModels() {
    const result = await authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-gen/v3/chat-models"
    );
    if (result instanceof Error) {
      console.error(result);
      return result;
    }
    if (!result.data.models) {
      return new Map();
    }
    /** @type {Map<string, CrackerModels>} */
    const map = new Map();
    for (let model of result.data.models) {
      map.set(
        model.name,
        new CrackerModels(
          model._id,
          model.name,
          model.crackerQuantity,
          model.serviceType
        )
      );
    }
    return map;
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
              settings.enableCrackerDelta = value;
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
  if (cachedModels instanceof Error) {
    logError("모델 데이터를 불러오는데에 실패하였습니다.");
    return;
  }
  "loading" === document.readyState
    ? (document.addEventListener("DOMContentLoaded", doInitialize),
      window.addEventListener("load", doInitialize))
    : "interactive" === document.readyState ||
      "complete" === document.readyState
    ? await doInitialize()
    : setTimeout(doInitialize, 100);

  // =================================================
  //                  메뉴 강제 추가
  // =================================================
  function __updateModalMenu() {
    const modal = document.getElementById("web-modal");
    if (modal && !document.getElementById("chasm-decentral-menu")) {
      const itemFound = modal.getElementsByTagName("a");
      for (let item of itemFound) {
        if (item.getAttribute("href") === "/setting") {
          const clonedElement = item.cloneNode(true);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("p")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          item.parentElement.append(clonedElement);
          break;
        }
      }
    } else if (
      !document.getElementById("chasm-decentral-menu") &&
      !window.matchMedia("(min-width: 768px)").matches
    ) {
      // Probably it's mobile, lets try scanning
      const selected = document.getElementsByTagName("a");
      for (const element of selected) {
        if (element.getAttribute("href") === "/my-page") {
          const clonedElement = element.cloneNode(true);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("p")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          element.parentElement.append(clonedElement);
        }
      }
    }
  }

  function __doModalMenuInit() {
    if (document.c2ModalInit) return;
    document.c2ModalInit = true;
    attachObserver(document, () => {
      __updateModalMenu();
    });
  }
  __doModalMenuInit();
})();
