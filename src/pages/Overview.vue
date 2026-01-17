<script lang="ts" setup>
import ActionCard from '@/components/ActionCard.vue';
import { useSrsStore } from '@/stores/srs';
import { useVocabularyStore } from '@/stores/vocabulary'
import { useRouter } from "vue-router";

const vocab = useVocabularyStore()
const srs = useSrsStore()
const router = useRouter()
</script>

<template>
    <div class="flex flex-col space-y-4 p-4">
        <h1 class="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">ไก่เอ๋อ</h1>

        <div class="flex flex-col space-y-1">
            <h1 class="text-xl font-semibold">Alphabet</h1>
        </div>

        <ActionCard title="Character Browser" description="See details about specific characters." variant="secondary"
            @click="router.push({ name: 'alphabet.browser' })" />

        <ActionCard title="Character Groups" description="See how characters are grouped together." variant="secondary"
            @click="router.push({ name: 'alphabet.grouped' })" />

        <ActionCard title="Character Flashcards" description="Study characters and their groupings." variant="secondary"
            @click="router.push({ name: 'alphabet.study' })" />

        <div class="flex flex-col space-y-1">
            <h1 class="text-xl font-semibold">Words</h1>
        </div>

        <ActionCard :title="`Word Bank (${vocab.words.length})`" description="Manage words that you'd
                like to practice." variant="primary" @click="router.push({ name: 'words' })" />

        <ActionCard title="Word Flashcards" description="Study words from the word bank." :badge="'?? due'"
            variant="secondary" @click="router.push({ name: 'words.study' })" />
    </div>


</template>