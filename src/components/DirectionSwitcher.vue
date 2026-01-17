<script setup lang="ts">
import { useStudyStore } from "@/stores/study";
import { Button } from "@/components/ui/button";

const study = useStudyStore();

function toggle() {
    if (!study.direction) return;

    study.restartWithDirection(
        study.direction === "EN_TO_TH" ? "TH_TO_EN" : "EN_TO_TH"
    );
}
</script>

<template>
    <div class="flex items-center justify-center gap-2 text-sm">
        <span :class="study.direction === 'EN_TO_TH' ? 'font-semibold' : 'text-muted-foreground'">
            English → Thai
        </span>

        <Button variant="ghost" size="icon" :disabled="study.revealed || study.completed" @click="toggle"
            title="Switch study direction">
            ⇄
        </Button>

        <span :class="study.direction === 'TH_TO_EN' ? 'font-semibold' : 'text-muted-foreground'">
            Thai → English
        </span>
    </div>
</template>
