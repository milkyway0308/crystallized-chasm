import { MissingComponentError } from "../../../utils/error-utils";

export class CrackKeywordBook {
  constructor(
    /** 키워드북 이름 */
    public readonly name: string,
    /** 키워드북 키워드 목록 */
    public readonly keywords: string[],
    /** 키워드 프롬프트 */
    public readonly prompt: string,
  ) {}

  static from(data: any): CrackKeywordBook {
    return new CrackKeywordBook(
      MissingComponentError.ensureString("Crack KeywordBook Deserialization", "name", data),
      MissingComponentError.ensureArray<string>("Crack KeywordBook Deserialization", "keywords", data),
      MissingComponentError.ensureString("Crack KeywordBook Deserialization", "prompt", data),
    );
  }
}
