 <script setup lang="ts">
    import { computed, ref } from 'vue';
    import { PhArrowUpRight, PhPencilSimple, PhTrash, PhCheckCircle, PhCircle } from '@phosphor-icons/vue';
    import ConfirmModal from './ConfirmModal.vue';

    const props = defineProps<{
        items: any[];
        currentTab: string;
    }>();

    const emit = defineEmits(['edit', 'delete', 'toggle-paid']);

    const totalValue = computed(() => {
        if (props.currentTab === 'entradas') {
            return props.items.reduce((acc, item) => acc + (item.value || 0), 0);
        }
        return props.items.reduce((acc, item) => item.paid ? acc + (item.value || 0) : acc, 0);
    });

    const toBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(v);
    const toDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';

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
    <div class="records-wrapper">
        <div class="summary-bar">
            <span class="count">{{ items.length }} registro<span v-if="items.length !== 1">s</span></span>
            <span class="total" :class="currentTab === 'entradas' ? 'text-success' : 'text-danger'">
                {{ toBRL(totalValue) }}
            </span>
        </div>

        <div class="record-row hover-lift" v-for="item in items" :key="item.idPurchase || item.idIncome">
            <div class="record-main">
                <div v-if="currentTab === 'entradas'" class="icon-entrada">
                    <PhArrowUpRight size="16" weight="bold" />
                </div>
                <span v-else class="category-dot" :style="{ backgroundColor: item.fin_category?.color || 'var(--text-secondary)' }"></span>
                
                <div class="record-info">
                    <span class="title">{{ item.title }}</span>
                    <span class="subtitle">
                        <template v-if="item.fin_category?.description">{{ item.fin_category.description }} &bull; </template>
                        {{ toDate(item.date) }}
                    </span>
                 </div>
            </div>
            
             <div class="record-actions">
                <div class="record-value" :class="currentTab === 'entradas' ? 'text-success' : 'text-danger'">
                    {{ toBRL(item.value) }}
                </div>
                <div class="action-buttons">
                    <button v-if="currentTab === 'compras'" 
                        class="icon-btn" 
                        :class="item.paid ? 'paid-btn' : 'unpaid-btn'" 
                        @click="emit('toggle-paid', item)" 
                        :title="item.paid ? 'Voltar para pendente' : 'Efetivar gasto'">
                        <component :is="item.paid ? PhCheckCircle : PhCircle" size="22" :weight="item.paid ? 'fill' : 'regular'" />
                    </button>
                    <button class="icon-btn edit-btn" @click="emit('edit', item)" title="Editar">
                        <PhPencilSimple size="18" />
                    </button>
                    <button class="icon-btn delete-btn" @click="confirmDelete(item.idPurchase || item.idIncome)" title="Excluir">
                        <PhTrash size="18" />
                    </button>
                 </div>
            </div>
        </div>

        <div v-if="items.length === 0" class="empty-state">
            Nenhum registro encontrado neste mês.
        </div>

        <ConfirmModal 
            :isOpen="isConfirmingDelete"
            title="Excluir Registro?"
            message="Esta ação apagará este registro financeiro permanentemente. Tem certeza que deseja continuar?"
            @confirm="executeDelete"
            @cancel="isConfirmingDelete = false"
        />
    </div>
</template>

<style scoped>
    .text-danger { color: var(--danger-color); }
    .text-success { color: var(--success-color); }

    .records-wrapper {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        overflow: hidden;
    }

    .summary-bar {
        display: flex;
        justify-content: space-between;
        padding: 1.2rem 1.5rem;
        background-color: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--border-color);
    }
    .summary-bar .count { 
        font-weight: 600; 
        font-size: 0.95rem; 
        color: var(--text-primary); 
    }

    .summary-bar .total { 
        font-weight: 700; 
        font-size: 1.05rem; 
        font-feature-settings: "tnum"; }

    .record-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s;
    }
    .record-row:last-child { border-bottom: none; }
    .record-row:hover { background-color: rgba(255,255,255, 0.02); }

    .record-main { 
        display: flex; 
        align-items: center; gap: 1.2rem; 
    }
    .category-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

    .icon-entrada {
        background-color: rgba(52, 211, 153, 0.1); color: var(--success-color);
        width: 32px; height: 32px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
    }

    .record-info { 
        display: flex; 
        flex-direction: column; 
        gap: 0.2rem; 
    }
    
    .record-info .title { 
        font-weight: 600; 
        color: var(--text-primary); 
        font-size: 0.95rem; 
    }

    .record-info .subtitle { 
        font-size: 0.8rem; 
        color: var(--text-secondary); 
    }

    .record-actions { 
        display: flex; 
        align-items: center; 
        gap: 1.5rem; 
    }

    .paid-btn { color: var(--success-color); }
    .paid-btn:hover { color: var(--danger-color); } /* Se passar o mouse, ele avisa que vai desfazer */
    
    .unpaid-btn { color: var(--text-secondary); }
    .unpaid-btn:hover { color: var(--success-color); } /* Se passar o mouse, avisa que vai ficar verdinho */


    .record-value { font-weight: 600; font-size: 1rem; }
    
    .action-buttons { display: flex; gap: 4px; }
    .icon-btn { background: transparent; border: none; padding: 6px; cursor: pointer; transition: 0.2s; border-radius: 6px; display: flex; align-items: center;}
    .icon-btn.edit-btn { color: var(--text-secondary); }
    .icon-btn.edit-btn:hover { color: var(--text-primary); background: rgba(255,255,255, 0.05); }
    .icon-btn.delete-btn { color: var(--danger-color); }
    .icon-btn.delete-btn:hover { background: rgba(239, 68, 68, 0.1); }

    .empty-state { padding: 3rem; text-align: center; color: var(--text-secondary); }

    @media (max-width: 640px) {
        /* Cada linha vira coluna: info em cima, valor+ações embaixo */
        .record-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem 1.2rem;
        }

        .record-main {
            width: 100%;
        }

        /* Linha inferior: valor à esquerda, botões à direita */
        .record-actions {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 0;
        }

        .record-value {
            font-size: 1rem;
        }

        /* Reduz padding dos botões de ação para não ficarem grandes demais */
        .icon-btn {
            padding: 8px;
        }
    }
</style>