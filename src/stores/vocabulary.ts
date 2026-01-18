import { defineStore } from "pinia";
import { useSrsStore } from "@/stores/srs";
import type { Word, WordCollection } from "@/types";

const STORAGE_KEY = "thai-vocab";
const VERSION = "0.1";

export const useVocabularyStore = defineStore("vocabulary", {
  state: () => ({
    words: [
      {
        id: "1",
        thai: "กิน",
        transliteration: "gin",
        meaning: "to eat",
        collectionIds: ["basic"],
        createdAt: Date.now(),
      },
    ] as Word[],
    collections: [
      {
        id: "basic",
        name: "Basic",
        createdAt: Date.now(),
      },
    ] as WordCollection[],
  }),

  getters: {
    getWordById: (state) => {
      return (id: string) => state.words.find((w) => w.id === id);
    },

    wordsInCollection: (state) => {
      return (collectionId: string) =>
        state.words.filter((w) => w.collectionIds.includes(collectionId));
    },

    collectionsWithCounts: (state) => {
      const counts = new Map<string, number>();

      for (const word of state.words) {
        for (const id of word.collectionIds) {
          counts.set(id, (counts.get(id) ?? 0) + 1);
        }
      }

      return state.collections.map((collection) => ({
        ...collection,
        wordCount: counts.get(collection.id) ?? 0,
      }));
    },

    collectionsWithWords: (state) => {
      const used = new Set(state.words.flatMap((w) => w.collectionIds));
      return state.collections.filter((c) => used.has(c.id));
    },

    collectionsWithProgress: (state) => {
      const srs = useSrsStore();
      const now = Date.now();

      return state.collections.map((collection) => {
        const words = state.words.filter((w) =>
          w.collectionIds.includes(collection.id)
        );

        const total = words.length;

        let studied = 0;
        let dueToday = 0;
        let mastered = 0;

        for (const word of words) {
          const s = srs.get(`word:${word.id}:TH_TO_EN`);
          if (!s) continue;

          studied++;

          if (s.nextReviewAt && s.nextReviewAt <= now) {
            dueToday++;
          }

          if ((s.interval ?? 0) > 30) {
            mastered++;
          }
        }

        return {
          ...collection,
          total,
          studied,
          mastered,
          progress: total === 0 ? 0 : studied / total,
          dueToday,
        };
      });
    },

    recentlyAddedWords: (state) => {
      return state.words
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 3);
    },
  },

  actions: {
    addWord(word: Word) {
      this.words.push(word);
      this.save();
    },

    updateWord(updated: Word) {
      const idx = this.words.findIndex((w) => w.id === updated.id);
      if (idx !== -1) {
        this.words[idx] = updated;
        this.save();
      }
    },

    deleteWord(id: string) {
      const srs = useSrsStore();

      this.words = this.words.filter((w) => w.id !== id);

      srs.delete(`word:${id}:TH_TO_EN`);
      srs.delete(`word:${id}:EN_TO_TH`);

      this.save();
    },

    addCollection(collection: WordCollection) {
      if (this.collections.find((c) => c.name === collection.name)) {
        console.log("This collection exists");
        return;
      }

      this.collections.push(collection);

      this.save();
    },

    deleteCollection(id: string) {
      this.collections = this.collections.filter((c) => c.id !== id);

      // remove from all words
      this.words = this.words.map((w) => ({
        ...w,
        collectionIds: w.collectionIds.filter((cid) => cid !== id),
      }));

      this.save();
    },

    load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      try {
        const data = JSON.parse(raw);

        if (data.version !== VERSION) {
          return;
        }

        this.words = data.words ?? [];
        this.collections = data.collections ?? [];
      } catch {
        // fail silently
      }
    },

    save() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: VERSION,
          words: this.words,
          collections: this.collections,
        })
      );
    },
  },
});
