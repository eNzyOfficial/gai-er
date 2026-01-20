<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Volume2, Square } from 'lucide-vue-next'
import { computed, ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
    path?: string | null,
    text?: boolean
}>()

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

const fullPath = computed(() =>
    props.path ? `/audio/female/${props.path}` : null
)

watch(fullPath, (newPath) => {
    stopAudio()

    if (newPath) {
        audio.value = new Audio(newPath)
        audio.value.onended = () => {
            isPlaying.value = false
        }
    }
}, { immediate: true })

function playAudio() {
    if (!audio.value) return

    audio.value.currentTime = 0
    audio.value
        .play()
        .then(() => {
            isPlaying.value = true
        })
        .catch(err => {
            console.error('Failed to play audio:', fullPath.value, err)
        })
}

function stopAudio() {
    if (!audio.value) return

    audio.value.pause()
    audio.value.currentTime = 0
    isPlaying.value = false
}

function toggleAudio() {
    if (isPlaying.value) {
        stopAudio()
    } else {
        playAudio()
    }
}

onUnmounted(() => {
    stopAudio()
    audio.value = null
})
</script>


<template>
    <Button v-if="path" variant="secondary" size="lg" class="gap-2" @click="toggleAudio">
        <slot :isPlaying="isPlaying">
            <div v-if="text">
                <p v-if="!isPlaying">Play</p>
                <p v-else>Stop</p>
            </div>
            <div v-else>
                <Volume2 v-if="!isPlaying" class="w-5 h-5" />
                <Square v-else class="w-5 h-5" />
            </div>
        </slot>
    </Button>
</template>