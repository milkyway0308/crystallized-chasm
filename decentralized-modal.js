
// decentralized-modal.js - 탈중앙화된 임베딩 집중 모달 프레임워크
//
// decentrallized-modal.js는 서드 파티 스크립트들을 위한 임베드 가능한 모달 프레임워크입니다.
// 거의 대부분의 커스터마이징을 제공하며, 임베딩된 펑션을 통한 간편한 모달 표시 및 통합이 가능합니다.
// CSS 삽입을 위해 GM_addStyle이 필요합니다.
const DECENTRAL_VERSION = "Decentrallized Modal v1.0.0";

const DECENTRAL_CSS_VALUES = `
    .decentral-modal-container[theme="light"] {
        --decentral-background: #FFFFFF;
        --decentral-border: #666666;
    }
    .decentral-modal-container[theme="dark"] {
        --decentral-background: #212121;
        --decentral-border: #666666;
    }
    .decentral-modal-container {
        display: flex;
        z-index: 999999;
        margin: auto;
        font-family: 'Pretendard';
        background-color: #99999970;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        position: absolute;
    }
    .decentral-modal {
        min-width: 200px;
        max-width: 800px;
        min-height: 480px;
        max-height: 90%;
        width: 80%;
        height: 60%;
        padding: 15px;
        border-radius: 2px;
        background-color: var(--decentral-background); 
        margin: auto;
    }
    .decentral-modal-panel-menu {
        border-right: 1px solid var(--decentral-border);
        display: column;
    }

    .decentral-modal-panel-menu .decentral-menu-element[active="true"] {
        color: var(--decentral-text);
        font-size: 16sp;
    }

    .decentral-modal-panel-menu .decentral-menu-element[active="true"] {
        border-left: 4px solid var(--decentral-active-item);
        font-weight: bold;
    }

    .decentral-modal-mobile-menu {
        display: none;
    }

    .decentral-grid-container {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(2, minmax(350px, 1fr));
        gap: 3em;
        grid-row-gap: 1em;
        grid-auto-rows: min-content;
        height: 450px;
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: 5px;
    }
    .decentral-grid-element {
        display: flex; flex-direction: column; 
        max-width: 100%; 
        height: fit-content;
    }
    .decentral-grid-element-long {
        display: flex;
        flex-direction: column; 
        grid-column: 1 / 3; 
        max-width: 100%; 
        height: fit-content; 
    }
    @media screen and (max-width:900px) {
        .decentral-modal-panel-menu {
            display: none;
        }
            
        .decentral-modal-mobile-menu[active="true"] {
            display: flex;
         }
        .decentral-grid-container {
            grid-template-columns: minmax(250px, 1fr); column-count: 1; 
        }
        .decentral-grid-element {
            grid-column: 1 / 1; 
        }
        .decentral-grid-element-long {
            grid-column: 1 / 1; 
        }
    }
`;

class ModalManager {
  static doesInit = false;
  /** @type {Map<string, ModalManager>} */
  static __modalMap = new Map();

  static __doInit() {
    if (!this.doesInit) {
      this.doesInit = true;
      GM_addStyle(DECENTRAL_CSS_VALUES);
      console.log(DECENTRAL_CSS_VALUES);
      console.log("Adding style");
    }
  }
  /**
   * 등록된 모달 관리자 인스턴스를 반환하거나, 등록되지 않았을 경우 새로 생성하여 등록하고 반환합니다..
   * @param {string} name 모달 관리자 이름
   * @returns {ModalManager} 새 모달 매니저
   */
  static getOrCreateManager(name) {
    this.__doInit();
    if (!this.__modalMap.has(name)) {
      const manager = new ModalManager(name);
      this.__modalMap.set(name, manager);
      return manager;
    }
    return this.__modalMap.get(name);
  }

  /**
   * 새 모달 관리자 인스턴스를 생성합니다.
   * @param {string} name 모달 클래스 이름. 이 파라미터는 겹치지 않는 값을 선언해야 합니다.
   */
  constructor(name) {
    this.name = name;
    this.__modal = new DecentrallizedModal(name);
  }

  /**
   *
   * @param {boolean} isDarktheme
   */
  display(isDarktheme) {
    this.__modal.display(isDarktheme);
  }

  close() {
    this.__modal.close();
  }

  /**
   *
   * @param {string} menuName
   * @param {(modal: DecentrallizedModal) => Promise<any>} menuAction
   * @returns {ModalMenu}
   */
  createMenu(menuName, menuAction) {
    let menuItem = this.__modal.__menuItems.get(menuName);
    if (!menuItem) {
      menuItem = new ModalMenu(menuAction);
      this.__modal.__menuItems.set(menuName, menuItem);
    }
    return menuItem;
  }
}

class ModalMenu {
  /** @type {Map<string, SubModalMenu>} */
  __subMenus = new Map();

  /**
   *
   * @param {async (modal: DecentrallizedModal) => any} action
   */
  constructor(action) {
    this.action = action;
  }

