import { defineStore } from "pinia";
import type { SrsData, StudyItem } from "@/types";
import { parseStudyItemId } from "@/lib/parseStudyItemId";

const STORAGE_KEY = "thai-srs";
const VERSION = "0.3";

export const useSrsStore = defineStore("srs", {
  state: () => ({
    items: {} as Record<string, SrsData>,
    reviewHistory: {} as Record<string, number>, // YYYY-MM-DD -> count
  }),

  getters: {
    get: (state) => {
      return (id: string): SrsData | undefined => state.items[id];
    },

    dueIds: (state) => {
      const now = Date.now();
      return Object.entries(state.items)
        .filter(
          ([, srs]) =>
            !srs.suspended && srs.nextReviewAt && srs.nextReviewAt <= now
        )
        .map(([id]) => id);
    },

    dailyReviewItems: (state): StudyItem[] => {
      const now = Date.now();

      return Object.entries(state.items)
        .filter(
          ([, srs]) =>
            !srs.suspended && srs.nextReviewAt && srs.nextReviewAt <= now
        )
        .map(([id]) => parseStudyItemId(id));
    },

    getMastery: (state) => {
      return (id: string): "mastered" | "learning" | "new" => {
        const item = state.items[id];
        if (!item || !item.lastReviewedAt) return "new";
        return (item.interval ?? 0) > 30 ? "mastered" : "learning";
      };
    },
  },

  actions: {
    ensure(id: string): SrsData {
      if (!this.items[id]) {
        this.items[id] = {
          confidence: null,
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          reviewCount: 0,
        };
      }
      return this.items[id];
    },

    suspend(id: string) {
      const entry = this.ensure(id);
      entry.suspended = true;
      this.save();
    },

    unsuspend(id: string) {
      const entry = this.ensure(id);
      entry.suspended = false;
      this.save();
    },

    grade(id: string, confidence: 0 | 1 | 2 | 3) {
      const entry = this.ensure(id);

      // Map confidence to SM-2 quality (0-5)
      // 0: Again (Wrong) -> Quality 0
      // 1: Hard (Correct) -> Quality 3
      // 2: Good (Correct) -> Quality 4
      // 3: Easy (Correct) -> Quality 5
      const quality = confidence === 0 ? 0 : confidence === 1 ? 3 : confidence === 2 ? 4 : 5;
      const now = Date.now();
      const dateKey = new Date(now).toISOString().split('T')[0];
      const DAY = 1000 * 60 * 60 * 24;

      // Update history
      this.reviewHistory[dateKey] = (this.reviewHistory[dateKey] ?? 0) + 1;

      let { repetition = 0, interval = 0, easeFactor = 2.5 } = entry;

      if (quality < 3) {
        repetition = 0;
        interval = 1;
      } else {
        repetition++;
        if (repetition === 1) interval = 1;
        else if (repetition === 2) interval = 6;
        else interval = Math.round(interval * easeFactor);
      }

      easeFactor =
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      easeFactor = Math.max(1.3, easeFactor);

      Object.assign(entry, {
        confidence,
        repetition,
        interval,
        easeFactor,
        nextReviewAt: now + interval * DAY,
        lastReviewedAt: now,
        reviewCount: (entry.reviewCount ?? 0) + 1,
      });

      this.save();
    },

    delete(id: string) {
      delete this.items[id];
      this.save();
    },

    load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      try {
        const data = JSON.parse(raw);
        if (data.version !== VERSION) return;
        this.items = data.items ?? {};
        this.reviewHistory = data.reviewHistory ?? {};
      } catch {}
    },

    save() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: VERSION,
          items: this.items,
          reviewHistory: this.reviewHistory,
        })
      );
    },
  },
});
