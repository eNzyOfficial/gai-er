<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useStudyStore } from "@/stores/study";
import SessionSummary from "@/components/flashcard/SessionSummary.vue";

import { buildFlashcard } from "@/lib/flashcardFactory";
import type { AlphabetGroup, StudyVariant } from "@/types";
import Page from "@/components/page/Page.vue";
import { buildStudySession } from "@/lib/buildStudySession";
import GradeControls from "@/components/flashcard/GradeControls.vue";
import CardRenderer from "@/components/flashcard/CardRenderer.vue";
import Button from "@/components/ui/button/Button.vue";
import Header from "@/components/page/Header.vue";
import ConfirmedButton from "@/components/ConfirmedButton.vue";

const props = defineProps<{
    mode: "new" | "review" | "collection" | "alphabet";
    collectionId?: string;
    group?: AlphabetGroup;
    variant?: StudyVariant;
    variantFilters?: string[];
}>();

const study = useStudyStore();

onMounted(() => {
    const items = buildStudySession({
        mode: props.mode,
        collectionId: props.collectionId,
        group: props.group,
        variantFilters: props.variantFilters,
        variant: props.variant
    });

    const cards = items.map(buildFlashcard);

    study.start(cards);
});

onUnmounted(() => {
    study.$reset();
});
</script>


<template>
    <Page title="Flash Cards" with-back no-scroll>
        <template #header>
            <Header title="Flash Cards" with-back no-scroll>
                <template #right>
                    <ConfirmedButton title="Suspend flashcard"
                        description="By suspending this card, it will no longer appear in your review list."
                        @confirm="study.suspendCurrent" v-slot="{ open }">
                        <Button size="sm" variant="outline" @click="open">
                            <span>Suspend</span>
                        </Button>
                    </ConfirmedButton>
                </template>
            </Header>
        </template>

        <div class="h-full p-4">
            <CardRenderer :card="study.current" class="h-full" v-if="study.queue.length && study.current" />
            <SessionSummary v-else-if="study.completed" />
        </div>

        <template #footer>
            <GradeControls v-if="study.revealed" />
            <div v-else></div>
        </template>
    </Page>
</template>
