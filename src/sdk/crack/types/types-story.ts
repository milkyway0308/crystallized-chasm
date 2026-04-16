import { MissingComponentError } from "../../../utils/error-utils";
import { Legacy, Nullable, Undeclarable } from "../../../utils/generic-types";
import { UpdatableTimestamp } from "../../core/types/generic-types";
import { CrackOriginalState } from "./types-crack-original";
import { CrackCreatorInfo } from "./types-creator";
import { CrackImageMappable } from "./types-generic";
import { CrackGenre } from "./types-genre";
import { CrackIdPair } from "./types-id-set";
import { CrackKeywordBook } from "./types-keyword-book";
import { CrackPromptTemplate } from "./types-prompt-template";
import { CrackSituationImage } from "./types-situation-image";
import { CrackStartingSet } from "./types-starting-set";

export class ReadonlyDetailedStoryInfo {
  constructor(
    /** 작품 ID */
    public readonly id: string,
    /** 크랙 / 뤼튼 ID 쌍 */
    public readonly userId: CrackIdPair,
    /** 작품 메시지 수 */
    public readonly messageCount: number,
    /** 크래커 사용 모델 */
    public readonly defaultCrackerModel: string,
    /** 채팅 모델 ID */
    public readonly chatModelId: string,
    /** 제작자 정보 */
    public readonly creator: CrackCreatorInfo,
    /** 작품 제목 */
    public readonly title: string,
    /** 작품 설명 */
    public readonly description: string,
    /** 작품 표기 설명 */
    public readonly simpleDescription: string,
    /** 작품 상세 설명 */
    public readonly detailDescription: string,

    /** 생성된 채팅방 개수 */
    public readonly chatCount: number,

    /** 이 작품을 즐긴 유저 수 */
    public readonly chatUserCount: number,

    /** 좋아요 개수 */
    public readonly likeCount: number,

    /** 싫어요 개수 */
    public readonly dislikeCount: number,

    /** 이미지 개수 */
    public readonly imageCount: number,
    /** 엔딩 개수 */
    public readonly endingCount: number,

    /** 작품 (해시)태그 */
    public readonly tags: string[],

    /** 좋아요 여부 */
    public readonly isLiked: boolean,
    /** 작품 국가 코드 */
    public readonly countryCode: string,
    /** 공개 상태 */
    public readonly visibility: string,
    /** 프로필 이미지 */
    public readonly profileImage: CrackImageMappable,
    /** 세로형 이미지 */
    public readonly portraitImage: Nullable<CrackImageMappable>,
    /** 작품 타임스탬프 */
    public readonly timestamp: UpdatableTimestamp,
    /** 언세이프 여부 */
    public readonly isAdult: boolean,
    /** 언세이프 강제 전환 여부 */
    public readonly isConvertedToAdult: boolean,
    /** 댓글 개수 */
    public readonly commentCount: number,

    /** 프롬프트 템플릿 정보 */
    public readonly promptTemplate: CrackPromptTemplate,

    /** 장르 정보 */
    public readonly genre: CrackGenre,
    /** 대상 목록 */
    public readonly target: string,
    /** 채팅 타입 */
    public readonly chatType: string,
    /** 스토리 상세 정보 */
    public readonly storyDetails: Undeclarable<string>,
    /** 프롬프트 상세 정보 */
    public readonly customPrompt: Undeclarable<string>,
    /** 채팅 예제? */
    public readonly chatExamples: string[],
    /** 시작 설정 목록 */
    public readonly startingSets: CrackStartingSet[],

    /** 크랙 오리지널 정보 */
    public readonly original: Nullable<CrackOriginalState>,

    /** 댓글 차단 여부 */
    public readonly isCommentBlocked: boolean,

    /** 구 API 사용 작품 초기 메시지 */
    public readonly legacyInitialMessage: Legacy<string[]>,
    /** 구 API 사용 추천 답변 */
    public readonly replySuggestions: Legacy<string[]>,

    /** 구 API 사용 상황 이미지 */
    public readonly situationImages: Legacy<CrackSituationImage[]>,
    /** 구 API 사용 스냅샷 ID */
    public readonly snapshotId: Legacy<Undeclarable<string>>,
    /** 구 API 사용 현재 모델 */
    public readonly model: Legacy<Undeclarable<string>>,
    /** 구 API 사용 작품 카테고리 */
    public readonly categories: Legacy<string[]>,

    /** 구 API 사용 키워드북 */
    public readonly keywordBook: Legacy<CrackKeywordBook[]>,

    /** 구 API 사용 공개 전환 시간 */
    public readonly firstPublicAt: Legacy<Undeclarable<string>>,

    /** 구 API 사용 장르 ID */
    public readonly genreId: Legacy<Undeclarable<string>>,
  ) {}

