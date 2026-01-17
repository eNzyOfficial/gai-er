<script lang="ts" setup>
import ActionCard from '@/components/ActionCard.vue';
import ReviewHeatmap from '@/components/ReviewHeatmap.vue';
import { useVocabularyStore } from '@/stores/vocabulary'
import { useSrsStore } from '@/stores/srs'
import { useRouter } from "vue-router";

const vocab = useVocabularyStore()
const srs = useSrsStore()
const router = useRouter()
</script>

<template>
    <div class="flex flex-col space-y-4 p-4 pb-12">
        <h1 class="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">ไก่เอ๋อ</h1>

        <div class="bg-card border rounded-xl p-4 space-y-3">
            <h2 class="text-sm font-medium text-muted-foreground">Activity</h2>
            <ReviewHeatmap :data="srs.reviewHistory" :days="70" />
        </div>

        <div class="flex flex-col space-y-1 ">
            <h1 class="text-xl font-semibold">Alphabet</h1>
        </div>

        <ActionCard title="Character Browser" description="See details about specific characters." variant="secondary"
            @click="router.push({ name: 'alphabet.browser' })" />

        <ActionCard title="Character Groups" description="See how characters are grouped together." variant="secondary"
            @click="router.push({ name: 'alphabet.grouped' })" />

        <ActionCard title="Character Flashcards" description="Study characters and their groupings." variant="secondary"
            @click="router.push({ name: 'alphabet.study' })" />

        <ActionCard title="Tone Rule Calculator" description="Explain tone rules for any Thai word." variant="secondary"
            @click="router.push({ name: 'tone.calculator' })" />

        <div class="flex flex-col space-y-1">
            <h1 class="text-xl font-semibold">Words</h1>
        </div>

        <ActionCard :title="`Word Bank (${vocab.words.length})`" description="Manage words that you'd
                like to practice." variant="primary" @click="router.push({ name: 'words' })" />

        <ActionCard title="Word Flashcards" description="Study words from the word bank."
            :badge="srs.dailyReviewItems.length ? `${srs.dailyReviewItems.length} due` : undefined" variant="secondary"
            @click="router.push({ name: 'words.study' })" />
    </div>


</template>
