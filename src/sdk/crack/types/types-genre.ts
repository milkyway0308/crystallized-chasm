import { MissingComponentError } from "../../../utils/error-utils";
import { CrackImageMappable } from "./types-generic";

export class CrackGenre {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
  ) {}

  static from(data: any): CrackGenre {
    return new CrackGenre(MissingComponentError.ensureString("Crack Genre Deserialization", "_id", data), MissingComponentError.ensureString("Crack Genre Deserialization", "name", data), MissingComponentError.ensureString("Crack Genre Deserialization", "type", data));
  }
}
