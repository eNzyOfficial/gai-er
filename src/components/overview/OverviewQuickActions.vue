<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { Search, LayoutGrid, Calculator } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const router = useRouter();
</script>

<template>
    <div class="grid grid-cols-3 gap-3">
        <Button variant="secondary" class="flex flex-col items-center justify-center h-20 gap-1.5 px-2 text-center"
            @click="router.push({ name: 'alphabet.browser' })">
            <Search class="w-5 h-5" />
            <span class="text-[10px] leading-tight font-medium">Character Browser</span>
        </Button>

        <Button variant="secondary" class="flex flex-col items-center justify-center h-20 gap-1.5 px-2 text-center"
            @click="router.push({ name: 'alphabet.grouped' })">
            <LayoutGrid class="w-5 h-5" />
            <span class="text-[10px] leading-tight font-medium">Character Groups</span>
        </Button>

        <Button variant="secondary" class="flex flex-col items-center justify-center h-20 gap-1.5 px-2 text-center"
            @click="router.push({ name: 'tone.calculator' })">
            <Calculator class="w-5 h-5" />
            <span class="text-[10px] leading-tight font-medium">Tone Calculator</span>
        </Button>
    </div>
</template>