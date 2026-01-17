<script setup lang="ts">
import { useStudyStore } from "@/stores/study";
import type { Flashcard } from "@/types";
import { Separator } from "@/components/ui/separator";
import WritingCanvas from "@/components/WritingCanvas.vue";
import { Pencil } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { ref, watch } from "vue";

const props = defineProps<{
    card: Flashcard;
}>();

const study = useStudyStore();
const showCanvas = ref(false);

watch(() => props.card.id, () => {
    showCanvas.value = false;
});
</script>

<template>
    <div class="flex flex-col items-center justify-center text-center px-6 gap-6 transition-colors duration-200 w-full h-full relative"
        :data-kind="card.kind">
        <!-- Writing Canvas Overlay -->
        <div v-if="showCanvas" class="absolute inset-0 z-10 p-4 bg-background flex flex-col gap-2">
            <div class="flex-1 min-h-0">
                <WritingCanvas :placeholder="typeof card.prompt === 'string' ? card.prompt : undefined" />
            </div>
            <Button variant="outline" size="sm" class="w-full" @click="showCanvas = false">
                Close Canvas
            </Button>
        </div>

        <!-- Prompt -->
        <div class="space-y-2 relative group">
            <div class="text-5xl font-semibold tracking-tight">
                <component v-if="typeof card.prompt !== 'string'" :is="card.prompt" />
                <template v-else>{{ card.prompt }}</template>
            </div>
            <Button v-if="!study.revealed && !showCanvas" variant="ghost" size="icon"
                class="absolute -top-2 -right-10 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="showCanvas = true" title="Practice Writing">
                <Pencil class="w-4 h-4" />
            </Button>
        </div>

        <Separator v-if="study.revealed" />

        <!-- Answer -->
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0">
            <div v-if="study.revealed" class="space-y-2 text-3xl font-medium tracking-wide">
                <component v-if="typeof card.answer !== 'string'" :is="card.answer" />
                <template v-else>{{ card.answer }}</template>
            </div>
        </transition>
    </div>
</template>
