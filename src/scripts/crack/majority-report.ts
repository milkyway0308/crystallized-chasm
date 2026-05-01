import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { DelayUtil } from "../../utils/delay-util";
import { BrowserInitUtil } from "../../utils/init-util";
import { readonlyLazy } from "../../utils/lazy-util";
import { NodeLocator } from "../../utils/node-locator-util";
import { NodeUtil } from "../../utils/node-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import SCRIPT_STYLE from "./css/majority-report.scss?inline";
import CLOUD_SVG from "./svg/cloud.svg?raw";

import CARET_DOWN_SVG from "./svg/caret_down.svg?raw";
import { FileUtil } from "../../utils/file-utils";
import { Undeclarable } from "../../utils/generic-types";

export const scriptMeta = ScriptMetaUtil.construct("crack", "majority-report.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Majority-Report (결정화 캐즘 묶음보고서)";
  meta.version = "CRCK-MRPT-v1.0.1" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "이미지 업로드 간편화. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

export class DropdownItem {
  constructor(
    public readonly id: string,
    public readonly display: string,
  ) {}
}

export class SetIdPairs {
  constructor(
    public readonly id: string,
    public readonly setId: string,
  ) {}
}
export class IdPairs {
  constructor(
    public readonly setId: string,
    public readonly id: string,
    public readonly url: string,
  ) {}
}
const parser = readonlyLazy(() => new DOMParser());

// ==============================================================
//                        크랙 데이터 인젝션
// ==============================================================

function extractCurrentSetIds(): Undeclarable<SetIdPairs[]> {
  const dropzone = NodeLocator.get("button.flex.min-h-\\[280px\\]") || document.querySelector("#root");
  if (!dropzone) return undefined;
  const fiberKey = Object.keys(dropzone).find((k) => k.startsWith("__reactFiber$"));
  if (!fiberKey) return undefined;
  let fiber = (dropzone as any)[fiberKey];
  let formMethods = null;

  while (fiber && !formMethods) {
    if (fiber.dependencies && fiber.dependencies.firstContext) {
      let ctx = fiber.dependencies.firstContext;
      while (ctx) {
        if (ctx.memoizedValue && ctx.memoizedValue.setValue && ctx.memoizedValue.getValues) {
          formMethods = ctx.memoizedValue;
          break;
        }
        ctx = ctx.next;
      }
    }
    if (!formMethods && fiber.memoizedState) {
      let hook = fiber.memoizedState;
      while (hook) {
        if (hook.memoizedState && hook.memoizedState.setValue && hook.memoizedState.getValues) {
          formMethods = hook.memoizedState;
          break;
        }
        hook = hook.next;
      }
    }
    fiber = fiber.return;
  }
  if (!formMethods) return undefined;
  const startingSets = formMethods.getValues("startingSets") || [];
  return startingSets.map((set: any) => new SetIdPairs(set.id, set.baseSetId));
}

function injectImage(setId: string, expectedId: string, category: string, situation: string, imageUrl: string): Undeclarable<string> {
  const dropzone = NodeLocator.get("button.flex.min-h-\\[280px\\]") || document.querySelector("#root");
  if (!dropzone) return "대상 업로드 컴포넌트를 찾을 수 없습니다.";
  const fiberKey = Object.keys(dropzone).find((k) => k.startsWith("__reactFiber$"));
  if (!fiberKey) return "리액트 데이터 추출에 실패하였습니다.";
  let fiber = (dropzone as any)[fiberKey];
  let formMethods = null;

  while (fiber && !formMethods) {
    if (fiber.dependencies && fiber.dependencies.firstContext) {
      let ctx = fiber.dependencies.firstContext;
      while (ctx) {
        if (ctx.memoizedValue && ctx.memoizedValue.setValue && ctx.memoizedValue.getValues) {
          formMethods = ctx.memoizedValue;
          break;
        }
        ctx = ctx.next;
      }
    }
    if (!formMethods && fiber.memoizedState) {
      let hook = fiber.memoizedState;
      while (hook) {
        if (hook.memoizedState && hook.memoizedState.setValue && hook.memoizedState.getValues) {
          formMethods = hook.memoizedState;
          break;
        }
        hook = hook.next;
      }
    }
    fiber = fiber.return;
  }

  if (!formMethods) return "컴포넌트 추출에 실패하였습니다.";

  const startingSets = formMethods.getValues("startingSets") || [];

  startingSets.forEach((set: any, index: number) => {
    let matrix = set.imageMatrix || { categories: [], situations: [] };
    let isMatrixUpdated = false;

    if (!matrix.categories.includes(category)) {
      matrix.categories.push(category);
      isMatrixUpdated = true;
    }

    if (!matrix.situations.includes(situation)) {
      matrix.situations.push(situation);
      isMatrixUpdated = true;
    }

    if (isMatrixUpdated) {
      formMethods.setValue(`startingSets.${index}.imageMatrix`, { categories: matrix.categories, situations: matrix.situations }, { shouldDirty: true });
    }
  });

  const newImageEntry = {
    id: expectedId,
    category: category,
    situation: situation,
    imageUrl: imageUrl,
    keyword: "",
    startingSetId: [setId],
    isLoading: false,
    collapsed: true,
  };
  const currentImages: any[] = formMethods.getValues("_situationImages") || [];


  formMethods.setValue("_situationImages", [...currentImages.filter(it => it.category !== category && it.situation !== situation), newImageEntry], { shouldDirty: true });
  return undefined;
}

function createCrackStyleInput(title: string, description: string, id: string): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-container",
    onInit: (node) => {
      // 메타데이터
      node.append(
        NodeUtil.setupNode("div", {
          cls: "chasm-mrpt-meta-container",
          onInit: (meta) => {
            meta.append(
              NodeUtil.setupNode("p", {
                text: title,
                cls: "chasm-mrpt-meta-title",
              }),
            );
            meta.append(
              NodeUtil.setupNode("p", {
                text: description,
                cls: "chasm-mrpt-meta-description",
              }),
            );
          },
        }),
      );
      // 인풋 컨테이너
      node.append(
        NodeUtil.setupNode("div", {
          cls: "chasm-mrpt-text-input-container",
          onInit: (inputContainer) => {
            inputContainer.append(
              NodeUtil.setupNode("input", {
                cls: "chasm-mrpt-text-input",
                onInit: (input) => {
                  input.type = "text";
                  input.id = id;
                },
              }),
            );
          },
        }),
      );
    },
  });
}

