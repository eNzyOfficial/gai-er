<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    year: number
    reviewHistory: Record<string, number>
}>()

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TOTAL_WEEKS = 53

/* Build weeks (Sunday-aligned like GitHub) */
const weeks = computed(() => {
    const result = []

    const start = new Date(props.year, 0, 1)

    // Align to Sunday (GitHub does Sunday)
    start.setDate(start.getDate() - start.getDay())

    const cursor = new Date(start)

    for (let w = 0; w < TOTAL_WEEKS; w++) {
        const days = []

        for (let d = 0; d < 7; d++) {
            const yyyy = cursor.getFullYear()
            const mm = String(cursor.getMonth() + 1).padStart(2, '0')
            const dd = String(cursor.getDate()).padStart(2, '0')
            const date = `${yyyy}-${mm}-${dd}`

            const count = props.reviewHistory[date] ?? 0

            days.push({
                date,
                count,
                isThisYear: yyyy === props.year,
                level:
                    count === 0 ? 0 :
                        count < 5 ? 1 :
                            count < 20 ? 2 :
                                count < 50 ? 3 : 4
            })

            cursor.setDate(cursor.getDate() + 1)
        }

        result.push({
            days,
            month: days[0]?.date ? new Date(days[0]!.date).getMonth() : 0
        })
    }

    return result
})

/* Compute month → week spans (for colspan) */
const monthSpans = computed(() => {
    const spans: { label: string; span: number }[] = []

    let currentMonth: number | null = null
    let currentSpan = 0

    weeks.value.forEach((week) => {
        // Does this week contain a day in the target year?
        const dayInYear = week.days.find(
            d => d.isThisYear
        )

        if (!dayInYear) {
            // Week is completely outside the year → skip for header
            return
        }

        const month = new Date(dayInYear.date).getMonth()

        if (month !== currentMonth) {
            if (currentMonth !== null) {
                spans.push({
                    label: new Date(0, currentMonth).toLocaleString('en', { month: 'short' }),
                    span: currentSpan
                })
            }
            currentMonth = month
            currentSpan = 1
        } else {
            currentSpan++
        }
    })

    if (currentMonth !== null) {
        spans.push({
            label: new Date(0, currentMonth).toLocaleString('en', { month: 'short' }),
            span: currentSpan
        })
    }

    return spans
})

const levelClass = (level: number) => {
    return level === 0 ? 'bg-muted' :
        level === 1 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
            level === 2 ? 'bg-emerald-300 dark:bg-emerald-700/50' :
                level === 3 ? 'bg-emerald-500' :
                    'bg-emerald-700'
}

const legendLabel = (level: number) => {
    switch (level) {
        case 0: return 'No reviews'
        case 1: return 'Low reviews'
        case 2: return 'Medium-low reviews'
        case 3: return 'Medium-high reviews'
        case 4: return 'High reviews'
        default: return ''
    }
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="overflow-x-auto">
            <table class="border-separate border-spacing-0.5 p-1" role="grid" aria-readonly="true">

                <!-- Month labels -->
                <thead>
                    <tr class="h-4">
                        <td class="w-8"></td>
                        <td v-for="(m, i) in monthSpans" :key="i" :colspan="m.span"
                            class="relative text-[10px] text-muted-foreground">
                            <span class="absolute top-0 left-0">
                                {{ m.label }}
                            </span>
                        </td>
                    </tr>
                </thead>

                <!-- Days -->
                <tbody>
                    <tr v-for="(day, rowIndex) in WEEKDAYS" :key="day">
                        <!-- Day labels -->
                        <td class="relative min-w-8 text-[10px] text-muted-foreground">
                            <span v-if="day === 'Mon' || day === 'Wed' || day === 'Fri'" class="absolute -bottom-1">
                                {{ day }}
                            </span>
                        </td>

                        <!-- Cells -->
                        <td v-for="(week, weekIndex) in weeks" :key="weekIndex" class="w-2">
                            <div :title="`${week.days[rowIndex]?.count ?? 0} on ${week.days[rowIndex]?.date}`" :class="[
                                'w-2 h-2 rounded-xs',
                                !(week.days[rowIndex]?.isThisYear ?? false) && 'opacity-0',
                                levelClass(week.days[rowIndex]?.level ?? 0)
                            ]" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="flex justify-between items-center text-[10px] text-muted-foreground">
            <p>Less</p>

            <div class="flex gap-0.5">
                <div v-for="level in 5" :key="level" :class="[
                    'w-1.5 h-1.5 rounded-xs',
                    levelClass(level - 1)
                ]" :aria-label="legendLabel(level - 1)" role="img" />
            </div>

            <p>More</p>
        </div>
    </div>
</template>
