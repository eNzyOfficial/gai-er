<script setup lang="ts">
import { studyItemId } from '@/lib/studyItemId';
import { useAlphabetStore } from '@/stores/alphabet';
import { useSrsStore } from '@/stores/srs';
import { computed } from 'vue';
import InfoRow from './InfoRow.vue';
import Separator from './ui/separator/Separator.vue';
import AudioButton from './AudioButton.vue';

const props = defineProps<{
    character?: string
}>()

const alphabet = useAlphabetStore()
const srs = useSrsStore()

const currentCharacter = computed(() => props.character ? alphabet.byCharacter(props.character) : null)

function getMasteryColor(char: string) {
    const id = studyItemId('alphabet', char, 'sound');
    const mastery = srs.getMastery(id);
    if (mastery === 'mastered') return 'bg-emerald-500';
    if (mastery === 'learning') return 'bg-blue-400';
    return 'bg-slate-200 dark:bg-slate-700';
}
</script>

<template>
    <div class="flex flex-col gap-4 items-center justify-center">
        <div class="flex-1 flex flex-col gap-2 justify-center">
            <div>
                <h2 class="text-6xl sm:text-8xl font-semibold text-center leading-none">
                    {{ currentCharacter?.character }}
                </h2>
            </div>
            <p class="text-muted-foreground text-xs sm:text-sm text-center">
                {{ currentCharacter?.name }}
            </p>
        </div>

        <AudioButton :path="currentCharacter?.audio" />

        <Separator />

        <div class="flex gap-6 items-center justify-between py-0 sm:py-6">
            <div class="grow flex flex-col space-y-2 text-center p-6 border rounded-md">
                <div class="text-sm sm:text-lg">
                    {{ currentCharacter?.example }}
                </div>
                <div class="text-muted-foreground text-xs sm:text-sm">
                    {{ currentCharacter?.example_english }}
                </div>
            </div>

            <div class="space-y-3 text-xs sm:text-sm">
                <InfoRow label="Type" :value="currentCharacter!.type" />

                <InfoRow v-if="currentCharacter?.class" label="Class" :value="currentCharacter.class" />

                <InfoRow v-if="currentCharacter?.ipa" label="IPA" :value="currentCharacter.ipa" />

                <InfoRow v-if="currentCharacter?.is_live ?? null !== null" label="Live / Dead"
                    :value="currentCharacter?.is_live ? 'Live' : 'Dead'" />

                <InfoRow v-if="currentCharacter?.is_short ?? null !== null" label="Length"
                    :value="currentCharacter?.is_short ? 'Short' : 'Long'" />

                <InfoRow v-if="currentCharacter?.final_consonant ?? null !== null" label="Final Consonant"
                    :value="currentCharacter?.final_consonant!" />

                <div class="pt-2">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full" :class="getMasteryColor(currentCharacter!.character)">
                        </div>
                        <span class="capitalize">{{ srs.getMastery(studyItemId('alphabet',
                            currentCharacter!.character,
                            'sound')) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>