<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { useVocabularyStore } from '@/stores/vocabulary'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { Word } from '@/types'

const props = defineProps<{
    open: boolean
    word?: Word | null
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
}>()


watchEffect(() => {
    if (!props.open) return

    const word = props.word

    if (word) {
        // edit mode
        thai.value = word.thai
        transliteration.value = word.transliteration
        meaning.value = word.meaning
        selectedCollectionIds.value = [...word.collectionIds]
    } else {
        // add mode
        thai.value = ''
        transliteration.value = ''
        meaning.value = ''
        selectedCollectionIds.value = []
    }
})

const openModel = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
})

const vocab = useVocabularyStore()

const thai = ref('')
const transliteration = ref('')
const meaning = ref('')
const selectedCollectionIds = ref<string[]>([])

function submit() {
    if (!thai.value || !meaning.value) return

    if (props.word) {
        vocab.updateWord({
            ...props.word,
            thai: thai.value,
            transliteration: transliteration.value,
            meaning: meaning.value,
            collectionIds: [...selectedCollectionIds.value],
        })
    } else {
        vocab.addWord({
            id: crypto.randomUUID(),
            thai: thai.value,
            transliteration: transliteration.value,
            meaning: meaning.value,
            notes: '',
            collectionIds: [...selectedCollectionIds.value],
            createdAt: Date.now(),
        })
    }

    openModel.value = false
}
</script>

<template>
    <Drawer v-model:open="openModel">
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>
                    {{ props.word ? 'Edit word' : 'Add word' }}
                </DrawerTitle>
            </DrawerHeader>

            <div class="p-4 space-y-4">
                <div class="grid w-full gap-1.5">
                    <Label>Thai</Label>
                    <Input v-model="thai" placeholder="Thai" />
                </div>

                <div class="grid w-full gap-1.5">
                    <Input v-model="transliteration" placeholder="Transliteration" />
                </div>

                <div class="grid w-full gap-1.5">
                    <Input v-model="meaning" placeholder="Meaning" />
                </div>

                <div class="space-y-2">
                    <div class="text-sm font-medium">Collections</div>
                    <Select v-model="selectedCollectionIds" multiple>
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Collections" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem v-for="collection in vocab.collections" :value="collection.id">
                                    {{ collection.name }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <Button class="w-full" @click="submit">
                    {{ props.word ? 'Save changes' : 'Add word' }}
                </Button>
            </div>
        </DrawerContent>
    </Drawer>
</template>