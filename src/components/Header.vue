<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps<{
    title?: string
    showBack?: boolean
    backTo?: string
}>()

const router = useRouter()


function goBack() {
    if (props.backTo) {
        router.push({ name: props.backTo })
    } else if (window.history.length > 1) {
        router.back()
    } else {
        router.replace('/')
    }
}
</script>

<template>
    <header class="
      sticky top-0 z-50
      flex h-12 items-center
      bg-background px-2
      supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]
    ">
        <!-- Left -->
        <div class="w-10 flex items-center justify-start">
            <Button v-if="showBack || backTo" variant="ghost" size="icon" @click="goBack">
                <ChevronLeft class="h-5 w-5" />
            </Button>
        </div>

        <!-- Center -->
        <div class="flex-1 text-center text-sm font-medium truncate">
            {{ title }}
        </div>

        <!-- Right -->
        <div class="w-10 flex items-center justify-end">
            <slot name="right" />
        </div>
    </header>

    <Separator />
</template>
