<script lang="ts" setup>
import ActionCard from '@/components/ActionCard.vue';
import ReviewHeatmap from '@/components/ReviewHeatmap.vue';
import { useVocabularyStore } from '@/stores/vocabulary'
import { useSrsStore } from '@/stores/srs'
import { useRouter } from "vue-router";
import Page from '@/components/page/Page.vue';
import { Award, Flame, User } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const vocab = useVocabularyStore()
const srs = useSrsStore()
const router = useRouter()
</script>

<template>
    <Page>
        <template #header>
            <header class="bg-background p-2 flex items-center">

                <div class="flex space-x-2">
                    <Button as-child>
                        <RouterLink :to="{ name: 'awards' }" class="flex items-center">
                            <Award />
                            <span>1</span>
                        </RouterLink>
                    </Button>

                    <Button variant="outline" as-child>
                        <RouterLink :to="{ name: 'streak' }" class="flex items-center">
                            <Flame class="text-amber-500" />
                            <span>1</span>
                        </RouterLink>
                    </Button>
                </div>

                <div class="flex-1 text-center text-sm font-medium truncate">
                    <h1 class="text-xl font-semibold text-gray-800">Homepage</h1>
                </div>

                <div class="flex space-x-4 justify-end">
                    <Button variant="ghost" as-child>
                        <RouterLink :to="{ name: 'profile' }" class="flex items-center">
                            <User />
                        </RouterLink>
                    </Button>
                </div>
            </header>
        </template>

        <div class="flex flex-col space-y-4 p-4">
            <div class="bg-card border rounded-xl p-4 space-y-3">
                <h2 class="text-sm font-medium text-muted-foreground">Activity</h2>
                <ReviewHeatmap :data="srs.reviewHistory" :days="70" />
            </div>

            <ActionCard :title="`Word Bank (${vocab.words.length})`" description="Manage words that you'd
                like to practice." variant="primary" @click="router.push({ name: 'words' })" />

            <ActionCard title="Word Flashcards" description="Study words from the word bank."
                :badge="srs.dailyReviewItems.length ? `${srs.dailyReviewItems.length} due` : undefined"
                variant="secondary" @click="router.push({ name: 'words.study' })" />
        </div>

        <template #footer />
    </Page>
</template>
