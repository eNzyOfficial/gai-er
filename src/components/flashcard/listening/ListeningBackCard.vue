<script setup lang="ts">
import type { Flashcard } from '@/types'
import { useStudyStore } from '@/stores/study'
import { Separator } from '@/components/ui/separator'

defineProps<{ card: Flashcard }>()
const study = useStudyStore()
</script>

<template>
    <div class="flex flex-col items-center justify-center border rounded-md text-center px-6 gap-6 h-full"
        :data-kind="card.kind">
        <!-- Prompt -->
        <div class="space-y-2">
            <div class="text-5xl font-semibold tracking-tight">
                <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />
                <template v-else>{{ card.prompt }}</template>
            </div>
        </div>

        <Separator v-if="study.revealed" />

        <!-- Answer -->
        <div v-if="study.revealed" class="text-3xl font-medium tracking-wide">
            <component v-if="typeof card.answer !== 'string'" :is="card.answer" />
            <template v-else>{{ card.answer }}</template>
        </div>
    </div>
</template>
