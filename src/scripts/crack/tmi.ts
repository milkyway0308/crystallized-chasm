// import { CRACK_VERSION_RULE } from "../../constants/script-constants";
// import { CrackSdk } from "../../sdk/crack-sdk";
// import { CrackerModel } from "../../sdk/crack/types/types-cracker";
// import { BrowserInitUtil } from "../../utils/init-util";
// import { readonlyLazy } from "../../utils/lazy-util";
// import { LocaleStorageConfig } from "../../utils/local-storage-config";
// import { LogUtil } from "../../utils/log-utils";
// import { ObserveUtil } from "../../utils/observe-util";
// import { ScriptMetaUtil } from "../../utils/script-meta-util";

// export const scriptMeta = ScriptMetaUtil.construct("crack", "tmi.user.js", undefined, (meta) => {
//   meta.name = "Chasm Crystallized TMI (결정화 캐즘 과포화)";
//   meta.version = "CRCK-TMI-v2.0.0" satisfies CRACK_VERSION_RULE;
//   meta.author = "milkyway0308";
//   meta.description = "크랙 UI에 추가 정보 제공. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
// });

// // =====================================================
// //                        상수
// // =====================================================

// let initialCracker: number | undefined = undefined;
// let doesInitialized = false;
// let updating = false;
// let updateStoppedAt = new Date();
// let fetched = false;
// let requireReupdate = false;
// const cachedModels = await getCrackerModels();
// const logger = readonlyLazy(() => new LogUtil("Chasm Crystallized TMI", false));

// // =====================================================
// //                      설정
// // =====================================================
// const settings = new LocaleStorageConfig("chasm-tmi-settings", {
//   enableLeftCracker: true,
//   enableCrackerDelta: true,
//   enableStoryChatLeft: true,
//   enableModelPopupLeft: true,
//   enableArpgRerollLeft: true,
//   enableArpgChatLeft: true,
// });

// function doStoryChatCalc() {
//   return CrackSdk.path().isStoryPath() && settings.config.enableStoryChatLeft;
// }

// function doStoryModelCalc() {
//   return CrackSdk.path().isStoryPath() && settings.config.enableModelPopupLeft;
// }

// function doArpgRerollCalc() {
//   return CrackSdk.path().isARPGBuilderPath() && settings.config.enableArpgRerollLeft;
// }

// function doArpgChatCalc() {
//   return CrackSdk.path().isARPGPath() && settings.config.enableArpgChatLeft;
// }

// // =====================================================
// //                      로직
// // =====================================================

// /**
//  *
//  * @param {number} cracker
//  */
// function updateCracker(cracker: number) {
//   initialCracker = cracker;
//   updateCrackerText(cracker);
//   updateARPGRemainingText(cracker);
//   updateRemainingText(cracker);
//   updateModalText(cracker);
// }

// function findCrackerButton() {
//   const topContainerElement = document.getElementsByClassName(CrackSdk.theme().isDarkTheme() ? "css-7238to" : "css-9gj46x");
//   if (topContainerElement.length <= 0) return;
//   const hyperLinkElement = topContainerElement[0].getElementsByTagName("a");
//   for (let button of hyperLinkElement) {
//     if (button.getAttribute("href") === "/cracker") {
//       return button;
//     }
//   }
//   return undefined;
// }

// function findMobileCrackerPosition() {
//   const topElement = document.getElementsByClassName(CrackSdk.theme().isDarkTheme() ? "css-7238to" : "css-9gj46x");
//   if (topElement.length > 0) {
//     return topElement[0].childNodes[0].childNodes[0];
//   }
//   return undefined;
// }

