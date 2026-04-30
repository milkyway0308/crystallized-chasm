import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { CrackVisibility } from "../../sdk/crack/types/types-generic";
import { ReadonlyDetailedStoryInfo, WritableStoryInfo } from "../../sdk/crack/types/types-story";
import { FileUtil } from "../../utils/file-utils";
import { Nullable } from "../../utils/generic-types";
import { BrowserInitUtil } from "../../utils/init-util";
import { NodeLocator } from "../../utils/node-locator-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import SCRIPT_STYLE from "./css/neocopy.scss?inline";

export const scriptMeta = ScriptMetaUtil.construct("crack", "neocopy.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Neo-Copy (결정화 캐즘 네오-카피)";
  meta.version = "CRCK-NCPY-v3.1.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.defaulticon = "크랙의 캐릭터 퍼블리시/복사/붙여넣기 기능 구현 및 오류 수정. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오..";
});

type ExportedContents = {
  type: string;
  type_revision?: number;
  version: string;
  chatType: string;
  exported: number;
  prompt: WritableStoryInfo;
};

class ExtractedCharacterInfo {
  /**
   * @param {string} type
   * @param {string} id
   */
  constructor(
    public readonly type: string,
    public readonly id: string,
  ) {}

  /**
   * 선택한 데이터가 스토리챗인지 확인합니다.
   * @returns {boolean} 데이터의 스토리챗 여부
   */
  isStory(): boolean {
    return !this.type || this.type.length <= 0 || this.type === "story";
  }

  /**
   * 선택한 데이터가 캐릭터챗인지 확인합니다.
   * @returns {boolean} 데이어틔 캐릭터챗 여부
   */
  isCharacter(): boolean {
    return this.type === "character";
  }
}

// =====================================================
//                  크랙 종속 유틸리티
// =====================================================

function acquireMenu(): Nullable<Element> {
  for (let node of NodeLocator.getAll<HTMLDivElement>("div[data-radix-popper-content-wrapper]")) {
    if (node.getAttribute("data-radix-popper-content-wrapper") !== null) {
      return node;
    }
  }
  return null;
}

// =====================================================
//                      UI 컨트롤러
// =====================================================
/**
 * 현재 작품의 ID를 메뉴 요소에서 추출합니다.
 * @param {HTMLElement} element 메뉴 요소
 * @returns {ExtractedCharacterInfo | null} 작품 ID 혹은 null
 */
function extractCurrentArticle(element: HTMLElement): Nullable<ExtractedCharacterInfo> {
  try {
    const reactPropertyName = Object.keys(element).find((t) => t.startsWith("__reactProps"));
    if (!reactPropertyName) return null;
    // @ts-ignore
    const reactProperty = element[reactPropertyName];
    if (!reactProperty?.children) return null;
    const propertyChilds = Array.isArray(reactProperty.children) ? reactProperty.children : [reactProperty.children];
    for (const child of propertyChilds) {
      if (child?.props?.content?.sourceId) {
        return new ExtractedCharacterInfo(child.props.content.type, child.props.content.sourceId);
      }
    }
    return null;
  } catch (t) {
    return null;
  }
}

function extractArticle() {
  const menu = acquireMenu();
  if (!menu) {
    return undefined;
  }
  // @ts-ignore
  return extractCurrentArticle(menu.childNodes[0]);
}
// =====================================================
//                      초기화
// =====================================================
async function setup() {
  if (!/^\/my(\/.*)?$/.test(location.pathname)) {
    return;
  }
  const id = extractArticle();
  if (!id) {
    return;
  }
  if (id.isStory()) {
    setupStoryDropdown(id);
  } else {
    setupCharacterDropdown();
  }
}

