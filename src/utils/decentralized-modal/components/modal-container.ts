import { AsyncConsumer, Consumer, Nullable, Runnable } from "../../generic-types";
import { NodeUtil } from "../../node-util";
import { DECENTRAL_DEFAULT_ICON_SVG, DECENTRAL_VERSION } from "../constants";
import { ContentPanel } from "./content-panel";
import { MenuPanel } from "./menu-panel";
import { MobileMenuPanel } from "./mobile-menu-panel";
import { ModalMenu } from "./modal-menu";

export class ModalContainer {
  #selectedMenu: string[] = [];

  #preOpenHandler: Consumer<ModalContainer>[] = [];

  #menuItems = new Map<string, ModalMenu>();

  __container?: HTMLElement;

  __modal?: HTMLElement;

  __menuPanel?: MenuPanel;

  __mobileMenuPanel?: MobileMenuPanel;

  __contentPanel?: ContentPanel;

  private readonly baseId: string;

  private readonly closeHandlers: Map<string, Runnable>;

  constructor(baseId: string, closer: Map<string, Runnable>) {
    this.baseId = baseId;
    this.closeHandlers = closer;
  }

  getVersion() {
    return DECENTRAL_VERSION;
  }

  /**
   * 최상위 메뉴를 생성합니다.
   * @param menuName 메뉴 이름
   * @param menuAction 메뉴 선택시 실행될 람다
   * @returns 생성된 메뉴
   */
  async createMenu(menuName: string, menuAction: AsyncConsumer<ModalContainer>) {
    let menuItem = this.#menuItems.get(menuName);
    if (!menuItem) {
      menuItem = new ModalMenu(menuAction);
      this.#menuItems.set(menuName, menuItem);
    }
    return menuItem;
  }

  /**
   * 생성된 최상위 메뉴를 가져옵니다.
   * @param menuName 메뉴 이름
   * @returns 대상 메뉴
   */
  getMenu(menuName: string): Nullable<ModalMenu> {
    return this.#menuItems.get(menuName) ?? null;
  }

  /**
   * 생성된 최상위 메뉴를 삭제합니다.
   */
  deleteMenu(menuName: string) {
    this.#menuItems.delete(menuName);
  }
  /**
   * 현재 모달을 표시합니다.
   * @param isDarkTheme 다크 모드 색상 사용 여부
   * @param preSelected 미리 선택할 메뉴
   */
  display(isDarkTheme: boolean, preSelected?: string[]) {
    if (this.__container) {
      return;
    }
    this.close();
    if (preSelected) {
      this.#selectedMenu.length = 0;
      this.#selectedMenu.push(...preSelected);
    }
    this.init(isDarkTheme);
  }

  /**
   * 사전 표시 핸들러를 추가 등록합니다.
   * 사전 표시 핸들러는 모달의 표시 직전에 호출됩니다.
   * @param handler 사전 표시 핸들러
   */
  withPreOpenHandler(handler: Consumer<ModalContainer>) {
    this.#preOpenHandler.push(handler);
  }

  /**
   * 특정 이름의 메뉴의 선택 이벤트를 강제 호출합니다.
   * @param preSelected 선택될 메뉴. 만약 입력되지 않았다면, 현재 선택된 메뉴를 대상으로 합니다.
   */
  triggerSelect(preSelected?: string[]) {
    if (preSelected) {
      if (preSelected.length === 1) {
        this.#menuItems.get(preSelected[0])?.onDisplay(this);
      } else if (preSelected.length === 2) {
        this.#menuItems.get(preSelected[0])?.findMenu(preSelected[1])?.onDisplay(this);
      } else {
        this.#selectedMenu.length = 0;
        preSelected && this.#selectedMenu.push(...preSelected);
      }
    } else {
      this.#selectedMenu.length = 0;
    }
  }

  /**
   * 현재 모달을 닫습니다.
   */
  close() {
    if (this.__container) {
      for (let element of this.closeHandlers.values()) {
        element();
      }
      this.__container.remove();
      this.__container = undefined;
      this.#selectedMenu = [];
    }
  }

  /**
   * 모달을 초기화합니다.
   * @param {boolean} isDarkTheme 다크 테마 색상 적용 여부
   */
  init(isDarkTheme: boolean) {
    for (let handler of this.#preOpenHandler) {
      handler(this);
    }
    this.__container = NodeUtil.setupNode("div", {
      cls: "decentral-modal-container decentral-color-container",
      onInit: (node) => {
        node.id = `decentral-container-${this.baseId}`;
      },
    });
    this.__container.onclick = (e) => {
      e.stopPropagation();
    };
    this.__modal = NodeUtil.setupNode("div", {
      cls: "decentral-modal",
      onInit: (node) => {
        node.id = `decentral-container-${this.baseId}`;
      },
    });
    this.__container.appendChild(this.__modal);
    this.__modal.appendChild((this.__menuPanel = new MenuPanel(this, this.#menuItems, this.#selectedMenu)).asHTML());
    const verticalPanel = NodeUtil.setupNode("div", { cls: "decentral-vertical-container" });
    verticalPanel.appendChild((this.__mobileMenuPanel = new MobileMenuPanel(this, this.#menuItems, this.#selectedMenu)).asHTML());
    verticalPanel.appendChild(
      (this.__contentPanel = new ContentPanel(
        `decentral-content-${this.baseId}`,
        "여기에 텍스트 입력",
        DECENTRAL_DEFAULT_ICON_SVG,
        () => {
          this.__mobileMenuPanel?.open();
        },
        () => {
          this.close();
        },
      )).asHTML(),
    );
    this.__modal.append(verticalPanel);
    this.__container.setAttribute("theme", isDarkTheme ? "dark" : "light");
    document.body.append(this.__container);
    this.__menuPanel.runSelected();
  }

  /**
   *
   * @param lambda
   * @param title 제목
   * @param iconSvg
   */
  replaceContentPanel(lambda: Consumer<ContentPanel>, title: string, iconSvg?: string) {
    const element = document.getElementById(`decentral-content-${this.baseId}`);

    if (element) {
      this.__contentPanel = new ContentPanel(
        `decentral-content-${this.baseId}`,
        title,
        iconSvg ?? DECENTRAL_DEFAULT_ICON_SVG,
        () => {
          this.__mobileMenuPanel?.open();
        },
        () => {
          this.close();
        },
      );
      lambda(this.__contentPanel);
      element.id = "";
      element.parentElement!.insertBefore(this.__contentPanel.asHTML(), element);
      element.remove();
    }
  }

  refreshMenuPanel() {
    const mainMenu = new MenuPanel(this, this.#menuItems, this.#selectedMenu);
    const mobileMenu = new MobileMenuPanel(this, this.#menuItems, this.#selectedMenu);
    this.__menuPanel?.currentMenu()?.parentElement?.insertBefore(mainMenu.asHTML(), this.__menuPanel?.currentMenu()!);
    this.__menuPanel?.currentMenu()?.remove();

    this.__mobileMenuPanel?.currentMenu()?.parentElement?.append(mobileMenu.asHTML(), this.__mobileMenuPanel?.currentMenu()!);
    this.__mobileMenuPanel?.currentMenu()?.remove();

    this.__menuPanel = mainMenu;
    this.__mobileMenuPanel = mobileMenu;
  }
}
