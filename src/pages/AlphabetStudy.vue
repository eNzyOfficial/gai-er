<script setup lang="ts">
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import ActionCard from "@/components/ActionCard.vue";

const router = useRouter();
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
