import { MissingComponentError } from "../../../utils/error-utils";
import { CrackImageMappable } from "./types-generic";

export class CrackPromptTemplate {
  constructor(
    public readonly name: string,
    public readonly template: string,
    public readonly icon: CrackImageMappable,
  ) {}

  static from(data: any): CrackPromptTemplate {
    return new CrackPromptTemplate(MissingComponentError.ensureString("Cracker Prompt Template Parse", "name", data), MissingComponentError.ensureString("Cracker Prompt Template Parse", "template", data), new CrackImageMappable(data["icon"] ?? {}));
  }
}
