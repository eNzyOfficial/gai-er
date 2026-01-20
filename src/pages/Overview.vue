<script lang="ts" setup>
import Page from '@/components/page/Page.vue';
import WeeklyStreak from "@/components/overview/WeeklyStreak.vue";
import OverviewHeader from '@/components/overview/OverviewHeader.vue';
import OverviewQuickActions from '@/components/overview/OverviewQuickActions.vue';
import OverviewAlphabetMastery from '@/components/overview/OverviewAlphabetMastery.vue';
import OverviewCollections from '@/components/overview/OverviewCollections.vue';
import PwaUpdateBanner from '@/components/PwaUpdateBanner.vue';
</script>

<template>
    <Page>
        <template #header>
            <OverviewHeader />
        </template>

        <div class="flex flex-col space-y-4 p-4">
            <PwaUpdateBanner />

            <WeeklyStreak />

            <OverviewQuickActions />

            <OverviewAlphabetMastery />

            <OverviewCollections />
        </div>

        <template #footer />
    </Page>
</template>
