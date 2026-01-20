<script setup lang="ts">
import type { Flashcard } from '@/types'
import { useStudyStore } from '@/stores/study'
import { Button } from '@/components/ui/button'
import { computed } from 'vue';
import { useAlphabetStore } from '@/stores/alphabet';
import AudioButton from '@/components/AudioButton.vue';

const props = defineProps<{ card: Flashcard }>()

const study = useStudyStore()
const alphabet = useAlphabetStore();

const audioPath = computed(() => {
    if (props.card.studyItem.entityType === 'alphabet') {
        const char = alphabet.byCharacter(props.card.studyItem.entityId);
        return char?.audio ?? null
    }
    return null
})

const questionLabel = computed(() => {
    const item = props.card.studyItem;
    if (item.entityType === 'word') {
        return item.variant === 'EN_TO_TH' ? 'What is the Thai for this word?' : 'Which word is this?';
    }

    switch (item.variant) {
        case 'class': return 'Which class is this character?';
        case 'live_dead': return 'Is this a Live or Dead syllable?';
        case 'length': return 'Is this a Short or Long vowel?';
        case 'name': return 'What is the name of this character?';
        case 'sound': return 'What is the sound of this character?';
        case 'listening': return 'Which character has this sound?';
        case 'writing': return 'Identify this character.';
        default: return 'Which character is this?';
    }
})
</script>

<template>
    <div class="flex-1 flex flex-col gap-4 min-h-0">
        <div class="flex-1 flex flex-col gap-6 border rounded-md items-center justify-center">
            <p>
                {{ questionLabel }}
            </p>

            <div class="text-5xl font-semibold tracking-tight">
                <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />
                <template v-else>{{ card.prompt }}</template>
            </div>

            <AudioButton v-if="audioPath && card.studyItem.variant !== 'sound'" :path="audioPath" text />
        </div>

        <div class="flex">
            <Button class="flex-1" @click="study.reveal()">
                <span>Submit</span>
            </Button>
        </div>
    </div>
</template>
