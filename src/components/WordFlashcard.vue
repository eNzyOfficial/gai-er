<script setup lang="ts">
import { computed } from "vue";
import { useStudyStore } from "@/stores/study";
import type { Flashcard, Word } from "@/types";
import { Separator } from "./ui/separator";

const props = defineProps<{ card: Flashcard }>();
const study = useStudyStore();

const word = computed(() => props.card.source as Word);
</script>

<template>
    <div class="flex flex-col items-center justify-center text-center px-6 transition-colors duration-200 gap-6">
        <!-- Prompt -->
        <div class="space-y-2">
            <div class="text-5xl font-semibold tracking-tight">
                {{ study.direction === "EN_TO_TH" ? word.meaning : word.thai }}
            </div>

            <div class="text-sm uppercase tracking-widest text-muted-foreground">
                {{ study.direction === "EN_TO_TH" ? 'English' : 'Thai' }}
            </div>
        </div>

        <Separator v-if="study.revealed" />

        <!-- Reveal -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0">
            <div v-if="study.revealed" class="space-y-2">
                <div class="text-3xl font-medium tracking-wide">
                    {{ study.direction === "EN_TO_TH" ? word.thai : word.meaning }}
                </div>

                <div class="text-base text-muted-foreground">
                    {{ word.transliteration }}
                </div>
            </div>
        </transition>
    </div>
</template>