function createCrackStyleDropdown(title: string, description: string, startingId: DropdownItem, listIds: DropdownItem[]): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-container",
    onInit: (node) => {
      // 메타데이터
      node.append(
        NodeUtil.setupNode("div", {
          cls: "chasm-mrpt-meta-container",
          onInit: (meta) => {
            meta.append(
              NodeUtil.setupNode("p", {
                text: title,
                cls: "chasm-mrpt-meta-title",
              }),
            );
            meta.append(
              NodeUtil.setupNode("p", {
                text: description,
                cls: "chasm-mrpt-meta-description",
              }),
            );
          },
        }),
      );
      // 인풋 컨테이너
      node.append(
        NodeUtil.setupNode("button", {
          cls: "chasm-mrpt-dropdown-button",
          onInit: (button) => {
            button.append(
              NodeUtil.setupNode("span", {
                text: startingId.display,
              }),
            );
            button.append(parser.parseFromString(CARET_DOWN_SVG, "image/svg+xml").documentElement);
            button.onclick = () => {};
          },
        }),
      );
    },
  });
}

function modifyUploadPanel(panel: Element) {
  for (const child of panel.children) {
    child.classList.add("chasm-mrpt-ignore");
  }
  panel.append(NodeUtil.setupParagraphNode({ text: " 주의하세요: 묶음보고서 모듈은 현재 버전에서는 첫번째 시작 설정에만 이미지 업로드가 가능합니다. ", style: "color: #c44846; font-weight: 600; font-size: 16px;" }));
  panel.append(createCrackStyleInput("캐릭터 이름", "캐릭터 이름을 지정하세요. 파일 이름은 무시됩니다.", "chasm-mrpt-charactrer-category"));
  panel.append(createCrackStyleInput("캐릭터 상태", "캐릭터 상태, 혹은 감정을 지정하세요.", "chasm-mrpt-charactrer-situation"));
  panel.append(
    NodeUtil.setupNode("button", {
      cls: "chasm-mrpt-image-dragdrop",
      onInit: (node) => {
        node.append(
          NodeUtil.setupNode("div", {
            cls: "chasm-mrpt-image-dragdrop-contents",
            onInit: (container) => {
              container.append(parser.parseFromString(CLOUD_SVG, "image/svg+xml").documentElement);
              container.append(NodeUtil.setupParagraphNode({ cls: "chasm-mrpt-image-dragdrop-contents-title", text: "이미지를 올려보세요!" }));
              container.append(NodeUtil.setupParagraphNode({ cls: "chasm-mrpt-image-dragdrop-contents-description", text: "캐릭터 상태가 존재하는 상태에서는 문제가 발생할 수 있어요" }));
            },
          }),
        );
        node.onclick = async () => {
          try {
            const category = NodeLocator.get<HTMLInputElement>("#chasm-mrpt-charactrer-category");
            const situation = NodeLocator.get<HTMLInputElement>("#chasm-mrpt-charactrer-situation");
            if (!category || category.value.length <= 0) {
              CrackSdk.toastify().doToastifyAlert("카테고리는 1자 이상이여야 해요.");
              return;
            }
            if (!situation || situation.value.length <= 0) {
              CrackSdk.toastify().doToastifyAlert("상황은 1자 이상이여야 해요.");
              return;
            }
            const categoryText = category.value;
            const situationText = situation.value;
            const selected = await FileUtil.acceptFileRaw("image/png, image/jpg, image/jpeg, image/webp");
            if (selected) {
              const query = new URLSearchParams(window.location.search);
              const result = await CrackSdk.story().getDetail(query.get("storyId")!);
              if (!result.ok) {
                CrackSdk.toastify().doToastifyAlert("알 수 없는 오류가 발생해 작품 정보를 가져올 수 없었어요.");
                console.error(result.error);
                return;
              }
              const setToUpload = extractCurrentSetIds();
              if (!setToUpload) {
                CrackSdk.toastify().doToastifyAlert("작품 ID 세트 추출에 실패했어요.");
                return;
              }
              const uploadRequest = await CrackSdk.network().authFetch("POST", "https://crack-api.wrtn.ai/crack-api/situation-images/presigned-urls/bulk", {
                sourceId: query.get("storyId")!,
                startingSets: setToUpload.map((it) => {
                  return { baseSetId: it.setId };
                }),
                uploads: [{ fileType: selected.name.slice((Math.max(0, selected.name.lastIndexOf(".")) || Infinity) + 1), category: categoryText, situation: situationText }],
              });
              if (!uploadRequest.ok) {
                CrackSdk.toastify().doToastifyAlert("알 수 없는 오류가 발생해 프리사인 처리에 실패했어요.");
                console.error(uploadRequest.error);
                return;
              }
              if (uploadRequest.value.data.startingSets[0].rejected.length > 0) {
                CrackSdk.toastify().doToastifyAlert("크랙 API에서 이미지 프리사인을 거부했어요.\n이미 업로드된 이미지인지 확인해주세요.");
                return;
              }
              const checkRequest = await CrackSdk.network().authFetch("GET", `https://crack-api.wrtn.ai/crack-api/situation-images/stories/${query.get("storyId")!}/starting-sets?bulkId=${uploadRequest.value.data.bulkId}&baseSetIds%5B%5D=${result.value.startingSets[0].setId}`);
              if (!checkRequest.ok) {
                CrackSdk.toastify().doToastifyAlert("알 수 없는 오류가 발생해 벌크 데이터 처리에 실패했어요.");
                console.error(checkRequest.error);
                return;
              }
              const putRequest = await fetch(uploadRequest.value.data.startingSets[0].uploads[0].url, { method: "PUT", body: selected });
              if (!putRequest.ok) {
                CrackSdk.toastify().doToastifyAlert("알 수 없는 오류가 발생해 이미지 업로드 처리에 실패했어요.");
                return;
              }

              let expectedUrl: IdPairs[] = [];
              for (let i = 0; i < 15; i++) {
                await new Promise((r) => setTimeout(r, 500));
                expectedUrl = [];
                const finalizeRequest = await CrackSdk.network().authFetch("GET", `https://crack-api.wrtn.ai/crack-api/situation-images/stories/${query.get("storyId")!}/starting-sets?bulkId=${uploadRequest.value.data.bulkId}&baseSetIds%5B%5D=${result.value.startingSets[0].setId}`);
                if (!finalizeRequest.ok) {
                  CrackSdk.toastify().doToastifyAlert("최종 이미지 처리에 실패해 이미지 업로드 처리에 실패했어요.");
                  return;
                }
                let index = 0;
                for (let set of finalizeRequest.value.data.startingSets) {
                  const progress = set.progress;
                  if (progress.errorCount > 0) {
                    CrackSdk.toastify().doToastifyAlert("이미지가 크랙 검열 시스템에 의해 거부되었어요.");
                    return;
                  }
                  if (progress.errorCount + progress.successCount === progress.totalCount) {
                    expectedUrl.push(new IdPairs(setToUpload[index].id, set.uploads[0]._id, set.uploads[0].url));
                  }
                  index++;
                }
                if (expectedUrl.length === setToUpload.length) break;
              }
              if (expectedUrl.length !== setToUpload.length) {
                CrackSdk.toastify().doToastifyAlert("이미지 업로드 시간 제한을 초과했어요.");
                return;
              }
              for (const image of expectedUrl) {
                const completeRequest = await fetch(`${image.url}?_cb=${Date.now()}`);
                if (!completeRequest.ok) {
                  CrackSdk.toastify().doToastifyAlert("이미지 업로드 완료 검증에 실패했어요.");
                  return;
                }
                await fetch(`${image.url}`);
              }
              for (const image of expectedUrl) {
                const injectResult = injectImage(image.setId, image.id, categoryText, situationText, image.url);
                if (injectResult) {
                  CrackSdk.toastify().doToastifyAlert("UI 인젝션에 실패했어요.\n정상적으로 작품에 이미지가 반영되지 않을 가능성이 높아요.\n이 오류는 결정화 캐즘 채널에 제보하면 빠르게 수정될 수 있어요.");
                }
              }

              CrackSdk.toastify().doToastifyAlert("이미지를 업로드했어요.");
            }
          } catch (err) {
            console.error(err);

            CrackSdk.toastify().doToastifyAlert("예상하지 못한 오류가 발생했어요.\n정상적으로 작품에 이미지가 반영되지 않을 가능성이 높아요.\n이 오류는 결정화 캐즘 채널에 제보하면 빠르게 수정될 수 있어요.");
          }
        };
      },
    }),
  );
}

