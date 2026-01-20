<script setup lang="ts">
import type { Flashcard } from '@/types'
import { useStudyStore } from '@/stores/study'
import ListeningFrontCard from '@/components/flashcard/listening/ListeningFrontCard.vue';
import ListeningBackCard from '@/components/flashcard/listening/ListeningBackCard.vue';

const props = defineProps<{ card: Flashcard }>()

const study = useStudyStore()
</script>

<template>
    <ListeningFrontCard v-if="!study.revealed" :card="card" />

    <ListeningBackCard v-else :card="card" />
</template>
