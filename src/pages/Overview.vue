<script lang="ts" setup>
import Page from '@/components/page/Page.vue';
import { Award, ChevronRight, Flame, User, Search, LayoutGrid, Calculator } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import WeeklyStreak from "@/components/WeeklyStreak.vue";
import { useSrsStore } from '@/stores/srs';
import { useVocabularyStore } from "@/stores/vocabulary.ts";
import { useAlphabetStore } from "@/stores/alphabet.ts";
import { useRouter } from "vue-router";
import CollectionCard from '@/components/CollectionCard.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import { Progress } from '@/components/ui/progress';
import { computed } from 'vue';

const srs = useSrsStore();
const vocab = useVocabularyStore();
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
  const dateStr = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr!.length; i++) {
    hash = ((hash << 5) - hash) + dateStr!.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % unmastered.length;
  return unmastered[index];
});

function getMasteryColor(wordId: string) {
    const id = `word:${wordId}:TH_TO_EN`;
    const mastery = srs.getMastery(id);
    if (mastery === 'mastered') return 'bg-emerald-500';
    if (mastery === 'learning') return 'bg-blue-400';
    return 'bg-slate-200 dark:bg-slate-700';
}
</script>

<template>
    <Page>
        <template #header>
            <header class="bg-background p-2 flex items-center">

                <div class="flex space-x-2">
                    <Button as-child>
                        <RouterLink :to="{ name: 'awards' }" class="flex items-center">
                            <Award />
                            <span>1</span>
                        </RouterLink>
                    </Button>

                    <Button variant="outline" as-child>
                        <RouterLink :to="{ name: 'streak' }" class="flex items-center">
                            <Flame class="text-amber-500" :class="{ 'fill-amber-500': srs.streak > 0 }" />
                            <span>{{ srs.streak }}</span>
                        </RouterLink>
                    </Button>
                </div>

                <div class="flex-1 text-center text-sm font-medium truncate">
                    <h1 class="text-xl font-semibold text-gray-800">ไก่เอ๋อ</h1>
                </div>

                <div class="flex space-x-4 justify-end">
                    <Button variant="ghost" as-child>
                        <RouterLink :to="{ name: 'profile' }" class="flex items-center">
                            <User />
                        </RouterLink>
                    </Button>
                </div>
            </header>
        </template>

        <div class="flex flex-col space-y-4 p-4">
            <WeeklyStreak />

            <!-- Quick Actions Grid -->
            <div class="grid grid-cols-3 gap-3">
                <Button variant="secondary" class="flex flex-col items-center justify-center h-20 gap-1.5 px-2 text-center"
                    @click="router.push({ name: 'alphabet.browser' })">
                    <Search class="w-5 h-5" />
                    <span class="text-[10px] leading-tight font-medium">Character Browser</span>
                </Button>

                <Button variant="secondary" class="flex flex-col items-center justify-center h-20 gap-1.5 px-2 text-center"
                    @click="router.push({ name: 'alphabet.grouped' })">
                    <LayoutGrid class="w-5 h-5" />
                    <span class="text-[10px] leading-tight font-medium">Character Groups</span>
                </Button>

                <Button variant="secondary" class="flex flex-col items-center justify-center h-20 gap-1.5 px-2 text-center"
                    @click="router.push({ name: 'tone.calculator' })">
                    <Calculator class="w-5 h-5" />
                    <span class="text-[10px] leading-tight font-medium">Tone Calculator</span>
                </Button>
            </div>

            <!-- Alphabet Mastery Section -->
            <section class="space-y-3">
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
            </section>

            <!-- Collections Section -->
            <section class="space-y-3">
                <div class="flex items-center justify-between px-1">
                    <h2 class="text-lg font-semibold">Study Collections</h2>
                    <Button variant="link" size="sm" as-child class="h-auto p-0">
                        <router-link :to="{ name: 'words' }" class="flex items-center gap-1">
                            <span>See all</span>
                            <ChevronRight class="w-4 h-4" />
                        </router-link>
                    </Button>
                </div>

                <div class="flex flex-col gap-3" v-if="vocab.collectionsWithProgress.length">
                    <CollectionCard v-for="col in vocab.collectionsWithProgress.slice(0, 2)" :key="col.id"
                        :collection="col"
                        @click="router.push({ name: 'words.study.collection', params: { collectionId: col.id } })" />
                </div>
              <div v-else class="flex items-center justify-center p-3 border rounded-md">
                <p class="text-sm text-muted-foreground">No collections yet.</p>
              </div>
            </section>

            <!-- Recently Added Words -->
            <section class="space-y-3">
                <div class="flex items-center justify-between px-1">
                    <h2 class="text-lg font-semibold">Recently Added</h2>
                  <Button variant="link" size="sm" as-child class="h-auto p-0">
                    <router-link :to="{ name: 'words' }" class="flex items-center gap-1">
                      <span>Manage</span>
                      <ChevronRight class="w-4 h-4" />
                    </router-link>
                  </Button>
                </div>

                <div class="grid grid-cols-1 gap-2" v-if="vocab.recentlyAddedWords.length > 0">
                    <div v-for="word in vocab.recentlyAddedWords" :key="word.id"
                        class="flex items-center justify-between p-3 border rounded-lg bg-card group hover:bg-muted/50 cursor-pointer transition-colors"
                        @click="router.push({ name: 'words' })">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full" :class="getMasteryColor(word.id)"></div>
                            <div>
                                <p class="text-lg font-medium leading-none">{{ word.thai }}</p>
                                <p class="text-xs text-muted-foreground mt-1">{{ word.meaning }}</p>
                            </div>
                        </div>
                        <Badge variant="outline" class="text-[10px] uppercase font-bold tracking-tighter opacity-70">
                            {{ word.transliteration }}
                        </Badge>
                    </div>
                </div>

              <div v-else class="flex items-center justify-center p-3 border rounded-md">
                <p class="text-sm text-muted-foreground">No recently added words yet.</p>
              </div>
            </section>
        </div>

        <template #footer />
    </Page>
</template>
