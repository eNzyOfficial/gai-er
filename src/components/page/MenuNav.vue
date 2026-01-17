<script setup lang="ts">
import { House } from 'lucide-vue-next';
import MenuNavLink from './MenuNavLink.vue';

</script>

<template>
    <nav class="bg-background flex justify-around items-center py-2">
        <menu-nav-link to="/">
            <House />
            <span class="text-xs">Home</span>
        </menu-nav-link>
    </nav>
</template>
