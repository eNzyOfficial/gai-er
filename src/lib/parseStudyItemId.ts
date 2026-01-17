import type { EntityType, StudyItem, StudyVariant } from "@/types";

export function parseStudyItemId(id: string): StudyItem {
  const [entityType, entityId, variant] = id.split(":");

  if (!entityType || !entityId || !variant) {
    throw new Error("Invalid StudyItem id: " + id);
  }

  return {
    id,
    entityType: entityType as EntityType,
    entityId,
    variant: variant as StudyVariant,
  };
}
