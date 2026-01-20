<script setup lang="ts">
import { computed } from 'vue';
import { useSrsStore } from '@/stores/srs';
import { useVocabularyStore } from '@/stores/vocabulary';
import Page from '@/components/page/Page.vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Calendar, BarChart3 } from 'lucide-vue-next';
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue";
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";
import ReviewHeatmap from '@/components/ReviewHeatmap.vue';

const srs = useSrsStore();
const vocab = useVocabularyStore();

// --- Stats ---
const totalReviews = computed(() => Object.values(srs.reviewHistory).reduce((a, b) => a + b, 0));
const vocabMastery = computed(() => {
  const words = vocab.words;
  if (words.length === 0) return { mastered: 0, total: 0, percentage: 0 };
  const mastered = words.filter(w => {
    const id = `word:${w.id}:TH_TO_EN`;
    return srs.getMastery(id) === 'mastered';
  }).length;
  return {
    mastered,
    total: words.length,
    percentage: (mastered / words.length) * 100
  };
});

// --- Contribution Chart (Heatmap) ---
const year = new Date().getFullYear();

// --- Weekly Bar Chart ---
const last7DaysData = computed(() => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    data.push({
      date: new Date(d),
      reviews: srs.reviewHistory[dateStr] ?? 0
    });
  }
  return data;
});

const chartConfig = {
  reviews: {
    label: "Reviews",
    color: "var(--primary)",
  }
};

type ChartData = typeof last7DaysData.value[number];
</script>

<template>
  <Page title="My Progress" with-back>
    <template #header />

    <div class="p-4 space-y-6 overflow-y-auto h-full">

      <!-- Top Stats Grid -->
      <div class="grid grid-cols-2 gap-2">
        <Card>
          <CardContent class="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <Flame class="w-8 h-8 text-orange-500" :class="{ 'fill-orange-500': srs.streak > 0 }" />
            <div class="text-2xl font-bold">{{ srs.streak }}</div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <Trophy class="w-8 h-8 text-yellow-500" />
            <div class="text-2xl font-bold">{{ srs.longestStreak }}</div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Longest Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <Calendar class="w-8 h-8 text-blue-500" />
            <div class="text-2xl font-bold">{{ srs.totalDaysPracticed }}</div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Days Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <BarChart3 class="w-8 h-8 text-emerald-500" />
            <div class="text-2xl font-bold">{{ totalReviews }}</div>
            <div class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
      </div>

      <!-- Contribution Chart -->
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium">Activity {{ year }}</CardTitle>
          <CardDescription class="text-xs">Your consistency over the year</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewHeatmap :year="new Date().getFullYear()" :review-history="srs.reviewHistory" />

        </CardContent>
      </Card>

      <!-- Mastery Stats -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold px-1">Mastery Progress</h3>
        <Card>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-muted-foreground">Alphabet</span>
                <span>{{ srs.alphabetMastery.mastered }} / {{ srs.alphabetMastery.total }}</span>
              </div>
              <Progress :model-value="srs.alphabetMastery.percentage" class="h-1.5" />
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-muted-foreground">Vocabulary</span>
                <span>{{ vocabMastery.mastered }} / {{ vocabMastery.total }}</span>
              </div>
              <Progress :model-value="vocabMastery.percentage" class="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Weekly Volume Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium">Weekly Volume</CardTitle>
          <CardDescription class="text-xs">Reviews completed in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent class="px-2">
          <ChartContainer :config="chartConfig" class="h-50 w-full">
            <VisXYContainer :data="last7DaysData" :margin="{ left: -20, right: 10, top: 10, bottom: 10 }">
              <VisGroupedBar :x="(d: ChartData) => d.date" :y="(d: ChartData) => d.reviews" color="var(--primary)"
                :bar-padding="0.2" :rounded-corners="4" />
              <VisAxis type="x" :x="(d: ChartData) => d.date" :tick-line="false" :domain-line="false" :grid-line="false"
                :tick-format="(d: number) => {
                  const date = new Date(d)
                  return date.toLocaleDateString('en-US', { weekday: 'short' })
                }" />
              <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false" :grid-line="true" />
              <ChartTooltip />
              <ChartCrosshair :template="componentToString(chartConfig, ChartTooltipContent, {
                labelFormatter(d) {
                  return new Date(d).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                },
              })" color="#0000" />
            </VisXYContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  </Page>
</template>
