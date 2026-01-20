<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

defineProps<{
    label: string,
    hint?: string
}>()
</script>

<template>
    <button
        class="flex justify-between items-center border rounded-md p-4 text-left space-y-1 bg-primary hover:bg-primary/90 border-primary hover:cursor-pointer gap-2">
        <div>
            <p class="text-sm font-medium text-white">{{ label }}</p>
            <p v-if="hint" class="text-xs text-muted">
                {{ hint }}
            </p>
        </div>

        <ChevronRight class="w-4 h-4 text-muted" />
    </button>
</template>
