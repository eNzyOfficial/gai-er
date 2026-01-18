import type { VNode } from "vue";

export type SrsData = {
  suspended?: boolean;
  confidence?: 0 | 1 | 2 | 3 | null;
  repetition?: number;
  interval?: number; // days
  easeFactor?: number; // SM-2 EF
  nextReviewAt?: number; // timestamp
  lastReviewedAt?: number; // timestamp
  reviewCount?: number;
};

export type Flashcard = {
  id: string;
  studyItem: StudyItem;
  prompt: string | VNode;
  answer: string | VNode;
  kind?: "recognition" | "recall" | "audio" | "writing";
};

export type WordCollection = {
  id: string;
  name: string;
  createdAt: number;
};

export type Word = {
  id: string;
  thai: string;
  transliteration: string;
  meaning: string;
  notes?: string;

  collectionIds: string[];
  createdAt: number;
};

export type Alphabet = {
  character: string;
  name: string;
  class: "mid" | "high" | "low";
  type: "consonant" | "vowel" | "number" | "mark";
  is_live?: boolean;
  is_short?: boolean;
  ipa: string;
  example: string;
  example_english: string;
  audio: string;
  final_consonant?: string;
};

export type StudyItem = {
  id: string;
  entityType: EntityType;
  entityId: string;
  variant: StudyVariant;
};

export type EntityType = "word" | "alphabet";

export type WordVariant = "EN_TO_TH" | "TH_TO_EN";

export type AlphabetVariant =
  | "name"
  | "sound"
  | "class"
  | "live_dead"
  | "length"
  | "writing";

export type StudyVariant = WordVariant | AlphabetVariant;

export type AlphabetGroup =
  | "consonant"
  | "vowel"
  | "number"
  | "class"
  | "live_dead"
  | "length";