  /**
   *
   * @param {DecentrallizedModal} modal
   */
  async onDisplay(modal) {
    this.action(modal);
  }

  /**
   *
   * @param {string} menuName
   * @param {(modal: DecentrallizedModal) => any} menuAction
   * @returns {ModalMenu}
   */
  createSubMenu(menuName, menuAction) {
    let menuItem = this.__modal.__menuItems.get(menuName);
    if (!menuItem) {
      menuItem = new ModalMenu(menuAction);
      this.__modal.__menuItems.set(menuName, menuItem);
    }
    return menuItem;
  }
}

class SubModalMenu extends ModalMenu {}

class HTMLComponentConvertable {
  /**
   * @returns {HTMLElement}
   */
  asHTML() {
    return document.createElement("div");
  }
}
class DecentrallizedModal {
  /** @type {Map<string, ModalMenu>} */
  __menuItems = new Map();

  /** @type {HTMLElement} */
  __container;

  /** @type {HTMLElement} */
  __modal;

  /** @type {HTMLElement} */
  __menuPanel;

  /** @type {HTMLElement} */
  __mobileMenuPanel;

  /** @type {HTMLElement} */
  __contentPanel;

  /**
   *
   * @param {string} baseId
   */
  constructor(baseId) {
    this.baseId = baseId;
  }

  getVersion() {
    return DECENTRAL_VERSION;
  }

  /**
   *
   * @param {isDarkTheme} isDarkTheme
   * @returns
   */
  display(isDarkTheme) {
    if (this.__container) {
      return;
    }
    this.close();
    this.init(isDarkTheme);
    document.body.append(this.__container);
  }

  close() {
    if (this.__container) {
      this.__container.remove();
      this.__container = undefined;
    }
  }

  /**
   *
   * @param {boolean} isDarkTheme
   * @returns
   */
  init(isDarkTheme) {
    this.__container = setupClassNode(
      "div",
      "decentral-modal-container",
      (node) => {
        node.id = `decentral-container-${this.baseId}`;
      }
    );
    this.__modal = setupClassNode("div", "decentral-modal", (node) => {
      node.id = `decentral-container-${this.baseId}`;
    });
    this.__container.appendChild(this.__modal);
    this.__modal.appendChild((this.__menuPanel = new MenuPanel()).asHTML());
    this.__modal.appendChild(
      (this.__mobileMenuPanel = new MobileMenuPanel()).asHTML()
    );
    this.__modal.appendChild(
      (this.__contentPanel = new ContentPanel()).asHTML()
    );
    this.__container.setAttribute("theme", isDarkTheme ? "dark" : "light");
    return this.__container;
  }
}

class MenuPanel extends HTMLComponentConvertable {
  /**
   *
   * @param {DecentrallizedModal} modal
   * @param {Map<string, ModalMenu>} menus
   */
  constructor(modal, menus) {
    /** @type {Map<string, ModalMenu>} */
    this.menus = menus;
    this.modal = modal;
  }
  asHTML() {
    const container = setupClassNode("div", "decentral-menu-container");
    for (let item in this.menus) {
      const menuItem = this.menus.get(item);
      const menuContainer = document.createElement("div");
      menuContainer.appendChild(
        setupClassNode("span", "decentral-menu-element", (node) => {
          node.textContent = item;
          node.onclick = () => {
            menuItem.onDisplay(this.modal);
          };
        })
      );
      if (menuItem.__subMenu.size > 0) {
        const subMenuContainer = setupClassNode(
          "div",
          "decentral-submenu-container"
        );
        for (let subItem in menuItem.__subMenu) {
          const subMenuItem = menuItem.__subMenu.get(subItem);
          subMenuContainer.appendChild(
            setupClassNode("span", "decentral-sub-menu-element", (node) => {
              node.textContent = subItem;
              node.onclick = () => {
                subMenuItem.onDisplay(this.modal);
              };
            })
          );
          menuContainer.append(subMenuContainer);
        }
      }
      container.append(menuContainer);
    }
    return container;
  }
}

class MobileMenuPanel extends HTMLComponentConvertable {
  /**
   *
   * @param {DecentrallizedModal} modal
   * @param {Map<string, ModalMenu>} menus
   */
  constructor(modal, menus) {
    /** @type {Map<string, ModalMenu>} */
    this.menus = menus;
    this.modal = modal;
  }
  asHTML() {
    const container = setupClassNode("div", "decentral-mobile-menu-container");
    for (let item in this.menus) {
      const menuItem = this.menus.get(item);
      const menuContainer = document.createElement("div");
      menuContainer.appendChild(
        setupClassNode("span", "decentral-menu-element", (node) => {
          node.textContent = item;
          node.onclick = () => {
            menuItem.onDisplay(this.modal);
          };
        })
      );
      if (menuItem.__subMenu.size > 0) {
        const subMenuContainer = setupClassNode(
          "div",
          "decentral-sub-menu-container"
        );
        for (let subItem in menuItem.__subMenu) {
          const subMenuItem = menuItem.__subMenu.get(subItem);
          subMenuContainer.appendChild(
            setupClassNode("span", "decentral-sub-menu-element", (node) => {
              node.textContent = subItem;
              node.onclick = () => {
                subItem.onDisplay(this.modal);
              };
            })
          );
          menuContainer.append(subMenuContainer);
        }
      }
      container.append(menuContainer);
    }
    return container;
  }
}

