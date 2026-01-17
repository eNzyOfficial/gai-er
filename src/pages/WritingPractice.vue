<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import { useStudyStore } from "@/stores/study";
import { buildFlashcard } from "@/lib/flashcardFactory";
import { makeStudyItem } from "@/lib/makeStudyItem";
import Header from "@/components/Headerr.vue";
import WritingCanvas from "@/components/WritingCanvas.vue";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import SessionSummary from "@/components/SessionSummary.vue";
import { Card } from "@/components/ui/card";

const alphabet = useAlphabetStore();
const srs = useSrsStore();
const study = useStudyStore();

type Phase = 'peek' | 'draw' | 'review';
const phase = ref<Phase>('peek');
const hintActive = ref(false);
const canvasRef = ref<InstanceType<typeof WritingCanvas> | null>(null);

const currentCard = computed(() => study.current);

const currentSrsEntry = computed(() => {
    if (!currentCard.value) return null;
    return srs.get(currentCard.value.id) || null;
});

const shouldAutoSkipPeek = computed(() => {
    return (currentSrsEntry.value?.repetition ?? 0) >= 4;
});

const shouldShowGhostByDefault = computed(() => {
    return (currentSrsEntry.value?.repetition ?? 0) < 2;
});

function startSession() {
    // For now, let's practice consonants and vowels that haven't been "mastered" in writing
    const items = alphabet.cards
        .filter(c => c.type === 'consonant' || c.type === 'vowel')
        .map(c => makeStudyItem('alphabet', c.character, 'writing'))
        .filter(item => {
            const entry = srs.get(item.id);
            return !entry || (entry.nextReviewAt && entry.nextReviewAt <= Date.now());
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    // If no due items, just pick 10 random ones
    if (items.length === 0) {
        const randomItems = alphabet.cards
            .filter(c => (c.type === 'consonant' || c.type === 'vowel') && !c.character.includes('อ')) // Filter out placeholders if any, though here it might be needed
            .map(c => makeStudyItem('alphabet', c.character, 'writing'))
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
        study.start(randomItems.map(buildFlashcard));
    } else {
        study.start(items.map(buildFlashcard));
    }

    if (study.queue.length > 0) {
        initCard();
    }
}

function initCard() {
    if (shouldAutoSkipPeek.value) {
        phase.value = 'draw';
    } else {
        phase.value = 'peek';
        setTimeout(() => {
            playAudio();
        }, 300);
    }
    hintActive.value = shouldShowGhostByDefault.value;
}

function playAudio() {
    if (!currentCard.value) return;
    const char = alphabet.byCharacter(currentCard.value.studyItem.entityId);
    if (char?.audio) {
        const audio = new Audio(`/audio/${char.audio}`);
        audio.play().catch(e => console.error("Failed to play audio:", e));
    }
}

function beginWriting() {
    phase.value = 'draw';
}

function toggleHint() {
    if (phase.value !== 'draw') return;

    if (shouldShowGhostByDefault.value) {
        // If it's on by default, toggle it
        hintActive.value = !hintActive.value;
    } else {
        // If it's off by default, show it temporarily
        hintActive.value = true;
        setTimeout(() => {
            if (phase.value === 'draw' && !shouldShowGhostByDefault.value) {
                hintActive.value = false;
            }
        }, 2000);
    }
}

const cleanPrompt = computed(() => {
    if (!currentCard.value) return '';
    if (typeof currentCard.value.prompt !== 'string') return '';
    return currentCard.value.prompt.replace('sara ', '');
});

const cleanAnswer = computed(() => {
    if (!currentCard.value) return '';
    if (typeof currentCard.value.answer !== 'string') return '';
    // If it's saras, they often have a placeholder 'อ'
    return currentCard.value.answer.replace('อ', '');
});

function handleGrade(confidence: 0 | 1 | 2 | 3) {
    study.grade(confidence);
    canvasRef.value?.clear();
    if (!study.completed) {
        initCard();
    }
}

function reveal() {
    if (phase.value === 'review') return;
    study.reveal();
    phase.value = 'review';
    hintActive.value = true;
}

function handleKeydown(e: KeyboardEvent) {
    if (study.completed) return;

    if (["1", "2", "3", "4", " ", "Enter", "h", "a"].includes(e.key)) {
        e.preventDefault();
    }

    if (phase.value === 'peek') {
        if (e.key === " " || e.key === "Enter") {
            beginWriting();
        }
        if (e.key === "a") {
            playAudio();
        }
        return;
    }

    if (phase.value === 'draw') {
        if (e.key === " " || e.key === "Enter") {
            reveal();
        }
        if (e.key === "h") {
            toggleHint();
        }
        if (e.key === "a") {
            playAudio();
        }
        return;
    }

    if (phase.value === 'review') {
        if (e.key === "1") handleGrade(0);
        if (e.key === "2") handleGrade(1);
        if (e.key === "3") handleGrade(2);
        if (e.key === "4") handleGrade(3);
        if (e.key === "a") {
            playAudio();
        }
    }
}

onMounted(() => {
    startSession();
    window.addEventListener("keydown", handleKeydown);
});

import { onUnmounted } from "vue";
onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    study.$reset();
});
</script>

