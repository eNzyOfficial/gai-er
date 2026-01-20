<script setup lang="ts">
defineProps<{
    modelValue: string
    options: { label: string; value: string }[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
    <div class="flex rounded-md bg-muted p-1 gap-1">
        <button v-for="opt in options" :key="opt.value" @click="emit('update:modelValue', opt.value)"
            class="flex-1 text-xs font-medium py-2 rounded-lg transition" :class="modelValue === opt.value
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'">
            {{ opt.label }}
        </button>
    </div>
</template>
