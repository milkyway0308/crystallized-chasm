
export type HTMLComponentConvertable = {
  /**
   * 컴포넌트를 HTML로 변환하여 반환합니다.
   * 해당 펑션에서 반환되는 HTML 요소는 재활용될 수 있으며, 반드시 새 요소가 반환되지 않습니다.
   * @returns 변환된 HTML 컴포넌트
   */
  asHTML() : HTMLElement
}