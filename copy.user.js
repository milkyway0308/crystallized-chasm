// ==UserScript==
// @name        Chasm Crystallized Copy (결정화 캐즘 카피)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-COPY-v1.0.2
// @description 크랙의 캐릭터 퍼블리시/복사/붙여넣기 기능 구현 및 오류 수정. 해당 유저 스크립트는 원본 캐즘과 호환되지 않음으로, 원본 캐즘과 결정화 캐즘 중 하나만 사용하십시오.
// @author      chasm-js, milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/copy.user.js
// @grant       none
// ==/UserScript==
!(function () {
  function t(t) {
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
          Authorization: `Bearer ${t("access_token")}`,
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
  async function r() {
    /^\/my(\/.*)?$/.test(location.pathname) &&
      t("access_token") &&
      o(document.body, () => {
        document.querySelectorAll(".css-1phiq9z").forEach((t) => {
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
                for (const t of n)
                  if (t?.props?.character?._id) return t.props.character._id;
                return null;
              } catch (t) {
                return null;
              }
            })(t);
            e && (window.currentClickedId = e);
          };
        });
        const t = document.querySelector(".css-bf6s57");
        if (t && t.childNodes.length < 6) {
          const e = t.childNodes[0].cloneNode(!0);
          t.appendChild(
            a(
              "✦ 공개",
              async () => {
                if (
                  window.currentClickedId &&
                  confirm("Chasm Copy - 공개 의 새 캐릭터로 복사해 게시할까요?")
                ) {
                  var t = await i.getMycharacter(window.currentClickedId);
                  t
                    ? "SUCCESS" === (await t.publish("public"))?.result
                      ? confirm(
                          "Chasm Copy - 공개 로 게시 성공했습니다. 새로고침 하시겠습니까?"
                        ) && location.reload()
                      : alert("게시 실패했습니다. 다시 시도해 주세요.")
                    : alert("캐릭터 데이터를 가져올 수 없습니다.");
                }
              },
              e
            )
          ),
            t.appendChild(
              a(
                "✦ 비공개",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "Chasm Copy - 비공개 의 새 캐릭터로 복사해 게시할까요?"
                    )
                  ) {
                    var t = await i.getMycharacter(window.currentClickedId);
                    t
                      ? "SUCCESS" === (await t.publish("private"))?.result
                        ? confirm(
                            "Chasm Copy - 비공개 로 게시 성공했습니다. 새로고침 하시겠습니까?"
                          ) && location.reload()
                        : alert("게시 실패했습니다. 다시 시도해 주세요.")
                      : alert("캐릭터 데이터를 가져올 수 없습니다.");
                  }
                },
                e
              )
            ),
            t.appendChild(
              a(
                "✦ 링크 공개",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "Chasm Copy - 링크 공개 의 새 캐릭터로 복사해 게시할까요?"
                    )
                  ) {
                    var t = await i.getMycharacter(window.currentClickedId);
                    t
                      ? "SUCCESS" === (await t.publish("linkonly"))?.result
                        ? confirm(
                            "Chasm Copy - 링크 공개 로 게시 성공했습니다. 새로고침 하시겠습니까?"
                          ) && location.reload()
                        : alert("게시 실패했습니다. 다시 시도해 주세요.")
                      : alert("캐릭터 데이터를 가져올 수 없습니다.");
                  }
                },
                e
              )
            ),
            t.appendChild(
              a(
                "↙ JSON 복사",
                async () => {
                  if (window.currentClickedId) {
                    var t = await i.getMycharacter(window.currentClickedId);
                    t && (t = await t.get())
                      ? ((t = JSON.stringify(t, null, 2)),
                        navigator.clipboard.writeText(t),
                        alert("캐릭터 데이터가 클립보드에 복사되었습니다!"))
                      : alert("캐릭터 데이터를 가져올 수 없습니다.");
                  }
                },
                e
              )
            ),
            t.appendChild(
              a(
                "↗ JSON 붙여넣기",
                async () => {
                  if (
                    window.currentClickedId &&
                    confirm(
                      "Chasm Copy - 클립보드의 JSON 데이터로 캐릭터를 덮어씌우시겠습니까? 이 작업은 되돌릴 수 없습니다."
                    ) &&
                    confirm(
                      "Chasm Copy - 정말로 캐릭터 데이터를 덮어씌우시겠습니까? 기존 데이터는 모두 삭제됩니다."
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
                        ? (await t.set(t, e))
                          ? (alert(
                              "캐릭터 데이터가 성공적으로 덮어씌워졌습니다!"
                            ),
                            confirm(
                              "Chasm Copy - 캐릭터 데이터 덮어씌우기 성공했습니다. 새로고침 하시겠습니까?"
                            ) && location.reload())
                          : alert(
                              "캐릭터 데이터 덮어씌우기에 실패했습니다. 다시 시도해 주세요."
                            )
                        : alert("캐릭터 데이터를 가져올 수 없습니다.");
                    } else alert("클립보드에서 데이터를 가져올 수 없습니다.");
                  }
                },
                e
              )
            );
        }
      });
  }
  function n() {
    r();
    let t = location.href;
    o(document, () => {
      location.href !== t && ((t = location.href), r());
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
              set: async (origin, a) => {
                let defaultBaseId = origin.data?.startingSets[0].baseSetId;
                if (!defaultBaseId) {
                  alert(
                    "기존 데이터에서 필수 요소 baseSetId가 반환되지 않았습니다."
                  );
                  throw Error(
                    "기존 데이터에서 필수 요소 baseSetId가 반환되지 않았습니다."
                  );
                }
                console.log("Origin count: " + origin.data.startingSets.length);
                console.log("NEw count: " + a.startingSets.length);
                if (origin.data.startingSets.length !== a.startingSets.length) {
                  alert(
                    "원본 시작 설정 개수와 클립보드 데이터의 시작 설정 개수가 다릅니다.\n" +
                      "결정화 캐즘의 현재 버전에서는 시작 설정 개수가 다를 경우 복사가 불가능합니다."
                  );
                  throw Error(
                    "원본 시작 설정 개수와 클립보드 데이터의 시작 설정 개수가 다릅니다."
                  );
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
                  promptTemplate:
                    a.promptTemplate?.template || a.promptTemplate,
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
                if (r.startingSets.length > 0) {
                  for (let index = 0; i < r.startingSets.length; i++) {}
                  r.startingSets[index].baseSetId =
                    origin.data.startingSets[index].baseSetId;
                }

                return (
                  r,
                  await e(
                    "PATCH",
                    `https://contents-api.wrtn.ai/character/characters/${t}`,
                    r
                  )
                );
              },
              remove: async () =>
                "SUCCESS" ===
                (
                  await e(
                    "DELETE",
                    `https://contents-api.wrtn.ai/character/characters/me/${t}`
                  )
                )?.result,
              publish: async (a) => {
                const r = (
                  await e(
                    "GET",
                    `https://contents-api.wrtn.ai/character/characters/me/${t}`
                  )
                )?.data;
                if (r) {
                  for (const t of r.startingSets || []) delete t._id;
                  return (
                    (a = {
                      name: r.name,
                      description: r.description,
                      profileImageUrl: r.profileImage.origin,
                      model: r.model,
                      initialMessages: r.initialMessages,
                      characterDetails: r.characterDetails,
                      replySuggestions: r.replySuggestions,
                      chatExamples: r.chatExamples,
                      situationImages: r.situationImages,
                      categoryIds: [r.categories[0]._id],
                      tags: r.tags,
                      visibility: a,
                      promptTemplate:
                        r.promptTemplate?.template || r.promptTemplate,
                      isCommentBlocked: r.isCommentBlocked,
                      defaultStartingSetName: r.defaultStartingSetName,
                      keywordBook: r.keywordBook,
                      customPrompt: r.customPrompt,
                      defaultStartingSetSituationPrompt:
                        r.defaultStartingSetSituationPrompt || " ",
                      isAdult: r.isAdult,
                      defaultSuperChatModel:
                        "object" == typeof r.defaultSuperChatModel &&
                        r.defaultSuperChatModel?.model
                          ? r.defaultSuperChatModel.model
                          : r.defaultSuperChatModel || "SONNET3.7",
                    }),
                    r.startingSets &&
                      r.startingSets.length > 0 &&
                      (a.startingSets = r.startingSets.map(
                        (t) => (delete (t = { ...t })._id, t)
                      )),
                    await e(
                      "POST",
                      "https://contents-api.wrtn.ai/character/characters",
                      a
                    )
                  );
                }
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
    ? document.addEventListener("DOMContentLoaded", n)
    : n(),
    window.addEventListener("load", n);
})();
