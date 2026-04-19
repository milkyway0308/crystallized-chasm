import { MissingComponentError } from "../../../utils/error-utils";
import { UpdatableTimestamp } from "../../core/types/generic-types";

export class CrackLongTermMemory {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly summary: string,
    public readonly badge: string,
    public readonly createdBy: string,
    public readonly timestamp: UpdatableTimestamp,
  ) {}

  static from(data: any): CrackLongTermMemory {
    return new CrackLongTermMemory(
      MissingComponentError.ensureString("Crack long-term memory deserialization", "_id", data),
      MissingComponentError.ensureString("Crack long-term memory deserialization", "title", data),
      MissingComponentError.ensureString("Crack long-term memory deserialization", "summary", data),
      MissingComponentError.ensureString("Crack long-term memory deserialization", "badge", data),
      MissingComponentError.ensureString("Crack long-term memory deserialization", "createdBy", data),
      {
        created: new Date(data["createdAt"]),
        updated: new Date(data["updatedAt"]),
      },
    );
  }
}
