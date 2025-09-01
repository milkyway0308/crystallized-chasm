// ==UserScript==
// @name        Chasm Crystallized Copy (결정화 캐즘 카피)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-COPY-v1.1.4
// @description 크랙의 캐릭터 퍼블리시/복사/붙여넣기 기능 구현 및 오류 수정. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오.
// @author      chasm-js, milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js
// @grant       none
// ==/UserScript==
!(function () {
  function decodeParameter(t) {
    return (t = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          t.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    ))
      ? decodeURIComponent(t[1])
      : void 0;
  }
  async function e(e, a, r) {
    try {
      (e = {
        method: e,
        headers: {
          Authorization: `Bearer ${decodeParameter("access_token")}`,
          "Content-Type": "application/json",
        },
      }),
        r && (e.body = JSON.stringify(r));
      const n = await fetch(a, e);
      if (!n.ok) throw Error(`HTTP error! Status: ${n.status}`);
      return await n.json();
    } catch (t) {
      return null;
    }
  }
  function a(t, e, a) {
    const r = a.cloneNode(!0),
      n = document.createElement("button");
    return (
      (n.innerHTML = r.innerHTML),
      (n.className = a.className),
      (a = n.querySelector("p")) && (a.textContent = t),
      n.removeAttribute("onClick"),
      n.addEventListener("click", (t) => {
        t.preventDefault(), t.stopPropagation(), e();
      }),
      n
    );
  }

  function acquireMenuElements() {
    // Dark mode
    let data = document.querySelectorAll(".css-19fu3mx");
    if (data && data.length > 0) {
      return data;
    }
    // Light mode
    return document.querySelectorAll(".css-19fu3mx");
  }

  function acquireMenu() {
    // Dark mode
    let data = document.querySelectorAll(".css-bf6s57");
    if (data && data.length > 0) {
      return data[0];
    }
    data = document.querySelectorAll(".css-10lwp0d");
    // Light mode
    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  }

  async function setup() {
    /^\/my(\/.*)?$/.test(location.pathname) &&
      decodeParameter("access_token") &&
      o(document.body, () => {
        acquireMenuElements().forEach((t) => {
          const t2 = t;
          t.onclick = () => {
            
            const e = (function (t) {
              try {
                const e = t.parentElement?.parentElement;
                if (!e) return null;
                const a = Object.keys(e).find((t) =>
                  t.startsWith("__reactProps")
                );
                if (!a) return null;
                const r = e[a];
                if (!r?.children) return null;
                const n = Array.isArray(r.children) ? r.children : [r.children];
                for (const t of n) {
                  if (t?.props?.character?._id) {
                    console.log(t2);
                    return t.props.character._id;
                  }
                }
                return null;
              } catch (t) {
                return null;
              }
            })(t);
            e && (window.currentClickedId = e);
          };
        });
        const menu = acquireMenu();
        if (menu === null) {
          return;
        }
        if (menu && menu.childNodes.length < 6) {
          const element = menu.childNodes[0].cloneNode(!0);
          menu.appendChild(
            a(
              "✦ 공개로 재게시",
              async () => {
                if (
                  window.currentClickedId &&
                  confirm("선택한 캐릭터를 공개 캐릭터로 복사하여 게시할까요?")
                ) {
                  var t = await i.getMycharacter(window.currentClickedId);
                  t
                    ? "SUCCESS" === (await t.publish(0))?.result
                      ? confirm(
                          "캐릭터 '" +
                            t.name +
                            "'을 공개 캐릭터로 새로 복사하여 게시하였습니다.\n페이지를 새로 고칠까요?"
                        ) && location.reload()
                      : alert("오류로 인해 캐릭터 복사에 실패하였습니다.")
                    : alert(
                        "캐릭터 데이터를 가져오던 중 오류가 발생하였습니다."
                      );
                }
              },
              element
            )
          ),
            menu.appendChild(
              a(
                "✦ 비공개로 재게시",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "선택한 캐릭터를 비공개 캐릭터로 복사하여 게시할까요?"
                    )
                  ) {
                    var t = await i.getMycharacter(window.currentClickedId);
                    t
                      ? "SUCCESS" === (await t.publish(1))?.result
                        ? confirm(
                            "캐릭터 '" +
                              t.name +
                              "'을 비공개 캐릭터로 새로 복사하여 게시하였습니다.\n페이지를 새로 고칠까요?"
                          ) && location.reload()
                        : alert("오류로 인해 캐릭터 복사에 실패하였습니다.")
                      : alert(
                          "캐릭터 데이터를 가져오던 중 오류가 발생하였습니다."
                        );
                  }
                },
                element
              )
            ),
            menu.appendChild(
              a(
                "✦ 링크 공개로 재게시",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "선택한 캐릭터를 링크 공개 캐릭터로 복사하여 게시할까요?"
                    )
                  ) {
                    var t = await i.getMycharacter(window.currentClickedId);
                    t
                      ? "SUCCESS" === (await t.publish(2))?.result
                        ? confirm(
                            "캐릭터 '" +
                              t.name +
                              "'을 링크 공개 캐릭터로 새로 복사하여 게시하였습니다.\n페이지를 새로 고칠까요?"
                          ) && location.reload()
                        : alert("오류로 인해 캐릭터 복사에 실패하였습니다.")
                      : alert(
                          "캐릭터 데이터를 가져오던 중 오류가 발생하였습니다."
                        );
                  }
                },
                element
              )
            ),
            menu.appendChild(
              a(
                "↙ JSON 복사",
                async () => {
                  if (window.currentClickedId) {
                    var t = await i.getMycharacter(window.currentClickedId);
                    t && (t = await t.get())
                      ? ((t = JSON.stringify(t, null, 2)),
                        navigator.clipboard.writeText(t),
                        alert("캐릭터 데이터가 클립보드로 복사되었습니다."))
                      : alert(
                          "캐릭터 데이터를 가져오던 중 오류가 발생하였습니다."
                        );
                  }
                },
                element
              )
            ),
            menu.appendChild(
              a(
                "↗ JSON 붙여넣기",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "Chasm Copy\n\n선택한 캐릭터의 데이터를 클립보드에 복사된 데이터로 덮어씌울까요?"
                    ) &&
                    confirm(
                      "Chasm Copy\n\n최종 확인입니다.\n선택한 캐릭터의 데이터를 클립보드에 복사된 데이터로 덮어씌울까요? 이 작업은 되돌릴 수 없습니다. \n선택한 캐릭터의 데이터는 영구적으로 클립보드의 데이터로 덮어씌워집니다."
                    )
                  ) {
                    var t = await (async function () {
                      try {
                        return await navigator.clipboard.readText();
                      } catch (t) {
                        return null;
                      }
                    })();
                    if (t) {
                      try {
                        var e = JSON.parse(t);
                      } catch (t) {
                        return void alert(
                          "클립보드 데이터가 유효한 JSON 형식이 아닙니다."
                        );
                      }
                      (t = await i.getMycharacter(window.currentClickedId))
                        ? (await t.set(t, e, false))
                          ? confirm(
                              "캐릭터 데이터의 덮어씌우기에 성공하였습니다.\n페이지를 새로 고칠까요?"
                            ) && location.reload()
                          : alert(
                              "오류로 인해 캐릭터 데이터 덮어쓰기에 실패하였습니다."
                            )
                        : alert(
                            "캐릭터 데이터를 가져오던 중 오류가 발생하였습니다."
                          );
                    } else alert("클립보드에서 데이터를 가져올 수 없습니다.");
                  }
                },
                element
              )
            ),
            menu.appendChild(
              a(
                "⚠ JSON 강제 붙여넣기",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "클립보드의 JSON 데이터로 캐릭터를 강제로 덮어씌우시겠습니까? 이 작업은 되돌릴 수 없습니다.\n **경고**: 강제 붙여넣기 기능은 기존 캐릭터를 망가뜨릴 수 있습니다.\n이 기능은 모든 다른 기능이 비활성화되어 작동하지 않을 때, 최후의 방법으로만 사용되어야 합니다."
                    ) &&
                    confirm(
                      "정말로 캐릭터 데이터를 덮어씌우시겠습니까? 기존 데이터는 모두 삭제됩니다."
                    ) &&
                    prompt(
                      "최종 확인입니다.\n**정말로** 캐릭터 데이터의 강제 덮어쓰기를 실행하시겠습니까?\n결정화 캐즘의 개발자와 관련자는 이 작업으로 이루어지는 손상 및 손해, 혹은 이익에 대해 어떠한 책임도 지지 않습니다.\n정말로 동의한다면, '동의한다'를 적고 확인을 누르세요."
                    ) === "동의한다"
                  ) {
                    var t = await (async function () {
                      try {
                        return await navigator.clipboard.readText();
                      } catch (t) {
                        return null;
                      }
                    })();
                    if (t) {
                      try {
                        var e = JSON.parse(t);
                      } catch (t) {
                        return void alert(
                          "클립보드 데이터가 유효한 JSON 형식이 아닙니다."
                        );
                      }
                      let clickedId = window.currentClickedId;
                      (t = await i.getMycharacter(window.currentClickedId))
                        ? (await i.setCharacter(clickedId, t, e, true, false))
                          ? (alert(
                              "캐릭터 데이터가 성공적으로 덮어씌워졌습니다!"
                            ),
                            confirm(
                              "캐릭터 데이터의 덮어씌우기에 성공하였습니다.\n페이지를 새로 고칠까요?"
                            ) && location.reload())
                          : alert(
                              "오류로 인해 캐릭터 데이터 덮어쓰기에 실패하였습니다."
                            )
                        : alert(
                            "캐릭터 데이터를 가져오던 중 오류가 발생하였습니다."
                          );
                    } else alert("클립보드에서 데이터를 가져올 수 없습니다.");
                  }
                },
                element
              )
            );
        }
      });
  }
  function prepare() {
    setup();
    let t = location.href;
    o(document, () => {
      location.href !== t && ((t = location.href), setup());
    });
  }
  const i = new (class {
      async getMycharacters(t, a) {
        return await e(
          "GET",
          t
            ? `https://contents-api.wrtn.ai/character/characters/me?limit=${a}&cursor=${t}`
            : `https://contents-api.wrtn.ai/character/characters/me?limit=${a}`
        );
      }

      /**
       * 캐릭터를 새로 배포합니다.
       * @param {*} origin 원본 작품의 JSON 데이터입니다.
       * @param {number} state 작품의 상태를 뜻합니다. [0 = 공개 / 1 = 비공개 / 2 = 일부 공개]
       */
      async publishCharacter(originId, state) {
        const origin = (
          await e(
            "GET",
            `https://contents-api.wrtn.ai/character/characters/me/${originId}`
          )
        )?.data;
        if (origin) {
          let categoryForceUpdated = false;
          let categoryId = origin.categories[0]?._id;
          if (!categoryId) {
            categoryForceUpdated = false;
            categoryId = "65e808c01a9eea7b2f66092c";
          }
          for (const t of origin.startingSets || []) delete t._id;
          let cloned = {
            name: origin.name,
            description: origin.description,
            profileImageUrl: origin.profileImage.origin,
            model: origin.model,
            initialMessages: origin.initialMessages,
            characterDetails: origin.characterDetails,
            replySuggestions: origin.replySuggestions,
            chatExamples: origin.chatExamples,
            situationImages: origin.situationImages,
            categoryIds: [categoryId],
            tags: origin.tags,
            visibility:
              state === 0 ? "public" : state === 1 ? "private" : "linkonly",
            promptTemplate:
              origin.promptTemplate?.template || origin.promptTemplate,
            isCommentBlocked: origin.isCommentBlocked,
            defaultStartingSetName: origin.defaultStartingSetName,
            keywordBook: origin.keywordBook,
            customPrompt: origin.customPrompt,
            defaultStartingSetSituationPrompt:
              origin.defaultStartingSetSituationPrompt || " ",
            isAdult: origin.isAdult,
            defaultSuperChatModel:
              "object" == typeof origin.defaultSuperChatModel &&
              origin.defaultSuperChatModel?.model
                ? origin.defaultSuperChatModel.model
                : origin.defaultSuperChatModel || "SONNET3.7",
            defaultCrackerModel: origin.defaultCrackerModel,
            target: origin.target,
            isMovingImage: origin.isMovingImage ? origin.isMovingImage : false,
            chatType: origin.chatType ? origin.chatType : "simulation",
          };
          if (origin.startingSets && origin.startingSets.length > 0) {
            cloned.startingSets = origin.startingSets.map(
              (t) => (delete (t = { ...t })._id, t)
            );
          }
          if (origin.initialMessages) {
            if (origin.initialMessages.length <= 0) {
              delete cloned.initialMessages;
            } else {
              cloned.initialMessages = origin.initialMessages;
            }
          }
          if (origin.replySuggestions) {
            if (origin.replySuggestions.length <= 0) {
              delete cloned.replySuggestions;
            } else {
              cloned.replySuggestions = origin.replySuggestions;
            }
          }
          if (origin.situationImages) {
            if (origin.situationImages.length <= 0) {
              delete cloned.situationImages;
            } else {
              cloned.situationImages = origin.situationImages;
            }
          }
          if (origin.keywordBook) {
            if (origin.keywordBook.length <= 0) {
              delete cloned.keywordBook;
            } else {
              cloned.keywordBook = origin.keywordBook;
            }
          }
          if (origin.defaultStartingSetSituationPrompt) {
            if (origin.defaultStartingSetSituationPrompt.length <= 0) {
              delete cloned.defaultStartingSetSituationPrompt;
            } else {
              cloned.defaultStartingSetSituationPrompt =
                origin.defaultStartingSetSituationPrompt;
            }
          }
          if (cloned.startingSets.length > 0) {
            for (let index = 0; index < cloned.startingSets.length; index++) {
              if (
                cloned.startingSets[index] &&
                cloned.startingSets[index].baseSetId
              ) {
                delete cloned.startingSets[index].baseSetId;
              }
            }
          }
          let dataToReturn = await e(
            "POST",
            "https://contents-api.wrtn.ai/character/characters",
            cloned
          );
          if (!categoryId) {
            alert(
              "서버에서 카테고리 ID를 반환하지 않아 하드코딩된 ID로 지정되었습니다.\n이는 추후 문제를 발생시킬 수 있습니다.\n기본 값: 65e808c01a9eea7b2f66092c, 엔터테인먼트"
            );
          }
          return dataToReturn;
        } else {
          alert(
            "오류가 발생하였습니다:\n대상 작품이 서버에 존재하지 않거나 서버에서 잘못된 응답을 반환하였습니다."
          );
        }
      }
      async setCharacter(id, origin, a, force, doubleCheck) {
        let defaultBaseId = origin.data?.startingSets[0].baseSetId;
        if (!defaultBaseId) {
          alert("기존 데이터에서 필수 요소 baseSetId가 반환되지 않았습니다.");
          throw Error(
            "기존 데이터에서 필수 요소 baseSetId가 반환되지 않았습니다."
          );
        }
        if (doubleCheck) {
          if (origin.data.startingSets.length !== a.startingSets.length) {
            alert(
              "원본 시작 설정 개수와 클립보드 데이터의 시작 설정 개수가 다릅니다.\n" +
                "결정화 캐즘의 현재 버전에서는 시작 설정 개수가 다를 경우 복사가 불가능합니다."
            );
            throw Error(
              "원본 시작 설정 개수와 클립보드 데이터의 시작 설정 개수가 다릅니다."
            );
          }
        }
        for (var r of a.startingSets || []) delete r._id;
        r = {
          name: a.name,
          description: a.description,
          profileImageUrl: a.profileImage?.origin || a.profileImageUrl,
          model: a.model.toLowerCase(),
          //   initialMessages: a.initialMessages,
          characterDetails: a.characterDetails,
          //   replySuggestions: a.replySuggestions,
          chatExamples: a.chatExamples,
          //   situationImages: a.situationImages,
          categoryIds: a.categories?.length
            ? [a.categories[0]._id]
            : a.categoryIds,
          tags: a.tags,
          promptTemplate: a.promptTemplate?.template || a.promptTemplate,
          isCommentBlocked: a.isCommentBlocked,
          defaultStartingSetName: a.defaultStartingSetName,
          //   keywordBook: a.keywordBook,
          customPrompt: a.customPrompt,
          //   defaultStartingSetSituationPrompt:
          //     a.defaultStartingSetSituationPrompt || "",
          defaultSuperChatModel:
            "object" == typeof a.defaultSuperChatModel &&
            a.defaultSuperChatModel?.model
              ? a.defaultSuperChatModel.model
              : a.defaultSuperChatModel || "SONNET3.7",
          genreId: a.genreId,
          defaultCrackerModel: a.defaultCrackerModel,
          target: a.target,
          visibility: a.visibility ? a.visibility : "private",
          isMovingImage: a.isMovingImage ? a.isMovingImage : false,
          chatType: a.chatType ? a.chatType : "simulation",
        };
        if (a.initialMessages) {
          if (a.initialMessages.length <= 0) {
            delete r.initialMessages;
          } else {
            r.initialMessages = a.initialMessages;
          }
        }
        if (a.replySuggestions) {
          if (a.replySuggestions.length <= 0) {
            delete r.replySuggestions;
          } else {
            r.replySuggestions = a.replySuggestions;
          }
        }
        if (a.situationImages) {
          if (a.situationImages.length <= 0) {
            delete r.situationImages;
          } else {
            r.situationImages = a.situationImages;
          }
        }
        if (a.keywordBook) {
          if (a.keywordBook.length <= 0) {
            delete r.keywordBook;
          } else {
            r.keywordBook = a.keywordBook;
          }
        }
        if (a.defaultStartingSetSituationPrompt) {
          if (a.defaultStartingSetSituationPrompt.length <= 0) {
            delete r.defaultStartingSetSituationPrompt;
          } else {
            r.defaultStartingSetSituationPrompt =
              a.defaultStartingSetSituationPrompt;
          }
        }
        if (a.startingSets && a.startingSets.length > 0) {
          r.startingSets = a.startingSets.map(
            (t) => (delete (t = { ...t })._id, t)
          );
        }
        // Overwriting visibility to origin
        r.visibility = origin.data.visibility;
        if (force) {
          for (let index = 0; index < r.startingSets.length; index++) {
            if (
              origin.data.startingSets[index] &&
              origin.data.startingSets[index].baseSetId
            ) {
              delete origin.data.startingSets[index].baseSetId;
            }
            if (a.startingSets[index] && a.startingSets[index].baseSetId) {
              delete a.startingSets[index].baseSetId;
            }
          }
          origin.data.startingSets[0].baseSetId = defaultBaseId;
          a.startingSets[0].baseSetId = defaultBaseId;
          r.startingSets = [
            {
              baseSetId: defaultBaseId,
              name: "강제 덮어씌우기 진행중",
              initialMessages: [
                "강제 덮어씌우기 작업이 진행중입니다. ",
                "이 작업은 결정화 캐즘에 의해 진행되고 있습니다.",
                "잠시만 기다려주세요.",
              ],
              situationPrompt:
                "캐릭터 점검중 - 점검 안내 외에는 다른 응답을 하지 말 것",
              replySuggestions: ["점검중"],
              situationImages: [],
              keywordBook: [],
            },
          ];
          await e(
            "PATCH",
            `https://contents-api.wrtn.ai/character/characters/${id}`,
            r
          );
          return await this.setCharacter(id, origin, a, false, false);
        } else {
          if (r.startingSets.length > 0) {
            for (let index = 0; index < r.startingSets.length; index++) {
              if (
                origin.data.startingSets[index] &&
                origin.data.startingSets[index].baseSetId
              ) {
                r.startingSets[index].baseSetId =
                  origin.data.startingSets[index].baseSetId;
              }
            }
          }
          return (
            r,
            await e(
              "PATCH",
              `https://contents-api.wrtn.ai/character/characters/${id}`,
              r
            )
          );
        }
      }
      async getMycharacter(t) {
        if (!t) return null;
        const a = await e(
          "GET",
          `https://contents-api.wrtn.ai/character/characters/me/${t}`
        );
        return a && a.data
          ? {
              data: a.data,
              reload: async () =>
                await e(
                  "GET",
                  `https://contents-api.wrtn.ai/character/characters/me/${t}`
                ),
              get: async () =>
                (
                  await e(
                    "GET",
                    `https://contents-api.wrtn.ai/character/characters/me/${t}`
                  )
                )?.data || null,
              set: async (origin, a, force) => {
                return await this.setCharacter(t, origin, a, force, true);
              },
              remove: async () =>
                "SUCCESS" ===
                (
                  await e(
                    "DELETE",
                    `https://contents-api.wrtn.ai/character/characters/me/${t}`
                  )
                )?.result,
              publish: async (state) => {
                return await this.publishCharacter(t, state);
              },
            }
          : null;
      }
    })(),
    o = (function () {
      const t = window.MutationObserver || window.WebKitMutationObserver;
      return function (e, a) {
        if (e && t)
          return (
            (a = new t(a)).observe(e, {
              childList: !0,
              subtree: !0,
              attributes: !0,
            }),
            a
          );
      };
    })();
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", prepare)
    : prepare(),
    window.addEventListener("load", prepare);
})();
