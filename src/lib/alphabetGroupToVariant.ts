import type { AlphabetGroup, AlphabetVariant } from "@/types";

export function alphabetGroupToVariant(group: AlphabetGroup): AlphabetVariant {
  switch (group) {
    case "class":
      return "class";
    case "live_dead":
      return "live_dead";
    case "length":
      return "length";
    case "consonant":
    case "vowel":
    case "number":
      return "writing";
  }
}