// /**
//  *
//  * @param {number} cracker
//  * @returns
//  */
// function createCrackerTag(cracker: number) {
//   const tag = document.createElement("p");
//   tag.id = "chasm-cracker-text";
//   tag.className = "chasm-cracker-text";
//   if (CrackSdk.theme().isDarkTheme()) {
//     tag.className = "chasm-cracker-display";
//   } else {
//     tag.className = "chasm-cracker-display";
//   }
//   const nextText = cracker.toLocaleString(undefined, {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   });
//   tag.textContent = nextText;
//   if (settings.config.enableCrackerDelta) {
//     tag.setAttribute("chasm-tmi-current", cracker.toString());
//   } else {
//     tag.setAttribute("chasm-tmi-current", cracker.toString());
//     tag.setAttribute("chasm-tmi-target", cracker.toString());
//     tag.textContent = cracker.toLocaleString(undefined, {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     });
//   }
//   return tag;
// }

// /**
//  *
//  * @param {number} cracker
//  * @returns
//  */
// function updateCrackerText(cracker: number) {
//   if (!settings.config.enableLeftCracker) return;
//   if (cracker === undefined) {
//     return;
//   }
//   const buttonElement = findCrackerButton();
//   let elementsText = document.getElementsByClassName("chasm-cracker-text");
//   if (!elementsText || elementsText.length <= 0) {
//     if (buttonElement) {
//       buttonElement.append(createCrackerTag(cracker));
//       buttonElement.classList.add("chasm-tmi-button-expander");
//       elementsText = document.getElementsByClassName("chasm-cracker-text");
//     }
//   }
//   let mobileText = document.querySelectorAll("chasm-cracker-text[mobile]");
//   if (mobileText.length <= 0) {
//     const parent = GenericUtil.refine(findMobileCrackerPosition());
//     if (parent) {
//       const tag = createCrackerTag(cracker);
//       tag.setAttribute("mobile", "true");
//       parent.append(tag);
//       parent.classList.add("chasm-tmi-text-mobile-container");
//       elementsText = document.getElementsByClassName("chasm-cracker-text");
//     }
//   }
//   for (let tag of elementsText) {
//     if (tag.getAttribute("chasm-tmi-target") !== cracker.toString()) {
//       tag.setAttribute("chasm-tmi-target", cracker.toString());
//     }
//   }
// }

// /**
//  *
//  * @param {number} cracker
//  * @returns
//  */
// function updateARPGRemainingText(cracker: number) {
//   if (doArpgChatCalc()) {
//     const leftButton = document.getElementsByClassName(CrackSdk.theme().isDarkTheme() ? "css-td6bk9" : "css-1rrnf8q");
//     if (leftButton && leftButton.length > 0) {
//       if (leftButton[0].getAttribute("last-cracker") !== cracker.toString()) {
//         leftButton[0].setAttribute("last-cracker", cracker.toString());
//         leftButton[0].childNodes[0].childNodes[1].childNodes[1].textContent = "110 | " + Math.floor(cracker / 110) + "회";
//       }
//     } else {
//       return;
//     }
//     const rightButton = leftButton[0].parentElement?.childNodes[1];
//     if (GenericUtil.refine(rightButton).getAttribute("last-cracker") !== cracker.toString()) {
//       GenericUtil.refine(rightButton).setAttribute("last-cracker", cracker.toString());
//       GenericUtil.refine(rightButton?.childNodes[0].childNodes[1].childNodes[1]).textContent = "55 | " + Math.floor(cracker / 55) + "회";
//     }
//   }
//   if (doArpgRerollCalc()) {
//     const confirmButton = document.getElementsByClassName(CrackUtil.theme().isDarkTheme() ? "css-td6bk9" : "css-1rrnf8q");
//     if (confirmButton && confirmButton.length > 0) {
//       if (confirmButton[0].childNodes[0].childNodes[0].textContent === "캐릭터 생성") {
//         if (confirmButton[0].getAttribute("last-cracker") !== cracker.toString()) {
//           confirmButton[0].setAttribute("last-cracker", cracker.toString());
//           confirmButton[0].childNodes[0].childNodes[1].childNodes[1].textContent = "50 | " + Math.floor(cracker / 50) + "회";
//         }
//       }
//     }
//   }
// }

