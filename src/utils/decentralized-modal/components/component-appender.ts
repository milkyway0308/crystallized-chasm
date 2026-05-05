import { Consumer, Nullable, Runnable } from "../../generic-types";
import { GridParameter, NodeUtil } from "../../node-util";
import { DECENTRAL_ARROW_ICON_SVG } from "../constants";
import { HTMLComponentConvertable } from "../types";

/**
 * 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 * @template T 컴포넌트 노드의 타입
 */
export interface ComponentOption<T> {
  /** 컴포넌트가 초기화될 때 호출되는 함수입니다. */
  onInit?: (node: T) => void;
}

/**
 * 트리거 가능한 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 * @template T 컴포넌트 노드의 타입
 */
export interface TriggerableComponentOption<T> extends ComponentOption<T> {
  /** 컴포넌트가 트리될 때 호출되는 함수입니다. */
  onTrigger?: (node: T) => void;
}

/**
 * 상위 컴포넌트가 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 * @template Parent 상위 컴포넌트의 타입
 * @template T 컴포넌트 노드의 타입
 */
export interface ComplexComponentOption<Parent, T> {
  /** 컴포넌트가 초기화될 때 호출되는 함수입니다. */
  onInit?: (node: T, parent: Parent) => void;
}
/**
 * 트리거 가능한 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 * @template T 컴포넌트 노드의 타입
 */
export interface ComplexedTriggerableComponentOption<Parent, T> extends Omit<TriggerableComponentOption<T>, "onInit">, ComplexComponentOption<Parent, T> {}

/**
 * 입력값이 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 * @template T 컴포넌트 노드의 타입
 * @template Data 입력값의 타입
 */
export interface ValuedComponentOption<T, Data> extends ComponentOption<T> {
  /** 컴포넌트가 초기화될 때 지정될 기본 값입니다. */
  defaultValue: Data;
}

/**
 * 변화 가능한 입력값이 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 */
export interface MutableValuedComponentOption<T, Data> extends ValuedComponentOption<T, Data> {
  /** 파라미터의 입력값이 변경될 때 호출됩니다. */
  onChange: (value: Data, node: T) => void;
}

/**
 * 입력값이 존재하고, 상위 컴포넌트가 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 */
export interface ValuedComplexComponentOption<Parent, T, Data> extends ComplexComponentOption<Parent, T> {
  /** 컴포넌트가 초기화될 때 지정될 기본 값입니다. */
  defaultValue: Data;
}

/**
 * 변화 가능한 입력값이 존재하며, 상위 컴포넌트가 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 */
export interface MutableValuedComplexComponentOption<Parent, T, Data> extends ValuedComplexComponentOption<Parent, T, Data> {
  /** 파라미터의 입력값이 변경될 때 호출됩니다. */
  onChange: (value: Data, node: T, parent: Parent) => void;
}

/**
 * 헤더 및 푸터가 존재할 수 있고,상위 컴포넌트가 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 */
export interface AnnotatedComplexComponentOption<Parent, T> extends ComplexComponentOption<Parent, T> {
  onInit?: (node: T, parent: Parent, prefix?: Nullable<HTMLElement>, suffix?: Nullable<HTMLElement>) => void;
}

/**
 * 헤더 및 푸터가 존재할 수 있고, 입력값이 존재하고, 상위 컴포넌트가 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 */
export interface AnnotatedValuedComplexComponentOption<Parent, T, Data> extends ValuedComplexComponentOption<Parent, T, Data> {
  onInit?: (node: T, parent: Parent, prefix?: Nullable<HTMLElement>, suffix?: Nullable<HTMLElement>) => void;
}

/**
 * 헤더 및 푸터가 존재할 수 있고, 변화 가능한 입력값이 존재하고, 상위 컴포넌트가 존재하는 컴포넌트들에 대해 표준적인 옵션 파라미터입니다.
 */
export interface AnnotatedMutableValuedComplexComponentOption<Parent, T, Data> extends AnnotatedValuedComplexComponentOption<Parent, T, Data> {
  /** 파라미터의 입력값이 변경될 때 호출됩니다. */
  onChange: (value: Data, node: T, parent: Parent, prefix?: Nullable<HTMLElement>, suffix?: Nullable<HTMLElement>) => void;
}

