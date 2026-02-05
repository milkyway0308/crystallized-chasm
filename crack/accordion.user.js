// ==UserScript==
// @name        Chasm Crystallized Accordion (결정화 캐즘 아코디언)
// @namespace   https://github.com/milkyway0308/crystallized-chasm
// @version     CRYS-ACCO-v1.1.0
// @description * 여기에 슬픈 아코디언 음악 입력 *
// @author      milkyway0308
// @match       https://crack.wrtn.ai/*
// @downloadURL https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/accordiaon.user.js
// @updateURL   https://github.com/milkyway0308/crystallized-chasm/raw/refs/heads/main/crack/accordion.user.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@crack-shared-core@v1.2.0/crack/libraries/crack-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@chasm-shared-core@v1.0.0/libraries/chasm-shared-core.js
// @require      https://cdn.jsdelivr.net/gh/milkyway0308/crystallized-chasm@decentralized-pre-1.0.15/decentralized-modal.js
// @grant       GM_addStyle
// ==/UserScript==
/// <reference path="../decentralized-modal.js" />
/// <reference path="../libraries/chasm-shared-core.js" />
/// <reference path="./libraries/crack-shared-core.js" />
GM_addStyle(`
   .chasm-acco-flagged-textarea {
        resize: vertical !important;
        max-height: 999999px !important;
   } 
`);
(function () {
  class AccordionSimulator {
    /** @type {AudioContext} */
    #ctx;
    #filter;
    #gain;
    /** @type {OscillatorNode[]} */
    #oscillators = [];
    #playUntil = 0;
    #delaying = false;
    constructor() {
      const contexConstructor = window.AudioContext || window.webkitAudioContext;
      this.#ctx = new contexConstructor();
      this.#gain = this.#ctx.createGain();
      this.#gain.gain.value = 0;
      this.#gain.connect(this.#ctx.destination);

      this.#filter = this.#ctx.createBiquadFilter();
      this.#filter.type = "lowpass";
      this.#filter.frequency.value = 3000;
      this.#filter.Q.value = 1;

      this.#filter.connect(this.#gain);
    }

    schedule() {
      setInterval(() => {
        if (this.#playUntil !== 0 && this.#playUntil < new Date().getTime()) {
          this.#playUntil = 0;
          this.#gain.gain.setTargetAtTime(0, this.#ctx.currentTime, 0.1);
          /** @type {OscillatorNode[]} */
          const extracted = [];
          for (const item of this.#oscillators) {
            extracted.push(item);
          }
          this.#oscillators.length = 0;

          setTimeout(() => {
            for (const osil of extracted) {
              osil.stop();
              osil.disconnect();
            }
          }, 100);
        }
      }, 100);
    }

    play(current) {
      if (this.#delaying) return;
      this.#playUntil = new Date().getTime() + 100;
      if (this.#oscillators.length > 0) return;

      if (this.#ctx.state === "suspended") {
        this.#delaying = true;
        this.#ctx.resume();
        this.#delaying = false;
      }

      const osc1 = this.#ctx.createOscillator();
      osc1.frequency.value = current;
      osc1.type = "square";

      const osc2 = this.#ctx.createOscillator();
      osc2.frequency.value = current;
      osc2.type = "sawtooth";
      osc2.detune.value = 15;

      osc1.connect(this.#filter);
      osc2.connect(this.#filter);

      osc1.start();
      osc2.start();
      this.#oscillators.push(osc1, osc2);

      this.#gain.gain.setTargetAtTime(0.05, this.#ctx.currentTime, 0.01);
      this.#delaying = false;
    }

    adjust(velocity) {
      if (this.#oscillators.length > 0) {
        const clamped = Math.max(30, Math.min(1200, velocity));
        this.#oscillators[0].frequency.setTargetAtTime(clamped, this.#ctx.currentTime, 0.1);
        this.#oscillators[1].frequency.setTargetAtTime(clamped, this.#ctx.currentTime, 0.1);
      }
    }
  }
  const simulator = new AccordionSimulator();
  simulator.schedule();

  const settings = new LocaleStorageConfig("chasm-acco-settings", {
    enableAccordionSound: false,
  });

  /**
   * @returns {boolean}
   */
  function isEditorPage() {
    return /^\/builder\/story(\/.*)?$/.test(location.pathname);
  }

  /**
   * @returns {boolean}
   */
  function matchContent(matcher) {
    return document.getElementsByClassName("css-cis1hu")[0]?.textContent === matcher;
  }

  function getTextAreaEditor() {
    return document.getElementsByTagName("textarea");
  }

  settings.load();
  GenericUtil.onPageReady(() => {
    GenericUtil.attachObserver(document.body, () => {
      // matchContent("스토리 설정")
      if (isEditorPage()) {
        for (let area of getTextAreaEditor()) {
          if (!area.classList.contains("chasm-acco-flagged-textarea")) {
            area.classList.add("chasm-acco-flagged-textarea");
            let last = 0;
            new ResizeObserver((event) => {
              if (area.clientHeight === 0) return;
              if (last === area.clientHeight) {
                return;
              }
              if (last === 0) {
                last = area.clientHeight;
                return;
              }
              last = area.clientHeight;
              if (!settings.config.enableAccordionSound) return;
              simulator.adjust(150 + area.clientHeight);
              simulator.play(150 + area.clientHeight);
            }).observe(area);
          }
        }
      }
    });
  });

  // =====================================================
  //                     설정 메뉴
  // =====================================================
  function addMenu() {
    const manager = ModalManager.getOrCreateManager("c2");
    manager.createMenu("결정화 캐즘 아코디언", (modal) => {
      modal.replaceContentPanel((panel) => {
        panel.addSwitchBox("accordion-sound-enable", "아코디온 재생 활성화", "그, 정말 진심으로요?", {
          defaultValue: settings.config.enableAccordionSound,
          onChange: (_, value) => {
            settings.config.enableAccordionSound = value;
            settings.save();
          },
        });
      }, "결정화 캐즘 아코디언");
    });
  }
  addMenu();

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
    } else if (!document.getElementById("chasm-decentral-menu") && !window.matchMedia("(min-width: 768px)").matches) {
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
