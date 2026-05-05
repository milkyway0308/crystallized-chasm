import { MissingComponentError } from "../../../utils/error-utils";

export class CrackParameterLevel {
  constructor(
    public readonly name: string,
    public readonly min: number,
    public readonly max: number,
    public readonly prompt: string,
  ) {}

  static from(data: any): CrackParameterLevel {
    return new CrackParameterLevel(
      MissingComponentError.ensureString("Crack Stat Parameter Level Deserialization", "name", data),
      MissingComponentError.ensureNumber("Crack Stat Parameter Level Deserialization", "levelMinValue", data),
      MissingComponentError.ensureNumber("Crack Stat Parameter Level Deserialization", "levelMaxValue", data),
      MissingComponentError.ensureString("Crack Stat Parameter Level Deserialization", "levelPrompt", data),
    );
  }

  uglify() : any {
    return {
        name: this.name,
        levelMinValue: this.min,
        levelMaxValue: this.max,
        levelPrompt: this.prompt
    }
  }
}
