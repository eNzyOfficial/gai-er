<script setup lang="ts">
import { ref, computed } from "vue";
import { useAlphabetStore } from "@/stores/alphabet";
import { analyzeTone } from "@/lib/toneCalculator";
import Header from "@/components/Headerr.vue";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const alphabet = useAlphabetStore();
const inputText = ref("");

const results = computed(() => {
    const text = inputText.value.trim();
    if (!text || text.length > 20) return [];
    return analyzeTone(text, alphabet.cards);
});
</script>

<template>
    <div class="h-screen flex flex-col bg-background">
        <Header title="Tone Calculator" back-to="overview" />

        <div class="p-6 space-y-6 overflow-y-auto">
            <div class="space-y-2">
                <p class="text-sm text-muted-foreground">
                    Enter a Thai word to see the tone rule analysis.
                </p>
                <Input v-model="inputText" placeholder="e.g. ไก่, เรียน, ภาษา" class="text-lg" />
            </div>

            <p class="text-xs text-muted-foreground">
                {{ results.length }} syllable{{ results.length > 1 ? "s" : "" }} detected
            </p>

            <div v-if="results.length > 0" class="space-y-4">
                <Card v-for="(res, idx) in results" :key="idx">
                    <CardHeader>
                        <div class="flex justify-between items-center">
                            <CardTitle class="text-3xl font-bold">{{ res.syllable }}</CardTitle>
                            <div class="flex items-center gap-2">
                                <Badge variant="outline" class="text-lg px-3 py-1">
                                    {{ res.calculatedTone }} Tone
                                </Badge>

                                <Badge :variant="res.confidence === 'high'
                                    ? 'default'
                                    : res.confidence === 'medium'
                                        ? 'secondary'
                                        : 'destructive'" class="text-xs uppercase tracking-wide">
                                    {{ res.confidence }} confidence
                                </Badge>
                            </div>

                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="mb-4">
                            <h4 class="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                Syllable breakdown
                            </h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <span class="text-xs text-muted-foreground uppercase font-semibold">Initial</span>
                                    <p class="text-lg">{{ res.initialConsonant?.character || '—' }} ({{
                                        res.consonantClass
                                        || '?' }} class)</p>
                                </div>
                                <div class="space-y-1">
                                    <span class="text-xs text-muted-foreground uppercase font-semibold">Vowel</span>
                                    <p class="text-lg">{{ res.vowel?.character || '—' }} ({{ res.vowelLength || '?' }})
                                    </p>
                                </div>
                                <div class="space-y-1">
                                    <span class="text-xs text-muted-foreground uppercase font-semibold">
                                        Final / Syllable Type
                                    </span>
                                    <p class="text-lg">
                                        {{ res.finalConsonant?.character || '—' }}
                                        ({{ res.isLive === null ? '?' : res.isLive ? 'Live syllable' : 'Dead syllable'
                                        }})
                                    </p>
                                </div>
                                <div class="space-y-1">
                                    <span class="text-xs text-muted-foreground uppercase font-semibold">Mark</span>
                                    <p class="text-lg">{{ res.toneMark?.character || 'None' }}</p>
                                </div>
                            </div>

                            <details class="border-t pt-4">
                                <summary class="cursor-pointer text-sm font-semibold">
                                    Rule Explanation
                                </summary>

                                <ul class="list-disc list-inside text-sm space-y-1 text-muted-foreground mt-2">
                                    <li v-for="(step, sIdx) in res.explanation" :key="sIdx">
                                        {{ step }}
                                    </li>
                                </ul>
                            </details>
                        </div>

                        <ul class="mt-4 space-y-1 text-sm">
                            <li v-for="step in res.ruleTrace" :key="step.id" class="flex justify-between border-b pb-1">
                                <span class="text-muted-foreground">{{ step.label }}</span>
                                <span class="font-medium">{{ step.value }}</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div v-else-if="inputText.trim()" class="text-center p-12 text-muted-foreground">
                Could not analyze this input. Try a simpler word or character.
            </div>

            <div v-else class="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                Input a Thai word to begin analysis.
            </div>
        </div>
    </div>
</template>
