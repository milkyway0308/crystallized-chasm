import { AsyncConsumer, AsyncRunnable, Consumer, Nullable, Runnable } from "../../generic-types";
import { ModalContainer } from "./modal-container";

export type MenuPair = {
  name: string;
  menu: ModalMenu;
};

export class ModalMenu {
  private subMenus = new Map<string, ModalMenu>();

  private readonly action: AsyncConsumer<ModalContainer>;

  private activator?: AsyncRunnable = undefined;

  private activiatorMobile?: AsyncRunnable = undefined;

  /**
   * 새 모달 메뉴를 생성합니다.
   * @param action 모달 메뉴 클릭 / 호출시 실행될 펑션
   */
  constructor(action: AsyncConsumer<ModalContainer>) {
    this.action = action;
  }

  /**
   * 메뉴 표시가 진행될 경우, 해당 펑션이 호출됩니다.
   * @param modal 모달
   */
  async onDisplay(modal: ModalContainer) {
    await this.action(modal);
    if (this.activator) await this.activator();
    if (this.activiatorMobile) await this.activiatorMobile();
  }

  /**
   * 새 서브메뉴를 만듭니다.
   * @param menuName 서브메뉴 이름
   * @param menuAction 서브메뉴 선택시 실행할 람다
   * @returns 현재 메뉴
   */
  createSubMenu(name: string, action: Consumer<ModalContainer>): MenuPair {
    let menuItem = this.subMenus.get(name);
    if (!menuItem) {
      menuItem = new ModalMenu(action);
      this.subMenus.set(name, menuItem);
    }
    return { name, menu: menuItem };
  }

  /**
   * 등록된 메뉴 목록을 반환합니다.
   * @returns 메뉴 목록이 담긴 배열
   */
  listMenus(): MenuPair[] {
    return Array.from(this.subMenus.entries()).map((it) => {
      return { name: it[0], menu: it[1] } satisfies MenuPair;
    });
  }

  /**
   * 지정된 이름에 등록된 메뉴를 반환합니다.
   * @param name 대상 메뉴 이름
   * @returns 등록된 메뉴 혹은 null
   */
  findMenu(name: string): Nullable<ModalMenu> {
    return this.subMenus.get(name) ?? null;
  }

  /**
   * 현재 등록된 메뉴 개수를 반환합니다.
   * 이 펑션은 메뉴에 등록된 서브메뉴의 개수는 세지 않습니다.
   * @returns 등록된 메뉴 개수
   */
  length(): number {
    return this.subMenus.size;
  }

  setActivator(runnable: AsyncRunnable) {
    this.activator = runnable;
  }

  setMobileActivator(runnable: AsyncRunnable) {
    this.setMobileActivator = runnable;
  }
}
