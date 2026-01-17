<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Eraser, Undo2 } from 'lucide-vue-next';

const props = defineProps<{
    width?: number;
    height?: number;
    strokeColor?: string;
    lineWidth?: number;
    placeholder?: string;
    showControls?: boolean;
    hintActive?: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const lastPos = ref({ x: 0, y: 0 });
const history = ref<string[]>([]);

const emit = defineEmits(['stroke', 'clear', 'undo']);

const getPos = (e: MouseEvent | TouchEvent) => {
    if (!canvasRef.value) return { x: 0, y: 0 };
    const rect = canvasRef.value.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
};

const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing.value = true;
    lastPos.value = getPos(e);
    
    // Save state for undo
    saveState();
};

const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.value || !canvasRef.value) return;
    
    const ctx = canvasRef.value.getContext('2d');
    if (!ctx) return;

    // Set stroke color based on theme if not provided
    const isDark = document.documentElement.classList.contains('dark');
    ctx.strokeStyle = props.strokeColor || (isDark ? '#ffffff' : '#000000');
    
    const currentPos = getPos(e);

    ctx.beginPath();
    ctx.lineWidth = props.lineWidth || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.value.x, lastPos.value.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.value = currentPos;
};

const stopDrawing = () => {
    if (isDrawing.value) {
        isDrawing.value = false;
        emit('stroke');
    }
};

const clear = () => {
    if (!canvasRef.value) return;
    const ctx = canvasRef.value.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    history.value = [];
    emit('clear');
};

const saveState = () => {
    if (!canvasRef.value) return;
    history.value.push(canvasRef.value.toDataURL());
    if (history.value.length > 20) history.value.shift();
};

const undo = () => {
    if (!canvasRef.value || history.value.length === 0) return;
    
    const ctx = canvasRef.value.getContext('2d');
    if (!ctx) return;

    const prevState = history.value.pop();
    if (!prevState) return;

    const img = new Image();
    img.src = prevState;
    img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height);
        ctx.drawImage(img, 0, 0);
        emit('undo');
    };
};

// Handle resize or dimension changes
watch([() => props.width, () => props.height], () => {
    // Note: resizing canvas clears it
    // clear(); 
}, { immediate: true });

onMounted(() => {
    if (canvasRef.value) {
        // Set actual canvas size to match display size if not provided
        if (!props.width || !props.height) {
            const rect = canvasRef.value.parentElement?.getBoundingClientRect();
            if (rect) {
                canvasRef.value.width = rect.width;
                canvasRef.value.height = rect.height;
            }
        }
    }
});

defineExpose({ clear, undo });
</script>

<template>
    <div class="relative w-full h-full border rounded-lg bg-white dark:bg-slate-950 overflow-hidden group">
        <div v-if="placeholder"
            class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 select-none text-9xl font-bold text-black dark:text-white transition-opacity duration-300"
            :class="{ 'opacity-5 dark:opacity-10': hintActive }">
            {{ placeholder }}
        </div>

        <canvas ref="canvasRef" :width="width" :height="height" @mousedown="startDrawing" @mousemove="draw"
            @mouseup="stopDrawing" @mouseleave="stopDrawing" @touchstart.prevent="startDrawing"
            @touchmove.prevent="draw" @touchend.prevent="stopDrawing"
            class="block w-full h-full cursor-crosshair touch-none relative z-10"></canvas>

        <div class="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            :class="{ 'opacity-100': showControls }">
            <Button variant="outline" size="icon" @click="undo" title="Undo">
                <Undo2 class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" @click="clear" title="Clear">
                <Eraser class="w-4 h-4" />
            </Button>
        </div>
    </div>
</template>
