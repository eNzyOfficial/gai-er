import { computed, type Ref } from "vue";
import type { SrsData, Word } from "@/types";
import { useSrsStore } from "@/stores/srs";

export type SortMode = "smart" | "newest" | "alpha";

export function useWordList(
  words: Ref<Word[]>,
  search: Ref<string>,
  sortMode: Ref<SortMode>
) {
  const srs = useSrsStore();

  const displayedWords = computed(() => {
    let result = [...words.value];

    // search (unchanged)
    if (search.value.trim()) {
      const q = search.value.toLowerCase();
      result = result.filter(
        (w) =>
          w.thai.toLowerCase().includes(q) ||
          w.transliteration.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q)
      );
    }

    switch (sortMode.value) {
      case "newest":
        return result.sort((a, b) => b.createdAt - a.createdAt);

      case "alpha":
        return result.sort((a, b) => a.thai.localeCompare(b.thai, "th"));

      default:
        return result.sort((a, b) =>
          smartCompare(a, b, srs.get("word", a.id), srs.get("word", b.id))
        );
    }
  });

  return { displayedWords };
}

export function smartCompare(a: Word, b: Word, aSrs?: SrsData, bSrs?: SrsData) {
  const now = Date.now();

  const aDue = aSrs?.nextReviewAt ?? Infinity;
  const bDue = bSrs?.nextReviewAt ?? Infinity;

  // 1. Due first
  const aIsDue = aDue <= now;
  const bIsDue = bDue <= now;
  if (aIsDue !== bIsDue) return aIsDue ? -1 : 1;

  // 2. Soonest due
  if (aDue !== bDue) return aDue - bDue;

  // 3. Harder first
  const aRep = aSrs?.repetition ?? 0;
  const bRep = bSrs?.repetition ?? 0;
  if (aRep !== bRep) return aRep - bRep;

  const aEase = aSrs?.easeFactor ?? 2.5;
  const bEase = bSrs?.easeFactor ?? 2.5;
  if (aEase !== bEase) return aEase - bEase;

  // 4. Lower confidence first
  const aConf = aSrs?.confidence ?? 0;
  const bConf = bSrs?.confidence ?? 0;
  if (aConf !== bConf) return aConf - bConf;

  // 5. Fewer reviews first
  const aReviews = aSrs?.reviewCount ?? 0;
  const bReviews = bSrs?.reviewCount ?? 0;
  if (aReviews !== bReviews) return aReviews - bReviews;

  // 6. Older words first
  return a.createdAt - b.createdAt;
}
