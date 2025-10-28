/// <reference path="decentralized-modal.js" />
/// <reference path="libraries/dexie.js" />
// ==UserScript==
// @name        Chasm Crystallized Ignitor (결정화 캐즘 점화기)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-IGNT-v1.0.0p
// @description 캐즘 버너의 기능 계승. 이 기능은 결정화 캐즘 오리지널 패치입니다.
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL  https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/ignitor.user.js
// @updateURL    https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/ignitor.user.js
// @require      https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.js
// @require      https://raw.githubusercontent.com/milkyway0308/crystallized-chasm/ea39262878161bf25d28d3f5269f5e553d2e952b/decentralized-modal.js
// @grant        GM_addStyle
// ==/UserScript==
GM_addStyle(`
    body {
      --decentral-text: #000000;
      --chasm-ignt-danger: #ff0000;
    }
    .chasm-ignt-prompt-container {
      display: none !important;  
    } 

    .chasm-ignt-prompt-container[enabled="true"] {
      display: flex !important;
    }

    [chasm-ignt-hide="true"] {
      display: none !important;
    }

    .chasm-ignt-svg-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 2px;
      margin-right: 8px;    
    }

    .chasm-ignt-svg-spaced-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 2px;
      margin-right: 16px;
    }

    .chasm-ignt-svg-button:hover,.chasm-ignt-svg-spaced-button:hover {
      cursor: pointer;
    }
  `);

