/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/dexie.js" />

// ==UserScript==
// @name         Chasm Crystallized DreamDiary (크랙 / 캐즘 꿈일기)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-DDIA-v1.1.5
// @description  유저노트 저장 / 불러오기 기능 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/dreamdiary.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/dreamdiary.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@4.2.1/dist/dexie.min.js#sha256-STeEejq7AcFOvsszbzgCDL82AjypbLLjD5O6tUByfuA=
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.13/decentralized-modal.js#sha256-tt5YRTDFPCoQwcSaw4d4QnjTytPbyVNLzM3g8rkdi8Q=
// @grant        GM_addStyle
// ==/UserScript==
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
  const db = new Dexie("chasm-dream-diary");
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

  function formatNumber(number, minDigit = 1, maxdigit = 1) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: minDigit,
      maximumFractionDigits: maxdigit,
    });
  }
  // =====================================================
  //                 Toastify Injection
  // =====================================================
  /**
   * 크랙 플랫폼의 Toastify 인젝션을 쉽게 해주는 유틸리티 클래스입니다.
   */
  class ToastifyInjector {
    /**
     * 마지막으로 등록된 인젝터를 가져오거나, 등록합니다.
     * @returns {ToastifyInjector} 등록된 인스턴스
     */
    static findInjector() {
      if (document.__toastifyInjector) {
        return document.__toastifyInjector;
      }
      document.__toastifyInjector = new ToastifyInjector();
      return document.__toastifyInjector;
    }

    /**
     * ToastifyInjector을 초기화합니다.
     */
    constructor() {
      this.#init();
    }

    /**
     * 삽입된 알림 요소의 트래킹을 진행합니다.
     */
    #trackNotification() {
      const current = new Date().getTime();
      const toastifies = document.getElementsByClassName("Toastify");
      if (toastifies.length <= 0) {
        return;
      }
      const rootNode = toastifies[0];
      if (rootNode.childNodes.length > 0) {
        if (
          rootNode.getElementsByClassName("chasm-toastify-track").length !=
          rootNode.childNodes.length
        ) {
          for (const element of Array.from(
            rootNode.getElementsByClassName("chasm-toastify-track")
          )) {
            if (element.hasAttribute("completed")) {
              element.removeAttribute("completed");
              element.removeAt = current + 1000;
            }
          }
        }
      }
      for (const element of rootNode.getElementsByClassName(
        "chasm-toastify-track"
      )) {
        if (element.expireAt < current && element.hasAttribute("completed")) {
          element.removeAttribute("completed");
          element.removeAt = current + 1000;
        } else if (element.removeAt < current) {
          element.remove();
        }
      }
    }
    #init() {
      GM_addStyle(`
        .chasm-toastify-track {
            transform: translateY(-200%);
            transition: transform 0.4s;
        }

        .chasm-toastify-track[completed="true"] {
            transform: translateY(0);
            transition: transform 0.4s;
        }
    `);

      setInterval(this.#trackNotification, 50);
    }

    /**
     * 알림 요소를 삽입합니다.
     * 해당 펑션으로 삽입된 알림은 기존 알림을 강제로 제거합니다.
     *
     * 해당 펑션은 크랙 스타일 알림을 생성합니다.
     * @param {string} message 표시할 메시지
     * @param {number} expires 유지 시간 (ms)
     */
    doToastifyAlert(message, expires = 3000) {
      const textNode = document.createElement("p");
      textNode.textContent = message;
      textNode.style =
        "color: #FFFFFF; text-align: center; font-size: 16px; line-height: 140%; font-weight: 600; white-space: pre-line;";

      const containerNode = document.createElement("div");
      containerNode.style =
        "background-color: rgb(46, 45, 43); padding: 16px; border-radius: 10px; width: 100%; max-width: 95vw; height: 100%;";

      containerNode.append(textNode);

      const wrapperNode = document.createElement("div");
      wrapperNode.className =
        "Toastify__toast-container Toastify__toast-container--top-center chasm-toastify-track";
      wrapperNode.style.cssText =
        "background: transparent; min-width: 461px; min-height: 0px; height: fit-content; border-radius: 10px; justify-content: center; left: auto; justify-self: center;";
      wrapperNode.append(containerNode);

      wrapperNode.expireAt = new Date().getTime() + expires;

      const toastifies = document.getElementsByClassName("Toastify");
      if (toastifies.length <= 0) {
        return;
      }
      if (toastifies.length > 0) {
        for (const element of Array.from(toastifies[0].childNodes)) {
          element.remove();
        }
      }
      const rootNode = toastifies[0];
      rootNode.append(wrapperNode);
      setTimeout(() => {
        wrapperNode.setAttribute("completed", "true");
      });
    }
  }
  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    lastPromptName: undefined,
    boundCharacter: undefined,
    lastPromptDisplay: undefined,
    isCustom: false,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-crck-ddia-settings");
    if (loadedSettings) {
      const json = JSON.parse(loadedSettings);
      for (let key of Object.keys(json)) {
        // Merge setting for version compatibility support
        settings[key] = json[key];
      }
    }
  }

  function saveSettings() {
    log("설정 저장중..");
    // Yay, no need to filtering anything!
    localStorage.setItem("chasm-crck-ddia-settings", JSON.stringify(settings));
    log("설정 저장 완료");
  }

  // =================================================
  //                유틸리티성 메서드
  // =================================================
  /**
   * 지정한 노드 혹은 요소에 변경 옵저버를 등록합니다.
   * @param {*} observeTarget 변경 감지 대상
   * @param {*} lambda 실행할 람다
   */
  function attachObserver(observeTarget, lambda) {
    const Observer = window.MutationObserver || window.WebKitMutationObserver;
    if (observeTarget && Observer) {
      let instance = new Observer(lambda);
      instance.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  }
  /**
   * 콘솔에 지정한 포맷으로 디버그를 출력합니다.
   * @param {*} message 출력할 메시지
   */
  function log(message) {
    console.log(
      "%cChasm Crystallized DreamDiary: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

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
        (data) =>
          new CustomUserNote(
            data.keyName,
            data.noteName,
            data.boundCharacter,
            data.noteContent,
            data.savedAt
          )
      );
  }

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

  async function setLastSelected(character, key) {
    await db.lastSelected.put({
      boundCharacter: character,
      selected: key,
    });
  }

  async function removeLastSelected(character) {
    await db.lastSelected.remove(character);
  }

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
      data[0].savedAt
    );
  }

  async function deleteNoteOf(character, noteName) {
    try {
      await db.noteStore.delete(`${character}!+${noteName}`);
    } catch (err) {
      console.error(err);
    }
  }
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

  async function saveNoteKeyOf(key, contents) {
    await db.noteStore.put({
      keyName: key,
      noteName: noteName,
      boundCharacter: character,
      noteContent: contents,
      savedAt: new Date().getTime(),
    });
  }

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
    return undefined;
  }

  
  function findUserNoteField() {
    // 2025-11-23 기준
    const pool = [
      // 다크 모드 활성화
      "css-1ljuz6k eh9908w0",
      // 다크 모드 일반
      "css-l1gepk",
      // 라이트 모드 일반
      "css-ta1jwd",
      // 라이트 모드 활성화
      "css-125x1f1",
    ];
    for (const key of pool) {
      const found = document.getElementsByClassName(key);
      if (found.length > 0) {
        return found[0];
      }
    }
    return undefined;
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
      settings.lastPromptName ?? "--이름을 지정하세요--",
      "chasm-ddia-settings#nonreachable",
      true
    );
    /** @type {HTMLElement} */
    const textNode = box.node.parentElement.childNodes[0];
    textNode.style.cssText = "user-select: none !important;";
    textNode.onmousedown = (event) => {
      let pressTime = 30;
      const timer = setInterval(() => {
        if (pressTime-- <= 0) {
          clearInterval(timer);
          textNode.textContent = "유저노트 프리셋 [3.0초 길게 눌러 노트 삭제]";
          if (settings.isCustom) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME
            );
          } else if (!settings.lastPromptName) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME
            );
          } else {
            deleteNoteOf(settings.boundCharacter, settings.lastPromptName)
              .then(() => {
                refreshSelectBoxElement(
                  modal,
                  box,
                  textArea[0],
                  characterId
                ).finally(() => {
                  box.setSelected("#custom");
                  box.runSelected();
                  ToastifyInjector.findInjector().doToastifyAlert(
                    "선택한 유저노트를 삭제했어요.\n예기치 못한 오류를 방지하기 위해 현재 선택한 유저노트는 커스텀으로 변경됐어요.",
                    STANDARD_NOTIFICATION_TIME
                  );
                });
              })
              .catch((err) => {
                console.error(err);
                ToastifyInjector.findInjector().doToastifyAlert(
                  "유저노트를 삭제하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                  STANDARD_NOTIFICATION_TIME
                );
              });
          }
        } else {
          textNode.textContent = `유저노트 프리셋 [${formatNumber(
            0.1 * pressTime,
            1,
            1
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
          if (settings.isCustom) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME
            );
          } else if (!settings.lastPromptName) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "프롬프트 프리셋을 선택하지 않은 상태에서는 삭제할 수 없어요.",
              STANDARD_NOTIFICATION_TIME
            );
          } else {
            if (
              !confirm(
                "정말로 현재 노트를 삭제할까요?\n모바일 환경은 실수를 방지하기 위해 확인 절차가 존재해요."
              )
            ) {
              return;
            }
            deleteNoteOf(settings.boundCharacter, settings.lastPromptName)
              .then(() => {
                refreshSelectBoxElement(
                  modal,
                  box,
                  textArea[0],
                  characterId
                ).finally(() => {
                  box.setSelected("#custom");
                  box.runSelected();
                  ToastifyInjector.findInjector().doToastifyAlert(
                    "선택한 유저노트를 삭제했어요.\n예기치 못한 오류를 방지하기 위해 현재 선택한 유저노트는 커스텀으로 변경됐어요.",
                    STANDARD_NOTIFICATION_TIME
                  );
                });
              })
              .catch((err) => {
                console.error(err);
                ToastifyInjector.findInjector().doToastifyAlert(
                  "유저노트를 삭제하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                  STANDARD_NOTIFICATION_TIME
                );
              });
          }
        } else {
          textNode.textContent = `유저노트 프리셋 [${formatNumber(
            0.1 * pressTime,
            1,
            1
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
    box.node.parentElement.style = "padding: 0px;";
    box.node.previousSibling.style = "padding: 0px; padding-bottom: 8px;";

    box.node.parentElement.classList.add("chasm-ddia-zero-paddings");
    box.node.previousElementSibling.classList.add("chasm-ddia-custom-paddings");

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
      true
    );
    node.parentElement.style.cssText = "display: none;";

    node.parentElement.classList.add("chasm-ddia-zero-paddings");
    node.previousElementSibling.classList.add("chasm-ddia-custom-paddings");
    node.parentElement.classList.add("decentral-color-container");
    const button = modal.getElementsByTagName("button");
    if (button.length > 0) {
      const buttonBefore = button[button.length - 1];
      const newButton = buttonBefore.cloneNode(true);
      newButton.id = "chasm-ddia-save";
      newButton.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const split = window.location.pathname.substring(1).split("/");
        const characterId = split[1];
        const textContent = textArea[0].value;
        if (settings.isCustom) {
          const noteId = document.getElementById(
            "chasm-ddia-user-note-name"
          ).value;
          if (noteId.length <= 1) {
            ToastifyInjector.findInjector().doToastifyAlert(
              "커스텀 유저노트는 최소 1자 이상의 이름을 가져야 합니다.",
              STANDARD_NOTIFICATION_TIME
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
                characterId
              ).then(() => {
                ToastifyInjector.findInjector().doToastifyAlert(
                  message,
                  STANDARD_NOTIFICATION_TIME
                );
              });
            })
            .catch((err) => {
              ToastifyInjector.findInjector().doToastifyAlert(
                "유저노트를 저장하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME
              );
              console.error(err);
            });
        } else {
          const message =
            settings.boundCharacter !== "#global"
              ? `현재 캐릭터와 연결된 유저 노트 \n"${settings.lastPromptName}"\n를 저장했어요.`
              : `전역 유저 노트 \n"${settings.lastPromptName}"\n를 저장했어요.`;
          saveNoteOf(
            settings.boundCharacter,
            settings.lastPromptName,
            textContent
          )
            .then(() => {
              refreshSelectBoxElement(
                modal,
                box,
                textArea[0],
                characterId
              ).then(() => {
                ToastifyInjector.findInjector().doToastifyAlert(
                  message,
                  STANDARD_NOTIFICATION_TIME
                );
              });
            })
            .catch((err) => {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "유저노트를 저장하는 도중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME
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

  async function refreshSelectBoxElement(modal, box, textArea, characterId) {
    const array = await findAllNoteOf(characterId);
    box.clear();
    box.addGroup("커스텀");
    box.addOption("커스텀", "#custom", () => {
      document.getElementById(
        "chasm-ddia-user-note-name"
      ).parentElement.style.cssText = "display: block;";
      document
        .getElementById("chasm-ddia-save")
        .removeAttribute("disabled");
      settings.isCustom = true;
      settings.boundCharacter = undefined;
      settings.lastPromptName = undefined;
      setLastSelected(characterId, "#custom");
      return true;
    });
    addElements(modal, box, textArea, characterId, array);
  }

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
          document.getElementById(
            "chasm-ddia-user-note-name"
          ).parentElement.style.cssText = "display: none;";
          document
            .getElementById("chasm-ddia-save")
            .removeAttribute("disabled");
          settings.isCustom = false;
          settings.lastPromptName = item.name;
          settings.boundCharacter = item.bound;
          setLastSelected(characterId, item.keyId);
          getNoteOf(item.keyId)
            .then((note) => {
              if (note) {
                processNoteApply(note, modal, textArea);
              } else {
                if (textArea.length > 0) {
                  textArea[0].value = "";
                }
                ToastifyInjector.findInjector().doToastifyAlert(
                  "이미 삭제한 유저노트가 불러와졌어요.\n오류를 방지하기 위해 필드는 빈 값으로 유지돼요.",
                  STANDARD_NOTIFICATION_TIME
                );
              }
            })
            .catch((err) => {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "로컬 저장고에서 유저노트를 가져오는 중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME
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
          document.getElementById(
            "chasm-ddia-user-note-name"
          ).parentElement.style.cssText = "display: none;";
          setLastSelected(characterId, item.keyId);
          document
            .getElementById("chasm-ddia-save")
            .removeAttribute("disabled");
          settings.isCustom = false;
          settings.lastPromptName = item.name;
          settings.boundCharacter = item.bound;
          setLastSelected(characterId, item.keyId);
          getNoteOf(item.keyId)
            .then((note) => {
              if (note) {
                processNoteApply(note, modal, textArea);
              } else {
                if (textArea.length > 0) {
                  performTextAreaModification(textArea, "");
                }
                ToastifyInjector.findInjector().doToastifyAlert(
                  "이미 삭제한 유저노트가 불러와졌어요.\n오류를 방지하기 위해 필드는 빈 값으로 유지돼요.",
                  STANDARD_NOTIFICATION_TIME
                );
              }
            })
            .catch((err) => {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "로컬 저장고에서 유저노트를 가져오는 중 오류가 발생했어요.\n콘솔에 발생한 오류를 제보해주시면 캐즘 프로젝트의 개선에 도움을 줄 수 있어요.",
                STANDARD_NOTIFICATION_TIME
              );
            });
          return true;
        });
      }
    }
  }

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
                  STANDARD_NOTIFICATION_TIME
                );
              } else {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "불러올 유저노트가 500자를 초과해요.\n모듈에서 자동 처리를 시도했지만, 팝업 UI가 변경되어 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                  STANDARD_NOTIFICATION_TIME
                );
              }
            } catch (err) {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "불러올 유저노트가 500자를 초과해요.\n모듈에서 자동 처리를 시도했지만, 알 수 없는 오류가 발생하여 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                STANDARD_NOTIFICATION_TIME
              );
            }
          }
        }
        if (!changed) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "업데이트로 인해 유저노트 확장 버튼이 바뀌어 자동으로 확장을 적용할 수 없는 상태예요.\n수동으로 버튼을 눌러 2천자로 변경하고, 다시 노트를 불러와주세요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
            STANDARD_NOTIFICATION_TIME
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
                  STANDARD_NOTIFICATION_TIME
                );
              } else {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "불러올 유저노트가 500자 이하예요.\n모듈에서 자동 처리를 시도했지만, 팝업 UI가 변경되어 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                  STANDARD_NOTIFICATION_TIME
                );
              }
            } catch (err) {
              console.error(err);
              ToastifyInjector.findInjector().doToastifyAlert(
                "불러올 유저노트가 500자 이하예요.\n모듈에서 자동 처리를 시도했지만, 알 수 없는 오류가 발생하여 완전 자동 처리는 실패했어요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
                STANDARD_NOTIFICATION_TIME
              );
            }
          }
        }
        if (!changed) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "업데이트로 인해 유저노트 확장 버튼이 바뀌어 자동으로 확장 토글을 적용할 수 없는 상태예요.\n수동으로 버튼을 눌러 500자로 변경하고, 다시 노트를 불러와주세요.\n이 오류는 결정화 캐즘 팀에 제보하면 빠르게 고칠 수 있어요.",
            STANDARD_NOTIFICATION_TIME
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

  function performTextAreaModification(area, text) {
    area.value = text;
    area.textContent = text;
    for (const key of Object.keys(area)) {
      if (key.startsWith("__reactProps")) {
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
    attachObserver(document, () => {
      setup();
    });
  }

  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.addLicenseDisplay((panel) => {
      panel.addTitleText("결정화 캐즘 꿈일기");
      panel.addText(
        "- decentralized-modal.js 프레임워크 사용 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)"
      );
    });
  }

  loadSettings();
  addMenu();
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);

  // =================================================
  //                  메뉴 강제 추가
  // =================================================
  function __updateModalMenu() {
    const modal = document.getElementById("web-modal");
    if (modal && !document.getElementById("chasm-decentral-menu")) {
      const itemFound = modal.getElementsByTagName("a");
      for (let item of itemFound) {
        if (item.getAttribute("href") === "/setting") {
          const clonedElement = item.cloneNode(true);
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
          item.parentElement.append(clonedElement);
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
          const clonedElement = element.cloneNode(true);
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
          element.parentElement.append(clonedElement);
        }
      }
    }
  }

  function __doModalMenuInit() {
    if (document.c2ModalInit) return;
    document.c2ModalInit = true;
    attachObserver(document, () => {
      __updateModalMenu();
    });
  }
  __doModalMenuInit();
})();
