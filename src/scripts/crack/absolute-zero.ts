import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { BrowserInitUtil } from "../../utils/init-util";
import { readonlyLazy } from "../../utils/lazy-util";
import { LocaleStorageConfig } from "../../utils/local-storage-config";
import { NodeLocator } from "../../utils/node-locator-util";
import { NodeUtil } from "../../utils/node-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import SCRIPT_STYLE from "./css/absolute-zero.scss?inline";

export const scriptMeta = ScriptMetaUtil.construct("crack", "absolutezero.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized AbsoluteZero (결정화 캐즘 절대영도)";
  meta.version = "CRCK-AZRO-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "선택하거나 호버하지 않은 작품의 GIF 차단. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

// =====================================================
//                      타입
// =====================================================

type HoverableImageElement = HTMLImageElement & {
  onexittriggered?: () => void;
  onhovertriggered?: () => void;
};

// =====================================================
//                      상수
// =====================================================

const CLASS_PREPARE = "chasm-absolute-zero-freeze-prepare";
const CLASS_FREEZE = "chasm-absolute-zero-freeze";
const ATTR_FREEZE = "freeze-out";
const ATTR_MELT = "melt-in";

const settings = readonlyLazy(
  () =>
    new LocaleStorageConfig("chasm-azro-settings", {
      enableFreeze: true,
      enableHoverResume: true,
      enableStopDetailPage: false,
    }),
);

// =====================================================
//                       변수
// =====================================================

let lastProceedImages = 0;
let lastPointing: HTMLElement[] = [];

// =====================================================
//                       로직
// =====================================================
function getProceedImages() {
  return NodeLocator.getAll(`.${CLASS_FREEZE}`).length;
}

function deleteIncompatibleImages() {
  NodeLocator.getAll(`img.${CLASS_FREEZE}`)
    .filter((element) => {
      const canvas = NodeLocator.by(element.parentElement, "canvas");
      const img = NodeLocator.by(element.parentElement, "img");
      if (!canvas || !img || !NodeUtil.attrEq(false, "", img, canvas)) {
        return false;
      }
      NodeUtil.delCls(img, CLASS_FREEZE, CLASS_PREPARE);
      NodeUtil.delAttr(img, ATTR_FREEZE, ATTR_MELT);
      return true;
    })
    .forEach((element) => {
      element.remove();
    });
}

function applyStopper(originNode: HTMLImageElement) {
  const node = originNode as HoverableImageElement;
  if (NodeUtil.hasCls(node, CLASS_PREPARE)) {
    return;
  }
  NodeUtil.addCls(node, CLASS_PREPARE, CLASS_FREEZE);
  const canvasElement = NodeUtil.setupNode("canvas", {
    onInit: (current) => {
      const width = (current.width = node.width);
      const height = (current.height = node.height);
      current.getContext("2d")?.drawImage(node, 0, 0, width, height);
      for (let index = 0; index < node.attributes.length; index++) {
        const { name, value } = node.attributes[index];
        current.setAttribute(name, value);
      }
    },
  });
  node.setAttribute("freeze-out", "true");
  node.parentNode?.insertBefore(canvasElement, node);
}

function setup() {
  if (!settings.config.enableFreeze) return;
  if (!CrackSdk.path().isDashboardPath() || lastProceedImages === document.images.length) return;
  deleteIncompatibleImages();
  for (const imageNode of document.images) {
    if (imageNode.classList.contains("chasm-absolute-zero-freeze")) {
      continue;
    }
    if (!imageNode.src.includes("cloudfront.net") || (imageNode.alt === "character_thumbnail" && !settings.config.enableStopDetailPage) || (!imageNode.src.endsWith("webp") && !imageNode.src.endsWith("gif"))) {
      NodeUtil.addCls(imageNode, CLASS_FREEZE);
      continue;
    }

    if (!imageNode.complete) {
      imageNode.onload = () => {
        applyStopper(imageNode);
      };
    } else {
      applyStopper(imageNode);
    }
  }
  lastProceedImages = getProceedImages();
}
// =================================================
//                  초기화
// =================================================

function prepare() {
  setup();
  ObserveUtil.attachObserver(document, () => {
    setup();
  });
  setInterval(() => {
    for (let element of NodeLocator.getAll<HoverableImageElement>("div:hover > canvas.chasm-absolute-zero-freeze:first-child")) {
      element.onhovertriggered?.();
    }
    lastPointing = lastPointing.filter((element) => {
      if (!NodeUtil.isNodeSelected(element)) {
        (element as HoverableImageElement).onexittriggered?.();
        return false;
      }
      return true;
    });
  }, 20);
}

function addMenu() {
  const manager = CrackSdk.addonModal().acquire();
  manager.createMenu("결정화 캐즘 절대영도", (modal) => {
    modal.replaceContentPanel((panel) => {
      panel.addSwitchBox("cntr-azro-enable", "애니메이션 정지", "메인 페이지에서의 GIF / WEBP 정지를 활성화합니다.", {
        defaultValue: settings.config.enableFreeze,
        onChange: (value) => {
          settings.config.enableFreeze = value;
          settings.save();
        },
      });
      panel.addSwitchBox("cntr-azro-enable-hover", "정지 애니메이션 호버링 재활성화", "호버한 이미지에 한해 GIF / WEBP를 재생할지의 여부입니다.", {
        defaultValue: settings.config.enableHoverResume,
        onChange: (value) => {
          settings.config.enableHoverResume = value;
          settings.save();
        },
      });
      panel.addSwitchBox("cntr-azro-disable-setting", "상세 페이지 애니메이션 정지", "상세 페이지의 애니메이션을 정지할지의 여부입니다.", {
        defaultValue: settings.config.enableStopDetailPage,
        onChange: (value) => {
          settings.config.enableStopDetailPage = value;
          settings.save();
        },
      });
    }, "결정화 캐즘 절대영도");
  });
  manager.addLicenseDisplay((panel) => {
    panel.addTitleText("결정화 캐즘 절대영도");
    panel.addText("- stop-chrome-gifanim 애드온 소스 코드 (https://github.com/johan/stop-chrome-gifanim)");
    panel.addText("- decentralized-modal.js 프레임워크 사용 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)");
  });
}

// =================================================
//                    초기화
// =================================================

BrowserInitUtil.init(() => {
  settings.load();
  addMenu();
  BrowserInitUtil.onPagePrepare(prepare);
  BrowserInitUtil.callGMAddStyle(SCRIPT_STYLE);
});
