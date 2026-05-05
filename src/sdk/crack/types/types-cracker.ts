/**
 * 크래커 모델의 비용과 이름을 나타내는 클래스입니다.
 */
export class CrackerModel {
  /**
   * @param id 모델 내부 ID
   * @param name 표시 이름
   * @param quantity 1회당 소모 크래커
   * @param serviceType 서비스 타입
   */
  constructor(public readonly id: string, public readonly name: string, public readonly quantity: number, public readonly serviceType: string) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.serviceType = serviceType;
  }
}