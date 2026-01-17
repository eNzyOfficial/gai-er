<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { Button } from '../ui/button';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    showBackButton: {
        type: Boolean,
        default: true,
    },
});
</script>

<template>
    <header
        class="bg-background px-2 flex h-12 items-center supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] border-b">
        <div class="w-10 flex items-center justify-start">
            <Button variant="ghost" size="icon" as-child>
                <router-link v-if="showBackButton" to="/" class="mr-4">
                    <ChevronLeft class="h-5 w-5" />
                </router-link>
            </Button>
        </div>

        <div class="flex-1 text-center text-sm font-medium truncate">
            <h1 class="text-lg font-semibold">{{ title }}</h1>
        </div>

        <div class="w-10 flex items-center justify-end">
            <slot name="right" />
        </div>
    </header>
</template>