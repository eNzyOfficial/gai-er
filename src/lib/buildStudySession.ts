import { useVocabularyStore } from "@/stores/vocabulary";
import type {
  AlphabetGroup,
  StudyItem,
  StudyMode,
  StudyVariant,
} from "@/types";
import { makeStudyItem } from "./makeStudyItem";
import { useSrsStore } from "@/stores/srs";
import { alphabetGroupToVariant } from "./alphabetGroupToVariant";
import { useAlphabetStore } from "@/stores/alphabet";

export function buildStudySession(
  params: {
    mode: StudyMode;
    collectionId?: string;
    group?: AlphabetGroup;
    variant?: StudyVariant;
    variantFilters?: string[];
  },
  maxCards = 20,
): StudyItem[] {
  const vocab = useVocabularyStore();
  const srs = useSrsStore();
  const alphabet = useAlphabetStore();

  switch (params.mode) {
    case "new": {
      return vocab.words
        .filter((w) => !srs.get(makeStudyItem("word", w.id, "TH_TO_EN").id))
        .map((w) => makeStudyItem("word", w.id, "TH_TO_EN"));
    }

    case "collection": {
      if (!params.collectionId) return [];

      return vocab
        .wordsInCollection(params.collectionId)
        .map((w) => makeStudyItem("word", w.id, "TH_TO_EN"));
    }

    case "alphabet": {
      if (!params.group) return [];

      const variant = params.variant || alphabetGroupToVariant(params.group);

      return alphabet
        .group(params.group)
        .map((char) => makeStudyItem("alphabet", char.character, variant));
    }

    case "review": {
      // Mixed review: words and alphabet
      let items = srs.dailyReviewItems;

      if (params.variantFilters && params.variantFilters.length > 0) {
        items = items.filter((item) => {
          const v = item.variant;
          if (params.variantFilters!.includes("sound") && v === "sound")
            return true;
          if (params.variantFilters!.includes("writing") && v === "writing")
            return true;
          if (
            params.variantFilters!.includes("meaning") &&
            (v === "TH_TO_EN" || v === "EN_TO_TH")
          )
            return true;
          if (
            params.variantFilters!.includes("rules") &&
            ["class", "live_dead", "length", "name"].includes(v)
          )
            return true;
          return false;
        });
      }

      return items.sort(() => Math.random() - 0.5).slice(0, maxCards);
    }
  }
}
