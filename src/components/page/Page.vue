<script setup lang="ts">
import Header from './Header.vue';
import MenuNav from './MenuNav.vue';

const props = defineProps({
    title: {
        type: String,
        required: false,
    },
    withBack: {
        type: [Boolean, String],
        default: false,
    },
    noScroll: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <!-- Header Slot -->
        <header v-if="$slots.header">
            <slot name="header">
                <!-- Default Header if slot not provided -->
                <Header v-if="title" :title="title" :withBack="withBack" />
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
                <MenuNav class="border-t" />
            </slot>
        </footer>
    </div>
</template>

<style scoped>
/* Add a dynamic height adjustment to avoid page overflow when the URL bar is visible */
html,
body {
    height: 100%;
    margin: 0;
}

.flex-col {
    height: 100%;
}

.flex-1 {
    height: calc(100vh - var(--url-bar-height, 0px));
    /* Subtract URL bar height dynamically */
}

/* Safe area adjustments for devices with notches or UI interruptions */
* {
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
</style>
