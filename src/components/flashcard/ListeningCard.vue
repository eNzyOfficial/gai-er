<script setup lang="ts">
import type { Flashcard } from '@/types'
import { useStudyStore } from '@/stores/study'
import { Button } from '@/components/ui/button'
import RevealCard from './RevealCard.vue';
import { computed } from 'vue';
import { useAlphabetStore } from '@/stores/alphabet';
import AudioButton from '../AudioButton.vue';

const props = defineProps<{ card: Flashcard }>()

const study = useStudyStore()
const alphabet = useAlphabetStore();

const audioPath = computed(() => alphabet.byCharacter(props.card.studyItem.entityId)?.audio ?? 'null')
</script>

<template>
    <div class="flex-1 flex flex-col gap-4 min-h-0" v-if="!study.revealed">
        <div class="flex-1 flex flex-col gap-6 border rounded-md items-center justify-center">
            <p>
                {{ card.studyItem.entityType === 'alphabet' ? 'Which character is this?' : 'Which word is this?' }}
            </p>

            <AudioButton :path="audioPath" text />
        </div>

        <div class="flex">
            <Button class="flex-1" @click="study.reveal()">
                <span>Submit</span>
            </Button>
        </div>
    </div>

    <RevealCard v-else :card="card" />
</template>
