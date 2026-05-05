import { Nullable } from "../../../utils/generic-types";
import { UpdatableTimestamp } from "../../core/types/generic-types";
import { CrackImageMappable } from "./types-generic";

class CrackStorySessionInfo extends CrackImageMappable {
  /**
   * @param id 스토리 ID
   * @param snapshotId 스토리 스냅샷 ID
   * @param name 스토리 이름
   * @param images 이미지 컨테이너
   * @param startingSetId 시작 설정 ID
   * @param baseSetId 시작 설정 세트 ID
   * @param isAdult 언세이프 여부
   */
  constructor(
    public readonly id: string,
    public readonly snapshotId: string,
    public readonly name: string,
    public readonly startingSetId: string,
    public readonly baseSetId: string,
    public readonly isAdult: boolean,
    images: any,
  ) {
    super(images);
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param container JSON 스키마
   * @returns 정제된 데이터
   */
  static of(container: any): CrackStorySessionInfo {
    return new CrackStorySessionInfo(container._id, container.snapshotId, container.name, container.statringSetId, container.baseSetId, container.isAdult, container.profileImage);
  }
}

export class CrackCharacterSessionInfo {
  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} _container JSON 스키마
   * @returns {CrackCharacterSessionInfo} 정제된 데이터
   */
  static of(_container: any): CrackCharacterSessionInfo {
    return new CrackCharacterSessionInfo();
  }
}

export class CrackChatSession {
  /**
   * @param id 채팅방 ID
   * @param userId 유저 ID
   * @param title 제목
   * @param lastMessage 마지막 메시지
   * @param model 사용 모델 이름 (sonnet, gemini..)
   * @param modelId 사용 모델 ID
   * @param hasUserNote 유저노트 여부
   * @param timestamp 생성 / 수정 시간
   * @param isSummaryUpdated 업데이트 여부
   * @param doRecommendNextMessage 다음 메시지 추천 여부
   * @param chatProfileId 현재 채팅 프로필 ID (페르소나 ID)
   * @param info 현재 세션 정보. 이 값은 null이 아닌 것이 대부분 보장되나, API 스키마 업데이트로 잘못 파싱될 경우 null이 할당될 수 있습니다.
   */
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly lastMessage: string,
    public readonly model: string,
    public readonly modelId: string,
    public readonly hasUserNote: string,
    public readonly timestamp: UpdatableTimestamp,
    public readonly isSummaryUpdated: boolean,
    public readonly doRecommendNextMessage: boolean,
    public readonly chatProfileId: string,
    public readonly info: Nullable<CrackStorySessionInfo | CrackCharacterSessionInfo>,
  ) {}

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param container
   * @returns 정제된 데이터
   */
  static of(container: any): CrackChatSession {
    const expectedStructure = container.story ? CrackStorySessionInfo.of(container.story) : container.character ? CrackCharacterSessionInfo.of(container.character) : null;
    return new CrackChatSession(
      container._id,
      container.userId,
      container.title,
      container.lastMessage,
      container.model,
      container.chatModelId,
      container.hasUserNote,
      {
        created: new Date(container.createdAt),
        updated: new Date(container.updatedAt),
      },
      container.isSummaryUpdated,
      container.isAutoRecommendUserNextMessage,
      container.chatProfile?._id,
      expectedStructure,
    );
  }
}
