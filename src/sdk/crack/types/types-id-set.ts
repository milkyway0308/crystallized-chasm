import { MissingComponentError } from "../../../utils/error-utils";

export class CrackIdPair {
  constructor(
    /** 유저 ID */
    public readonly userId: string,
    /** 유저 뤼튼 UID */
    public readonly wrtnUid: string,
  ) {}

  static from(data: any): CrackIdPair {
    MissingComponentError.ensureString("Crack / Wrtn ID Deserialization", "userId", data);
    MissingComponentError.ensureString("Crack / Wrtn ID Deserialization", "wrtnUid", data);
    return new CrackIdPair(data["userId"], data["wrtnUid"]);
  }
}
