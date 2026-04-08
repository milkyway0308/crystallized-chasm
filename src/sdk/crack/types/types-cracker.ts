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