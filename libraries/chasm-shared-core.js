
//
// chasm-shared-core.js v1.0.0 by Team IGX
// chasm-shared-core은 TS의 문법 검사와 JSDoc을 통한 브라우저 스크립트 전용 유틸리티입니다.
//

// @ts-check
// =====================================================
//           Crystallized Chasm Shared Core
// =====================================================

// =================================================
//                   노드 유틸리티
// =================================================
/**
 * 지정된 요소의 부모 요소를 가져옵니다. **이 펑션은 널 체크를 강제로 무시합니다.**
 * @param {HTMLElement | Node} element 대상 요소
 * @returns {HTMLElement} 부모 요소 (nullable)
 */
function parentElement(element) {
  // @ts-ignore
  return element.parentElement;
}

/**
 * 지정된 요소의 자식 요소를 가져옵니다. **이 펑션은 타입 체크를 강제로 무시합니다.**
 * @param {HTMLElement | Node} element 대상 요소
 * @returns {HTMLElement[]} 자식 요소
 */
function childNodes(element) {
  // @ts-ignore
  return element.childNodes;
}

/**
 * 지정된 요소 배열을 HTMLElement[]로 강제 형변환합니다. **이 펑션은 타입 체크를 강제로 무시합니다.**
 * @template NODE_VALUE
 * @param {NODE_VALUE[] | NodeListOf<any>} nodes 요소 배열
 * @returns {HTMLElement[]} 변환된 요소
 */
function purifyNodes(nodes) {
  // @ts-ignore
  return nodes;
}

/**
 * 두 개의 요소의 속성이 일치하는지 확인합니다.
 * @param {HTMLElement} element 비교할 요소
 * @param {HTMLElement} elementToCompare 비교할 요소
 * @param {string} attributeName 비교할 속성
 * @param {boolean} compareUndefined 속성이 없을 경우에도 비교할지의 여부. false일 경우, 둘 중 하나의 요소라도 undefined라면 false를 반환합니다.
 */
function isAttributeEquals(
  element,
  elementToCompare,
  attributeName,
  compareUndefined = true,
) {
  if (
    !compareUndefined &&
    (!element.hasAttribute(attributeName) ||
      !elementToCompare.hasAttribute(attributeName))
  ) {
    return false;
  }
  return (
    element.getAttribute(attributeName) ===
    elementToCompare.getAttribute(attributeName)
  );
}

// =================================================
//                일반 유틸리티성 메서드
// =================================================
class GenericUtil {
  /**
   * 지정한 노드 혹은 요소에 변경 옵저버를 등록합니다.
   * @param {*} observeTarget 변경 감지 대상
   * @param {() => void} lambda 실행할 람다
   */
  static attachObserver(observeTarget, lambda) {
    // @ts-ignore
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
   * 지정한 노드 혹은 요소에 URL 변동 감지성 변경 옵저버를 등록합니다.
   * 이 펑션으로 등록된 옵저버는 이전과 현재 URL이 다를때만 작동합니다.
   * @param {*} node 변경 감지 대상
   * @param {() => void} lambda 실행할 람다
   */
  static attachHrefObserver(node, lambda) {
    let oldHref = location.href;
    this.attachObserver(node, () => {
      if (oldHref !== location.href) {
        oldHref = location.href;
        lambda();
      }
    });
  }

  /**
   * 페이지가 준비되면 제공된 람다 펑션이 실행되도록 설정합니다.
   * @param {() => any} runner 실행될 람다 펑션
   */
  static onPageReady(runner) {
    ("loading" === document.readyState
      ? document.addEventListener("DOMContentLoaded", runner)
      : runner(),
      window.addEventListener("load", runner));
  }

  /**
   *
   * 불필요한 요소 타입 체크를 건너뛰기 위해 타입을 강제로 줄입니다.
   * @param {any} element 타입 소거할 요소
   * @returns {any} 타입 소거된 요소
   */
  static refine(element) {
    return element;
  }

  /**
   *
   * 요소를 복사하고, 원본 요소 타입으로 캐스팅해 반환합니다.
   * @template {Node} T
   * @param {T} element 복사할 요소
   * @returns {T} 복사된 요소
   */
  static clone(element) {
    return this.refine(element.cloneNode(true));
  }

  /**
   * 요소를 복사하고, HTMLElement로 캐스팅해 반환합니다.
   * @template {Node} T
   * @param {T} element 복사할 요소
   * @returns {HTMLElement} 복사된 요소
   */
  static cloneCast(element) {
    return this.refine(element.cloneNode(true));
  }

  /**
   * 값을 검증하고, non-null 타입으로 반환합니다.
   * @template T
   * @param {T} item 검증할 값
   * @return {NonNullable<T>} non-null 타입의 값
   */
  static assert(item) {
    if (item === undefined || item === null) {
      throw new Error(
        "ASSERTION FAILED; null or undefined object detected at non-null logic",
      );
    }
    return item;
  }

  /**
   * 값이 non-null인지 반환합니다.
   * @template T
   * @param {T} item 검증할 값
   * @return {boolean} non-null 여부
   */
  static isValid(item) {
    if (item === undefined || item === null) {
      return false;
    }
    return true;
  }

  /**
   * 숫자의 최소 소숫점과 최대 소숫점 자리를 지정해 문자열로 만들어 반환합니다.
   * @param {number} number 대상 숫자
   * @param {number} minDigit 최소 소숫점 개수
   * @param {number} maxdigit 최대 소숫점 개수
   * @returns {string} 포매팅된 문자열
   */
  static formatNumber(number, minDigit = 1, maxdigit = 1) {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: minDigit,
      maximumFractionDigits: maxdigit,
    });
  }
}

