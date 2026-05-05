import { ModalManager } from "../../utils/decentralized-modal/components/modal-manager";
import { NodeLocator } from "../../utils/node-locator-util";
import { ObserveUtil } from "../../utils/observe-util";
import { CrackSdk } from "../crack-sdk";

function tryInjectMenuItem(element: HTMLAnchorElement, targetHref: string): boolean {
  if (element.getAttribute("href") === targetHref) {
    const clonedElement = element.cloneNode(true) as HTMLElement;
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
    return true;
  }
  return false;
}

function __updateModalMenu() {
  if (NodeLocator.get("#chasm-decentral-menu")) return;
  if (CrackSdk.environment().isMobile()) {
    for (const element of NodeLocator.getAll<HTMLAnchorElement>("a")) {
      if (tryInjectMenuItem(element, "/my-page")) break;
    }
  } else {
    NodeLocator.on<HTMLDivElement>("#web-modal", true, () => {
      for (const element of NodeLocator.getAll<HTMLAnchorElement>("a")) {
        if (tryInjectMenuItem(element, "/setting")) break;
      }
    });
  }
}

let delayer: ReturnType<typeof setTimeout> | null = null;

function init() {
  const refined = document as any;
  if (refined.c2ModalInit) return;
  refined.c2ModalInit = true;
  ObserveUtil.attachObserver(document, () => {
    if (delayer) clearTimeout(delayer);
    delayer = setTimeout(() => {
      __updateModalMenu();
    }, 50);
  });
}

function acquire(): ModalManager {
  return ModalManager.getOrCreateManager("c2-refined");
}

export const CrackAddonModalApi = {
  init,
  acquire,
} as const;
