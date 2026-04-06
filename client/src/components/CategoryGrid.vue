<script setup lang="ts">
    import { ref } from 'vue';
    import { PhPalette, PhTrash } from '@phosphor-icons/vue';
    import ConfirmModal from './ConfirmModal.vue';

    defineProps<{ items: any[] }>();
    const emit = defineEmits(['add', 'delete']);

    const isConfirmingDelete = ref(false);
    const itemToDelete = ref<number | string | null>(null);

    const confirmDelete = (id: number | string) => {
        itemToDelete.value = id;
        isConfirmingDelete.value = true;
    };

    const executeDelete = () => {
        if (itemToDelete.value) {
            emit('delete', itemToDelete.value);
        }
        isConfirmingDelete.value = false;
        itemToDelete.value = null;
    };


</script>

<template>
    <div>
        <div class="categories-grid">
            <div class="cat-card hover-lift" v-for="cat in items" :key="cat.idCategory">
                <div class="cat-card-left">
                    <PhPalette size="20" :style="{ color: cat.color }" weight="fill" />
                    <span class="title">{{ cat.description }}</span>
                </div>
                <button class="icon-btn delete-btn" @click="confirmDelete(cat.idCategory)" title="Excluir">
                    <PhTrash size="18" />
                </button>
            </div>
        </div>

        <ConfirmModal 
            :isOpen="isConfirmingDelete"
            title="Excluir Categoria?"
            message="Ao excluir esta categoria, os registros vinculados a ela poderão perder a referência. Tem certeza que deseja continuar?"
            @confirm="executeDelete"
            @cancel="isConfirmingDelete = false"
        />
    </div>
</template>

<style scoped>
    .color-picker-wrapper {
        width: 38px; height: 38px; border-radius: 50%; overflow: hidden;
        border: 2px solid var(--border-color); flex-shrink: 0; cursor: pointer;
    }
    .cat-color-input {
        width: 150%; height: 150%; transform: translate(-10%, -10%);
        border: none; padding: 0; cursor: pointer;
    }

    .btn-primary {
        background-color: var(--primary-color); color: #fff; border: none;
        padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500;
        display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }

    .categories-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }
    .cat-card {
        background-color: var(--bg-card); border: 1px solid var(--border-color);
        padding: 1.2rem; border-radius: 12px;
        display: flex; justify-content: space-between; align-items: center;
    }
    .cat-card-left { display: flex; align-items: center; gap: 12px; }
    .cat-card-left .title { font-weight: 500; font-size: 0.95rem; color: var(--text-primary); }

    .icon-btn { background: transparent; border: none; padding: 6px; cursor: pointer; transition: 0.2s; border-radius: 6px; display: flex;}
    .icon-btn.delete-btn { color: var(--danger-color); }
    .icon-btn.delete-btn:hover { background: rgba(239, 68, 68, 0.1); }

    @media (max-width: 640px) {
        .inline-category-form { flex-wrap: wrap; }
        .cat-input { flex: 1; width: 100%; }
    }
</style>