/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name        Chasm Crystallized AlarmClock (결정화 캐즘 자명종)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-ALRM-v1.0.2
// @description 일일 출석 알림 및 즉시 출석 버튼 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @require      https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.js
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/alarm-clock.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/alarm-clock.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.13/decentralized-modal.js#sha256-tt5YRTDFPCoQwcSaw4d4QnjTytPbyVNLzM3g8rkdi8Q=
// @grant       GM_addStyle
// ==/UserScript==
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
    element.childNodes[0].classList.add("chasm-alarm-clock-loading");
    return element;
  }

  function createCheckIcon() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/532154/check
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#20d71d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    element.childNodes[0].classList.add("chasm-alarm-clock-icon");
    return element;
  }

  function createCloseIcon() {
    const element = document.createElement("div");
    // https://www.svgrepo.com/svg/522388/close
    element.innerHTML =
      '<svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 21.32L21 3.32001" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3 3.32001L21 21.32" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
    element.childNodes[0].classList.add("chasm-alarm-clock-icon");
    return element;
  }

  // =====================================================
  //                      상수
  // =====================================================
  let lastChecked = -1;

  // =====================================================
  //                      설정
  // =====================================================
  const settings = {};

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-alrm-settings");
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
    localStorage.setItem("chasm-alrm-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }
  // =====================================================
  //                      유틸리티
  // =====================================================

  function log(message) {
    console.log(
      "%cChasm Crystallized AlarmClock: %cInfo: %c" + message,
      "color: yellow;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized AlarmClock: %cWarning: %c" + message,
      "color: yellow;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized AlarmClock: %cError: %c" + message,
      "color: yellow;",
      "color: red;",
      "color: inherit;"
    );
  }

  /**
   * 대상 요소에 페이드아웃을 적용합니다.
   * @param {HTMLElement} element 적용할 요소
   * @param {undefined | () => void} doBefore 페이드아웃 적용 직전 실행할 펑션
   */
  function performFadeout(element, doBefore) {
    element.setAttribute("ac-fade-out", "true");
    setTimeout(() => {
      if (doBefore) doBefore();
      element.remove();
    }, 500);
  }
  // =====================================================
  //                   크랙 종속 유틸리티
  // =====================================================

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

  // =====================================================
  //                  크랙 데이터 통신 펑션
  // =====================================================
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
    if (!isAttendableTime()) return;
    if (new Date().getDate() !== lastChecked) {
      const isAttendable = await canAttend();
      if (isAttendable instanceof Error) return;
      if (isAttendable) {
        findAndInjectElement();
        log("출석이 가능합니다. 모달을 추가합니다.");
      }
      lastChecked = new Date().getDate();
      log("출석이 확인되었습니다. 오늘은 더 이상 모달을 발생시키지 않습니다.");
    }
  }

  /**
   * 출석 가능한 시간인지 반환합니다.
   * 크랙은 6시부터 23시 59분까지 출석이 가능합니다.
   * @returns {boolean} 출석 가능 시간 여부
   */
  function isAttendableTime() {
    const time = new Date().getHours();
    if (time < 6) return false;
    return true;
  }

  /**
   * 출석 가능 여부를 서버에서 받아와 반환합니다.
   * @returns {Promise<boolean|Error>} 출석 가능 여부, 혹은 오류
   */
  async function canAttend() {
    const webResult = await authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-cash/attendance"
    );
    if (webResult instanceof Error) return webResult;
    if (
      webResult.data &&
      webResult.data.attendanceStatus &&
      webResult.data.attendanceStatus === "NOT_ATTENDED"
    ) {
      return true;
    }
    return false;
  }

  /**
   * 출석을 진행합니다.
   * @param {HTMLElement} container 출석 모달 요소 최상위 엘리먼트
   */
  function doAttend(container) {
    const childElements = container.childNodes;
    for (let i = 0; i < childElements.length - 1; i++) {
      performFadeout(childElements[i]);
    }
    setTimeout(() => {
      container.setAttribute("loader", "true");
    }, 400);
    performFadeout(childElements[childElements.length - 1], () => {
      const loader = createLoadingIcon();
      container.append(loader);
      performAttend().then((result) => {
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

  /**
   * 출석을 API를 통해 진행합니다.
   * @returns {Promise<boolean>} 출석 성공 여부
   */
  async function performAttend() {
    const result = await authFetch(
      "POST",
      "https://crack-api.wrtn.ai/crack-cash/attendance"
    );
    if (result instanceof Error) {
      return false;
    }
    return true;
  }

  // =====================================================
  //                    UI 인젝션
  // =====================================================

  function findCrackerButton() {
    const topContainerElement = document.getElementsByClassName(
      isDarkMode() ? "css-7238to" : "css-9gj46x"
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
        isDarkMode() ? "css-7238to" : "css-9gj46x"
      );
      if (button.length <= 0) return;
      injectElement(button[0].lastChild.lastChild);
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
   * @param {HTMLElement} parentElement 삽입할 부모 요소
   */
  function injectElement(parentElement) {
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

  loadSettings();
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
