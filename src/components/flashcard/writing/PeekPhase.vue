<script setup lang="ts">
import type { Flashcard } from '@/types'
import { Button } from '@/components/ui/button'
import { computed } from 'vue';

const props = defineProps<{ card: Flashcard }>()
defineEmits<{ begin: [] }>()

const questionLabel = computed(() => {
    const item = props.card.studyItem;
    if (item.entityType === 'word') {
        return 'Draw the following word.';
    }
    return 'Draw the following character.';
})
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-8 border rounded-md p-4">
        <h1 class="text-xl font-bold">{{ questionLabel }}</h1>

        <div class="text-center space-y-4">
            <div class="text-9xl leading-none font-bold text-primary">{{ card.answer }}</div>
        </div>


        <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />

        <Button class="w-full max-w-xs text-xl py-8 flex" @click="$emit('begin')">
            <span>Begin Writing</span>
        </Button>
    </div>
</template>
