/// <reference path="../decentralized-modal.js" />
// ==UserScript==
// @name         Chasm Crystallized Lyophilization (결정화 캐즘 동결건조)
// @namespace    https://github.com/milkyway0308/crystallized-chasm/
// @version      CRYS-LYOP-v1.0.0
// @description  채팅방 백업 및 완전한 아카이브화 지원. 이 기능은 원본 채팅 백업 확장 스크립트의 유지보수 버전입니다.
// @author       milkyway0308
// @match        https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/lyophilization.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/lyophilization.user.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/4e25ff24b52aaa00c70d74ab19a13d6617fc59b8/crack/libraries/toastify-injection.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/4e25ff24b52aaa00c70d74ab19a13d6617fc59b8/crack/libraries/crack-shared-core.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/4e25ff24b52aaa00c70d74ab19a13d6617fc59b8/libraries/chasm-shared-core.js
// @require      https://github.com/milkyway0308/crystallized-chasm/raw/4e25ff24b52aaa00c70d74ab19a13d6617fc59b8/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==

// @ts-check
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />
(function () {
  function createCopySVG() {
    return `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z" fill="var(--icon_tertiary)"></path> </g></svg>`;
  }

  function createDownloadSVG() {
    return `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.625 15C5.625 14.5858 5.28921 14.25 4.875 14.25C4.46079 14.25 4.125 14.5858 4.125 15H5.625ZM4.875 16H4.125H4.875ZM19.275 15C19.275 14.5858 18.9392 14.25 18.525 14.25C18.1108 14.25 17.775 14.5858 17.775 15H19.275ZM11.1086 15.5387C10.8539 15.8653 10.9121 16.3366 11.2387 16.5914C11.5653 16.8461 12.0366 16.7879 12.2914 16.4613L11.1086 15.5387ZM16.1914 11.4613C16.4461 11.1347 16.3879 10.6634 16.0613 10.4086C15.7347 10.1539 15.2634 10.2121 15.0086 10.5387L16.1914 11.4613ZM11.1086 16.4613C11.3634 16.7879 11.8347 16.8461 12.1613 16.5914C12.4879 16.3366 12.5461 15.8653 12.2914 15.5387L11.1086 16.4613ZM8.39138 10.5387C8.13662 10.2121 7.66533 10.1539 7.33873 10.4086C7.01212 10.6634 6.95387 11.1347 7.20862 11.4613L8.39138 10.5387ZM10.95 16C10.95 16.4142 11.2858 16.75 11.7 16.75C12.1142 16.75 12.45 16.4142 12.45 16H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM4.125 15V16H5.625V15H4.125ZM4.125 16C4.125 18.0531 5.75257 19.75 7.8 19.75V18.25C6.61657 18.25 5.625 17.2607 5.625 16H4.125ZM7.8 19.75H15.6V18.25H7.8V19.75ZM15.6 19.75C17.6474 19.75 19.275 18.0531 19.275 16H17.775C17.775 17.2607 16.7834 18.25 15.6 18.25V19.75ZM19.275 16V15H17.775V16H19.275ZM12.2914 16.4613L16.1914 11.4613L15.0086 10.5387L11.1086 15.5387L12.2914 16.4613ZM12.2914 15.5387L8.39138 10.5387L7.20862 11.4613L11.1086 16.4613L12.2914 15.5387ZM12.45 16V5H10.95V16H12.45Z" fill="var(--icon_tertiary)"></path> </g></svg>`;
  }

  function createHTMLSVG() {
    return `<svg width="24px" height="24px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="var(--icon_tertiary)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M4 16v-2H2v2H1v-5h1v2h2v-2h1v5H4zM7 16v-4H5.6v-1h3.7v1H8v4H7zM10 16v-5h1l1.4 3.4h.1L14 11h1v5h-1v-3.1h-.1l-1.1 2.5h-.6l-1.1-2.5H11V16h-1zM19 16h-3v-5h1v4h2v1zM9.4 4.2L7.1 6.5l2.3 2.3-.6 1.2-3.5-3.5L8.8 3l.6 1.2zm1.2 4.6l2.3-2.3-2.3-2.3.6-1.2 3.5 3.5-3.5 3.5-.6-1.2z"></path> </g> </g></svg>`;
  }

  // =================================================
  //                    HTML 추출 유틸리티
  // =================================================

  // =================================================
  //                    초기화
  // =================================================
  function setup() {
    if (!CrackUtil.path().isChattingPath()) return;
    injectButton(
      "chasm-lyop-extract-raw-copy",
      createCopySVG(),
      "로그 복사",
      () => {
        const currentId = CrackUtil.path().chatRoom();
        if (!currentId) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "채팅방 ID를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요.",
            3000,
          );
          return;
        }
        ToastifyInjector.findInjector().doToastifyAlert(
          "메시지를 불러오고 있어요.",
          3000,
        );
        const amount = parseInt(
          prompt(
            "최대 몇 개의 메시지를 가져올까요?\n0으로 입력시, 모든 메시지를 가져옵니다.",
            "0",
          ) ?? "",
        );
        if (amount === undefined || amount === null || amount === Number.NaN) {
          return;
        }
        if (amount < 0) {
          confirm("0개 미만의 개수는 가져올 수 없습니다.");
          return;
        }
        CrackUtil.chatRoom()
          .extractLogs(currentId, { maxCount: amount <= 0 ? -1 : amount })
          .then(async (result) => {
            try {
              if (result instanceof Error) {
                ToastifyInjector.findInjector().doToastifyAlert(
                  "메시지를 가져오는 도중 오류가 발생했어요.",
                );
              } else {
                await window.navigator.clipboard.writeText(
                  JSON.stringify(
                    {
                      messages: result.map((it) => it.simplify()),
                    },
                    undefined,
                    2,
                  ),
                );
              }
              ToastifyInjector.findInjector().doToastifyAlert(
                "클립보드로 채팅방 데이터를 복사했어요.",
              );
            } catch (e) {
              ToastifyInjector.findInjector().doToastifyAlert(
                "클립보드로 데이터를 붙여넣는 도중 오류가 발생했어요.",
              );
            }
          })
          .catch((err) => {
            console.error(err);
            ToastifyInjector.findInjector().doToastifyAlert(
              "메시지를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요.",
            );
          });
      },
    );
    injectButton(
      "chasm-lyop-extract-raw",
      createDownloadSVG(),
      "로그 추출",
      () => {
        const currentId = CrackUtil.path().chatRoom();
        if (!currentId) {
          ToastifyInjector.findInjector().doToastifyAlert(
            "채팅방 ID를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요.",
            3000,
          );
          return;
        }
        ToastifyInjector.findInjector().doToastifyAlert(
          "메시지를 불러오고 있어요.",
          3000,
        );
        const amount = parseInt(
          prompt(
            "최대 몇 개의 메시지를 가져올까요?\n0으로 입력시, 모든 메시지를 가져옵니다.",
            "0",
          ) ?? "",
        );
        if (amount === undefined || amount === null || amount === Number.NaN) {
          return;
        }
        if (amount < 0) {
          confirm("0개 미만의 개수는 가져올 수 없습니다.");
          return;
        }
        CrackUtil.chatRoom()
          .extractLogs(currentId, { maxCount: amount <= 0 ? -1 : amount })
          .then(async (result) => {
            const blob = new Blob(
              [
                JSON.stringify({
                  messages: result,
                }),
              ],
              { type: "text/plain;charset=UTF-8" },
            );

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${CrackUtil.path().chatRoom()}.txt`;
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
          })
          .catch((err) => {
            console.error(err);
            ToastifyInjector.findInjector().doToastifyAlert(
              "메시지를 가져오는데에 실패했어요.\n결정화 캐즘 프로젝트 지원 채널에 제보해주세요.",
            );
          });
      },
    );
    // injectButton(
    //   "chasm-lyop-extract-html",
    //   createHTMLSVG(),
    //   "HTML로 추출",
    //   () => {

    //   }
    // );
  }

  /**
   *
   * @param {string} id
   * @param {string} svg
   * @param {string} title
   * @param {() => void} action
   * @returns
   */
  function injectButton(id, svg, title, action) {
    const item = document.getElementsByClassName(id);
    if (item.length > 0) {
      return;
    }
    const panel = CrackUtil.component().sidePanel();
    if (!panel) {
      return;
    }
    let appendingTarget = document.getElementById("chasm-lyop-eof");
    if (!appendingTarget) {
      for (let element of panel.getElementsByTagName("p")) {
        if (element.textContent === "나의 크래커") {
          const itemElement = GenericUtil.clone(element);
          itemElement.textContent = "채팅 내역 추출";
          panel.insertBefore(itemElement, element);
          const divier = document.createElement("div");
          divier.style.cssText = "height: 40px;";
          divier.id = "chasm-lyop-eof";
          itemElement.after(divier);
          break;
        }
      }
      appendingTarget = document.getElementById("chasm-lyop-eof");
    }
    if (!appendingTarget) return;
    /** @type {HTMLElement} */
    // @ts-ignore
    const button = GenericUtil.clone(panel.childNodes[1]);
    button.onclick = () => {};
    button.classList.add(id);
    button.addEventListener("click", action);
    if (svg) {
      const svgElements = button.getElementsByTagName("svg");
      if (svgElements.length > 0) {
        svgElements[0].outerHTML = svg;
      }
    }
    const components = button.getElementsByTagName("span");
    components[components.length - 1].textContent = title;

    panel.insertBefore(button, appendingTarget);
  }
  function prepare() {
    setup();
    GenericUtil.attachObserver(document, () => {
      setup();
    });
  }
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare));
})();
