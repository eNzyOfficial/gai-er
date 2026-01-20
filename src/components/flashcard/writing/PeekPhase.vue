<script setup lang="ts">
import type { Flashcard } from '@/types'
import { Button } from '@/components/ui/button'
import AudioButton from '@/components/AudioButton.vue';
import { computed } from 'vue';
import { useAlphabetStore } from '@/stores/alphabet';

const props = defineProps<{ card: Flashcard }>()
defineEmits<{ begin: [] }>()

const alphabet = useAlphabetStore();

const audioPath = computed(() => alphabet.byCharacter(props.card.studyItem.entityId)?.audio ?? 'null')
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-8 border rounded-md p-4">
        <h1>Draw the following character.</h1>

        <div class="text-center space-y-4">
            <div class="text-9xl leading-none font-bold text-primary">{{ card.answer }}</div>
        </div>


        <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />

        <AudioButton :path="audioPath" />

        <Button class="w-full max-w-xs text-xl py-8 flex" @click="$emit('begin')">
            <span>Begin Writing</span>
        </Button>
    </div>
</template>
