<script setup lang="ts">
import { usePwa } from "@/composables/usePwa";
import Button from "@/components/ui/button/Button.vue";

const {
    needRefresh,
    updateSW,
    currentVersion,
    waitingVersion,
    dismissForNow,
} = usePwa();

function update() {
    updateSW(true); // true = reload page after SW activates
}
</script>

<template>
    <div v-if="needRefresh" class="bg-amber-600 text-white text-sm px-4 py-3 rounded-md
           flex flex-col gap-2">

        <div class="flex justify-between items-center">
            <p>New version available</p>

            <div class="flex gap-2">
                <Button @click="update" size="sm" variant="secondary">
                    Update
                </Button>

                <Button variant="link" size="sm" @click="dismissForNow" class="text-sm text-white">
                    Later
                </Button>
            </div>
        </div>

        <div class="text-xs opacity-70" v-if="waitingVersion">
            v{{ currentVersion }} → v{{ waitingVersion ?? "new" }}
        </div>
    </div>
</template>
