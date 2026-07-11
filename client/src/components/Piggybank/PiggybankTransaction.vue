<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PhX } from '@phosphor-icons/vue';
import { usePiggybankStore } from '../../stores/usePiggybankStore';
import type { Piggybank } from '../../stores/usePiggybankStore';

const props = defineProps<{
    piggybank: Piggybank;
    type: 'deposit' | 'withdraw';
}>();

const emit = defineEmits(['close']);
const piggybankStore = usePiggybankStore();

const amount = ref<number | null>(null);
const maxAvailable = ref<number>(0);

onMounted(async () => {
    if (props.type === 'deposit') {
        maxAvailable.value = await piggybankStore.getAvailableToDeposit();
    }
});

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const handleTransaction = async () => {
    if (!amount.value || amount.value <= 0) return;
    
    try {
        await piggybankStore.addTransaction(props.piggybank.id_piggybank, props.type, amount.value);
        
        amount.value = null;
        emit('close'); // Fecha o modal
    } catch (error: any) {
        alert(error.message); // Exibe a mensagem de erro (ex: Saldo insuficiente)
    }
};
</script>

<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <div class="modal-header">
                <h3>{{ type === 'deposit' ? 'Depositar' : 'Sacar' }} - {{ piggybank.title }}</h3>
                <button class="close-btn" @click="$emit('close')"><PhX size="20" /></button>
            </div>
            
            <div class="input-group">
                <div class="label-row" style="display: flex; justify-content: space-between;">
                    <label>Valor (R$)</label>
                    <span v-if="type === 'deposit'" class="max-available">
                        Disponível: {{ formatCurrency(maxAvailable) }}
                    </span>
                </div>
                <input v-model="amount" type="number" placeholder="0.00" />
            </div>
            
            <div class="modal-actions">
                <button class="btn-outline" @click="$emit('close')">Cancelar</button>
                <button class="btn-primary" @click="handleTransaction">Confirmar</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* O CSS é idêntico ao do outro modal */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;
    z-index: 1000;
}
.modal-content {
    background: var(--bg-card); 
    padding: 2rem; 
    border-radius: 12px;
    width: 100%; 
    max-width: 400px; 
    border: 1px solid var(--border-color);
}
.modal-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 1.5rem; 
}
.modal-header h3 { 
    margin: 0; 
    font-size: 1.2rem; 
    color: var(--text-primary); 
}
.close-btn { 
    background: none; 
    border: none; 
    color: var(--text-secondary); 
    cursor: pointer; 
}
.close-btn:hover { color: var(--text-primary); }
.input-group { 
    display: flex; 
    flex-direction: column; 
    gap: 0.5rem; 
    margin-bottom: 1.5rem; 
}
.input-group label { 
    font-size: 0.85rem; 
    color: var(--text-secondary); 
}
.max-available {
    font-size: 0.75rem;
    color: var(--success-color, #2ed573);
    font-weight: 600;
}
.input-group input { 
    padding: 0.8rem; 
    border-radius: 8px; 
    border: 1px solid var(--border-color);
    background: var(--bg-page); 
    color: var(--text-primary);
}
.modal-actions { 
    display: flex; 
    justify-content: flex-end; 
    gap: 1rem; 
}
.btn-outline {
    background: transparent; 
    border: 1px solid var(--border-color);
    color: var(--text-primary); 
    padding: 0.6rem 1.2rem;
    border-radius: 8px; 
    cursor: pointer; 
    font-weight: 500;
}
.btn-outline:hover { 
    background: var(--bg-page); 
}
</style>
