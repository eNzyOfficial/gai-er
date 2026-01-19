<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { Button } from '../ui/button';
import { useRouter } from 'vue-router';

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    withBack: {
        type: [Boolean, String],
        default: false,
    },
});

const router = useRouter()

function goBack() {
    if (props.withBack) {
        if (typeof props.withBack === 'string' && props.withBack.length) {
            // If `withBack` is a non-empty string, go to the specified route
            router.push({ name: props.withBack });
        } else if (window.history.length > 1) {
            // If `withBack` is a boolean (true), go back in history
            router.back();
        } else {
            // Fallback if there's no history, replace with '/'
            router.replace('/');
        }
    }
}
</script>

<template>
    <header
        class="bg-background px-4 flex h-12 items-center supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] border-b">
        <div class="w-10 flex items-center justify-start">
            <Button variant="ghost" size="icon" @click="goBack" v-if="withBack">
                <ChevronLeft class="h-5 w-5" />
            </Button>
        </div>

        <div class="flex-1 text-center text-sm font-medium truncate">
            <span>{{ title }}</span>
        </div>

        <div class="w-10 flex items-center justify-end">
            <slot name="right" />
        </div>
    </header>
</template>