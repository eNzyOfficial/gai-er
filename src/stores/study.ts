import { defineStore } from "pinia";
import { useSrsStore } from "@/stores/srs";
import type { Flashcard } from "@/types";

export const useStudyStore = defineStore("study", {
  state: () => ({
    queue: [] as Flashcard[],
    index: 0,
    revealed: false,
    completed: false,

    stats: {
      again: 0,
      good: 0,
      easy: 0,
      total: 0,

      byKind: {
        recognition: { total: 0, again: 0 },
        recall: { total: 0, again: 0 },
        audio: { total: 0, again: 0 },
      },
    },
  }),

  getters: {
    current: (state) => state.queue[state.index],

    recognitionAccuracy(state): number {
      const s = state.stats.byKind.recognition;

      return s.total ? 1 - s.again / s.total : 0;
    },

    recallAccuracy(state): number {
      const s = state.stats.byKind.recall;
      return s.total ? 1 - s.again / s.total : 0;
    },
  },

  actions: {
    start(cards: Flashcard[]) {
      this.queue = cards;
      this.index = 0;
      this.revealed = false;
      this.completed = false;
      this.stats = {
        again: 0,
        good: 0,
        easy: 0,
        total: 0,
        byKind: {
          recognition: { total: 0, again: 0 },
          recall: { total: 0, again: 0 },
          audio: { total: 0, again: 0 },
        },
      };
    },

    suspendCurrent() {
      const card = this.current;
      if (!card) return;

      const srs = useSrsStore();
      srs.suspend(card.id);

      // Treat as "Easy" and move on
      this.stats.total++;
      this.stats.easy++;

      this.revealed = false;
      this.index++;

      if (this.index >= this.queue.length) {
        this.completed = true;
      }
    },

    reveal() {
      this.revealed = true;
    },

    grade(confidence: 0 | 1 | 2) {
      const card = this.current;
      if (!card) return;

      const kind = card.kind ?? "recognition";

      const srs = useSrsStore();
      srs.grade(card.id, confidence);

      this.stats.byKind[kind].total++;

      this.stats.total++;

      if (confidence === 0) {
        this.stats.again++;
        this.stats.byKind[kind].again++;
      }
      if (confidence === 1) this.stats.good++;
      if (confidence === 2) this.stats.easy++;

      this.revealed = false;
      this.index++;

      if (this.index >= this.queue.length) {
        this.completed = true;
      }
    },
  },
});

// export const useStudyStore = defineStore("study", {
//   state: () => ({
//     queue: [] as Flashcard[],
//     currentIndex: 0,
//     revealed: false,
//     direction: null as WordStudyDirection | null,
//     requeuedIds: new Set<string>(),

//     completed: false,
//     stats: {
//       again: 0,
//       good: 0,
//       easy: 0,
//       total: 0,
//     },

//     correct: 0,
//     incorrect: 0,
//     streak: 0,
//     maxStreak: 0,
//   }),

//   getters: {
//     currentCard(state): Flashcard | undefined {
//       return state.queue[state.currentIndex];
//     },

//     difficultyScore(state): number {
//       if (state.stats.total === 0) return 0;
//       return (state.stats.again + state.stats.good * 0.5) / state.stats.total;
//     },

//     accuracy(state): number {
//       const total = state.correct + state.incorrect;
//       return total === 0 ? 0 : state.correct / total;
//     },
//   },

//   actions: {
//     reset() {
//       this.queue = [];
//       this.currentIndex = 0;
//       this.revealed = false;
//       this.completed = false;
//       this.requeuedIds.clear();
//       this.stats = { again: 0, good: 0, easy: 0, total: 0 };
//       this.correct = 0;
//       this.incorrect = 0;
//       this.streak = 0;
//       this.maxStreak = 0;
//     },

//     restartWithDirection(direction: WordStudyDirection) {
//       if (this.revealed) return;
//       if (this.direction === direction) return;

//       const cards = [...this.queue];
//       this.reset();
//       this.startStudy(cards, direction);
//     },

//     startStudy(
//       cards: Flashcard[],
//       direction: WordStudyDirection | null = null
//     ) {
//       this.direction = direction;

//       this.queue = [...cards].sort((a, b) => {
//         if (!a.srs.nextReviewAt && !b.srs.nextReviewAt) return 0;
//         if (!a.srs.nextReviewAt) return -1;
//         if (!b.srs.nextReviewAt) return 1;
//         return a.srs.nextReviewAt - b.srs.nextReviewAt;
//       });

//       this.currentIndex = 0;
//       this.revealed = false;
//       this.completed = false;
//       this.requeuedIds.clear();
//     },

//     reveal() {
//       this.revealed = true;
//     },

//     grade(confidence: 0 | 1 | 2) {
//       const card = this.currentCard;
//       if (!card) return;

//       const srs = useSrsStore();
//       srs.grade(card.type, card.id, confidence);

//       this.stats.total++;
//       if (confidence === 0) this.stats.again++;
//       if (confidence === 1) this.stats.good++;
//       if (confidence === 2) this.stats.easy++;

//       if (confidence === 0) {
//         this.incorrect++;
//         this.streak = 0;

//         if (!this.requeuedIds.has(card.id)) {
//           this.queue.push(card);
//           this.requeuedIds.add(card.id);
//         }
//       } else {
//         this.correct++;
//         this.streak++;
//         this.maxStreak = Math.max(this.maxStreak, this.streak);
//       }

//       this.next();
//     },

//     next() {
//       this.revealed = false;
//       this.currentIndex++;

//       if (!this.queue[this.currentIndex]) {
//         this.completed = true;
//       }
//     },
//   },
// });
