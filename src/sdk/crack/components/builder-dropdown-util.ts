import { Consumer, ExpandedVoid, Nullable } from "../../../utils/generic-types";
import { NodeLocator } from "../../../utils/node-locator-util";
import { NodeUtil } from "../../../utils/node-util";

const managerCache = new WeakMap<HTMLElement, ArticleListingMenuManager>();

class ArticleListingMenuItem {
  constructor(public readonly element: HTMLElement) {}

  overrideClick(listener: Consumer<MouseEvent>) {
    this.element.onclick = null;
    this.element.addEventListener("click", listener as EventListener);
  }
}

class ArticleListingDropdownElement {
  constructor(
    public readonly title: string,
    public readonly action: () => void,
  ) {}
}

class ArticleListingDropdown extends ArticleListingMenuItem {
  private dropdownElements: ArticleListingDropdownElement[] =[];

  constructor(element: HTMLElement) {
    super(element);
    this.overrideClick((event) => {
      event.preventDefault();
      event.stopPropagation();
      this.removeExistingDropdown();
      this.clearDropdownContainer();
      this.addItems();
      this.repositionDropdown(element); 
    });
  }

  addElement(title: string, action: () => void) {
    this.dropdownElements.push(new ArticleListingDropdownElement(title, action));
  }

  private accessAdditionalDropdown(): HTMLElement {
    let element = document.getElementById("chasm-copy-dropdown-container");
    if (!element) {
      element = NodeUtil.setupNode("div", {
        cls: "chasm-copy-dropdown-container",
        onInit: (node) => {
          node.id = "chasm-copy-dropdown-container";
          node.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();
          });

          const dropdownElement = NodeUtil.setupNode("div", {
            cls: "chasm-copy-dropdown-item-container",
            onInit(subNode) {
              subNode.id = "chasm-copy-dropdowns";
            },
          });
          
          const borderElement = NodeUtil.setupNode("div", {
            onInit(subNode) {
              subNode.id = "chasm-copy-partial-border";
            },
          });

          node.append(dropdownElement);
          node.append(borderElement);
          document.body.append(node);
        },
      });
    }
    return document.getElementById("chasm-copy-dropdowns") as HTMLElement;
  }

  private removeExistingDropdown() {
    for (const menuNode of Array.from(document.getElementsByClassName("chasm-copy-menu"))) {
      menuNode.removeAttribute("chasm-dropdown-enabled");
    }
    document.getElementById("chasm-copy-dropdown-container")?.remove();
  }

  private repositionDropdown(targetElement: HTMLElement) {
    const element = this.accessAdditionalDropdown();
    const parent = element.parentElement;
    if (!parent) return;
    const targetRect = targetElement.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const nextX = targetRect.x - parentRect.width;
    const nextY = targetRect.y;
    parent.style.cssText = `top: ${nextY}px; left: ${nextX - 5}px; position: absolute;`;
    const rightBorder = document.getElementById("chasm-copy-partial-border");
    if (rightBorder) {
      const height = element.getBoundingClientRect().height;
      rightBorder.style.cssText = `height: ${Math.max(0, height - 30)}px`;
    }
  }

  private clearDropdownContainer() {
    const element = this.accessAdditionalDropdown();
    element.innerHTML = "";
    return element;
  }

  private addItems() {
    const container = this.accessAdditionalDropdown();
    for (const elementItem of this.dropdownElements) {
      const item = NodeUtil.clone(this.element);
      item.textContent = elementItem.title;
      item.onclick = null;
      item.addEventListener("click", elementItem.action);
      container.appendChild(item);
    }
  }
}

const ATTRIBUTE_MODIFIED_CONTAINER = `crack-sdk-modified`;

class ArticleListingMenuManager {
  private menuItems: ArticleListingMenuItem[] =[];
  private expectedContainer = acquireMenuContainer();

  constructor() {
    if (!this.expectedContainer) return;
    this.refresh();
  }

  hasModified(key?: string) {
    const attr = key ? `${ATTRIBUTE_MODIFIED_CONTAINER}-${key}` : ATTRIBUTE_MODIFIED_CONTAINER;
    return this.expectedContainer?.hasAttribute(attr) === true;
  }

  refresh() {
    this.menuItems =[];
    if (this.expectedContainer) {
      const firstChild = this.expectedContainer.childNodes[0];
      if (firstChild) {
        for (const element of Array.from(firstChild.childNodes)) {
          this.menuItems.push(new ArticleListingMenuItem(element as HTMLElement));
        }
      }
    }
  }

  markModified(key?: string) {
    const attr = key ? `${ATTRIBUTE_MODIFIED_CONTAINER}-${key}` : ATTRIBUTE_MODIFIED_CONTAINER;
    this.expectedContainer?.setAttribute(attr, "true");
  }

  private createBaseItem(text: string): HTMLElement {
    let item: HTMLElement;
    if (this.menuItems.length > 0) {
      item = NodeUtil.clone(this.menuItems[0].element);
    } else {
      item = document.createElement("div"); 
    }
    
    item.textContent = text;
    item.onclick = null;
    item.classList.add("chasm-copy-button-primary");
    return item;
  }

  addButton(text: string, onAction: () => ExpandedVoid, key?: string): ArticleListingMenuManager {
    if (!this.expectedContainer) throw new Error("Dropdown container not found");
    this.markModified(key);

    const item = this.createBaseItem(text);
    item.addEventListener("click", (event) => {
        event.stopPropagation();
        onAction()
    });
    
    this.menuItems.push(new ArticleListingMenuItem(item));
    this.expectedContainer?.childNodes[0]?.appendChild(item);
    return this;
  }

  addDropdownButton(text: string, dropdownSetting: (item: ArticleListingDropdown) => void, key?: string): ArticleListingMenuManager {
    if (!this.expectedContainer) throw new Error("Dropdown container not found");
    this.markModified(key);

    const item = this.createBaseItem(text);
    const dropdown = new ArticleListingDropdown(item);
    dropdownSetting(dropdown);
    
    this.menuItems.push(dropdown);
    this.expectedContainer?.childNodes[0]?.appendChild(dropdown.element);
    return this;
  }
}

function acquireMenuContainer(): HTMLDivElement | null {
  return NodeLocator.get<HTMLDivElement>("div[data-radix-popper-content-wrapper]") ?? null;
}

function manager(): Nullable<ArticleListingMenuManager> {
  const current = acquireMenuContainer();
  if (!current) return null;
  if (managerCache.has(current)) {
    return managerCache.get(current)!;
  }
  const newManager = new ArticleListingMenuManager();
  managerCache.set(current, newManager);
  return newManager;
}

export const MyArticlesMenuDropDownApi = { manager, acquireMenuContainer } as const;