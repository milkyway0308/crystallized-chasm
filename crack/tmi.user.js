/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized TMI (캐즘 과포화)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-TMI-v1.7.1
// @description  크랙 UI에 추가 정보 제공. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/tmi.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/tmi.user.js
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

// @ts-ignore
GM_addStyle(`
  body[data-theme="light"] {
    --chasm-tmi-font-color: #242424;
    --chasm-tmi-cracker-display: #000000;
  }
  body[data-theme="dark"] {
    --chasm-tmi-font-color: #CDCDCD;
    --chasm-tmi-cracker-display: #FFFFFF;
  }

  .chasm-cracker-display {
    margin-left: 5px; 
    font-weight: bolder; 
    font-size: 16px; 
    color: var(--chasm-tmi-cracker-display); 
    transition: color 0.2s;
  }

  .chasm-tmi-indicator {
    font-size: 12px;
    color: var(--chasm-tmi-font-color);
    font-weight: 600;
  }

  @media screen and (max-width:770px) {
    .chasm-tmi-text-mobile-container {
      display: flex;
      flex-direction: row;
      width: fit-content;
      align-items: center;
    }  
  }
  
  .chasm-tmi-button-expander {
    display: flex;
    flex-direction: row;
    width: fit-content;
    margin-right: 5px;
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

  /** @type {number | undefined} */
  let initialCracker = undefined;
  let doesInitialized = false;
  let updating = false;
  let updateStoppedAt = new Date();
  let fetched = false;
  let requireReupdate = false;
  /** @type {Map<string, CrackerModels> | Error} */
  let cachedModels = await getCrackerModels();
  const logger = new LogUtil("Chasm Crystallized TMI", false);

  // =====================================================
  //                   크랙 종속 유틸리티
  // =====================================================

  function isARPGPath() {
    return /\/arpg\/[a-f0-9]+\/[a-f0-9]+\/play/.test(location.pathname);
  }

  function isARPGBuilderPath() {
    return /\/arpg\/[a-f0-9]+\/builder/.test(location.pathname);
  }

  // =====================================================
  //                      설정
  // =====================================================
  const settings = new LocaleStorageConfig("chasm-tmi-settings", {
    enableLeftCracker: true,
    enableCrackerDelta: true,
    enableStoryChatLeft: true,
    enableModelPopupLeft: true,
    enableArpgRerollLeft: true,
    enableArpgChatLeft: true,
  });

  function doStoryChatCalc() {
    return (
      CrackUtil.path().isStoryPath() && settings.config.enableStoryChatLeft
    );
  }

  function doStoryModelCalc() {
    return (
      CrackUtil.path().isStoryPath() && settings.config.enableModelPopupLeft
    );
  }

  function doArpgRerollCalc() {
    return isARPGBuilderPath() && settings.config.enableArpgRerollLeft;
  }

  function doArpgChatCalc() {
    return isARPGPath() && settings.config.enableArpgChatLeft;
  }

  // =====================================================
  //                      로직
  // =====================================================

  /**
   *
   * @param {number} cracker
   */
  function updateCracker(cracker) {
    initialCracker = cracker;
    updateCrackerText(cracker);
    updateARPGRemainingText(cracker);
    updateRemainingText(cracker);
    updateModalText(cracker);
  }

  function findCrackerButton() {
    const topContainerElement = document.getElementsByClassName(
      CrackUtil.theme().isDarkTheme() ? "css-7238to" : "css-9gj46x",
    );
    if (topContainerElement.length <= 0) return;
    const hyperLinkElement = topContainerElement[0].getElementsByTagName("a");
    for (let button of hyperLinkElement) {
      if (button.getAttribute("href") === "/cracker") {
        return button;
      }
    }
    return undefined;
  }

  function findMobileCrackerPosition() {
    const topElement = document.getElementsByClassName(
      CrackUtil.theme().isDarkTheme() ? "css-7238to" : "css-9gj46x",
    );
    if (topElement.length > 0) {
      return topElement[0].childNodes[0].childNodes[0];
    }
    return undefined;
  }

  /**
   *
   * @param {number} cracker
   * @returns
   */
  function createCrackerTag(cracker) {
    const tag = document.createElement("p");
    tag.id = "chasm-cracker-text";
    tag.className = "chasm-cracker-text";
    if (CrackUtil.theme().isDarkTheme()) {
      tag.className = "chasm-cracker-display";
    } else {
      tag.className = "chasm-cracker-display";
    }
    const nextText = cracker.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    tag.textContent = nextText;
    if (settings.config.enableCrackerDelta) {
      tag.setAttribute("chasm-tmi-current", cracker.toString());
    } else {
      tag.setAttribute("chasm-tmi-current", cracker.toString());
      tag.setAttribute("chasm-tmi-target", cracker.toString());
      tag.textContent = cracker.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return tag;
  }

  /**
   *
   * @param {number} cracker
   * @returns
   */
  function updateCrackerText(cracker) {
    if (!settings.config.enableLeftCracker) return;
    if (cracker === undefined) {
      return;
    }
    const buttonElement = findCrackerButton();
    let elementsText = document.getElementsByClassName("chasm-cracker-text");
    if (!elementsText || elementsText.length <= 0) {
      if (buttonElement) {
        buttonElement.append(createCrackerTag(cracker));
        buttonElement.classList.add("chasm-tmi-button-expander");
        elementsText = document.getElementsByClassName("chasm-cracker-text");
      }
    }
    let mobileText = document.querySelectorAll("chasm-cracker-text[mobile]");
    if (mobileText.length <= 0) {
      const parent = GenericUtil.refine(findMobileCrackerPosition());
      if (parent) {
        const tag = createCrackerTag(cracker);
        tag.setAttribute("mobile", "true");
        parent.append(tag);
        parent.classList.add("chasm-tmi-text-mobile-container");
        elementsText = document.getElementsByClassName("chasm-cracker-text");
      }
    }
    for (let tag of elementsText) {
      if (tag.getAttribute("chasm-tmi-target") !== cracker.toString()) {
        tag.setAttribute("chasm-tmi-target", cracker.toString());
      }
    }
  }

  /**
   *
   * @param {number} cracker
   * @returns
   */
  function updateARPGRemainingText(cracker) {
    if (doArpgChatCalc()) {
      const leftButton = document.getElementsByClassName(
        CrackUtil.theme().isDarkTheme() ? "css-td6bk9" : "css-1rrnf8q",
      );
      if (leftButton && leftButton.length > 0) {
        if (leftButton[0].getAttribute("last-cracker") !== cracker.toString()) {
          leftButton[0].setAttribute("last-cracker", cracker.toString());
          leftButton[0].childNodes[0].childNodes[1].childNodes[1].textContent =
            "110 | " + Math.floor(cracker / 110) + "회";
        }
      } else {
        return;
      }
      const rightButton = leftButton[0].parentElement?.childNodes[1];
      if (
        GenericUtil.refine(rightButton).getAttribute("last-cracker") !==
        cracker.toString()
      ) {
        GenericUtil.refine(rightButton).setAttribute(
          "last-cracker",
          cracker.toString(),
        );
        GenericUtil.refine(
          rightButton?.childNodes[0].childNodes[1].childNodes[1],
        ).textContent = "55 | " + Math.floor(cracker / 55) + "회";
      }
    }
    if (doArpgRerollCalc()) {
      const confirmButton = document.getElementsByClassName(
        CrackUtil.theme().isDarkTheme() ? "css-td6bk9" : "css-1rrnf8q",
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
              "50 | " + Math.floor(cracker / 50) + "회";
          }
        }
      }
    }
  }

  /**
   *
   * @param {number} cracker
   * @returns
   */
  function updateRemainingText(cracker) {
    if (!doStoryChatCalc()) return;
    let targets = document.querySelectorAll(
      "div.css-160ssko div.flex.gap-3.items-center",
    );
    if (!targets || targets.length <= 0) {
      return;
    }
    // @ts-ignore
    targets = targets[0].childNodes;
    const currentTarget = targets[targets.length - 2];
    const textTag = currentTarget.getElementsByTagName("span")[0];
    if (!textTag.hasAttribute("chasm-tmi-model-type")) {
      if (textTag.textContent.trim().length <= 0) {
        // To prevent pre-load replacement
        return;
      }
      textTag.setAttribute("chasm-tmi-model-type", textTag.textContent);
    }
    let nextText = formatChatLeft(
      textTag.getAttribute("chasm-tmi-model-type") ?? "-ERROR-",
      cracker,
      true,
    );
    if (nextText === textTag.textContent) {
      return;
    }
    textTag.textContent = nextText;
  }

  /**
   *
   * @param {number} cracker
   * @returns
   */
  function updateModalText(cracker) {
    if (!doStoryModelCalc()) return;
    let indicatorEntity = document.getElementsByClassName(
      "chasm-tmi-indicator",
    );
    if (indicatorEntity.length <= 0) {
      // Inject small indicator
      const elements = document.querySelectorAll(
        "div.css-160ssko div[data-radix-popper-content-wrapper] [data-radix-collection-item]",
      );
      for (let element of elements) {
        const modelTextNode = element.getElementsByTagName("span");
        if (modelTextNode.length <= 0) return;
        const indicator = document.createElement("span");
        indicator.className = "chasm-tmi-indicator";
        indicator.setAttribute("target-model", modelTextNode[0].textContent);
        element.childNodes[0].appendChild(indicator);
      }
      indicatorEntity = document.getElementsByClassName("chasm-tmi-indicator");
    }
    if (!indicatorEntity || indicatorEntity.length <= 0) return;

    for (let textNode of indicatorEntity) {
      const nextText = formatChatLeft(
        textNode.getAttribute("target-model") ?? "-ERROR-",
        cracker,
        false,
      );
      if (nextText !== textNode.textContent) {
        textNode.textContent = nextText;
      }
    }
  }

  /**
   *
   * @param {string} chatType
   * @param {number} cracker
   * @param {boolean} includeModelName
   * @returns
   */
  function formatChatLeft(chatType, cracker, includeModelName) {
    if (cachedModels instanceof Error) return " | --회";
    if (cachedModels.has(chatType)) {
      /** @type {CrackerModels} */
      const model =
        cachedModels.get(chatType) ??
        new CrackerModels("PLACEHOLDER", "PLACEHOLDER", 0, "none");
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
            GenericUtil.refine(
              element.childNodes[1].childNodes[1].childNodes[0].textContent,
            ).replace(",", ""),
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
    const result = await CrackUtil.network().authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-gen/v3/chat-models",
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
          model.serviceType,
        ),
      );
    }
    return map;
  }
  async function extractCracker() {
    let cracker = await extractCharacterCracker();
    if (cracker && !Number.isNaN(cracker)) {
      return cracker;
    }
    return undefined;
  }

  async function doInitialize() {
    if (updating) return;
    if (!doesInitialized) {
      doesInitialized = true;
      GenericUtil.attachObserver(document.body, doInitialize);
      runSchedule();
    }
    if (initialCracker === undefined) {
      updating = true;
      const lastCracker = await CrackUtil.cracker().current();
      if (!(lastCracker instanceof Error)) {
        updateCracker(lastCracker);
        updating = false;
        return;
      }
      updating = false;
    }
    if (requireReupdate) {
      requireReupdate = false;
      updateCracker(initialCracker ?? -1);
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
        updateCracker((await extractCracker()) ?? -1);
      }
      const rootElement = document.getElementsByClassName("css-160ssko");
      if (
        rootElement.length > 0 &&
        !rootElement[0].hasAttribute("chasm-cmi-monitoring")
      ) {
        rootElement[0].setAttribute("chasm-cmi-monitoring", "true");
        GenericUtil.attachObserver(rootElement[0], () => {
          updateModalText(initialCracker ?? -1);
        });
      }
    }
  }

  function runSchedule() {
    setInterval(async () => {
      if (!isARPGPath()) return;
      if (updating) return;
      if (!fetched && new Date().getTime() - updateStoppedAt.getTime() > 500) {
        fetched = true;
        const lastCracker = await CrackUtil.cracker().current();
        if (!(lastCracker instanceof Error)) {
          updateCracker(lastCracker);
          updating = false;
        }
      }
    }, 50);
    // Text delta movement
    setInterval(() => {
      const element = document.getElementById("chasm-cracker-text");
      if (element) {
        const objective = parseInt(
          element.getAttribute("chasm-tmi-target") ?? "0",
        );
        const current = parseInt(
          element.getAttribute("chasm-tmi-current") ?? "0",
        );
        const abs = Math.abs(current - objective);
        const delta = abs > 300 ? 16 : abs > 100 ? 8 : abs > 50 ? 2 : 1;
        if (current > objective) {
          const next = current - delta;
          element.setAttribute("chasm-tmi-current", next.toString());
          element.textContent = next.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        } else if (current < objective) {
          const next = current + delta;
          element.setAttribute("chasm-tmi-current", next.toString());
          element.textContent = next.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        }
      }
    }, 7);
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
            defaultValue: settings.config.enableLeftCracker,
            onChange: (_, value) => {
              settings.config.enableLeftCracker = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "tmi-chat-calc",
          "스토리 채팅 잔여 채팅 횟수 표시",
          "스토리 채팅에서 잔여 채팅 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.config.enableStoryChatLeft,
            onChange: (_, value) => {
              settings.config.enableStoryChatLeft = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "tmi-chat-model-calc",
          "스토리 채팅 모델 팝업 잔여 채팅 횟수 표시",
          "스토리 채팅 모델 팝업에서 잔여 채팅 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.config.enableModelPopupLeft,
            onChange: (_, value) => {
              settings.config.enableModelPopupLeft = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "tmi-cracker-delta",
          "델타 애니메이션",
          "크래커의 감소 뎉라 애니메이션을 적용할지의 여부입니다.",
          {
            defaultValue: settings.config.enableCrackerDelta,
            onChange: (_, value) => {
              settings.config.enableCrackerDelta = value;
              settings.save();
            },
          },
        );
        panel.addTitleText("ARPG 설정");
        panel.addSwitchBox(
          "tmi-arpg-left",
          "ARPG 잔여 횟수 표시",
          "ARPG의 잔여 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.config.enableArpgChatLeft,
            onChange: (_, value) => {
              settings.config.enableArpgChatLeft = value;
              settings.save();
            },
          },
        );
        panel.addSwitchBox(
          "tmi-arpg-reroll-left",
          "ARPG 리롤 잔여 횟수 표기",
          "ARPG의 리롤 잔여 횟수를 표시할지의 여부입니다.",
          {
            defaultValue: settings.config.enableArpgRerollLeft,
            onChange: (_, value) => {
              settings.config.enableArpgRerollLeft = value;
              settings.save();
            },
          },
        );
      }, "결정화 캐즘 과포화");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 과포화");
      panel.addText(
        "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized-modal.js)",
      );
    });
  }

  settings.load();
  addMenu();
  if (cachedModels instanceof Error) {
    logger.error("모델 데이터를 불러오는데에 실패하였습니다.");
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
          const clonedElement = GenericUtil.clone(item);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("span")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          item.parentElement?.append(clonedElement);
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
          const clonedElement = GenericUtil.clone(element);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("span")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          element.parentElement?.append(clonedElement);
        }
      }
    }
  }

  function __doModalMenuInit() {
    const refined = GenericUtil.refine(document);
    if (refined.c2ModalInit) return;
    refined.c2ModalInit = true;
    GenericUtil.attachObserver(document, () => {
      __updateModalMenu();
    });
  }
  __doModalMenuInit();
})();
