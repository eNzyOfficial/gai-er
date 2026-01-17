<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import Header from "@/components/Header.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import InfoRow from "@/components/InfoRow.vue";

const filter = ref<"mark" | "consonant" | "vowel" | "number">("consonant");
const alphabet = useAlphabetStore();

watch(filter, () => {
    selectedCardIndex.value = 0;
});

const filteredCards = computed(() => alphabet.cards.filter(c => c.type === filter.value)
);

const selectedCardIndex = ref<number | null>(0);
const currentCard = computed(() =>
    filteredCards.value[selectedCardIndex.value ?? 0]
);

</script>

<template>
    <div class="h-screen flex flex-col">
        <Header title="Character Browser" back-to="overview" />
        <div class="grow p-6 flex flex-col gap-4">
            <Tabs v-model="filter">
                <TabsList>
                    <TabsTrigger value="consonant">Consonants</TabsTrigger>
                    <TabsTrigger value="vowel">Vowels</TabsTrigger>
                    <TabsTrigger value="number">Numbers</TabsTrigger>
                    <TabsTrigger value="mark">Marks</TabsTrigger>
                </TabsList>
            </Tabs>

            <div class="flex-1 p-4 border rounded flex flex-col gap-4 items-center justify-center">
                <div class="flex-1 flex flex-col gap-2 justify-center">
                    <h2 class="text-6xl sm:text-8xl font-semibold text-center leading-none">
                        {{ currentCard.character }}
                    </h2>
                    <p class="text-muted-foreground text-xs sm:text-sm text-center">
                        {{ currentCard.name }}
                    </p>
                </div>

                <Separator />

                <div class="flex gap-6 items-center justify-between py-6">
                    <div class="grow flex flex-col space-y-2 text-center p-6 border rounded-md">
                        <div class="text-sm sm:text-lg">
                            {{ currentCard?.example }}
                        </div>
                        <div class="text-muted-foreground text-xs sm:text-sm">
                            {{ currentCard?.example_english }}
                        </div>
                    </div>

                    <div class="space-y-3 text-xs sm:text-sm">
                        <InfoRow label="Type" :value="currentCard.type" />

                        <InfoRow v-if="currentCard?.class" label="Class" :value="currentCard.class" />

                        <InfoRow v-if="currentCard?.ipa" label="IPA" :value="currentCard.ipa" />

                        <InfoRow v-if="currentCard?.is_live ?? null !== null" label="Live / Dead"
                            :value="currentCard.is_live ? 'Live' : 'Dead'" />

                        <InfoRow v-if="currentCard?.is_short ?? null !== null" label="Length"
                            :value="currentCard.is_short ? 'Short' : 'Long'" />

                        <InfoRow v-if="currentCard?.final_consonant ?? null !== null" label="Final Consonant"
                            :value="currentCard.final_consonant" />
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-9 sm:grid-cols-9 md:grid-cols-12 gap-1 text-xs">
                <div v-for="(card, index) in filteredCards" :key="card.character"
                    class="cursor-pointer p-2 border text-center rounded" :class="{
                        'bg-slate-900 text-white': selectedCardIndex === index
                    }" @click="selectedCardIndex = index"> {{
                        card.character }}
                </div>
            </div>
        </div>
    </div>
</template>
