export class CrackOriginalState {
  constructor(
    public readonly isOriginal: boolean,
    public readonly isEditBlocked: boolean,
  ) {}

  static from(data: any): CrackOriginalState {
    return new CrackOriginalState(data["isOriginal"], data["isEditBlocked"]);
  }
}
