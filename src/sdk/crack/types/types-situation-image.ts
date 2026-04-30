import { MissingComponentError } from "../../../utils/error-utils";
import { Undeclarable } from "../../../utils/generic-types";

export class CrackSituationImage {
  constructor(
    /** 이미지 상황 설명 */
    public situation: string,
    /** 이미지 키워드 */
    public keyword: string,
    /** 이미지 URL */
    public imageUrl: string,

    public category: Undeclarable<string>
  ) {}

  static from(data: any): CrackSituationImage {
    return new CrackSituationImage(
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "situation", data),
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "keyword", data, false) ?? "_NOT_EXISTS",
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "imageUrl", data),
      MissingComponentError.ensureString("Crack Situation Image Deserialization", "category", data, false),
      
    );
  }
}
