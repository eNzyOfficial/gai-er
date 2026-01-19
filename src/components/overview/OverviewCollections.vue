<script lang="ts" setup>
import { useVocabularyStore } from '@/stores/vocabulary';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import CollectionCard from '../CollectionCard.vue';

const vocab = useVocabularyStore();
const router = useRouter();
</script>

<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
            <h2 class="text-lg font-semibold">Word Collections ({{ vocab.collectionsWithProgress.length }})</h2>
            <Button variant="link" size="sm" as-child class="h-auto p-0">
                <router-link :to="{ name: 'words' }" class="flex items-center gap-1">
                    <span>See all</span>
                    <ChevronRight class="w-4 h-4" />
                </router-link>
            </Button>
        </div>

        <div class="flex flex-col gap-3" v-if="vocab.collectionsWithProgress.length">
            <CollectionCard v-for="col in vocab.collectionsWithProgress.slice(0, 2)" :key="col.id" :collection="col"
                @click="router.push({ name: 'words.study.collection', params: { collectionId: col.id } })" />
        </div>
        <div v-else class="flex items-center justify-center p-3 border rounded-md">
            <p class="text-sm text-muted-foreground">No collections yet.</p>
        </div>
    </div>
</template>