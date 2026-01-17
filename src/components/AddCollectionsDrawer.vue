<script setup lang="ts">
import { ref, computed } from 'vue'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVocabularyStore } from '@/stores/vocabulary'
import { X } from 'lucide-vue-next'

const props = defineProps<{
    open: boolean
}>()

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
}>()

// Writable v-model proxy
const openModel = computed({
    get: () => props.open,
    set: (value: boolean) => emit('update:open', value),
})

const vocab = useVocabularyStore()
const newCollectionName = ref('')

function addCollection() {
    const name = newCollectionName.value.trim()
    if (!name) return

    vocab.addCollection({
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
    })

    newCollectionName.value = ''
}
</script>

<template>
    <Drawer v-model:open="openModel">
        <DrawerContent class="max-h-[90vh] flex flex-col">
            <DrawerHeader>
                <DrawerTitle>Collections</DrawerTitle>
            </DrawerHeader>

            <div class="flex-1 overflow-y-auto p-4 space-y-6">
                <!-- Add collection -->
                <div class="flex gap-2">
                    <Input v-model="newCollectionName" placeholder="New collection name"
                        @keydown.enter="addCollection" />
                    <Button @click="addCollection">
                        Add
                    </Button>
                </div>

                <!-- List -->
                <div class="space-y-2">
                    <div v-for="collection in vocab.collections" :key="collection.id"
                        class="flex items-center justify-between rounded-md border p-0">
                        <p class="text-sm px-2">{{ collection.name }}</p>

                        <Button size="icon" variant="ghost" class="text-destructive"
                            @click="vocab.deleteCollection(collection.id)">
                            <X />
                        </Button>
                    </div>

                    <div v-if="!vocab.collections.length" class="text-sm text-muted-foreground text-center py-6">
                        No collections yet
                    </div>
                </div>
            </div>
        </DrawerContent>

    </Drawer>
</template>
