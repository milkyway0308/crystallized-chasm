import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { BrowserInitUtil } from "../../utils/init-util";
import { LocaleStorageConfig } from "../../utils/local-storage-config";
import { LogUtil } from "../../utils/log-utils";
import { ScriptMetaUtil } from "../../utils/script-meta-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "watchdog.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Watchdog (결정화 캐즘 감시견)";
  meta.version = "CRCK-WDOG-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "알람 감지 및 실시간 표시. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

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
  const items = await CrackSdk.notification().current({ max: 1, allowFastFail: true });
  if (!items.ok || items.value.length === 0) return;
  const firstItem = items.value[0];
  if (firstItem.id !== localStorage.getItem(LAST_NOTIFICATION_ID)) {
    localStorage.setItem(LAST_NOTIFICATION_ID, firstItem.id);
    if (settings.config.enableBellRing) {
      audio.play();
    }
    if (settings.config.enableOSAlert) {
      logger.debug("Push with item", firstItem);
      const notification = new Notification(firstItem.pushTitle, {
        body: firstItem.pushBody,
        icon: firstItem.thumbnail,
        tag: "Chasm Crystallized WatchDog",
      });
      notification.onclick = () => {
        window.open(firstItem.webLink);
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

function addMenu() {
  const manager = CrackSdk.addonModal().acquire();
  manager.createMenu("결정화 캐즘 감시견", (modal) => {
    modal.replaceContentPanel((panel) => {
      panel.addSwitchBox("wdog-enable-bell-audio", "벨 소리 활성화", "벨 소리를 발생시킬지의 여부입니다.", {
        defaultValue: settings.config.enableBellRing,
        onChange: (value) => {
          settings.config.enableBellRing = value;
          settings.save();
        },
      });

      panel.addSwitchBox("wdog-enable-os-notification", "OS 푸시 활성화", "페이지 활성화시, 웹 알림 API를 통해 OS 메시지를 보낼지의 여부입니다.\n이 옵션을 활성화하고 알람 권한을 허용해야 OS 알림이 정상 발생합니다.", {
        defaultValue: settings.config.enableOSAlert,
        onChange: (value) => {
          if (!Notification.requestPermission) {
            alert("이 OS는 알림 API를 지원하지 않습니다. OS 알림이 활성화되도 작동하지 않습니다.");
            return;
          }
          Notification.requestPermission().then((data) => {
            if (data === "denied" || data === "default") {
              alert("OS 알림 권한 요청이 거부되었습니다.\nOS 알림을 사용하려면 crack.wrtn.ai 도메인을 직접 허용 목록에 추가해야 합니다.");
            }
          });
          settings.config.enableOSAlert = value;
          settings.save();
        },
      });
      panel.addShortNumberBox("wdog-os-notification-duration", "OS 푸시 유지 기간", "얼마나 길게 알림을 유지할지를 정합니다.\n0 입력시, 크롬 기준으로 알람이 자동으로 사라지지 않습니다.", {
        defaultValue: settings.config.maxAlarmTime,
        min: 0,
        max: 10,
        onChange: (value) => {
          settings.config.maxAlarmTime = value;
          settings.save();
        },
      });
    }, "결정화 캐즘 감시견");
  });
  manager.addLicenseDisplay((panel) => {
    panel.addTitleText("결정화 캐즘 감시견");
    panel.addText("- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized-modal.js)");
    panel.addText("- 벨 음향 이펙트 (https://pixabay.com/sound-effects/film-special-effects-bell-ring-390294/)");
  });
}
settings.load();
addMenu();
track();

// =================================================
//                    초기화
// =================================================

BrowserInitUtil.init(() => {
  settings.load();
  addMenu();
  BrowserInitUtil.onPagePrepare(() => {
    setInterval(async () => {
      track();
    }, 3000);
  });
});
