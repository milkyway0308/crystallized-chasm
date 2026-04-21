import { MissingComponentError } from "../../../utils/error-utils";
import { CrackParameterLevel } from "./types-level";

export class CrackParameter {
  constructor(
    public name: string,
    public hexCode: string,
    public iconUrl: string,
    public initialValue: number,
    public min: number,
    public max: number,
    public prompt: string,
    public unit: string,
    public levels: CrackParameterLevel[],
  ) {}

  uglify(): any {
    return {
      name: this.name,
      colorHexCode: this.hexCode,
      iconUrl: this.iconUrl,
      initialValue: this.initialValue,
      min: this.min,
      max: this.max,
      prompt: this.prompt,
      unit: this.unit,
      levels: this.levels.length > 0 ? this.levels.map((it) => it.uglify()) : undefined,
    };
  }
  static from(data: any): CrackParameter {
    return new CrackParameter(
      MissingComponentError.ensureString("Crack Stat Parameter Deserialization", "name", data),
      MissingComponentError.ensureString("Crack Stat Parameter Deserialization", "colorHexCode", data),
      MissingComponentError.ensureString("Crack Stat Parameter Deserialization", "iconUrl", data),
      MissingComponentError.ensureNumber("Crack Stat Parameter Deserialization", "initialValue", data),
      MissingComponentError.ensureNumber("Crack Stat Parameter Deserialization", "min", data),
      MissingComponentError.ensureNumber("Crack Stat Parameter Deserialization", "max", data),
      MissingComponentError.ensureString("Crack Stat Parameter Deserialization", "prompt", data),
      MissingComponentError.ensureString("Crack Stat Parameter Deserialization", "unit", data),
      MissingComponentError.ensureArray<any>("Crack Stat Parameter Deserialization", "levels", data, false)?.map((it) => CrackParameterLevel.from(it)) ?? [],
    );
  }
}
