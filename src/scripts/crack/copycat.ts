import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { BrowserInitUtil } from "../../utils/init-util";
import { LocaleStorageConfig } from "../../utils/local-storage-config";
import { ScriptMetaUtil } from "../../utils/script-meta-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "copycat.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized CopyCat (결정화 캐즘 복사기)";
  meta.version = "CRCK-CCAT-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.defaulticon = "웹에 롱클릭 복사 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

// =====================================================
//                      설정
// =====================================================
const settings = new LocaleStorageConfig("chasm-ccat-settings", {
  copyBotMessage: true,
  copyUserMessage: true,
  copyPromptSection: true,
});
// =================================================
//                     메뉴
// =================================================
function addMenu() {
  CrackSdk.addonModal().init();
  const manager = CrackSdk.addonModal().acquire();
  manager.createMenu("결정화 캐즘 복사기", (modal) => {
    modal.replaceContentPanel((panel) => {
      panel.addText("경고: 해당 모듈은 메시지 길게 누르기로 인한 컨텍스트 메뉴 호출을 막습니다.\n예상치 못한 동작이 발생할 수 있습니다.");
      panel.addSwitchBox("cntr-ccat-copy-user-prompt", "프롬프트 복사", "활성화시, 프롬프트 입력칸을 길게 클릭하면 메시지를 복사합니다.", {
        defaultValue: settings.config.copyPromptSection,
        onChange: (value) => {
          settings.config.copyPromptSection = value;
          settings.save();
        },
      });
      panel.addSwitchBox("cntr-ccat-copy-user-message", "유저 메시지 복사", "활성화시, 유저 메시지를 길게 클릭하면 메시지를 복사합니다.", {
        defaultValue: settings.config.copyUserMessage,
        onChange: (value) => {
          settings.config.copyUserMessage = value;
          settings.save();
        },
      });
      panel.addSwitchBox("cntr-ccat-copy-bot-message", "AI 메시지 복사", "활성화시, AI 메시지를 길게 클릭하면 메시지를 복사합니다.", {
        defaultValue: settings.config.copyBotMessage,
        onChange: (value) => {
          settings.config.copyBotMessage = value;
          settings.save();
        },
      });
    }, "결정화 캐즘 복사기");
  });
}
// =================================================
//               스크립트 초기 실행
// =================================================
let lastPointed: (() => Promise<string | undefined>) | undefined = undefined;
let isCopyTriggered = false;
let clickedTick = 0;

function monitor() {
  if (lastPointed === undefined) return;
  if (clickedTick++ > 20) {
    lastPointed().then((message) => {
      if (message) {
        CrackSdk.toastify().doToastifyAlert(message);
        try {
          navigator.vibrate(200);
        } catch (err) {}
      }
    });
    lastPointed = undefined;
    isCopyTriggered = true;
  }
}

/**
 *
 * @param element
 * @returns
 */
function findValidPointerElement(element: Element): (() => Promise<string | undefined>) | undefined {
  let base: Element | null = element;
  while (base) {
    if (base.hasAttribute("data-message-group-id")) {
      const chatId = CrackSdk.path().chatRoom();
      if (!chatId) return;

      const messageId = base.getAttribute("data-message-group-id");
      return async () => {
        if (!messageId) {
          return "크랙의 업데이트로 인해 메시지 가져오기가 비활성화되었어요.\n지원 채널에 제보해주시면 빠르게 수정될 예정이예요.";
        }
        const message = await CrackSdk.sessionFetcher().getMessage(chatId, messageId);
        if (!message.ok) {
          return "오류로 인해 메시지를 복사하지 못했어요.";
        } else {
          if (message.value.isBot() && settings.config.copyBotMessage) {
            await navigator.clipboard.writeText(message.value.content);
          } else if (message.value.isUser() && settings.config.copyUserMessage) {
            await navigator.clipboard.writeText(message.value.content);
          } else {
            return undefined;
          }
          return "메시지가 복사되었어요.";
        }
      };
    }
    if (settings.config.copyPromptSection && base.tagName.toLowerCase() === "textarea" && base.getAttribute("placeholder") === "메시지 보내기") {
      return async () => {
        await navigator.clipboard.writeText((base as HTMLTextAreaElement).value);
        return "작성중인 프롬프트가 복사되었어요.";
      };
    }
    base = base.parentElement;
  }
  return undefined;
}

function prepare() {
  document.addEventListener("mousedown", (event) => {
    if (!CrackSdk.path().isChattingPath()) return;
    const clicked = document.elementFromPoint(event.pageX, event.pageY);
    if (!clicked) return;
    const validElement = findValidPointerElement(clicked);
    isCopyTriggered = false;
    if (validElement) {
      lastPointed = validElement;
      clickedTick = 0;
    }
  });
  document.addEventListener("mouseup", () => {
    lastPointed = undefined;
  });
  document.addEventListener("touchstart", (event) => {
    if (!CrackSdk.path().isChattingPath()) return;
    const clicked = document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY);
    if (!clicked) return;
    const validElement = findValidPointerElement(clicked);
    if (validElement) {
      lastPointed = validElement;
      clickedTick = 0;
    }
  });
  document.addEventListener("touchend", () => {
    lastPointed = undefined;
  });
  document.addEventListener("touchcancel", () => {
    lastPointed = undefined;
  });
  document.addEventListener("contextmenu", (event) => {
    if (isCopyTriggered) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  setInterval(monitor, 100);
}

BrowserInitUtil.init(() => {
  settings.load();
  addMenu();
  BrowserInitUtil.onPagePrepare(prepare);
});
