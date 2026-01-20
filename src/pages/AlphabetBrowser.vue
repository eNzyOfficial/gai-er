<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import { studyItemId } from "@/lib/studyItemId";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Page from "@/components/page/Page.vue";
import CharacterInfo from "@/components/CharacterInfo.vue";

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

            <div class="flex-1 border rounded flex flex-col items-center justify-center">
                <CharacterInfo :character="currentCard?.character" />
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
