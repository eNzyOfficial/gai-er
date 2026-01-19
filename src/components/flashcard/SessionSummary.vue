<script setup lang="ts">
import { useStudyStore } from "@/stores/study"
import { useRouter } from "vue-router"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const study = useStudyStore()
const router = useRouter()

function finish() {
    router.push({ name: "overview" })
}
</script>

<template>
    <div class="flex items-center justify-center h-full">
        <Card class="w-full max-w-sm">
            <CardHeader class="text-center space-y-2">
                <CardTitle class="text-2xl">
                    Session complete
                </CardTitle>
                <p class="text-sm text-muted-foreground">
                    Nice work! Here’s how you did.
                </p>
            </CardHeader>

            <CardContent class="space-y-6">
                <!-- Accuracy -->
                <!-- <div class="space-y-2">
                    <div class="flex justify-between text-sm font-medium">
                        <span>Accuracy</span>
                        <span>{{ (study.accuracy * 100).toFixed(0) }}%</span>
                    </div>
                    <Progress :model-value="study.accuracy * 100" />
                </div> -->

                <!-- Difficulty -->
                <!-- <div class="space-y-2">
                    <div class="flex justify-between text-sm font-medium">
                        <span>Difficulty</span>
                        <span>{{ (study.difficultyScore * 100).toFixed(0) }}%</span>
                    </div>
                    <Progress :model-value="study.difficultyScore * 100" class="[&>div]:bg-destructive" />
                    <p class="text-xs text-muted-foreground">
                        Higher means the session felt harder
                    </p>
                </div> -->

                <Separator />

                <!-- Streak -->
                <!-- <div class="flex justify-between text-sm">
                    <span>Best streak</span>
                    <span class="font-medium">
                        {{ study.maxStreak }}
                    </span>
                </div> -->

                <!-- Answer breakdown -->
                <div class="grid grid-cols-4 gap-2 text-center text-sm">
                    <div class="rounded-md border p-2">
                        <div class="font-medium">
                            {{ study.stats.again }}
                        </div>
                        <div class="text-muted-foreground text-xs">
                            Again
                        </div>
                    </div>

                    <div class="rounded-md border p-2">
                        <div class="font-medium">
                            {{ study.stats.hard }}
                        </div>
                        <div class="text-muted-foreground text-xs">
                            Hard
                        </div>
                    </div>

                    <div class="rounded-md border p-2">
                        <div class="font-medium">
                            {{ study.stats.good }}
                        </div>
                        <div class="text-muted-foreground text-xs">
                            Good
                        </div>
                    </div>

                    <div class="rounded-md border p-2">
                        <div class="font-medium">
                            {{ study.stats.easy }}
                        </div>
                        <div class="text-muted-foreground text-xs">
                            Easy
                        </div>
                    </div>
                </div>

                <div class="text-center text-sm text-muted-foreground">
                    Total cards: <span class="font-medium text-foreground">
                        {{ study.stats.total }}
                    </span>
                </div>

                <Separator />

                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span>Recognition accuracy</span>
                        <span>{{ (study.recognitionAccuracy * 100).toFixed(0) }}%</span>
                    </div>

                    <div class="flex justify-between text-sm">
                        <span>Recall accuracy</span>
                        <span>{{ (study.recallAccuracy * 100).toFixed(0) }}%</span>
                    </div>
                </div>

                <!-- CTA -->
                <Button class="w-full" size="lg" @click="finish">
                    Back to overview
                </Button>
            </CardContent>
        </Card>
    </div>
</template>
