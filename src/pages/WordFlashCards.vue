<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useStudyStore } from "@/stores/study";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import SessionSummary from "@/components/SessionSummary.vue";
import Header from "@/components/Header.vue";
import Flashcard from "@/components/Flashcard.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

import { buildFlashcard } from "@/lib/flashcardFactory";
import { makeStudyItem } from "@/lib/makeStudyItem";
import type { AlphabetGroup, StudyItem } from "@/types";
import { alphabetGroupToVariant } from "@/lib/alphabetGroupToVariant";

const MAX_CARDS = 20;

const props = defineProps<{
    mode: "new" | "review" | "collection" | "alphabet";
    collectionId?: string;
    group?: AlphabetGroup;
}>();

const study = useStudyStore();
const vocab = useVocabularyStore();
const alphabet = useAlphabetStore();
const srs = useSrsStore();

function handleKeydown(e: KeyboardEvent) {
    if (!study.queue.length || study.completed) return;

    if (["1", "2", "3", "4", " ", "s", "Enter"].includes(e.key)) {
        e.preventDefault();
    }

    if (!study.revealed) {
        if (e.key === " " || e.key === "Enter") {
            study.reveal();
        }
        return;
    }

    if (e.key === "1") study.grade(0);
    if (e.key === "2") study.grade(1);
    if (e.key === "3") study.grade(2);
    if (e.key === "4") study.grade(3);
    if (e.key === "s") study.suspendCurrent();
}

function buildStudyItems(): StudyItem[] {
    switch (props.mode) {
        case "new": {
            return vocab.words
                .filter((w) =>
                    !srs.get(makeStudyItem("word", w.id, "TH_TO_EN").id)
                )
                .map((w) =>
                    makeStudyItem("word", w.id, "TH_TO_EN")
                );
        }

        case "collection": {
            if (!props.collectionId) return [];

            return vocab
                .wordsInCollection(props.collectionId)
                .map((w) =>
                    makeStudyItem("word", w.id, "TH_TO_EN")
                );
        }

        case "alphabet": {
            if (!props.group) return [];

            const variant = alphabetGroupToVariant(props.group);

            return alphabet.group(props.group).map((char) =>
                makeStudyItem("alphabet", char.character, variant)
            );
        }

        case "review": {
            // Mixed review: words and alphabet
            return srs.dailyReviewItems.sort(() => Math.random() - 0.5).slice(0, MAX_CARDS);
        }
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);

    const items = buildStudyItems();
    const cards = items.map(buildFlashcard);

    study.start(cards);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    study.$reset();
});
</script>


<template>
    <div class="h-screen flex flex-col bg-background">
        <Header title="Flash Cards" back-to="words.study" />

        <div v-if="study.queue.length && study.current" class="flex flex-1 flex-col px-4 pt-4 pb-2 gap-4">
            <Card class="flex-1">
                <CardContent class="flex items-center justify-center h-full">
                    <Flashcard :card="study.current" />
                </CardContent>
            </Card>

            <div class="sticky bottom-0 bg-background space-y-2">
                <Button v-if="!study.revealed" size="lg" class="w-full flex justify-between" @click="study.reveal">
                    <span>Reveal</span>
                    <Kbd class="opacity-60">Space</Kbd>
                </Button>

                <div v-else class="flex gap-2">
                    <Button size="lg" variant="destructive" class="flex-1 flex justify-between" @click="study.grade(0)">
                        <span>Again</span>
                        <Kbd class="opacity-60">1</Kbd>
                    </Button>

                    <Button size="lg" variant="outline" class="flex-1 flex justify-between" @click="study.grade(1)">
                        <span>Hard</span>
                        <Kbd class="opacity-60">2</Kbd>
                    </Button>

                    <Button size="lg" variant="outline" class="flex-1 flex justify-between" @click="study.grade(2)">
                        <span>Good</span>
                        <Kbd class="opacity-60">3</Kbd>
                    </Button>

                    <Button size="lg" class="flex-1 flex justify-between" @click="study.grade(3)">
                        <span>Easy</span>
                        <Kbd class="opacity-60">4</Kbd>
                    </Button>

                    <Button size="lg" variant="ghost" class="w-full" @click="study.suspendCurrent">
                        <span>Suspend</span>
                        <Kbd class="opacity-60">S</Kbd>
                    </Button>
                </div>
            </div>
        </div>

        <SessionSummary v-else-if="study.completed" />
    </div>
</template>