  static from(data: any): ReadonlyDetailedStoryInfo {
    return new ReadonlyDetailedStoryInfo(
      MissingComponentError.ensureString("Crack Story Deserialization", "_id", data),
      CrackIdPair.from(data),
      MissingComponentError.ensureNumber("Crack Story Deserialization", "totalMessageCount", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "defaultCrackerModel", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "chatModelId", data),
      CrackCreatorInfo.from(data),
      MissingComponentError.ensureString("Crack Story Deserialization", "name", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "description", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "simpleDescription", data, false) ?? "",
      MissingComponentError.ensureString("Crack Story Deserialization", "detailDescription", data),
      MissingComponentError.ensureNumber("Crack Story Deserialization", "chatCount", data),
      MissingComponentError.ensureNumber("Crack Story Deserialization", "chatUserCount", data),
      MissingComponentError.ensureNumber("Crack Story Deserialization", "likeCount", data),
      MissingComponentError.ensureNumber("Crack Story Deserialization", "dislikeCount", data, false) ?? 0,
      MissingComponentError.ensureNumber("Crack Story Deserialization", "imageCount", data, false) ?? 0,
      MissingComponentError.ensureNumber("Crack Story Deserialization", "endingCount", data, false) ?? 0,
      MissingComponentError.ensureArray<string>("Crack Story Deserialization", "tags", data),
      MissingComponentError.ensureBool("Crack Story Deserialization", "isLiked", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "countryCode", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "visibility", data),
      new CrackImageMappable(data["profileImage"]),
      data["portraitImage"] ? new CrackImageMappable(data["portraitImage"]) : null,
      { created: new Date(data["createdAt"]), updated: new Date(data["updatedAt"]) },
      MissingComponentError.ensureBool("Crack Story Deserialization", "isAdult", data),
      MissingComponentError.ensureBool("Crack Story Deserialization", "isConvertedToAdult", data),
      MissingComponentError.ensureNumber("Crack Story Deserialization", "commentCount", data),
      CrackPromptTemplate.from(data["promptTemplate"]),
      CrackGenre.from(data["genre"]),
      MissingComponentError.ensureString("Crack Story Deserialization", "target", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "chatType", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "storyDetails", data, false),
      MissingComponentError.ensureString("Crack Story Deserialization", "customPrompt", data, false),
      MissingComponentError.ensureArray<string>("Crack Story Deserialization", "chatExample", data),
      MissingComponentError.ensureArray<any>("Crack Story Deserialization", "startingSets", data).map((it) => CrackStartingSet.from(it)),
      CrackOriginalState.from(data["original"]),
      MissingComponentError.ensureBool("Crack Story Deserialization", "isCommentBlocked", data),
      MissingComponentError.ensureArray<string>("Crack Story Deserialization", "initialMessages", data),
      MissingComponentError.ensureArray<string>("Crack Story Deserialization", "replySuggestions", data),
      MissingComponentError.ensureArray<any>("Crack Story Deserialization", "situationImages", data).map((it) => CrackSituationImage.from(it)),
      MissingComponentError.ensureString("Crack Story Deserialization", "snapshotId", data, false),
      MissingComponentError.ensureString("Crack Story Deserialization", "model", data, false),

      MissingComponentError.ensureArray<string>("Crack Story Deserialization", "categories", data),
      MissingComponentError.ensureArray<any>("Crack Story Deserialization", "keywordBook", data).map((it) => CrackKeywordBook.from(it)),

      MissingComponentError.ensureString("Crack Story Deserialization", "firstPublicAt", data, false),
      MissingComponentError.ensureString("Crack Story Deserialization", "genreId", data, false),
    );
  }
}
