import { UpdatableTimestamp } from "../../core/types/generic-types";

/**
 * 페르소나 데이터입니다.
 */
export class CrackPersona {
  /**
   * @param id 페르소나 ID
   * @param name 페르소나 이름
   * @param isRepresentative 대표 프로필 여부
   * @param profileId 계정 프로필 ID
   * @param timestamp 생성 / 수정 타임스탬프
   */
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly isRepresentative: boolean,
    public readonly profileId: string,
    public readonly timestamp: UpdatableTimestamp,
  ) {}
}
