/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name        BabeChat Chasm Crystallized Whiteout (결정화 캐즘 백시현상)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     BABE-WHOU-v1.0.2
// @description 화이트 모드 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://babechat.ai/*
// @match       https://www.babechat.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/babechat/whiteout.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/babechat/whiteout.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.10/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(`
    body {
        --chasm-whiteout-background: #1c1c1c;
        --chasm-whiteout-color: #f8fafc;
        --chasm-whiteout-text-color: rgb(255 255 255);
        --chasm-whiteout-background-transparent: rgba(28,28,28,.6);
        --chasm-whiteout-hightlight-background: #121212;
        --chasm-whiteout-rose-color: rgb(72 49 54);
        --chasm-whiteout-text-hint: #acacac;
        --chasm-whiteout-text-detail: #BEBEBE;
        --chasm-whiteout-button-background: #252525;
        --chasm-whiteout-sub-background: #262626;
        --chasm-whiteout-darken-background: #E7E7E7;
        --chasm-whiteout-darken-button-background: #575757;
        --chasm-whiteout-rose-text: #F1BEBE;
        --chasm-whiteout-modal-background: #262627;
        --chasm-whiteout-avatar-background: #303030;
        --chasm-whiteout-notification-color: #FFFFFF;
        --chasm-whiteout-dialog-background: #363636;
        background: var(--chasm-whiteout-background) !important;
        color: var(--chasm-whiteout-color) !important;
        --chasm-whiteout-profile-border: #575757;
        --chasm-whiteout-text-highlight: #FFFFFF;
        --chasm-whiteout-button-hover: #2c2c2c;
        --chasm-whiteout-text-subject: #cacaca;
        --chasm-whiteout-sheet-background: rgb(37, 37, 37);
    }

    body[theme="light"] {
        --chasm-whiteout-background: #FFFFFF;
        --chasm-whiteout-sub-background: #f8f8f8ff;
        --chasm-whiteout-color: #1c1c1c;
        --chasm-whiteout-text-color: rgb(0 0 0);
        --chasm-whiteout-sheet-background: rgba(197, 197, 197, 1);
        --chasm-whiteout-background-transparent: rgba(255, 255, 255, 0.98);
        --chasm-whiteout-text-hint: #5c5c5c;
        --chasm-whiteout-rose-color: #ffccdb;
        --chasm-whiteout-rose-text: #ee7070;
        --chasm-whiteout-text-detail: #3b3b3b;
        --chasm-whiteout-hightlight-background: #dbdbdb;
        --chasm-whiteout-button-background: #d1d1d1;
        --chasm-whiteout-darken-background: #fcfcfc;
        --chasm-whiteout-modal-background: #f8f8f8;
        --chasm-whiteout-darken-button-background: #dbdbdb;
        --chasm-whiteout-avatar-background: #e7e7e7;
        --chasm-whiteout-dialog-background: #a5a5a5;
        --chasm-whiteout-notification-color: #000000;
        --chasm-whiteout-profile-border: #8f8f8f;
        --chasm-whiteout-text-highlight: #e46dc0;
        --chasm-whiteout-button-hover: #c9c9c9;
        --chasm-whiteout-text-subject: #3a3a3a;
    }

    .text-\\[\\#FFF\\] {
        color: var(--chasm-whiteout-text-color) !important;
    }
    .text-\\[\\#ffffff\\] {
        color: var(--chasm-whiteout-text-color) !important;
    }
    .text-white {
        color: var(--chasm-whiteout-text-color) !important;
    }

    .data-\\[state\\=active\\]\\:text-white[data-state=active] {
        color: var(--chasm-whiteout-text-highlight) !important;
    }

    .hover\\:bg\\-\\[\\#2c2c2c\\]:hover {
        background-color: var(--chasm-whiteout-button-hover);
    }
    .bg-\\[\\#1c1c1c\\] {
        background-color: var(--chasm-whiteout-background) !important;
    }

    .bg-\\[\\#1c1c1c\\]\\/60 {
        background-color: var(--chasm-whiteout-background-transparent) !important;
    }

    .bg-\\[\\#483136\\] {
        background-color: var(--chasm-whiteout-rose-color) !important;
    }

    .text-\\[\\#F8FAFC\\] {
        color: var(--chasm-whiteout-color) !important;
    }
    .text-\\[\\#acacac\\] {
        color: var(--chasm-whiteout-text-hint) !important;
    }

    .text-\\[\\#BEBEBE\\] {
        color: var(--chasm-whiteout-text-detail) !important;
    }

    .text-\\[\\#ACACAC\\] {
        color: var(--chasm-whiteout-text-detail) !important;
    }


    .text-\\[\\#cacaca\\] {
        color: var(--chasm-whiteout-text-subject) !important;
    }

    .text-\\[\\#F1BEBE\\] {
        color: var(--chasm-whiteout-rose-text) !important;
    }

    .bg-\\[\\#252525\\] {
        background-color: var(--chasm-whiteout-modal-background) !important;
    }

    .bg-\\[\\#2a2a2a\\] {
        background-color: var(--chasm-whiteout-modal-background) !important;
    }

    .bg-sheet {
        background-color: var(--chasm-whiteout-sheet-background) !important;
    }

    .bg-\\[\\#262626\\] {
        background-color: var(--chasm-whiteout-sub-background) !important;
        border: 1px solid var(--chasm-whiteout-sheet-background);
    }

    .bg-\\[\\#121212\\] {
        background-color: var(--chasm-whiteout-hightlight-background) !important;
    }
    .bg-\\[\\#1C1C1C\\] {
        background-color: var(--chasm-whiteout-background) !important;
    }
    .bg-\\[\\#363636\\] {
        background-color: var(--chasm-whiteout-button-background) !important;
    }
    .bg-\\[\\#E7E7E7\\] {
        background-color: var(--chasm-whiteout-darken-background) !important;
    }

    .bg-\\[\\#595959\\] {
        background-color: var(--chasm-whiteout-darken-button-background) !important;
    }
    .bg-\\[\\#212121\\] {
        background-color: var(--chasm-whiteout-modal-background) !important;
    }

    .bg-\\[\\#262727\\] {
        background-color: var(--chasm-whiteout-modal-background) !important;
    }

    .bg-\\[\\#363636\\]\\/80 {
        background-color: var(--chasm-whiteout-dialog-background) !important;
    }

    .chasm-whiteout-icon {
        background-color: var(--chasm-whiteout-color) !important;
    }

    body[theme="light"] .chasm-whiteout-icon-filter {
        filter: brightness(40%) !important;
    }
