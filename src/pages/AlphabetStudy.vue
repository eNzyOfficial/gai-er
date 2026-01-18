<script setup lang="ts">
import { useRouter } from "vue-router";
import { useSrsStore } from "@/stores/srs";
import { useAlphabetStore } from "@/stores/alphabet";
import { parseStudyItemId } from "@/lib/parseStudyItemId";
import { alphabetGroupToVariant } from "@/lib/alphabetGroupToVariant";
import ActionCard from "@/components/ActionCard.vue";
import Page from "@/components/page/Page.vue";

const router = useRouter();
const srs = useSrsStore();
const alphabet = useAlphabetStore();

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
</script>

<template>
    <Page title="Flash Cards" with-back>
        <template #header />

        <div class="flex flex-col gap-4 p-6 h-full">
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
    </Page>
</template>