export type RangedOption<T> = { min: T; max: T };
export type DivParentOption<T> = ComplexComponentOption<HTMLDivElement, T>;

export type MutableValuedDivParentOption<T, Data> = MutableValuedComplexComponentOption<HTMLDivElement, T, Data>;

export type AnnotatedMutableValuedDivParentOption<T, Data> = AnnotatedMutableValuedComplexComponentOption<HTMLDivElement, T, Data>;

export type VerifiableElement = HTMLElement & { onVerifyChange?: Runnable };

export type ClickableElement = HTMLElement & { onclick?: () => void };

export class ComponentAppender {
  protected readonly parentElement: HTMLElement;
  /**
   * 새 ComponentAppender을 생성합니다.
   * @param parentElement 필드를 삽입할 부모 요소.
   */
  constructor(parentElement: HTMLElement) {
    this.parentElement = parentElement;
  }

  /**
   * 필드에 새 그리드 요소를 삽입합니다.
   * 이 그리드 요소는 모달의 길이에 따라 한 행에 최대 2개가 존재할 수 있습니다.
   * @param titleText 그리드 제목. undefined일 경우, 제목이 생략됩니다.
   * @param isLongField 긴 필드를 사용할지의 여부. 긴 필드는 한 행에 최대 1개, 짧은 필드는 최대 2개가 존재할 수 있습니다.
   * @param lambda 초기화 람다. 첫번째 필드는 생성된 노드, 두번째 노드는 제목 노드를 의미합니다.
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addGrid(titleText: Nullable<string>, isLongField: boolean, lambda: (setup: GridParameter) => void): ComponentAppender {
    this.parentElement.appendChild(NodeUtil.createGridElement(titleText, isLongField, lambda).root);
    return this;
  }

  /**
   * 제목 포맷의 텍스트를 추가합니다.
   * @param text 텍스트 내용
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addTitleText(text: string, { onInit }: ComponentOption<HTMLParagraphElement> = {}): ComponentAppender {
    this.parentElement.append(
      NodeUtil.createLongFlatGridElement(null, (node) => {
        node.root.append(
          NodeUtil.setupNode("p", {
            cls: "decentral-text-title",
            onInit: (textNode) => {
              textNode.innerText = text;
              onInit?.(textNode);
            },
          }),
        );
      }).root,
    );
    return this;
  }

  /**
   * 제목 포맷의 텍스트를 추가합니다.
   * @param text 텍스트 내용
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addText(text: string, { onInit }: DivParentOption<HTMLParagraphElement> = {}): ComponentAppender {
    this.parentElement.append(
      NodeUtil.createLongFlatGridElement(null, (node) => {
        const paragraphNode = NodeUtil.setupNode("p", {
          cls: "decentral-text-plain",
          text: text,
          onInit: (textNode) => {
            onInit?.(node.root, textNode);
          },
        });
        node.root.append(paragraphNode);
      }).root,
    );
    return this;
  }
  /**
   * 이름과 필드를 쌍으로 가지는 입력 필드를 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param titleText 필드의 텍스트 제목
   * @param isLongField 긴 필드를 사용할지의 여부. 긴 필드는 한 행에 최대 1개, 짧은 필드는 최대 2개가 존재할 수 있습니다.
   * @param param 옵션 파라미터
   * @returns 생성된 입력 필드 요소 (input[type=text])
   */
  constructInputGrid(id: string, titleText: string, isLongField: boolean, { defaultValue, onInit, onChange }: AnnotatedMutableValuedDivParentOption<HTMLInputElement, string>): HTMLInputElement {
    const grid = NodeUtil.createGridElement(titleText, isLongField);

    let inputNode = NodeUtil.setupNode("input", {
      cls: "decentral-text-field decentral-modifiable-component",
      onInit: (inputField) => {
        inputField.id = id;
        inputField.setAttribute("type", "text");
        if (defaultValue) {
          inputField.value = defaultValue;
        }
        if (onChange) {
          let lastValue = inputField.value;
          inputField.onchange = () => {
            lastValue = inputField.value;
            onChange(inputField.value, inputField, grid.root, grid.title, grid.suffix);
          };

          (inputField as VerifiableElement).onVerifyChange = () => {
            if (lastValue != inputField.value) {
              lastValue = inputField.value;
              onChange(inputField.value, inputField, grid.root, grid.title, grid.suffix);
            }
          };
        }
      },
    });
    grid.root.append(inputNode);
    this.parentElement.append(grid.root);
    onInit?.(inputNode, grid.root, grid.title, grid.suffix);
    return inputNode;
  }

