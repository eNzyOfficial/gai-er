<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStudyStore } from "@/stores/study";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import type { Flashcard } from "@/types";

const props = defineProps<{
    filter?: "consonant" | "vowel" | "number";
    direction?: "CHAR_TO_INFO" | "INFO_TO_CHAR";
}>();

const study = useStudyStore();
const alphabet = useAlphabetStore();
const srs = useSrsStore();

const cards: Flashcard[] = alphabet.cards.map(char => ({
    id: char.character,
    type: "alphabet",
    source: char,
    srs: srs.get("alphabet", char.character) ?? srs.ensure("alphabet", char.character),
}));

const current = computed(() => study.currentWord);

// start session on mount
onMounted(() => {
    study.startStudy(cards);
});
</script>

<template>
    <div class="p-6 min-h-screen flex flex-col items-center">
        <div v-if="study.queue.length && current" class="space-y-6 text-center">
            <!-- front -->
            <div class="text-6xl font-bold">
                {{ props.direction === 'INFO_TO_CHAR' ? current.name : current.character }}
            </div>

            <!-- back -->
            <div v-if="study.revealed" class="space-y-2 text-left max-w-md mx-auto">
                <div><strong>Name:</strong> {{ current.name }}</div>
                <div><strong>Class:</strong> {{ current.class }}</div>
                <div><strong>Type:</strong> {{ current.type }}</div>
                <div><strong>IPA:</strong> {{ current.ipa }}</div>
                <div><strong>Live/Dead:</strong> {{ current.is_live ? "Live" : "Dead" }}</div>
                <div><strong>Example:</strong> {{ current.example }} — {{ current.example_english }}</div>

                <audio :src="current.audio" controls class="w-full mt-2"></audio>
            </div>

            <div class="space-x-2">
                <button v-if="!study.revealed" class="border px-4 py-2" @click="study.reveal">Reveal</button>

                <div v-else class="space-x-2">
                    <button @click="study.grade(0)" class="border px-4 py-2">Again</button>
                    <button @click="study.grade(1)" class="border px-4 py-2">Good</button>
                    <button @click="study.grade(2)" class="border px-4 py-2">Easy</button>
                </div>
            </div>
        </div>

        <div v-else-if="study.completed" class="text-center">
            <h2 class="text-2xl font-semibold">Session Complete 🎉</h2>
            <button class="border px-4 py-2 mt-4" @click="study.reset()">Restart</button>
        </div>
    </div>
</template>
