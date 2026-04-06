import { deconstruct, FutureResult, Result, success, unwrap } from "../../utils/flow-handler";
import { Nullable } from "../../utils/generic-types";
import { CrackNetworkApi } from "./network-util";
/**
 * 크래커 모델의 비용과 이름을 나타내는 클래스입니다.
 */
export class CrackerModel {
  /** 모델 내부 ID */
  id: string;
  /** 표시 이름 */
  name: string;
  /** 1회당 소모 크래커 */
  quantity: string;
  /** 서비스 타입 */
  serviceType;
  /**
   * @param id 모델 내부 ID
   * @param name 표시 이름
   * @param quantity 1회당 소모 크래커
   * @param serviceType 서비스 타입
   */
  constructor(id: string, name: string, quantity: string, serviceType: string) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.serviceType = serviceType;
  }
}

export class CrackCrackerApi {
  private readonly networkApi: CrackNetworkApi;
  constructor(network: CrackNetworkApi) {
    this.networkApi = network;
  }

  /**
   * 크랙 서버에서 현재 접속한 계정의 크래커 개수를 받아와 반환합니다.
   * @returns 크래커 개수 혹은 오류
   */
  async current(): FutureResult<number> {
    const origin = await this.networkApi.authFetch<{ data?: { quantity?: number } }>("GET", "https://crack-api.wrtn.ai/crack-cash/crackers");
    if (!origin.ok) {
      return origin;
    }
    const result = unwrap(origin);
    return success(result.data?.quantity ?? 0);
  }

  /**
   * 크랙 서버에 등록된 크래커 모델 목록을 반환합니다.
   * @returns 모델 목록 혹은 오류
   */
  async crackerModelList(): FutureResult<CrackerModel[]> {
    const origin = await this.networkApi.authFetch("GET", "https://crack-api.wrtn.ai/crack-gen/v3/chat-models");
    if (!origin.ok) {
      return origin;
    }
    const rawModels: any[] = origin.data?.models ?? [];
    return success(rawModels.map((model) => new CrackerModel(model._id, model.name, model.crackerQuantity, model.serviceType)));
  }

  /**
   * 크랙 서버에 등록된 크래커 모델 목록을 이름 기반 맵으로 반환합니다.
   * @returns 매핑된 모델 맵 혹은 오류
   */
  async crackerModelMap(): FutureResult<Map<string, CrackerModel>> {
    const array = await this.crackerModelList();
    if (!array.ok) return array;
    return success(new Map(array.data.map((model) => [model.name, model])));
  }

  /**
   * 지정한 크래커 모델의 정보를 가져옵니다.
   * @param name 크래커 모델 이름
   * @returns 크래커 모델 정보 혹은 오류
   */
  async crackerModel(name: string): FutureResult<Nullable<CrackerModel>> {
    const result = await this.crackerModelMap();
    if (!result.ok) return result;
    return success(result.data.get(name) ?? null);
  }
}
