import { CrackImageMappable } from "./types-generic";

/**
 * 크랙 채팅 로그 데이터입니다.
 */
export class CrackChattingLog {
  /**
   * @param id 메시지 내부 ID
   * @param userId 유저 ID
   * @param messageId 메시지 외부 ID. 이 파라미터는 일반적으로 사용되지 않습니다.
   * @param role 메시지 전송 주체 (user, assistant..)
   * @param content 메시지 컨텐츠
   * @param model 사용 모델 ID
   * @param turnId 턴 ID
   * @param status 메시지 상태 (end = 정상 종료)
   * @param recommendList 추천 목록
   * @param crackerModel 사용 크래커 모델
   * @param chatModelId 사용 크래커 모델 ID
   * @param isContinuallyGeneratable 계속 생성 가능 여부
   * @param isContinued "계속 생성" 기능에 의해 생성되었는지의 여부
   * @param situationImages 상황 이미지 목록
   * @param parameterSnapshots 스탯 목록
   * @param isPrologue 프롤로그 여부
   * @param reroll 리롤 여부
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly messageId: string,
    public readonly role: string,
    public readonly content: string,
    public readonly model: string,
    public readonly turnId: string,
    public readonly status: string,
    public readonly recommendList: string[],
    public readonly crackerModel: string,
    public readonly chatModelId: string,
    public readonly isContinuallyGeneratable: boolean,
    public readonly isContinued: boolean,
    public readonly situationImages: string[],
    public readonly parameterSnapshots: string[],
    public readonly isPrologue: boolean,
    public readonly reroll: boolean,
  ) {}

  isBot() {
    return this.role === "assistant";
  }

  isUser() {
    return this.role === "user";
  }

  /**
   * 채팅 로그를 단순화해 반한합니다.
   * @returns 단순화된 로그
   */
  simplify(): CrackSimplifiedChattingLog {
    return new CrackSimplifiedChattingLog(this.role, this.content, this.situationImages, this.parameterSnapshots);
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackChattingLog} 정제된 데이터
   */
  static of(container: any): CrackChattingLog {
    return new CrackChattingLog(
      container._id,
      container.userId,
      container.chatId,
      container.role,
      container.content,
      container.model,
      container.turnId,
      container.status,
      container.dynamicChipList,
      container.crackerModel,
      container.chatModelId,
      container.isContinuallyGeneratable,
      container.isContinued,
      container.situationImages,
      container.parameterSnapshots,
      container.isPrologue,
      container.reroll ?? false,
    );
  }
}

/**
 * 단순화된 채팅 로그입니다.
 */
export class CrackSimplifiedChattingLog {
  /**
   * @param role 메시지 전송 주체 (user, assistant..)
   * @param content 메시지 내용
   * @param situationImages 상황 이미지 URL 목록
   * @param parameterSnapshots 능력치 목록
   */
  constructor(
    public readonly role: string,
    public readonly content: string,
    public readonly situationImages: string[],
    public readonly parameterSnapshots: any,
  ) {}
}
