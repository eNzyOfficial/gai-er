<script setup lang="ts">
import type { Flashcard } from '@/types'
import { useStudyStore } from '@/stores/study'
import RevealFrontCard from './RevealFrontCard.vue';
import RevealBackCard from './RevealBackCard.vue';

defineProps<{ card: Flashcard }>()
const study = useStudyStore()
</script>

<template>
    <div class="flex" :data-kind="card.kind">
        <RevealFrontCard :card="card" v-if="!study.revealed" />

        <RevealBackCard :card="card" v-else />
    </div>
</template>
