import { MissingComponentError } from "../../../utils/error-utils";
import { CrackImageMappable } from "./types-generic";

export class CrackSuperChatModel {
  constructor(
    public readonly name: string,
    public readonly model: string,
    public readonly icon: CrackImageMappable,
  ) {}

  static from(data: any): CrackSuperChatModel {
    return new CrackSuperChatModel(MissingComponentError.ensureString("Cracker Model Parse", "name", data), MissingComponentError.ensureString("Cracker Model Parse", "model", data), new CrackImageMappable(data["icon"] ?? {}));
  }
}
