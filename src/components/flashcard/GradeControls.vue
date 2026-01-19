<script setup lang="ts">
import { useStudyStore } from '@/stores/study'
import { Button } from '@/components/ui/button'

const study = useStudyStore()
</script>

<template>
    <div class="flex flex-col gap-2 px-4 mb-4">
        <div class="flex justify-between gap-2">
            <Button variant="destructive" class="flex-1" @click="study.grade(0)">
                <span>Again</span>
            </Button>

            <Button variant="outline" class="flex-1" @click="study.grade(1)">
                <span>Hard</span>
            </Button>

            <Button variant="outline" class="flex-1" @click="study.grade(2)">
                <span>Good</span>
            </Button>

            <Button class="flex-1" @click="study.grade(3)">
                <span>Easy</span>
            </Button>
        </div>
    </div>
</template>
