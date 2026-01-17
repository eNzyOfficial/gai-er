<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import { studyItemId } from "@/lib/studyItemId";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import InfoRow from "@/components/InfoRow.vue";
import Page from "@/components/page/Page.vue";

const filter = ref<"mark" | "consonant" | "vowel" | "number">("consonant");
const alphabet = useAlphabetStore();
const srs = useSrsStore();

const filteredCards = computed(() => alphabet.cards.filter(c => c.type === filter.value)
);

const selectedCardIndex = ref<number | null>(0);
const currentCard = computed(() =>
    filteredCards.value[selectedCardIndex.value ?? 0]
);

watch(filter, () => {
    selectedCardIndex.value = 0;
});

function getMasteryColor(char: string) {
    const id = studyItemId('alphabet', char, 'sound');
    const mastery = srs.getMastery(id);
    if (mastery === 'mastered') return 'bg-emerald-500';
    if (mastery === 'learning') return 'bg-blue-400';
    return 'bg-slate-200 dark:bg-slate-700';
}
</script>

<template>
    <Page title="Character Browser" withBack>
        <template #header />

        <div class="grow p-4 flex flex-col gap-4 h-full">
            <Tabs v-model="filter">
                <TabsList>
                    <TabsTrigger value="consonant">Consonants</TabsTrigger>
                    <TabsTrigger value="vowel">Vowels</TabsTrigger>
                    <TabsTrigger value="number">Numbers</TabsTrigger>
                    <TabsTrigger value="mark">Marks</TabsTrigger>
                </TabsList>
            </Tabs>

            <div class="flex-1 border rounded flex flex-col gap-4 items-center justify-center xs:p-4 p-4 pt-0">
                <div class="flex-1 flex flex-col gap-2 justify-center">
                    <div>
                        <h2 class="text-6xl sm:text-8xl font-semibold text-center leading-none">
                            {{ currentCard?.character }}
                        </h2>
                    </div>
                    <p class="text-muted-foreground text-xs sm:text-sm text-center">
                        {{ currentCard?.name }}
                    </p>
                </div>

                <Separator />

                <div class="flex gap-6 items-center justify-between py-0 sm:py-6">
                    <div class="grow flex flex-col space-y-2 text-center p-6 border rounded-md">
                        <div class="text-sm sm:text-lg">
                            {{ currentCard?.example }}
                        </div>
                        <div class="text-muted-foreground text-xs sm:text-sm">
                            {{ currentCard?.example_english }}
                        </div>
                    </div>

                    <div class="space-y-3 text-xs sm:text-sm">
                        <InfoRow label="Type" :value="currentCard!.type" />

                        <InfoRow v-if="currentCard?.class" label="Class" :value="currentCard.class" />

                        <InfoRow v-if="currentCard?.ipa" label="IPA" :value="currentCard.ipa" />

                        <InfoRow v-if="currentCard?.is_live ?? null !== null" label="Live / Dead"
                            :value="currentCard?.is_live ? 'Live' : 'Dead'" />

                        <InfoRow v-if="currentCard?.is_short ?? null !== null" label="Length"
                            :value="currentCard?.is_short ? 'Short' : 'Long'" />

                        <InfoRow v-if="currentCard?.final_consonant ?? null !== null" label="Final Consonant"
                            :value="currentCard?.final_consonant!" />

                        <div class="pt-2">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full" :class="getMasteryColor(currentCard!.character)">
                                </div>
                                <span class="capitalize">{{ srs.getMastery(studyItemId('alphabet',
                                    currentCard!.character,
                                    'sound')) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-12 gap-1 text-xs">
                <div v-for="(card, index) in filteredCards" :key="card.character"
                    class="relative cursor-pointer p-2 border text-center rounded" :class="{
                        'bg-slate-900 text-white': selectedCardIndex === index,
                        'bg-card': selectedCardIndex !== index
                    }" @click="selectedCardIndex = index">
                    {{ card.character }}
                    <div class="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full"
                        :class="getMasteryColor(card.character)"></div>
                </div>
            </div>
        </div>
    </Page>
</template>
