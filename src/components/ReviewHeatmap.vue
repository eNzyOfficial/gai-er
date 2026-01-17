<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    data: Record<string, number>; // YYYY-MM-DD -> count
    days?: number;
}>();

const daysToShow = props.days ?? 100;

const today = new Date();
today.setHours(0, 0, 0, 0);

const dates = computed(() => {
    const res = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (key) {
          res.push({
            date: key,
            count: props.data[key] ?? 0
          });
        }
    }
    return res;
});

function getColor(count: number) {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count < 5) return 'bg-emerald-200';
    if (count < 15) return 'bg-emerald-400';
    if (count < 30) return 'bg-emerald-600';
    return 'bg-emerald-800';
}

function getTitle(date: string, count: number) {
    return `${date}: ${count} reviews`;
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-1">
            <div v-for="d in dates" :key="d.date" :title="getTitle(d.date!, d.count)"
                class="w-3 h-3 rounded-sm transition-colors" :class="getColor(d.count)">
            </div>
        </div>
        <div class="flex justify-between text-[10px] text-muted-foreground px-1">
            <span>{{ dates[0]!.date }}</span>
            <span>Today</span>
        </div>
    </div>
</template>
