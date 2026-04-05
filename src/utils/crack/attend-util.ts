import { CrackNetworkApi } from "./network-util";

export class CrackAttendApi {
  private readonly networkApi: CrackNetworkApi;
  
  constructor(network: CrackNetworkApi) {
    this.networkApi = network;
  }

  /**
   * 출석 가능 여부를 서버에서 받아와 반환합니다.
   * @returns 출석 가능 여부, 혹은 오류
   */
  async isAttendable(): Promise<boolean | Error> {
    const webResult = await this.networkApi.authFetch("GET", "https://crack-api.wrtn.ai/crack-cash/attendance");
    if (webResult instanceof Error) return webResult;
    if (webResult.data && webResult.data.attendanceStatus && webResult.data.attendanceStatus === "NOT_ATTENDED") {
      return true;
    }
    return false;
  }

  /**
   * 출석을 API를 통해 진행합니다.
   * @returns 출석 성공 여부
   */
  async performAttend(): Promise<boolean> {
    const result = await this.networkApi.authFetch("POST", "https://crack-api.wrtn.ai/crack-cash/attendance");
    if (result instanceof Error) {
      return false;
    }
    return true;
  }

  /**
   * 출석 가능한 시간인지 반환합니다.
   * 크랙은 6시부터 23시 59분까지 출석이 가능합니다.
   * @returns 출석 가능 시간 여부
   */
  isAttendableTime(): boolean {
    const time = new Date().getHours();
    if (time < 6) return false;
    return true;
  }
}
