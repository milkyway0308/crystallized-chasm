import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { DelayUtil } from "../../utils/delay-util";
import { BrowserInitUtil } from "../../utils/init-util";
import { NodeLocator } from "../../utils/node-locator-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "optout.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Optout (결정화 캐즘 수신거부)";
  meta.version = "CRCK-OOUT-v1.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "크랙 스토리 업데이트 권유 배너 삭제. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
  meta.match = ["https://crack.wrtn.ai/builder/*"];
});

BrowserInitUtil.init(() => {
  const bouncer = DelayUtil.debouncer(() => {
    const targetButton = NodeLocator.getAll("button").filter((it) => it.textContent === "업데이트 하기");
    if (targetButton.length > 0) {
      targetButton[0].parentElement?.remove();
    }
  });
  ObserveUtil.attachObserver(document, () => bouncer.runDebouncer(50));
});
