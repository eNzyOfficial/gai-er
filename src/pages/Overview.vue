<script lang="ts" setup>
import Page from '@/components/page/Page.vue';
import { Award, ChevronRight, Flame, User } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import WeeklyStreak from "@/components/WeeklyStreak.vue";
import { useSrsStore } from '@/stores/srs';
import { useVocabularyStore } from "@/stores/vocabulary.ts";
import { useRouter } from "vue-router";
import CollectionCard from '@/components/CollectionCard.vue';

const srs = useSrsStore();
const vocab = useVocabularyStore();
const router = useRouter();
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
                            <Flame class="text-amber-500" :class="{ 'fill-amber-500': srs.streak > 0 }" />
                            <span>{{ srs.streak }}</span>
                        </RouterLink>
                    </Button>
                </div>

                <div class="flex-1 text-center text-sm font-medium truncate">
                    <h1 class="text-xl font-semibold text-gray-800">ไก่เอ๋อ</h1>
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
            <WeeklyStreak />

            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold px-1">Collections ({{ vocab.collectionsWithProgress.length }})</h2>
                    <Button variant="link" as-child>
                        <router-link :to="{ name: 'words' }" class="flex gap-2">
                            <span>See all</span>
                            <ChevronRight />
                        </router-link>
                    </Button>
                </div>

                <div class="flex flex-col gap-3" v-if="vocab.collectionsWithProgress.length">
                    <CollectionCard v-for="col in vocab.collectionsWithProgress.slice(0, 3)" :key="col.id"
                        :collection="col"
                        @click="router.push({ name: 'words.study.collection', params: { collectionId: col.id } })" />
                </div>
                <div v-else class="flex flex-col items-center justify-center gap-4 border rounded-md p-4">
                    <p class="text-gray-500">No collections yet. Create one to start studying!</p>
                </div>
            </div>
        </div>

        <template #footer />
    </Page>
</template>
