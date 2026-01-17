<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useSrsStore } from "@/stores/srs";
import { useAlphabetStore } from "@/stores/alphabet";
import { parseStudyItemId } from "@/lib/parseStudyItemId";
import { alphabetGroupToVariant } from "@/lib/alphabetGroupToVariant";
import Header from "@/components/Headerr.vue";
import ActionCard from "@/components/ActionCard.vue";
import ReviewHeatmap from "@/components/ReviewHeatmap.vue";

const router = useRouter();
const srs = useSrsStore();
const alphabet = useAlphabetStore();

const reviewCount = computed(() =>
    srs.dueIds.filter(id => parseStudyItemId(id).entityType === "alphabet").length
);

const writingReviewCount = computed(() =>
    srs.dueIds.filter(id => {
        const item = parseStudyItemId(id);
        return item.entityType === "alphabet" && item.variant === "writing";
    }).length
);

const getGroupReviewCount = (group: "consonant" | "vowel" | "class" | "live_dead" | "length") => {
    const variant = alphabetGroupToVariant(group);
    const chars = alphabet.group(group);
    const charIds = new Set(chars.map(c => c.character));

    return srs.dueIds.filter(id => {
        const item = parseStudyItemId(id);
        return item.entityType === "alphabet" &&
            item.variant === variant &&
            charIds.has(item.entityId);
    }).length;
};

function goToReview() {
    if (!reviewCount.value) return;
    router.push({ name: "words.study.review" });
}
</script>

<template>
    <Header title="Flash Cards" back-to="overview" />

    <div class="flex flex-col gap-4 p-6">
        <ActionCard title="Daily Review" description="Characters and rules scheduled for review today."
            :badge="reviewCount ? `${reviewCount} due` : undefined" :disabled="!reviewCount" variant="secondary"
            @click="goToReview">
            <template #footer v-if="srs.reviewHistory">
                <div class="mt-4 pt-4 border-t">
                    <ReviewHeatmap :data="srs.reviewHistory" :days="30" />
                </div>
            </template>
        </ActionCard>

        <h1 class="text-xl font-semibold">Writing</h1>

        <ActionCard title="Writing Practice" description="Practice writing characters and track your progress."
            :badge="writingReviewCount ? `${writingReviewCount} due` : undefined" variant="primary"
            @click="router.push({ name: 'alphabet.writing' })" />

        <h1 class="text-xl font-semibold">Characters</h1>

        <ActionCard title="Consonants" description="Study consonants characters." variant="primary"
            :badge="getGroupReviewCount('consonant') ? `${getGroupReviewCount('consonant')} due` : undefined"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'consonant' } })" />

        <ActionCard title="Vowels" description="Study vowel characters." variant="primary"
            :badge="getGroupReviewCount('vowel') ? `${getGroupReviewCount('vowel')} due` : undefined"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'vowel' } })" />

        <h1 class="text-xl font-semibold">Rules</h1>

        <ActionCard title="Classes" description="Study consonsant classes."
            :badge="getGroupReviewCount('class') ? `${getGroupReviewCount('class')} due` : undefined"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'class' } })" />

        <ActionCard title="Live / Dead" description="Study dead and live final consonants."
            :badge="getGroupReviewCount('live_dead') ? `${getGroupReviewCount('live_dead')} due` : undefined"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'live_dead' } })" />

        <ActionCard title="Long / Short" description="Study long and short vowels."
            :badge="getGroupReviewCount('length') ? `${getGroupReviewCount('length')} due` : undefined"
            @click="router.push({ name: 'alphabet.study.group', params: { group: 'length' } })" />
    </div>
</template>
