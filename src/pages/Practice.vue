<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Page from '@/components/page/Page.vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVocabularyStore } from '@/stores/vocabulary';
import { useAlphabetStore } from '@/stores/alphabet';
import { useSrsStore } from '@/stores/srs';
import { makeStudyItem } from '@/lib/makeStudyItem';
import type { EntityType, AlphabetGroup, StudyVariant, AlphabetVariant } from '@/types';
import { ChevronRight, Info, ALargeSmall, WholeWord, ChevronLeft } from 'lucide-vue-next';
import TopicTile from '@/components/practice/TopicTile.vue';
import PickerRow from '@/components/practice/PickerRow.vue';
import CollectionCard from '@/components/CollectionCard.vue';
import SegmentedControl from '@/components/practice/SegmentedControl.vue';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Separator from '@/components/ui/separator/Separator.vue';

const router = useRouter();
const vocab = useVocabularyStore();
const alphabet = useAlphabetStore();
const srs = useSrsStore();

// --- Info Dialog State ---
const infoDialog = ref<{ title: string; description: string } | null>(null);

function showInfo(type: 'interaction' | 'words') {
    if (type === 'interaction') {
        infoDialog.value = {
            title: 'Interaction Types',
            description: 'Choose how you want to be tested. You can select multiple types to mix them during your session. For example, you can practice both translating Thai to English and English to Thai at the same time.'
        };
    } else if (type === 'words') {
        infoDialog.value = {
            title: 'Which words?',
            description: 'Filter which words from your collection(s) should be included:\n\n• All: Every word in the selected scope.\n• New: Only words you haven\'t practiced yet.\n• Review: Only words that are due for SRS review.'
        };
    }
}

const currentStepDescription = computed(() => {
    if (step.value === 1) return 'Practice lets you freely review vocabulary or alphabet without affecting your spaced repetition schedule.';
    if (step.value === 2) {
        if (topic.value === 'word') return 'Select a specific collection of words to practice, or choose "All words" to mix everything together.';
        return 'Select a group of characters to practice. Consonants, vowels, and numbers have different sets of rules and properties to learn.';
    }
    return 'Fine-tune your session. Choose interaction types (e.g., Thai to English) and filter words based on your learning progress.';
});

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

const wordCounts = computed(() => {
    const words = target.value === 'all' ? vocab.words : vocab.wordsInCollection(target.value!);
    const counts = {
        all: words.length,
        new: 0,
        srs_only: 0
    };
    words.forEach(w => {
        const hasSrs = srs.get(makeStudyItem('word', w.id, 'TH_TO_EN').id);
        if (hasSrs) counts.srs_only++;
        else counts.new++;
    });
    return counts;
});

