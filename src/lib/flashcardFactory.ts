import type { Flashcard, StudyItem } from "@/types";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useAlphabetStore } from "@/stores/alphabet";
import { h } from "vue";
import AudioButton from "@/components/AudioButton.vue";

export function buildFlashcard(item: StudyItem): Flashcard {
  const vocab = useVocabularyStore();
  const alphabet = useAlphabetStore();

  if (item.entityType === "word") {
    const word = vocab.getWordById(item.entityId);
    if (!word) throw new Error("Missing word: " + item.entityId);

    switch (item.variant) {
      case "EN_TO_TH":
        return {
          id: item.id,
          studyItem: item,
          kind: "recall",
          prompt: word.meaning,
          answer: `${word.thai}\n${word.transliteration}`,
          interaction: "reveal",
        };

      case "TH_TO_EN":
        return {
          id: item.id,
          studyItem: item,
          kind: "recognition",
          prompt: word.thai,
          answer: `${word.meaning}\n${word.transliteration}`,
          interaction: "reveal",
        };
    }
  }

  if (item.entityType === "alphabet") {
    const char = alphabet.byCharacter(item.entityId);
    if (!char) throw new Error("Missing character: " + item.entityId);

    switch (item.variant) {
      case "name":
        return {
          id: item.id,
          studyItem: item,
          kind: "recognition",
          prompt: char.character,
          answer: char.name,
          interaction: "reveal",
        };

      case "class":
        return {
          id: item.id,
          studyItem: item,
          kind: "recall",
          prompt: char.character,
          answer: char.class,
          interaction: "reveal",
        };

      case "live_dead":
        return {
          id: item.id,
          studyItem: item,
          kind: "recall",
          prompt: char.character,
          answer: char.is_live ? "Live" : "Dead",
          interaction: "reveal",
        };

      case "length":
        return {
          id: item.id,
          studyItem: item,
          kind: "recall",
          prompt: char.character,
          answer: char.is_short ? "Short" : "Long",
          interaction: "reveal",
        };

      case "sound":
        return {
          id: item.id,
          studyItem: item,
          kind: "audio",
          prompt: char.character,
          answer: h("div", { class: "flex flex-col gap-2 items-center" }, [
            h(AudioButton, { path: char.audio, text: true }),
            h("div", char.ipa),
            h("div", { class: "text-muted-foreground" }, char.example),
          ]),
          interaction: "reveal",
        };

      case "listening":
        return {
          id: item.id,
          studyItem: item,
          kind: "audio",
          prompt: "", // Prompt is empty because the user listens to the audio
          answer: char.character,
          interaction: "listening",
        };

      case "writing":
        return {
          id: item.id,
          studyItem: item,
          kind: "writing",
          prompt: h("div", { class: "flex flex-col gap-0 items-center" }, [
            h(
              "div",
              { class: "text-2xl font-bold" },
              char.name.replace("sara ", ""),
            ),
            h("div", { class: "text-xs text-muted-foreground flex gap-1.5" }, [
              h("span", char.ipa),
              h("span", { class: "opacity-50" }, "•"),
              h("span", char.example_english),
            ]),
          ]),
          answer: char.character,
          interaction: "writing",
        };
    }
  }

  throw new Error(`Unsupported StudyItem: ${item.id}`);
}
