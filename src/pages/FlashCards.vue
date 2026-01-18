<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useStudyStore } from "@/stores/study";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import SessionSummary from "@/components/SessionSummary.vue";
import Flashcard from "@/components/Flashcard.vue";
import WritingCanvas from "@/components/WritingCanvas.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Volume2 } from "lucide-vue-next";

import { buildFlashcard } from "@/lib/flashcardFactory";
import { makeStudyItem } from "@/lib/makeStudyItem";
import type { AlphabetGroup, StudyItem, StudyVariant } from "@/types";
import { alphabetGroupToVariant } from "@/lib/alphabetGroupToVariant";
import Page from "@/components/page/Page.vue";

const MAX_CARDS = 20;

const props = defineProps<{
    mode: "new" | "review" | "collection" | "alphabet";
    collectionId?: string;
    group?: AlphabetGroup;
    variant?: StudyVariant;
}>();

const study = useStudyStore();
const vocab = useVocabularyStore();
const alphabet = useAlphabetStore();
const srs = useSrsStore();

// Writing mode state
type WritingPhase = "peek" | "draw" | "review";
const writingPhase = ref<WritingPhase>("peek");
const hintActive = ref(false);
const canvasRef = ref<InstanceType<typeof WritingCanvas> | null>(null);

const currentSrsEntry = computed(() => {
    if (!study.current) return null;
    return srs.get(study.current.id) || null;
});

const shouldAutoSkipPeek = computed(() => {
    return (currentSrsEntry.value?.repetition ?? 0) >= 4;
});

const shouldShowGhostByDefault = computed(() => {
    return (currentSrsEntry.value?.repetition ?? 0) < 2;
});

const cleanAnswer = computed(() => {
    if (!study.current) return "";
    if (typeof study.current.answer !== "string") return "";
    return study.current.answer.replace("อ", "");
});

function initWritingCard() {
    if (study.current?.kind !== "writing") return;

    if (shouldAutoSkipPeek.value) {
        writingPhase.value = "draw";
    } else {
        writingPhase.value = "peek";
    }
    hintActive.value = shouldShowGhostByDefault.value;
}

watch(() => study.current?.id, () => {
    if (study.current?.kind === "writing") {
        initWritingCard();
    }
});

function playAudio() {
    if (!study.current) return;
    const char = alphabet.byCharacter(study.current.studyItem.entityId);
    if (char?.audio) {
        const path = `/audio/female/${char.audio}`;
        const audio = new Audio(path);
        audio.play().catch(e => console.error("Failed to play audio:", path, e));
    }
}

function beginWriting() {
    writingPhase.value = "draw";
}

function toggleHint() {
    if (writingPhase.value !== "draw") return;

    if (shouldShowGhostByDefault.value) {
        hintActive.value = !hintActive.value;
    } else {
        hintActive.value = true;
        setTimeout(() => {
            if (writingPhase.value === "draw" && !shouldShowGhostByDefault.value) {
                hintActive.value = false;
            }
        }, 2000);
    }
}

function handleWritingReveal() {
    study.reveal();
    writingPhase.value = "review";
    hintActive.value = true;
}

function handleWritingGrade(confidence: 0 | 1 | 2 | 3) {
    study.grade(confidence);
    canvasRef.value?.clear();
}

function handleKeydown(e: KeyboardEvent) {
    if (!study.queue.length || study.completed) return;

    if (["1", "2", "3", "4", " ", "s", "Enter", "h", "a"].includes(e.key)) {
        e.preventDefault();
    }

    if (study.current?.kind === "writing") {
        if (writingPhase.value === "peek") {
            if (e.key === " " || e.key === "Enter") beginWriting();
            if (e.key === "a") playAudio();
            return;
        }
        if (writingPhase.value === "draw") {
            if (e.key === " " || e.key === "Enter") handleWritingReveal();
            if (e.key === "h") toggleHint();
            if (e.key === "a") playAudio();
            return;
        }
        if (writingPhase.value === "review") {
            if (e.key === "1") handleWritingGrade(0);
            if (e.key === "2") handleWritingGrade(1);
            if (e.key === "3") handleWritingGrade(2);
            if (e.key === "4") handleWritingGrade(3);
            if (e.key === "a") playAudio();
            return;
        }
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

            const variant = props.variant || alphabetGroupToVariant(props.group);

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

    if (study.current?.kind === "writing") {
        initWritingCard();
    }
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    study.$reset();
});
</script>


