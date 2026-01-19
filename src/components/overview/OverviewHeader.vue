<script lang="ts" setup>
import { useSrsStore } from '@/stores/srs';
import { Award, Flame, User } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const srs = useSrsStore();
</script>

<template>
    <header class="bg-background p-2 flex items-center">
        <div class="flex space-x-2">
            <Button as-child>
                <RouterLink :to="{ name: 'awards' }" class="flex items-center">
                    <Award />
                    <span>1</span>
                </RouterLink>
            </Button>

            <Button variant="outline" as-child>
                <RouterLink :to="{ name: 'streak' }" class="flex items-center gap-1.5">
                    <Flame class="w-5 h-5 text-orange-500" :class="{ 'fill-orange-500': srs.streak > 0 }" />
                    <span class="font-bold text-base">{{ srs.streak }}</span>
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