  /**
   * 이름과 필드를 쌍으로 가지는 입력 필드를 추가합니다.
   * @param id 필드의 ID
   * @param titleText 필드의 텍스트 제목
   * @param isLongField 긴 필드를 사용할지의 여부. 긴 필드는 한 행에 최대 1개, 짧은 필드는 최대 2개가 존재할 수 있습니다.
   * @param option 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addInputGrid(id: string, titleText: string, isLongField: boolean, option: AnnotatedMutableValuedDivParentOption<HTMLInputElement, string>): ComponentAppender {
    this.constructInputGrid(id, titleText, isLongField, option);
    return this;
  }
  /**
   * 이름과 필드를 쌍으로 가지는 텍스트에이리어 필드를 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param titleText 필드의 텍스트 제목
   * @param param 옵션 파라미터
   * @returns 생성된 텍스트에이리어 요소 (testarea)
   */
  constructTextAreaGrid(id: string, titleText: string, { defaultValue, onInit, onChange }: AnnotatedMutableValuedDivParentOption<HTMLTextAreaElement, string>): HTMLTextAreaElement {
    const grid = NodeUtil.createGridElement(titleText, true);
    let textAreaNode = NodeUtil.setupNode("textarea", {
      cls: "decentral-text-area decentral-modifiable-component",
      onInit: (area) => {
        area.id = id;
        defaultValue && (area.value = defaultValue);
        if (onChange) {
          let lastValue = area.value;
          area.onchange = () => {
            onChange(lastValue, area, grid.root, grid.title, grid.suffix);
          };
          (area as VerifiableElement).onVerifyChange = () => {
            if (lastValue != area.value) {
              lastValue = area.value;
              onChange(lastValue, area, grid.root, grid.title, grid.suffix);
            }
          };
        }
      },
    });
    grid.root.append(textAreaNode);
    this.parentElement.append(grid.root);
    onInit?.(textAreaNode, grid.root, grid.title, grid.suffix);
    return textAreaNode;
  }

  /**
   * 이름과 필드를 쌍으로 가지는 텍스트에이리어 필드를 추가하고 반환합니다.
   * @param {string} id 필드의 ID
   * @param {string} titleText 필드의 텍스트 제목
   * @param {string} description 필드의 설명
   * @param {WrappedMutableComponentParameter<string>} [param] 옵션 파라미터
   * @returns {HTMLElement} 생성된 텍스트에이리어 요소 (textarea)
   */
  constructBoxedTextAreaGrid(id: string, titleText: string, description: string, { defaultValue, onInit, onChange }: MutableValuedComplexComponentOption<HTMLDivElement, HTMLTextAreaElement, string>) {
    const grid = this.constructLongBoxedField(titleText, description);
    let textAreaNode = NodeUtil.setupNode("textarea", {
      cls: "decentral-text-area decentral-modifiable-component",
      onInit: (area) => {
        area.id = id;
        defaultValue && (area.value = defaultValue);
        if (onChange) {
          let lastValue = area.value;
          area.onchange = () => {
            onChange?.(lastValue, area, grid);
          };
          (area as VerifiableElement).onVerifyChange = () => {
            if (lastValue != area.value) {
              lastValue = area.value;
              onChange?.(lastValue, area, grid);
            }
          };
        }
      },
    });
    grid.append(textAreaNode);
    this.parentElement.append(grid);
    onInit?.(textAreaNode, grid);
    return textAreaNode;
  }

