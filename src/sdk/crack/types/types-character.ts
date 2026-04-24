import { MissingComponentError } from "../../../utils/error-utils";

export class CrackSituationImage {
    constructor(
        public readonly situation: string,
        public readonly keyword: string,
        public readonly imageUrl: string,
        public readonly blurredImageUrl: string,
        public readonly hint: string,
    ){}
}
export class CrackCharacterMessageTemplate {
  constructor(
    public role: string,
    public content: string,
  ) {}

  static from(data: any): CrackCharacterMessageTemplate {
    return new CrackCharacterMessageTemplate(MissingComponentError.ensureString("Crack Character Message Deserialization", "role", data), MissingComponentError.ensureString("Crack Character Message Deserialization", "content", data));
  }
}
export class ReadonlyCharacterInfo {
  constructor(
    public readonly name: string,
    public readonly simpleDescription: string,
    public readonly associatedStoryIds: string[],
    public readonly isCommentBlocked: boolean,
    public readonly isMovingImage: boolean,
    public readonly introBackground: string,
    public readonly introMessages: CrackCharacterMessageTemplate[],
    public readonly exampleMessages: CrackCharacterMessageTemplate[],
    public readonly systemPrompt: string,
    
  ) {}
}
