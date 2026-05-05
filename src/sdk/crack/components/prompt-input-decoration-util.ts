import { Nullable } from "../../../utils/generic-types";
import { NodeLocator } from "../../../utils/node-locator-util";
import { NodeUtil } from "../../../utils/node-util";
import { CrackPathApi } from "../path-util";

const MAIN_WRAPPER_CLASS = "__addon-header-wrapper";
const managerCache = new WeakMap<HTMLElement, PromptDecorationManager>();

export class PromptDecorationManager {
  private readonly container: HTMLElement;

  private wrapper: HTMLElement;

  private triggered = new Set<string>();

  constructor(private readonly inputElement: HTMLInputElement) {
    const foundParent = this.findContainer(inputElement);
    if (!foundParent) throw new Error("텍스트 컨테이너는 존재하나, 사전 지정된 클래스 루트가 잘못되었습니다.");
    this.container = foundParent;
    this.wrapper = this.constructHeaderWrapper(this.container);
  }

  private constructHeaderWrapper(container: HTMLElement): HTMLElement {
    const existings = NodeLocator.by(container, `.${MAIN_WRAPPER_CLASS}`);
    if (existings) return existings;
    const constructed = NodeUtil.setupNode("div", {
      style: "z-index: 1; position: absolute; display: flex; width: 100%; flex-direction: column; align-items: center;",
    });
    container.insertBefore(constructed, container.childNodes[0]);
    return constructed;
  }

  private findContainer(element: HTMLElement): HTMLElement | null {
    let parent = element.parentElement;
    while (parent) {
      if (parent.classList.length === 0) break;
      if (NodeUtil.hasCls(parent, "flex", "flex-row", "w-full")) {
        break;
      }
      parent = parent.parentElement;
    }
    return parent;
  }

  trigger(triggerKey: string) {
    this.triggered.add(triggerKey);
  }

  isTriggered(triggerKey: string): boolean {
    return this.triggered.has(triggerKey);
  }

  getMainRowInside(cls: string): Nullable<HTMLElement> {
    if (this.wrapper.children.length > 0) {
      const childs = this.wrapper.children;
      return NodeLocator.by(childs[childs.length - 1], `.${cls}`);
    }
    const constructed = NodeUtil.setupNode("div", {
      style: "display: flex; flex-direction: column; justify-content: space-between; width: 100%; max-width: 768px; width: calc(100% - 80px);",
      onInit(node) {
        node.appendChild(
          NodeUtil.setupNode("div", {
            cls: "__c2_header",
          }),
        );
        node.appendChild(
          NodeUtil.setupNode("div", {
            cls: "__c2_footer",
          }),
        );
      },
    });
    this.wrapper.appendChild(constructed);
    return NodeLocator.by(constructed, `.${cls}`);
  }

  getMainRowHeader(): HTMLElement {
    return this.getMainRowInside("__c2_header")!;
  }

  getMainRowFooter(): HTMLElement {
    return this.getMainRowInside("__c2_footer")!;
  }
}

function manager(): Nullable<PromptDecorationManager> {
  const promptElement = acquirePromptElement();
  if (!promptElement) return null;
  const cached = managerCache.get(promptElement);
  if (cached) return cached;
  const manager = new PromptDecorationManager(promptElement);
  managerCache.set(promptElement, manager);
  return manager;
}
function acquirePromptElement(): Nullable<HTMLInputElement> {
  if (!CrackPathApi.isCharacterPath() && !CrackPathApi.isStoryPath()) return null;
  const area = NodeLocator.get<HTMLInputElement>(`textarea[placeholder="메시지 보내기"]`);
  if (!area) return null;
  return area;
}

export const PromptDecorationUtil = {
  manager,
  acquirePromptElement,
} as const;