  /**
   * 이름과 필드를 쌍으로 가지는 텍스트에이리어 필드를 추가합니다.
   * @param id 필드의 ID
   * @param titleText 필드의 텍스트 제목
   * @param param 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addTextAreaGrid(id: string, titleText: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLTextAreaElement, string>) {
    this.constructTextAreaGrid(id, titleText, option);
    return this;
  }

  /**
   * 이름과 필드를 쌍으로 가지는 편집 불가능한 텍스트에이리어 필드를 추가하고 반환합니다.
   * 이 필드는 일반 텍스트에이리어보다 높이가 더 높습니다.
   * @param id 필드의 ID
   * @param titleText 필드의 텍스트 제목
   * @param param 옵션 파라미터
   * @returns 생성된 텍스트에이리어 요소(textarea)
   */
  constructLoggingArea(id: string, titleText: string, { defaultValue, onInit }: AnnotatedValuedComplexComponentOption<HTMLDivElement, HTMLTextAreaElement, string>): HTMLTextAreaElement {
    const textNode = NodeUtil.setupNode("textarea", {
      cls: "decentral-logging-area",
      onInit: (area) => {
        area.id = id;
        area.setAttribute("readonly", "true");
        defaultValue && (area.value = defaultValue);
      },
    });
    this.parentElement.append(
      NodeUtil.createGridElement(titleText, true, ({ root, title, suffix }) => {
        root.append(textNode);
        onInit?.(textNode, root, title, suffix);
      }).root,
    );
    return textNode;
  }

  /**
   * 이름과 필드를 쌍으로 가지는 편집 불가능한 텍스트에이리어 필드를 추가합니다.
   * 이 필드는 일반 텍스트에이리어보다 높이가 더 높습니다.
   * @param id 필드의 ID
   * @param titleText 필드의 텍스트 제목
   * @param param 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addLoggingArea(id: string, titleText: string, { defaultValue, onInit }: AnnotatedValuedComplexComponentOption<HTMLDivElement, HTMLTextAreaElement, string>): ComponentAppender {
    this.constructLoggingArea(id, titleText, {
      defaultValue: defaultValue,
      onInit: onInit,
    });
    return this;
  }

  /**
   * 클릭 가능한 버튼을 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param titleText 버튼의 텍스트
   * @param description 버튼 설명
   * @param param 옵션 파라미터
   * @returns 생성된 버튼 요소
   */
  addBoxedButton(id: string, titleText: string, description: string, { onInit, onTrigger }: ComplexedTriggerableComponentOption<HTMLDivElement, HTMLButtonElement> = {}) {
    const rootNode = this.constructBoxedField(titleText, description, {
      onInit: (node) => {
        node.append(buttonNode);
      },
    });
    const buttonNode = NodeUtil.setupNode("button", {
      cls: "decentral-button",
      onInit: (button) => {
        button.id = id;
        button.innerText = titleText;
        onInit?.(button, rootNode);
        if (onTrigger) {
          button.onclick = () => {
            onTrigger(button);
          };
        }
      },
    });

    return buttonNode;
  }

  /**
   * 클릭 가능한 버튼을 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param titleText 버튼의 텍스트
   * @param short 짧은 버튼 생성 여부
   * @param param 옵션 파라미터
   * @returns 생성된 버튼 요소
   */
  constructButton(id: string, titleText: string, short: boolean, { onInit, onTrigger }: ComplexedTriggerableComponentOption<HTMLDivElement, HTMLButtonElement> = {}): HTMLElement {
    const rootNode = NodeUtil.createGridElement(null, !short, (node) => {
      node.root.append(buttonNode);
    });
    const buttonNode = NodeUtil.setupNode("button", {
      cls: "decentral-button",
      onInit: (button) => {
        button.id = id;
        button.innerText = titleText;
        onInit?.(button, rootNode.root);
        if (onTrigger) {
          button.onclick = () => {
            onTrigger(button);
          };
        }
      },
    });
    return buttonNode;
  }

