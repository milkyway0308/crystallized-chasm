// ==UserScript==
// @name         Chasm Crystallized Watchdog (결정화 캐즘 감시견)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-WDOG-v1.0.0
// @description  알람 감지 및 실시간 표시. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/tmi.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/tmi.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-toastify-injection@v1.0.0/crack/libraries/toastify-injection.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.1.2/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==
// @ts-check
(function () {
  const LAST_NOTIFICATION_ID = "chasm-wdog-last-noti";
  const logger = new LogUtil("Chasm Crystallized WatchDog", false);
  // https://pixabay.com/sound-effects/film-special-effects-bell-ring-390294/
  const audio = new Audio("https://assets.igx.kr/audio/bell-ring.mp3");
  const settings = new LocaleStorageConfig("chasm-wdog-config", {
    enableBellRing: true,
    enableOSAlert: false,
    maxAlarmTime: 8,
  });

  async function track() {
    const items = await CrackUtil.notification().current({ maxCount: 1 });
    if (items instanceof Error) return;
    if (
      !items[0].isRead &&
      items[0].id !== localStorage.getItem(LAST_NOTIFICATION_ID)
    ) {
      localStorage.setItem(LAST_NOTIFICATION_ID, items[0].id);
      if (settings.config.enableBellRing) {
        audio.play();
      }
      if (settings.config.enableOSAlert) {
        logger.debug("Push with item", items[0]);
        const notification = new Notification(items[0].pushTitle, {
          body: items[0].pushBody,
          icon: items[0].thumbnail,
          tag: "Chasm Crystallized WatchDog",
        });
        notification.onclick = () => {
          window.open(items[0].webLink);
          notification.close();
        };
        if (settings.config.maxAlarmTime > 0) {
          setTimeout(() => {
            notification.close();
          }, settings.config.maxAlarmTime * 1000);
        }
      }
    }
  }

  setInterval(async () => {
    track();
  }, 3000);

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 감시견", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addSwitchBox(
          "wdog-enable-bell-audio",
          "벨 소리 활성화",
          "벨 소리를 발생시킬지의 여부입니다.",
          {
            defaultValue: settings.config.enableBellRing,
            onChange: (_, value) => {
              settings.config.enableBellRing = value;
              settings.save();
            },
          },
        );

        panel.addSwitchBox(
          "wdog-enable-os-notification",
          "OS 푸시 활성화",
          "페이지 활성화시, 웹 알림 API를 통해 OS 메시지를 보낼지의 여부입니다.\n이 옵션을 활성화하고 알람 권한을 허용해야 OS 알림이 정상 발생합니다.",
          {
            defaultValue: settings.config.enableOSAlert,
            onChange: (_, value) => {
              if (!Notification.requestPermission) {
                alert(
                  "이 OS는 알림 API를 지원하지 않습니다. OS 알림이 활성화되도 작동하지 않습니다.",
                );
                return;
              }
              Notification.requestPermission().then((data) => {
                if (data === "denied" || data === "default") {
                  alert(
                    "OS 알림 권한 요청이 거부되었습니다.\nOS 알림을 사용하려면 crack.wrtn.ai 도메인을 직접 허용 목록에 추가해야 합니다.",
                  );
                }
              });
              settings.config.enableOSAlert = value;
              settings.save();
            },
          },
        );
        panel.addShortNumberBox(
          "wdog-os-notification-duration",
          "OS 푸시 유지 기간",
          "얼마나 길게 알림을 유지할지를 정합니다.\n0 입력시, 크롬 기준으로 알람이 자동으로 사라지지 않습니다.",
          {
            defaultValue: settings.config.maxAlarmTime,
            max: 10,
            onChange: (_, value) => {
              settings.config.maxAlarmTime = value;
              settings.save();
            },
          },
        );
      }, "결정화 캐즘 감시견");
    });
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 감시견");
      panel.addText(
        "- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized-modal.js)",
      );
      panel.addText(
        "- 벨 음향 이펙트 (https://pixabay.com/sound-effects/film-special-effects-bell-ring-390294/)",
      );
    });
  }
  settings.load();
  addMenu();
  track();

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
