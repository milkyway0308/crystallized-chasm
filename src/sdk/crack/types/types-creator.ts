import { MissingComponentError } from "../../../utils/error-utils";

export class CrackCreatorInfo {
  constructor(
    /** 제작자 닉네임 */
    public readonly nickname: string,
    /** 제작자 뤼튼 UID */
    public readonly wrtnUid: string,
    /** 크리에이터 여부 */
    public readonly isCertified: boolean,
    /** 제작자 프로필 ID */
    public readonly profileId: string,
    /** 알 수 없음 */
    public readonly isWithdrawn: boolean,
  ) {}

  static from(data: any): CrackCreatorInfo {
    return new CrackCreatorInfo(
      MissingComponentError.ensureString("Creator Info Deserialization", "nickname", data),
      MissingComponentError.ensureString("Creator Info Deserialization", "wrtnUid", data),
      MissingComponentError.ensureBool("Creator Info Deserialization", "isCertifiedCreator", data),
      MissingComponentError.ensureString("Creator Info Deserialization", "profileId", data),
      MissingComponentError.ensureBool("Creator Info Deserialization", "isWithdrawn", data),
    );
  }
}
