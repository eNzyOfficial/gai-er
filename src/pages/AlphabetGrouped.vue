<script setup lang="ts">
import { computed, ref } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import Header from "@/components/Header.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GroupBy = "class" | "live_dead" | "length";

const alphabet = useAlphabetStore();
const groupBy = ref<GroupBy>("class");

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
    <div class="h-screen flex flex-col">
        <Header title="Character Groups" back-to="overview" />

        <div class="grow p-6 flex flex-col gap-6">

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
                            class="cursor-pointer p-2 border rounded text-center">
                            {{ card.character }}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
