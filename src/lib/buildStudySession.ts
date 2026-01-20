import { useVocabularyStore } from "@/stores/vocabulary";
import type {
  AlphabetGroup,
  AlphabetVariant,
  StudyItem,
  StudyMode,
  StudyVariant,
  WordVariant,
} from "@/types";
import { makeStudyItem } from "./makeStudyItem";
import { useSrsStore } from "@/stores/srs";
import { alphabetGroupToVariant } from "./alphabetGroupToVariant";
import { useAlphabetStore } from "@/stores/alphabet";

export function buildStudySession(
  params: {
    mode: StudyMode | "practice";
    collectionId?: string;
    group?: AlphabetGroup;
    variant?: StudyVariant;
    variants?: StudyVariant[];
    variantFilters?: string[];
    filter?: "all" | "new" | "srs_only";
  },
  maxCards = 20,
): StudyItem[] {
  const vocab = useVocabularyStore();
  const srs = useSrsStore();
  const alphabet = useAlphabetStore();

  if (params.mode === "practice") {
    let items: StudyItem[] = [];

    if (params.collectionId || !params.group) {
      // Words practice
      const words = params.collectionId
        ? vocab.wordsInCollection(params.collectionId)
        : vocab.words;

      const filteredWords = words.filter((w) => {
        const hasSrs = srs.get(makeStudyItem("word", w.id, "TH_TO_EN").id);
        if (params.filter === "new") return !hasSrs;
        if (params.filter === "srs_only") return !!hasSrs;
        return true;
      });

      const variants: WordVariant[] = (params.variants as WordVariant[]) ||
        (params.variant ? [params.variant as WordVariant] : [
          "TH_TO_EN",
          "EN_TO_TH",
        ]);

      for (const word of filteredWords) {
        for (const v of variants) {
          items.push(makeStudyItem("word", word.id, v));
        }
      }
    } else if (params.group) {
      // Alphabet practice
      const chars = alphabet.group(params.group);
      const variants: AlphabetVariant[] =
        (params.variants as AlphabetVariant[]) ||
        (params.variant
          ? [params.variant as AlphabetVariant]
          : [alphabetGroupToVariant(params.group)]);

      for (const char of chars) {
        for (const v of variants) {
          items.push(makeStudyItem("alphabet", char.character, v));
        }
      }
    }

    return items.sort(() => Math.random() - 0.5);
  }

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
          if (params.variantFilters!.includes("sound") && (v === "sound" || v === "listening"))
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
