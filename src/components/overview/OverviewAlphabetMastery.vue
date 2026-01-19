<script lang="ts" setup>
import { useAlphabetStore } from '@/stores/alphabet';
import { useSrsStore } from '@/stores/srs';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import { Progress } from '@/components/ui/progress';

const srs = useSrsStore();
const alphabet = useAlphabetStore();
const router = useRouter();

const cotd = computed(() => {
    // Include both consonants and vowels
    const eligibleTypes = ['consonant', 'vowel'];
    const candidates = alphabet.cards.filter(c => eligibleTypes.includes(c.type));

    const unmastered = candidates.filter(c => {
        const id = `alphabet:${c.character}:sound`;
        return srs.getMastery(id) !== 'mastered';
    });

    if (unmastered.length === 0) return null;

    // Stable random based on date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    let hash = 0;
    for (let i = 0; i < dateStr!.length; i++) {
        hash = ((hash << 5) - hash) + dateStr!.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % unmastered.length;
    return unmastered[index];
});
</script>

<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
            <h2 class="text-lg font-semibold">Alphabet Mastery</h2>
            <span class="text-xs text-muted-foreground">
                {{ srs.alphabetMastery.mastered }}/{{ srs.alphabetMastery.total }} Characters
            </span>
        </div>

        <div class="border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            @click="router.push({ name: 'alphabet.browser' })">
            <div class="space-y-2">
                <div class="flex justify-between text-xs font-medium">
                    <span>Progress</span>
                    <span>{{ Math.round(srs.alphabetMastery.percentage) }}%</span>
                </div>
                <Progress :model-value="srs.alphabetMastery.percentage" class="h-2" />
            </div>

            <div v-if="cotd" class="flex items-center gap-4 pt-4">
                <div
                    class="text-4xl font-bold text-primary bg-primary/5 w-16 h-16 flex items-center justify-center rounded-xl">
                    {{ cotd.character }}
                </div>
                <div class="flex-1">
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider">Character
                        of the
                        Day</p>
                    <p class="text-lg font-semibold">{{ cotd.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ cotd.ipa }} • {{ cotd.example_english }}</p>
                </div>
                <ChevronRight />
            </div>
        </div>
    </div>
</template>