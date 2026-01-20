<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Page from '@/components/page/Page.vue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useVocabularyStore } from '@/stores/vocabulary';
import type { EntityType, AlphabetGroup, StudyVariant, AlphabetVariant } from '@/types';
import { BookOpen, Type, ChevronRight } from 'lucide-vue-next';
import TopicTile from '@/components/practice/TopicTile.vue';
import PickerRow from '@/components/practice/PickerRow.vue';
import CollectionCard from '@/components/CollectionCard.vue';
import SegmentedControl from '@/components/practice/SegmentedControl.vue';

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
        <div class="h-full flex flex-col gap-4 py-4">
            <div class="flex flex-col gap px-4">
                <p class="text-xs text-muted-foreground">
                    Step {{ step }} of 3
                </p>
                <h2 class="text-lg font-semibold leading-tight">
                    {{ step === 1
                        ? 'What do you want to practice?'
                        : step === 2
                            ? (topic === 'word' ? 'Choose a collection' : 'Choose a group')
                            : 'Configure session'
                    }}
                </h2>
            </div>

            <div class="flex-1 overflow-y-auto px-4">
                <Transition name="step" mode="out-in">
                    <div :key="step">
                        <!-- Step 1: Topic -->
                        <div v-if="step === 1" class="space-y-4">
                            <div class="grid grid-cols-1 gap-4">
                                <TopicTile @click="selectTopic('word')" title="Vocabulary"
                                    description="Practice words from your collections">
                                    <template #icon>
                                        <BookOpen class="w-6 h-6" />
                                    </template>
                                </TopicTile>

                                <TopicTile @click="selectTopic('alphabet')" title="Alphabet"
                                    description="Practice consonants, vowels, and rules">
                                    <template #icon>
                                        <Type class="w-6 h-6" />
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

                            <div v-if="topic === 'word'" class="space-y-2 border rounded-md p-4">
                                <Label class="text-sm font-medium">Which words?</Label>

                                <SegmentedControl v-model="filter" :options="[
                                    { label: 'All', value: 'all' },
                                    { label: 'New', value: 'new' },
                                    { label: 'Review', value: 'srs_only' }
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

            <div class="flex flex-col gap-2 px-4">
                <Button @click="startPractice" v-if="step == 3">
                    Start Practice
                </Button>

                <Button variant="outline" @click="step--" v-if="step > 1">
                    Back
                </Button>
            </div>
        </div>

        <template #footer />
    </Page>
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