// function updateRemainingText(cracker: number) {
//   if (!doStoryChatCalc()) return;
//   let targets = document.querySelectorAll("div.css-160ssko div.flex.gap-3.items-center");
//   if (!targets || targets.length <= 0) {
//     return;
//   }
//   // @ts-ignore
//   targets = targets[0].childNodes;
//   const currentTarget = targets[targets.length - 2];
//   const textTag = currentTarget.getElementsByTagName("span")[0];
//   if (!textTag.hasAttribute("chasm-tmi-model-type")) {
//     if (textTag.textContent.trim().length <= 0) {
//       // To prevent pre-load replacement
//       return;
//     }
//     textTag.setAttribute("chasm-tmi-model-type", textTag.textContent);
//   }
//   let nextText = formatChatLeft(textTag.getAttribute("chasm-tmi-model-type") ?? "-ERROR-", cracker, true);
//   if (nextText === textTag.textContent) {
//     return;
//   }
//   textTag.textContent = nextText;
// }

// function updateModalText(cracker: number) {
//   if (!doStoryModelCalc()) return;
//   let indicatorEntity = document.getElementsByClassName("chasm-tmi-indicator");
//   if (indicatorEntity.length <= 0) {
//     // Inject small indicator
//     const elements = document.querySelectorAll("div.css-160ssko div[data-radix-popper-content-wrapper] [data-radix-collection-item]");
//     for (let element of elements) {
//       const modelTextNode = element.getElementsByTagName("span");
//       if (modelTextNode.length <= 0) return;
//       const indicator = document.createElement("span");
//       indicator.className = "chasm-tmi-indicator";
//       indicator.setAttribute("target-model", modelTextNode[0].textContent);
//       element.childNodes[0].appendChild(indicator);
//     }
//     indicatorEntity = document.getElementsByClassName("chasm-tmi-indicator");
//   }
//   if (!indicatorEntity || indicatorEntity.length <= 0) return;

//   for (let textNode of indicatorEntity) {
//     const nextText = formatChatLeft(textNode.getAttribute("target-model") ?? "-ERROR-", cracker, false);
//     if (nextText !== textNode.textContent) {
//       textNode.textContent = nextText;
//     }
//   }
// }

// function formatChatLeft(chatType: string, cracker: number, includeModelName: boolean) {
//   if (cachedModels instanceof Error) return " | --회";
//   if (cachedModels.has(chatType)) {
//     /** @type {CrackerModels} */
//     const model = cachedModels.get(chatType) ?? new CrackerModel("PLACEHOLDER", "PLACEHOLDER", 0, "none");
//     if (model.quantity <= 0) {
//       if (includeModelName) {
//         return chatType + " | 잔여 ∞회";
//       } else {
//         return "잔여 ∞회";
//       }
//     }
//     if (includeModelName) {
//       return chatType + " | 잔여 " + Math.floor(cracker / model.quantity) + "회";
//     } else {
//       return "잔여 " + Math.floor(cracker / model.quantity) + "회";
//     }
//   }
//   if (includeModelName) {
//     return chatType + " | ???";
//   } else {
//     return "잔여 횟수 알 수 없음";
//   }
// }

// async function extractCharacterCracker() {
//   const root = document.getElementsByClassName("css-1v8my8o");
//   if (!root || root.length <= 0) {
//     return undefined;
//   }
//   for (const menuElement of root) {
//     const menuElements = menuElement.getElementsByClassName("css-uxwch2");
//     if (!menuElements || menuElements.length <= 0) {
//       return undefined;
//     }
//     for (let element of menuElements) {
//       let expectedLabel = element.childNodes[0];
//       if (expectedLabel.nodeName.toLowerCase() === "p" && expectedLabel.textContent === "나의 크래커") {
//         return parseInt(GenericUtil.refine(element.childNodes[1].childNodes[1].childNodes[0].textContent).replace(",", ""));
//       }
//     }
//   }
//   return undefined;
// }

