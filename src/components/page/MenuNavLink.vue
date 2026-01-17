<script setup lang="ts">
defineProps<{
    to: string;
}>()
</script>

<template>
    <router-link :to="to" class="flex flex-col items-center gap-1 text-xs" active-class="text-blue-500">
        <slot />
    </router-link>
</template>