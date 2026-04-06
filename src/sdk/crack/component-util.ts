import { Nullable } from "../../utils/generic-types";

export class CrackComponentApi {
  /**
   *@type {?Element}
   */
  #cached: Nullable<Element> = null;
  /**
   * 크랙 웹 페이지에서 우측 사이드 패널을 추출합니다.
   * 경로에 따라 사이드바가 존재하지 않을 수 있습니다.
   *
   * @returns 추출된 사이드바 요소
   */
  sidePanel(): Nullable<Element> {
    if (this.#cached) return this.#cached;

    const nodeToFind = document.getElementsByTagName("span");
    for (const node of nodeToFind) {
      if (node.textContent === "채팅방 설정") {
        this.#cached = node.parentElement;
        break;
      }
    }
    return this.#cached;
  }
}
