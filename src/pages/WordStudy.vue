<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useSrsStore } from "@/stores/srs";
import { makeStudyItem } from "@/lib/makeStudyItem";
import Header from "@/components/Headerr.vue";
import CollectionCard from "@/components/CollectionCard.vue";
import ActionCard from "@/components/ActionCard.vue";
import ReviewHeatmap from "@/components/ReviewHeatmap.vue";

const router = useRouter();
const vocab = useVocabularyStore();
const srs = useSrsStore();

const WORD_VARIANT = "TH_TO_EN" as const;

const reviewCount = computed(() =>
    srs.dailyReviewItems.length
);

const newWords = computed(() =>
    vocab.words.filter(word => {
        const item = makeStudyItem("word", word.id, WORD_VARIANT);

        return !srs.get(item.id);
    })
);

const masteredCount = computed(() =>
    vocab.words.filter(word => {
        const id = makeStudyItem("word", word.id, WORD_VARIANT).id;
        return srs.getMastery(id) === 'mastered';
    }).length
);

function goToReview() {
    if (!reviewCount.value) return;
    router.push({ name: "words.study.review" });
}

function goToNew() {
    if (!newWords.value.length) return;
    router.push({ name: "words.study.new" });
}

function goToCollection(id: string) {
    router.push({
        name: "words.study.collection",
        params: { collectionId: id },
    });
}
</script>


<template>
    <Header title="Flash Cards" back-to="overview" />

    <div class="flex flex-col gap-4 p-6">
        <!-- Review Button -->
        <ActionCard title="Daily Review" description="Words you’ve studied before and are scheduled for review today."
            :badge="reviewCount ? `${reviewCount} due` : undefined" :disabled="!reviewCount" variant="secondary"
            @click="goToReview">
            <template #footer v-if="srs.reviewHistory">
                <div class="mt-4 pt-4 border-t">
                    <ReviewHeatmap :data="srs.reviewHistory" :days="30" />
                </div>
            </template>
        </ActionCard>

        <ActionCard title="New Words" description="Words you haven’t studied yet. Start small and build over time."
            :badge="`${newWords.length} new`" :disabled="!newWords.length" variant="primary" @click="goToNew" />

        <div v-if="masteredCount" class="flex items-center gap-2 px-1 text-sm text-muted-foreground">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>{{ masteredCount }} words mastered</span>
        </div>

        <!-- Collections -->
        <div class="flex flex-col gap-4">
            <CollectionCard v-for="collection in vocab.collectionsWithProgress" :key="collection.id"
                :collection="collection" @click="goToCollection(collection.id)" />
        </div>
    </div>
</template>
