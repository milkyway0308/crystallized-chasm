// ==UserScript==
// @name         Chasm Crystallized DreamDiary (크랙 / 캐즘 꿈일기)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-DDIA-v1.3.0p
// @description  유저노트 저장 / 불러오기 기능 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/dreamdiary.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/dreamdiary.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@4.2.1/dist/dexie.min.js#sha256-STeEejq7AcFOvsszbzgCDL82AjypbLLjD5O6tUByfuA=
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/21eec201e75b752768ef7f6a12a1ee5b6db5c415/crack/libraries/toastify-injection.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/21eec201e75b752768ef7f6a12a1ee5b6db5c415/crack/libraries/crack-shared-core.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/21eec201e75b752768ef7f6a12a1ee5b6db5c415/libraries/chasm-shared-core.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/21eec201e75b752768ef7f6a12a1ee5b6db5c415/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==

// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />

// @ts-ignore
GM_addStyle(`
    .chasm-ddia-zero-paddings {
        padding: 0px;
    }
    .chasm-ddia-custom-paddings {
        padding: 0px;
        padding-bottom: 8px;
    }
`);
!(async function () {
  const STANDARD_NOTIFICATION_TIME = 3000;
  // @ts-ignore
  const db = new Dexie("chasm-dream-diary");
  const logger = new LogUtil("Chasm Crystallized Dreamdiary", false);
  await db.version(1).stores({
    noteStore: `keyName, noteName, boundCharacter, noteContent, savedAt`,
    lastSelected: `boundCharacter, selected`,
  });

  class CustomUserNote {
    /**
     * @param {string} keyName
     * @param {string} noteContent
     * @param {string} name
     * @param {string} bound
     * @param {number} savedAt
     */
    constructor(keyName, name, bound, noteContent, savedAt) {
      this.keyId = keyName;
      this.name = name;
      this.bound = bound;
      this.noteContent = noteContent;
      this.savedAt = savedAt;
    }
  }
  // =====================================================
  //                      설정
  // =====================================================
  const settings = new LocaleStorageConfig("chasm-crck-ddia-settings", {
    /** @type {string | undefined} */
    lastPromptName: undefined,
    /** @type {string | undefined} */
    boundCharacter: undefined,
    /** @type {string | undefined} */
    lastPromptDisplay: undefined,
    /** @type {boolean} */
    isCustom: false,
  });

  // =================================================
  //                     로직
  // =================================================
  /**
   *
   * @param {string} character
   * @returns {Promise<CustomUserNote[]>}
   */
  async function findAllNoteOf(character) {
    const result = await db.noteStore
      .where("boundCharacter")
      .anyOf("#global", character)
      .sortBy("savedAt");
    return result
      .reverse()
      .map(
        (/** @type {any}*/ data) =>
          new CustomUserNote(
            data.keyName,
            data.noteName,
            data.boundCharacter,
            data.noteContent,
            data.savedAt,
          ),
      );
  }

  /**
   *
   * @param {string} character
   * @returns {Promise<any>}
   */
  async function getSelected(character) {
    const result = await db.lastSelected
      .where("boundCharacter")
      .anyOf(character)
      .toArray();
    if (result.length > 0) {
      return result[0].selected;
    }
    return undefined;
  }

  /**
   *
   * @param {string} character
   * @param {string} key
   */
  async function setLastSelected(character, key) {
    await db.lastSelected.put({
      boundCharacter: character,
      selected: key,
    });
  }

  /**
   *
   * @param {string} character
   */
  async function removeLastSelected(character) {
    await db.lastSelected.remove(character);
  }

  /**
   *
   * @param {string} keyId
   * @returns {Promise<CustomUserNote | undefined>}
   */
  async function getNoteOf(keyId) {
    const data = await db.noteStore.where("keyName").anyOf(keyId).toArray();
    if (data.length <= 0) {
      return undefined;
    }
    return new CustomUserNote(
      data[0].keyName,
      data[0].noteName,
      data[0].boundCharacter,
      data[0].noteContent,
      data[0].savedAt,
    );
  }

  /**
   *
   * @param {string} character
   * @param {string} noteName
   */
  async function deleteNoteOf(character, noteName) {
    try {
      await db.noteStore.delete(`${character}!+${noteName}`);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   * @param {string} character
   * @param {string} noteName
   * @param {string} contents
   */
  async function saveNoteOf(character, noteName, contents) {
    try {
      await db.noteStore.put({
        keyName: `${character}!+${noteName}`,
        noteName: noteName,
        boundCharacter: character,
        noteContent: contents,
        savedAt: new Date().getTime(),
      });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   * @returns {?Element}
   */
  function findModal() {
    // 2025-11-23 기준
    const pool = [
      // 다크 모드 일반
      "css-4wk9gd",
      // 다크 모드 모바일
      "css-1y4t25r",
      // 라이트 모드 일반
      "css-aeatjm",
      // 라이트 모드 모바일
      "css-1o991gc",
    ];
    for (const key of pool) {
      const found = document.getElementsByClassName(key);
      if (found.length > 0) {
        return found[0];
      }
    }
    return null;
  }
  function injectModal() {
    if (document.getElementById("chasm-ddia-note-listing")) {
      return;
    }
    const modal = findModal();
    if (!modal) return;
    const textArea = modal.getElementsByTagName("textarea");
    if (textArea.length <= 0) return;
    const listing = document.createElement("div");
    listing.classList.add("decentral-color-container");
    if (document.body.getAttribute("data-theme") === "dark") {
      listing.setAttribute("theme", "dark");
    }
    textArea[0].before(listing);
    const appender = new ComponentAppender(listing);
    const box = appender.constructSelectBox(
      "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]",
      settings.config.lastPromptName ?? "--이름을 지정하세요--",
      "chasm-ddia-settings#nonreachable",
      true,
    );
    /** @type {HTMLElement} */
    // @ts-ignore
    const textNode = box.node.parentElement.getElementsByTagName("p")[0];
    textNode.style.cssText = "user-select: none !important;";
    textNode.onmousedown = (event) => {
      let pressTime = 30;
      const timer = setInterval(() => {
        if (pressTime-- <= 0) {
          clearInterval(timer);
          textNode.textContent = "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]";
          if (settings.config.isCustom) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME,
            );
          } else if (!settings.config.lastPromptName) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME,
            );
          } else {
            deleteNoteOf(
              settings.config.boundCharacter ?? "",
              settings.config.lastPromptName,
            )
              .then(() => {
                refreshSelectBoxElement(
                  modal,
                  box,
                  textArea[0],
                  characterId,
                ).finally(() => {
                  box.setSelected("#custom");
                  box.runSelected();
                  ToastifyInjector.findInjector().doToastifyAlert(
                    "선택한 유저노트를 삭제했어요.\n예기치 못한 오류를 방지하기 위해 현재 선택한 유저노트는 커스텀으로 변경됐어요.",
                    STANDARD_NOTIFICATION_TIME,
                  );
                });
              })
              .catch((err) => {
                console.error(err);
                ToastifyInjector.findInjector().doToastifyAlert(
                  "유저노트를 삭제하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                  STANDARD_NOTIFICATION_TIME,
                );
              });
          }
        } else {
          textNode.textContent = `유저노트 프리셋 [${GenericUtil.formatNumber(
            0.1 * pressTime,
            1,
            1,
          )}초 길게 눌러 노트 삭제]`;
        }
      }, 100);

      textNode.onmouseup = () => {
        clearInterval(timer);
        textNode.textContent = "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]";
      };
    };

    textNode.ontouchstart = (event) => {
      event.preventDefault();
      event.stopPropagation();
      let pressTime = 30;
      const timer = setInterval(() => {
        if (pressTime-- <= 0) {
          clearInterval(timer);
          textNode.textContent = "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]";
          if (settings.config.isCustom) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME,
            );
          } else if (!settings.config.lastPromptName) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME,
            );
          } else {
            if (
              !confirm(
                "정말로 현재 노트를 삭제할까요?\n모바일 환경은 실수를 방지하기 위해 확인 절차가 존재해요.",
              )
            ) {
              return;
            }
            deleteNoteOf(
              settings.config.boundCharacter ?? "",
              settings.config.lastPromptName,
            )
              .then(() => {
                refreshSelectBoxElement(
                  modal,
                  box,
                  textArea[0],
                  characterId,
                ).finally(() => {
                  box.setSelected("#custom");
                  box.runSelected();
                  ToastifyInjector.findInjector().doToastifyAlert(
                    "선택한 유저노트를 삭제했어요.\n예기치 못한 오류를 방지하기 위해 현재 선택한 유저노트는 커스텀으로 변경됐어요.",
                    STANDARD_NOTIFICATION_TIME,
                  );
                });
              })
              .catch((err) => {
                console.error(err);
                ToastifyInjector.findInjector().doToastifyAlert(
                  "유저노트를 삭제하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                  STANDARD_NOTIFICATION_TIME,
                );
              });
          }
        } else {
          textNode.textContent = `유저노트 프리셋 [${GenericUtil.formatNumber(
            0.1 * pressTime,
            1,
            1,
          )}초 길게 눌러 노트 삭제]`;
        }
      }, 100);

      textNode.ontouchend = () => {
        clearInterval(timer);
        textNode.textContent = "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]";
      };

      textNode.ontouchcancel = () => {
        clearInterval(timer);
        textNode.textContent = "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]";
      };
    };
    GenericUtil.refine(box.node.parentElement).style = "padding: 0px;";
    GenericUtil.refine(box.node.previousSibling).style =
      "padding: 0px; padding-bottom: 8px;";

    GenericUtil.refine(box.node.parentElement).classList.add(
      "chasm-ddia-zero-paddings",
    );
    GenericUtil.refine(box.node.previousElementSibling).classList.add(
      "chasm-ddia-custom-paddings",
    );

    const split = window.location.pathname.substring(1).split("/");
    const characterId = split[1];
    refreshSelectBoxElement(modal, box, textArea[0], characterId).then(() => {
      getSelected(characterId).then((result) => {
        if (result) {
          box.setSelected(result);
          box.runSelected();
        }
      });
    });
    box.node.id = "chasm-ddia-note-listing";

    const node = appender.constructInputGrid(
      "chasm-ddia-user-note-name",
      "프롬프트 이름 지정",
      true,
    );
    GenericUtil.refine(node.parentElement).style.cssText = "display: none;";

    GenericUtil.refine(node.parentElement).classList.add(
      "chasm-ddia-zero-paddings",
    );
    GenericUtil.refine(node.previousElementSibling).classList.add(
      "chasm-ddia-custom-paddings",
    );
    GenericUtil.refine(node.parentElement).classList.add(
      "decentral-color-container",
    );
    const button = modal.getElementsByTagName("button");
    if (button.length > 0) {
      const buttonBefore = button[button.length - 1];
      const newButton = GenericUtil.clone(buttonBefore);
      newButton.id = "chasm-ddia-save";
      newButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const split = window.location.pathname.substring(1).split("/");
        const characterId = split[1];
        const textContent = textArea[0].value;
        if (settings.config.isCustom) {
          const noteId = GenericUtil.refine(
            document.getElementById("chasm-ddia-user-note-name"),
          ).value;
          if (noteId.length <= 1) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "커스텀 유저노트는 최소 1자 이상의 이름을 가져야 합니다.",
              STANDARD_NOTIFICATION_TIME,
            );
            return;
          }
          const isGlobal = confirm("전역 유저노트로 저장할까요?");
          const message = isGlobal
            ? `현재 캐릭터와 연결된 유저 노트 \n"${noteId}"\n를 저장했어요.`
            : `전역 유저 노트 \n"${noteId}"\n를 저장했어요.`;
          saveNoteOf(isGlobal ? "#global" : characterId, noteId, textContent)
            .then(() => {
              refreshSelectBoxElement(
                modal,
                box,
                textArea[0],
                characterId,
              ).then(() => {
                ToastifyInjector.findInjector().doToastifyAlert(
                  message,
                  STANDARD_NOTIFICATION_TIME,
                );
              });
            })
            .catch((err) => {
              ToastifyInjector.findInjector().doToastifyAlert(
                "유저노트를 저장하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME,
              );
              console.error(err);
            });
        } else {
          const message =
            settings.config.boundCharacter !== "#global"
              ? `현재 캐릭터와 연결된 유저 노트 \n"${settings.config.lastPromptName}"\n를 저장했어요.`
              : `전역 유저 노트 \n"${settings.config.lastPromptName}"\n를 저장했어요.`;
          if (
            !settings.config.boundCharacter ||
            !settings.config.lastPromptName
          ) {
            alert(
              "컨테이너 오류가 발생했어요.\n지원 채널에 이 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
            );
            return;
          }
          saveNoteOf(
            settings.config.boundCharacter,
            settings.config.lastPromptName,
            textContent,
          )
            .then(() => {
              refreshSelectBoxElement(
                modal,
                box,
                textArea[0],
                characterId,
              ).then(() => {
                ToastifyInjector.findInjector().doToastifyAlert(
                  message,
                  STANDARD_NOTIFICATION_TIME,
                );
              });
            })
            .catch((err) => {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "유저노트를 저장하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME,
              );
            });
        }
      };
      newButton.childNodes[newButton.childNodes.length - 1].textContent =
        "저장";
      newButton.style.cssText =
        "cursor: pointer; background-color: var(--outline_action_blue);";
      buttonBefore.before(newButton);
    }
  }

  function setup() {
    injectModal();
  }

  /**
   *
   * @param {Element} modal
   * @param {any} box
   * @param {HTMLTextAreaElement} textArea
   * @param {string} characterId
   */
  async function refreshSelectBoxElement(modal, box, textArea, characterId) {
    const array = await findAllNoteOf(characterId);
    box.clear();
    box.addGroup("커스텀");
    box.addOption("커스텀", "#custom", () => {
      GenericUtil.refine(
        document.getElementById("chasm-ddia-user-note-name"),
      ).parentElement.style.cssText = "display: block;";
      GenericUtil.refine(
        document.getElementById("chasm-ddia-save"),
      ).removeAttribute("disabled");
      settings.config.isCustom = true;
      settings.config.boundCharacter = undefined;
      settings.config.lastPromptName = undefined;
      setLastSelected(characterId, "#custom");
      return true;
    });
    addElements(modal, box, textArea, characterId, array);
  }

  /**
   *
   * @param {Element} modal
   * @param {any} box
   * @param {HTMLTextAreaElement} textArea
   * @param {string} characterId
   * @param {CustomUserNote[]} array
   */
  function addElements(modal, box, textArea, characterId, array) {
    const global = [];
    const bound = [];
    for (let item of array) {
      if (item.bound === "#global") {
        global.push(item);
      } else {
        bound.push(item);
      }
    }
    if (global.length > 0) {
      box.addGroup("전역 유저노트");
      for (let item of global) {
        box.addOption(item.name, item.keyId, () => {
          GenericUtil.refine(
            document.getElementById("chasm-ddia-user-note-name"),
          ).parentElement.style.cssText = "display: none;";
          GenericUtil.refine(
            document.getElementById("chasm-ddia-save"),
          ).removeAttribute("disabled");
          settings.config.isCustom = false;
          settings.config.lastPromptName = item.name;
          settings.config.boundCharacter = item.bound;
          setLastSelected(characterId, item.keyId);
          getNoteOf(item.keyId)
            .then((note) => {
              if (note) {
                processNoteApply(note, modal, textArea);
              } else {
                if (textArea.value.length > 0) {
                  textArea.value = "";
                }
                ToastifyInjector.findInjector().doToastifyAlert(
                  "이미 삭제한 유저노트가 불러와졌어요.\n오류를 방지하기 위해 필드는 빈 값으로 유지돼요.",
                  STANDARD_NOTIFICATION_TIME,
                );
              }
            })
            .catch((err) => {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "로컬 저장고에서 유저노트를 가져오는 중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME,
              );
            });
          return true;
        });
      }
    }
    if (bound.length > 0) {
      box.addGroup("캐릭터 유저노트");
      for (let item of bound) {
        box.addOption(item.name, item.keyId, () => {
          GenericUtil.refine(document.getElementById(
            "chasm-ddia-user-note-name",
          )).parentElement.style.cssText = "display: none;";
          setLastSelected(characterId, item.keyId);
          GenericUtil.refine(document
            .getElementById("chasm-ddia-save"))
            .removeAttribute("disabled");
          settings.config.isCustom = false;
          settings.config.lastPromptName = item.name;
          settings.config.boundCharacter = item.bound;
          setLastSelected(characterId, item.keyId);
          getNoteOf(item.keyId)
            .then((note) => {
              if (note) {
                processNoteApply(note, modal, textArea);
              } else {
                if (textArea.validationMessage.length > 0) {
                  performTextAreaModification(textArea, "");
                }
                ToastifyInjector.findInjector().doToastifyAlert(
                  "이미 삭제한 유저노트가 불러와졌어요.\n오류를 방지하기 위해 필드는 빈 값으로 유지돼요.",
                  STANDARD_NOTIFICATION_TIME,
                );
              }
            })
            .catch((err) => {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "로컬 저장고에서 유저노트를 가져오는 중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME,
              );
            });
          return true;
        });
      }
    }
  }

  /**
   * 
   * @param {CustomUserNote} arr 
   * @param {any} modal 
   * @param {HTMLTextAreaElement} textArea 
   */
  async function processNoteApply(arr, modal, textArea) {
    if (arr.noteContent.length > 500) {
      if (textArea.maxLength <= 500) {
        let changed = false;
        for (const textElement of modal.getElementsByTagName("p")) {
          if (textElement.textContent === "유저노트 2000자 확장") {
            changed = true;
            textElement.nextElementSibling.click();
            try {
              const result = await autoClickConfirm();
              if (result) {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "불러올 유저노트가 500자를 초과해요.\n걱정하지 마세요, 모듈에서 자동으로 유저노트 확장을 적용했답니다!",
                  STANDARD_NOTIFICATION_TIME,
                );
              } else {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "불러올 유저노트가 500자를 초과해요.\n모듈에서 자동 처리를 시도했지만, 팝업 UI가 변경되어 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                  STANDARD_NOTIFICATION_TIME,
                );
              }
            } catch (err) {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "불러올 유저노트가 500자를 초과해요.\n모듈에서 자동 처리를 시도했지만, 알 수 없는 오류가 발생하여 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                STANDARD_NOTIFICATION_TIME,
              );
            }
          }
        }
        if (!changed) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "업데이트로 인해 유저노트 확장 버튼이 바뀌어 자동으로 확장을 적용할 수 없는 상태예요.\n수동으로 버튼을 눌러 2천자로 변경하고, 다시 노트를 불러와주세요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
            STANDARD_NOTIFICATION_TIME,
          );
        }
      }
      performTextAreaModification(textArea, arr.noteContent);
    } else {
      performTextAreaModification(textArea, arr.noteContent);
      if (textArea.maxLength > 500) {
        let changed = false;
        for (const textElement of modal.getElementsByTagName("p")) {
          if (textElement.textContent === "유저노트 2000자 확장") {
            changed = true;
            textElement.nextElementSibling.click();
            const result = await autoClickConfirm();
            try {
              if (result) {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "불러올 유저노트가 500자 이하예요.\n모듈에서 비용 감소를 위해 자동으로 확장을 비활성화했으니 안심하세요!",
                  STANDARD_NOTIFICATION_TIME,
                );
              } else {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "불러올 유저노트가 500자 이하예요.\n모듈에서 자동 처리를 시도했지만, 팝업 UI가 변경되어 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                  STANDARD_NOTIFICATION_TIME,
                );
              }
            } catch (err) {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "불러올 유저노트가 500자 이하예요.\n모듈에서 자동 처리를 시도했지만, 알 수 없는 오류가 발생하여 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                STANDARD_NOTIFICATION_TIME,
              );
            }
          }
        }
        if (!changed) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "업데이트로 인해 유저노트 확장 버튼이 바뀌어 자동으로 확장 토글을 적용할 수 없는 상태예요.\n수동으로 버튼을 눌러 500자로 변경하고, 다시 노트를 불러와주세요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
            STANDARD_NOTIFICATION_TIME,
          );
        }
      }
      performTextAreaModification(textArea, arr.noteContent);
    }
  }

  function findConfirmModal() {
    // 2025-11-23 기준
    // 다크 모드
    let modal = document.getElementsByClassName("css-1jho4hy");
    if (modal.length > 0) {
      return modal[0];
    }
    // 라이트 모드
    modal = document.getElementsByClassName("css-fthmbk");
    if (modal.length > 0) {
      return modal[0];
    }
    return undefined;
  }

  async function autoClickConfirm() {
    let retryCount = 0;
    while (retryCount++ < 40) {
      const confirmModal = findConfirmModal();
      if (confirmModal) {
        for (const button of confirmModal.getElementsByTagName("button")) {
          if (button.textContent === "확인") {
            button.click();
            return true;
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return false;
  }

  /**
   * 
   * @param {HTMLTextAreaElement} area 
   * @param {string} text 
   */
  function performTextAreaModification(area, text) {
    area.value = text;
    area.textContent = text;
    for (const key of Object.keys(area)) {
      if (key.startsWith("__reactProps")) {
        // @ts-ignore
        area[key].onChange({
          target: {
            value: text,
          },
        });
        break;
      }
    }
  }

  // =================================================
  //                  초기화
  // =================================================

  function prepare() {
    setup();
    GenericUtil.attachObserver(document, () => {
      setup();
    });
  }

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 꿈일기");
      panel.addText(
        "- decentralized-modal.js 프레임워크 사용 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)",
      );
    });
  }

  settings.load();
  addMenu();
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare));


  // =================================================
  //                  메뉴 강제 추가
  // =================================================
  function __updateModalMenu() {
    const modal = document.getElementById("web-modal");
    if (modal && !document.getElementById("chasm-decentral-menu")) {
      const itemFound = modal.getElementsByTagName("a");
      for (let item of itemFound) {
        if (item.getAttribute("href") === "/setting") {
          const clonedElement = GenericUtil.clone(item);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("span")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          item.parentElement?.append(clonedElement);
          break;
        }
      }
    } else if (
      !document.getElementById("chasm-decentral-menu") &&
      !window.matchMedia("(min-width: 768px)").matches
    ) {
      // Probably it's mobile, lets try scanning
      const selected = document.getElementsByTagName("a");
      for (const element of selected) {
        if (element.getAttribute("href") === "/my-page") {
          const clonedElement = GenericUtil.clone(element);
          clonedElement.id = "chasm-decentral-menu";
          const textElement = clonedElement.getElementsByTagName("span")[0];
          textElement.innerText = "결정화 캐즘";
          clonedElement.setAttribute("href", "javascript: void(0)");
          clonedElement.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            ModalManager.getOrCreateManager("c2")
              .withLicenseCredential()
              .display(document.body.getAttribute("data-theme") !== "light");
          };
          element.parentElement?.append(clonedElement);
        }
      }
    }
  }

  function __doModalMenuInit() {
    const refined = GenericUtil.refine(document);
    if (refined.c2ModalInit) return;
    refined.c2ModalInit = true;
    GenericUtil.attachObserver(document, () => {
      __updateModalMenu();
    });
  }
  __doModalMenuInit();
})();
