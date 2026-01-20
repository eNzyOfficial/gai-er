<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Page from '@/components/page/Page.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVocabularyStore } from '@/stores/vocabulary';
import type {EntityType, AlphabetGroup, StudyVariant, AlphabetVariant} from '@/types';
import { BookOpen, Type, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const vocab = useVocabularyStore();

// --- State ---
const step = ref(1);
const topic = ref<EntityType | null>(null);
const target = ref<string | null>(null); // collectionId or alphabetGroup
const selectedVariants = ref<StudyVariant[]>([]);
const filter = ref<'all' | 'new' | 'srs_only'>('all');
const infinite = ref(false);

// --- Options ---
const alphabetGroups: { label: string; value: AlphabetGroup }[] = [
    { label: 'Consonants', value: 'consonant' },
    { label: 'Vowels', value: 'vowel' },
    { label: 'Numbers', value: 'number' },
];

const wordVariants: { label: string; value: StudyVariant }[] = [
    { label: 'Thai → English', value: 'TH_TO_EN' },
    { label: 'English → Thai', value: 'EN_TO_TH' },
];

const alphabetVariants: { label: string; value: AlphabetVariant }[] = [
    { label: 'Name', value: 'name' },
    { label: 'Writing', value: 'writing' },
    { label: 'Sound', value: 'sound' },
    { label: 'Listening', value: 'listening' },
    { label: 'Class', value: 'class' },
    { label: 'Live/Dead', value: 'live_dead' },
    { label: 'Length', value: 'length' },
];

const currentVariants = computed(() => {
    if (topic.value === 'word') return wordVariants;
    if (topic.value === 'alphabet') {
        return alphabetVariants.filter(v => {
            if (target.value === 'consonant') {
                return v.value !== 'length';
            }
            if (target.value === 'vowel') {
                return v.value !== 'live_dead' && v.value !== 'class';
            }
            if (target.value === 'number') {
                return v.value !== 'live_dead' && v.value !== 'class' && v.value !== 'length';
            }
            return true;
        });
    }
    return [];
});

// --- Actions ---
function selectTopic(t: EntityType) {
    topic.value = t;
    target.value = null;
    selectedVariants.value = [];
    step.value = 2;
}

function selectTarget(val: string) {
    target.value = val;
    step.value = 3;
}

function toggleVariant(v: StudyVariant) {
    const idx = selectedVariants.value.indexOf(v);
    if (idx > -1) {
        selectedVariants.value.splice(idx, 1);
    } else {
        selectedVariants.value.push(v);
    }
}

function startPractice() {
    router.push({
        name: 'flashcards.practice',
        query: {
            collectionId: topic.value === 'word' ? (target.value === 'all' ? undefined : target.value!) : undefined,
            group: topic.value === 'alphabet' ? target.value as AlphabetGroup : undefined,
            variants: selectedVariants.value.length > 0 ? selectedVariants.value.join(',') : undefined,
            filter: filter.value,
            infinite: infinite.value.toString(),
        }
    });
}
</script>

<template>
    <Page>
        <div class="h-full p-4">
            <!-- Step 1: Topic -->
            <div v-if="step === 1" class="space-y-4">
                <h2 class="text-xl font-bold">What do you want to practice?</h2>
                <div class="grid grid-cols-1 gap-4">
                    <Card @click="selectTopic('word')" class="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent class="p-6 flex items-center gap-4">
                            <div
                                class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpen class="w-6 h-6" />
                            </div>
                            <div>
                                <div class="font-bold">Vocabulary</div>
                                <div class="text-sm text-muted-foreground">Practice words from your collections
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card @click="selectTopic('alphabet')" class="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent class="p-6 flex items-center gap-4">
                            <div
                                class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Type class="w-6 h-6" />
                            </div>
                            <div>
                                <div class="font-bold">Alphabet</div>
                                <div class="text-sm text-muted-foreground">Practice consonants, vowels, and rules
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <!-- Step 2: Target (Scope) -->
            <div v-if="step === 2" class="flex flex-col space-y-4 h-full">
                <h2 class="text-xl font-bold">{{ topic === 'word' ? 'Select Collection' : 'Select Group' }}</h2>

                <div class="flex-1">
                    <div class="grid grid-cols-1 gap-2">
                        <template v-if="topic === 'word'">
                            <Button v-for="c in vocab.collections" :key="c.id" variant="outline"
                                class="justify-between h-auto py-4 px-6 text-left" @click="selectTarget(c.id)">
                                <span>{{ c.name }}</span>
                                <ArrowRight class="w-4 h-4" />
                            </Button>
                            <Button variant="outline" class="justify-between h-auto py-4 px-6 text-left"
                                @click="selectTarget('all')">
                                <span>All Words</span>
                                <ArrowRight class="w-4 h-4" />
                            </Button>
                        </template>
                        <template v-else>
                            <Button v-for="g in alphabetGroups" :key="g.value" variant="outline"
                                class="justify-between h-auto py-4 px-6 text-left" @click="selectTarget(g.value)">
                                <span>{{ g.label }}</span>
                                <ArrowRight class="w-4 h-4" />
                            </Button>
                        </template>
                    </div>
                </div>

                <Button variant="outline" @click="step = 1">
                    Back
                </Button>
            </div>

            <!-- Step 3: Interaction & Options -->
            <div v-if="step === 3" class="flex flex-col space-y-4 h-full">
                <h2 class="text-xl font-bold">Configure Session</h2>

                <div class="flex-1 flex flex-col gap-4">
                    <div class="flex flex-col gap-2 p-4 border rounded-md">
                        <Label class="text-sm font-medium">Interaction Types</Label>

                        <div class="flex flex-wrap gap-2">
                            <Badge v-for="v in currentVariants" :key="v.value"
                                :variant="selectedVariants.includes(v.value) ? 'default' : 'secondary'"
                                class="cursor-pointer px-3 py-1.5 text-xs" @click="toggleVariant(v.value)">
                                {{ v.label }}
                            </Badge>
                        </div>

                        <p class="text-[10px] text-muted-foreground" v-if="selectedVariants.length === 0">Using
                            defaults</p>

                        <p class="text-[10px] text-muted-foreground" v-else>Mixed: {{ selectedVariants.length }}
                            types</p>
                    </div>

                    <div v-if="topic === 'word'" class="flex flex-col gap-2 p-4 border rounded-md">
                        <Label class="text-sm font-medium">Filter</Label>

                        <div class="flex flex-wrap gap-2">
                            <Badge v-for="f in (['all', 'new', 'srs_only'] as const)" :key="f"
                                :variant="filter === f ? 'secondary' : 'outline'"
                                class="cursor-pointer capitalize px-3 py-1 text-xs" @click="filter = f">
                                {{ f.replace('_', ' ') }}
                            </Badge>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-4 border rounded-md">
                        <div class="space-y-0.5">
                            <Label for="infinite-mode" class="text-base font-semibold">Infinite Loop</Label>
                            <p class="text-sm text-muted-foreground">Keep practicing until you manually exit</p>
                        </div>

                        <Switch id="infinite-mode" v-model:checked="infinite" />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <Button @click="startPractice">
                        Start Practice
                    </Button>

                    <Button variant="outline" @click="step = 2">
                        Back
                    </Button>
                </div>
            </div>
        </div>

        <template #footer />
    </Page>
</template>
