<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

const props = defineProps<{
    title: string
    description: string
    badge?: string
    variant?: "primary" | "secondary"
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: "click"): void
}>()
</script>

<template>
    <button @click="emit('click')" :disabled="disabled" :class="[
        'flex items-center justify-between p-4 gap-2 border rounded-md transition hover:cursor-pointer',
        'disabled:opacity-50 disabled:cursor-default',
        variant === 'primary'
            ? 'bg-primary hover:bg-primary/90 border-primary'
            : 'hover:bg-slate-50'
    ]">
        <div class="flex flex-col flex-1 items-start gap-0 text-left">
            <h2 :class="[
                'text-lg font-semibold',
                variant === 'primary' ? 'text-white' : ''
            ]">
                {{ title }}
            </h2>

            <p :class="[
                'text-xs',
                variant === 'primary'
                    ? 'text-white/80'
                    : 'text-muted-foreground'
            ]">
                {{ description }}
            </p>
        </div>

        <span v-if="badge" :class="[
            'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
            variant === 'primary'
                ? 'bg-emerald-600 text-white'
                : 'bg-destructive text-white'
        ]">
            {{ badge }}
        </span>

        <ChevronRight :class="variant === 'primary' ? 'text-white' : 'text-muted-foreground'" />
    </button>
</template>
