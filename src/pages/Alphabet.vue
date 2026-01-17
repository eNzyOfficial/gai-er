<script setup lang="ts">
import ActionCard from '@/components/ActionCard.vue';
import Page from '@/components/page/Page.vue';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'vue-router';

const router = useRouter()
</script>

<template>
    <Page title="Alphabet">
        <template #header />

        <div class="flex flex-col space-y-4 p-4">
            <ActionCard title="Character Flashcards" description="Study characters and their groupings."
                variant="primary" @click="router.push({ name: 'alphabet.study' })" />

            <ActionCard title="Writing Practice" description="Practice writing Thai characters." variant="primary"
                @click="router.push({ name: 'alphabet.writing' })" />

            <Separator />

            <ActionCard title="Character Browser" description="See details about specific characters."
                variant="secondary" @click="router.push({ name: 'alphabet.browser' })" />

            <ActionCard title="Character Groups" description="See how characters are grouped together."
                variant="secondary" @click="router.push({ name: 'alphabet.grouped' })" />

            <Separator />

            <ActionCard title="Tone Rule Calculator" description="Explain tone rules for any Thai word."
                variant="secondary" @click="router.push({ name: 'tone.calculator' })" />
        </div>

        <template #footer />
    </Page>
</template>