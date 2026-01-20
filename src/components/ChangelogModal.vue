<script setup lang="ts">
import { usePwa } from "@/composables/usePwa";

const {
    showChangelog,
    changelog,
    currentVersion,
    markSeen,
} = usePwa();

function close() {
    markSeen();
    showChangelog.value = false;
}
</script>

<template>
    <div v-if="showChangelog" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 w-96 max-w-full">
            <h2 class="text-lg font-bold mb-2">
                What’s new (v{{ currentVersion }})
            </h2>

            <ul class="list-disc pl-5 space-y-1">
                <li v-for="item in changelog[currentVersion] || []" :key="item">
                    {{ item }}
                </li>
            </ul>

            <div class="mt-4 text-right">
                <button @click="close" class="px-3 py-1 rounded bg-black text-white">
                    Got it
                </button>
            </div>
        </div>
    </div>
</template>