// /**
//  * @returns {Promise<Map<string, CrackerModels>|Error>}
//  */
// async function getCrackerModels() {
//   const result = await CrackUtil.network().authFetch("GET", "https://crack-api.wrtn.ai/crack-gen/v3/chat-models");
//   if (result instanceof Error) {
//     console.error(result);
//     return result;
//   }
//   if (!result.data.models) {
//     return new Map();
//   }
//   /** @type {Map<string, CrackerModels>} */
//   const map = new Map();
//   for (let model of result.data.models) {
//     map.set(model.name, new CrackerModels(model._id, model.name, model.crackerQuantity, model.serviceType));
//   }
//   return map;
// }
// async function extractCracker() {
//   let cracker = await extractCharacterCracker();
//   if (cracker && !Number.isNaN(cracker)) {
//     return cracker;
//   }
//   return undefined;
// }

// async function doInitialize() {
//   if (updating) return;
//   if (!doesInitialized) {
//     doesInitialized = true;
//     ObserveUtil.attachObserver(document.body, doInitialize);
//     runSchedule();
//   }
//   if (initialCracker === undefined) {
//     updating = true;
//     const lastCracker = await CrackSdk.cracker().current();
//     if (lastCracker.ok) {
//       updateCracker(lastCracker.value);
//       updating = false;
//       return;
//     }
//     updating = false;
//   }
//   if (requireReupdate) {
//     requireReupdate = false;
//     updateCracker(initialCracker ?? -1);
//   }
//   if (CrackSdk.path().isARPGPath()) {
//     // Let's use more modern and solid solution
//     updateStoppedAt = new Date();
//     updating = false;
//     fetched = false;
//   } else if (CrackSdk.path().isARPGBuilderPath()) {
//     if (initialCracker !== undefined) {
//       updateARPGRemainingText(initialCracker);
//     }
//   } else {
//     let nextCracker = await extractCracker();
//     if (nextCracker !== undefined) {
//       updateCracker((await extractCracker()) ?? -1);
//     }
//     const rootElement = document.getElementsByClassName("css-160ssko");
//     if (rootElement.length > 0 && !rootElement[0].hasAttribute("chasm-cmi-monitoring")) {
//       rootElement[0].setAttribute("chasm-cmi-monitoring", "true");
//       ObserveUtil.attachObserver(rootElement[0], () => {
//         updateModalText(initialCracker ?? -1);
//       });
//     }
//   }
// }

// function runSchedule() {
//   setInterval(async () => {
//     if (!CrackSdk.path().isARPGPath()) return;
//     if (updating) return;
//     if (!fetched && new Date().getTime() - updateStoppedAt.getTime() > 500) {
//       fetched = true;
//       const lastCracker = await CrackSdk.cracker().current();
//       if (lastCracker.ok) {
//         updateCracker(lastCracker.value);
//         updating = false;
//       }
//     }
//   }, 50);
//   // Text delta movement
//   setInterval(() => {
//     const element = document.getElementById("chasm-cracker-text");
//     if (element) {
//       const objective = parseInt(element.getAttribute("chasm-tmi-target") ?? "0");
//       const current = parseInt(element.getAttribute("chasm-tmi-current") ?? "0");
//       const abs = Math.abs(current - objective);
//       const delta = abs > 300 ? 16 : abs > 100 ? 8 : abs > 50 ? 2 : 1;
//       if (current > objective) {
//         const next = current - delta;
//         element.setAttribute("chasm-tmi-current", next.toString());
//         element.textContent = next.toLocaleString(undefined, {
//           minimumFractionDigits: 0,
//           maximumFractionDigits: 0,
//         });
//       } else if (current < objective) {
//         const next = current + delta;
//         element.setAttribute("chasm-tmi-current", next.toString());
//         element.textContent = next.toLocaleString(undefined, {
//           minimumFractionDigits: 0,
//           maximumFractionDigits: 0,
//         });
//       }
//     }
//   }, 7);
// }

