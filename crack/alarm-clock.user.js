// ==UserScript==
// @name        Chasm Crystallized AlarmClock (결정화 캐즘 자명종)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-ALRM-v1.1.0
// @description 일일 출석 알림 및 즉시 출석 버튼 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @require      https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.js
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/alarm-clock.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/alarm-clock.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-toastify-injection@v1.0.0/crack/libraries/toastify-injection.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.0.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant       GM_addStyle
// ==/UserScript==

// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />

// @ts-ignore
GM_addStyle(`
    body[data-theme="light"] {
        --chasm-alarm-clock-background: #3E3E3E;
        --chasm-alarm-clock-text: white;
    }

    body[data-theme="dark"] {
        --chasm-alarm-clock-background: #EFEFEF;
        --chasm-alarm-clock-text: black;
    }
    
    .chasm-alarm-clock-modal {
        position: fixed;
        top: 55px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--chasm-alarm-clock-background);
        color: var(--chasm-alarm-clock-text);
        padding: 15px 20px;
        border-radius: 8px;
        transform: translateX(-46%);
        margin-top: 5px;
        width: fit-contents;
        white-space: nowrap;
        font-size: 15px;
        cursor: default;
        max-width: 200px;
        max-height: 60px;
        width: 200px;
        height: 60px;
        opacity: 1;
        transition: max-height 0.15s ease-out, max-width 0.15s ease-out, transform 0.15s ease-out, opacity 0.5s linear;
    }
    
    .chasm-alarm-clock-modal[mobile] {
        transform: translateX(-0%) translateY(0%);
    }

    .chasm-alarm-clock-modal[loader] {
        max-width: 60px;
        max-height: 57px;
        transform: translateX(-80%);
        transition: max-height 0.15s ease-out, max-width 0.15s ease-out, transform 0.22s linear;
    }

    
    .chasm-alarm-clock-modal[mobile][loader] {
        transform: translateX(-15%) translateY(0%);
    }
    
    .chasm-alarm-clock-active {
        cursor: pointer;
        pointer-events: all;
        color: #FFA600;
    }

    .chasm-alarm-clock-loading {
        animation: chasm-alarm-rotate 1s infinite linear;
    }

    .chasm-alarm-clock-modal:after {
        content: '';
        position: absolute;
        top: 0;
        left: 80%;
        width: 0;
        height: 0;
        border: 12px solid transparent;
        border-bottom-color: var(--chasm-alarm-clock-background);
        border-top: 0;
        border-right: 0;
        margin-left: -9.5px;
        margin-top: -10px;
    }

    .chasm-alarm-clock-modal[mobile]:after {
        left: 90%;
    }

    [ac-fade-in] {
        animation: ac-fade-in 1s; 
    }
    
    [ac-fade-out] {
        animation: ac-fade-out 0.55s; 
    }

    @keyframes chasm-alarm-rotate { 
        from { 
            transform: rotate(0deg); 
        } 
        to {  
            transform: rotate(360deg); 
        }
    }

    @keyframes ac-fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes ac-fade-out {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`);
