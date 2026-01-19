<script setup lang="ts">
import type { Flashcard } from '@/types'
import WritingCard from './WritingCard.vue';
import RevealCard from './RevealCard.vue';
import ListeningCard from './ListeningCard.vue';

defineProps<{ card: Flashcard }>()
</script>

<template>
    <WritingCard v-if="card.interaction === 'writing'" :card="card" />
    <RevealCard v-else-if="card.interaction === 'reveal'" :card="card" />
    <ListeningCard v-else :card="card" />
</template>