import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { configure } from "../../utils/flow-handler";
import { BrowserInitUtil } from "../../utils/init-util";
import { readonlyLazy } from "../../utils/lazy-util";
import { LocaleStorageConfig } from "../../utils/local-storage-config";
import { NodeUtil } from "../../utils/node-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import { ValueObserver } from "../../utils/value-observer";
import SCRIPT_STYLE from "./css/accordion.scss?inline";

export const scriptMeta = ScriptMetaUtil.construct("crack", "accordion.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Accordion (결정화 캐즘 아코디언)";
  meta.version = "CRCK-ACCO-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "* 여기에 슬픈 아코디언 음악 입력 * 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

// =====================================================
//                     보조 클래스
// =====================================================
class AccordionSimulator {
  private readonly context: AudioContext;
  private readonly filter: BiquadFilterNode;
  private readonly param: AudioParam;
  private oscillators: OscillatorNode[] = [];
  private playUntil = 0;
  private isDelaying = false;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const createdGain = this.context.createGain();
    this.param = configure(createdGain.gain, (param) => {
      param.value = 0;
    });
    createdGain.connect(this.context.destination);

    this.filter = configure(this.context.createBiquadFilter(), (filter) => {
      filter.type = "lowpass";
      filter.frequency.value = 3000;
      filter.Q.value = 1;
      filter.connect(createdGain);
    });
  }

  schedule(): AccordionSimulator {
    setInterval(() => {
      if (this.playUntil !== 0 && this.playUntil < Date.now()) {
        this.playUntil = 0;
        this.param.setTargetAtTime(0, this.context.currentTime, 0.1);
        const extracted = this.oscillators;
        this.oscillators = [];
        setTimeout(() => {
          for (const osil of extracted) {
            osil.stop();
            osil.disconnect();
          }
        }, 100);
      }
    }, 100);
    return this;
  }

  play(current: number) {
    if (this.isDelaying) return;
    this.playUntil = Date.now() + 100;
    if (this.oscillators.length > 0) return;
    if (this.context.state === "suspended") {
      this.isDelaying = true;
      this.context.resume();
      this.isDelaying = false;
    }

    const osc1 = configure(this.context.createOscillator(), (osc1) => {
      osc1.frequency.value = current;
      osc1.type = "square";
      osc1.connect(this.filter);
      osc1.start();
    });

    const osc2 = configure(this.context.createOscillator(), (osc2) => {
      osc2.frequency.value = current;
      osc2.type = "sawtooth";
      osc2.detune.value = 15;
      osc2.connect(this.filter);
      osc2.start();
    });

    this.oscillators.push(osc1, osc2);

    this.param.setTargetAtTime(0.05, this.context.currentTime, 0.01);
    this.isDelaying = false;
  }

  adjust(velocity: number) {
    if (this.oscillators.length > 0) {
      const clamped = Math.max(30, Math.min(1200, velocity));
      this.oscillators[0].frequency.setTargetAtTime(clamped, this.context.currentTime, 0.1);
      this.oscillators[1].frequency.setTargetAtTime(clamped, this.context.currentTime, 0.1);
    }
  }
}

// =====================================================
//                      상수
// =====================================================
const CLASS_FLAGGED = "chasm-acco-flagged-textarea";
const simulator = readonlyLazy(() => new AccordionSimulator().schedule());
const settings = readonlyLazy(
  () =>
    new LocaleStorageConfig("chasm-acco-settings", {
      enableAccordionSound: false,
    }),
);

function getTextAreaEditor() {
  return document.getElementsByTagName("textarea");
}

// =====================================================
//                     설정 메뉴
// =====================================================
function addMenu() {
  const manager = CrackSdk.addonModal().acquire();
  manager.createMenu("결정화 캐즘 아코디언", (modal) => {
    modal.replaceContentPanel((panel) => {
      panel.addSwitchBox("accordion-sound-enable", "아코디온 재생 활성화", "그, 정말 진심으로요?", {
        defaultValue: settings.config.enableAccordionSound,
        onChange: (value) => {
          settings.config.enableAccordionSound = value;
          settings.save();
        },
      });
    }, "결정화 캐즘 아코디언");
  });
}

// =====================================================
//                       초기화
// =====================================================

function prepare() {
  if (CrackSdk.path().isStoryBuilderPath()) {
    for (const area of getTextAreaEditor()) {
      if (!NodeUtil.hasCls(area, CLASS_FLAGGED)) {
        NodeUtil.addCls(area, CLASS_FLAGGED);
        const observer = new ValueObserver(0, (value) => {
          if (value === 0 || !settings.config.enableAccordionSound) return;
          simulator.adjust(150 + value);
          simulator.play(150 + value);
        });
        ObserveUtil.attachResizeObserver(area, () => {
          if (area.clientHeight === 0) return;
          observer.observe(area.clientHeight);
        });
      }
    }
  }
}

BrowserInitUtil.init(() => {
  settings.load();
  addMenu();
  BrowserInitUtil.onPagePrepare(() => {
    ObserveUtil.attachObserver(document.body, prepare);
  });
  BrowserInitUtil.callGMAddStyle(SCRIPT_STYLE);
});
