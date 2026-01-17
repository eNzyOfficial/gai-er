<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useVocabularyStore } from "@/stores/vocabulary";
import { useSrsStore } from "@/stores/srs";
import { makeStudyItem } from "@/lib/makeStudyItem";
import Header from "@/components/Header.vue";
import CollectionCard from "@/components/CollectionCard.vue";
import ActionCard from "@/components/ActionCard.vue";
import { parseStudyItemId } from "@/lib/parseStudyItemId";

const router = useRouter();
const vocab = useVocabularyStore();
const srs = useSrsStore();

const WORD_VARIANT = "TH_TO_EN" as const;

const reviewCount = computed(() =>
    srs.dueIds.filter(id => parseStudyItemId(id).entityType === "word").length
);

const newWords = computed(() =>
    vocab.words.filter(word => {
        const item = makeStudyItem("word", word.id, WORD_VARIANT);

        return !srs.get(item.id);
    })
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
            @click="goToReview" />

        <ActionCard title="New Words" description="Words you haven’t studied yet. Start small and build over time."
            :badge="`${newWords.length} new`" :disabled="!newWords.length" variant="primary" @click="goToNew" />

        <!-- Collections -->
        <div class="flex flex-col gap-4">
            <CollectionCard v-for="collection in vocab.collectionsWithProgress" :key="collection.id"
                :collection="collection" @click="goToCollection(collection.id)" />
        </div>
    </div>
</template>