class ContentPanel extends HTMLComponentConvertable {}

class TitleComponent extends HTMLComponentConvertable {}

class ContentComponent extends HTMLComponentConvertable {}

// =================================================
//                 노드 생성 유틸리티
// =================================================
/**
 * 파라미터를 기준으로 클래스가 적용된 새 HTML 단락 요소를 만들어 반환합니다.
 * @param {string} text 옵션 텍스트
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupParagraphNode(text, setupLambda) {
  const node = document.createElement("p");
  node.textContent = text;
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 클래스가 적용된 새 HTML 옵션 요소를 만들어 반환합니다.
 * @param {string} text 옵션 텍스트
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupOptionNode(text, setupLambda) {
  const node = document.createElement("option");
  node.textContent = text;
  if (cls) {
    node.className = cls;
  }
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 클래스가 적용된 새 HTML 옵션 요소를 만들어 반환합니다.
 * @param {string} text 옵션 텍스트
 * @param {string|undefined} cls 클래스
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupClassOptionNode(text, cls, setupLambda) {
  const node = document.createElement("li");
  node.textContent = text;
  if (cls) {
    node.className = cls;
  }
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 클래스가 적용된 새 HTML 옵션 요소를 만들어 반환합니다.
 * @param {string} text 옵션 텍스트
 * @param {string|undefined} cls 클래스
 * @param {string|undefined} style 인라인 스타일
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupFullOptionNode(text, cls, style, setupLambda) {
  const node = document.createElement("option");
  node.textContent = text;
  if (cls) {
    node.className = cls;
  }
  if (style) {
    node.style.cssText = style;
  }
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 새 HTML 요소를 만들어 반환합니다.
 * @param {string} name 태그 이름 (div, p..)
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupNode(name, setupLambda) {
  const node = document.createElement(name);
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 클래스가 적용된 새 HTML 요소를 만들어 반환합니다.
 * @param {string} name 태그 이름 (div, p..)
 * @param {string|undefined} cls 클래스
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupClassNode(name, cls, setupLambda) {
  const node = document.createElement(name);
  if (cls) {
    node.className = cls;
  }
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 인라인 스타일이 적용된 새 HTML 요소를 만들어 반환합니다.
 * @param {string} name 태그 이름 (div, p..)
 * @param {string|undefined} style 인라인 스타일
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupStyleNode(name, style, setupLambda) {
  const node = document.createElement(name);
  if (style) {
    node.style.cssText = style;
  }
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 * 파라미터를 기준으로 클래스와 인라인 스타일이 적용된 새 HTML 요소를 만들어 반환합니다.
 * @param {string} name 태그 이름 (div, p..)
 * @param {string|undefined} cls 클래스
 * @param {string|undefined} style 인라인 스타일
 * @param {((node: HTMLElement) => any) | undefined} setupLambda 노드 초기화 람다
 * @returns {HTMLElement} 생성된 HTML 요소
 */
function setupFullNode(name, cls, style, setupLambda) {
  const node = document.createElement(name);
  if (cls) {
    node.className = cls;
  }
  if (style) {
    node.style.cssText = style;
  }
  if (setupLambda) {
    setupLambda(node);
  }
  return node;
}

/**
 *
 * @param {string} titleText
 * @param {((node: HTMLElement, title: HTMLElement | undefined) => any) | undefined} lambda
 */
function createGridElement(titleText, lambda) {
  return setupClassNode("div", "chasm-ignt-grid-element", (node) => {
    if (titleText) {
      const title = setupClassNode(
        "div",
        "chasm-ignt-element-title",
        (elementTitle) => {
          elementTitle.append(
            setupNode("p", (node) => {
              node.textContent = titleText;
            })
          );
        }
      );
      node.append(title);
      lambda(node, title);
    } else {
      lambda(node, undefined);
    }
  });
}

/**
 *
 * @param {string | undefined} titleText
 * @param {((node: HTMLElement, title: HTMLElement | undefined) => any) | undefined} lambda
 */
function createLongGridElement(titleText, lambda) {
  return setupClassNode("div", "chasm-ignt-grid-element-long", (node) => {
    if (titleText) {
      const title = setupClassNode(
        "div",
        "chasm-ignt-element-title",
        (elementTitle) => {
          elementTitle.append(
            setupNode("p", (node) => {
              node.textContent = titleText;
            })
          );
        }
      );
      node.append(title);
      if (lambda) {
        lambda(node, title);
      }
    } else {
      if (lambda) {
        lambda(node, undefined);
      }
    }
  });
}
