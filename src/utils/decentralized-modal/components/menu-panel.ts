import { Processor, Skippable } from "../../generic-types";
import { NodeUtil } from "../../node-util";
import { BaseMenuPanel } from "./base-panel";
import { ModalContainer } from "./modal-container";
import { ModalMenu } from "./modal-menu";

export class MenuPanel extends BaseMenuPanel {
  #menu?: HTMLElement;
  /**
   *
   * @param {ModalContainer} modal
   * @param {Map<string, ModalMenu>} menus
   * @param {string[]} selectedMenu
   */
  constructor(modal: ModalContainer, menus: Map<string, ModalMenu>, selectedMenu: string[]) {
    super(modal, menus, selectedMenu);
    this.#menu = undefined;
  }

  hideAllActive() {
    super.hideAllActive(["decentral-menu-element-container", "decentral-menu-element", "decentral-sub-menu-element"]);
  }

  /**
   *
   * @returns {HTMLElement | undefined}
   */
  currentMenu() {
    return this.#menu;
  }

  asHTML() {
    if (this.#menu) {
      return this.#menu;
    }
    const container = NodeUtil.setupNode("div", { cls: "decentral-menu-container" });
    let isElementActiveSelected = false;

    for (const [itemName, menuItem] of this.menus) {
      const menuContainer = this.createMenuContainer(itemName, menuItem, (isActive) => {
        isElementActiveSelected = isActive;
      });
      container.append(menuContainer);
    }

    this.setDefaultActiveState(isElementActiveSelected, container);

    return (this.#menu = container);
  }

  /**
   *
   * @param itemName
   * @param menuItem
   * @param setActiveSelected
   * @returns
   */
  createMenuContainer(itemName: string, menuItem: ModalMenu, setActiveSelected: Processor<boolean, Skippable<boolean>>) {
    const menuContainer = NodeUtil.setupNode("div", { cls: "decentral-menu-element-container" });
    const menuText = NodeUtil.setupNode("span", {
      cls: "decentral-menu-element",
      onInit: (node) => {
        node.textContent = itemName;
        menuItem.setActivator(() => {
          this.hideAllActive();
          node.setAttribute("active", "true");
          menuContainer.setAttribute("active", "true");
        });
        node.onclick = () => {
          this.hideAllActive();
          this.replaceSelected([itemName]);
          this.runSelected();
        };
      },
    });
    menuContainer.appendChild(menuText);
    if (menuItem.length() > 0) {
      const subMenuContainer = this.createSubMenuContainer(itemName, menuItem, menuContainer, menuText, setActiveSelected);
      menuContainer.append(subMenuContainer);
    }

    return menuContainer;
  }

  /**
   *
   * @param itemName
   * @param menuItem
   * @param menuContainer
   * @param menuText
   * @param setActiveSelected
   * @returns
   */
  createSubMenuContainer(itemName: string, menuItem: ModalMenu, menuContainer: HTMLElement, menuText: HTMLElement, setActiveSelected: Processor<boolean, Skippable<boolean>>) {
    const subMenuContainer = NodeUtil.setupNode("div", { cls: "decentral-sub-menu-container" });
    for (const { name, menu } of menuItem.listMenus()) {
      const subMenuNode = NodeUtil.setupNode("span", {
        cls: "decentral-sub-menu-element",
        onInit: (node) => {
          node.textContent = name;
          const expectedSubmenu = [itemName, name];
          menu.setActivator(() => {
            this.hideAllActive();
            menuContainer.setAttribute("active", "true");
            menuText.setAttribute("child-active", "true");
            node.setAttribute("active", "true");
          });
          node.onclick = () => {
            this.replaceSelected(expectedSubmenu);
            this.runSelected();
          };
        },
      });
      subMenuContainer.appendChild(subMenuNode);
      if (!setActiveSelected(false) && this.selectedMenu.length === 2 && this.selectedMenu[0] === itemName && this.selectedMenu[1] === name) {
        setActiveSelected(true);
        subMenuContainer.setAttribute("active", "true");
      }
    }
    return subMenuContainer;
  }

  /**
   *
   * @param {boolean} isElementActiveSelected
   * @param {HTMLElement} container
   */
  setDefaultActiveState(isElementActiveSelected: boolean, container: HTMLElement) {
    if (!isElementActiveSelected) {
      const selectedItemName = this.selectedMenu[0];
      let targetMenuContainer;

      if (this.selectedMenu.length === 0) {
        targetMenuContainer = container.querySelector(".decentral-menu-element-container");
      } else if (this.selectedMenu.length === 1) {
        const menuElements = container.querySelectorAll(".decentral-menu-element");
        for (const menuText of menuElements) {
          if (menuText.textContent === selectedItemName) {
            targetMenuContainer = menuText.parentElement;
            break;
          }
        }
      }
      if (targetMenuContainer) {
        targetMenuContainer.setAttribute("active", "true");
        targetMenuContainer.querySelector(".decentral-menu-element")?.setAttribute("active", "true");
      }
    }
  }
}
