import { MissingComponentError } from "../../../utils/error-utils";

export class CrackSituationImage {
  constructor(
    /** 이미지 상황 설명 */
    public readonly situation: string,
    /** 이미지 키워드 */
    public readonly keyword: string,
    /** 이미지 URL */
    public readonly imageUrl: string,
  ) {}

  static from(data: any): CrackSituationImage {
    return new CrackSituationImage(
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "situation", data),
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "keyword", data),
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "imageUrl", data),
    );
  }
}
