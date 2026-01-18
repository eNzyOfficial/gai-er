<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button';
import { useSrsStore } from '@/stores/srs';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useRouter } from 'vue-router';
import { makeStudyItem } from '@/lib/makeStudyItem';

const srs = useSrsStore();
const vocab = useVocabularyStore();
const router = useRouter();

interface Day {
  name: string
  date: string // YYYY-MM-DD
  dayOfMonth: number
  checked: boolean
  isToday: boolean
}

const days = computed<Day[]>(() => {
  const result: Day[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Find Monday of the current week
  const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    result.push({
      name: dayNames[i]!,
      date: dateStr!,
      dayOfMonth: d.getDate(),
      checked: (srs.reviewHistory[dateStr!] ?? 0) > 0,
      isToday: dateStr === todayStr
    });
  }

  return result;
});

const isTodayDone = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0];
  return (srs.reviewHistory[todayStr!] ?? 0) > 0;
});

const dueCount = computed(() => srs.dailyReviewItems.length);

const newWordsCount = computed(() => 
  vocab.words.filter(word => {
    const item = makeStudyItem("word", word.id, "TH_TO_EN");
    return !srs.get(item.id);
  }).length
);

const statusText = computed(() => {
  if (dueCount.value > 0) {
    return `${dueCount.value} reviews left for today`;
  }
  return "You're all caught up!";
});

const buttonLabel = computed(() => {
  if (dueCount.value > 0) {
    return isTodayDone.value ? 'Continue Review' : 'Start Daily Review';
  }
  return newWordsCount.value > 0 ? 'Study New Words' : 'Practice More';
});

function handleAction() {
  if (dueCount.value > 0) {
    router.push({ name: 'words.study.review' });
  } else if (newWordsCount.value > 0) {
    router.push({ name: 'words.study.new' });
  } else {
    // If caught up and no new words, maybe go to study overview or just alphabet
    router.push({ name: 'words.study' });
  }
}
</script>

<template>
  <div class="p-4 border rounded-md bg-card">
    <div class="flex justify-between items-center mb-2 px-1">
      <h3 class="font-medium text-sm">Review Progress</h3>
      <span class="text-xs text-muted-foreground">{{ statusText }}</span>
    </div>
    <div class="py-4 grid grid-cols-7 gap-2 sm:gap-4">
      <div v-for="(day, index) in days" :key="index" class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium" :class="day.isToday ? 'text-primary' : 'text-muted-foreground'">{{ day.name }}</span>
        <div
            :class="[
                'h-9 w-9 rounded-full text-sm flex items-center justify-center border transition-colors',
                day.checked ? 'bg-primary border-primary text-primary-foreground' : 'bg-background text-muted-foreground',
                day.isToday && !day.checked ? 'border-primary' : ''
            ]"
        >
          <svg v-if="day.checked" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
          <span v-else :class="day.isToday ? 'text-primary font-bold' : ''">{{ day.dayOfMonth }}</span>
        </div>
      </div>
    </div>

    <!-- Check-in Button -->
    <div class="text-center mt-2">
      <Button 
        class="w-full h-10" 
        variant="default"
        @click="handleAction"
      >
        {{ buttonLabel }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
</style>
