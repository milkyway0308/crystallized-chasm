import Dexie, { EntityTable } from "dexie";
import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import { configure } from "../../utils/flow-handler";
import { lazy, readonlyLazy } from "../../utils/lazy-util";
import { LocaleStorageConfig } from "../../utils/local-storage-config";
import { CrackSdk } from "../../sdk/crack-sdk";
import { ObserveUtil } from "../../utils/observe-util";
import { BrowserInitUtil } from "../../utils/init-util";
import { NodeUtil } from "../../utils/node-util";
import { NodeLocator } from "../../utils/node-locator-util";
import { PromptDecorationManager } from "../../sdk/crack/components/prompt-input-decoration-util";
import SCRIPT_STYLE from "./css/counter.scss?inline";
import { LogUtil } from "../../utils/log-utils";
import { DelayUtil } from "../../utils/delay-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "counter.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Counter (결정화 캐즘 계수기)";
  meta.version = "CRCK-CNTR-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "채팅에 캐릭터 채팅 턴 계수기 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

interface CounterChatStore {
  sessionId: string;
  lastAccess: number;
}

interface CounterChatData {
  messageId: string;
  sessionId: string;
}

// =====================================================
//                      설정
// =====================================================

const PURGE_THRESHOLD = 24 * 60 * 60 * 1000 * 14;
const logger = readonlyLazy(() => new LogUtil("Chasm Crystallized Counter", false));
const parser = readonlyLazy(() => new DOMParser());
let lastExpectedMessageBubble = 0;

const db = readonlyLazy(() =>
  configure(
    new Dexie("chasm-counter-v2") as Dexie & {
      chatStore: EntityTable<CounterChatStore, "sessionId">;
      messageStore: EntityTable<CounterChatData, "messageId">;
    },
    (dexie) => {
      dexie
        .version(1)
        .stores({
          chatStore: `sessionId, lastAccess`,
          messageStore: `messageId, sessionId, time`,
        })
        .upgrade(async (tx) => {
          await Promise.all(
            db.tables.map((table) => {
              return tx.table(table.name).clear();
            }),
          );
        });
    },
  ),
);
const settings = lazy(
  () =>
    new LocaleStorageConfig("chasm-cntr-settings", {
      enableStoryCounter: true,
      enableCharacterCounter: true,
    }),
);

function isCharacterCounterEnabled() {
  return settings.config.enableCharacterCounter && CrackSdk.path().isCharacterPath();
}

function isStoryCounterEnabled() {
  return settings.config.enableStoryCounter && CrackSdk.path().isStoryPath();
}

// =====================================================
//                      SVG
// =====================================================
// https://www.svgrepo.com/svg/446075/time-history
function createHistorySvg() {
  return `<svg width="16px" height="16px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="var(--text_primary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>time-history</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="icons_Q2" data-name="icons Q2"> <path d="M46,24A22,22,0,0,1,4.3,33.7a2,2,0,0,1,.5-2.6,2,2,0,0,1,3,.7A18,18,0,1,0,10.6,12h5.3A2.1,2.1,0,0,1,18,13.7,2,2,0,0,1,16,16H6a2,2,0,0,1-2-2V4.1A2.1,2.1,0,0,1,5.7,2,2,2,0,0,1,8,4V8.9A22,22,0,0,1,46,24Z"></path> <path d="M34,32a1.7,1.7,0,0,1-1-.3L22,25.1V14a2,2,0,0,1,4,0v8.9l9,5.4a1.9,1.9,0,0,1,.7,2.7A1.9,1.9,0,0,1,34,32Z"></path> </g> </g> </g></svg>`;
}

// https://www.svgrepo.com/svg/491399/dot-small
function createDotSvg() {
  return `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="var(--text_primary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="#FFFFFF"></path> </g></svg>`;
}

async function doPurge() {
  await db.chatStore
    .where("lastAccess")
    .below(Date.now() - PURGE_THRESHOLD)
    .each(async (item) => {
      await db.messageStore.where("sessionId").equals(item.sessionId).delete();
    });
}

async function doFetch(sessionId: string) {
  await db.chatStore.put({ sessionId: sessionId, lastAccess: Date.now() });
  for await (const history of CrackSdk.sessionFetcher().iterateLogs(sessionId)) {
    if (!history.ok) break;
    if (history.value.reroll) continue;
    if ((await db.messageStore.where({ sessionId: sessionId, messageId: history.value.id }).count()) > 0) break;
    await db.messageStore.put({ sessionId: sessionId, messageId: history.value.id });
    updateIfMatched(sessionId, true, await db.messageStore.where({ sessionId: sessionId }).count());
  }
  updateIfMatched(sessionId, false, await db.messageStore.where({ sessionId: sessionId }).count());
}