async function publishCharacter(id: ExtractedCharacterInfo, newVisibility: CrackVisibility) {
  const originData = await CrackSdk.character().getDetail(id.id);
  if (!originData.ok) {
    CrackSdk.toastify().doToastifyAlert("대상 작품 데이터를 가져오는데에 실패했어요.");
    console.error(originData.error);
    return;
  }
  console.log(JSON.stringify(originData.value));

  console.log(`Writable: ${JSON.stringify(originData.value.asWritable())}`);
  try {
    const result = await CrackSdk.character().create(
      originData.value.asWritable().modify((data) => {
        data.visibility = newVisibility;
      }),
      true,
    );
    if (!result.ok) {
      console.error(result.error);
      CrackSdk.toastify().doToastifyAlert("새 스토리 배포 도중 오류가 발생했어요.");
      return;
    }
    CrackSdk.toastify().doToastifyAlert("새 스토리가 배포되었어요.");
    window.history.pushState(null, "", window.location.href);
    window.dispatchEvent(new Event("popstate"));
  } catch (err) {
    CrackSdk.toastify().doToastifyAlert("예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
    console.error(err);
  }
}

function setupCharacterDropdown() {
  const popupManager = CrackSdk.pageComponent().articleListing().popup().manager();
  if (!popupManager || popupManager.hasModified("neocopy")) return;

  popupManager.addButton(
    "✦ 재게시",
    () => {
      CrackSdk.toastify().doToastifyAlert("아직 캐릭터 관련 기능이 수복되지 않았어요.\n잠시만 기다려주세요!");
    },
    "neocopy",
  );
  popupManager.addButton(
    "✦ 파일 관리",
    () => {
      CrackSdk.toastify().doToastifyAlert("아직 캐릭터 관련 기능이 수복되지 않았어요.\n잠시만 기다려주세요!");
    },
    "neocopy",
  );
  popupManager.addButton(
    "✦ JSON 복사",
    () => {
      CrackSdk.toastify().doToastifyAlert("아직 캐릭터 관련 기능이 수복되지 않았어요.\n잠시만 기다려주세요!");
    },
    "neocopy",
  );
  popupManager.addButton(
    "✦ JSON 붙여넣기",
    () => {
      CrackSdk.toastify().doToastifyAlert("아직 캐릭터 관련 기능이 수복되지 않았어요.\n잠시만 기다려주세요!");
    },
    "neocopy",
  );
}

async function publishStory(id: ExtractedCharacterInfo, isAdult: boolean, newVisibility: CrackVisibility) {
  const originData = await CrackSdk.story().getDetail(id.id);
  if (!originData.ok) {
    CrackSdk.toastify().doToastifyAlert("대상 작품 데이터를 가져오는데에 실패했어요.");
    console.error(originData.error);
    return;
  }
  console.log(JSON.stringify(originData.value));

  console.log(`Writable: ${JSON.stringify(originData.value.asWritable())}`);
  try {
    const result = await CrackSdk.story().create(
      originData.value.asWritable().modify((data) => {
        data.visibility = newVisibility;
      }),
      true,
      isAdult,
    );
    if (!result.ok) {
      console.error(result.error);
      CrackSdk.toastify().doToastifyAlert("새 스토리 배포 도중 오류가 발생했어요.");
      return;
    }
    CrackSdk.toastify().doToastifyAlert("새 스토리가 배포되었어요.");
    window.history.pushState(null, "", window.location.href);
    window.dispatchEvent(new Event("popstate"));
  } catch (err) {
    CrackSdk.toastify().doToastifyAlert("예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
    console.error(err);
  }
}

function setupStoryDropdown(id: ExtractedCharacterInfo) {
  const popupManager = CrackSdk.pageComponent().articleListing().popup().manager();
  if (!popupManager || popupManager.hasModified("neocopy")) return;

  popupManager.addDropdownButton(
    "◂ ✦ 세이프티 재게시",
    (dropdown) => {
      dropdown.addElement("✦ 공개", () => {
        publishStory(id, false, CrackVisibility.PUBLIC);
      });
      dropdown.addElement("✦ 비공개", () => {
        publishStory(id, false, CrackVisibility.PRIVATE);
      });
      dropdown.addElement("✦ 링크 공개", () => {
        publishStory(id, false, CrackVisibility.LINK_ONLY);
      });
    },
    "neocopy",
  );

  popupManager.addDropdownButton(
    "◂ ✦ 언세이프티 재게시",
    (dropdown) => {
      dropdown.addElement("✦ 공개", () => {
        publishStory(id, true, CrackVisibility.PUBLIC);
      });
      dropdown.addElement("✦ 비공개", () => {
        publishStory(id, true, CrackVisibility.PRIVATE);
      });
      dropdown.addElement("✦ 링크 공개", () => {
        publishStory(id, true, CrackVisibility.LINK_ONLY);
      });
    },
    "neocopy",
  );
  popupManager.addDropdownButton(
    "◂ ✦ 파일 관리",
    (dropdown) => {
      dropdown.addElement("✦ 내보내기", async () => {
        const story = await CrackSdk.story().getDetail(id.id);
        let refinedStory: ReadonlyDetailedStoryInfo;
        try {
          refinedStory = ReadonlyDetailedStoryInfo.from(story);
        } catch (err) {
          console.error(err);
          CrackSdk.toastify().doToastifyAlert("스토리를 불러오는 도중 예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
          return;
        }
        if (story.ok) {
          try {
            FileUtil.exportString(
              `${refinedStory.title}.neocopy.json`,
              JSON.stringify(
                {
                  type: "chasm-neocopy",
                  type_revision: 2,
                  version: scriptMeta.version!,
                  chatType: "story",
                  exported: new Date().getTime(),
                  prompt: refinedStory.asWritable(),
                } satisfies ExportedContents,
                null,
                2,
              ),
            );
            CrackSdk.toastify().doToastifyAlert("스토리가 파일로 추출되어 저장되었어요.");
          } catch (err) {
            console.error(err);
            CrackSdk.toastify().doToastifyAlert("파일 저장 중 예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
          }
        } else {
          console.error(story.error);
          CrackSdk.toastify().doToastifyAlert("예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
        }
      });
      dropdown.addElement("✦ 불러오기", async () => {
        CrackSdk.toastify().doToastifyAlert("이 기능은 아직 복구 작업중에 있어요.");
        // let item: ExportedContents | undefined = undefined;
        // try {
        //   const accepted = await FileUtil.acceptFile();
        //   if (!accepted) {
        //     CrackSdk.toastify().doToastifyAlert("잘못된 파일이 입력되어 데이터를 불러올 수 없어요.");
        //     return;
        //   }
        //   try {
        //     item = typia.json.assertParse<ExportedContents>(accepted);
        //   } catch (parseErr) {
        //     CrackSdk.toastify().doToastifyAlert("이 파일은 불러올 수 없는 파일이예요.\n파일이 네오카피 모듈의 포맷을 따르고 있지 않아요.");
        //     return;
        //   }
        // } catch (err) {
        //   console.error(err);
        //   CrackSdk.toastify().doToastifyAlert("파일을 불러오는 도중 예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
        //   return;
        // }
        // if ((item.type_revision ?? 0) < 2) {
        //   // LEGACY FORMAT!
        //   const imported = ReadonlyDetailedStoryInfo.from(item.prompt);
        // } else {
        //   // New Format
        //   const imported = plainToClass(WritableStoryInfo, item.prompt);
        //   try {
        //     CrackSdk.story().edit(id.id, imported, true);
        //   } catch (err) {
        //     console.error(err);
        //     CrackSdk.toastify().doToastifyAlert("데이터를 덮어씌우는 도중 예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
        //   }
        // }
      });
    },
    "neocopy",
  );
  popupManager.addButton(
    "✦ JSON 복사",
    () => {
      CrackSdk.story()
        .getDetail(id.id, true)
        .then((item) => {
          if (item.ok) {
            window.navigator.clipboard.writeText(JSON.stringify(item.value));
            CrackSdk.toastify().doToastifyAlert("클립보드로 작품 정보를 복사했어요.");
          } else {
            console.error(item.error);
            CrackSdk.toastify().doToastifyAlert("예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
          }
        });
    },
    "neocopy",
  );
  popupManager.addButton(
    "✦ JSON 붙여넣기",
    async () => {
      let item: any;
      try {
        item = JSON.parse(await window.navigator.clipboard.readText());
      } catch (err) {
        console.error(err);
        CrackSdk.toastify().doToastifyAlert("클립보드에서 데이터를 불러오지 못했어요.\n잘못된 데이터이거나 유효한 JSON 포맷이 아니예요.");
        return;
      }
      let content: ReadonlyDetailedStoryInfo;
      try {
        content = ReadonlyDetailedStoryInfo.from(item);
      } catch (err) {
        CrackSdk.toastify().doToastifyAlert("클립보드에서 데이터를 불러오지 못했어요.\n" + (err as Error).message);
        console.error(err);
        return;
      }
      const originData = await CrackSdk.story().getDetail(id.id);
      if (!originData.ok) {
        CrackSdk.toastify().doToastifyAlert("대상 작품 데이터를 가져오는데에 실패했어요.");
        console.error(originData.error);
        return;
      }

      try {
        const result = await CrackSdk.story().edit(
          id.id,
          content.asWritable().modify((data) => {
            data.visibility = CrackVisibility.of(originData.value.visibility);
          }),
          true,
        );
        if (!result.ok) {
          console.error(result.error);
          CrackSdk.toastify().doToastifyAlert("데이터 수정 중 오류가 발생했어요.");
          return;
        }
        CrackSdk.toastify().doToastifyAlert("작품 데이터가 반영되었어요.");
      } catch (err) {
        CrackSdk.toastify().doToastifyAlert("예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
        console.error(err);
      }
    },
    "neocopy",
  );
  popupManager.addButton(
    "✦ 이전 버전으로 롤백",
    async () => {
      if (!confirm("정말로 이전 버전으로 바꿀까요?\n이 동작은 되돌릴 수 없습니다! 미리 백업을 진행하세요.")) {
        return;
      }
      const originData = await CrackSdk.story().getDetail(id.id);
      if (!originData.ok) {
        CrackSdk.toastify().doToastifyAlert("대상 작품 데이터를 가져오는데에 실패했어요.");
        console.error(originData.error);
        return;
      }

      try {
        const result = await CrackSdk.story().edit(
          id.id,
          originData.value.asWritable().dematrix(),
          true,
        );
        if (!result.ok) {
          console.error(result.error);
          CrackSdk.toastify().doToastifyAlert("데이터 수정 중 오류가 발생했어요.");
          return;
        }
        CrackSdk.toastify().doToastifyAlert("작품 데이터가 반영되었어요.");
      } catch (err) {
        CrackSdk.toastify().doToastifyAlert("예상치 못한 오류가 발생했어요.\n결정화 캐즘 지원 채널에 해당 오류를 제보해주시면 빠른 수정이 가능해요.");
        console.error(err);
      }
    },
    "neocopy",
  );
}

BrowserInitUtil.init(() => {
  BrowserInitUtil.onPagePrepare(() => {
    BrowserInitUtil.callGMAddStyle(SCRIPT_STYLE);
    setup();
    ObserveUtil.attachObserver(document, setup);
  });
});
