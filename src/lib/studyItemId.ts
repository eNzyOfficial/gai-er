import type { EntityType, StudyVariant } from "@/types";

export function studyItemId(
  entityType: EntityType,
  entityId: string,
  variant: StudyVariant
) {
  return `${entityType}:${entityId}:${variant}`;
}
