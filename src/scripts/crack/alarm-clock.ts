import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { readonlyLazy } from "../../utils/lazy-util";
import { LogUtil } from "../../utils/log-utils";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import SCRIPT_STYLE from "./css/alarm-clock.scss?inline";
import { NodeUtil } from "../../utils/node-util";
import { NodeLocator } from "../../utils/node-locator-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "alarm-clock.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized AlarmClock";
  meta.version = "CRCK-ALRM-v2.0.0" satisfies CRACK_VERSION_RULE;
});

// =================================================
//                      SVG
// =================================================

function createLoadingIcon(): HTMLElement {
  const element = document.createElement("div");
  // https://www.svgrepo.com/svg/448500/loading
  element.innerHTML =
    '<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" class="hds-flight-icon--animation-loading"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="var(--icon_secondary)" fill-rule="evenodd" clip-rule="evenodd"> <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2"></path> <path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"></path> </g> </g></svg>';
  element.children[0].classList.add("chasm-alarm-clock-loading");
  return element;
}

function createCheckIcon(): HTMLElement {
  const element = document.createElement("div");
  // https://www.svgrepo.com/svg/532154/check
  element.innerHTML =
    '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#20d71d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
  element.children[0].classList.add("chasm-alarm-clock-icon");
  return element;
}

function createCloseIcon(): HTMLElement {
  const element = document.createElement("div");
  // https://www.svgrepo.com/svg/522388/close
  element.innerHTML =
    '<svg width="20px" height="20px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 21.32L21 3.32001" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M3 3.32001L21 21.32" stroke="#ff0000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
  element.children[0].classList.add("chasm-alarm-clock-icon");
  return element;
}

// =====================================================
//                      상수
// =====================================================
const logger = readonlyLazy(() => new LogUtil("AlarmClock", false));
let lastChecked = -1;

function performFadeout(element: Element): Promise<void> {
  return new Promise((resolve) => {
    element.setAttribute("ac-fade-out", "true");
    setTimeout(() => {
      element.remove();
      resolve();
    }, 500);
  });
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
 */
async function checkAttend() {
  if (!CrackSdk.attend().isAttendableTime()) return;
  if (new Date().getDate() !== lastChecked) {
    const isAttendable = await CrackSdk.attend().isAttendable();
    if (!isAttendable.ok) return;
    if (isAttendable.data) {
      findAndInjectElement();
      logger.log("출석이 가능합니다. 모달을 추가합니다.");
    }
    lastChecked = new Date().getDate();
    logger.log("출석이 확인되었습니다. 오늘은 더 이상 모달을 발생시키지 않습니다.");
  }
}

/**
 * 출석을 진행합니다.
 * @param container 출석 모달 요소 최상위 엘리먼트
 */
async function doAttend(container: HTMLElement) {
  const childElements = Array.from(container.children);
  childElements.slice(0, -1).forEach((el) => performFadeout(el));
  setTimeout(() => container.setAttribute("loader", "true"), 400);
  await performFadeout(childElements[childElements.length - 1]);

  const loader = createLoadingIcon();
  container.append(loader);
  const attendResult = await CrackSdk.attend().performAttend();

  await performFadeout(loader);
  const resultIcon = attendResult.ok ? createCheckIcon() : createCloseIcon();
  container.append(resultIcon);
  setTimeout(() => performFadeout(container), attendResult.ok ? 2000 : 1500);
}

// =====================================================
//                    UI 인젝션
// =====================================================
/**
 * 조건이 맞다면 출석 모달 요소를 강제 삽입합니다.
 */
function findAndInjectElement() {
  if (NodeLocator.getElement(".chasm-alarm-clock")) return;
  if (CrackSdk.environment().isMobile()) {
    NodeLocator.onElement(CrackSdk.theme().isDarkTheme() ? ".css-7238to" : ".css-9gj46x", true, (element) => {
      injectElement(element.lastElementChild!.lastElementChild!);
      NodeLocator.onElement("#chasm-alarm-clock", true, (alarmDialog) => {
        alarmDialog.setAttribute("mobile", "true");
      });
    });
  } else {
    NodeLocator.onElement(CrackSdk.theme().isDarkTheme() ? ".css-7238to" : ".css-9gj46x", true, (element) => {
      NodeLocator.onElement("a[href='/cracker']", true, (button) => {
        injectElement(button);
      });
    });
  }
}

/**
 * 출석 요소를 생성하고, 삽입합니다.
 * @param parentElement 삽입할 부모 요소
 */
function injectElement(parentElement?: Element) {
  if (!parentElement) return;
  const containerElement = NodeUtil.setupNode("div", {
    cls: "chasm-alarm-clock",
    onInit: (node) => {
      node.setAttribute("ac-fade-in", "true");
      node.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
    },
  });
  const textElement = NodeUtil.setupParagraphNode({
    text: "출석 체크가 가능해요!",
  });
  const clickableElement = NodeUtil.setupParagraphNode({
    text: ">> 지금 바로 출석하기 <<",
    onInit: (node) => {
      node.className = "chasm-alarm-clock-active";
      node.onclick = () => {
        doAttend(containerElement);
      };
    },
  });
  containerElement.append(textElement, clickableElement);
  parentElement.append(containerElement);
}

// =================================================
//                      초기화
// =================================================

function prepare() {
  window.addEventListener("resize", () => {
    const modal = document.getElementsByClassName("chasm-alarm-clock");
    if (modal.length <= 0) return;
    if (CrackSdk.environment().isDesktop()) {
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

// =================================================
//                  메뉴 강제 추가
// =================================================

if (typeof document !== "undefined") {
  if (typeof GM_addStyle !== undefined) {
    GM_addStyle(SCRIPT_STYLE);
  }
  ("loading" === document.readyState ? document.addEventListener("DOMContentLoaded", prepare) : prepare(), window.addEventListener("load", prepare));
  CrackSdk.addonModal().init();
}

declare function GM_addStyle(css: string): void;