<template>
    <Page title="Flash Cards" with-back>
        <template #header />

        <div v-if="study.queue.length && study.current" class="flex flex-1 flex-col px-4 pt-4 pb-2 gap-4 h-full">
            <div v-if="study.current.kind === 'writing'" class="flex-1 flex flex-col gap-4 min-h-0">
                <!-- Peek Phase -->
                <div v-if="writingPhase === 'peek'"
                    class="flex-1 flex flex-col items-center justify-center gap-8 bg-card border rounded-xl p-8">
                    <div class="text-center space-y-4">
                        <div class="text-9xl font-bold text-primary p-2">{{ study.current.answer }}</div>
                        <div class="space-y-1">
                            <component v-if="typeof study.current.prompt !== 'string'" :is="study.current.prompt" />
                        </div>
                    </div>

                    <Button variant="secondary" size="lg" @click="playAudio" class="gap-2">
                        <Volume2 class="w-5 h-5" />
                        Listen <Kbd class="ml-2">A</Kbd>
                    </Button>

                    <Button size="lg" class="w-full max-w-xs text-xl py-8 flex justify-between px-8"
                        @click="beginWriting">
                        <span>Begin Writing</span>
                        <Kbd class="opacity-60 text-sm">Space</Kbd>
                    </Button>
                </div>

                <!-- Draw / Review Phase -->
                <div v-else class="flex-1 flex flex-col gap-4 min-h-0">
                    <div class="flex-1 min-h-0 relative overflow-hidden rounded-xl border">
                        <WritingCanvas ref="canvasRef" :placeholder="hintActive ? cleanAnswer : undefined"
                            :hint-active="hintActive && writingPhase === 'draw'"
                            :show-controls="writingPhase === 'draw'" :can-draw="writingPhase === 'draw'" />
                        <!-- Context info in Draw phase -->
                        <div v-if="writingPhase === 'draw'" class="absolute top-5 left-5 pointer-events-none space-y-1">
                            <component v-if="typeof study.current.prompt !== 'string'" :is="study.current.prompt" />
                        </div>
                    </div>

                    <!-- Side-by-side Answer in Review phase -->
                    <div v-if="writingPhase === 'review'" class="h-1/3 flex flex-col gap-4">
                        <Card class="flex-1 flex items-center justify-center bg-muted/30">
                            <div class="text-9xl leading-none font-bold text-primary">{{ study.current.answer }}</div>
                        </Card>
                    </div>

                    <div class="sticky bottom-0 bg-background space-y-2">
                        <!-- Draw Controls -->
                        <div v-if="writingPhase === 'draw'" class="flex gap-2">
                            <Button variant="outline" @click="playAudio" title="Play Audio" class="px-3">
                                <Volume2 class="w-5 h-5" />
                            </Button>

                            <Button variant="outline" class="flex-1" @click="toggleHint">
                                <span>{{ hintActive && shouldShowGhostByDefault ? 'Hide Hint' : 'Hint' }}</span>
                                <Kbd class="ml-2 opacity-60">H</Kbd>
                            </Button>

                            <Button class="flex-1 flex justify-between" @click="handleWritingReveal">
                                <span>Submit</span>
                                <Kbd class="opacity-60">Space</Kbd>
                            </Button>
                        </div>

                        <!-- Review Controls -->
                        <div v-else-if="writingPhase === 'review'" class="flex gap-2">
                            <Button size="lg" variant="destructive" class="flex-1 flex justify-between"
                                @click="handleWritingGrade(0)">
                                <span>Again</span>
                                <Kbd class="opacity-60">1</Kbd>
                            </Button>

                            <Button size="lg" variant="outline" class="flex-1 flex justify-between"
                                @click="handleWritingGrade(1)">
                                <span>Hard</span>
                                <Kbd class="opacity-60">2</Kbd>
                            </Button>

                            <Button size="lg" variant="outline" class="flex-1 flex justify-between"
                                @click="handleWritingGrade(2)">
                                <span>Good</span>
                                <Kbd class="opacity-60">3</Kbd>
                            </Button>

                            <Button size="lg" class="flex-1 flex justify-between" @click="handleWritingGrade(3)">
                                <span>Easy</span>
                                <Kbd class="opacity-60">4</Kbd>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <template v-else>
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

                    <div v-else class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <Button size="lg" variant="destructive" class="flex-1 flex justify-between"
                                @click="study.grade(0)">
                                <span>Again</span>
                                <Kbd class="opacity-60">1</Kbd>
                            </Button>

                            <Button size="lg" variant="outline" class="flex-1 flex justify-between"
                                @click="study.grade(1)">
                                <span>Hard</span>
                                <Kbd class="opacity-60">2</Kbd>
                            </Button>

                            <Button size="lg" variant="outline" class="flex-1 flex justify-between"
                                @click="study.grade(2)">
                                <span>Good</span>
                                <Kbd class="opacity-60">3</Kbd>
                            </Button>

                            <Button size="lg" class="flex-1 flex justify-between" @click="study.grade(3)">
                                <span>Easy</span>
                                <Kbd class="opacity-60">4</Kbd>
                            </Button>
                        </div>

                        <Button size="lg" variant="ghost" class="w-full flex justify-between"
                            @click="study.suspendCurrent">
                            <span>Suspend</span>
                            <Kbd class="opacity-60">S</Kbd>
                        </Button>
                    </div>
                </div>
            </template>
        </div>

        <SessionSummary v-else-if="study.completed" />
    </Page>
</template>
