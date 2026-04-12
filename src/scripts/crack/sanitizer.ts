import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { BrowserInitUtil } from "../../utils/init-util";
import { readonlyLazy } from "../../utils/lazy-util";
import { LogUtil } from "../../utils/log-utils";
import { NodeLocator } from "../../utils/node-locator-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "sanitizer.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Sanitizer (결정화 캐즘 손소독제)";
  meta.version = "CRCK-SANI-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "모바일 앱 권유 팝업 제거. 손도 깔끔!";
});

// =====================================================
//                        상수
// =====================================================

const logger = readonlyLazy(() => new LogUtil("Sanitizer", false));

// =====================================================
//                        로직
// =====================================================

function monitor() {
  if (CrackSdk.environment().isMobile()) {
    let scannerIndex = 0;
    for (let element of NodeLocator.getAll<HTMLDivElement>('div[height="64"]')) {
      if (++scannerIndex >= 5) return;
      for (let button of element.getElementsByTagName("button")) {
        if (button.textContent === "다운로드") {
          (button.nextSibling as HTMLElement)?.click();
          logger.log("모바일 권유 배너 1개를 제거하였습니다.");
          return;
        }
      }
    }
  }
}

// =====================================================
//                       초기화
// =====================================================

BrowserInitUtil.init(() => {
  BrowserInitUtil.onPagePrepare(() => {
    ObserveUtil.attachObserver(document.body, monitor);
  });
});