async function updateIfMatched(sessionId: string, warning: boolean, count: number) {
  if (sessionId === CrackSdk.path().chatRoom()) {
    const indicator = document.getElementById("chasm-counter-indicator");
    if (indicator) {
      indicator.textContent = `${count}턴`;
    }
  }
}
// =====================================================
//                   Initialization
// =====================================================

function injectComponent(manager: PromptDecorationManager) {
  manager.trigger("chasm-counter");
  manager.getMainRowHeader().append(
    NodeUtil.setupNode("div", {
      cls: "chasm-counter-container",
      onInit(node) {
        const svgNode = parser.parseFromString(createHistorySvg(), "image/svg+xml").documentElement;
        const textNode = NodeUtil.setupNode("span", {
          text: "--",
          onInit(textNode) {
            textNode.id = "chasm-counter-indicator";
          },
        });
        node.append(svgNode, textNode);
      },
    }),
  );
}

async function setup() {
  if (!isStoryCounterEnabled() && !isCharacterCounterEnabled()) return;
  const manager = CrackSdk.pageComponent().promptInputDecoration().manager();
  if (!manager) return;
  if (!manager.isTriggered("chasm-counter")) {
    await doPurge();
    injectComponent(manager);
    const sessionId = CrackSdk.path().chatRoom();
    if (sessionId) {
      await doFetch(sessionId);
    }
  }
  const element = NodeLocator.get("#chasm-counter-indicator");
  if (!element) return;
  const nextBubbleCount = NodeLocator.getAll("[data-message-group-id]").length;
  if (nextBubbleCount !== lastExpectedMessageBubble) {
    const sessionId = CrackSdk.path().chatRoom();
    if (sessionId) {
      lastExpectedMessageBubble = nextBubbleCount;
      await doFetch(sessionId);
    }
  }
}

function prepare() {
  const debouncer = DelayUtil.debouncer(setup);
  debouncer.runDebouncer(100);
  ObserveUtil.attachObserver(document, () => {
    debouncer.runDebouncer(100);
  });
  //   ObserveUtil.attachHrefObserver(document, () => {
  //     const textNode = document.getElementById("chasm-counter-indicator");
  //     if (textNode) {
  //       textNode.textContent = "--";
  //     }
  //   });
}

function addMenu() {
  const manager = CrackSdk.addonModal().acquire();
  manager.createMenu("결정화 캐즘 계수기", (modal) => {
    modal.replaceContentPanel((panel) => {
      panel.addSwitchBox("cntr-story", "스토리 채팅 계수기", "스토리 채팅에서의 계수기 표시를 활성화합니다.", {
        defaultValue: settings.config.enableStoryCounter,
        onChange: (value) => {
          settings.config.enableStoryCounter = value;
          settings.save();
        },
      });
      panel.addSwitchBox("cntr-character", "캐릭터 채팅 계수기", "캐릭터 채팅에서의 계수기 표시를 활성화합니다.", {
        defaultValue: settings.config.enableCharacterCounter,
        onChange: (value) => {
          settings.config.enableCharacterCounter = value;
          settings.save();
        },
      });
    }, "결정화 캐즘 계수기");
  });
  manager.addLicenseDisplay((panel) => {
    panel.addTitleText("결정화 캐즘 계수기");
    panel
      .addText("결정화 캐즘 계수기의 모든 아이콘은 SVGRepo에서 가져왔습니다.")
      .addText("또한, 일부의 외부 프레임워크를 통해 웹 내부 데이터베이스를 관리하고 있습니다.")
      .addText("- 시계 아이콘 (https://www.svgrepo.com/svg/446075/time-history)")
      .addText("- dexie.js 프레임워크 (https://dexie.org/)")
      .addText("- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)");
  });
}

BrowserInitUtil.init(() => {
  // Cleanup legacy
  new Dexie("chasm-counter").delete();
  // Do load
  settings.load();
  addMenu();
  BrowserInitUtil.onPagePrepare(prepare);
  BrowserInitUtil.callGMAddStyle(SCRIPT_STYLE);
  // @ts-ignore
  document.testClear = async () => {
    return await db.chatStore.clear();
  };
});