const alphabetCounts = computed(() => {
    if (topic.value !== 'alphabet' || !target.value) return { all: 0, new: 0, srs_only: 0 };
    const chars = alphabet.group(target.value as AlphabetGroup);
    const counts = {
        all: chars.length,
        new: 0,
        srs_only: 0
    };
    chars.forEach(c => {
        const mastery = srs.getMastery(makeStudyItem('alphabet', c.character, 'sound').id);
        if (mastery === 'learning') counts.srs_only++;
        else if (mastery === 'new') counts.new++;
    });
    return counts;
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
        <div class="h-full flex flex-col gap-4 py-4">
            <div class="flex items-center justify-between px-4 gap-4">
                <button class="text-muted-foreground hover:text-muted-foreground/50" @click="step--" v-if="step > 1">
                    <ChevronLeft />
                </button>

                <div class="grow flex flex-col gap-1">
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-muted-foreground">
                            Step {{ step }} of 3
                        </p>
                    </div>
                    <h2 class="text-lg font-semibold leading-tight">
                        {{ step === 1
                            ? 'What do you want to practice?'
                            : step === 2
                                ? (topic === 'word' ? 'Choose a collection' : 'Choose a group')
                                : 'Configure session'
                        }}
                    </h2>
                </div>
            </div>

            <Separator />

            <div class="flex-1 overflow-y-auto px-4">
                <Transition name="step" mode="out-in">
                    <div :key="step" class="flex flex-col gap-4">
                        <p class="border-l border-muted-foreground pl-4 text-xs text-muted-foreground leading-relaxed">
                            {{ currentStepDescription }}
                        </p>

                        <!-- Step 1: Topic -->
                        <div v-if="step === 1">
                            <div class="grid grid-cols-1 gap-4">
                                <TopicTile @click="selectTopic('word')" title="Vocabulary"
                                    description="Practice words from your collections">
                                    <template #icon>
                                        <WholeWord class="w-6 h-6" />
                                    </template>
                                </TopicTile>

                                <TopicTile @click="selectTopic('alphabet')" title="Alphabet"
                                    description="Practice consonants, vowels, and rules">
                                    <template #icon>
                                        <ALargeSmall class="w-6 h-6" />
                                    </template>
                                </TopicTile>
                            </div>
                        </div>

                        <!-- Step 2: Target (Scope) -->
                        <div v-if="step === 2" class="flex flex-col space-y-4">
                            <div class="flex flex-col gap-2">
                                <template v-if="topic === 'word'">
                                    <PickerRow label="All words" hint="Every collection" @click="selectTarget('all')" />

                                    <CollectionCard v-for="c in vocab.collections" :key="c.id" :collection="c"
                                        @click="selectTarget(c.id)" />
                                </template>
                                <template v-else>
                                    <Button v-for="g in alphabetGroups" :key="g.value" variant="outline"
                                        class="justify-between h-auto py-4 px-6 text-left"
                                        @click="selectTarget(g.value)">
                                        <span>{{ g.label }}</span>
                                        <ChevronRight class="w-4 h-4" />
                                    </Button>
                                </template>
                            </div>
                        </div>

                        <!-- Step 3: Interaction & Options -->
                        <div v-if="step === 3" class="flex flex-col space-y-4 h-full">
                            <div class="flex flex-col gap-4 p-4 border rounded-md">
                                <div class="flex items-center gap-2">
                                    <Label class="text-sm font-medium">Interaction Types</Label>
                                    <button @click="showInfo('interaction')"
                                        class="text-muted-foreground hover:text-foreground transition-colors">
                                        <Info class="w-4 h-4" />
                                    </button>
                                </div>

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

                            <div v-if="topic === 'word'" class="space-y-4 border rounded-md p-4">
                                <div class="flex items-center gap-2">
                                    <Label class="text-sm font-medium">Which words?</Label>
                                    <button @click="showInfo('words')"
                                        class="text-muted-foreground hover:text-foreground transition-colors">
                                        <Info class="w-4 h-4" />
                                    </button>
                                </div>

                                <SegmentedControl v-model="filter" :options="[
                                    { label: `All (${wordCounts.all})`, value: 'all' },
                                    { label: `New (${wordCounts.new})`, value: 'new' },
                                    { label: `Review (${wordCounts.srs_only})`, value: 'srs_only' }
                                ]" />
                            </div>

                            <div v-if="topic === 'alphabet'" class="space-y-4 border rounded-md p-4">
                                <div class="flex items-center gap-2">
                                    <Label class="text-sm font-medium">Which characters?</Label>
                                </div>

                                <SegmentedControl v-model="filter" :options="[
                                    { label: `All (${alphabetCounts.all})`, value: 'all' },
                                    { label: `New (${alphabetCounts.new})`, value: 'new' },
                                    { label: `Learning (${alphabetCounts.srs_only})`, value: 'srs_only' }
                                ]" />
                            </div>

                            <div class="flex items-center justify-between p-4 border rounded-md">
                                <div class="space-y-0.5">
                                    <Label for="infinite-mode" class="text-base font-semibold">Infinite Loop</Label>
                                    <p class="text-sm text-muted-foreground">Keep practicing until you manually exit</p>
                                </div>

                                <Switch id="infinite-mode" v-model:checked="infinite" />
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>

            <div class="flex flex-col gap-4 px-4" v-if="step == 3">
                <p class="text-xs text-muted-foreground text-center">
                    This session won’t affect your SRS progress.
                </p>
                <Button @click="startPractice">
                    Start Practice
                </Button>
            </div>
        </div>

        <template #footer />
    </Page>

    <AlertDialog :open="!!infoDialog" @update:open="val => !val && (infoDialog = null)">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ infoDialog?.title }}</AlertDialogTitle>
                <AlertDialogDescription class="whitespace-pre-wrap">
                    {{ infoDialog?.description }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction @click="infoDialog = null">Close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
    transition: all 0.25s ease;
}

.step-enter-from {
    opacity: 0;
    transform: translateX(12px);
}

.step-leave-to {
    opacity: 0;
    transform: translateX(-12px);
}
</style>
