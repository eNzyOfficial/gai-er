<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStudyStore } from '@/stores/study'
import { useSrsStore } from '@/stores/srs'
import WritingCanvas from '@/components/WritingCanvas.vue'
import type { Flashcard } from '@/types'
import PeekPhase from '@/components/flashcard/writing/PeekPhase.vue'
import DrawPhase from '@/components/flashcard/writing/DrawPhase.vue'
import ReviewPhase from '@/components/flashcard/writing/ReviewPhase.vue'

type Phase = 'peek' | 'draw' | 'review'

const props = defineProps<{ card: Flashcard }>()
const study = useStudyStore()
const srs = useSrsStore()

const srsEntry = computed(() => srs.get(props.card.id))

const autoSkipPeek = computed(() => (srsEntry.value?.repetition ?? 0) >= 4)
const ghostByDefault = computed(() => (srsEntry.value?.repetition ?? 0) < 2)

const phase = ref<Phase>('peek')
const hintActive = ref(ghostByDefault.value)
const canvasRef = ref<InstanceType<typeof WritingCanvas> | null>(null)
const drawingSnapshot = ref<string | null>(null)

watch(
    () => props.card.id,
    () => {
        phase.value = autoSkipPeek.value ? 'draw' : 'peek'
        hintActive.value = ghostByDefault.value
        canvasRef.value?.clear()
    },
    { immediate: true }
)

function begin() {
    phase.value = 'draw'
}

function reveal(snapshot: string | null) {
    drawingSnapshot.value = snapshot
    study.reveal()
    phase.value = 'review'
    hintActive.value = true
}
</script>

<template>
    <PeekPhase v-if="phase === 'peek'" :card="card" @begin="begin" />

    <DrawPhase v-else-if="phase === 'draw'" :card="card" :hint-active="hintActive" @submit="reveal" />

    <ReviewPhase v-else :card="card" :drawing="drawingSnapshot" />
</template>
