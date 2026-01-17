<script setup lang="ts">
import Header from './Header.vue';
import MenuNav from './MenuNav.vue';

const props = defineProps({
    title: {
        type: String,
        required: false,
    },
    showBackButton: {
        type: Boolean,
        default: true,
    },
    noScroll: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div class="flex flex-col h-screen">
        <!-- Header Slot -->
        <header v-if="$slots.header">
            <slot name="header">
                <!-- Default Header if slot not provided -->
                <Header v-if="title" :title="title" :showBackButton="showBackButton" />
            </slot>
        </header>

        <!-- Main Content Area -->
        <div :class="noScroll ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto'">
            <slot />
        </div>

        <!-- Footer Slot (Only shown if footer slot is provided) -->
        <footer v-if="$slots.footer">
            <slot name="footer">
                <!-- Default Footer if slot not provided -->
                <MenuNav />
            </slot>
        </footer>
    </div>
</template>