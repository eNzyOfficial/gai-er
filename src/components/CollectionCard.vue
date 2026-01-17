<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

const props = defineProps<{
    collection: any
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()
</script>

<template>
    <button
        class="border rounded-md p-4 text-left space-y-1 hover:bg-muted hover:cursor-pointer flex items-center gap-2"
        @click="$emit('click')">
        <div class="grow flex flex-col gap-1">
            <div class="flex justify-between items-center">
                <span class="font-medium text-xl">{{ collection.name }}</span>

                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <div v-if="collection.mastered" class="flex items-center gap-1">
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>{{ collection.mastered }} mastered</span>
                    </div>
                    <span>{{ collection.studied }} / {{ collection.total }} studied</span>
                    <span v-if="collection.dueToday" class="text-destructive">
                        {{ collection.dueToday }} due
                    </span>
                </div>
            </div>

            <div class="h-1.5 bg-muted rounded overflow-hidden">
                <div class="h-full bg-primary transition-all" :style="{ width: `${collection.progress * 100}%` }" />
            </div>
        </div>

        <ChevronRight />
    </button>
</template>
