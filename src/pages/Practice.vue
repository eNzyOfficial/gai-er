<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Page from '@/components/page/Page.vue';
import Header from '@/components/page/Header.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useStudyStore } from '@/stores/study';
import { buildStudySession } from '@/lib/buildStudySession';
import { buildFlashcard } from '@/lib/flashcardFactory';
import type { EntityType, AlphabetGroup, StudyVariant } from '@/types';
import { BookOpen, Type, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-vue-next';
import CardRenderer from '@/components/flashcard/CardRenderer.vue';
import GradeControls from '@/components/flashcard/GradeControls.vue';
import SessionSummary from '@/components/flashcard/SessionSummary.vue';

const router = useRouter();
const vocab = useVocabularyStore();
const study = useStudyStore();

// --- State ---
const step = ref(1);
const topic = ref<EntityType | null>(null);
const target = ref<string | null>(null); // collectionId or alphabetGroup
const selectedVariants = ref<StudyVariant[]>([]);
const filter = ref<'all' | 'new' | 'srs_only'>('all');
const infinite = ref(false);
const isStarted = ref(false);

// --- Options ---
const alphabetGroups: { label: string; value: AlphabetGroup }[] = [
    { label: 'Consonants', value: 'consonant' },
    { label: 'Vowels', value: 'vowel' },
    { label: 'Numbers', value: 'number' },
    { label: 'Class Rules', value: 'class' },
    { label: 'Live/Dead', value: 'live_dead' },
    { label: 'Length', value: 'length' },
];

const wordVariants: { label: string; value: StudyVariant }[] = [
    { label: 'Thai → English', value: 'TH_TO_EN' },
    { label: 'English → Thai', value: 'EN_TO_TH' },
];

const alphabetVariants: { label: string; value: StudyVariant }[] = [
    { label: 'Name', value: 'name' },
    { label: 'Writing', value: 'writing' },
    { label: 'Sound/IPA', value: 'sound' },
    { label: 'Class', value: 'class' },
    { label: 'Live/Dead', value: 'live_dead' },
    { label: 'Length', value: 'length' },
];

const currentVariants = computed(() => {
    if (topic.value === 'word') return wordVariants;
    if (topic.value === 'alphabet') return alphabetVariants;
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
    const items = buildStudySession({
        mode: 'practice',
        collectionId: topic.value === 'word' ? (target.value === 'all' ? undefined : target.value!) : undefined,
        group: topic.value === 'alphabet' ? target.value as AlphabetGroup : undefined,
        variants: selectedVariants.value.length > 0 ? selectedVariants.value : undefined,
        filter: filter.value,
    });

    if (items.length === 0) {
        alert("No cards found for this selection.");
        return;
    }

    const cards = items.map(buildFlashcard);
    study.start(cards, true, infinite.value);
    isStarted.value = true;
}

function goBack() {
    if (step.value > 1) {
        step.value--;
    } else {
        router.back();
    }
}

function reset() {
    isStarted.value = false;
    study.$reset();
    step.value = 1;
    topic.value = null;
    target.value = null;
    selectedVariants.value = [];
}
</script>

<template>
    <Page :title="isStarted ? 'Practice' : 'Practice Setup'" with-back @back="isStarted ? reset() : goBack()" no-scroll>
        <template #header>
            <Header :title="isStarted ? 'Practice' : 'Practice Setup'" with-back @back="isStarted ? reset() : goBack()">
                <template #right v-if="isStarted">
                    <Button variant="ghost" size="sm" @click="reset">
                        <RotateCcw class="w-4 h-4 mr-1" />
                        Exit
                    </Button>
                </template>
            </Header>
        </template>

        <div class="h-full overflow-y-auto">
            <div v-if="!isStarted" class="p-4 space-y-6">
                <!-- Step 1: Topic -->
                <div v-if="step === 1" class="space-y-4">
                    <h2 class="text-xl font-bold">What do you want to practice?</h2>
                    <div class="grid grid-cols-1 gap-4">
                        <Card @click="selectTopic('word')" class="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent class="p-6 flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <BookOpen class="w-6 h-6" />
                                </div>
                                <div>
                                    <div class="font-bold">Vocabulary</div>
                                    <div class="text-sm text-muted-foreground">Practice words from your collections</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card @click="selectTopic('alphabet')" class="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent class="p-6 flex items-center gap-4">
                                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Type class="w-6 h-6" />
                                </div>
                                <div>
                                    <div class="font-bold">Alphabet</div>
                                    <div class="text-sm text-muted-foreground">Practice consonants, vowels, and rules</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <!-- Step 2: Target (Scope) -->
                <div v-if="step === 2" class="space-y-4">
                    <h2 class="text-xl font-bold">{{ topic === 'word' ? 'Select Collection' : 'Select Group' }}</h2>
                    <div class="grid grid-cols-1 gap-2">
                        <template v-if="topic === 'word'">
                            <Button v-for="c in vocab.collections" :key="c.id" variant="outline" class="justify-between h-auto py-4 px-6 text-left" @click="selectTarget(c.id)">
                                <span>{{ c.name }}</span>
                                <ArrowRight class="w-4 h-4" />
                            </Button>
                            <Button variant="outline" class="justify-between h-auto py-4 px-6 text-left" @click="selectTarget('all')">
                                <span>All Words</span>
                                <ArrowRight class="w-4 h-4" />
                            </Button>
                        </template>
                        <template v-else>
                            <Button v-for="g in alphabetGroups" :key="g.value" variant="outline" class="justify-between h-auto py-4 px-6 text-left" @click="selectTarget(g.value)">
                                <span>{{ g.label }}</span>
                                <ArrowRight class="w-4 h-4" />
                            </Button>
                        </template>
                    </div>
                    <Button variant="ghost" @click="step = 1" class="mt-4">
                        <ArrowLeft class="w-4 h-4 mr-2" /> Back
                    </Button>
                </div>

                <!-- Step 3: Interaction & Options -->
                <div v-if="step === 3" class="space-y-6">
                    <div class="space-y-4">
                        <h2 class="text-xl font-bold">Configure Session</h2>
                        
                        <div class="space-y-2">
                            <Label class="text-sm font-medium">Interaction Types</Label>
                            <div class="flex flex-wrap gap-2">
                                <Badge 
                                    v-for="v in currentVariants" 
                                    :key="v.value" 
                                    :variant="selectedVariants.includes(v.value) ? 'default' : 'secondary'"
                                    class="cursor-pointer px-3 py-1.5 text-sm"
                                    @click="toggleVariant(v.value)"
                                >
                                    {{ v.label }}
                                </Badge>
                            </div>
                            <p class="text-[10px] text-muted-foreground" v-if="selectedVariants.length === 0">Using defaults</p>
                            <p class="text-[10px] text-muted-foreground" v-else>Mixed: {{ selectedVariants.length }} types</p>
                        </div>

                        <div v-if="topic === 'word'" class="space-y-2">
                            <Label class="text-sm font-medium">Filter</Label>
                            <div class="flex gap-2">
                                <Badge 
                                    v-for="f in (['all', 'new', 'srs_only'] as const)" 
                                    :key="f"
                                    :variant="filter === f ? 'secondary' : 'outline'"
                                    class="cursor-pointer capitalize px-3 py-1"
                                    @click="filter = f"
                                >
                                    {{ f.replace('_', ' ') }}
                                </Badge>
                            </div>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                            <div class="space-y-0.5">
                                <Label for="infinite-mode" class="text-base font-semibold">Infinite Loop</Label>
                                <p class="text-sm text-muted-foreground">Keep practicing until you manually exit</p>
                            </div>
                            <Switch id="infinite-mode" v-model:checked="infinite" />
                        </div>
                    </div>

                    <div class="pt-4 flex flex-col gap-2">
                        <Button size="lg" class="w-full font-bold" @click="startPractice">
                            Start Practice
                        </Button>
                        <Button variant="ghost" @click="step = 2" class="w-full">
                            <ArrowLeft class="w-4 h-4 mr-2" /> Back
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Started Session -->
            <div v-else class="h-full p-4 flex flex-col">
                <CardRenderer :card="study.current" class="flex-1" v-if="study.queue.length && study.current" />
                <SessionSummary v-else-if="study.completed" @restart="reset" />
            </div>
        </div>

        <template #footer v-if="isStarted && !study.completed">
            <GradeControls v-if="study.revealed" />
            <div v-else></div>
        </template>
    </Page>
</template>