  /**
   * 클릭 가능한 짧은 버튼을 추가합니다.
   * @param id 필드의 ID
   * @param titleText 버튼의 텍스트
   * @param parameter 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addShortButton(id: string, titleText: string, { onInit, onTrigger }: ComplexedTriggerableComponentOption<HTMLDivElement, HTMLButtonElement> = {}): ComponentAppender {
    this.constructButton(id, titleText, true, {
      onInit: onInit,
      onTrigger: onTrigger,
    });
    return this;
  }
  /**
   * 클릭 가능한 버튼을 추가합니다.
   * @param id 필드의 ID
   * @param titleText 버튼의 텍스트
   * @param parameter 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addButton(id: string, titleText: string, option: ComplexedTriggerableComponentOption<HTMLDivElement, HTMLButtonElement> = {}): ComponentAppender {
    this.constructButton(id, titleText, false, option);
    return this;
  }

  /**
   * 박스로 감싸진 필드를 추가합니다.
   * @param title 필드의 ID
   * @param description 제목 텍스트
   * @param parameter 옵션 파라미터
   * @returns 생성된 필드
   */
  constructBoxedField(title: string, description: string, { onInit }: ComplexComponentOption<HTMLDivElement, HTMLDivElement> = {}): HTMLDivElement {
    const [root, inputNode] = NodeUtil.createLongSemiFlatGridElement(null, (grid) => {
      const [boxNode, inputNode] = NodeUtil.setupNode("div", {
        cls: "decentral-boxed-field",
        onInit: (boxNode) => {
          const textContainerNode = NodeUtil.setupNode("div", { cls: "element-text-container" });
          const titleNode = NodeUtil.setupNode("p", {
            cls: "element-title",
            text: title,
          });
          const descriptionNode = NodeUtil.setupNode("p", {
            cls: "element-description",
            text: description,
          });
          const inputNode = NodeUtil.setupNode("div", {
            cls: "element-input-container",
            onInit: (container) => {
              onInit?.(container, boxNode);
            },
          });
          textContainerNode.append(titleNode, descriptionNode);
          boxNode.append(textContainerNode, inputNode);
          return [boxNode, inputNode];
        },
      });
      grid.root.append(boxNode);
      return [grid.root, inputNode];
    });
    this.parentElement.append(root);
    return inputNode;
  }

  /**
   * 박스로 감싸진 필드를 추가합니다.
   * @param title 필드의 ID
   * @param description 제목 텍스트
   * @param parameter 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addBoxedField(title: string, description: string, option: ComplexComponentOption<HTMLDivElement, HTMLDivElement> = {}) {
    return this.constructBoxedField(title, description, option);
  }

  /**
   * 박스로 감싸진 긴 블럭을 추가합니다. 이 펑션으로 추가된 블럭에는 추가 컴포넌트가 제공되지 않습니다.
   * @param padded 추가 수평 패딩 적용 여부
   * @param parameter 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addLongBox(padded: boolean, { onInit }: ComplexComponentOption<HTMLDivElement, HTMLDivElement> = {}) {
    this.parentElement.append(
      NodeUtil.createLongSemiFlatGridElement(null, (node) => {
        node.root.append(
          NodeUtil.setupNode("div", {
            cls: padded ? "decentral-padded-boxed-field" : "decentral-boxed-field",
            onInit: (boxNode) => onInit?.(boxNode, node.root),
          }),
        );
      }).root,
    );
    return this;
  }

  /**
   * 박스로 감싸진 긴 필드를 추가합니다.
   * @param title 필드의 제목
   * @param description 제목 텍스트
   * @param option 옵션 파라미터
   * @returns 생성된 요소
   */
  constructLongBoxedField(title: string, description: string, { onInit }: AnnotatedComplexComponentOption<HTMLDivElement, HTMLDivElement> = {}): HTMLDivElement {
    const nodeCreated = NodeUtil.createLongSemiFlatGridElement(null, (node) => {
      node.root.append(
        NodeUtil.setupNode("div", {
          cls: "decentral-boxed-field",
          onInit: (area) => {
            area.append(
              NodeUtil.setupNode("div", {
                cls: "element-text-container-full",
                onInit: (field) => {
                  const titleNode = NodeUtil.setupParagraphNode({
                    cls: "element-title",
                    text: title,
                  });
                  const descriptionNode = NodeUtil.setupParagraphNode({
                    cls: "element-description",
                    text: description,
                  });
                  field.append(titleNode, descriptionNode);
                  field.append(
                    NodeUtil.setupNode("div", {
                      cls: "element-input-container-long",
                      onInit: (node) => {
                        onInit?.(node, area, null, null);
                      },
                    }),
                  );
                },
              }),
            );
          },
        }),
      );
    });
    this.parentElement.append(nodeCreated.root);
    return nodeCreated.root;
  }

