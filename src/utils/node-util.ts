import { Nullable, Undeclarable } from "./generic-types";

export interface AnnotatedContent<Main extends HTMLElement, Suffix extends HTMLElement> {
  title: Nullable<Main>;
  suffix: Nullable<Suffix>;
}

export interface ComplexedAnnotatedContent<Parent extends HTMLElement, Main extends HTMLElement, Suffix extends HTMLElement> extends AnnotatedContent<Main, Suffix> {
  root: Parent;
}

export interface NodeCreateOption {
  text?: string;
  cls?: string;
  style?: string;
}

export interface SetupNodeOption<T extends HTMLElement, R = void> extends NodeCreateOption {
  onInit?: (node: T) => R;
}

export type GridParameter = ComplexedAnnotatedContent<HTMLDivElement, HTMLParagraphElement, HTMLDivElement>;

export type AttributeCompareOption = {
  ignoreNull: boolean;
  name: string;
  first: HTMLElement;
  second: HTMLElement;
};

export class NodeUtil {
  /**
   * 파라미터를 기준으로 새 HTML 요소를 만들어 반환합니다.
   * @param name 태그 이름 (div, p..)
   * @param setupLambda 노드 초기화 람다
   * @returns 생성된 HTML 요소
   * @example
   * // 초기화 람다는 생략할 수 있습니다.
   * const element1 = setupNode("span");
   *
   * const element2 = setupNode("span", (node) => {
   *    node.style.cssText = "color: red;";
   * });
   */
  static setupNode<K extends keyof HTMLElementTagNameMap, R = void>(name: K, { text, cls, style, onInit }: SetupNodeOption<HTMLElementTagNameMap[K], R> = {}): R extends void ? HTMLElementTagNameMap[K] : R {
    const node = document.createElement(name);
    text && (node.textContent = text);
    cls && (node.className = cls);
    style && (node.style.cssText = style);
    if (onInit) {
      const returnValue = onInit(node);
      if (typeof returnValue !== "undefined") {
        return returnValue as any;
      }
    }
    return node as any;
  }

  /**
   * 파라미터를 기준으로 클래스가 적용된 새 HTML 단락 요소를 만들어 반환합니다.
   * @param text 옵션 텍스트
   * @returns 생성된 HTML 요소
   */
  static setupParagraphNode<R = void>(option: SetupNodeOption<HTMLParagraphElement, R> = {}): R extends void ? HTMLParagraphElement : R {
    return this.setupNode("p", option);
  }

  /**
   * 파라미터를 기준으로 클래스가 적용된 새 HTML 단락 요소를 만들어 반환합니다.
   * @param text 옵션 텍스트
   * @returns 생성된 HTML 요소
   */
  static setupOptionNode<R = void>(option: SetupNodeOption<HTMLOptionElement, R> = {}): R extends void ? HTMLOptionElement : R {
    return this.setupNode("option", option);
  }

  /**
   * 지정된 클래스로 생성한 그리드 컴포넌트를 반환합니다.
   * @param className 루트 노드가 사용할 클래스 이름.
   * @param titleText 제목 텍스트. 입력하지 않을 경우, title과 suffix 모두 생성되지 않습니다.
   * @param isLongField 긴 필드를 생성할지의 여부입니다.
   * @param lambda 초기화시 실행할 람다. 첫번째 파라미터는 노드 전체, 두번째 파라미터는 제목 노드, 세변째 파라미터는 수식어 노드(푸터 노드)를 의미합니다.
   * @returns 생성된 HTML 요소
   * @example
   * // 초기화 람다에서 주 요소를 제외한 필요 없는 요소는 생략할 수 있습니다.
   * const element = createGenericGridElement("test-flat", "제목 텍스트", true, ({node}) => {
   *   // 요소의 세부 사항을 조정합니다.
   *   node.style.cssText = "color: red;";
   * });
   */
  static createGenericGridElement<R = void>(className: string, titleText: Nullable<string>, lambda?: (setup: GridParameter) => R): R extends void ? GridParameter : R {
    return this.setupNode("div", {
      cls: className,
      onInit(node) {
        let result;
        if (titleText) {
          const appendNodes = NodeUtil.setupNode("div", {
            cls: "decentral-element-title",
            onInit(elementTitle) {
              const title = NodeUtil.setupNode("div", {
                onInit(node) {
                  const textNode = NodeUtil.setupNode("p", { text: titleText });
                  node.append(textNode);
                  return [node, textNode];
                },
              });
              const suffix = NodeUtil.setupNode("div", { cls: "decentral-element-title-suffix" });
              elementTitle.append(title[0]);
              elementTitle.append(suffix);
              return { title: title[1], suffix: suffix, root: node } as ComplexedAnnotatedContent<HTMLDivElement, HTMLParagraphElement, HTMLDivElement>;
            },
          });
          appendNodes.title && node.append(appendNodes.title);
          result = lambda?.(appendNodes) ?? appendNodes;
        } else {
          const appendNodes = { root: node, title: null, suffix: null } satisfies ComplexedAnnotatedContent<HTMLDivElement, HTMLParagraphElement, HTMLDivElement>;
          result = lambda?.(appendNodes) ?? appendNodes;
        }
        return result;
      },
    }) as any;
  }

