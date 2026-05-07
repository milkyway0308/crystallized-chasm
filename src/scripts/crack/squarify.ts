import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { DelayUtil } from "../../utils/delay-util";
import { BrowserInitUtil } from "../../utils/init-util";
import { NodeLocator } from "../../utils/node-locator-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "squarify.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Squarify (결정화 캐즘 제곱근)";
  meta.version = "CRCK-SQAR-v1.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "세션 목록 이미지 직사각형으로 조정. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});


const observerAttached = new WeakSet<Element>();
function tryAttachObserver() {
  const expectedSidebar = NodeLocator.get(`[data-testid="virtuoso-scroller"]`);
  if (!expectedSidebar) return;
  if (observerAttached.has(expectedSidebar)) return;
  observerAttached.add(expectedSidebar);
  ObserveUtil.attachObserver(expectedSidebar, () => {
    for (const imageNode of NodeLocator.byAll(expectedSidebar, "img")) {
        if (!imageNode.hasAttribute("chasm-sqar-modified")) {
            imageNode.setAttribute("chasm-sqar-modified", "true");
            imageNode.parentElement?.classList.add("chasm-sqar-squarify")
        }
    }
  });
}


BrowserInitUtil.init(() => {
    tryAttachObserver();
    const debouncer = DelayUtil.debouncer(tryAttachObserver);
    ObserveUtil.attachObserver(document, () => debouncer.runDebouncer(50));

    BrowserInitUtil.callGMAddStyle(`
        .chasm-sqar-squarify {
            width: 36px !important;
            height: 54px !important;
            border-radius: 0px !important;
        }        
    `);
});