  /**
   * 박스로 감싸진 스위치 형태의 체크박스 필드를 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param param 옵션 파라미터
   * @returns 생성된 스위치 요소 (input[type=checkbox])
   */
  constructSwitchBox(id: string, title: string, description: string, { defaultValue, onChange, onInit }: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, boolean>) {
    const rootNode = this.constructBoxedField(title, description, {});
    const inputWrapperNode = NodeUtil.setupNode("div", { cls: "element-input-container" });
    let inputNode = NodeUtil.setupNode("input", {
      cls: "element-switch decentral-modifiable-component",
      onInit: (switcher) => {
        switcher.id = id;
        switcher.setAttribute("type", "checkbox");
        switcher.setAttribute("role", "switch");
        switcher.checked = defaultValue;
        onInit?.(switcher, inputWrapperNode);
        if (onChange) {
          let lastValue = switcher.checked;
          switcher.onchange = () => {
            onChange(switcher.checked, switcher, inputWrapperNode);
          };
          (switcher as VerifiableElement).onVerifyChange = () => {
            if (lastValue != switcher.checked) {
              lastValue = switcher.checked;
              onChange(lastValue, switcher, inputWrapperNode);
            }
          };
        }
      },
    });
    inputWrapperNode.append(inputNode);
    rootNode.append(inputWrapperNode);

    return inputNode;
  }

