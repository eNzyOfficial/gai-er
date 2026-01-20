<script setup lang="ts">
import { studyItemId } from '@/lib/studyItemId';
import { useAlphabetStore } from '@/stores/alphabet';
import { useSrsStore } from '@/stores/srs';
import { computed } from 'vue';
import InfoRow from './InfoRow.vue';
import Separator from './ui/separator/Separator.vue';
import AudioButton from './AudioButton.vue';
import { Button } from './ui/button';
import { Check, Plus, VolumeX, Volume2, RotateCcw } from 'lucide-vue-next';

const props = defineProps<{
    character?: string
}>()

const alphabet = useAlphabetStore()
const srs = useSrsStore()

const currentCharacter = computed(() => props.character ? alphabet.byCharacter(props.character) : null)

const itemId = computed(() => currentCharacter.value ? studyItemId('alphabet', currentCharacter.value.character, 'sound') : null)
const mastery = computed(() => itemId.value ? srs.getMastery(itemId.value) : 'new')
const srsItem = computed(() => itemId.value ? srs.items[itemId.value] : null)

function getMasteryColor(char: string) {
    const m = char === currentCharacter.value?.character ? mastery.value : srs.getMastery(studyItemId('alphabet', char, 'sound'));
    if (m === 'mastered') return 'bg-emerald-500';
    if (m === 'learning') return 'bg-blue-400';
    return 'bg-slate-200 dark:bg-slate-700';
}

function addToSrs() {
    if (itemId.value) {
        srs.ensure(itemId.value);
        srs.save();
    }
}

function markAsMastered() {
    if (itemId.value) {
        const item = srs.ensure(itemId.value);
        item.interval = 31; // Mastery threshold is > 30
        item.lastReviewedAt = Date.now();
        srs.save();
    }
}

function resetProgress() {
    if (itemId.value) {
        const item = srs.ensure(itemId.value);
        item.interval = 0;
        item.repetition = 0;
        item.lastReviewedAt = undefined;
        item.nextReviewAt = Date.now();
        srs.save();
    }
}

function toggleSilence() {
    if (itemId.value) {
        if (srsItem.value?.suspended) {
            srs.unsuspend(itemId.value);
        } else {
            srs.suspend(itemId.value);
        }
    }
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

        <div class="flex flex-wrap gap-2 justify-center">
            <AudioButton :path="currentCharacter?.audio" />

            <Button v-if="mastery === 'new'" size="sm" variant="outline" @click="addToSrs">
                <Plus class="w-4 h-4 mr-2" />
                Add to SRS
            </Button>

            <div v-else>
                <Button v-if="mastery !== 'mastered'" size="sm" variant="outline" @click="markAsMastered">
                    <Check class="w-4 h-4 mr-2" />
                    Mark as Mastered
                </Button>
                <Button v-else size="sm" variant="ghost" @click="resetProgress">
                    <RotateCcw class="w-4 h-4 mr-2" />
                    Unmaster / Reset
                </Button>

                <Button v-if="mastery !== 'mastered'" size="sm" variant="outline" @click="toggleSilence">
                    <component :is="srsItem?.suspended ? Volume2 : VolumeX" class="w-4 h-4 mr-2" />
                    {{ srsItem?.suspended ? 'Unsilence' : 'Silence' }}
                </Button>
            </div>
        </div>

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
                        <span class="capitalize">{{ mastery }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
