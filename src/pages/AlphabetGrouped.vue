<script setup lang="ts">
import { computed, ref } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import { useSrsStore } from "@/stores/srs";
import { studyItemId } from "@/lib/studyItemId";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Page from "@/components/page/Page.vue";

type GroupBy = "class" | "live_dead" | "length";

const alphabet = useAlphabetStore();
const srs = useSrsStore();
const groupBy = ref<GroupBy>("class");

function getMasteryColor(char: string) {
    const id = studyItemId('alphabet', char, 'sound');
    const mastery = srs.getMastery(id);
    if (mastery === 'mastered') return 'bg-emerald-500';
    if (mastery === 'learning') return 'bg-blue-400';
    return 'bg-slate-200 dark:bg-slate-700';
}

/**
 * Only consonants for now.
 * You can later conditionally change this per grouping.
 */
const consonants = computed(() =>
    alphabet.cards.filter(c => groupBy.value === 'length' ? c.type === "vowel" : c.type === "consonant")
);

const grouped = computed(() => {
    switch (groupBy.value) {
        case "class":
            return {
                "High Class": consonants.value.filter(c => c.class === "high"),
                "Middle Class": consonants.value.filter(c => c.class === "mid"),
                "Low Class": consonants.value.filter(c => c.class === "low"),
            };

        case "live_dead":
            return {
                "Live": consonants.value.filter(c => c.is_live === true),
                "Dead": consonants.value.filter(c => c.is_live === false),
            };

        case "length":
            return {
                "Short": consonants.value.filter(c => c.is_short === true),
                "Long": consonants.value.filter(c => c.is_short === false),
            };
    }
});
</script>

<template>
    <Page title="Character Groups" withBack>
        <template #header />

        <div class="grow p-4 flex flex-col gap-4 h-full">

            <Tabs v-model="groupBy">
                <TabsList>
                    <TabsTrigger value="class">Class</TabsTrigger>
                    <TabsTrigger value="live_dead">Live / Dead</TabsTrigger>
                    <TabsTrigger value="length">Long / Short</TabsTrigger>
                </TabsList>
            </Tabs>

            <!-- Groups -->
            <div class="grid md:grid-cols-3 gap-6">
                <div v-for="(cards, label) in grouped" :key="label" class="flex flex-col gap-3">
                    <h2 class="font-semibold text-lg">
                        {{ label }}
                    </h2>

                    <div class="grid grid-cols-6 gap-1">
                        <div v-for="card in cards" :key="card.character"
                            class="relative cursor-pointer p-2 border rounded text-center bg-card">
                            {{ card.character }}
                            <div class="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full"
                                :class="getMasteryColor(card.character)"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </Page>
</template>