/**
 * 서드파티 확장 스크립트를 위한 콘피그 클래스. 기초적으로 이전 콘피그와 병합을 진행하여 콘피그 소실 및 충돌을 최소화합니다.
 * @template CONFIG
 */
class LocaleStorageConfig {
  /**
   * @param {string} key LocalStorage에서 사용할 키 값
   * @param {CONFIG} configTemplate 콘피그 기본값 템플릿
   */
  constructor(key, configTemplate) {
    this.key = key;
    this.config = configTemplate;
  }

  /**
   * 콘피그를 LocalStorage에서 불러옵니다.
   * @returns {CONFIG} 병합된 현재 콘피그
   */
  load() {
    const loadedSettings = localStorage.getItem(this.key);
    if (loadedSettings) {
      const json = JSON.parse(loadedSettings);
      for (let key of Object.keys(json)) {
        // Merge setting for version compatibility support
        // @ts-ignore
        this.config[key] = json[key];
      }
    }
    return this.config;
  }

  /**
   * 콘피그를 LocalStorage로 저장합니다.
   */
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.config));
  }

  /**
   * 현재 템플릿을 복제해 새 인스턴스로 만듭니다.
   * @param {string} key LocalStorage에서 사용할 키 값
   */
  fork(key) {
    return new LocaleStorageConfig(key, structuredClone(this.config));
  }
}

class LogUtil {
  /**
   *
   * @param {string} prefix
   * @param {boolean} enableDebug
   */
  constructor(prefix, enableDebug) {
    this.prefix = prefix;
    this.debugId = `cDynamicDebug_${crypto.randomUUID().toString()}`;
    // Prefix title style
    this.prefixStyle = "color: cyan;";
    // State title style
    this.debugTitleStyle = "color: gray;";
    this.infoTitleStyle = "color: blue;";
    this.warningTitleStyle = "color: yellow;";
    this.errorTitleStyle = "color: red;";
    // Text style
    this.debugTextStyle = "color: gray;";
    this.infoTextStyle = "color: inherit;";
    this.warningTextStyle = "color: inherit;";
    this.errorTextStyle = "color: inherit;";
    if (enableDebug) {
      this.log(`디버그 로그가 활성화된 상태입니다.`);
    } else {
      this.log(
        `디버그 로그를 활성화하려면 콘솔 창에 'document["${this.debugId}"] = true'를 입력하세요.`,
      );
    }
  }

