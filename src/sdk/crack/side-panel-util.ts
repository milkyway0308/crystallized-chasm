import { Nullable } from "../../utils/generic-types";
import { NodeUtil } from "../../utils/node-util";

export class SidePanelButton {
  constructor(public readonly element: Element) {}

  insertBefore(target: SidePanelButton) {
    this.element.before(target.element);
  }

  insertAfter(target: SidePanelButton) {
    this.element.after(target.element);
  }
}

export class SidePanelCategory {
  constructor(
    public readonly title: string,
    public readonly headerElement: Element,
    public readonly buttons: SidePanelButton[] = [],
  ) {}

  addButton(button: SidePanelButton) {
    const lastElement = this.buttons.length > 0 ? this.buttons[this.buttons.length - 1].element : this.headerElement;

    lastElement.after(button.element);
    this.buttons.push(button);
  }

  insertBefore(targetCategory: SidePanelCategory) {
    targetCategory.headerElement.before(this.headerElement);
    this.moveButtonsAfter();
  }

  insertAfter(targetCategory: SidePanelCategory) {
    const targetLastElement = targetCategory.buttons.length > 0 ? targetCategory.buttons[targetCategory.buttons.length - 1].element : targetCategory.headerElement;

    targetLastElement.after(this.headerElement);
    this.moveButtonsAfter();
  }

  private moveButtonsAfter() {
    let currentPrev = this.headerElement;
    for (const button of this.buttons) {
      currentPrev.after(button.element);
      currentPrev = button.element;
    }
  }

  appendCustomButton(onInit: (parent: HTMLDivElement) => void): SidePanelCategory {
    const template = NodeUtil.setupNode("div", {
      cls: "px-2.5 h-4 box-content py-[18px]",
    });
    onInit(template);
    this.addButton(new SidePanelButton(template));
    return this;
  }

  appendNormalButton(iconSvg: string, buttonText: string, onClick: () => void): SidePanelCategory {
    const template = NodeUtil.setupNode("div", {
      cls: "px-2.5 h-4 box-content py-[18px]",
    });

    const actualButton = NodeUtil.setupNode("div", {
      cls: "w-full flex h-4 items-center justify-between typo-text-base_leading-none_medium space-x-2 [&_svg]:fill-icon_tertiary ring-offset-4 ring-offset-sidebar cursor-pointer",
      onInit: (node) => {
        const rootNode = NodeUtil.setupNode("span", { cls: "flex space-x-2 items-center" });
        rootNode.append(
          NodeUtil.setupNode("div", {
            onInit: (svgNode) => {
              svgNode.innerHTML = iconSvg;
            },
          }),
          NodeUtil.setupNode("span", {
            cls: "whitespace-nowrap overflow-hidden text-ellipsis typo-text-sm_leading-none_medium",
            text: buttonText,
          }),
        );
        node.appendChild(rootNode);
      },
    });

    template.append(actualButton);
    template.onclick = onClick;
    this.addButton(new SidePanelButton(template));
    return this;
  }
}

export class SidePanelManager {
  private categoryMap = new Map<string, SidePanelCategory>();
  private categoryArray: SidePanelCategory[] = [];

  constructor() {
    this.refresh();
  }

  private getSidePanelElement(): Nullable<Element> {
    const spans = Array.from(document.querySelectorAll("span"));
    return spans.find((span) => span.textContent === "채팅방 설정")?.parentElement || null;
  }

  refresh() {
    this.categoryMap.clear();
    this.categoryArray = [];
    const sidePanelElement = this.getSidePanelElement();
    if (!sidePanelElement) return;
    let currentCategory: Nullable<SidePanelCategory> = null;
    for (const element of Array.from(sidePanelElement.children)) {
      const tagName = element.tagName.toLowerCase();
      if (tagName === "p" || tagName === "span") {
        currentCategory = new SidePanelCategory(element.textContent || "", element);
        this.categoryArray.push(currentCategory);
        this.categoryMap.set(currentCategory.title, currentCategory);
        continue;
      }
      if (currentCategory && element.childNodes.length > 0) {
        currentCategory.buttons.push(new SidePanelButton(element));
      }
    }
  }

  getMenuMap(): Map<string, SidePanelCategory> {
    return this.categoryMap;
  }

  getOrCreateCategory(categoryName: string, beforeTitle?: string): SidePanelCategory {
    return this.categoryMap.get(categoryName) || this.appendCategory(categoryName, beforeTitle);
  }

  appendCategory(categoryName: string, beforeTitle?: string): SidePanelCategory {
    const header = NodeUtil.setupNode("p", {
      cls: "typo-text-md_leading-none_medium p-2 text-text_tertiary",
      text: categoryName,
    });
    const created = new SidePanelCategory(categoryName, header);
    if (beforeTitle) {
      const target = this.categoryMap.get(beforeTitle);
      if (!target) throw new Error(`Target category '${beforeTitle}' does not exist.`);
      created.insertBefore(target);
      const index = this.categoryArray.indexOf(target);
      this.categoryArray.splice(index, 0, created);
    } else {
      if (this.categoryArray.length > 0) {
        created.insertAfter(this.categoryArray[this.categoryArray.length - 1]);
      } else {
        this.getSidePanelElement()?.append(header);
      }
      this.categoryArray.push(created);
    }
    header.after(NodeUtil.setupNode("div", { cls: "h-10" }));

    this.categoryMap.set(categoryName, created);
    return created;
  }
}

function manager(): SidePanelManager {
  return new SidePanelManager();
}

export const SidePanelUtil = {
  manager,
} as const;