function injectElement() {
  if (NodeLocator.get(`.chasm-mrpt-remapped`)) return;
  if (NodeLocator.getAll(`[aria-selected=true]`).find((it) => it.textContent === "미디어")) {
    const injectTarget = NodeLocator.getAll(`div[role="tablist"][data-orientation="horizontal"]`);
    if (injectTarget.length <= 0) return;
    const last = injectTarget.at(-1)!;
    const expectedPanel = last.nextElementSibling;
    if (!expectedPanel) return;
    const firstButton = last.children[0] as HTMLElement;
    firstButton.classList.add("chasm-mrpt-remapped");
    firstButton.textContent = "1. 이미지 분석 및 업로드";
    firstButton.addEventListener("click", () => {
      modifyUploadPanel(expectedPanel);
    });
    modifyUploadPanel(expectedPanel);
    
    CrackSdk.toastify().doToastifyAlert("묶음보고서 모듈은 서드파티의 한계로 시작 설정 실시간 반영이 불가능해요.\n만약 시작 설정을 추가했다면 저장 후 다시 편집을 시도해주세요.");
  }
}

BrowserInitUtil.init(() => {
  BrowserInitUtil.callGMAddStyle(SCRIPT_STYLE);
  ObserveUtil.attachHrefObserver(document, () => {
    if (CrackSdk.path().isStoryBuilderPath()) {
      const query = new URLSearchParams(window.location.search);
      if (query.get("type") !== "edit") {
        CrackSdk.toastify().doToastifyAlert("묶음보고서 모듈은 '편집'에서만 작동해요.\n만약 수정된 v2 이미지 업로드 기능이 필요한 상황이라면 작품 저장 후 편집으로 시도해주세요.");
      }
    }
  });
  if (CrackSdk.path().isStoryBuilderPath()) {
    const query = new URLSearchParams(window.location.search);
    if (query.get("type") !== "edit") {
      CrackSdk.toastify().doToastifyAlert("묶음보고서 모듈은 '편집'에서만 작동해요.\n만약 수정된 v2 이미지 업로드 기능이 필요한 상황이라면 작품 저장 후 편집으로 시도해주세요.");
    }
  }
  const bouncer = DelayUtil.debouncer(injectElement);
  ObserveUtil.attachObserver(document, () => {
    if (CrackSdk.path().isStoryBuilderPath()) {
      const query = new URLSearchParams(window.location.search);
      if (query.get("type") !== "edit") {
        return;
      }
      bouncer.runDebouncer(50);
    }
  });
});
