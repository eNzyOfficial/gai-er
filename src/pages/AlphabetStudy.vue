<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useSrsStore } from "@/stores/srs";
import Header from "@/components/Header.vue";
import ActionCard from "@/components/ActionCard.vue";

const router = useRouter();
const vocab = useVocabularyStore();
const srs = useSrsStore();
</script>

<template>
    <Header title="Flash Cards" back-to="overview" />

    <div class="flex flex-col gap-4 p-6">
        <h1 class="text-xl font-semibold">Characters</h1>

        <ActionCard title="Consonants" description="Study consonants characters." variant="primary"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'consonant' } })" />

        <ActionCard title="Vowels" description="Study vowel characters." variant="primary"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'vowel' } })" />

        <h1 class="text-xl font-semibold">Rules</h1>

        <ActionCard title="Classes" description="Study consonsant classes."
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'class' } })" />

        <ActionCard title="Live / Dead" description="Study dead and live final consonants."
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'live_dead' } })" />

        <ActionCard title="Long / Short" description="Study long and short vowels."
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'length' } })" />
    </div>
</template>
