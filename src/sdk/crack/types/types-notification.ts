import { UpdatableTimestamp } from "../../core/types/generic-types";

export class CrackNotification {
  /**
   * @param id 알림 ID
   * @param isRead 읽기 여부
   * @param pushTitle 알림 제목
   * @param pushBody 알림 내용
   * @param category 알림 카테고리
   * @param appLink 알림 웹링크
   * @param webLink 알림 웹링크
   * @param thumbnail 썸네일 URL
   * @param timestamp 알림 타임스탬프
   */
  constructor(
    public readonly id: string,
    public readonly isRead: boolean,
    public readonly pushTitle: string,
    public readonly pushBody: string,
    public readonly category: string,
    public readonly appLink: string,
    public readonly webLink: string,
    public readonly thumbnail: string,
    public readonly timestamp: UpdatableTimestamp,
  ) {}

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param container
   * @returns 정제된 데이터
   */
  static of(container: any): CrackNotification {
    return new CrackNotification(container._id, container.isRead, container.push?.title ?? "", container.push?.body ?? "", container.category, container.appLink, container.webLink, container.thumbnail, {
      created: new Date(container.createdAt),
      updated: new Date(container.updatedAt),
    });
  }
}
