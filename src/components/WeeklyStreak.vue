<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useSrsStore } from '@/stores/srs';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useRouter } from 'vue-router';
import { makeStudyItem } from '@/lib/makeStudyItem';

const srs = useSrsStore();
const vocab = useVocabularyStore();
const router = useRouter();

const showReviewDialog = ref(false);

const availableOptions = computed(() => {
  const reviews = srs.dailyReviewItems;
  const options = [
    { id: 'sound', label: 'Audio Recognition', description: 'Hear and identify characters', variants: ['sound'] },
    { id: 'writing', label: 'Writing Practice', description: 'Draw characters from memory', variants: ['writing'] },
    { id: 'meaning', label: 'Vocabulary', description: 'Thai to English / English to Thai', variants: ['TH_TO_EN', 'EN_TO_TH'] },
    { id: 'rules', label: 'Linguistic Rules', description: 'Class, Live/Dead, Length', variants: ['class', 'live_dead', 'length', 'name'] },
  ];

  return options.filter(opt => 
    reviews.some(item => opt.variants.includes(item.variant))
  );
});

const selectedVariants = ref<string[]>([]);

// Initialize selectedVariants when availableOptions changes or on mount
watch(availableOptions, (newOptions) => {
  selectedVariants.value = newOptions.map(o => o.id);
}, { immediate: true });

function toggleVariant(id: string) {
  if (selectedVariants.value.includes(id)) {
    selectedVariants.value = selectedVariants.value.filter(v => v !== id);
  } else {
    selectedVariants.value.push(id);
  }
}

function startFilteredReview() {
  showReviewDialog.value = false;
  
  // Only add variants to query if not all are selected
  const query: any = {};
  if (selectedVariants.value.length < availableOptions.value.length) {
    query.variants = selectedVariants.value.join(',');
  }

  router.push({ 
    name: 'words.study.review',
    query
  });
}

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
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
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
    
    // Use local date for the key to match how srs store saves it
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    result.push({
      name: dayNames[i]!,
      date: dateStr,
      dayOfMonth: d.getDate(),
      checked: (srs.reviewHistory[dateStr] ?? 0) > 0,
      isToday: dateStr === todayStr
    });
  }

  return result;
});

const isTodayDone = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  return (srs.reviewHistory[todayStr] ?? 0) > 0;
});

const dueCount = computed(() => srs.dailyReviewItems.length);

const filteredDueCount = computed(() => {
  const reviews = srs.dailyReviewItems;
  if (selectedVariants.value.length === availableOptions.value.length) return reviews.length;
  
  return reviews.filter(item => {
    const v = item.variant;
    if (selectedVariants.value.includes('sound') && v === 'sound') return true;
    if (selectedVariants.value.includes('writing') && v === 'writing') return true;
    if (selectedVariants.value.includes('meaning') && (v === 'TH_TO_EN' || v === 'EN_TO_TH')) return true;
    if (selectedVariants.value.includes('rules') && ['class', 'live_dead', 'length', 'name'].includes(v)) return true;
    return false;
  }).length;
});

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
    showReviewDialog.value = true;
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

    <Drawer v-model:open="showReviewDialog">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Review Settings</DrawerTitle>
            <DrawerDescription>Select what you'd like to include in this session.</DrawerDescription>
          </DrawerHeader>
          
          <div class="p-4 pb-0 space-y-4">
            <div v-for="option in availableOptions" :key="option.id" 
                 class="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                 @click="toggleVariant(option.id)">
              <Checkbox :id="option.id" :model-value="selectedVariants.includes(option.id)" />
              <div class="grid gap-1.5 leading-none">
                <Label :for="option.id" class="text-sm font-bold leading-none cursor-pointer">
                  {{ option.label }}
                </Label>
                <p class="text-xs text-muted-foreground">
                  {{ option.description }}
                </p>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button @click="startFilteredReview" :disabled="selectedVariants.length === 0">
              Start Review ({{ filteredDueCount }} items)
            </Button>
            <DrawerClose as-child>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style scoped>
</style>
