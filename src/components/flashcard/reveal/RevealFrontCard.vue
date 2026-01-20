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

const audioPath = computed(() => alphabet.byCharacter(props.card.studyItem.entityId)?.audio ?? 'null')
</script>

<template>
    <div class="flex-1 flex flex-col gap-4 min-h-0">
        <div class="flex-1 flex flex-col gap-6 border rounded-md items-center justify-center">
            <p>
                {{ card.studyItem.entityType === 'alphabet' ? 'Which character is this?' : 'Which word is this?' }}
            </p>

            <div class="text-5xl font-semibold tracking-tight">
                <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />
                <template v-else>{{ card.prompt }}</template>
            </div>

            <AudioButton :path="audioPath" text />
        </div>

        <div class="flex">
            <Button class="flex-1" @click="study.reveal()">
                <span>Submit</span>
            </Button>
        </div>
    </div>
</template>
