<script setup lang="ts">
import type { Flashcard } from '@/types'

defineProps<{ card: Flashcard }>()
</script>

<template>
    <div class="flex-1 flex flex-col gap-4 min-h-0">
        <div class="flex-1 flex flex-col gap-6 border rounded-md items-center justify-center">
            <div class="text-3xl font-medium tracking-wide">
                <component v-if="typeof card.answer !== 'string'" :is="card.answer" />
                <template v-else>{{ card.answer }}</template>
            </div>
        </div>
    </div>
</template>
