<script setup lang="ts">
import { computed } from "vue";
import { useStudyStore } from "@/stores/study";
import type { Alphabet, Flashcard } from "@/types";
import { Separator } from "./ui/separator";

const props = defineProps<{
    card: Flashcard,
    group: "consonant"
    | "vowel"
    | "length"
    | "live_dead"
    | "class"
}>();
const study = useStudyStore();

const character = computed(() => props.card.source as Alphabet);
</script>

<template>
    <div class="flex flex-col items-center justify-center text-center px-6 transition-colors duration-200 gap-6">
        <!-- Prompt -->
        <div class="space-y-2">
            <div class="text-5xl font-semibold tracking-tight">
                {{ character.character }}
            </div>
        </div>

        <Separator v-if="study.revealed" />

        <!-- Reveal -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0">
            <div v-if="study.revealed" class="grow text-3xl font-medium tracking-wide text-center">
                <span v-if="group === 'class'">{{ character.class }}</span>
                <span v-else-if="group === 'consonant'">{{ character.name }}</span>
                <span v-else-if="group === 'vowel'">{{ character.name }}</span>
                <span v-else-if="group === 'length'">{{ character.is_short ? 'Short' : 'Long' }}</span>
                <span v-else-if="group === 'live_dead'">{{ character.is_live ? 'Live' : 'Dead' }}</span>
            </div>
        </transition>
    </div>
</template>