  /**
   * 디버그 메시지를 출력합니다.
   * 디버그 메시지는 활성화되지 않으면 출력되지 않습니다.
   * @param {string | undefined} message 출력할 메시지
   * @param {any | undefined} extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  debug(message, extra = undefined) {
    if (message) {
      console.debug(
        `%c${this.prefix}: %cDEBUG: %c` + message,
        this.prefixStyle,
        this.debugTitleStyle,
        this.debugTextStyle,
      );
    }
    if (extra) {
      console.log(extra);
    }
  }

  /**
   * 정보 메시지를 출력합니다.
   * @param {string | undefined} message 출력할 메시지
   * @param {any | undefined} extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  log(message, extra = undefined) {
    if (message) {
      console.log(
        `%c${this.prefix}: %cInfo: %c` + message,
        this.prefixStyle,
        this.infoTitleStyle,
        this.infoTextStyle,
      );
    }
    if (extra) {
      console.log(extra);
    }
  }

  /**
   * 경고 메시지를 출력합니다.
   * @param {string | undefined} message 출력할 메시지
   * @param {any | undefined} extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  warn(message, extra = undefined) {
    if (message) {
      console.log(
        `%c${this.prefix}: %cWarning: %c` + message,
        this.prefixStyle,
        this.warningTitleStyle,
        this.warningTextStyle,
      );
    }
    if (extra) {
      console.log(extra);
    }
  }

  /**
   * 오류 메시지를 출력합니다.
   * @param {string | undefined} message 출력할 메시지
   * @param {any | undefined} extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  error(message, extra = undefined) {
    if (message) {
      console.log(
        `%c${this.prefix}: %cError: %c` + message,
        this.prefixStyle,
        this.errorTitleStyle,
        this.errorTextStyle,
      );
    }
    if (extra) {
      console.log(extra);
    }
  }
}

// https://stackoverflow.com/a/14638191
// 2013년의 Stackoverflow에서 훔쳐왔습니다.
// 코드를 복사해 가셨다고요? 걱정 마세요, 제 코드가 아닙니다. 원작자는 다른 성에 있어요!
class TimeUtil {
  MMMM = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  MMM = this.MMMM.map((m) => m.slice(0, 3));
  dddd = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  ddd = this.dddd.map((d) => d.slice(0, 3));

  /**
   * 숫자에 "0" 패딩을 적용하여 문자열로 반환합니다.
   * @param {number} i 숫자
   * @param {number} len 최대 길이
   * @returns
   */
  ii(i, len = 2) {
    return (i + "").padStart(len, "0");
  }

  /**
   * 입력된 타임존 시간 기반으로 타임존 문자열읆 만들어 반환합니다.
   * @param {number} tz 타임존 (분 기준)
   * @returns
   */
  tzHHMM(tz) {
    const sign = tz > 0 ? "-" : "+"; // +08:00 == -480, signs are reversed
    const tzv = Math.abs(tz);
    const tzHrs = Math.floor(tzv / 60);
    const tzMin = tzv % 60;
    return sign + this.ii(tzHrs) + ":" + this.ii(tzMin);
  }

  /**
   * 입력된 시간을 포맷에 맞춰 반환합니다.
   * @param {Date} date 시간 객체
   * @param {string} format 시간 포맷. Java의 SimpleDateFormat과 동일합니다.
   * @param {boolean} utc UTC 시간 사용 여부
   * @returns {string} 포매팅된 시간
   */
  formatDate(date, format, utc = false) {
    const y = utc ? date.getUTCFullYear() : date.getFullYear();
    const M = utc ? date.getUTCMonth() : date.getMonth();
    const d = utc ? date.getUTCDate() : date.getDate();
    const H = utc ? date.getUTCHours() : date.getHours();
    const h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    const m = utc ? date.getUTCMinutes() : date.getMinutes();
    const s = utc ? date.getUTCSeconds() : date.getSeconds();
    const f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    const TT = H < 12 ? "AM" : "PM";
    const tt = TT.toLowerCase();
    const day = utc ? date.getUTCDay() : date.getDay();
    const replacements = {
      y,
      yy: y.toString().slice(-2),
      yyy: y,
      yyyy: y,
      M,
      MM: this.ii(M),
      MMM: this.MMM[M],
      MMMM: this.MMMM[M],
      d,
      dd: this.ii(d),
      ddd: this.ddd[day],
      dddd: this.dddd[day],
      H,
      HH: this.ii(H),
      h,
      hh: this.ii(h),
      m,
      mm: this.ii(m),
      s,
      ss: this.ii(s),
      f: Math.round(f / 100),
      ff: this.ii(Math.round(f / 10)),
      fff: this.ii(f, 3),
      ffff: this.ii(f * 10, 4),
      T: TT[0],
      TT,
      t: tt[0],
      tt,
      K: utc ? "Z" : this.tzHHMM(date.getTimezoneOffset()),
      "\\": "",
    };
    return format.replace(
      /(?:\\(?=.)|(?<!\\)(?:([yMdf])\1{0,3}|([HhmsTt])\2?|K))/g,
      // @ts-ignore
      ($0) => replacements[$0],
    );
  }
}
