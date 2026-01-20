<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVocabularyStore } from '@/stores/vocabulary'
import type { Word } from '@/types'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Lock, LockOpen, Pen, Trash } from 'lucide-vue-next'
import AddWordDrawer from '@/components/AddWordDrawer.vue'
import AddCollectionsDrawer from '@/components/AddCollectionsDrawer.vue'
import ConfirmedButton from '@/components/ConfirmedButton.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useWordList } from '@/composables/useWordList'
import { useSrsStore } from '@/stores/srs'
import { studyItemId } from '@/lib/studyItemId'
import Page from '@/components/page/Page.vue'
import Header from '@/components/page/Header.vue'

type SortMode = 'smart' | 'newest' | 'alpha'
// const confidenceLabels = ['Low', 'Medium', 'High']

const sortMode = ref<SortMode>('smart')
const search = ref('')

const vocab = useVocabularyStore()
const srs = useSrsStore()

function getMasteryColor(wordId: string) {
    const id = studyItemId('word', wordId, 'TH_TO_EN');
    const mastery = srs.getMastery(id);
    if (mastery === 'mastered') return 'bg-emerald-500';
    if (mastery === 'learning') return 'bg-blue-400';
    return 'bg-slate-200 dark:bg-slate-700';
}
const { displayedWords } = useWordList(
    computed(() => vocab.words),
    search,
    sortMode
)

const showAddWordDrawer = ref(false)
const showCollectionsDrawer = ref(false)

const editMode = ref(false)
const editingWord = ref<Word | null>(null)

const collectionsById = computed(() =>
    Object.fromEntries(
        vocab.collections
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(c => [c.id, c])
    )
)
</script>

<template>
    <Page>
        <template #header>
            <Header title="Word Bank">
                <template #right>
                    <Button @click.prevent="editMode = !editMode" :variant="editMode ? 'destructive' : 'outline'"
                        size="icon-sm">
                        <Lock v-if="!editMode" />
                        <LockOpen v-else />
                    </Button>
                </template>
            </Header>
        </template>

        <AddWordDrawer v-model:open="showAddWordDrawer" :word="editingWord" @close="editingWord = null" />
        <AddCollectionsDrawer v-model:open="showCollectionsDrawer" />

        <div class="p-6 space-y-6">
            <div class="flex flex-col space-y-1.5">
                <div class="flex justify-between items-center">
                    <h1 class="text-xl font-semibold">Words ({{ vocab.words.length }})</h1>

                    <div class="flex space-x-2">
                        <Button v-if="editMode" @click="editingWord = null; showAddWordDrawer = true" size="sm">
                            Add word
                        </Button>

                        <Button v-if="editMode" @click="showCollectionsDrawer = true" size="sm">
                            Manage Collections
                        </Button>
                    </div>
                </div>
                <p class="text-xs text-muted-foreground">Add words with their transliteration and translation that
                    you'd
                    like to practice. You can then use the flashcard page to practice them.</p>
            </div>


            <div class="flex flex-col space-y-4">
                <div class="flex gap-2">
                    <Input v-model="search" placeholder="Search…" :disabled="editMode" />

                    <Select v-model="sortMode" :disabled="editMode">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="smart">Smart</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="alpha">Alphabetical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead class="w-[50px]"></TableHead>
                                <TableHead>Thai</TableHead>
                                <TableHead>Transliteration</TableHead>
                                <TableHead>Meaning</TableHead>
                                <!-- <TableHead>Confidence</TableHead> -->
                                <TableHead>Collections</TableHead>
                                <TableHead v-if="editMode"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-if="!displayedWords.length">
                                <TableCell colspan="7" class="h-32 text-center text-muted-foreground">
                                    {{ search ? 'No matching words' : 'No words yet — unlock to add your first one'
                                    }}
                                </TableCell>
                            </TableRow>

                            <TableRow v-for="word in displayedWords" :key="word.id">
                                <TableCell>
                                    <div class="flex items-center justify-center">
                                        <div class="w-2 h-2 rounded-full" :class="getMasteryColor(word.id)"></div>
                                    </div>
                                </TableCell>
                                <TableCell>{{ word.thai }}</TableCell>
                                <TableCell>{{ word.transliteration }}</TableCell>
                                <TableCell>{{ word.meaning }}</TableCell>

                                <!-- <TableCell>
                                        <Badge :title="word.lastReviewedAt
                                            ? new Date(word.lastReviewedAt).toLocaleString()
                                            : undefined" v-if="word.confidence !== null" :variant="word.confidence === 0
                                                ? 'destructive'
                                                : word.confidence === 1
                                                    ? 'secondary'
                                                    : 'default'">
                                            {{ confidenceLabels[word.confidence] }}
                                        </Badge>
                                        <span v-else class="text-muted-foreground text-xs">—</span>
                                    </TableCell> -->

                                <TableCell>
                                    <div class="flex space-x-0.5">
                                        <Badge v-for="id of word.collectionIds" :key="id">
                                            {{ collectionsById[id]?.name }}
                                        </Badge>
                                    </div>
                                </TableCell>

                                <TableCell v-if="editMode">
                                    <div class="flex space-x-2 justify-end">
                                        <Button size="icon-sm" variant="secondary"
                                            @click="editingWord = word; showAddWordDrawer = true">
                                            <Pen />
                                        </Button>

                                        <ConfirmedButton @confirm="vocab.deleteWord(word.id)" v-slot="{ open }">
                                            <Button size="icon-sm" variant="destructive" @click="open">
                                                <Trash />
                                            </Button>
                                        </ConfirmedButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>

        <template #footer />
    </Page>
</template>
