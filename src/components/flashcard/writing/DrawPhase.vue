<script setup lang="ts">
import type { Flashcard } from '@/types'
import WritingCanvas from '@/components/WritingCanvas.vue'
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue';

const props = defineProps<{
    card: Flashcard
    hintActive: boolean
}>()

const emit = defineEmits<{
    submit: [string | null]
}>()

const canvasRef = ref<InstanceType<typeof WritingCanvas> | null>(null)

const cleanAnswer = computed(() => {
    if (typeof props.card.answer !== 'string') {
        return ''
    }

    return props.card.answer.replace('อ', '')
})

function submit() {
    const snapshot = canvasRef.value?.exportImage() ?? null
    emit('submit', snapshot)
}
</script>

<template>
    <div class="flex-1 flex flex-col gap-4 min-h-0">
        <div class="flex-1 relative overflow-hidden border rounded-md">
            <WritingCanvas ref="canvasRef" :can-draw="true" :show-controls="true" :can-hint="hintActive"
                :placeholder="cleanAnswer" />

            <div class="absolute top-5 left-5 pointer-events-none">
                <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />
            </div>
        </div>

        <div class="flex">
            <Button class="flex-1" @click="submit">
                <span>Submit</span>
            </Button>
        </div>
    </div>
</template>
