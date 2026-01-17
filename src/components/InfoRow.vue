<!-- InfoRow.vue -->
<template>
    <div class="flex justify-between gap-4">
        <span class="text-muted-foreground">{{ label }}</span>
        <span class="font-medium">{{ value }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>
