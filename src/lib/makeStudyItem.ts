import type { EntityType, StudyVariant, StudyItem } from "@/types";
import { studyItemId } from "./studyItemId";

export function makeStudyItem(
  entityType: EntityType,
  entityId: string,
  variant: StudyVariant
): StudyItem {
  return {
    id: studyItemId(entityType, entityId, variant),
    entityType,
    entityId,
    variant,
  };
}
