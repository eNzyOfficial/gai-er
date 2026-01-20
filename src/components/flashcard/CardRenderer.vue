<script setup lang="ts">
import type { Flashcard } from '@/types'
import WritingCard from '@/components/flashcard/writing/WritingCard.vue';
import RevealCard from '@/components/flashcard/reveal/RevealCard.vue';
import ListeningCard from '@/components/flashcard/listening/ListeningCard.vue';

defineProps<{ card: Flashcard }>()
</script>

<template>
    <WritingCard v-if="card.interaction === 'writing'" :card="card" />
    <RevealCard v-else-if="card.interaction === 'reveal'" :card="card" />
    <ListeningCard v-else :card="card" />
</template>