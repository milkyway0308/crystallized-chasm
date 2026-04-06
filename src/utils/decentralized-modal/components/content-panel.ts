import { Nullable, Runnable } from "../../generic-types";
import { NodeUtil } from "../../node-util";
import { DECENTRAL_CLOSE_ICON_SVG, DECENTRAL_MENU_ICON_SVG } from "../constants";
import { ComponentAppender, VerifiableElement } from "./component-appender";

export class ContentPanel extends ComponentAppender {
  __verticalContainer = NodeUtil.setupNode("div", { cls: "decentral-vertical-container" });
  __footerGrid = NodeUtil.setupNode("div", { cls: "decentral-grid-container" });
  __footer = NodeUtil.setupNode("div", {
    cls: "decentral-modal-footer",
    onInit: (node) => {
      node.append(this.__footerGrid);
    },
  });
  __footerAppender = new ComponentAppender(this.__footerGrid);
  __element: HTMLElement;
  constructor(id: string, title: string, svg: Nullable<string>, mobileOpenAction: Runnable, closeAction: Runnable) {
    super(NodeUtil.setupNode("div", { cls: "decentral-grid" }));
    this.__element = this.parentElement;
    this.__verticalContainer.id = id;
    const icon = NodeUtil.setupNode("div", { cls: "decentral-modal-title-icon" });
    const gridWrapper = NodeUtil.setupNode("div", { cls: "decentral-grid-container" });
    this.__verticalContainer.append(
      NodeUtil.setupNode("div", {
        cls: "decentral-modal-title-container",
        onInit: (node) => {
          node.append(icon);
          node.append(
            NodeUtil.setupNode("p", {
              cls: "decental-modal-title-text",
              text: title,
            }),
          );
          node.append(
            NodeUtil.setupNode("div", {
              cls: "decentral-modal-button-container",
              onInit: (node) => {
                node.append(
                  NodeUtil.setupNode("div", {
                    cls: "decentral-mobile-menu-button",
                    onInit: (svgNode) => {
                      svgNode.innerHTML = DECENTRAL_MENU_ICON_SVG;
                      svgNode.id = `${id}-menu`;
                      mobileOpenAction && (svgNode.onclick = mobileOpenAction);
                    },
                  }),
                );
                node.append(
                  NodeUtil.setupNode("div", {
                    cls: "decentral-close-button",
                    onInit: (svgNode) => {
                      svgNode.innerHTML = DECENTRAL_CLOSE_ICON_SVG;
                      svgNode.id = `${id}-close`;
                      closeAction && (svgNode.onclick = closeAction);
                    },
                  }),
                );
              },
            }),
          );
        },
      }),
    );
    svg && (icon.outerHTML = svg);
    icon.classList.add("decentral-modal-title-icon");
    gridWrapper.append(this.__element);
    this.__verticalContainer.append(gridWrapper);
    this.__verticalContainer.append(this.__footer);
  }

  footer(useVerticalFooter: boolean) {
    if (useVerticalFooter) {
      this.__footerGrid.classList.add("decentral-vertical-container");
    }
    return this.__footerAppender;
  }

  runModifyVerification() {
    const foundElements = this.__verticalContainer.getElementsByClassName("decentral-modifiable-component");
    for (const element of foundElements) {
      (element as VerifiableElement)?.onVerifyChange?.();
    }
  }

  asHTML() {
    return this.__verticalContainer;
  }
}
