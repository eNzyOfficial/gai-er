<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

defineProps<{
    title: string,
    description: string
}>()
</script>

<template>
    <button class="w-full text-left border rounded-md p-4
           active:scale-[0.98] transition
           hover:bg-muted focus:outline-none flex justify-between items-center">
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary/3
               flex items-center justify-center text-primary">
                <slot name="icon" />
            </div>

            <div class="flex-1">
                <h3 class="font-semibold text-base">{{ title }}</h3>
                <p class="text-sm text-muted-foreground leading-snug">
                    {{ description }}
                </p>
            </div>
        </div>

        <ChevronRight class="w-4 h-4 text-muted-foreground" />
    </button>
</template>
