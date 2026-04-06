import { Processor, Skippable } from "../../generic-types";
import { NodeUtil } from "../../node-util";
import { BaseMenuPanel } from "./base-panel";
import { ModalContainer } from "./modal-container";
import { ModalMenu } from "./modal-menu";

export class MobileMenuPanel extends BaseMenuPanel {
  #menu?: HTMLElement;

  constructor(modal: ModalContainer, menus: Map<string, ModalMenu>, selectedMenu: string[]) {
    super(modal, menus, selectedMenu);
    this.#menu = undefined;
  }

  open() {
    this.#menu?.setAttribute("active", "true");
  }

  close() {
    this.#menu?.removeAttribute("active");
  }

  hideAllActive() {
    super.hideAllActive(["decentral-mobile-menu-element-container", "decentral-mobile-menu-element", "decentral-mobile-sub-menu-element"]);
  }

  asHTML() {
    const container = (this.#menu = NodeUtil.setupNode("div", { cls: "decentral-mobile-menu-container" }));
    let isElementActiveSelected = false;

    for (const [itemName, menuItem] of this.menus) {
      const menuContainer = this.createMenuContainer(itemName, menuItem, (isActive) => {
        isElementActiveSelected = isActive;
        return false;
      });
      container.append(menuContainer);
    }

    this.setDefaultActiveState(isElementActiveSelected, container);

    return container;
  }

  /**
   *
   * @returns {HTMLElement | undefined}
   */
  currentMenu() {
    return this.#menu;
  }

  /**
   *
   * @param itemName
   * @param menuItem
   * @param setActiveSelected
   * @returns
   */
  createMenuContainer(itemName: string, menuItem: ModalMenu, setActiveSelected: Processor<boolean, Skippable<boolean>>) {
    const menuContainer = NodeUtil.setupNode("div", { cls: "decentral-mobile-menu-element-container" });
    const menuText = NodeUtil.setupNode("span", {
      cls: "decentral-mobile-menu-element",
      onInit: (node) => {
        node.textContent = itemName;
        menuItem.setMobileActivator(() => {
          this.hideAllActive();
          node.setAttribute("active", "true");
          menuContainer.setAttribute("active", "true");
        });
        node.onclick = () => {
          this.close();
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
    const subMenuContainer = NodeUtil.setupNode("div", { cls: "decentral-mobile-sub-menu-container" });
    for (const { name, menu } of menuItem.listMenus()) {
      const subMenuNode = NodeUtil.setupNode("span", {
        cls: "decentral-mobile-sub-menu-element",
        onInit: (node) => {
          node.textContent = name;
          const expectedSubmenu = [itemName, name];
          menu.setMobileActivator(() => {
            this.hideAllActive();
            menuContainer.setAttribute("active", "true");
            menuText.setAttribute("child-active", "true");
            node.setAttribute("active", "true");
          });
          node.onclick = () => {
            this.close();
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
        targetMenuContainer = container.querySelector(".decentral-mobile-menu-element-container");
      } else if (this.selectedMenu.length === 1) {
        const menuElements = container.querySelectorAll(".decentral-mobile-menu-element");
        for (const menuText of menuElements) {
          if (menuText.textContent === selectedItemName) {
            targetMenuContainer = menuText.parentElement;
            break;
          }
        }
      }

      if (targetMenuContainer) {
        targetMenuContainer.setAttribute("active", "true");
        targetMenuContainer.querySelector(".decentral-mobile-menu-element")?.setAttribute("active", "true");
      }
    }
  }
}