  /**
   * 일반 그리드 컴포넌트를 반환합니다.
   * @param titleText 제목 텍스트. 입력하지 않을 경우, title과 suffix 모두 생성되지 않습니다.
   * @param isLongField 긴 필드를 생성할지의 여부입니다.
   * @param lambda 초기화시 실행할 람다.
   * @returns 생성된 HTML 요소
   * @example
   * // 초기화 람다에서 주 요소를 제외한 필요 없는 요소는 생략할 수 있습니다.
   * const element = createGridElement("제목 텍스트", true, ({node}) => {
   *   // 요소의 세부 사항을 조정합니다.
   *   node.style.cssText = "color: red;";
   * });
   */
  static createGridElement<R = void>(titleText: Nullable<string>, isLongField: boolean, lambda?: (setup: GridParameter) => R): R extends void ? GridParameter : R {
    return this.createGenericGridElement(isLongField ? "decentral-grid-element-long" : "decentral-grid-element", titleText, lambda);
  }

  /**
   * 패딩을 최대한 제거한 그리드 컴포넌트를 반환합니다.
   * @param titleText 제목 텍스트. 입력하지 않을 경우, title과 suffix 모두 생성되지 않습니다.
   * @param lambda 초기화시 실행할 람다.
   * @returns 생성된 HTML 요소
   * @example
   * // 초기화 람다에서 주 요소를 제외한 필요 없는 요소는 생략할 수 있습니다.
   * const element = createLongFlatGridElement("제목 텍스트", ({node}) => {
   *   // 요소의 세부 사항을 조정합니다.
   *   node.style.cssText = "color: red;";
   * });
   */
  static createLongFlatGridElement<R = void>(titleText: Nullable<string>, lambda?: (setup: GridParameter) => R): R extends void ? GridParameter : R {
    return this.createGenericGridElement("decentral-grid-element-long-flat", titleText, lambda);
  }

  /**
   * UI를 유지하기 위한 최소한의 패딩만을 포함한 그리드 컴포넌트를 반환합니다.
   * @paramtitleText 제목 텍스트
   * @param lambda 초기화시 실행할 람다.
   * @returns 생성된 HTML 요소
   * @example
   * // 초기화 람다에서 주 요소를 제외한 필요 없는 요소는 생략할 수 있습니다.
   * const element = createLongSemiFlatGridElement("제목 텍스트", ({node}) => {
   *   // 요소의 세부 사항을 조정합니다.
   *   node.style.cssText = "color: red;";
   * });
   */
  static createLongSemiFlatGridElement<R = void>(titleText: Nullable<string>, lambda?: (setup: GridParameter) => R): R extends void ? GridParameter : R {
    return this.createGenericGridElement("decentral-grid-element-long-semi-flat", titleText, lambda);
  }

  /**
   * HTML 기반 요소를 복사해 반환합니다.
   * 반환된 요소는 항상 입력된 요소와 동일한 타입을 갖습니다.
   */
  static clone<T extends Element>(target: T): T {
    return target.cloneNode(true) as T;
  }

  /**
   * 대상의 HTMLElement로 캐스팅된 자식 노드를 반환합니다.
   * 자식 노드는 HTMLElement라는 보장이 없으나, 널체크를 통한 이터레이팅 목적으로는 적합합니다.
   */
  static childs(element: Node): Iterable<HTMLElement> {
    return element.childNodes as Iterable<HTMLElement>;
  }

  static attrEq(ignoreNull: boolean = true, name: string, first: HTMLElement, second: HTMLElement): boolean {
    if (ignoreNull && (!first.hasAttribute(name) || !second.hasAttribute(name))) return false;
    return first.getAttribute(name) === second.getAttribute(name);
  }

  static addCls(element: HTMLElement, ...clss: string[]) {
    for (const cls of clss) {
      element.classList.add(cls);
    }
  }

  static delCls(element: HTMLElement, ...clss: string[]) {
    for (const cls of clss) {
      element.classList.remove(cls);
    }
  }

  static hasCls(element: HTMLElement, ...clss: string[]) {
    for (const cls of clss) {
      if (!element.classList.contains(cls)) return false;
    }
    return true;
  }

  static delAttr(element: HTMLElement, ...attrs: string[]) {
    for (const attr of attrs) {
      element.removeAttribute(attr);
    }
  }

  static isNodeSelected(e: HTMLElement) {
    return (e.parentElement?.querySelectorAll(":hover")?.length ?? 0) > 0;
  }

  static replaceTextIfChanged(e: Undeclarable<Element>, text: string) {
    if (!e) return;
    if (e.textContent !== text) e.textContent = text;
  }
}
