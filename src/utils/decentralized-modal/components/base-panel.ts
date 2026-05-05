import { HTMLComponentConvertable } from "../types";
import { ModalContainer } from "./modal-container";
import { ModalMenu } from "./modal-menu";

export abstract class BaseMenuPanel implements HTMLComponentConvertable {
  protected readonly modal: ModalContainer;
  readonly menus: Map<string, ModalMenu>;
  protected selectedMenu: string[];
  constructor(modal: ModalContainer, menus: Map<string, ModalMenu>, selectedMenu: string[]) {
    /** @type {Map<string, ModalMenu>} */
    this.menus = menus;
    this.modal = modal;
    this.selectedMenu = selectedMenu;
  }

  runSelected() {
    if (this.selectedMenu.length === 0 && this.menus.size > 0) {
      this.menus?.entries()?.next()?.value?.[1]?.onDisplay(this.modal);
      return;
    }
    if (this.selectedMenu.length === 1) {
      this.menus.get(this.selectedMenu[0])?.onDisplay(this.modal);
      return;
    }
    if (this.selectedMenu.length === 2) {
      this.menus.get(this.selectedMenu[0])?.findMenu(this.selectedMenu[1])?.onDisplay(this.modal);
    }
  }

  replaceSelected(selected: string[]) {
    this.selectedMenu.length = 0;
    this.selectedMenu.push(...selected);
  }

  hideAllActive(selectors: string[]) {
    for (const selector of selectors) {
      for (const menu of document.getElementsByClassName(selector)) {
        menu.removeAttribute("active");
        if (selector.includes("-element")) {
          menu.removeAttribute("child-active");
        }
      }
    }
  }

  abstract asHTML(): HTMLElement;

}