<template>
    <div class="h-screen flex flex-col bg-background">
        <Header title="Writing Practice" back-to="alphabet.study" />

        <div v-if="study.queue.length && currentCard && !study.completed"
            class="flex flex-1 flex-col p-4 gap-4 overflow-hidden">
            <!-- Progress info -->
            <div class="flex justify-between items-center px-2">
                <div class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {{ phase === 'peek' ? 'Memorize' : phase === 'draw' ? 'Write character' : 'Compare' }}
                </div>
                <div class="text-xs text-muted-foreground whitespace-nowrap">
                    Card {{ study.index + 1 }} of {{ study.queue.length }}
                </div>
            </div>

            <div class="flex-1 min-h-0 flex flex-col gap-4">
                <!-- Peek Phase -->
                <div v-if="phase === 'peek'"
                    class="flex-1 flex flex-col items-center justify-center gap-8 bg-card border rounded-xl p-8">
                    <div class="text-center space-y-4">
                        <div class="text-9xl font-bold text-primary">{{ currentCard.answer }}</div>
                        <div class="space-y-1">
                            <component v-if="typeof currentCard.prompt !== 'string'" :is="currentCard.prompt" />
                            <div v-else class="text-3xl font-bold">{{ cleanPrompt }}</div>
                        </div>
                    </div>

                    <Button variant="secondary" size="lg" @click="playAudio" class="gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-volume-2">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </svg>
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
                    <div class="flex-1 flex flex-col gap-4 min-h-0">
                        <div class="flex-1 min-h-0 relative overflow-hidden">
                            <div class="h-full">
                                <WritingCanvas ref="canvasRef" :placeholder="hintActive ? cleanAnswer : undefined"
                                    :hint-active="hintActive && phase === 'draw'" :show-controls="phase === 'draw'"
                                    :can-draw="phase === 'draw'" />
                            </div>
                            <!-- Context info in Draw phase -->
                            <div v-if="phase === 'draw'" class="absolute top-5 left-5 pointer-events-none space-y-1">
                                <component v-if="typeof currentCard.prompt !== 'string'" :is="currentCard.prompt" />
                                <div v-else class="text-xl font-bold">{{ cleanPrompt }}</div>
                            </div>
                        </div>

                        <!-- Side-by-side Answer in Review phase -->
                        <div v-if="phase === 'review'" class="flex-1 flex flex-col gap-4">
                            <Card class="flex-1 flex items-center justify-center bg-muted/30">
                                <div class="text-[17rem] leading-none font-bold text-primary">{{ currentCard.answer }}
                                </div>
                            </Card>
                        </div>
                    </div>


                    <div class="space-y-2">
                        <!-- Draw Controls -->
                        <div v-if="phase === 'draw'" class="flex gap-2">
                            <Button variant="outline" @click="playAudio" title="Play Audio" class="px-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" class="lucide lucide-volume-2">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                            </Button>

                            <Button variant="outline" class="flex-1" @click="toggleHint">
                                <span>{{ hintActive && shouldShowGhostByDefault ? 'Hide Hint' : 'Hint' }}</span>
                                <Kbd class="ml-2 opacity-60">H</Kbd>
                            </Button>

                            <Button class="flex-2 flex justify-between" @click="reveal">
                                <span>Submit</span>
                                <Kbd class="opacity-60">Space</Kbd>
                            </Button>
                        </div>

                        <!-- Review Controls -->
                        <div v-else-if="phase === 'review'" class="space-y-4">
                            <div class="flex flex-col items-center gap-1 py-1">
                                <div class="text-sm text-muted-foreground font-medium">How did you do?</div>
                            </div>

                            <div class="flex gap-2 rt">
                                <Button size="lg" variant="destructive" class="flex-1 flex flex-col h-auto py-3"
                                    @click="handleGrade(0)">
                                    <span>Again</span>
                                    <span class="text-[10px] opacity-60">Forgot</span>
                                </Button>

                                <Button size="lg" variant="outline" class="flex-1 flex flex-col h-auto py-3"
                                    @click="handleGrade(1)">
                                    <span>Hard</span>
                                    <span class="text-[10px] opacity-60">Struggled</span>
                                </Button>

                                <Button size="lg" variant="outline" class="flex-1 flex flex-col h-auto py-3"
                                    @click="handleGrade(2)">
                                    <span>Good</span>
                                    <span class="text-[10px] opacity-60">Correct</span>
                                </Button>

                                <Button size="lg" class="flex-1 flex flex-col h-auto py-3" @click="handleGrade(3)">
                                    <span>Easy</span>
                                    <span class="text-[10px] opacity-60">Perfect</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <SessionSummary v-else-if="study.completed" />

        <div v-else-if="!study.queue.length" class="flex-1 flex items-center justify-center p-6 text-center">
            <div class="space-y-4">
                <p class="text-muted-foreground">No characters to practice right now.</p>
                <Button @click="startSession">Start Random Practice</Button>
            </div>
        </div>
    </div>
</template>