// function addMenu() {
//   const manager = CrackSdk.addonModal().acquire();
//   manager.createMenu("결정화 캐즘 과포화", (modal) => {
//     modal.replaceContentPanel((panel) => {
//       panel.addTitleText("일반 설정");
//       panel.addSwitchBox("tmi-display-cracker", "잔여 크래커 표시", "잔여 크래커를 표시할지의 여부입니다.", {
//         defaultValue: settings.config.enableLeftCracker,
//         onChange: (value) => {
//           settings.config.enableLeftCracker = value;
//           settings.save();
//         },
//       });
//       panel.addSwitchBox("tmi-chat-calc", "스토리 채팅 잔여 채팅 횟수 표시", "스토리 채팅에서 잔여 채팅 횟수를 표시할지의 여부입니다.", {
//         defaultValue: settings.config.enableStoryChatLeft,
//         onChange: (value) => {
//           settings.config.enableStoryChatLeft = value;
//           settings.save();
//         },
//       });
//       panel.addSwitchBox("tmi-chat-model-calc", "스토리 채팅 모델 팝업 잔여 채팅 횟수 표시", "스토리 채팅 모델 팝업에서 잔여 채팅 횟수를 표시할지의 여부입니다.", {
//         defaultValue: settings.config.enableModelPopupLeft,
//         onChange: (value) => {
//           settings.config.enableModelPopupLeft = value;
//           settings.save();
//         },
//       });
//       panel.addSwitchBox("tmi-cracker-delta", "델타 애니메이션", "크래커의 감소 뎉라 애니메이션을 적용할지의 여부입니다.", {
//         defaultValue: settings.config.enableCrackerDelta,
//         onChange: (value) => {
//           settings.config.enableCrackerDelta = value;
//           settings.save();
//         },
//       });
//       panel.addTitleText("ARPG 설정");
//       panel.addSwitchBox("tmi-arpg-left", "ARPG 잔여 횟수 표시", "ARPG의 잔여 횟수를 표시할지의 여부입니다.", {
//         defaultValue: settings.config.enableArpgChatLeft,
//         onChange: (value) => {
//           settings.config.enableArpgChatLeft = value;
//           settings.save();
//         },
//       });
//       panel.addSwitchBox("tmi-arpg-reroll-left", "ARPG 리롤 잔여 횟수 표기", "ARPG의 리롤 잔여 횟수를 표시할지의 여부입니다.", {
//         defaultValue: settings.config.enableArpgRerollLeft,
//         onChange: (value) => {
//           settings.config.enableArpgRerollLeft = value;
//           settings.save();
//         },
//       });
//     }, "결정화 캐즘 과포화");
//   });
//   manager.addLicenseDisplay((panel) => {
//     panel.addTitleText("결정화 캐즘 과포화");
//     panel.addText("- decentralized-modal.js 프레임워크 (https://github.com/milkyway0308/crystalized-chasm/decentralized-modal.js)");
//   });
// }

// settings.load();
// addMenu();
// if (cachedModels instanceof Error) {
//   logger.error("모델 데이터를 불러오는데에 실패하였습니다.");
//   return;
// }
// "loading" === document.readyState ? (document.addEventListener("DOMContentLoaded", doInitialize), window.addEventListener("load", doInitialize)) : "interactive" === document.readyState || "complete" === document.readyState ? await doInitialize() : setTimeout(doInitialize, 100);

// // =================================================
// //                  메뉴 강제 추가
// // =================================================

// BrowserInitUtil.init(() => {
//   settings.load();
//   CrackSdk.addonModal().init();
//   addMenu();
//   BrowserInitUtil.onPagePrepare(prepare);
// });
