import type { Alphabet, AlphabetGroup } from "@/types";
import { defineStore } from "pinia";

export const useAlphabetStore = defineStore("alphabet", {
  state: () => ({
    cards: [] as Alphabet[],
  }),
  actions: {
    loadFromJSON(json: Alphabet[]) {
      this.cards = json.map((c) => ({ ...c }));
    },
  },
  getters: {
    group: (state) => (type?: AlphabetGroup) => {
      // type ? state.cards.filter((c) => c.type === type) : state.cards,
      switch (type) {
        case "consonant":
        case "vowel":
        case "number":
          return state.cards.filter((c) => c.type === type);

        case "length":
          return state.cards.filter(
            (c) => c.type === "vowel" && (c.is_short ?? null) !== null
          );

        case "live_dead":
          return state.cards.filter(
            (c) => c.type === "consonant" && (c.is_live ?? null) !== null
          );

        case "class":
          return state.cards.filter((c) => c.type === "consonant");
        default:
          return [];
      }
    },

    byCharacter: (state) => {
      return (char: string) => state.cards.find((c) => c.character === char);
    },
  },
});
