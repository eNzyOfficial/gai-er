<script setup lang="ts">
import type { Flashcard } from '@/types'

defineProps<{
    card: Flashcard
    drawing: string | null
}>()
</script>

<template>
    <div class="flex flex-col gap-4 h-full">
        <!-- User drawing -->
        <div class="flex-1 border rounded-md flex items-center justify-center bg-muted/20 p-4">
            <img v-if="drawing" :src="drawing" class="max-h-full max-w-full object-contain" />
            <span v-else class="text-muted-foreground text-sm">
                No drawing
            </span>
        </div>

        <!-- Correct answer -->
        <div class="flex-1 border rounded-md flex items-center justify-center">
            <div class="text-9xl font-bold text-primary">
                {{ card.answer }}
            </div>
        </div>
    </div>

</template>