(function () {
  // =================================================
  //                      SVG
  // =================================================

  function createLoadingIcon() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/448500/loading
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" class="hds-flight-icon--animation-loading"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="var(--icon_secondary)" fill-rule="evenodd" clip-rule="evenodd"> <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2"></path> <path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"></path> </g> </g></svg>';
    element.children[0].classList.add("chasm-alarm-clock-loading");
    return element;
  }

  function createCheckIcon() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/532154/check
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#20d71d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    element.children[0].classList.add("chasm-alarm-clock-icon");
    return element;
  }

  function createCloseIcon() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/522388/close
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 21.32L21 3.32001" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3 3.32001L21 21.32" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    element.children[0].classList.add("chasm-alarm-clock-icon");
    return element;
  }

  // =====================================================
  //                      상수
  // =====================================================
  const logger = new LogUtil("AlarmClock", false);
  let lastChecked = -1;

  /**
   * 대상 요소에 페이드아웃을 적용합니다.
   * @param {Element} element 적용할 요소
   * @param {() => void} [doBefore] 페이드아웃 적용 직전 실행할 펑션
   */
  function performFadeout(element, doBefore) {
    element.setAttribute("ac-fade-out", "true");
    setTimeout(() => {
      doBefore?.();
      element.remove();
    }, 500);
  }

  // =====================================================
  //                       로직
  // =====================================================
  /**
   * 출석 확인 태스크를 시작합니다.
   * 출석 확인 태스크는 0틱 이후, 5000ms(5초)마다 실행됩니다.
   */
  function startLoop() {
    checkAttend().then(() => {
      setInterval(checkAttend, 5000);
    });
  }

  /**
   * 출석 여부를 확인하고, 모달을 발생시킵니다.
   * @returns {Promise<void>}
   */
  async function checkAttend() {
    if (!CrackUtil.attend().isAttendableTime()) return;
    if (new Date().getDate() !== lastChecked) {
      const isAttendable = await CrackUtil.attend().isAttendable();
      if (isAttendable instanceof Error) return;
      if (isAttendable) {
        findAndInjectElement();
        logger.log("출석이 가능합니다. 모달을 추가합니다.");
      }
      lastChecked = new Date().getDate();
      logger.log(
        "출석이 확인되었습니다. 오늘은 더 이상 모달을 발생시키지 않습니다."
      );
    }
  }

  /**
   * 출석을 진행합니다.
   * @param {HTMLElement} container 출석 모달 요소 최상위 엘리먼트
   */
  function doAttend(container) {
    const childElements = container.children;
    for (let i = 0; i < childElements.length - 1; i++) {
      performFadeout(childElements[i]);
    }
    setTimeout(() => {
      container.setAttribute("loader", "true");
    }, 400);
    performFadeout(childElements[childElements.length - 1], () => {
      const loader = createLoadingIcon();
      container.append(loader);
      CrackUtil.attend()
        .performAttend()
        .then((result) => {
          if (result) {
            performFadeout(loader, () => {
              const check = createCheckIcon();
              container.append(check);
              setTimeout(() => {
                performFadeout(container);
              }, 2000);
            });
          } else {
            performFadeout(loader, () => {
              const check = createCloseIcon();
              container.append(check);
              setTimeout(() => {
                performFadeout(container);
              }, 1500);
            });
          }
        });
    });
  }

  // =====================================================
  //                    UI 인젝션
  // =====================================================

  function findCrackerButton() {
    const topContainerElement = document.getElementsByClassName(
      CrackUtil.theme().isDarkTheme() ? "css-7238to" : "css-9gj46x"
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
  /**
   * 조건이 맞다면 출석 모달 요소를 강제 삽입합니다.
   */
  function findAndInjectElement() {
    if (document.getElementsByClassName("chasm-alarm-clock-modal").length > 0) {
      return;
    }
    if (!window.matchMedia("(min-width: 768px)").matches) {
      const button = document.getElementsByClassName(
        CrackUtil.theme().isDarkTheme() ? "css-7238to" : "css-9gj46x"
      );
      if (button.length <= 0) return;
      injectElement(button[0]?.lastElementChild?.lastElementChild);
      document
        .getElementsByClassName("chasm-alarm-clock-modal")[0]
        .setAttribute("mobile", "true");
    } else {
      const button = findCrackerButton();
      if (!button) return;
      injectElement(button);
    }
  }

  /**
   * 출석 요소를 생성하고, 삽입합니다.
   * @param {?Element} [parentElement] 삽입할 부모 요소
   */
  function injectElement(parentElement) {
    if (!parentElement) return;
    const containerElement = document.createElement("div");
    containerElement.className = "chasm-alarm-clock-modal";
    const textElement = document.createElement("p");
    textElement.textContent = "출석 체크가 가능해요!";
    const clickableElement = document.createElement("p");
    clickableElement.textContent = ">> 지금 바로 출석하기 <<";
    clickableElement.className = "chasm-alarm-clock-active";
    clickableElement.onclick = () => {
      doAttend(containerElement);
    };
    containerElement.append(textElement);
    containerElement.append(clickableElement);
    containerElement.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    containerElement.setAttribute("ac-fade-in", "true");
    parentElement.append(containerElement);
  }

  // =================================================
  //                      초기화
  // =================================================

  function prepare() {
    window.addEventListener("resize", () => {
      const modal = document.getElementsByClassName("chasm-alarm-clock-modal");
      if (modal.length <= 0) return;
      if (window.matchMedia("(min-width: 768px)").matches) {
        if (modal[0].hasAttribute("mobile")) {
          modal[0].remove();
          findAndInjectElement();
        }
      } else {
        if (!modal[0].hasAttribute("mobile")) {
          modal[0].remove();
          findAndInjectElement();
        }
      }
    });
    startLoop();
  }

  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);

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
