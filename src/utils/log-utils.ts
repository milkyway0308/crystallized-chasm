export class LogUtil {
  private readonly prefix: string;
  private readonly debugId: string;
  private readonly prefixStyle: string;
  private readonly debugTitleStyle: string;
  private readonly infoTitleStyle: string;
  private readonly warningTitleStyle: string;
  private readonly errorTitleStyle: string;
  private readonly debugTextStyle: string;
  private readonly infoTextStyle: string;
  private readonly warningTextStyle: string;
  private readonly errorTextStyle: string;

  constructor(prefix: string, enableDebug: boolean) {
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
      this.log(`디버그 로그를 활성화하려면 콘솔 창에 'document["${this.debugId}"] = true'를 입력하세요.`);
    }
  }

  /**
   * 디버그 메시지를 출력합니다.
   * 디버그 메시지는 활성화되지 않으면 출력되지 않습니다.
   * @param message 출력할 메시지
   * @param extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  debug(message: string | undefined, extra?: any) {
    if (message) {
      console.debug(`%c${this.prefix}: %cDEBUG: %c` + message, this.prefixStyle, this.debugTitleStyle, this.debugTextStyle);
    }
    if (extra) {
      console.log(extra);
    }
  }

  /**
   * 정보 메시지를 출력합니다.
   * @param  message 출력할 메시지
   * @param extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  log(message: string | undefined, extra?: any) {
    if (message) {
      console.log(`%c${this.prefix}: %cInfo: %c` + message, this.prefixStyle, this.infoTitleStyle, this.infoTextStyle);
    }
    if (extra) {
      console.log(extra);
    }
  }

  /**
   * 경고 메시지를 출력합니다.
   * @param message 출력할 메시지
   * @param extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  warn(message: string | undefined, extra?: any) {
    if (message) {
      console.log(`%c${this.prefix}: %cWarning: %c` + message, this.prefixStyle, this.warningTitleStyle, this.warningTextStyle);
    }
    if (extra) {
      console.log(extra);
    }
  }

  /**
   * 오류 메시지를 출력합니다.
   * @param  message 출력할 메시지
   * @param extra 메시지 이후에 출력될 인스턴스. 오류를 같이 출력하고자 할 때 적합합니다.
   */
  error(message: string | undefined, extra?: any) {
    if (message) {
      console.log(`%c${this.prefix}: %cError: %c` + message, this.prefixStyle, this.errorTitleStyle, this.errorTextStyle);
    }
    if (extra) {
      console.log(extra);
    }
  }
}