  /**
   * 박스로 감싸진 스위치 형태의 체크박스 필드를 추가합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param param 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addSwitchBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, boolean>): ComponentAppender {
    this.constructSwitchBox(id, title, description, option);
    return this;
  }

  /**
   * 박스로 감싸진 숫자 입력 필드를 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param type 길이 타입 (0 / 1 / 2)
   * @returns 생성된 숫자 필드 (input[type=number])
   */
  __addNumberBox(id: string, title: string, description: string, type: 0 | 1 | 2, { defaultValue = 0, min, max, onInit, onChange }: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): HTMLInputElement {
    const rootNode = this.constructBoxedField(title, description);
    let inputNode = NodeUtil.setupNode("div", {
      cls: "element-input-container",
      onInit: (container) => {
        const inputNode = NodeUtil.setupNode("input", {
          cls: (type === 0 ? "element-small-input" : type === 1 ? "element-medium-input" : "element-large-input") + " decentral-modifiable-component",
          onInit: (inputField) => {
            inputField.id = id;
            inputField.setAttribute("type", "number");
            inputField.setAttribute("min", min.toString());
            inputField.setAttribute("max", max.toString());
            inputField.value = `${defaultValue ?? 0}`;
            onInit?.(inputField, rootNode);
            if (onChange) {
              let lastValue = inputField.value;
              inputField.onchange = () => {
                onChange(parseInt(inputField.value), inputField, rootNode);
              };
              (inputField as VerifiableElement).onVerifyChange = () => {
                if (lastValue != inputField.value) {
                  lastValue = inputField.value;
                  onChange(parseInt(lastValue), inputField, rootNode);
                }
              };
            }
          },
        });
        container.append(inputNode);
        return inputNode;
      },
    });
    rootNode.append(inputNode);

    return inputNode;
  }
  /**
   * 박스로 감싸진 숫자 입력 필드를 추가하고 반환합니다. 최대 3자리 숫자에 적합합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 생성된 숫자 필드 (input[type=number])
   */
  constructShortNumberBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): HTMLInputElement {
    return this.__addNumberBox(id, title, description, 0, option);
  }

  /**
   * 박스로 감싸진 숫자 입력 필드를 추가합니다. 최대 3자리 숫자에 적합합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addShortNumberBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): ComponentAppender {
    this.constructShortNumberBox(id, title, description, option);
    return this;
  }

  /**
   * 박스로 감싸진 숫자 입력 필드를 추가하고 반환합니다. 최대 6자리 숫자에 적합합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 생성된 숫자 필드 (input[type=number])
   */
  constructMediumNumberBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): HTMLInputElement {
    return this.__addNumberBox(id, title, description, 1, option);
  }

  /**
   * 박스로 감싸진 숫자 입력 필드를 추가합니다. 최대 6자리 숫자에 적합합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addMediumNumberBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): ComponentAppender {
    this.constructMediumNumberBox(id, title, description, option);
    return this;
  }

  /**
   * 박스로 감싸진 긴 숫자 입력 필드를 추가하고 반환합니다. 최대 12자리 숫자에 적합합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 생성된 숫자 필드 (input[type=number])
   */
  constructNumberBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): HTMLInputElement {
    return this.__addNumberBox(id, title, description, 2, option);
  }

  /**
   * 박스로 감싸진 긴 숫자 입력 필드를 추가합니다. 최대 12자리 숫자에 적합합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addNumberBox(id: string, title: string, description: string, option: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, number> & RangedOption<number>): ComponentAppender {
    this.constructNumberBox(id, title, description, option);
    return this;
  }

  /**
   * 박스로 감싸진 2줄을 사용하는 텍스트 필드를 추가하고 반환합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param param 옵션 파라미터
   * @returns 생성된 텍스트 필드
   */
  constructBoxedInputGrid(id: string, title: string, description: string, { defaultValue, onInit, onChange }: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, string>): HTMLInputElement {
    const topNode = this.constructLongBoxedField(title, description);
    const inputNode = NodeUtil.setupNode("input", {
      cls: "decentral-text-field",
      onInit: (inputField) => {
        inputField.id = id;
        inputField.setAttribute("type", "text");
        defaultValue && (inputField.value = defaultValue);
        if (onChange) {
          inputField.onchange = () => {
            onChange(inputField.value, inputField, topNode);
          };
        }
      },
    });
    topNode.append(inputNode);
    onInit?.(inputNode, topNode);
    return inputNode;
  }

  /**
   * 박스로 감싸진 2줄을 사용하는 텍스트 필드를 추가합니다.
   * @param id 필드의 ID
   * @param title 제목 텍스트
   * @param description 설명 텍스트
   * @param option 옵션 파라미터
   * @returns 체인 가능한 ComponentAppender 인스턴스
   */
  addBoxedInputGrid(id: string, title: string, description: string, { defaultValue, onInit, onChange }: MutableValuedComplexComponentOption<HTMLDivElement, HTMLInputElement, string>): ComponentAppender {
    this.constructBoxedInputGrid(id, title, description, {
      defaultValue: defaultValue,
      onInit: onInit,
      onChange: onChange,
    });
    return this;
  }

  createOuterClickDetection(lambda: Runnable) {
    return NodeUtil.setupNode("div", {
      cls: "decentral-outer-click-detection",
      onInit: (node) => {
        node.id = "decentral-outer-click-detection";
        node.onclick = (event) => {
          event?.stopPropagation();
          event?.preventDefault();
          lambda?.();
        };
      },
    });
  }

  removeOuterClickDetection() {
    const node = document.getElementById("decentral-outer-click-detection");
    if (node) node.remove();
  }

  hasOuterClickDetection() {
    if (document.getElementById("decentral-outer-click-detection")) {
      return true;
    }
    return false;
  }

  triggerOuterClickDetection() {
    const node = document.getElementById("decentral-outer-click-detection");
    if (node) {
      node.onclick?.(document.createEvent("PointerEvent"));
    }
  }
  /**
   *
   * @param {string} titleText
   * @param {string} initialText
   * @param {string} initialId
   * @param {boolean} isLong
   * @returns 노드 수정 인스턴스
   */
  constructSelectBox(titleText: string, initialText: string, initialId: string, isLong: boolean) {
    let topNode = NodeUtil.setupNode("ul", { cls: "decentral-select" });
    let optionContainer = NodeUtil.setupNode("div", { cls: "decentral-list" });
    topNode.setAttribute("decentral-selected", initialId);
    const title = NodeUtil.setupNode("div", {
      cls: "decentral-option",
      style: "width: 100%; display: flex; flex-direction: row; align-items: center;",
      onInit: (option) => {
        option.append(
          NodeUtil.setupNode("span", {
            style: "height: fit-content;",
            text: initialText,
          }),
        );
        option.append(
          NodeUtil.setupNode("div", {
            style: "margin-left: auto;",
            onInit: (iconNode) => {
              iconNode.append(
                NodeUtil.setupNode("div", {
                  onInit: (node) => {
                    node.innerHTML = DECENTRAL_ARROW_ICON_SVG;
                  },
                }),
              );
            },
          }),
        );
        option.onclick = (event) => {
          if (this.hasOuterClickDetection()) {
            event.preventDefault();
            event.stopPropagation();
            this.triggerOuterClickDetection();
            return;
          }
          if (topNode.hasAttribute("list-enabled")) {
            topNode.removeAttribute("list-enabled");
          } else {
            topNode.setAttribute("list-enabled", "true");
            optionContainer.style.cssText = `top: ${topNode.getBoundingClientRect().top + topNode.clientHeight}px;`;
            // No other way to do this :(
            this.parentElement?.parentElement?.parentElement?.parentElement?.append(
              this.createOuterClickDetection(() => {
                topNode.removeAttribute("list-enabled");
                this.removeOuterClickDetection();
              }),
            );
          }
        };
      },
    });
    topNode.append(title);
    topNode.append(optionContainer);

    this.addGrid(titleText, isLong, (node) => {
      node.root.append(topNode);
    });
    topNode.setAttribute("decentral-selected", initialId);

    return {
      node: topNode,
      addOption: (text: string, id: string, onclick: (selectedId: string, node: HTMLElement) => boolean) => {
        const element = NodeUtil.setupNode("div", {
          cls: "decentral-option",
          onInit: (option) => {
            option.textContent = text;
            option.setAttribute("decentral-option-text", text);
            option.setAttribute("decentral-option-id", id);
            option.onclick = () => {
              this.removeOuterClickDetection();
              topNode.removeAttribute("list-enabled");
              const selectedId = option.getAttribute("decentral-option-id");
              if (selectedId && onclick?.(selectedId, option)) {
                topNode.setAttribute("decentral-selected", selectedId);
                title.childNodes[0].textContent = option.getAttribute("decentral-option-text");
              }
            };
          },
        });
        optionContainer.append(element);
        return element;
      },
      clear: () => {
        topNode.getElementsByClassName("decentral-list")[0].innerHTML = "";
      },
      runSelected: () => {
        for (const element of topNode.getElementsByClassName("decentral-option")) {
          if (element.getAttribute("decentral-option-id") === topNode.getAttribute("decentral-selected")) {
            (element as ClickableElement)?.onclick?.();
          }
        }
      },
      listGroup: () => {
        return Array.from(topNode.getElementsByClassName("decentral-option"))
          .map((it) => it.getAttribute("decentral-selected"))
          .filter((it) => it != undefined);
      },
      setSelected: (target: string | Element) => {
        if (typeof target === "string") {
          topNode.setAttribute("decentral-selected", target);
        } else if (target instanceof Element && target.hasAttribute("decentral-option-id")) {
          const attribute = target.getAttribute("decentral-option-id")!;
          topNode.setAttribute("decentral-selected", attribute);
        }
      },
      getSelected: () => {
        return topNode.getAttribute("decentral-selected");
      },
      findSelected: () => {
        for (const element of topNode.getElementsByClassName("decentral-option")) {
          if (element.getAttribute("decentral-option-id") === topNode.getAttribute("decentral-selected")) {
            return element;
          }
        }
        return undefined;
      },
      appendTo: (node: HTMLElement) => {
        node.append(topNode);
      },
      findGroup: (groupId: string) => {
        for (const element of topNode.getElementsByClassName("decentral-option")) {
          if (element.getAttribute("decentral-option-id") === groupId) {
            return element;
          }
        }
        return undefined;
      },
      addGroup: (text: string, lambda: Consumer<HTMLElement>) => {
        const node = NodeUtil.setupNode("div", {
          cls: "decentral-option-group",
          onInit: (group) => {
            group.innerText = text;
          },
        });
        optionContainer.append(node);
        lambda && lambda(node);
      },
    };
  }
}
