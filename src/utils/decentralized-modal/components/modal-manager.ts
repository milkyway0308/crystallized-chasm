import { AsyncConsumer, AttachedDocument } from "../../generic-types";
import ModalStyle from "../styles/main.scss?inline";
import { ContentPanel } from "./content-panel";
import { ModalContainer } from "./modal-container";
import { ModalMenu } from "./modal-menu";
import { DECENTRAL_VERSION } from "../constants";
declare function GM_addStyle(css: string): void;

export class ModalManager {
  static doesInit = false;
  static #modalMap = new Map<string, ModalManager>();
  #opener = new Map<string, () => any>();
  #closer = new Map<string, () => any>();
  #licenseAdjusters: ((panel: ContentPanel) => any)[] = [];

  readonly name: string;
  private readonly modal;

  /**
   * 모달 관리자를 초기화합니다.
   */
  static __doInit() {
    if (typeof document === "undefined") {
      throw new Error("Cannot init ModalManager in non-browser environment");
    }
    if (!this.doesInit) {
      this.doesInit = true;
      const globalDoc = document as AttachedDocument<Map<string, ModalManager>>;
      if (!globalDoc.__attached) {
        try {
          GM_addStyle(ModalStyle);
        } catch (ex) {
          console.warn("!! WARNING !!");
          console.warn("!! WARNING !! GM_addStyle 콜에 실패하였습니다.\n브라우저가 아닌 환경에서 decentralized-modal이 초기화되었을 가능성이 존재합니다.\n해당 환경에서는 decentralized-modal.js가 오작동할 가능성이 존재합니다.");
        }
        globalDoc.__attached = this.#modalMap;
      }
      this.#modalMap = globalDoc.__attached;
    }
  }

  /**
   * 등록된 모달 관리자 인스턴스를 반환하거나, 등록되지 않았을 경우 새로 생성하여 등록하고 반환합니다.
   * @param name 모달 관리자 이름
   * @returns 새 모달 매니저
   */
  static getOrCreateManager(name: string): ModalManager {
    this.__doInit();
    if (!this.#modalMap.has(name)) {
      const manager = new ModalManager(name);
      this.#modalMap.set(name, manager);
      return manager;
    }
    // @ts-ignore
    return this.#modalMap.get(name);
  }

  /**
   * 새 모달 관리자 인스턴스를 생성합니다.
   * @param name 모달 클래스 이름. 이 파라미터는 겹치지 않는 값을 선언해야 합니다.
   */
  constructor(name: string) {
    this.name = name;
    this.modal = new ModalContainer(name, this.#closer);
  }

  /**
   * 모달이 열릴 때 발동될 작업을 등록합니다.
   * 이 작업은 모달이 다시 초기화되어도 작동합니다.
   * @param namespace 작업의 고유 키
   * @param action 작업 내역
   * @returns 현재 모달 관리자
   */
  addOpenListener(namespace: string, action: () => any): ModalManager {
    this.#opener.set(namespace, action);
    return this;
  }

  /**
   * 모달이 닫힐때 발동될 작업을 등록합니다.
   * @param namespace 작업의 고유 키
   * @param action 작업 내역
   * @returns 현재 모달 관리자
   */
  addCloseListener(namespace: string, action: () => any): ModalManager {
    this.#opener.set(namespace, action);
    return this;
  }

  /**
   * 모달이 열릴 때, 지정한 요소의 스크롤이 제거되도록 리스너를 추가합니다.
   * 모달이 닫히면 복구됩니다.
   * @param namespace 작업의 고유 키 (열림 / 닫힘)
   * @param element 대상 요소
   * @returns 현재 모달 관리자
   */
  withScrollRestorer(namespace: string, element: HTMLElement): ModalManager {
    this.addOpenListener(namespace, () => {
      element.classList.add("decentral-disable-scroll-flag");
    });
    this.addCloseListener(namespace, () => {
      element.classList.remove("decentral-disable-scroll-flag");
    });
    return this;
  }

  /**
   * 모달을 화면에 표시합니다.
   * @param isDarktheme 다크 테마 색상 적용 여부
   * @param preSelected 미리 선택할 메뉴
   */
  display(isDarktheme: boolean, preSelected?: string[]) {
    for (let element of this.#opener.values()) {
      element();
    }
    this.modal.display(isDarktheme, preSelected);
  }

  /**
   * 현재 열린 모달을 반환합니다.
   * @returns 열린 모달
   */
  getOpened(): ModalContainer {
    return this.modal;
  }

  /**
   * 현재 열린 모달을 강제로 닫습니다.
   */
  close() {
    this.modal.close();
  }

  /**
   * 모달에 새 메뉴를 생성합니다.
   * @param menuName 메뉴 이름
   * @param menuAction 메뉴 클릭시, 수행할 작업
   * @returns 생성된 메뉴 인스턴스
   */
  async createMenu(menuName: string, menuAction: AsyncConsumer<ModalContainer>): Promise<ModalMenu> {
    return await this.modal.createMenu(menuName, menuAction);
  }

  /**
   * 라이선스 구축 컴포넌트를 추가합니다.
   * 라이선스 구축 컴포넌트는 라이선스 메뉴 호출시 순서대로 호출됩니다.
   * @param licenseAppender 라이선스 구축 컴포넌트
   * @returns 현재 모달 관리자
   */
  addLicenseDisplay(licenseAppender: (panel: ContentPanel) => any): ModalManager {
    this.#licenseAdjusters.push(licenseAppender);
    return this;
  }

  /**
   * 현재 모달에 라이선스 크레딧 메뉴를 추가합니다.
   * @param menuName 메뉴 이름. 지정되지 않을 경우, "프레임워크에 대하여"로 기본 설정됩니다.
   * @returns 현재 모달 관리자
   */
  withLicenseCredential(menuName?: string): ModalManager {
    this.createMenu(menuName ?? "프레임워크에 대하여", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel
          .addTitleText(DECENTRAL_VERSION)
          .addText("decentralized.js는 IGX 팀에서 제작되었습니다.")
          .addText("이 프레임워크는 임베딩 가능한 탈중앙화된 모달 프레임워크입니다.")
          .addTitleText("SVG 아이콘 디자인")
          .addText("decentralized.js의 모든 아이콘은 SVGRepo에서 가져왔습니다.")
          .addText("- 설정 아이콘 (https://www.svgrepo.com/svg/458353/setting-line)")
          .addText("- 닫기 아이콘 (https://www.svgrepo.com/svg/494725/close)")
          .addText("- 메뉴 아이콘 (https://www.svgrepo.com/svg/522418/menu)")
          .addText("- 스위치 소스 코드 참조 (https://www.daleseo.com/css-toggle-switch/)");
        for (let adjuster of this.#licenseAdjusters) {
          adjuster(panel);
        }
      }, "decentralized.js");
    });
    return this;
  }
}