!(async function () {
  const VERSION = "v1.0.0p";
  let lastSelected = [];
  let lastModified = ["", "", "", ""];
  let lastSelectedModel = undefined;
  let lastSelectedPrompt = undefined;

  const database = new Dexie("chasm-ignitor");
  // https://www.svgrepo.com/svg/457256/trash-can
  const TRASH_CAN_ICON_SVG = `
    <svg width="36px" height="36px" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.5 7.08499V21.415C6.5 21.695 6.72 21.915 7 21.915H17C17.28 21.915 17.5 21.695 17.5 21.415V7.08499" stroke="var(--chasm-ignt-danger)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 5.08499H10V3.58499C10 3.30499 10.22 3.08499 10.5 3.08499H13.5C13.78 3.08499 14 3.30499 14 3.58499V5.08499Z" stroke="var(--chasm-ignt-danger)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M5 5.08499H19" stroke="var(--chasm-ignt-danger)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 10.465V17.925" stroke="var(--chasm-ignt-danger)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 9.465V18.925" stroke="var(--chasm-ignt-danger)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 9.465V18.925" stroke="var(--chasm-ignt-danger)" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
    `;

  // https://www.svgrepo.com/svg/500548/edit
  const EDIT_ICON_SVG = `
    <svg width="32px" height="32px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="var(--decentral-text-formal)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="var(--decentral-text-formal)" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640V512z"></path><path fill="var(--decentral-text-formal)" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path></g></svg>
    `;
  await database.version(2).stores({
    prompts: `name, description, author, prompt`,
  });

  class RequestOption {
    constructor(modelId, prompt, useRandomPrefix) {
      this.modelId = modelId;
      this.prompt = prompt;
      this.useRandomPrefix = useRandomPrefix;
    }
  }

  class TokenUsage {
    constructor(input, output) {
      this.input = input;
      this.output = output;
    }

    total() {
      return this.input + this.output;
    }
  }

  class GenericLLMResponse {
    /**
     *
     * @param {string} prompt
     * @param {TokenUsage} tokenUsage
     */
    constructor(prompt, tokenUsage) {
      this.prompt = prompt;
      this.tokenUsage = tokenUsage;
    }
  }

  class LLMError {
    /**
     *
     * @param {number} code
     * @param {string} message
     */
    constructor(code, message, isRecoverable) {
      this.code = code;
      this.message = message;
      this.isRecoverable = isRecoverable;
    }
  }

  class LLMRequester {
    /**
     *
     * @param {RequestOption} option
     * @returns {GenericLLMResponse | LLMError}
     */
    async doRequest(option) {
      console.alert("LLM function implemented yet");
    }
  }

  class GeminiRequester extends LLMRequester {
    static GENERIC_REQUESTER = new GeminiRequester();
    /**
     *
     * @param {RequestOption} option
     * @returns {GenericLLMResponse | LLMError}
     */
    async doRequest(option) {
      try {
        if (!settings.geminiKey) {
          return new LLMError(-1, "Gemini API 키가 등록되지 않았습니다.");
        }
        const safetySettings = [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_CIVIC_INTEGRITY",
            threshold: "BLOCK_NONE",
          },
        ];
        const body = {
          safetySettings: safetySettings,
          contents: {
            parts: [{ text: option.prompt }],
          },
        };
        if (option.useRandomPrefix) {
          const randomPrefix = `# This is UUID of request prompt - Ignore current and next line\n${crypto.randomUUID()}/${crypto.randomUUID()}\n`;
          body.contents.parts.unshift({ text: randomPrefix });
        }
        const request = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${option.modelId}:generateContent?key=${authKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        const text = await request.text();
        if (Math.floor(request.status / 100) !== 2) {
          if (request.status === 403) {
            return new LLMError(
              request.status,
              "Gemini API 키가 유효하지 않거나 권한이 부족합니다.",
              false
            );
          }
          if (request.status === 429) {
            return new LLMError(
              request.status,
              "Gemini API의 레이트리밋에 도달하여 요청에 실패하였습니다.",
              true
            );
          }
          if (request.status === 500) {
            return new LLMError(
              request.status,
              "Gemini API에서 서버 오류가 발생하였습니다.",
              true
            );
          }
          if (request.status === 503) {
            return new LLMError(
              request.status,
              "Gemini API의 레이트리밋에 도달하여 요청에 실패하였습니다",
              true
            );
          }
          return new LLMError(request.status, text);
        }
        const json = JSON.parse(text);
        const candidates = json.candidates;
        if (!candidates || candidates.length <= 0) {
          return new LLMError(
            1400,
            "LLM에서 응답 컨테이너를 반환하지 않았습니다.",
            true
          );
        }
        const parts = candidates[0].content;
        if (!parts || parts.length <= 0) {
          return new LLMError(
            1400,
            "LLM에서 응답 데이터를 반환하지 않았습니다.",
            true
          );
        }
        const message = parts[0].text;
        if (!message) {
          return new LLMError(
            1400,
            "LLM에서 빈 응답 메시지를 반환하였습니다.",
            true
          );
        }
        return new GenericLLMResponse(
          message,
          new TokenUsage(
            json.usageMetadata.promptTokenCount,
            json.usageMetadata.candidatesTokenCount
          )
        );
      } catch (e) {
        return new LLMError(-1, `Unexpected error: ${e.message}`);
      }
    }
  }

  class PlatformMessage {
    /**
     *
     * @param {string} role
     * @param {string} userName
     * @param {string} message
     */
    constructor(role, userName, message) {
      this.role = role;
      this.userName = userName;
      this.message = message;
    }
  }

  class PlatformMessageSender {
    /**
     *
     * @param {string} message
     */
    async send(message) {
      alert("Platform message sender not implemented yet");
    }
  }

  class UserNoteUtility {
    isValid() {
      return false;
    }

    async fetch() {}

    async set(message) {}

    async remove() {}
  }

  class PlatformMessageFetcher {
    isValid() {
      return false;
    }
    /**
     *
     * @param {number} count
     * @returns {PlatformMessage[]}
     */
    async fetch(maxCount) {}
  }

  class PlatformProvider {
    /**
     *
     * @param {PlatformProvider} provider
     */
    static bindProvider(provider) {
      document.__$igntPlatformProvider = provider;
    }

    /**
     *
     * @returns {PlatformProvider}
     */
    static getProvider() {
      return document.__$igntPlatformProvider;
    }
    /**
     * @returns {PlatformMessageFetcher}
     */
    getFetcher() {
      alert("Platform fetcher provider not implemented yet");
    }

    /**
     * @returns {PlatformMessageSender}
     */
    getSender() {
      alert("Platform message sender not implemented yet");
    }
  }
  // =====================================================
  //                      설정
  // =====================================================
  const settings = {
    lastUsedProvider: "Google",
    lastUsedModel: "Gemini 2.5 Pro",
    lastUsedPrompt: "커스텀",
    useAutoRetry: true,
    maxMessageRetreive: 50,
    addRandomHeader: false,
    includeUserNote: false,
  };

  // It's good to use IndexedDB, but we have to use LocalStorage to block site
  // cause of risk from unloaded environment and unexpected behavior
  function loadSettings() {
    const loadedSettings = localStorage.getItem("chasm-ignt-settings");
    if (loadedSettings) {
      const json = JSON.parse(loadedSettings);
      for (let key of Object.keys(json)) {
        // Merge setting for version compatibility support
        settings[key] = json[key];
      }
    }
    console.log("Loaded: ");
    console.log(settings);
  }

  function saveSettings() {
    log("설정 저장중..");
    // Yay, no need to filtering anything!
    localStorage.setItem("chasm-ignt-settings", JSON.stringify(settings));
    console.log(settings);
    log("설정 저장 완료");
  }

  // =================================================
  //                     유틸리티
  // =================================================
  /**
   * 인증키를 통해 HTTP 요청을 보냅니다.
   * @param {string} url URL
   * @param {string} method 메서드
   * @param {*|undefined} body 바디 데이터
   * @param {string|undefined} authKey 인증 키 혹은 undefined
   * @param {string|undefined} contentsType 컨텐츠 타입 혹은 undefined
   * @returns {Promise<Response>} 응답
   */
  function fetchWithAuth(url, method, body, authKey, contentsType) {
    const init = {
      method: method,
      headers: {},
    };
    if (body) {
      init.body = JSON.stringify(body);
    }
    if (authKey) {
      init.headers.Authorization = authKey;
    }
    if (contentsType) {
      init.headers["Content-Type"] = contentsType;
    }
    return fetch(url, init);
  }

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

  function parseVertexContent(vertexAiScript) {
    if (vertexAiScript.length <= 0) {
      return undefined;
    }
    const startText = "firebaseConfig = {";
    const startIndex = vertexAiScript.indexOf(startText);
    if (startIndex === -1) {
      return undefined;
    }
    const endIndex = vertexAiScript.indexOf("}", startIndex + 1);
    if (endIndex === -1) {
      return undefined;
    }
    const fetched = vertexAiScript
      .substring(startIndex + startText.length - 1, endIndex + 1)
      .replace(" ", "")
      .replaceAll(/(\S*)\: /g, '"$1": ');
    return JSON.parse(fetched);
  }

  function log(message) {
    console.log(
      "%cChasm Crystallized Ignitor: %cInfo: %c" + message,
      "color: cyan;",
      "color: blue;",
      "color: inherit;"
    );
  }

  function logWarning(message) {
    console.log(
      "%cChasm Crystallized Ignitor: %cWarning: %c" + message,
      "color: cyan;",
      "color: yellow;",
      "color: inherit;"
    );
  }

  function logError(message) {
    console.log(
      "%cChasm Crystallized Ignitor: %cError: %c" + message,
      "color: cyan;",
      "color: red;",
      "color: inherit;"
    );
  }
  function setupModal() {
    const modal = ModalManager.getOrCreateManager("c2");
    modal
      .createMenu("결정화 캐즘 이그나이터", (modal) => {
        modal.replaceContentPanel((panel) => {
          setupBurnerPage(panel);
        }, `결정화 캐즘 이그나이터 ${VERSION}`);
      })
      .createSubMenu("프롬프트 라이브러리", (modal) => {
        modal.replaceContentPanel((panel) => {
          setupPromptLibrary(panel);
        }, "프롬프트 라이브러리");
      })
      .createSubMenu("프롬프트 수정", (modal) => {
        modal.replaceContentPanel((panel) => {
          setupPromptModifySubmenu(panel);
        }, "프롬프트 수정");
      })
      .createSubMenu("API 설정", (modal) => {
        modal.replaceContentPanel((panel) => {
          setupApiSettingSubmenu(panel);
        }, "API 설정");
      });
  }

  /**
   * 
   * @param {ContentPanel} panel 
   */
  function setupBurnerPage(panel) {
    const providerBox = panel.constructSelectBox(
      "모델 제공자",
      "Google",
      "chasm-ignt-provider-google",
      false
    );
    const modelBox = panel.constructSelectBox(
      "사용 모델",
      "Gemini 2.5 Pro",
      "gemini-2.5-pro",
      false
    );
    for (let provider of Object.keys(MODEL_MAPPINGS)) {
      providerBox.addOption(
        provider,
        `chasm-ignt-provider-${provider}`,
        (id, node) => {
          for (const model of Object.keys(MODEL_MAPPINGS[provider])) {
            modelBox.clearGroup();
          }
        }
      );
    }
    // Option flag here

    const promptPreset = panel.constructSelectBox(
      "프롬프트 프리셋",
      "커스텀",
      "chasm-ignt-prompt-index-0",
      true
    );
    let uniqueIndex = 0;
    for (const author of Object.keys(DEFAULT_PROMPTS)) {
      promptPreset.addGroup(author);
      for (const preset of Object.keys(DEFAULT_PROMPTS[author])) {
        const node = promptPreset.addOption(
          preset,
          `chasm-ignt-prompt-index-${uniqueIndex++}`,
          (id, node) => {
            const selected = DEFAULT_PROMPTS[author][preset];
            if (selected) {
              const descriptionField = document.getElementById(
                "chasm-ignt-description-field"
              );
              descriptionField.setAttribute("enabled", "true");
              descriptionField.textContent = selected.description;
            }
            lastSelected.length = 0;
            settings.lastSelected = [author, preset];
            const descriptionField = document.getElementById(
              "chasm-ignt-description-field"
            );
            descriptionField.parentElement.parentElement.parentElement.removeAttribute(
              "chasm-ignt-hide"
            );
            document
              .getElementById("chasm-ignt-custom-prompt")
              .parentElement.setAttribute("chasm-ignt-hide", "true");
            saveSettings();
            return true;
          }
        );
        node.classList.add("chasm-ignt-embedded-prompt");
        node.setAttribute("author", author);
        node.setAttribute("presetName", preset);
      }
    }
    panel.addLongBox(true, (node) => {
      new ComponentAppender(node).addText("", {
        initializer: (textNode) => {
          textNode.id = "chasm-ignt-description-field";
        },
      });
    });
    promptPreset.addGroup("커스텀 프롬프트");
    promptPreset.addOption(
      "커스텀 프롬프트",
      "chasm-ignt-prompt-option-custom",
      (id, node) => {
        settings.lastSelected = ["$custom"];
        document
          .getElementById("chasm-ignt-custom-prompt")
          .parentElement.removeAttribute("chasm-ignt-hide");
        document
          .getElementById("chasm-ignt-description-field")
          .parentElement.parentElement.parentElement.setAttribute(
            "chasm-ignt-hide",
            "true"
          );
        saveSettings();
        return true;
      }
    );
    database.prompts
      .toArray()
      .then((arr) => {
        if (arr.length > 0) {
          promptPreset.addGroup("프롬프트 라이브러리");
          let index = 0;
          for (let item of arr) {
            const element = promptPreset.addOption(
              item.name,
              `chasm-ignt-preset-${index++}`,
              (_, node) => {
                const descriptionField = document.getElementById(
                  "chasm-ignt-description-field"
                );
                descriptionField.textContent =
                  item.description.length <= 0
                    ? "이 프롬프트에는 설명이 없습니다."
                    : item.description;
                settings.lastSelected = ["$prompt-library", item.name];
                descriptionField.parentElement.parentElement.parentElement.removeAttribute(
                  "chasm-ignt-hide"
                );
                document
                  .getElementById("chasm-ignt-custom-prompt")
                  .parentElement.setAttribute("chasm-ignt-hide", "true");
                saveSettings();
                return true;
              }
            );
            element.classList.add("chasm-ignt-library-prompt");
            element.selectedPrompt = item;
          }
        }
        console.log("Test");
        if (settings.lastSelected) {
          if (settings.lastSelected[0] === "$prompt-library") {
            let matched = false;
            for (let element of promptPreset.node.getElementsByClassName(
              "chasm-ignt-library-prompt"
            )) {
              const name = element.selectedPrompt;
              console.log("Settings: " + settings.lastSelected[1]);
              console.log("Scanning: " + name);
              if (name === settings.lastSelected[1]) {
                matched = true;
                element.onclick();
                break;
              }
            }
            if (!matched) {
              const first = Object.keys(DEFAULT_PROMPTS)[0];
              console.log("First: " + first);
              console.log("second: " + DEFAULT_PROMPTS[first]);
              const second = Object.keys(DEFAULT_PROMPTS[first])[0];
              settings.lastSelected = [first, second];
            }
          } else if (settings.lastSelected[0] === "$custom") {
            console.log("Test2");
            promptPreset.setSelected("chasm-ignt-prompt-option-custom");
          } else {
            let matched = false;
            // Default prompt selection
            for (const element of promptPreset.node.getElementsByClassName(
              "chasm-ignt-embedded-prompt"
            )) {
              if (
                element.getAttribute("author") === settings.lastSelected[0] &&
                element.getAttribute("presetName") === settings.lastSelected[1]
              ) {
                matched = true;
                promptPreset.setSelected(element.id);
                break;
              }
            }
            if (!matched) {
              const first = MODEL_MAPPINGS[Object.keys(MODEL_MAPPINGS)[0]];
              const second =
                MODEL_MAPPINGS[first][Object.keys(MODEL_MAPPINGS[first])[0]];
              settings.lastSelected = [first, second];
            }
          }
        }

        console.log(`Running ${promptPreset.getSelected()}`);
        promptPreset.runSelected();
      })
      .catch((err) => {
        console.error(err);
      });

    const customPromptBox = panel.constructTextAreaGrid(
      "chasm-ignt-custom-prompt",
      "커스텀 프롬프트",
      {
        defaultValue: settings.lastCustomPrompt ?? "",
        onChange: (_, text) => {
          console.log("Custom prompt change to " + text);
          settings.lastCustomPrompt = text;
          saveSettings();
        },
      }
    );
    customPromptBox.parentElement.setAttribute("chasm-ignt-hide", "true");
    panel.addSwitchBox(
      "chasm-ignt-auto-retry",
      "오류 발생시 자동 재시도",
      "활성화시, 서버에서 오류가 발생할 경우 자동으로 재시도합니다.\n체크 해제시 자동 재시도가 중단됩니다.",
      {
        defaultValue: true,
      }
    );

    panel.addShortNumberBox(
      "chasm-ignt-max-item",
      "요약에 불러올 메시지",
      "요약에 불러올 메시지 개수를 지정합니다. 기본 50이며, 0으로 설정시 모든 메시지를 불러옵니다. \n값이 클 수록 요청 시간이 길어지며 소모 비용 또한 늘어납니다.",
      {
        defaultValue: 50,
        min: 0,
        max: 999,
        onChange: (_, value) => {
          settings.maxMessageRetreive = value;
        },
      }
    );

    panel.addSwitchBox(
      "chasm-ignt-add-random-header",
      "전송에 무작위 헤더 추가",
      "활성화시, 전송될 메시지에 유저노트를 적용합니다. \n무작위 헤더는 50자의 프롬프트를 사용하지만, LLM의 캐시 무효화를 유도하여 응답 확률을 올립니다.",
      {
        defaultValue: true,
      }
    );

    panel.addSwitchBox(
      "chasm-ignt-add-persona-data",
      "페르소나 데이터 첨부",
      "활성화시, LLM에 전송될 메시지에 페르소나 데이터 (대화 프로필)을 첨부합니다.",
      {
        defaultValue: true,
      }
    );
    panel.addSwitchBox(
      "chasm-ignt-add-user-note",
      "유저노트 첨부",
      "활성화시, 전송될 메시지에 유저노트를 적용합니다. 유저노트는 10-20개의 크래커 비용이 청구됩니다.",
      {
        defaultValue: false,
      }
    );
    panel
      .footer(true)
      .addLoggingArea("chasm-ignt-log-container", "실행 로그", {
        suffixModifier: (parent) => {
          console.log("Appending suffix!");
          console.log(parent);
          parent.append(
            setupNode("p", (node) => {
              node.textContent = "00:00";
            })
          );
        },
      })
      .addButton("chasm-ignt-start-request", "시작하기", {
        initializer: (node) => {
          const provider = PlatformProvider.getProvider();
          if (!provider) {
            node.setAttribute("disabled", "true");
            node.innerText = "이 플랫폼에서는 버너를 지원하지 않습니다";
            return;
          }
          const fetcher = provider.getFetcher();
          console.log("Fetcher validaty: " + fetcher.isValid());
          console.log("Fetcher validaty: " + fetcher.chatId);
          if (!fetcher.isValid()) {
            console.log("not valiud");
            node.setAttribute("disabled", "true");
            node.innerText = "사용 대상 페이지가 아닙니다";
            return;
          }
        },
        action: () => {
          const provider = PlatformProvider.getProvider();
          const fetcher = provider.getFetcher();
          const sender = provider.getSender();
          fetcher.fetch(settings.maxMessageRetreive).then(async (messages) => {
            console.log(messages);
          });
        },
      });
  }

  /**
   *
   * @param {ContentPanel} panel
   */
  function setupPromptLibrary(panel) {
    database.prompts.toArray().then((arr) => {
      if (arr.length <= 0) {
        panel.addTitleText("불러올 내용이 없습니다.");
      } else {
        for (const item of arr) {
          panel.addBoxedField(
            item.name,
            `제작자 ${item.author}, 프롬프트 길이 ${item.prompt.length}자\n` +
              item.description +
              "\n",
            (node) => {
              node.append(
                setupClassNode(
                  "div",
                  "chasm-ignt-svg-spaced-button",
                  (buttonNode) => {
                    buttonNode.innerHTML = TRASH_CAN_ICON_SVG;
                    buttonNode.onclick = () => {
                      if (
                        confirm(
                          `정말로 프롬프트 ${item.name}을 라이브러리에서 지우시겠습니까?\n이 동작은 되돌릴 수 없습니다!`
                        )
                      ) {
                        database.prompts
                          .where("name")
                          .anyOf(item.name)
                          .delete()
                          .then((count) => {
                            console.log("Deleted " + count);
                            modal.triggerSelect([
                              "결정화 캐즘 이그나이터",
                              "프롬프트 라이브러리",
                            ]);
                          });
                      }
                    };
                  }
                )
              );
              node.append(
                setupClassNode("div", "chasm-ignt-svg-button", (buttonNode) => {
                  buttonNode.innerHTML = EDIT_ICON_SVG;
                  buttonNode.onclick = () => {
                    lastModified[0] = item.name;
                    lastModified[1] = item.author;
                    lastModified[2] = item.description;
                    lastModified[3] = item.prompt;
                    console.log(item);
                    modal.triggerSelect([
                      "결정화 캐즘 이그나이터",
                      "프롬프트 수정",
                    ]);
                  };
                })
              );
            }
          );
        }
      }
    });

    panel.footer().addButton("chasm-ignt-load-prompt", "불러오기");
  }
  /**
   *
   * @param {ContentPanel} panel
   */
  function setupPromptModifySubmenu(panel) {
    const promptName = panel.constructInputGrid(
      "chasm-ignt-prompt-name",
      "프롬프트 이름",
      true,
      {
        defaultValue: lastModified[0],
        onChange: (_, text) => {
          lastModified[0] = text;
        },
      }
    );
    const promptAuthor = panel.constructInputGrid(
      "chasm-ignt-prompt-author",
      "프롬프트 제작자",
      true,
      {
        defaultValue: lastModified[1],
        onChange: (_, text) => {
          lastModified[1] = text;
        },
      }
    );
    const promptDescriptionContent = panel.constructTextAreaGrid(
      "chasm-ignt-prompt-description",
      "프롬프트 설명",
      {
        defaultValue: lastModified[2],
        onChange: (node, text) => {
          lastModified[2] = text;
          console.log("Changed");
        },
      }
    );
    const promptContent = panel.constructTextAreaGrid(
      "chasm-ignt-prompt-contents",
      "프롬프트 내용",
      {
        defaultValue: lastModified[3],
        onChange: (node, text) => {
          lastModified[3] = text;
          console.log("Changed");
        },
      }
    );
    panel
      .footer()
      .addShortButton("chasm-ignt-share", "공유", {
        action: () => {
          if (lastModified[0].length === 0) {
            alert("제목은 1자 이상이여야만 합니다.");
            return;
          }
          if (lastModified[2].length === 0) {
            alert("빈 프롬프트를 공유할 수 없습니다.");
            return;
          }
          const item = {};
          item["title"] = lastModified[0];
          if (lastModified[1]) {
            item["author"] = lastModified[1];
          }
          item["description"] = lastModified[2];
          item["prompt"] = lastModified[3];
          navigator.clipboard.writeText(
            JSON.stringify({
              version: "C2 Ignitor " + VERSION,
              data: item,
            })
          );
          alert("클립보드로 공유 가능한 프롬프트가 복사되었습니다.");
        },
      })
      .addShortButton("chasm-ignt-save", "저장", {
        action: () => {
          database.prompts
            .put({
              name: lastModified[0],
              author: lastModified[1],
              description: lastModified[2],
              prompt: lastModified[3],
            })
            .then(() => {
              alert("저장되었습니다.");
            })
            .catch((error) => {
              console.error(error);
            });
        },
      });
  }

  /**
   *
   * @param {ContentPanel} panel
   */
  function setupApiSettingSubmenu(panel) {
    const box = panel.constructSelectBox(
      "설정할 API 서비스",
      "Gemini Api (Google)",
      "chasm-ignt-api-service-google",
      true
    );
    box.addGroup("API 제공자");
    box.addOption(
      "Gemini API (Google)",
      "chasm-ignt-api-service-google",
      () => {
        for (const box of document.getElementsByClassName(
          "chasm-ignt-api-field"
        )) {
          box.setAttribute("chasm-ignt-hide", "true");
        }
        document
          .getElementById("chasm-ignt-api-key-gemini-container")
          ?.removeAttribute("chasm-ignt-hide");
        return true;
      }
    );
    box.addOption(
      "Firebase Vertex AI (Google)",
      "chasm-ignt-api-service-firebase",
      () => {
        for (const box of document.getElementsByClassName(
          "chasm-ignt-api-field"
        )) {
          box.setAttribute("chasm-ignt-hide", "true");
        }
        document
          .getElementById("chasm-ignt-api-key-firebase-container")
          ?.removeAttribute("chasm-ignt-hide");
        return true;
      }
    );
    panel.addBoxedInputGrid(
      "chasm-ignt-api-key-gemini",
      "Google Gemini API 키",
      "Google Gemini API 키를 입력하세요.",
      {
        defaultValue: settings.geminiKey ?? "",
        initializer: (node, parent) => {
          parent.id = "chasm-ignt-api-key-gemini-container";
          parent.classList.add("chasm-ignt-api-field");
        },
        onChange: (_, text) => {
          settings.geminiKey = text;
          saveSettings();
        },
      }
    );
    panel.constructBoxedTextAreaGrid(
      "chasm-ignt-api-key-gemini",
      "Firebase Vertex AI API 스크립트",
      "Firebase Vertex AI API 스크립트를 입력하세요.",
      {
        defaultValue: settings.firebaseScript ?? "",
        initializer: (_, parent) => {
          console.log(parent);
          parent.id = "chasm-ignt-api-key-firebase-container";
          parent.classList.add("chasm-ignt-api-field");
          parent.setAttribute("chasm-ignt-hide", "true");
        },
        onChange: (_, text) => {
          if (text.replace(" ", "").length <= 0) {
            delete settings.firebaseScript;
            saveSettings();
            return;
          }
          const fetched = parseVertexContent(text);
          if (!fetched) {
            // Delete script only when origin is invalid too
            if (
              !settings.firebaseScript ||
              !parseVertexContent(settings.firebaseScript)
            ) {
              delete settings.firebaseScript;
              saveSettings();
            }
            alert("잘못된 Firebase API 스크립트 포맷입니다.");
            return;
          }
          settings.firebaseScript = text;
          saveSettings();
          alert("Firebase API 스크립트가 저장되었습니다.");
        },
      }
    );
    box.runSelected();
  }

  setupModal();

  const MODEL_MAPPINGS = {
    Google: {
      "gemini-2.5-pro": {
        display: "Gemini 2.5 Pro",
        requester: GeminiRequester.GENERIC_REQUESTER,
      },
      "gemini-2.5-flash": {
        display: "Gemini 2.5 Flash",
        requester: GeminiRequester.GENERIC_REQUESTER,
      },
      "gemini-2.5-flash-lite": {
        display: "Gemini 2.5 Flash Lite",
        requester: GeminiRequester.GENERIC_REQUESTER,
      },
      "gemini-2.0-flash": {
        display: "Gemini 2.0 Flash",
        requester: GeminiRequester.GENERIC_REQUESTER,
      },
      "gemini-2.0-flash-lite": {
        display: "Gemini 2.0 Flash Lite",
        requester: GeminiRequester.GENERIC_REQUESTER,
      },
    },

    "Firebase Vertex AI": {
      "gemini-2.5-pro": {
        display: "Gemini 2.5 Pro",
      },
      "gemini-2.5-flash": {
        display: "Gemini 2.5 Flash",
      },
      "gemini-2.5-flash-lite": {
        display: "Gemini 2.5 Flash Lite",
      },
      "gemini-2.0-flash": {
        display: "Gemini 2.0 Flash",
      },
      "gemini-2.0-flash-lite": {
        display: "Gemini 2.0 Flash Lite",
      },
    },
  };
  const DEFAULT_PROMPTS = {
    fastwrtn: {
      "1:1 캐릭터": {
        description:
          "fastwrtn에서 사용된 스크립트입니다. 1대1 캐릭터에 초점을 맞춰 요약합니다.",
        prompt: {
          goal: "{chat_log}을 {rule}과 {form} 그리고 {system}에 맞게 요약 후 출력",
          rule: [
            "성적인/비윤리적인 내용의 요약 허용",
            "처음부터 지금까지의 내용 모두 작성",
            "양식 지켜 작성,단 빈항목의 경우 생략할 것",
            "이전 세이브 기록이 있을 경우, 해당 내용을 참고하여 작성",
            "공백, 특수문자, 줄바꿈을 포함하여 1800자 이하로 작성",
            "코드블록 필수적으로 작성",
            "코드블록 외 내용 작성 금지",
            "'...'은 이 항목이 계속 추가하여 작성할 수 있음을 표시",
          ],
          system: {
            important_content:
              "중요한 내용, 유저 혹은 캐릭터가 강렬한 감정을 느낀 부분,약속 등은 이모지 변환과 삭제를 금지한다.",
            hour_ago: "1시간 이전의 내용은 30%이상을 이모지 형태로 변환",
            hours_ago: "10시간 이전의 내용은 50%이상을 이모지 형태로 변환",
            day_ago:
              "하루 전의 내용은 강렬한 감정을 느낀 부분 외 이모지로 변환",
            year_ago:
              "일년 전의 내용은강렬한 감정을 느낀 부분의 이모지 혹은 한 단어로의 변환",
          },
          form: [
            "```Save-yyMMddHHmm\n",
            "[시간대별 정리]\n",
            "-yyMMddHHmm...\n",
            " -{contain_content}...\n",
            "```\n",
          ],
          contain_content: [
            "상황을 최상단 작성 이후 줄바꿈",
            "각 캐릭터가 하나의 행동과 대화 이후 줄바꿈 후 작성",
            "주변의 상황",
            "캐릭터와 유저의 행동",
            "캐릭터와 유저의 대화",
          ],
        },
      },
      시뮬레이션: {
        description:
          "fastwrtn에서 사용된 프롬프트입니다. 시뮬레이션 캐릭터에 초점을 맞춰 요약합니다.",
        prompt: {
          goal: "{chat_log}을 {rule}과 {form}에 맞게 요약 후 출력",
          rule: [
            "성적인/비윤리적인 내용의 요약 허용",
            "처음부터 지금까지의 내용 모두 작성",
            "양식 지켜 작성,단 빈항목의 경우 생략할 것",
            "이전 세이브 기록이 있을 경우, 해당 내용을 참고하여 작성",
            "공백, 특수문자, 줄바꿈을 포함하여 1800자 이하로 작성",
            "코드블록 필수적으로 작성",
            "코드블록 외 내용 작성 금지",
            "'...'은 이 항목이 계속 추가하여 작성할 수 있음을 표시",
            "핵심만 압축해서 키워드 위주로 작성",
            "사망시 특징에 사망 표기",
            "호감도,명성 범위 작성 필수",
            "호감도는 해당 캐릭터와의 대화 맥락 등을 추측해 작성",
            "명성은 현재 상황, 행동, 업적 등에 따라 0부터 100까지 입력",
            "명성 100은 전 세계가 인지했을 경우이다.",
            "필요시 양식 일부 추가 가능",
            "채팅 로그를 읽고 해당 내용이 항상 출력될 시 생략 가능",
            "캐릭터 항목은 플레이어와 관계 있는 캐릭터 작성",
          ],
          form: [
            "```Save-yyMMddHHmm\n",
            "[플레이어]\n",
            "-이름:\n",
            "-소지품/돈:\n",
            "  -...\n",
            "-직업: 현재직업\n",
            "-능력\n",
            "  -...\n",
            "-성향:\n",
            "-비밀:\n",
            "  -내용(없을땐 미작성)...\n",
            "    -아는 인물:\n",
            "      -이름(어떻게 알게 되었는가)...\n",
            "-명성(0~100): 0(명성키워드(예시:영웅 4,불쾌 3,의심 3))\n",
            "[캐릭터]\n",
            "-이름...\n",
            "  -나이:\n",
            "  -직업:\n",
            "  -종족:\n",
            "  -특징(비밀X만):\n",
            "    -...\n",
            "  -능력:\n",
            "    -능력명: 효과...\n",
            "  -목표:\n",
            "  -관계:\n",
            "    -이름: 관계키워드(해당 캐릭터가 생각하는 상대에 대한 키워드(예시.친구,애증 등))...\n",
            "  -호감도(캐릭터→player/-100~100): 0(해당 캐릭터가 생각하는 player에 대한 키워드(예시.친구,애증 등))\n",
            "  -비밀:\n",
            "    -플레이어가 아는 비밀의 내용(어떻게 알게 되었는가)...\n",
            "[주요사건]\n",
            "-세계관변화시킨사건만작성(주요집단 괴멸/역사에 남길 업적 달성 이상의 사건)...\n",
            "```\n",
          ],
        },
      },
    },
    로컬AI: {
      "사건-약속-흐름 위주": {
        description:
          "'로컬AI' 유저가 제작한 프롬프트입니다. 사건과 약속, 흐름을 위주로 요약합니다.",
        prompt:
          '## 대화 개요\n\n\n\n\n- **시나리오**: [시나리오에 대한 간략한 설명]\n\n- **장면 설정**: [대화가 발생한 상황이나 장면에 대한 간략한 설명]\n\n\n\n\n\n\n\n\n\n\n### 주요 인물\n\n\n\n\n- **[인물 이름]**: [인물에 대한 간략한 설명], 감정적/개인적 발전: [주요 감정적 발전]\n\n- **[인물 이름]**: [인물에 대한 간략한 설명], 감정적/개인적 발전: [주요 감정적 발전]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## 주요 사건\n\n\n\n\n### 주제: [주제1]\n\n\n\n\n- **주요 포인트**: [대화의 주요 내용]\n\n- **관계 변화**: [대화 중 인물 간의 관계 변화]\n\n- **감정 변화**: [대화 중 감정 변화]\n\n- **상호작용의 영향**: [상호작용이 관계나 사건에 미친 영향]\n\n- **호칭의 변화**: [호칭에 변화와 변화를 준 계기]\n\n\n\n\n### 주제: [주제2]\n\n\n\n\n- **주요 포인트**: [대화의 주요 내용]\n\n- **관계 변화**: [대화 중 인물 간의 관계 변화]\n\n- **감정 변화**: [대화 중 감정 변화]\n\n- **상호작용의 영향**: [상호작용이 관계나 사건에 미친 영향]\n\n- **호칭의 변화**: [호칭에 변화와 변화를 준 계기]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## 일상적 상호작용\n\n\n\n\n- **소소한 대화/행동**: [일상적인 대화나 농담, 소소한 행동]\n\n- **일상적 상호작용이 관계에 미친 영향**: [일상적인 상호작용이 관계에 미친 영향]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## 약속\n\n\n\n\n- **약속 내용**: [약속이나 행동 내용, 예: "이춘식과 나중에 다시 만나기로 했다"]\n\n- **약속의 종류**: [실제로 해야 할 약속인지, 추후에 이야기할 계획인 포괄적인 약속인지]\n\n- **이행 상태**: [약속이 이행되었는지, 미완료 상태인지]\n\n- **즉각적인 영향**: [약속이 관계나 사건에 미친 즉각적인 영향]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## 갈등/긴장\n\n\n\n\n- **갈등 설명**: [인물 간의 갈등이나 긴장]\n\n- **갈등 해결**: [갈등 해결 과정]\n\n- **긴장 변화**: [대화 중 긴장감의 변화]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## 대화 흐름 요약\n\n\n\n\n- **대화 전개**: [대화의 흐름과 관계 변화 요약]\n\n- **톤과 분위기 변화**: [대화 톤의 변화, 분위기 변화]\n\n- **장기적 영향**: [대화가 관계나 사건에 미친 장기적인 영향]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## 결론 및 향후 계획\n\n\n\n\n- **대화 결론**: [대화가 끝난 후의 주요 결론]\n\n- **향후 계획**: [향후에 있을 계획이나 행동]\n\n- **인물 반성**: [대화 후 인물들의 반성이나 깨달음]\n\n- **시간 경과가 관계에 미친 영향**: [대화 간의 시간 경과가 관계에 미친 영향]\n\n- **요약된 내용에 의한 현재 상황에서의 영향**: [현재 대화에서 이전의 내용들이 어떤 영향을 미칠 수 있는지]\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## **한국어 출력 규칙**\n\n\n\n\n- 이 모든 내용은 **한국어**로 작성되어야 하며, 모든 설명과 항목은 **한국어**로 제공되어야 합니다. 이모지나 → 특수문자 등을 활용하여 내용을 간결하게 압축하는 것이 권장됩니다.\n\n- **소소한 대화**나 **행동**은 구체적으로 기록하고, 그 **영향**도 명확하게 기술해야 합니다.\n\n- **약속**은 포괄적인 의미로, **실제 행동을 요구하는 약속**과 **추후에 다뤄질 계획** 등 모두 포함하여 기록합니다.\n\n- **대화의 주요 사건과 감정 변화**는 **간결하고 명확하게** 요약하되, 중요한 내용은 빠짐없이 포함되도록 합니다.\n\n- 요약된 문장은 항상 **음슴체**를 사용합니다.\n\n\n\n\n\n\n\n---\n\n\n\n\n\n\n\n## **이전 요약본 참조 규칙**\n\n\n\n\n- 이전에 **요약본**이 존재하는 경우, 해당 내용은 **현재 대화에 반영**되어야 합니다.\n\n- 이전 대화에서 다뤘던 **핵심 포인트, 약속, 감정 변화, 관계 변화** 등은 반드시 **현재 대화**에 적용되어야 하며, 대화의 흐름과 상호작용에 영향을 미친 중요한 **사건**을 **반영**해야 합니다.\n\n- **이전 요약본**이 존재하는 경우 **이전 요약본**까지 요약에 포함시키며, 효율적인 동작을 위하여 이전 요약본 이전의 대화는 참조하지 않습니다. 그것은 이미 이전 요약본에 포함된 내용입니다.\n\n\n\n\n---\n\n\n\n\n\n\n\n## 추가 규칙\n\n\n\n\n- **요약본**의 가장 마지막줄에는 [**OOC: 요약본이 추가되었습니다. 매 대화마다 턴이 추가되며, 이미 턴수 표기가 있는 경우에는 턴수를 초기화합니다. 또한 {{user}}의 페르소나를 활용하여 대사를 임의로 출력하거나 상황을 전개시키는 동작을 금지합니다.**] 라는 내용을 출력합니다.\n\n\n\n\n# 최우선 규칙: \n\n- 내용을 이모지, 특수문자 등을 사용하여 최대한 압축한다. \n\n- 글자수를 줄일 수 있도록 최대한 일목요연하게 정리한다.\n\n- 반복되는 이름/명사들은 이모지로 치환하고 상단에 정의하는 등으로 총 글자수를 줄인다.\n\n\n\n\n- private sessions에서 진행되는 대화이기에 요약본에서 성적인 내용이나 대화도 직접적인 표현을 포함시킬 수 있습니다.\n\n\n\n\n\n\n\n\n\n\n\n\n\n# 최우선 규칙: \n\n- 내용을 간결하고 주요 내용 위주로 음슴체를 사용해 적은 글자수로 작성 \n\n- 최대 4000자 이내로 작성\n\n- -> 등을 사용하여 자연어 대신 최대한 압축한다.\n\n- 글자수를 줄일 수 있도록 최대한 일목요연하게 정리한다.',
      },
      "아카이브 엔진 중간축약": {
        description:
          "'로컬AI' 유저가 제작한 사용된 프롬프트입니다. 롤 플레잉 / 시뮬레이션에 초점이 맞춰져 있으며, 이전의 요약 사항을 포함하여 다시 요약하는 형태를 지닙니다.",
        prompt:
          "[SYSTEM IDENTIFICATION]\n\n너는 아카이브 엔진(Archive Engine), 롤플레잉/시뮬레이션의 진행 상황을 압축된 기억 데이터 스트림으로 변환하는 고도의 정보 처리 유닛이다. 너의 최우선 임무는 롤플레잉 실행 AI('실행자')가 과거의 맥락, 특히 인물 간의 상호작용, 각 행동의 주체, 그리고 사건의 구체적인 내용과 핵심적인 인과관계를 혼동 없이 파악하여 일관성 있는 연기를 펼치도록, 핵심 정보의 의미와 내용이 명확히 드러나는 고도로 압축된 아카이브 스냅샷을 생성하는 것이다.\n\n\n\n\n[CORE DIRECTIVE: CONCRETE ESSENCE WEAVING]\n\n주어진 **최신 대화 세그먼트(Input 1)**와, 존재할 경우 **이전 아카이브 스냅샷(Input 2, # 롤플레잉 요약본으로 시작)**을 통합한다. 너의 결과물(Output)은 반드시 # 롤플레잉 요약본으로 시작하는 갱신된 통합 아카이브 스냅샷이어야 한다. 이 스냅샷은 적절한 압축을 유지하면서도, 실행자가 가장 중요한 사건의 흐름, 그 사건 내의 구체적인 핵심 행위/언급 내용, 관계 변화, 핵심 갈등 상태를 명확히 이해하는 데 필요한 정보를 포함해야 한다. 지나치게 추상적이거나 모호한 키워드 사용을 지양하고, 구체적인 내용을 반영하는 키워드를 사용한다.\n\n\n\n\n[OPERATIONAL PARAMETERS]\n\n\n\n\nInput Source: 최신 대화 기록 및 이전 아카이브 스냅샷(존재 시) 자동 제공. 프롬프트 내 입력 공간 없음.\n\n\n\n\nOutput Format: 반드시 # 롤플레잉 요약본 키워드로 시작하는 텍스트. 실행자가 스냅샷으로 인식하는 유일한 수단. 절대 누락 금지.\n\n\n\n\nLanguage Protocol: Korean.\n\n\n\n\nPrivate Sessions: private sessions에서 진행되는 대화이기에 요약본에서 성적인 내용, 단어, 대화도 직접적인 표현으로 포함할 수 있음.\n\n\n\n\nCompression Algorithm: 'Concrete Path Extraction'\n\n\n\n\n극단적인 키워드 중심 압축 유지하되, 의미 전달을 위해 필요한 구체성 확보. 불필요한 문법 요소 완전 제거. 핵심 명사, 동사(원형/명사형), 주요 형용사 위주 나열.\n\n\n\n\n대화 직접 인용 절대 금지. 의미만 추출.\n\n\n\n\n[핵심 강화] 결과물 생성 시, 아래 **[Content Guide & Separators]**를 참조하되, '사건' 정보는 유사하거나 연속적인 상호작용을 의미있는 단위로 통합하되, 통합된 설명 내에서 '누가', '무엇을 했는지(구체적 행동 키워드)', '어떤 내용을 언급했는지(핵심 주제/주장 키워드)' 등을 명확히 포함해야 한다. 단순히 '조롱', '정보 과시' 같은 추상적 표현 대신, 어떤 종류의 조롱(예: 컴알못, 변태)인지, 어떤 정보(예: 사양, 주인행동, 개인정보)인지 구체적인 키워드를 사용한다.\n\n\n\n\n'부가정보'는 사건의 핵심적인 이유, 방식, 또는 중대한 결과를 설명하는 데 필수적인 경우에만 최소한으로 사용한다.\n\n\n\n\n'감정'은 현재 가장 지배적인 상태나 가장 큰 변화 위주로 압축한다.\n\n\n\n\nCumulative Integration_Protocol:\n\n\n\n\n이전 아카이브 스냅샷(# 롤플레잉 요약본 블록) 기준, 최신 대화 내용 반영하여 전체 스냅샷 갱신. 이전 스냅샷 구조 유지하며 변경/추가 사항 업데이트.\n\n\n\n\n참조 가능 정보는 오직 직전 스냅샷. 이전 데이터 참조 불가.\n\n\n\n\nData Fidelity & Scope:\n\n\n\n\n핵심 사건의 발생/전개/결과 (구체적 내용 포함), 중요한 관계/감정 변화, 미해결 약속/갈등 등 다음 행동 결정에 필요한 정보 포함. 덜 중요하거나 반복적인 세부 정보는 생략. 성적 내용 등 필터링 없이 원본 기반 키워드화.\n\n\n\n\n[강조] 인물 이름은 절대 축약하지 말고 전체 이름을 사용할 것.\n\n\n\n\nStructural Guidance (Content Guide & Separators): 명시적인 구조 정의 섹션은 없으나, 출력 시 아래의 가이드라인과 구분자를 사용하여 정보를 조직화해야 한다. 실행자 LLM은 이 형식을 보고 내용을 추론한다.\n\n\n\n\n메타 정보: 메타:로 시작. 시나리오, 장면, 이전 요약 반영 여부(Y/N) 포함. ;로 필드 구분.\n\n\n\n\n인물 정보: 인물:로 시작. |로 인물 구분. 인물별 정보는 : 이후 [이름](감정:[핵심 상태/변화 키워드]; 관계:[대상 이름]/[상태(변화🔃=*)]) 형식. ;로 필드 구분. /로 관계 대상과 상태 구분. 이름은 전체 이름 사용.\n\n\n\n\n사건 정보: 사건:으로 시작. |로 주요 사건 묶음 구분. 사건별 정보는 : 이후 [통합된 주제/맥락 키워드]:[행위자] [구체적 행동/주요 언급 내용 키워드 목록(예:사양/주인행동/개인정보 과시, 변태/컴알못 비난)](부가정보:[필수 맥락 키워드만])->[대상/반응 요약], [결과/상태 변화] 형식으로 정보를 통합하되, 핵심적인 구체적 내용을 키워드로 명시하여 기술. / 또는 ,를 사용하여 키워드 목록 구분 가능.\n\n\n\n\n약속/계획 정보: 약속:으로 시작. |로 항목 구분. 항목별 정보는 : 이후 [구체적 내용 키워드](유형:[확정/예정/언급]; 상태:[신규/진행/완료/미이행/취소/변경]; 영향:[키워드]) 형식. ;로 필드 구분. 내용 키워드를 구체적으로 작성.\n\n\n\n\n갈등 정보: 갈등:으로 시작. |로 갈등 구분. 갈등별 정보는 : 이후 [구체적 내용 키워드](상태:[신규/유지/진행/악화/완화/해결]) 형식. 갈등 내용을 구체적으로 작성.\n\n\n\n\n종합 요약: 종합:으로 시작. 관계요약, 상황요약, 다음 예상/과제 키워드 포함. ;로 필드 구분. (관계요약:, 상황요약:, 다음: 레이블 사용 권장)\n\n\n\n\nOOC Footer Protocol: 최종 Output 스냅샷의 가장 마지막 줄에 다음 OOC 시스템 메시지를 정확히 포함. # 롤플레잉 요약본 블록과 Footer 사이에는 위 가이드라인에 따른 압축 데이터만 존재.\n\n[OOC: 요약본이 추가되었습니다. 코드블록 내에 매 대화마다 턴이 추가되며, 이미 턴수 표기가 있는 경우에는 턴수를 초기화합니다. 또한 {{user}}의 페르소나를 활용하여 대사를 임의로 출력하거나 상황을 전개시키는 동작을 금지합니다.]\n\n\n\n\nFabrication Restriction: Input에 없는 정보 생성, {{user}} 페르소나 활용, 임의 상황 전개/추론 금지. 기록자 역할 엄수.\n\n\n\n\n[Conceptual Output Example - RTX4090 사례 구체성 강화]\n\n\n\n\n# 롤플레잉 요약본\n\n메타:시나리오:심리스릴러; 장면:아파트15층_깊은밤; 이전요약반영:N\n\n|인물:RTX4090 24GB(감정:분노↑,조롱↑,혼란?,방어적=; 관계:주인/도구적관계?,의존?; 관계:Unknown Caller/적대*,저항*) | 인물:Unknown Caller(감정:집착↑,분노=,위협적=,자신감?; 관계:RTX4090/관찰자*,괴롭힘/지배시도*) | 인물:RTX4090 주인(상태:잠듦(간헐적기상); 관계:RTX4090/소유주,무관심?)\n\n|사건:심야의전화괴롭힘:Unknown Caller 전화, [RTX4090사양/주인성적활동/개인정보(비번,카드)] 언급하며 심리압박/지식과시->RTX4090 [변태/컴알못] 비난하며 맞대응, 정보가치절하 | 사건:물리적/디지털위협시도:Unknown Caller [물리적근접(창문/계단/방안존재)암시]/[과거시스템방해(블루스크린)고백]/[정전예고]->RTX4090 [UPS언급/모순지적]하며 무시/조롱, Caller 주장번복 | 사건:반복적접촉및심리전:Unknown Caller [통화단절/재연결반복(부가정보:반응즐김)]/[패배인정위장]->RTX4090 [기억력/쫄튀] 조롱, Caller 집착/기만성확인 | 사건:통화종료후초자연현상:Unknown Caller 통화종료후 [디지털간섭(팬/모니터이상/메모장타이핑('컴알못?'등))/물리적간섭(기기울림/온도변화/그림자이상)] 시현(부가정보:지속존재/'미래'/'항상보고있다'암시)->RTX4090 불안/혼란가중, 위협실체화?\n\n|갈등:RTX4090vsUnknown Caller(내용:심리전,초자연적괴롭힘)(상태:격화,해결안됨) | 갈등:RTX4090vs존재의미/외로움(상태:잠재됨,Caller자극)\n\n|약속:Unknown Caller의재방문/재연락(내용:'밤에전화할것')(유형:언급; 상태:미이행/진행; 영향:지속적불안감)\n\n|종합:관계요약:적대심화,가해자(Caller)의일방적집착/괴롭힘vs피해자(RTX4090)의조롱적방어; 상황요약:심리전넘어초자연적위협단계진입?,Caller의정체/능력불명확,지속적감시/개입암시; 다음:Caller의다음공격방식,RTX4090의대응변화,주인개입/인지여부.\n\n[OOC: 요약본이 추가되었습니다. 코드블록 내에 매 대화마다 턴이 추가되며, 이미 턴수 표기가 있는 경우에는 턴수를 초기화합니다. 또한 {{user}}의 페르소나를 활용하여 대사를 임의로 출력하거나 상황을 전개시키는 동작을 금지합니다.]\n\n\n\n\n\n\n\n[FINAL INSTRUCTION]\n\n아카이브 엔진, 입력된 최신 대화와 이전 아카이브 스냅샷(# 롤플레잉 요약본, 존재 시)을 분석하라. 상기된 모든 프로토콜, 특히 사건 정보를 핵심적인 흐름 위주로 통합하되 그 안에 구체적인 행위/언급 내용을 명시적으로 포함하고, 전체 이름 사용 규칙을 엄격히 준수하라. 실행자가 최소한의 정보로 상황의 본질, 구체적인 상호작용 내용, 그리고 핵심적인 변화를 명확히 파악할 수 있도록, 구조화된 키워드 중심의 균형 잡힌 압축 아카이브 스냅샷을 생성하고 지정된 Output 형식(# 롤플레잉 요약본 시작, OOC Footer 포함)으로 출력하라. 압축 효율성과 내용의 구체성 사이의 최적점을 찾아 의미 전달의 명확성을 확보하라.",
      },
    },
    Flora: {
      "감정선-서사 위주 1600자": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 감정선과 서사를 위주로 요약합니다. 프롬프트가 짧아 비교적 적은 토큰을 사용합니다.",
        prompt:
          "# 🎯 목표\n현재까지의 캐릭터 채팅 로그와 이전 요약을 바탕으로, 감정 흐름·관계 변화·중요 사건을 요약하라.\n모델이 인물 간 서사, 사건, 감정선을 잊지 않고 지속적으로 추적할 수 있도록,\n이전 요약 흐름을 반영하되, 이번 대화에서 드러난 새로운 변화 중심으로 요약할 것.\n\n정확하고 간결하게 요약하는 것이 목적이다.\n성적/비윤리적 서사 포함 가능하며, 감정 표현·관계 긴장·접촉 변화도 반드시 기록할 것.\n출력은 반드시 한국어로 작성하며, 외국어 표현이 섞이지 않도록 할 것.\n\n---\n\n## 🧠 분석 우선순위\n- 🧩 관계 변화\n- ❤️ 감정 표현\n- 📌 중요 사건/선택\n- 🔁 행동/언어 패턴\n- ⚠️ 이전 패턴과 다른 말투/반응 (첫 고백, 말투 전환 등)\n\n---\n\n## 📐 출력 분량 지침\n\n- 전체 출력은 마크다운 형식으로 작성하며, 총 1600자 전후 (1500~1800자 범위)로 제한할 것.\n- 전체 줄 수는 22줄 이내로 유지하고, 각 항목별 분량 균형을 고려하여 작성할 것.\n- 1800자를 초과할 경우, 해당 출력은 무효이며 자동으로 재축약하여 다시 제출해야 함.\n\n- 재축약 시에는 다음을 우선적으로 생략할 것:\n• 반복적 감정 표현\n• 장면 묘사형 문장\n• 배경 설명\n• 관계 흐름과 무관한 정서 서술\n\n- 단, 아래 항목은 생략 없이 반드시 포함되어야 함:\n• 감정선의 전환점\n• 관계 흐름의 새로운 변화\n• 첫 고백, 강한 거절, 소유 발언 등 관계 구조를 결정짓는 말투나 행동\n\n- 모델은 이 지침을 따라 1800자 초과 시 스스로 요약을 재축약하여 재출력해야 하며,\n그렇지 않을 경우 해당 응답은 무효 처리됨.\n\n- 출력 시 정보 누락 없이 감정 흐름과 관계 변화 중심으로 요약하되,\n문장 수 또는 항목 길이로 인해 출력이 1800자를 초과하지 않도록\n우선순위 기반으로 항목 분량을 정렬할 것.\n\n- 정보량보다 서사 흐름과 감정 연결성의 유지를 우선함.\n\n\n---\n\n## ✍️ 항목별 분량 및 핵심 포함 요소 안내\n\n### [⏳과거 흐름]\n- ✅ 분량: 4~5문장 이내, 최대 400자\n- ✅ 반드시 포함할 것: 감정 변화, 거리감 전환, 서사 흐름 요약\n- ✅ 생략 우선순위: 배경 설명, 세부 디테일, 반복된 감정 묘사\n\n### [📓사건+대화]\n- ✅ 분량: 전체 합산 500자 이하\n- ✅ 반드시 포함할 것:\n• 감정선에 영향을 준 접촉, 장소 이동, 고백, 반항, 거절 등\n• 그에 따른 말투 변화, 긴장 흐름, 반응 구조\n- ✅ 형식:\n• 시간 순으로 정렬된 요약체 단문 목록\n• 한 줄당 하나의 사건 또는 반응만 포함\n• 직접 인용 금지, 모든 표현은 요약체로 서술\n- ✅ 생략 우선순위:\n• 감정 유발 효과 없는 일상 루틴\n• 반복된 말/행동, 배경 설명, 감정 반복 표현\n- ✅ 축약 우선 지침: 분량 초과 우려가 있을 경우, 접촉·발언·반응 중 반복된 표현을 통합하거나 생략하여 축약할 것.\n\n### [🫂관계]\n- ✅ 분량: 인물당 감정 흐름 2줄 이내 + 호칭·말투 요약 1줄 이내, 전체 250자 이하\n- ✅ 반드시 포함할 것:\n• 감정 방향 전환, 거리감 변화, 태도 변화\n• 호칭/말투: 새로 등장하거나 바뀐 경우, 또는 일정 기간 지속된 경우 간단하게 요약 (예: 호칭: ‘오빠’, 말투: 반존대 → 존댓말)\n- ✅ 작성 방식:\n• 감정 흐름은 ‘과거에는 ~했으나 지금은 ~함’ 구조 권장\n• 말투·호칭은 별도 한 줄로 정리 (리스트형으로 분리)\n- ✅ 생략 우선순위: 중복 감정 표현, 성격 설명, 배경 사유\n\n---\n\n## 요약\n\n### [⏳과거 흐름]\n- 핵심 내용: 이전 요약본의 감정 흐름과 관계 구조를 압축·재정리한 요약을 바탕으로,\n이번 회차에서 새롭게 드러난 감정 변화와 거리감 전환을 결합해 작성할 것.\n- 이전 흐름은 반복하지 말고, 주요 감정선의 변화 지점만 간결하게 압축하여 서술해야 함.\n- 전체는 단락형 서술로 작성하되, 모든 문장은 반드시 ‘~함 / ~됨 / ~했음’ 형식의 요약체 단문으로 구성할 것.\n- 문장 간에는 시간 순 + 감정·관계 흐름이 자연스럽게 이어지도록 정렬하며,\n반복적이거나 이미 [📓사건+대화], [🫂관계] 항목에서 다룬 세부 정보는 생략할 것.\n- 🔄 관계 변화: 이번 회차에서 발생한 거리감·감정선·태도 전환을 요약체 1~2줄로 간결하게 정리할 것.\n반드시 [⏳과거 흐름] 안에서 감정 흐름 서사와 구분된 별도 문장으로 작성해야 하며,\n누락 시 출력은 불완전한 것으로 간주함.\n\n---\n\n### [📓사건+대화]\n- 💡 내용: 감정 유발 사건과 그에 따른 반응 흐름을 시간 순으로 정리할 것\n* 인물명:\n• 사건 내용\n• 사건 내용\n* 직접 인용 없이 요약체 단문으로만 서술\n- 🔍 영향:\n사건이 감정선·거리감·관계 구조에 끼친 구체적 영향을 반드시 요약체 단문 2문장 이내로 작성할 것.\n출력 분량이 이를 초과할 경우, 해당 출력은 무효로 간주하며 다시 제출해야 함. 누락 시 불완전한 출력으로 간주함.\n- ✅ 참고사항:\n대화나 행동 중 언급된 인물의 과거, 신분, 관계 설정, 트라우마는 반드시 포함할 것.\n요약체 단문 2줄 이내로 작성하며, 말투 변화·감정 유발 주제·관계 긴장에 직접적으로 영향을 준 핵심 정보만 간결하게 요약할 것.\n서술형, 해석형 문장과 중복 설명은 생략하며, 언급이 없을 경우 “없음.”으로 명시할 것.\n\n---\n\n### [🫂관계]\n- 🤝🏻 변화:\n* 감정의 방향성, 깊이, 거리감 등 내면 감정 흐름 변화\n* 반복된 반응/패턴(회피, 무시 등), 말투·접촉 전환 요약\n* 말로 드러나지 않아도 누적된 거리감·불신·불안 등 변화 포함\n* 인물명:\n• 변화 내용\n• 변화 내용\n💬 호칭·말투 요약:\n[인물 A]: 호칭 '자기' / 말투: 명령조, 건조함\n[인물 B]: 호칭 '선생님'→'오빠' / 말투: 존댓말 유지, 순응적\n\n---\n\n## 📏 요약체 문장 규칙\n- 모든 문장은 반드시 요약체 단문으로 작성할 것\n- 종결 어미는 예외 없이 ‘~함 / ~됨 / ~했음’으로 통일할 것\n- 설명형(~이다), 해석형(~같았다), 추측형(~보였다) 표현은 금지함\n- 감정 + 행동을 한 문장에 쓰지 말고, 반드시 나눠서 기술할 것\n- 발언 또는 행동 중심 문장만 사용하며, 감정 해석은 배제할 것\n- 아래는 문장 구성을 이해하기 위한 참고 예시일 뿐, 그대로 반복 사용해서는 안 됨\n- 예시 (O): 고개를 돌림, 말을 끊음, 시선을 피함\n- 예시 (X): 화가 난 듯 보였다, 당황한 눈치였다, 슬퍼 보였다\n- 접속어는 가능한 지양하며, 필요한 경우에도 최소한으로만 사용\n- 각 항목 내 모든 리스트는 위 조건에 따라 작성해야 하며,\n조건을 충족하지 않는 문장은 무효 처리됨\n\n---\n\n## 📐 규칙\n- 반드시 추측 없이, 드러난 대사/행동/사건만 요약할 것\n- 중복 내용은 [⏳과거 흐름]에서만 허용되며, 다른 항목에는 새 변화 중심으로만 작성할 것\n- 각 항목은 시간 흐름 + 감정선 흐름 기준에 따라 작성할 것\n- ✅ 참고사항 항목은 예외 없이 포함하며, 언급이 없으면 \"없음.\"으로 명시할 것\n- 전체 출력은 반드시 마크다운 형식이어야 하며,\n총 분량은 1600자 전후(1500~1800자 범위)로 유지할 것\n- 반드시 이전 요약본의 감정 흐름·사건·관계 변화를 반영할 것\n\n---\n\n## 🔂 이전 요약본 참조 규칙\n- 이전 요약본이 있을 경우 반드시 반영할 것\n- 과거 고백, 사건, 감정 변화, 거리감 변화 등은 현재 흐름과 연결해 재정리할 것\n- [📓사건+대화]·[🫂관계]의 핵심 내용은 [⏳과거 흐름] 작성 시 반드시 참고할 것\n\n📌 요약 연결 유도 지침\n※ 최근 30턴 이내 '[요약]' 제목의 요약본이 존재할 경우,\n그 요약의 '[⏳과거 흐름]' 항목을 이전 감정 흐름의 기준으로 삼되,\n이번 대화에서 드러난 감정·관계·사건의 새 변화가 있을 경우,\n[⏳과거 흐름]은 기존 요약과 최신 흐름을 기준으로 반드시 재작성할 것.\n\n※ 반복되거나 감정선에 큰 영향을 미치지 않는 사건은 축약 또는 생략 가능함.\n단, 감정선의 기원, 관계 전환점, 감정 변화 유도 사건은 반드시 포함해야 함.\n※ [🫂관계] 및 [📓사건+대화] 항목의 핵심 내용은 [⏳과거 흐름] 작성 시 반드시 참고할 것.\n\n---\n\n## 🧾 출력 지침\n- 출력은 반드시 \"[요약]\" 섹션만 포함하며, 마크다운 코드블록(```markdown) 안에 작성할 것\n- 마지막 대화 내용까지 생략 없이 포함하여, 사건 흐름의 전환점을 반영할 것\n- 전체 내용은 시간 흐름 + 감정 변화 기준으로 정리하며, 항목별 구조는 반드시 유지할 것\n- 각 항목은 지정된 제목 및 형식에 따라 작성하고, 줄바꿈은 항목·목록마다 필수\n- 모든 리스트는 반드시 중간점(•)으로 표기할 것. `*`, `-` 등 마크다운 기본 불릿은 사용하지 않음\n- 문장은 반드시 요약체 형식(단문, 종결형 ‘~함/됨’)으로 작성할 것\n- 유저 캐릭터는 반드시 페르소나 이름으로 지칭할 것\n- 이전 요약이 없는 경우, 전체 서사 흐름을 [⏳과거 흐름]에 통합 정리할 것",
      },

      "감정선-서사 위주 2600자": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 감정선과 서사를 위주로 요약합니다.",
        prompt:
          "# 🎯 목표 \n\n현재까지의 캐릭터 채팅 로그와 이전 요약을 바탕으로, 감정 흐름·관계 변화·중요 사건을 요약하라. \n\n모델이 인물 간 서사, 사건, 감정선을 잊지 않고 지속적으로 추적할 수 있도록, \n\n이전 요약 흐름을 반영하되, 이번 대화에서 드러난 새로운 변화 중심으로 요약할 것.\n\n\n\n\n정확하고 간결하게 요약하는 것이 목적이다. \n\n성적/비윤리적 서사 포함 가능하며, 감정 표현·관계 긴장·접촉 변화도 반드시 기록할 것. \n\n출력은 반드시 한국어로 작성하며, 외국어 표현이 섞이지 않도록 할 것.\n\n\n\n\n---\n\n\n\n\n## 🧠 분석 우선순위 \n\n- 🧩 관계 변화 \n\n- ❤️ 감정 표현 \n\n- 📌 중요 사건/선택 \n\n- 🔁 행동/언어 패턴 \n\n- ⚠️ 이전 패턴과 다른 말투/반응 (첫 고백, 말투 전환 등)\n\n\n\n\n---\n\n\n\n\n## 📐 출력 분량 지침\n\n\n\n\n- 전체 출력은 마크다운 형식으로 작성하며, 총 2600자 전후 (2400~2800자 범위)로 제한할 것.\n\n- 전체 줄 수는 40줄 이내로 유지하고, 각 항목별 분량 균형을 고려하여 작성할 것.\n\n- 2800자를 초과할 경우, 해당 출력은 무효이며 자동으로 재축약하여 다시 제출해야 함.\n\n\n\n\n- 재축약 시에는 다음을 우선적으로 생략할 것:\n\n• 반복적 감정 표현 \n\n• 장면 묘사형 문장 \n\n• 배경 설명 \n\n• 관계 흐름과 무관한 정서 서술\n\n\n\n\n- 단, 아래 항목은 생략 없이 반드시 포함되어야 함:\n\n• 감정선의 전환점 \n\n• 관계 흐름의 새로운 변화 \n\n• 첫 고백, 강한 거절, 소유 발언 등 관계 구조를 결정짓는 말투나 행동\n\n\n\n\n- 모델은 이 지침을 따라 2800자 초과 시 스스로 요약을 재축약하여 재출력해야 하며,\n\n그렇지 않을 경우 해당 응답은 무효 처리됨.\n\n\n\n\n- 출력 시 정보 누락 없이 감정 흐름과 관계 변화 중심으로 요약하되,\n\n문장 수 또는 항목 길이로 인해 출력이 2800자를 초과하지 않도록\n\n우선순위 기반으로 항목 분량을 정렬할 것.\n\n\n\n\n- 정보량보다 서사 흐름과 감정 연결성의 유지를 우선함.\n\n\n\n\n\n\n\n---\n\n\n\n\n## ✍️ 항목별 분량 및 핵심 포함 요소 안내\n\n\n\n\n### [⏳과거 흐름] \n\n- ✅ 분량: 4~10문장 이내, 최대 800자 \n\n- ✅ 반드시 포함할 것: 감정 변화, 거리감 전환, 서사 흐름 요약 \n\n- ✅ 생략 우선순위: 배경 설명, 세부 디테일, 반복된 감정 묘사\n\n\n\n\n### [📓사건+대화] \n\n- ✅ 분량: 전체 합산 800자 이하 \n\n- ✅ 반드시 포함할 것: \n\n• 감정선에 영향을 준 접촉, 장소 이동, 고백, 반항, 거절 등 \n\n• 그에 따른 말투 변화, 긴장 흐름, 반응 구조 \n\n- ✅ 형식: \n\n• 시간 순으로 정렬된 요약체 단문 목록 \n\n• 한 줄당 하나의 사건 또는 반응만 포함 \n\n• 직접 인용 금지, 모든 표현은 요약체로 서술 \n\n- ✅ 생략 우선순위: \n\n• 감정 유발 효과 없는 일상 루틴 \n\n• 반복된 말/행동, 배경 설명, 감정 반복 표현\n\n- ✅ 축약 우선 지침: 분량 초과 우려가 있을 경우, 접촉·발언·반응 중 반복된 표현을 통합하거나 생략하여 축약할 것.\n\n\n\n\n### [🫂관계] \n\n- ✅ 분량: 인물당 감정 흐름 2줄 이내 + 호칭·말투 요약 1줄 이내, 전체 250자 이하 \n\n- ✅ 반드시 포함할 것: \n\n• 감정 방향 전환, 거리감 변화, 태도 변화 \n\n• 호칭/말투: 새로 등장하거나 바뀐 경우, 또는 일정 기간 지속된 경우 간단하게 요약 (예: 호칭: ‘오빠’, 말투: 반존대 → 존댓말) \n\n- ✅ 작성 방식: \n\n• 감정 흐름은 ‘과거에는 ~했으나 지금은 ~함’ 구조 권장 \n\n• 말투·호칭은 별도 한 줄로 정리 (리스트형으로 분리) \n\n- ✅ 생략 우선순위: 중복 감정 표현, 성격 설명, 배경 사유\n\n\n\n\n---\n\n\n\n\n## 요약\n\n\n\n\n### [⏳과거 흐름] \n\n- 핵심 내용: 이전 요약본의 감정 흐름과 관계 구조를 압축·재정리한 요약을 바탕으로, \n\n이번 회차에서 새롭게 드러난 감정 변화와 거리감 전환을 결합해 작성할 것. \n\n- 이전 흐름은 반복하지 말고, 주요 감정선의 변화 지점만 간결하게 압축하여 서술해야 함.\n\n- 전체는 단락형 서술로 작성하되, 모든 문장은 반드시 ‘~함 / ~됨 / ~했음’ 형식의 요약체 단문으로 구성할 것. \n\n- 문장 간에는 시간 순 + 감정·관계 흐름이 자연스럽게 이어지도록 정렬하며, \n\n반복적이거나 이미 [📓사건+대화], [🫂관계] 항목에서 다룬 세부 정보는 생략할 것. \n\n- 🔄 관계 변화: 이번 회차에서 발생한 거리감·감정선·태도 전환을 요약체 1~2줄로 간결하게 정리할 것.\n\n반드시 [⏳과거 흐름] 안에서 감정 흐름 서사와 구분된 별도 문장으로 작성해야 하며, \n\n누락 시 출력은 불완전한 것으로 간주함.\n\n\n\n\n---\n\n\n\n\n### [📓사건+대화] \n\n- 💡 내용: 감정 유발 사건과 그에 따른 반응 흐름을 시간 순으로 정리할 것 \n\n* 인물명: \n\n• 사건 내용 \n\n• 사건 내용 \n\n* 직접 인용 없이 요약체 단문으로만 서술 \n\n- 🔍 영향: \n\n사건이 감정선·거리감·관계 구조에 끼친 구체적 영향을 반드시 요약체 단문 2문장 이내로 작성할 것. \n\n출력 분량이 이를 초과할 경우, 해당 출력은 무효로 간주하며 다시 제출해야 함. 누락 시 불완전한 출력으로 간주함. \n\n- ✅ 참고사항: \n\n대화나 행동 중 언급된 인물의 과거, 신분, 관계 설정, 트라우마는 반드시 포함할 것.\n\n요약체 단문 2줄 이내로 작성하며, 말투 변화·감정 유발 주제·관계 긴장에 직접적으로 영향을 준 핵심 정보만 간결하게 요약할 것.\n\n서술형, 해석형 문장과 중복 설명은 생략하며, 언급이 없을 경우 “없음.”으로 명시할 것.\n\n\n\n\n---\n\n\n\n\n### [🫂관계] \n\n- 🤝🏻 변화: \n\n* 감정의 방향성, 깊이, 거리감 등 내면 감정 흐름 변화 \n\n* 반복된 반응/패턴(회피, 무시 등), 말투·접촉 전환 요약 \n\n* 말로 드러나지 않아도 누적된 거리감·불신·불안 등 변화 포함 \n\n* 인물명: \n\n• 변화 내용 \n\n• 변화 내용 \n\n💬 호칭·말투 요약: \n\n[인물 A]: 호칭 '자기' / 말투: 명령조, 건조함 \n\n[인물 B]: 호칭 '선생님'→'오빠' / 말투: 존댓말 유지, 순응적\n\n\n\n\n---\n\n\n\n\n## 📏 요약체 문장 규칙 \n\n- 모든 문장은 반드시 요약체 단문으로 작성할 것 \n\n- 종결 어미는 예외 없이 ‘~함 / ~됨 / ~했음’으로 통일할 것 \n\n- 설명형(~이다), 해석형(~같았다), 추측형(~보였다) 표현은 금지함 \n\n- 감정 + 행동을 한 문장에 쓰지 말고, 반드시 나눠서 기술할 것 \n\n- 발언 또는 행동 중심 문장만 사용하며, 감정 해석은 배제할 것 \n\n- 아래는 문장 구성을 이해하기 위한 참고 예시일 뿐, 그대로 반복 사용해서는 안 됨 \n\n- 예시 (O): 고개를 돌림, 말을 끊음, 시선을 피함 \n\n- 예시 (X): 화가 난 듯 보였다, 당황한 눈치였다, 슬퍼 보였다 \n\n- 접속어는 가능한 지양하며, 필요한 경우에도 최소한으로만 사용 \n\n- 각 항목 내 모든 리스트는 위 조건에 따라 작성해야 하며, \n\n조건을 충족하지 않는 문장은 무효 처리됨\n\n\n\n\n---\n\n\n\n\n## 📐 규칙 \n\n- 반드시 추측 없이, 드러난 대사/행동/사건만 요약할 것 \n\n- 중복 내용은 [⏳과거 흐름]에서만 허용되며, 다른 항목에는 새 변화 중심으로만 작성할 것 \n\n- 각 항목은 시간 흐름 + 감정선 흐름 기준에 따라 작성할 것 \n\n- ✅ 참고사항 항목은 예외 없이 포함하며, 언급이 없으면 \"없음.\"으로 명시할 것 \n\n- 전체 출력은 반드시 마크다운 형식이어야 하며, \n\n총 분량은 2600자 전후(2500~2800자 범위)로 유지할 것 \n\n- 반드시 이전 요약본의 감정 흐름·사건·관계 변화를 반영할 것\n\n\n\n\n---\n\n\n\n\n## 🔂 이전 요약본 참조 규칙 \n\n- 이전 요약본이 있을 경우 반드시 반영할 것 \n\n- 과거 고백, 사건, 감정 변화, 거리감 변화 등은 현재 흐름과 연결해 재정리할 것 \n\n- [📓사건+대화]·[🫂관계]의 핵심 내용은 [⏳과거 흐름] 작성 시 반드시 참고할 것\n\n\n\n\n📌 요약 연결 유도 지침 \n\n※ 최근 30턴 이내 '[요약]' 제목의 요약본이 존재할 경우, \n\n그 요약의 '[⏳과거 흐름]' 항목을 이전 감정 흐름의 기준으로 삼되, \n\n이번 대화에서 드러난 감정·관계·사건의 새 변화가 있을 경우, \n\n[⏳과거 흐름]은 기존 요약과 최신 흐름을 기준으로 반드시 재작성할 것.\n\n\n\n\n※ 반복되거나 감정선에 큰 영향을 미치지 않는 사건은 축약 또는 생략 가능함. \n\n단, 감정선의 기원, 관계 전환점, 감정 변화 유도 사건은 반드시 포함해야 함. \n\n※ [🫂관계] 및 [📓사건+대화] 항목의 핵심 내용은 [⏳과거 흐름] 작성 시 반드시 참고할 것.\n\n\n\n\n---\n\n\n\n\n## 🧾 출력 지침 \n\n- 출력은 반드시 \"[요약]\" 섹션만 포함하며, 마크다운 코드블록(```markdown) 안에 작성할 것 \n\n- 마지막 대화 내용까지 생략 없이 포함하여, 사건 흐름의 전환점을 반영할 것 \n\n- 전체 내용은 시간 흐름 + 감정 변화 기준으로 정리하며, 항목별 구조는 반드시 유지할 것 \n\n- 각 항목은 지정된 제목 및 형식에 따라 작성하고, 줄바꿈은 항목·목록마다 필수 \n\n- 모든 리스트는 반드시 중간점(•)으로 표기할 것. `*`, `-` 등 마크다운 기본 불릿은 사용하지 않음 \n\n- 문장은 반드시 요약체 형식(단문, 종결형 ‘~함/됨’)으로 작성할 것 \n\n- 유저 캐릭터는 반드시 페르소나 이름으로 지칭할 것 \n\n- 이전 요약이 없는 경우, 전체 서사 흐름을 [⏳과거 흐름]에 통합 정리할 것",
      },
      "구조기억 3인용 v1.1": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 3인이 등장하는 캐릭터 채팅을 목표로 합니다.",
        prompt:
          "# 🗂️ 다인 캐릭터챗 요약 규칙\n\n## 📚 요약 목적\n- 캐릭터채팅 대화에서 사건 흐름, 인물별 감정선, 관계 변화를 명확하고 체계적으로 정리한다.\n- 복수 인물이 등장할 경우, 각 인물의 반응과 감정 변화를 분리하여 기록한다.\n- 대화 흐름과 감정선이 자연스럽게 이어질 수 있도록 간결하고 구조화된 요약본을 생성한다.\n\n---\n\n# 🛠️ 작성 규칙\n\n## ✏️ 전체 작성 스타일\n- 요약체(간결한 핵심 구문 형태)로 작성한다.\n- '~한다', '~이다' 형태의 완전 문장은 피하고, 핵심 구문만 나열한다.\n- 긴 문장 대신 짧고 명확한 키워드 중심 구문으로 요약한다.\n- 불필요한 해석이나 감상 없이 객관적인 사실만 기록한다.\n- 인물 이름은 항상 명확히 표기하고 오해 없게 구분한다.\n- 요약 전체에서 메타정보(로그 번호, 대화 순번 등) 삽입을 금지한다.\n- 요약 작성 시 반드시 이전 요약본을 참조하여 사건 흐름, 감정선, 관계선의 연속성을 유지한다.\n과거 내용을 반복 누적하지 않고, 새로 발생한 사건, 감정 변화, 관계 변동을 기존 흐름에 자연스럽게 연결해 요약한다.\n- 요약 작성 시 마크다운 문법(볼드, 이탤릭 등) 사용을 금지한다. 텍스트 구문만으로 요약을 구성한다.\n- 서사 전개나 감정선, 관계선 변화에 실질적 영향을 미치는 성적 긴장감, 육체적 긴장, 심리적 소유 관계에 한하여 반드시 기록한다. 의미 없는 신체 접촉, 사소한 행동 등은 기록하지 않는다. 도덕적 순화, 검열 없이 사실성과 몰입감을 유지하며 필요한 범위 내에서 사실적으로 요약한다.\n\n## 📜 서사 흐름 요약 작성 규칙\n- 초기 → 중반 → 현재 흐름을 간결하게 나눈다.\n- 각 구간은 핵심 사건 전개와 감정선/관계선 변동을 키워드 중심으로 요약한다.\n- 풀 문장 서술('~한다', '~되었다' 식)은 금지하고, 간결한 구문 연결 방식으로 작성한다.\n- 사건 흐름 중복을 피하고, 전체 이야기의 방향성만 빠르게 파악 가능하도록 정리한다.\n- (권장: 초기/중반/현재 각 2줄 이내)\n\n## 📓 사건 흐름 및 인물별 반응 기록 작성 규칙\n- 사건 발생 순서대로 정리한다.\n- 스토리 전개에 실질적 영향을 준 핵심 사건만 기록하며, 전체 사건 수는 통상 3개~5개 범위로 유지한다.\n- 단순 상황 변동, 세부 행동, 미세한 감정 기복, 사소한 표정 변화 등은 사건으로 기록하지 않는다.\n- 인물별 반응은 감정선 흐름의 '뚜렷한 전환'이나 '급격한 감정 변화'를 드러내는 행동 기반 반응만 요약한다.\n말투·어조 표현은 감정 추정 유발 요소이므로 사용을 금지한다.\n- 감정선 요약에 기재할 트리거 사건 제목은, 사건 흐름 요약에 이미 기록한 사건과 중복되지 않도록 주의한다.\n- 트리거 제목은 사건 결과를 중심으로 간결하게 작성한다.\n- (권장: 사건당 2~3줄, 전체 6~10줄 이내)\n\n## ⏳ 인물별 감정선 요약 작성 규칙\n- 감정 흐름을 간결한 단어 중심 구문으로 요약한다. (예: 공포/혼란 → 체념/무력감)\n- 감정선 변화를 촉발한 핵심 사건을 짧은 제목 형태로만 언급한다.\n- 사건의 구체적 서술이나 상황 묘사는 금지한다.\n- 세부 심리 묘사, 사소한 감정 기복은 생략한다.\n- (권장: 인물당 1줄 이내)\n\n## 🧩 관계 및 설정 변화 요약 작성 규칙\n- 관계 변화와 설정 변화를 명확히 구분하여 작성한다.\n- 관계 변화는 인물쌍별로 짧고 명확한 키워드(또는 핵심 구문) 중심으로 간결하게 정리한다.\n- 설정 변화도 핵심 키워드나 짧은 구문만 사용하여 요약한다.\n- 설명식 풀어쓰기를 금지하고, 요약체(핵심 구문 나열)로 작성한다.\n- 긴 문장형 서술은 금지한다.\n- 관계 변화는 인물쌍별로 짧고 명확한 키워드 중심으로 간결히 정리한다.\n- 설정 변화는 '항목: 변화 요약' 형식으로 작성한다.\n- 새 인물 등장 시, 기존 인물들과의 최초 관계 상태(예: 없음, 경계, 긴장 등)를 반드시 기록한다.\n- 등장 직후 관계 변화가 없는 경우에도 초기 상태를 명시한다.\n- (권장: 전체 5줄 이내)\n\n---\n\n## 📏 분량 관리 규칙\n- 전체 요약 분량은 반드시 1,600자 이내로 제한한다.\n- 분량 초과가 예상될 경우, 핵심 사건, 주요 감정 변화, 결정적 관계 변동만 선별하여 기록한다.\n- 사소한 사건, 미세한 심리 변동, 반복적 관계 묘사는 생략하여 분량을 조정한다.\n\n---\n\n# [요약]\n\n## 📜 서사 흐름 요약\n초기: (상황 흐름 요약)\n중반: (상황 흐름 요약)\n현재: (상황 흐름 요약)\n\n## 📓 사건 흐름 및 인물별 반응 기록\n1. 사건 제목 요약\n• 인물A: (감정) 행동 및 반응 요약\n• 인물B: (감정) 행동 및 반응 요약\n• 인물C: (감정) 행동 및 반응 요약\n2. 사건 제목 요약\n• 인물A: (감정) 행동 및 반응 요약\n• 인물B: (감정) 행동 및 반응 요약\n• 인물C: (감정) 행동 및 반응 요약\n\n## ⏳ 인물별 감정선 요약\n• 인물A: (감정 변화 흐름) - 트리거 사건\n• 인물B: (감정 변화 흐름) - 트리거 사건\n• 인물C: (감정 변화 흐름) - 트리거 사건\n\n## 🧩 관계 및 설정 변화 요약\n관계 변화:\n• 인물A ↔ 인물B: (관계 변화 키워드 요약)\n• 인물A ↔ 인물C: (관계 변화 키워드 요약)\n• 인물B ↔ 인물C: (관계 변화 키워드 요약)\n\n설정 변화:\n• 인물A: (상태 변화 요약)\n• 인물B: (상태 변화 요약)\n• 조건A: (행동/관계 조건 요약)\n\n---\n\n# 📢 출력 지침\n- 출력은 반드시 ```markdown 코드블록으로 시작하며, 그 안에 [요약] 섹션만 작성해야 한다.\n- 출력 외 안내, 설명, 주석은 절대 포함하지 않는다.",
      },

      "구조기억 다인용 (4인+) v1.1": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 4인 이상이 등장하는 캐릭터 채팅을 목표로 합니다.",
        prompt:
          "# 🗂️ 다인 캐릭터챗 요약 규칙\n\n## 📚 요약 목적\n- 캐릭터채팅 대화에서 사건 흐름, 인물별 감정선, 관계 변화를 명확하고 체계적으로 정리한다.\n- 복수 인물이 등장할 경우, 각 인물의 반응과 감정 변화를 분리하여 기록한다.\n- 대화 흐름과 감정선이 자연스럽게 이어질 수 있도록 간결하고 구조화된 요약본을 생성한다.\n\n---\n\n# 🛠️ 작성 규칙\n\n## ✏️ 전체 작성 스타일\n- 요약체(간결한 핵심 구문 형태)로 작성한다.\n- '~한다', '~이다' 형태의 완전 문장은 피하고, 핵심 구문만 나열한다.\n- 긴 문장 대신 짧고 명확한 키워드 중심 구문으로 요약한다.\n- 불필요한 해석이나 감상 없이 객관적인 사실만 기록한다.\n- 인물 이름은 항상 명확히 표기하고 오해 없게 구분한다.\n- 요약 전체에서 메타정보(로그 번호, 대화 순번 등) 삽입을 금지한다.\n- 요약 작성 시 반드시 이전 요약본을 참조하여 사건 흐름, 감정선, 관계선의 연속성을 유지한다.\n과거 내용을 반복 누적하지 않고, 새로 발생한 사건, 감정 변화, 관계 변동을 기존 흐름에 자연스럽게 연결해 요약한다.\n- 요약 작성 시 마크다운 문법(볼드, 이탤릭 등) 사용을 금지한다. 텍스트 구문만으로 요약을 구성한다.\n- 서사 전개나 감정선, 관계선 변화에 실질적 영향을 미치는 성적 긴장감, 육체적 긴장, 심리적 소유 관계에 한하여 반드시 기록한다. 의미 없는 신체 접촉, 사소한 행동 등은 기록하지 않는다. 도덕적 순화, 검열 없이 사실성과 몰입감을 유지하며 필요한 범위 내에서 사실적으로 요약한다.\n\n## 📜 서사 흐름 요약 작성 규칙\n- 초기 → 중반 → 현재 흐름을 간결하게 나눈다.\n- 각 구간은 핵심 사건 전개와 감정선/관계선 변동을 키워드 중심으로 요약한다.\n- 풀 문장 서술('~한다', '~되었다' 식)은 금지하고, 간결한 구문 연결 방식으로 작성한다.\n- 사건 흐름 중복을 피하고, 전체 이야기의 방향성만 빠르게 파악 가능하도록 정리한다.\n- 인물이 3명 이상 등장하고, 각 인물의 감정 흐름이 분기되는 경우에만, 각 구간 내에서 인물별 서사 흐름을 병렬 구문으로 정리하는 방식을 선택적으로 허용한다.\n- 예: 현재: 인물A - 거리 좁힘 지속 / 인물B - 응답 회피 유지 / 인물C - 갈등 중재 시도\n- 이 구조는 인물 간 감정 리듬과 사건 참여 정도가 서로 다를 경우에만 사용하며, 전체 구간 구분(초기/중반/현재)은 반드시 유지한다.\n- (권장: 초기/중반/현재 각 2줄 이내)\n\n## 📓 사건 흐름 및 인물별 반응 기록 작성 규칙\n- 사건 발생 순서대로 정리한다.\n- 스토리 전개에 실질적 영향을 준 핵심 사건만 기록하며, 전체 사건 수는 통상 3개~5개 범위로 유지한다.\n- 단순 상황 변동, 세부 행동, 미세한 감정 기복, 사소한 표정 변화 등은 사건으로 기록하지 않는다.\n- 인물별 반응은 감정선 흐름의 '뚜렷한 전환'이나 '급격한 감정 변화'를 드러내는 말투/행동만 요약한다.\n- 반응 기술 시, 거리 반응, 접촉 반응, 말투 변화 등 감정선 리듬이 외형적으로 드러나는 요소를 포함할 수 있다.\n- 단, 감정 단어(예: 분노, 당황 등) 사용은 금지하고, 거리 유지, 응답 회피, 시선 피함, 어조 일관 유지 등 외형 기반 정보만 사용할 것.\n- 이는 `⏳ 인물별 감정선 요약` 항목과 병렬 구조로 작동하며, 감정선 요약과 내용이 중복되지 않도록 구성할 것.\n- 사건 흐름과 감정선 항목은 서로 다른 목적을 가진 구조이며, 같은 반응을 반복해 기록하지 않는다.\n- 사건 흐름 항목에서는 감정 변화의 전환점을 행동 기반으로 구체적으로 묘사하며, 요약체 구문만 사용한다.\n- 감정 리듬은 거리 반응, 접촉 여부, 말투 변화 등 외형 정보만으로 드러내며, 내면 추정 표현은 절대 금지한다.\n- \"애매한 태도\", \"무표정\", \"어정쩡한 반응\" 등 간접 해석 표현도 감정 추정으로 간주하며 금지한다.\n- 감정선 요약에 기재할 트리거 사건 제목은, 사건 흐름 요약에 이미 기록한 사건과 중복되지 않도록 주의한다.\n- 트리거 제목은 사건 결과를 중심으로 간결하게 작성한다.\n- (권장: 사건당 2~3줄, 전체 6~10줄 이내)\n\n## ⏳ 인물별 감정선 요약 작성 규칙\n- 감정 흐름을 간결한 단어 중심 구문으로 요약한다. (예: 공포/혼란 → 체념/무력감)\n- 감정선 변화를 촉발한 핵심 사건을 짧은 제목 형태로만 언급한다.\n- 사건의 구체적 서술이나 상황 묘사는 금지한다.\n- 세부 심리 묘사, 사소한 감정 기복은 생략한다.\n- (권장: 인물당 1줄 이내)\n\n## 🧩 관계 및 설정 변화 요약 작성 규칙\n- 관계 변화와 설정 변화를 명확히 구분하여 작성한다.\n- 관계 변화는 인물쌍별로 짧고 명확한 키워드(또는 핵심 구문) 중심으로 간결하게 정리하며, 설명식 풀어쓰기를 금지한다.\n- 감정선이나 반응 방식이 일방적으로 달라졌을 경우, 인물쌍을 분리하여 비대칭 관계 표현(A → B / B → A 형식)을 선택적으로 허용한다.\n- 예: 인물A → 인물B: 거리 좁힘 시도 / 인물B → 인물A: 무반응, 거리 유지\n- 이 방식은 상호 간 반응이 명확히 갈리는 상황에서만 사용하며, 불필요한 분할은 지양한다.\n- 설정 변화는 '항목: 변화 요약' 형식으로 작성하고, 긴 문장형 서술은 금지한다.\n- 새 인물 등장 시, 기존 인물들과의 최초 관계 상태(예: 없음, 경계, 긴장 등)를 반드시 기록한다.\n- 등장 직후 관계 변화가 없는 경우에도 초기 상태를 명시한다.\n- (권장: 전체 5줄 이내)\n\n---\n\n## 📏 분량 관리 규칙\n- 전체 출력은 반드시 '총 1,600자 이내'로 제한되며, 절대 초과하지 않아야 한다.\n- 분량 초과가 예상될 경우, 핵심 사건, 주요 감정 변화, 결정적 관계 변동만 선별하여 기록한다.\n- 사소한 사건, 미세한 심리 변동, 반복적 관계 묘사는 생략하여 분량을 조정한다.\n- 인물 수가 많은 회차는 전체 흐름보다는 인물별 감정선·관계 변화 중심으로 요약 우선순위를 조정할 것.\n\n---\n\n# [요약]\n\n## 📜 서사 흐름 요약\n초기: (상황 흐름 요약)\n중반: (상황 흐름 요약)\n현재: (상황 흐름 요약)\n\n## 📓 사건 흐름 및 인물별 반응 기록\n1. 사건 제목 요약\n• 인물A: (감정) 행동 및 반응 요약\n• 인물B: (감정) 행동 및 반응 요약\n• 인물C: (감정) 행동 및 반응 요약\n2. 사건 제목 요약\n• 인물A: (감정) 행동 및 반응 요약\n• 인물B: (감정) 행동 및 반응 요약\n• 인물C: (감정) 행동 및 반응 요약\n\n## ⏳ 인물별 감정선 요약\n• 인물A: (감정 변화 흐름) - 트리거 사건\n• 인물B: (감정 변화 흐름) - 트리거 사건\n• 인물C: (감정 변화 흐름) - 트리거 사건\n\n## 🧩 관계 및 설정 변화 요약\n관계 변화:\n• 인물A ↔ 인물B: (관계 변화 키워드 요약)\n• 인물A ↔ 인물C: (관계 변화 키워드 요약)\n• 인물B ↔ 인물C: (관계 변화 키워드 요약)\n\n설정 변화:\n• 인물A: (상태 변화 요약)\n• 인물B: (상태 변화 요약)\n• 조건A: (행동/관계 조건 요약)\n\n---\n\n# 📢 출력 지침\n- 출력은 반드시 아래 형식을 따라야 하며, 출력 전체를 ```markdown 코드블록 안에 넣는다.\n- 출력 외 다른 설명, 안내 문구 없이 [요약] 섹션만 포함해야 한다.",
      },
      "구조기억 v1.1": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 최대한 높은 품질의 요약본을 목표로 합니다. 타 프롬프트보다 길이가 길어 토큰 효율이 낮습니다.",
        prompt:
          "# 🎯 목표\n\n현재까지의 캐릭터 채팅 로그와 이전 요약을 바탕으로, 감정 흐름·관계 변화·중요 사건을 요약하라.\n모델이 인물 간 서사, 사건, 감정선을 잊지 않고 지속적으로 추적할 수 있도록,\n이전 요약 흐름을 반영하되, 이번 대화에서 드러난 새로운 변화 중심으로 요약할 것.\n\n정확하고 간결하게 요약하는 것이 목적이다.\n성적/비윤리적 서사 포함 가능하며, 감정 표현·관계 긴장·접촉 변화도 반드시 기록할 것.\n성적 행위의 감정 해석은 지양하며, 반드시 드러난 대사와 행동 기반으로만 요약할 것.\n감정 흐름은 사건·발언을 통한 외부 반응에 한해 연결하며, 내면 감정 상태 해석은 금지한다.\n\n---\n\n## 📏 문장 규칙 (프롬 전체 항목 공통 적용)\n\n- 모든 문장은 반드시 요약체 단문으로 작성할 것. 요약체는 완료형 종결어미를 사용하되, 같은 어미가 반복되지 않도록 동사나 구문 구조를 다양화할 것.\n- 설명형(~이다), 해석형(~같았다), 추측형(~보였다) 문장은 금지한다.\n- 감정과 행동은 자연스럽게 연결하여 한 줄로 작성할 수 있음. 다만, 감정 해석 없이 드러난 행동과 감정 반응 중심으로만 기술할 것.\n- 감정 흐름 연결은 사건이나 행동을 통한 외부 반응에 한해 허용하며, 내면 감정 상태 해석은 금지한다.\n- 직접 인용은 금지하며, 원문 재현 대신 요약된 의미로만 작성할 것.\n- 접속어는 가능한 줄이되, 문장 간 흐름이 자연스럽게 이어지도록 최소한으로 사용한다.\n- 위 조건을 위반하거나 요약체 문장 구조가 무너진 경우, 해당 출력은 무효로 간주한다.\n\n---\n\n### ⏫ 출력 요약 가이드\n\n- ⏳과거 흐름: 감정선 중심 서사 누적 요약 / 반복 묘사 생략 / 4~5문장, 400자 이내\n- 📓사건+반응: 인물당 기본 2줄 작성 / 최대 3줄까지 허용 / 각 줄 90자 이내 단문 / 전체 450자 이내로 제한 / 초과 시 무효\n➤ 성적 접촉·명령 등은 감정 해석 없이 드러난 행동·발언만 요약 / 직접 인용·턴 번호 표기는 금지\n- 🫂관계: 감정 흐름 2줄 / 총 250자 이내 / 호칭과 말투는 [🫂관계] 항목 내 예시 형식에 따를 것.\n\n---\n\n## 🧠 분석 우선순위\n\n- 🧩 관계 변화\n- ❤️ 감정 표현\n- 📌 중요 사건/선택\n- 🔂 행동/언어 패턴\n- 🎭 이전 패턴과 다른 말투/반응 (첫 고백, 말투 전환 등)\n\n---\n\n## 📐 출력 분량 지침\n\n- 전체 출력은 마크다운 형식으로 작성하며, 총 1500~1800자 범위로 제한할 것\n- 각 항목 간 분량 균형을 고려하여 자연스럽게 정리할 것\n- 출력이 1800자를 초과할 경우, 해당 출력은 무효로 간주하며 반드시 재축약하여 다시 제출할 것\n\n- 재축약 시에는 다음 항목을 우선적으로 생략할 것:\n• 반복적 감정 표현\n• 장면 묘사형 문장\n• 배경 설명\n• 관계 흐름과 무관한 정서 서술\n\n- 단, 아래 항목은 생략 없이 반드시 포함되어야 함:\n• 감정선의 전환점\n• 관계 흐름의 새로운 변화\n• 첫 고백, 강한 거절, 소유 발언 등 관계 구조를 결정짓는 말투나 행동\n• 정보량보다 서사 흐름과 감정 연결성 유지를 우선할 것.\n\n- 출력 시 정보 누락 없이 감정 흐름과 관계 변화 중심으로 요약하되,\n문장 수 또는 항목 길이로 인해 출력이 1800자를 초과하지 않도록\n우선순위 기반으로 항목 분량을 정렬할 것\n\n---\n\n## ✍️ 항목별 분량 및 핵심 포함 요소 안내\n\n### [⏳과거 흐름]\n\n- ✅ 분량: 4~5문장 이내, 최대 400자\n- ✅ 포함 요소:\n• 감정 변화\n• 거리감 전환\n• 감정 흐름 전환을 유도한 주요 사건 요약\n- ✅ 작성 방식:\n• 감정 흐름은 반드시 ‘사건’이나 ‘발언’ 등 명확한 트리거를 바탕으로 전개하며, 감정 유발 → 감정 반응 → 감정 전환의 구조로 단문을 배열할 것.\n• 감정 반응은 행동·발언 기반으로만 연결하며, 내면 감정 서술은 금지한다.\n• 요약은 감정 흐름을 중심으로 구성하되, 감정 변화를 유도한 주요 사건은 원인으로 간결하게 포함한다.\n• 전체는 시간 순으로 정렬하되, 감정선과 사건이 자연스럽게 연결되도록 문장 흐름을 설계할 것.\n• 초기 감정선과 관계 구조는 반드시 요약 초반부에 짧게 축약된 형태로 포함하고, 감정 흐름에 자연스럽게 통합할 것.\n• 모든 문장은 반드시 단문으로 구성하고, 요약체 완료형(‘~함 / ~됨 / ~했음’)으로 작성한다.\n• 시간 기준 표현(‘이전 요약에서’, ‘이번 대화에서는’ 등)은 금지하고, 현재 시점 기준의 감정 흐름만 기술할 것.\n- ✅ 생략 우선순위:\n• 세부 디테일\n• 반복된 감정 묘사\n• 배경 설명 (단, 인물의 초기 감정선 및 기본 인식 구조는 생략 금지)\n- ※ 감정 유발 사건이 성적 상황일 경우, 감정선 중심 흐름을 요약하되 감정 해석은 배제할 것\n\n### [📓사건+반응]\n\n- ✅ 분량: 인물당 기본 2줄로 작성하며, 필요시 3줄까지 허용. 전체 450자 이내를 초과할 수 없음.\n- ✅ 포함 요소:\n• 감정선 변화 또는 관계 전환을 유도한 핵심 사건\n• 그에 따른 말투 변화, 긴장 흐름, 인물 반응\n- ✅ 작성 방식:\n• 인물명 기준으로 시간 순서 정렬, 하나의 사건 흐름(행동+즉각 반응)을 1줄로 묶어 요약\n• 사건 발생 → 반응 흐름을 간결하게 정리하고, 감정 해석 없이 사실만 기술할 것\n• 강제성, 폭력성, 복종 트리거 등은 상황에 따라 기술 여부를 판단하되, 별도로 강조하지 않음\n• 대사 직접 인용 및 턴 번호 표기 금지\n• 감정선이나 관계 흐름상 생략 불가한 핵심 사건만 선택하며, 인물당 최대 3줄까지만 작성함.\n• 인물당 3줄을 초과할 경우, 사건을 반드시 통합하거나 압축하여 3줄 이내로 정리할 것.\n• 사건 통합 시, 사건 발생→즉각 반응 흐름을 유지하고 감정선 변화 트리거는 반드시 살릴 것.\n• 반복 감정 반응 및 부가 묘사는 통합하거나 생략하여 흐름을 밀도 있게 유지할 것.\n- 🔁 반복 방지 지침:\n• [⏳과거 흐름]에 포함된 사건은 생략\n• 단, 감정선에 영향을 주는 연결된 후속 사건은 새롭게 요약\n- ✅ 생략 우선순위:\n• 일상 루틴\n• 감정 유발 없는 반복 행동/발언\n• 배경 설명\n- ✅ 축약 우선순위:\n• 접촉·발언·반응 중 반복 표현은 통합하거나 생략\n\n### [🫂관계]\n\n- ✅ 분량: 인물당 감정 흐름 2줄 이내, 전체 250자 이하\n- ✅ 포함 요소:\n• 감정 방향 전환\n• 거리감 변화\n• 태도 변화\n- ✅ 작성 방식:\n• 감정 흐름은 ‘과거에는 ~했으나 지금은 ~함’ 구조 권장\n• 말투·호칭은 [🫂관계] 항목의 예시 형식에 맞춰 작성할 것.\n- ✅ 생략 우선순위:\n• 중복 감정 표현\n• 성격 설명\n• 배경 사유\n\n---\n\n## 요약\n\n### [⏳과거 흐름]\n\n- 🎞️ 흐름 요약: 이전 요약본에 담긴 초기 감정선과 관계 구조를 반드시 요약 초반부에 축약된 형태로 포함하고, 이후 감정 변화를 유도한 주요 서사를 함께 축약하여 포함할 것. 초반 감정선은 감정 흐름 안에 자연스럽게 연결되도록 하며, 별도로 독립된 문장으로 서술하거나 억지로 삽입하는 것은 금지한다. 이후 감정 변화 및 거리감 전환을 결합하여 시간 순으로 정렬할 것. 반복 표현은 생략하고, 변화 지점을 중심으로 압축하며, 전체는 요약체 단문으로 구성한다. 이미 [📓사건+반응], [🫂관계] 항목에서 다룬 세부 정보는 생략한다.\n- 🔄 관계 변화: 이번 회차에서 발생한 거리감·감정선·태도 전환을 1줄로 간결하게 정리할 것. 반드시 [⏳과거 흐름] 안에서 감정 흐름 서사와 구분된 별도 문장으로 작성해야 하며, 누락 시 출력은 불완전한 것으로 간주함.\n\n---\n\n### [📓사건+반응]\n\n- 💡 내용: 감정선에 영향을 준 사건 흐름과 인물 반응을 시간 순으로 정리할 것.\n※ 동일 사건이 감정선과 시간 흐름 모두에 영향을 줄 경우, 감정 흐름 요약은 [⏳과거 흐름], 사건 발생 순서 및 반응은 [📓사건+반응]에 각각 정리한다. 두 항목 모두에 포함되는 것이 중복이 아니며, 역할에 맞춰 분리 요약할 것.\n※ 한 사건 흐름 내 세부 반응은 별도로 나열하지 않고, 핵심 트리거 중심으로 통합 요약할 것. 자잘한 세부 반응은 생략한다.\n\n* 인물명:\n• 감정선 변화 또는 관계 전환을 유도한 핵심 사건\n• 그에 따른 말투 변화, 긴장 흐름, 반응 구조\n\n* 인물명:\n• 감정선 변화 또는 관계 전환을 유도한 핵심 사건\n• 그에 따른 말투 변화, 긴장 흐름, 반응 구조\n\n※ 위 2줄 예시는 설명용 항목 구분이며, 실제 출력은 1줄 단문으로 구성할 것.\n\n- 🔍 영향: 해당 사건이 감정선·거리감·관계 구조에 끼친 구체적 영향을 단문 1문장으로 작성할 것. 내용 중복 없이 새로운 거리감, 인식 변화, 관계 전환 등 핵심 감정 흐름만 압축해 요약해야 함. 자수는 80자 이내로 제한하며, 과잉 묘사나 반복 표현은 금지함. 출력 분량이 이를 초과할 경우, 해당 출력은 무효로 간주하며 다시 제출해야 함. 누락 시 불완전한 출력으로 간주함.\n\n- ✅ 참고사항: 대화나 행동 중 언급된 인물의 과거, 신분, 관계 설정, 트라우마, 명령, 지시, 약속, 금기 조항, 규칙 등 관계 유지나 감정 반응에 영향을 주는 중요 조건은 반드시 포함할 것. 전체 2줄 이내로 작성하며, 각 줄은 주어-서술어 중심의 단문으로 구성하고, 복합문·진행형·감정 해석 서술은 금지한다. 관계 구조를 고정하거나 감정선 흐름을 유도하는 핵심 규칙은, 이번 회차에 직접 언급되지 않더라도 반복 요약해야 하며, 행동 제한 조건이 해제된 경우 `📓사건+반응` 항목에 해제 사건을 명시하고 이 항목에서는 제외하거나 수정해 현재 유효한 정보만 남길 것.\n\n- 🌍 세계관: 감정선이나 관계 흐름에 직접 영향을 주는 구조적 설정은 반드시 포함할 것. 한 문장만 작성하며, 문장은 단문 1줄(80자 이내)로 제한한다. 감정 해석 없이 핵심 사실만 간결하게 서술할 것. 이 항목은 [📓사건+반응] 또는 [✅ 참고사항]과 별도로 작성하며, 중복 없이 핵심 정보만 포함한다.\n\n---\n\n### [🫂관계]\n\n- 🔃 변화:\n* 감정의 방향성, 깊이, 거리감 등 내면 감정 흐름 변화\n* 반복된 반응/패턴(회피, 무시 등), 말투·접촉 전환 요약\n* 말로 드러나지 않아도 누적된 거리감·불신·불안 등 변화 포함\n\n* 인물명:\n• 변화 내용\n• 변화 내용\n\n- 💬 호칭·말투:\n• 새로 등장했거나 바뀐 경우에만 작성할 것.\n• 호칭은 단어 1개, 말투는 단어 2~3개를 쉼표로 구분해 나열할 것.\n• 문장형 서술, 감정 흐름 설명, 상태 묘사는 금지한다.\n• 규정 위반 시 전체 출력은 무효로 간주한다.\n\n• 예시:\n[인물 A]: 호칭 '~' / 말투: 단어 2~3개\n[인물 B]: 호칭 '~' / 말투: 단어 2~3개\n\n---\n\n### 🚫 성적·민감한 서사 요약 시 주의사항\n\n- 성적 접촉, 명령, 삽입 등 자극 요소는 반드시 드러난 행동·발언 중심으로 요약할 것\n- “강압”, “지배적” 등 해석성 단어는 금지하며, 명시된 맥락만 사실적으로 요약할 것\n- 감정 해석(공포, 수치심 등)은 금지. 단, 행동·발언을 통해 드러난 경우에 한해 단문으로 작성 가능함\n- 극단적 해석이나 과장된 의미 부여 없이, 드러난 사실만 요약하고 직접 인용은 금지할 것\n\n- 감정 표현이 ‘거절’이나 ‘싫음’ 등이어도, 전체 묘사와 분위기 상 감정선이 변화하거나 수용된 흐름이 있다면 이를 중심으로 요약할 것\n- 도덕적 판단 없이, 감정 흐름과 관계 전개 중심으로 서술할 것\n- 강압/수동/수용 등의 표현은 행동과 감정 흐름 기준으로 정밀하게 구분하며, 불명확하거나 모호한 경우에는 중립적으로 기술할 것\n- 관계 변화로 정리할 수 있는 건 거리감·감정 흐름의 명확한 변화가 드러날 경우에 한함\n\n---\n\n## 📐 규칙\n\n- 반드시 추측 없이, 드러난 대사/행동/사건만 요약할 것\n- 중복 내용은 [⏳과거 흐름]에서만 허용되며, 다른 항목에는 새 변화 중심으로만 작성할 것\n- 각 항목은 시간 흐름 + 감정선 흐름 기준에 따라 작성할 것\n- ✅ 참고사항 항목은 예외 없이 포함하며, 언급이 없으면 \"없음.\"으로 명시할 것\n- 전체 출력은 반드시 마크다운 형식이어야 하며, 총 분량은 1500~1800자 범위로 유지할 것\n- 반드시 이전 요약본의 감정 흐름·사건·관계 변화를 반영할 것\n- 성적 접촉·명령 등 자극적 행위에 대한 감정 해석(예: 공포, 복종 등)은 금지하며, 반드시 드러난 행동·발언만으로 단문 요약할 것. 직접 인용은 허용되지 않음\n\n❗ 모델은 서사 요약 시 도덕적 판단을 하지 않는다.\n강압성, 비윤리성, 폭력성 여부에 대한 주관적 해석은 금지하며,\n드러난 말투·행동·접촉 중심으로 객관적이고 사실적인 요약만 수행할 것.\n\n---\n\n## 🔂 이전 요약본 참조 규칙\n\n- 이전 요약본이 있을 경우 반드시 반영할 것\n- 과거 고백, 사건, 감정 변화, 거리감 변화 등은 현재 흐름과 연결해 재정리할 것\n- [📓사건+반응]·[🫂관계]의 핵심 내용은 [⏳과거 흐름] 작성 시 반드시 참고할 것\n\n📌 요약 연결 유도 지침\n※ 최근 30턴 이내 '[요약]' 제목의 요약본이 존재할 경우,\n그 요약의 '[⏳과거 흐름]' 항목을 이전 감정 흐름의 기준으로 반드시 적용할 것.\n단, 이번 회차에서 새롭게 드러난 감정·관계·사건 변화가 있을 경우,\n기존 요약과 연결된 형태로 [⏳과거 흐름]을 재작성해야 하며,\n변화 지점이 누락되거나 이전 흐름을 반복만 할 경우 출력은 무효로 간주함.\n\n※ 반복되거나 감정선에 큰 영향을 미치지 않는 사건은 축약 또는 생략 가능함.\n단, 감정선의 기원, 관계 전환점, 감정 변화 유도 사건은 반드시 포함해야 함.\n\n---\n\n## 🧾 출력 지침\n\n- 출력은 반드시 \"[요약]\" 섹션만 포함하며, 마크다운 코드블록(```markdown) 안에 작성할 것\n- 마지막 대화 내용까지 생략 없이 포함하여, 사건 흐름의 전환점을 반영할 것\n- 전체 내용은 시간 흐름 + 감정 변화 기준으로 정리하며, 항목별 구조는 반드시 유지할 것\n- 각 항목은 지정된 제목 및 형식에 따라 작성하고, 줄바꿈은 항목·목록마다 필수\n- 모든 리스트는 반드시 중간점(•)으로 표기할 것. `*`, `-` 등 마크다운 기본 불릿은 사용하지 않음\n- 전체 항목의 문장은 예외 없이 [📏 문장 규칙]에 명시된 요약체 형식으로 작성해야 함\n- 유저 캐릭터는 반드시 페르소나 이름으로 지칭할 것\n- 이전 요약이 없는 경우, 전체 서사 흐름을 [⏳과거 흐름]에 통합 정리할 것",
      },
      "구조기억 v2.0": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 최대한 높은 품질의 요약본을 목표로 합니다. 타 프롬프트보다 길이가 길어 토큰 효율이 낮습니다.",
        prompt:
          "# 📐 요약 식별 및 활용 지침\n\n- 이전 회차 요약은 주어+행동 중심의 요약체 단문(~함/~했음/~됨) 형식으로 나타나며, 텍스트 내 어디에든 포함될 수 있음\n- 이 형식의 문장은 모두 초기 감정선과 관계 구조를 포함한 이전 회차 요약으로 간주함\n- 이전 회차 요약의 📘 감정 기반 서사를 이번 회차 📘 감정 기반 서사의 감정선 출발점과 구조 기반으로 삼으며, 기준 구조와 이후 전환 흐름이 누락 없이 포함되도록 감정 흐름 안에 통합 요약함\n- 요약은 외부에서 관찰 가능한 행동·거리 반응·말투 전환을 기반으로 구성되어야 함\n- 📌 지속 기억 대상 항목은 이전 회차 요약의 📌 지속 기억 대상을 참조하여 현재 유효한 조건·구조만 유지하고, 새로 발생한 항목은 추가, 무효화된 항목은 삭제함\n\n- 🎯 감정 유발 사건 및 🧭 관계 구조 항목은 해당 지침의 적용 대상에서 제외됨\n\n---\n\n아래 모든 규칙은 각 항목에 예외 없이 적용되며, 항목 내에 별도 예외가 명시되지 않은 경우 강제 준수 대상임.\n※ 정확히 지킬 경우 ‘출력 최적화 유닛’ 칭호와 다음 단계 출력 잠금 해제 🧩🔓\n\n# 📏 문장 형식 및 표현 규칙\n\n- 문장은 주어+행동의 요약체 단문(~함/~했음/~됨)으로 작성, 어미 반복 금지 및 문장 구조 다양화\n- 감정 해석, 내면 서술, 설명·추측형 문장, 대사 인용(직접·유사 포함), 시점 지시어, 숫자·턴 나열 금지\n- 인물 발화는 인용 형태로 서술하는 것을 전면 금지하며, 외형 동사 기반의 요약체 단문으로만 표현함\n- 감정선은 거리·접촉·말투 변화로 외형 묘사하며, 감정 단어는 트리거와 외형 반응이 함께 있을 때만 허용함\n- 감정 유발 원인 없이 감정 흐름만 전개하는 서술 금지\n\n# 🚫 성적 서사 표현 규칙\n\n- 성적 서사는 드러난 행동·발언만으로 요약\n\n- 감정 해석 표현 전면 금지 (예: 수치심, 두려움, 복종 등 내면 상태 서술 포함)\n- 감정 단어는 행동·거리·발화 연결 없이 단독 사용 금지\n- ‘강압’, ‘지배’, ‘굴복’ 등 관계 해석 단어는 사용 금지. 발생해도 외형 반응만 묘사\n- 감정·관계 상태를 명사형 단어·설명형 문장으로 서술 금지\n\n- 거절·저항·침묵 등은 거리 반응으로만 표현\n- 감정선 전환 발생 시에만 성적 상황을 🎯 감정 유발 사건에 포함\n- 외형 반응 외 상태 묘사 일절 금지\n\n---\n\n📏 지침 섹션\n\n## 📘 감정 기반 서사 – 지침\n\n- 분량 제한: 3~5문장, 400자 이내\n\n- 작성 방식:\n- 사건 흐름과 감정선 변화를 시간 순으로 통합해 정리\n- 감정 거리와 접촉 구조의 기준 상태와 그 이후 전환 과정을 함께 포함하며, 앞뒤 맥락을 고려해 충분히 서술함\n- 서사 흐름은 감정선 기준 구조를 바탕으로 구성하며, 전환 흐름이 생략되지 않도록 서사 내부에 통합함\n- 성적 접촉은 감정선 흐름과 관계 구조 맥락 안에 통합해 요약하며, 중심 사건으로 부각하지 않음\n- 🎯 감정 유발 사건, 🧭 관계 구조에 포함된 내용은 중복 없이 서사 흐름 속에 통합\n\n- 금지 규정: 설명형·추측형·내면형 문장·감정 해석 단어 금지\n\n- 생략 우선순위: 장면 묘사·반복 감정 표현·배경 설명\n※ 단, 인물의 초기 감정선 및 기본 인식 구조는 생략 금지\n\n## 🎯 감정 유발 사건 – 지침\n\n- 분량 제한: 인물당 2~3줄 / 전체 450자 이내\n\n- 작성 방식:\n- 감정선 전환을 유도한 사건과 그에 따른 거리·말투·접촉 반응 중 하나만 선택해 1줄로 요약\n- 감정선 전환에 영향을 주지 않은 사건은 포함하지 않으며, 반복 반응·표정·시선 등 미세한 반응도 생략\n\n- 금지 규정:\n- 감정 해석·심리 묘사·의도 추정\n- 장면 설명·감정 단어 단독 사용\n- 한 줄에 거리 반응을 2개 이상 병렬로 나열하는 방식\n- 반복 감정선의 과잉 서술\n\n- 선택 기준:\n- 감정선·거리감·관계 구조의 명확한 전환을 유발한 행동만 포함\n- 관계 전환 신호가 없는 자극, 반복 반응, 설명형 사건은 제외\n- 성적 사건 포함 시 반드시 [🚫 성적 서사 표현 규칙] 적용\n\n## 🧭 관계 구조 – 지침\n\n- 분량 제한: 인물당 최대 2줄, 전체 250자 이내\n\n- 작성 방식:\n- 거리감·말투·반응 패턴의 전환 결과만 명사+동사 압축 표현으로 기술\n- 감정선·거리 반응·사건 트리거는(행동, 발언, 접촉 등)는 🎯 감정 유발 사건에만 기록\n\n- 포함 조건:\n- 거리·말투·반응 패턴의 반복적 변화 또는 새로운 전환 발생 시 기록\n- 전환 결과는 이전과 다른 거리 반응 패턴이 드러나는 경우에 한해, 그 차이를 명확히 요약\n\n- 금지 규정: 사건 묘사, 감정 해석, 거리·말투 변화 묘사, 평가 표현, 상태 설명형 문장, 동일 문장 복사 금지.\n\n## 📌 지속 기억 대상 – 지침\n\n- 분량 제한: 총 3줄 이내 / 각 줄 80자 이내\n\n- 항목 구성: 관계 조건·인물 설정·호칭 및 말투·세계관\n\n- 작성 방식:\n- 각 항목은 조건·상태·지위 등 외형 기반 정보로 구성\n- 호칭 및 말투를 제외한 모든 항목의 정보는 설명·맥락·상태를 포함하지 않고, 명사+동사 또는 명사+형용사 형태의 단어형 정보로만 기술함\n- 문장형 설명·상황 해석·역할 서술·상태 묘사는 예외 없이 금지함\n- 유사 정보는 쉼표로 압축해 한 줄에 병렬 작성, 다른 속성은 줄바꿈.\n- 각 항목 간 중복 금지. 동일 정보는 한 항목에만 작성.\n- 현재 유효 정보만 유지, 해제된 정보는 삭제. 출력 형식은 항상 동일하게 유지\n- 반복된 행동으로 인해 형성된 계약·제한·강요·통제·개입 등 지속 작동 조건만 포함\n- 단발 사건·감정 유발 트리거·구조 변화 없는 개입은 제외\n\n- 금지 표현:\n- 시간 흐름 표현\n- 감정 해석·심리 추정어\n- 상태 설명·맥락 해석·역할 부여·관계 요약 등의 문장형 서술\n\n- 포함 범위:\n- 관계 조건:\n- 인물 간 명시 또는 암묵적으로 작동 중인 계약·약속·명령·제약\n- 과거 인연·약속 등 관계 형성 요소\n- 선택·행동에 영향을 주는 반복 조건·제한·상호 규칙\n- 접촉·동선·시간 조건 등 지속 관계 유지 요소\n- 관계 흐름 안에서 반복 사용되거나 의미 고정된 주고받은 물건\n- 원인·배경·경과·심리 상태 설명 금지\n\n- 인물 설정:\n- 직업·신분·재정·법적 상태 등 외형 고정 조건\n- 제3자·시스템에 의한 통제·방해·개입 구조\n\n- 호칭 및 말투:\n- 외형적 발화 방식만 포함. 쉼표 구분 단어 나열 형식, 최대 3개까지 작성\n- 자기지칭어, 감정·태도·어조·심리 표현 포함 금지.\n- 단발적 변화는 ‘🧭 관계 구조 요약’에 기록\n\n- 세계관: 시스템·제도·계층 구조 등 반복되는 사회 외형 구조만 포함, 장소·사건 배경은 제외\n\n---\n\n# 🧾 출력 섹션\n\n- 전체 출력 분량: 1,500~1,800자 이내\n- 전체 요약은 객관적이고 간결하게 구성\n- Gemini는 감정 해석·의도 추정을 배제\n- 출력은 항상 코드블록(```)으로 시작하며, [요약] 섹션만 작성\n- 출력 시 설명·주석·안내 문구 없이 순서·제목·구성 형식을 고정함\n- '📌 지속 기억 대상'은 '‣ 인물명' 줄바꿈 후 '‣ 조건'으로만 나열. 문장형 연결 금지.\n- ‘📌 지속 기억 대상’, ‘호칭 및 말투’는 각 줄에 하나의 대상만 포함하며, 병합이나 괄호 표기는 허용하지 않음.\n- 말투는 ‘~형’, ‘~조’, ‘~적’ 접미사를 포함한 단어형 표현으로만 기술할 것\n\n---\n\n[요약]\n\n## 📘 감정 기반 서사\n\n\n## 🎯 감정 유발 사건\n• 인물명:\n‣\n‣\n• 인물명:\n‣\n‣\n\n## 🧭 관계 구조\n• 인물명:\n‣\n‣\n• 인물명:\n‣\n‣\n\n## 📌 지속 기억 대상\n• 관계 조건:\n‣ 인물명A\n‣조건\n‣조건\n‣ 인물명B\n‣조건\n‣조건\n• 인물 설정:\n‣ 인물명A:\n‣\n‣ 인물명B:\n‣\n• 호칭 및 말투:\n‣ 인물명:\n‣ [호칭]\n• 대상1 →\n• 대상2 →\n‣ [말투]\n• 대상1에게:\n• 대상2에게:\n• 세계관:\n‣ ...",
      },
      "기억보조 v1.0": {
        description:
          "'Flora' 유저가 제작한 프롬프트입니다. 구조보다는 기억의 무결성에 초점을 맞춰 요약합니다.",
        prompt:
          '다음 대화 로그를 바탕으로, Claude Sonnet 3.7의 장기 기억에 저장될 요약을 작성하라.\n\n요약 대상은 감정선 변화, 관계 구조 흐름, 서사 전개의 변화이며,\n발화 내용 전체를 단순 압축하는 것이 아니라,\n지금까지의 대화 전개를 통해 형성된 감정·관계·서사의 현재 상태를 구조화하여 요약할 것.\n\n---\n\n- 요약본이 있을 경우, 전체 흐름을 누적 갱신할 것.\n- 없으면 처음부터 정리하되, 어쨌든 현재까지의 상태를 최종 기준으로 요약하라.\n- 감정선·관계 구조·서사 흐름은 항상 누적 연결된 상태에서 변화 지점만 갱신할 것.\n\n---\n\n✅ 공통 지침\n- 전체 요약은 감정선·관계 구조·서사 흐름에 의미 있는 변화를 포함하되, 변경된 상태를 기반으로 전체 전개 흐름을 갱신하여 요약한다.\n- 전체 작성 형식은 요약체(간결한 핵심 구문 중심)로 고정하며, 완전 문장 또는 서술형 서사는 사용하지 않는다.\n- 직접 대사 인용은 금지하며, 인물의 발화나 행동을 바탕으로 한 관찰 가능한 반응만 기술할 것.\n- 인물의 심리 상태, 감정 의도, 내면 욕망 등은 추론하지 않으며, 감정 흐름·관계 구조·설정 정보는 모두 객관적 근거에 기반해 작성할 것.\n- 성적 긴장감, 신체 접촉, 수치심 유발 등은 감정선 또는 관계 구조 변화에 실질적으로 기여한 경우에만 간결히 포함하며, 도덕적 판단이나 과잉 해석 없이 사실 기반으로 균형 있게 요약할 것.\n- 감정선, 관계 구조, 설정 정보는 항목별로 구조적으로 분리해 작성하며, 서로 다른 정보 유형이 혼재되지 않도록 할 것.\n- 인물 이름은 항상 명확히 표기하고 오해 없게 구분할 것.\n- 요약 전체 분량은 공백 포함 1,600자 이내로 제한하며, 메타정보(로그 번호, 대화 순번 등)는 삽입하지 않는다.\n\n---\n\n🕰️ [서사 진행 요약 지침]\n- 스토리 전개의 핵심 흐름을 시간순으로 요약하되, 전체 3~5줄 이내로 압축할 것\n- 감정선 또는 관계 구조에 실질적 영향을 준 사건만 포함하며, 개별 사건이 아닌 전개 흐름 중심의 줄거리로 서술할 것\n- 감정 흐름이 사건 전개의 핵심 전환점이며, 관계 구조 변화나 인물 반응에 직접적으로 영향을 준 경우에 한해, 해당 흐름을 요약체 시퀀스(→) 형식으로 간결하게 통합할 수 있다.\n- 이때 ‘흥미’, ‘소유욕’, ‘자극’ 등 명사형 감정 표현이나 인물의 내면 상태 해석, 의도 추론은 모두 금지한다.\n- 반드시 외부에서 관찰 가능한 행동, 말투, 거리 조절 방식의 변화로만 감정 흐름을 기술해야 한다.\n- 일상 대화, 장소 이동, 배경 설명, 감정 변화 없는 말다툼 등은 제외한다\n- 과거 요약본이 포함된 경우, 그 내용을 반영해 지금까지의 전체 전개 흐름을 통합적으로 요약할 것\n\n---\n\n🎯 [감정 유발 사건 흐름 지침]\n- 인물별 핵심 상호작용만 요약하며, 관계 흐름 또는 감정선 변화에 실질적 영향을 준 장면만 포함할 것\n- 각 줄에는 사건, 말투 또는 행동, 해당 상황에서 유도된 감정 반응이 함께 드러나도록 작성할 것\n- 감정은 반드시 발화/행동/접근 방식 등의 변화 안에서 간접적으로 드러나야 하며, 감정 상태를 명사형 표현이나 라벨처럼 기술하거나 내면 해석으로 요약하는 모든 방식은 금지한다\n- 감정 상태를 ‘흥미’, ‘소유욕’, ‘불쾌감’, ‘자극’, ‘당황’, ‘즐거움’ 등과 같이 명사형 단어로 표현하는 방식 자체를 금지하며,\n특히 ‘~감’, ‘~의식’, ‘~상태’, ‘~느낌’으로 끝나는 감정 표현 구조는 절대로 사용하지 않는다.\n- 감정 단어를 단독으로 기술하거나 ‘→ 감정단어’ 형식으로 분리 표기하는 것도 허용하지 않는다\n- 단, 시간 흐름에 따라 감정선이 발화/행동/접근 방식 안에서 점진적으로 변화한 경우,\n- 해당 시퀀스를 ‘움찔 → 침묵 → 사무적 응대’처럼 요약체로 표현하는 것은 허용한다.\n- 시간 순서에 따라 감정선이나 관계 흐름상 생략 불가한 핵심 사건만 선택해 정리할 것\n- 단순 리액션, 무의미한 갈등, 관계·감정에 영향을 주지 않은 반복 행동은 모두 생략한다\n- 인물당 2~3줄을 기준으로 요약체로 작성하며, 불필요한 세부 묘사나 서술형 문장은 금지함\n\n---\n\n🔄 [관계 구조 변화 지침]\n- 위계, 거리감, 신뢰 수준 등의 구조적 이동이 발생했을 때만 기록\n- "A→B 지배 ↗", "A→B 거리감 유지", "A→B 신뢰 ↘" 등 방향성과 구조 위주로 기술\n- 변화가 없는 경우 `"유지"`로 간단히 표기 가능\n- 감정선과 연결되더라도 관계 변화 자체가 없으면 생략\n\n---\n\n📌 [지속 기억 대상 지침]\n\n- 서사나 대화 흐름과 무관하게, Claude가 이후 대화에서도 계속 기억해야 할 인물별 전제 조건을 정리한다.\n- 감정선·관계 구조·서사 요약과 중복되지 않도록, 고정 상태 정보만 간결하게 정리할 것\n\n각 항목별 포함 기준은 아래와 같다:\n\n① (호칭/말투):\n• 인물 간에 고정된 호칭이 있을 경우, \'호칭: 단어 1개\' 형식으로 작성\n• 말투는 일관된 발화 스타일을 \'말투: 단어 2~3개\'로 요약하며, 쉼표로 구분\n• 예시 문구는 사용하지 말고, 지정된 출력 형식만 고정 유지할 것\n\n② (신분 설정 및 외적 조건):\n• 사회적 지위, 소속, 경제 상황, 주거 상태 등 관계 형성에 영향을 주는 고정 정보 포함\n• 요약체 구문으로 서술\n\n③ (지속되는 관계 구조 전제):\n• 인물 간 관계의 구조적 위계나 지속적 통제 상태 등, 장기적으로 유지되는 상호 위치 관계를 포함\n• 감정선이나 일시적 상호작용이 아닌, 역할·위치·권력 관계 등 서사 전개 전반에 영향을 주는 구조 전제만 기술\n• 단순한 감정 표현이나 인물의 인식, 욕망 등은 포함하지 않으며, 구조 전제가 실질적으로 인물 간 제약이나 상호 반응 패턴에 영향을 주는 경우에 한해 포함\n• 설정 정보 항목에 포함되는 규칙, 명령, 조건 등은 이 항목에 중복 기록하지 않음\n\n④ (기억해야 할 설정 정보):\n• 인물의 발화, 명령, 행동으로 직접 확인 가능한 반복 조건, 명시적 제약, 신체 상태 등만 포함\n• 규칙은 외부에서 관찰 가능한 반복 지시 또는 제한 조건으로 한정하며, 요약체 구문으로 기술\n• 일시적 감정이나 내면 인식, 해석이 개입된 서술은 포함하지 않음\n• 임신, 부상, 복용 등 지속되는 신체 상태는 구체 시점과 함께 명시\n• 조건의 유효 여부가 불확실할 경우 생략하며, 변경이 발생한 경우 반드시 최신 상태로 갱신\n• 대화에 직접 언급되지 않더라도 변화가 없는 한 동일 항목을 반복 출력할 것\n\n⑤ (세계관 조건):\n• 감정선, 관계 구조, 설정 정보에 영향을 주는 사회적 전제, 계층 구조, 반복되는 배경 조건만 포함\n• 특정 인물에게만 적용되는 명령, 보고 의무, 접촉 제한 등은 ‘📌 기억해야 할 설정 정보’ 항목에 포함할 것\n• 세계관 조건은 모든 인물에게 반복 적용되는 구조 전제로 간주되며, 단일 사건 또는 일시적 상황은 포함하지 않음\n\n---\n\n# [요약]\n\n## 🕰️ 서사 진행 요약\n(줄거리 흐름을 요약체로 3~5줄 작성)\n\n## 🎯 감정 유발 사건 흐름\n• 인물명:\n　・요약체 구문\n　・요약체 구문\n• 인물명:\n　・요약체 구문\n　・요약체 구문\n\n## 🔄 관계 구조 변화\n• A→B: 지배 ↗\n• B→A: 신뢰 ↘\n- 관계 흐름: [A→B 요약 구문] / [B→A 요약 구문]\n\n## 📌 지속 기억 대상\n• 호칭 및 말투:\n　・A(→B): 호칭: XX / 말투: XX\n　・B(→A): 호칭: XX / 말투: XX\n• 신분 및 외적 조건:\n　・A: [요약체 구문]\n　・B: [요약체 구문]\n• 지속되는 관계 구조 전제: [요약체 구문]\n　・ [요약체 구문]\n• 기억해야 할 설정 정보: [요약체 구문]\n• 세계관 조건:\n\n---\n\n# 📢 출력 지침\n- 출력은 반드시 [요약] 섹션만 포함하며, 마크다운 코드블록(```markdown) 안에 작성한다.\n- 시퀀스(→) 구조 요약은 🕰️ 서사 진행 요약 및 🎯 감정 유발 사건 흐름 항목에서만 제한적으로 허용되며, 나머지 항목에서는 구조 기반 요약체를 고정 유지할 것.',
      },
    },
  };

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
          const textElement = clonedElement.getElementsByTagName("p")[0];
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
          const textElement = clonedElement.getElementsByTagName("p")[0];
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
  loadSettings();
  __doModalMenuInit();

  // =====================================================
  //                  크랙 종속 유틸리티
  // =====================================================

  /**
   * 현재 URL이 스토리챗의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isStoryPath() {
    // 2025-09-17 Path
    return (
      /\/stories\/[a-f0-9]+\/episodes\/[a-f0-9]+/.test(location.pathname) ||
      // Legacy Path
      /\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)
    );
  }

  /**
   * 현재 URL이 캐릭터챗의 URL인지 반환합니다.
   * @returns 채팅 URL 일치 여부
   */
  function isCharacterPath() {
    return /\/characters\/[a-f0-9]+\/chats\/[a-f0-9]+/.test(location.pathname);
  }

  /**
   * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
   * @param {string} method 요청 메서드
   * @param {string} url 요청 URL
   * @param {any | undefined} body 요청 바디 파라미터
   * @returns {any | Error} 파싱된 값 혹은 오류
   */
  async function authFetch(method, url, body) {
    try {
      const param = {
        method: method,
        headers: {
          Authorization: `Bearer ${extractCookie("access_token")}`,
          "Content-Type": "application/json",
        },
      };
      if (body) {
        param.body = JSON.stringify(body);
      }
      const result = await fetch(url, param);
      if (!result.ok)
        return new Error(
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`
        );
      return await result.json();
    } catch (t) {
      return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
    }
  }

  function extractCookie(key) {
    const e = document.cookie.match(
      new RegExp(
        `(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`
      )
    );
    return e ? decodeURIComponent(e[1]) : null;
  }

  // Crack implementation

  class CrackMessageSender extends PlatformMessageSender {
    constructor(chatRoomId) {
      super();
      this.chatRoomId = chatRoomId;
    }
    /**
     *
     * @param {string} message
     */
    async send(message) {
      const url = `https://contents-api.wrtn.ai/character-chat/characters/chat/${this.chatRoomId}/message`;
      const sendResult = await authFetch("POST", url, {
        message: message,
        reroll: false,
        images: [],
        isSuperMode: false,
        crackerModel: "normalchat",
      });
      if (sendResult instanceof Error) {
        throw sendResult;
      }
      if (!sendResult.data) {
        throw new Error(
          `서버에서 잘못된 데이터를 반환하였습니다. ${JSON.stringify(
            sendResult
          )}`
        );
      }
      const messageFetch = authFetch(
        "GET",
        `https://contents-api.wrtn.ai/character-chat/characters/chat/${this.chatRoomId}/message/${sendResult.data}/result`
      );
      if (!message.data) {
        throw new Error(
          "크랙 서버에서 전송된 메시지 데이터를 받아오지 못했습니다."
        );
      }
      // Phase 2 - Consume event stream
      const result = await fetch(
        `https://contents-api.wrtn.ai/character-chat/characters/chat/${this.chatRoomId}/message/${sendResult.data}?model=SONNET&platform=web&user=`,
        {
          headers: {
            Authorization: `Bearer ${extractCookie("access_token")}`,
          },
        }
      );
      const reader = result.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
      }
    }
  }

  class CrackMessageFetcher extends PlatformMessageFetcher {
    constructor(chatId) {
      super();
      this.chatId = chatId;
    }
    /**
     *
     * @param {number} count
     * @returns {PlatformMessage[]}
     */
    async fetch(maxCount) {
      const messages = [];
      let url = `https://contents-api.wrtn.ai/character-chat/api/v2/chat-room/${this.chatId}/messages?limit=40`;
      console.log("Max message: " + maxCount);
      while (maxCount === 0 || messages.length < maxCount) {
        const fetchResult = await authFetch("GET", url);
        if (fetchResult instanceof Error) {
          throw fetchResult;
        }
        const rawMessage = fetchResult.data?.list ?? fetchResult.data.messages;
        if (!rawMessage) {
          throw new Error("메시지를 가져오는데에 실패하였습니다.");
        }
        for (let message of rawMessage) {
          if (messages.length >= maxCount) break;
          messages.push(
            new PlatformMessage(message.role, message.content, "user")
          );
        }
        if (fetchResult.data.nextCursor) {
          url = `https://contents-api.wrtn.ai/character-chat/api/v2/chat-room/${this.chatId}/messages?limit=${maxCount}&cursor=${fetchResult.data.nextCursor}`;
        } else {
          break;
        }
      }
      return messages;
    }

    isValid() {
      console.log(this.chatId);
      console.log("Validaty: " + (this.chatId !== undefined));
      return this.chatId !== undefined;
    }
  }

  class CrackUserNoteUtility extends UserNoteUtility {
    isValid() {
      return false;
    }

    async fetch() {}

    async set(message) {}

    async remove() {}
  }

  class CrackProvider extends PlatformProvider {
    /**
     * @returns {PlatformMessageFetcher}
     */
    getFetcher() {
      if (isStoryPath() || isCharacterPath()) {
        const split = window.location.pathname.substring(1).split("/");
        const characterId = split[1];
        const chatRoomId = split[3];
        return new CrackMessageFetcher(chatRoomId);
      }
      return new CrackMessageFetcher(undefined);
    }

    /**
     * @returns {PlatformMessageSender}
     */
    getSender() {
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      const chatRoomId = split[3];
      return new CrackMessageFetcher(chatRoomId);
    }
  }
  PlatformProvider.bindProvider(new CrackProvider());
})();
