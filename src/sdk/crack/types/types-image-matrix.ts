import { Undeclarable } from "../../../utils/generic-types";

export class CrackImageMatrix {
  constructor(
    public categories: string[],
    public situations: string[],
  ) {}

  uglify(): any {
    return {
      categories: this.categories,
      situations: this.situations,
    };
  }

  static from(data: any): Undeclarable<CrackImageMatrix> {
    if (!data) return undefined;
    return new CrackImageMatrix(data.categories, data.situations);
  }
}
