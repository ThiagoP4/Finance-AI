<script setup lang="ts">
import { ref } from 'vue';
import { PhX } from '@phosphor-icons/vue';
import { usePiggybankStore } from '../../stores/usePiggybankStore';

const emit = defineEmits(['close']);
const piggybankStore = usePiggybankStore();

const newPiggybank = ref({
    title: '',
    target_amount: 0,
    composes_balance: true
});

const handleCreate = async () => {
    if (!newPiggybank.value.title) return;
    
    await piggybankStore.createPiggybank(
        newPiggybank.value.title,
        newPiggybank.value.target_amount,
        newPiggybank.value.composes_balance
    );
    
    // Reseta e avisa a view pai para fechar o modal
    newPiggybank.value = { title: '', target_amount: 0, composes_balance: true };
    emit('close');
};
</script>

<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Novo Cofrinho</h3>
                <button class="close-btn" @click="$emit('close')"><PhX size="20" /></button>
            </div>
            
            <div class="input-group">
                <label>Nome do objetivo</label>
                <input v-model="newPiggybank.title" type="text" placeholder="Ex: Viagem para Europa" />
            </div>
            
            <div class="input-group">
                <label>Meta (R$)</label>
                <input v-model="newPiggybank.target_amount" type="number" placeholder="Ex: 5000" />
            </div>
            
            <div class="input-checkbox">
                <input type="checkbox" id="composes" v-model="newPiggybank.composes_balance" />
                <label for="composes">Compõe o saldo? </label>
            </div>
            
            <div class="modal-actions">
                <button class="btn-outline" @click="$emit('close')">Cancelar</button>
                <button class="btn-primary" @click="handleCreate">Criar Cofrinho</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex; align-items: center; justify-content: center;
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
    flex-direction: column; gap: 0.5rem; 
    margin-bottom: 1rem; 
}
.input-group label { 
    font-size: 0.85rem; 
    color: var(--text-secondary); 
}
.input-group input {
    padding: 0.8rem; 
    border-radius: 8px; 
    border: 1px solid var(--border-color);
    background: var(--bg-page); 
    color: var(--text-primary);
}
.input-checkbox { 
    display: flex; 
    align-items: center; 
    gap: 0.5rem; 
    margin-bottom: 1.5rem; 
}
.input-checkbox label { 
    font-size: 0.85rem; 
    color: var(--text-secondary); 
}
.modal-actions { 
    display: flex; 
    justify-content: flex-end; gap: 1rem; 
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