`);

!(function () {
  const EMPTY_IMAGE =
    "data:image/svg+xml,%3Csvg%20version%3D%221.2%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cstyle%3E%3C%2Fstyle%3E%3C%2Fsvg%3E";

  const ALTERED_AVATAR = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" style = "border: 1px solid var(--chasm-whiteout-profile-border);">
    <circle cx="40" cy="40" r="40" fill="var(--chasm-whiteout-avatar-background)"/>
    <mask id="mask0_348_741" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
    <circle cx="40" cy="40" r="40" fill="var(--chasm-whiteout-avatar-background)"/>
    </mask>
    <g mask="url(#mask0_348_741)">
    <path d="M64.0476 36.6344C63.16 35.7415 62.1121 34.9883 60.9118 34.379C61.4306 32.9477 61.6923 31.6139 61.6923 30.3942C61.6923 25.9596 59.9272 21.6355 56.85 18.53C55.3533 17.0195 53.604 15.8441 51.6506 15.0372C49.5841 14.1829 47.3379 13.7644 44.9805 13.7946C42.9114 13.8207 40.9142 14.3508 39.0435 15.3708C37.5396 16.1907 36.1076 17.3353 34.7869 18.7729C33.8706 19.7705 33.0967 20.8093 32.4555 21.7788C32.3984 21.6959 32.3397 21.6131 32.28 21.5297C31.2317 20.0718 30.0242 18.9412 28.6906 18.1693C26.9245 17.1466 24.988 16.7682 22.9357 17.045C19.2035 17.548 16.3727 19.6803 14.7495 23.2106C13.7394 25.4071 13.1986 28.1477 13.1425 31.3548L12.4145 72.7592C12.3916 74.0737 13.191 75.2507 14.4046 75.688C14.7306 75.8052 15.0663 75.8621 15.3984 75.8621C16.3013 75.8621 17.1757 75.4419 17.7527 74.6825C22.1231 68.9308 30.0099 65.3687 31.8433 64.5957L51.2604 64.2757C55.415 64.2689 59.5604 62.3815 62.6376 59.0946C65.829 55.6858 67.5865 51.1469 67.5865 46.3146C67.5865 42.2532 66.3958 38.996 64.0471 36.6338L64.0476 36.6344ZM33.7156 35.8374C32.0561 35.8374 30.7103 34.4629 30.7103 32.7668C30.7103 31.0708 32.0555 29.6963 33.7156 29.6963C35.3756 29.6963 36.7208 31.0708 36.7208 32.7668C36.7208 34.4629 35.3756 35.8374 33.7156 35.8374ZM46.4783 35.8374C44.8188 35.8374 43.4731 34.4629 43.4731 32.7668C43.4731 31.0708 44.8183 29.6963 46.4783 29.6963C48.1383 29.6963 49.4836 31.0708 49.4836 32.7668C49.4836 34.4629 48.1383 35.8374 46.4783 35.8374Z" fill="#F6375A"/>
    </g>
    </svg>
  `;

  const ALTERED_AVATAR_SMALL = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 80 80" fill="none" style = "border: 1px solid var(--chasm-whiteout-profile-border); border-radius: 100px;">
    <circle cx="40" cy="40" r="40" fill="var(--chasm-whiteout-avatar-background)"/>
    <mask id="mask0_348_741" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
    <circle cx="40" cy="40" r="40" fill="var(--chasm-whiteout-avatar-background)"/>
    </mask>
    <g mask="url(#mask0_348_741)">
    <path d="M64.0476 36.6344C63.16 35.7415 62.1121 34.9883 60.9118 34.379C61.4306 32.9477 61.6923 31.6139 61.6923 30.3942C61.6923 25.9596 59.9272 21.6355 56.85 18.53C55.3533 17.0195 53.604 15.8441 51.6506 15.0372C49.5841 14.1829 47.3379 13.7644 44.9805 13.7946C42.9114 13.8207 40.9142 14.3508 39.0435 15.3708C37.5396 16.1907 36.1076 17.3353 34.7869 18.7729C33.8706 19.7705 33.0967 20.8093 32.4555 21.7788C32.3984 21.6959 32.3397 21.6131 32.28 21.5297C31.2317 20.0718 30.0242 18.9412 28.6906 18.1693C26.9245 17.1466 24.988 16.7682 22.9357 17.045C19.2035 17.548 16.3727 19.6803 14.7495 23.2106C13.7394 25.4071 13.1986 28.1477 13.1425 31.3548L12.4145 72.7592C12.3916 74.0737 13.191 75.2507 14.4046 75.688C14.7306 75.8052 15.0663 75.8621 15.3984 75.8621C16.3013 75.8621 17.1757 75.4419 17.7527 74.6825C22.1231 68.9308 30.0099 65.3687 31.8433 64.5957L51.2604 64.2757C55.415 64.2689 59.5604 62.3815 62.6376 59.0946C65.829 55.6858 67.5865 51.1469 67.5865 46.3146C67.5865 42.2532 66.3958 38.996 64.0471 36.6338L64.0476 36.6344ZM33.7156 35.8374C32.0561 35.8374 30.7103 34.4629 30.7103 32.7668C30.7103 31.0708 32.0555 29.6963 33.7156 29.6963C35.3756 29.6963 36.7208 31.0708 36.7208 32.7668C36.7208 34.4629 35.3756 35.8374 33.7156 35.8374ZM46.4783 35.8374C44.8188 35.8374 43.4731 34.4629 43.4731 32.7668C43.4731 31.0708 44.8183 29.6963 46.4783 29.6963C48.1383 29.6963 49.4836 31.0708 49.4836 32.7668C49.4836 34.4629 48.1383 35.8374 46.4783 35.8374Z" fill="#F6375A"/>
    </g>
    </svg>
  `;

  const ALTERED_NOTIFICATION_ACTIVE = `<svg class="chasm-whiteout-icon-replaced" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path stroke="var(--chasm-whiteout-notification-color)" d="M15.3752 18.5556V19.6667C15.3752 21.5076 13.8642 23 12.0002 23C10.1362 23 8.6251 21.5076 8.6251 19.6667V18.5556M15.3752 18.5556H8.6251M15.3752 18.5556H19.4146C19.8449 18.5556 20.0612 18.5556 20.2354 18.4975C20.5683 18.3866 20.8287 18.1285 20.941 17.7998C21 17.627 21 17.4128 21 16.9844C21 16.7969 20.9998 16.7032 20.9849 16.6138C20.9569 16.4449 20.8905 16.2848 20.7894 16.1458C20.736 16.0723 20.6682 16.0053 20.5343 15.8731L20.0961 15.4403C19.9547 15.3007 19.8753 15.1113 19.8753 14.9138V10.7778C19.8753 6.48222 16.3495 2.99999 12.0002 3C7.65085 3.00001 4.12502 6.48224 4.12502 10.7778V14.9138C4.12502 15.1113 4.04542 15.3007 3.90403 15.4403L3.46583 15.8731C3.33161 16.0057 3.26443 16.0723 3.21094 16.1458C3.10986 16.2849 3.04291 16.4449 3.01485 16.6138C3 16.7032 3 16.7969 3 16.9844C3 17.4128 3 17.6269 3.05901 17.7997C3.17128 18.1285 3.4329 18.3866 3.76576 18.4975C3.94002 18.5556 4.15541 18.5556 4.58578 18.5556H8.6251" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="18" cy="4" r="4" fill="#F6375A"/>
    </svg>
    `;

  const ALTERED_NOTIFICATION = `<svg class="chasm-whiteout-icon-replaced" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path stroke="var(--chasm-whiteout-notification-color)" d="M15.3752 17.5556V18.6667C15.3752 20.5076 13.8642 22 12.0002 22C10.1362 22 8.6251 20.5076 8.6251 18.6667V17.5556M15.3752 17.5556H8.6251M15.3752 17.5556H19.4146C19.8449 17.5556 20.0612 17.5556 20.2354 17.4975C20.5683 17.3866 20.8287 17.1285 20.941 16.7998C21 16.627 21 16.4128 21 15.9844C21 15.7969 20.9998 15.7032 20.9849 15.6138C20.9569 15.4449 20.8905 15.2848 20.7894 15.1458C20.736 15.0723 20.6682 15.0053 20.5343 14.8731L20.0961 14.4403C19.9547 14.3007 19.8753 14.1113 19.8753 13.9138V9.77778C19.8753 5.48222 16.3495 1.99999 12.0002 2C7.65085 2.00001 4.12502 5.48224 4.12502 9.77778V13.9138C4.12502 14.1113 4.04542 14.3007 3.90403 14.4403L3.46583 14.8731C3.33161 15.0057 3.26443 15.0723 3.21094 15.1458C3.10986 15.2849 3.04291 15.4449 3.01485 15.6138C3 15.7032 3 15.7969 3 15.9844C3 16.4128 3 16.6269 3.05901 16.7997C3.17128 17.1285 3.4329 17.3866 3.76576 17.4975C3.94002 17.5556 4.15541 17.5556 4.58578 17.5556H8.6251" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

  function log(message) {
    console.log(
      "%cChasm Crystallized Whiteout: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Whiteout: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Whiteout: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }

  function attachSingleObserver(observeTarget, lambda) {
    const Observer = window.MutationObserver || window.WebKitMutationObserver;
    if (observeTarget && Observer) {
      let instance = new Observer(lambda);
      instance.observe(observeTarget, {
        childList: false,
        subtree: false,
        attributes: false,
      });
    }
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

  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    useLightMode: false,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-babe-whou-settings");
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
    localStorage.setItem("chasm-babe-whou-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }

  function saveSettingsSilent() {
    localStorage.setItem("chasm-babe-whou-settings", JSON.stringify(settings));
  }

  // =====================================================
  //                      로직
  // =====================================================
  const whitelist = [
    "Babe Chat",
    "logo",
    "lock",
    "Thumb",
    "prochat",
    "new_ranking",
    "official",
    "ticket",
    "checkIn",
    "invite",
    "apple",
    "berry",
    "badge",
    "",
  ];

  const codeAlternation = {
    "/assets/svgs/notification_active.svg": function (alt) {
      return ALTERED_NOTIFICATION_ACTIVE;
    },
    "/assets/svgs/notification.svg": function (alt) {
      return ALTERED_NOTIFICATION;
    },
    "/assets/svgs/avatar.svg": function (alt) {
      return alt === "avatar" ? ALTERED_AVATAR_SMALL : ALTERED_AVATAR;
    },
  };
  const colorAlternation = { prochat: "var(--chasm-whiteout-rose-text)" };

  function replaceAllSystemImage() {
    const expectedPrefix = `${window.location.origin}/assets`;
    for (let image of document.images) {
      if (!image.src.startsWith(expectedPrefix)) {
        continue;
      }
      if (!image.src.endsWith(".svg")) continue;
      const src = image.getAttribute("src");
      if (codeAlternation[src]) {
        image.outerHTML = codeAlternation[src](image.alt);
        continue;
      }
      if (whitelist.includes(image.alt)) continue;
      if (
        image.classList.contains("chasm-whiteout-icon") ||
        image.classList.contains("chasm-whiteout-icon-filter") ||
        image.classList.contains("chasm-whiteout-icon-replaced")
      )
        continue;
      if (image.alt === "notification") {
        image.classList.add("chasm-whiteout-icon-filter");
      } else {
        image.classList.add("chasm-whiteout-icon");
        image.style.cssText = `mask: url('${image.src}') center/contain; background-color: var(--chasm-whiteout-color) !important;`;
        image.src = EMPTY_IMAGE;
      }
    }

    for (let image of document.getElementsByTagName("svg")) {
      if (whitelist.includes(image.alt)) continue;
      if (image.classList.contains("chasm-whiteout-svg")) continue;
      image.setAttribute("fill", "var(--chasm-whiteout-color)");
      image.classList.add("chasm-whiteout-svg");
    }
  }

  function applyBodyChange() {
    console.log(document.body.style.background);
    if (document.body.style.background != "#1c1c1c") return;
    console.log("Updated");
    document.body.style.background = "var(--chasm-whiteout-background);";
    document.body.style.color = "var(--chasm-whiteout-color);";
  }

  function prepare() {
    replaceAllSystemImage();
    attachObserver(document.body, () => {
      if (settings.useLightMode && !document.body.hasAttribute("theme")) {
        document.body.setAttribute("theme", "light");
      }
      replaceAllSystemImage();
    });
  }
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);

  loadSettings();
  addMenu();

  if (settings.useLightMode) {
    document.body.setAttribute("theme", "light");
    modified = true;
  } else {
    clearInterval(interval);
    document.body.removeAttribute("theme");
  }
  // =================================================
  //                  메뉴 강제 추가
  // =================================================

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");

    manager.createMenu("결정화 캐즘 백시현상", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addSwitchBox(
          "cntr-whou-use-light-mode",
          "화이트 모드 사용",
          "화이트 모드를 사용할지의 여부입니다.",
          {
            defaultValue: settings.useLightMode,
            action: (_, value) => {
              settings.useLightMode = value;
              saveSettings();
              if (value) {
                document.body.setAttribute("theme", "light");
              } else {
                document.body.removeAttribute("theme");
              }
            },
          }
        );
      }, "결정화 캐즘 백시현상");
    });
  }

  /**
   *
   * @param {string} buttonName
   * @returns {HTMLElement | undefined}
   */
  function extractPanelButton(buttonName) {
    const expectedPanel = document.querySelectorAll(
      `[data-radix-popper-content-wrapper]`
    );
    if (expectedPanel.length > 0) {
      for (const panel of expectedPanel) {
        for (const element of panel.getElementsByTagName("button")) {
          if (
            element.childNodes[element.childNodes.length - 1].textContent ===
            buttonName
          ) {
            console.log("PANEL FOUND!");
            return element;
          }
        }
      }
    }
    return undefined;
  }

  function __updateModalMenu() {
    let expectedPanelButton = undefined;
    if (
      !document.getElementById("chasm-decentral-menu") &&
      (expectedPanelButton = extractPanelButton("설정"))
    ) {
      const newItem = expectedPanelButton.cloneNode(true);
      newItem.id = "chasm-decentral-menu";
      newItem.onclick = undefined;
      newItem.addEventListener("click", (event) => {
        ModalManager.getOrCreateManager("c2")
          .withLicenseCredential()
          .display(true);
      });
      console.log(newItem.childNodes[0]);
      console.log(newItem.childNodes[0].childNodes);
      const expectedTextNode =
        newItem.childNodes[0].childNodes[
          newItem.childNodes[0].childNodes.length - 1
        ];
      expectedTextNode.textContent = "결정화 캐즘";
      expectedPanelButton.parentElement.insertBefore(
        newItem,
        expectedPanelButton
      );
      console.log("Injected!");
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
