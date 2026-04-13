 <script setup lang="ts">
    import { ref, computed } from 'vue';
    import { useProfileStore } from '../../stores/useProfileStore';
    import { useAlertStore } from '../../stores/useAlertStore';
    import { PhRocketLaunch, PhClockCounterClockwise, PhCheckCircle, PhPencilSimple, PhTrash } from '@phosphor-icons/vue';
    import ConfirmModal from '../ConfirmModal.vue';

    const profileStore = useProfileStore();
    const alertStore = useAlertStore();

    const showAddForm = ref(false);
    const newGoalDescription = ref('');
    const newGoalAmount = ref<number | null>(null);
    const newGoalDeadline = ref('');
    const isSaving =  ref(false);
    const activeTab = ref('active');
    const today = new Date().toISOString().split('T')[0];

    const editingGoalId = ref<string | null>(null); // Armazena o ID se estivermos editando, ou null se for criação


    const activeGoals = computed(() => {
        return profileStore.financialGoals.filter(g => g.status === 'em andamento');
    });

    const historyGoals = computed(() => {
        return profileStore.financialGoals.filter(g => g.status === 'concluída');
    });

    const currentGoals = computed(() => {
        return activeTab.value === 'active' ? activeGoals.value : historyGoals.value;
    });

    const completeGoal = async (id: string) => {
        alertStore.showAlert('Celebrando sua vitória...', 'success');
        await profileStore.updateFinancialGoal(id, { status: 'concluída' });
    };

    const startEditGoal = (goal: any) => {
        editingGoalId.value = goal.id_goal;
        newGoalDescription.value = goal.description;
        newGoalAmount.value = goal.target_amount;
        newGoalDeadline.value = goal.deadline.split('T')[0]; // Pega apenas a data YYYY-MM-DD
        showAddForm.value = true; // Abre o formulário
    };

    const isConfirmingDelete = ref(false);
    const goalToDelete = ref<string | null>(null);

    const confirmDeleteGoal = (id: string) => {
        goalToDelete.value = id;
        isConfirmingDelete.value = true;
    };

    const executeDelete = async () => {
        if (goalToDelete.value) {
            alertStore.showAlert('Apagando...', 'warning');
            await profileStore.deleteFinancialGoal(goalToDelete.value);
            isConfirmingDelete.value = false;
            goalToDelete.value = null;
            alertStore.showAlert('Meta removida com sucesso.', 'success');
        }
    };

    const toggleAddForm = () => {
        showAddForm.value = !showAddForm.value;
        
        if(!showAddForm.value) {
            newGoalDescription.value = '';
            newGoalAmount.value = null;
            newGoalDeadline.value = '';
        }
    };

    const saveNewGoal = async () => {
        if(!newGoalDescription.value || !newGoalAmount.value || !newGoalDeadline.value) {
            alertStore.showAlert('Preencha todos os campos da meta!', 'warning');
            return;
        }
        isSaving.value = true;

        let result;

            
        if (editingGoalId.value) {
            result = await profileStore.updateFinancialGoal(editingGoalId.value, {
            description: newGoalDescription.value,
            target_amount: newGoalAmount.value,
            deadline: newGoalDeadline.value
        });

        } else {
            result = await profileStore.saveFinancialGoal(
                newGoalDescription.value,
                newGoalAmount.value,
                newGoalDeadline.value
            );
        }

        if (result.success) {
            alertStore.showAlert(editingGoalId.value ? 'Meta atualizada!' : 'Meta criada!', 'success');
            resetForm();
           
        } else {
            alertStore.showAlert('Erro ao recrutar a meta: ' + result.message, 'error');
        }
        isSaving.value = false;
    }

    const resetForm = () => {
        editingGoalId.value = null;
        newGoalDescription.value = '';
        newGoalAmount.value = null;
        newGoalDeadline.value = '';
        showAddForm.value = false;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        date.setUTCHours(12);
        return date.toLocaleDateString('pt-BR');
    };

</script>


<template>
    <div class="profile-card">
        <div class="card-header-actions">
            <h2>Metas Financeiras</h2>
            <div class="header-controls">
                <div class="card-tabs">
                    <button
                        :class="{ active: activeTab === 'active' }"
                        @click="activeTab = 'active'"
                        title="Em aberto"
                    >
                        <PhRocketLaunch :size="18" />
                        <span class="tab-count">({{ activeGoals.length }})</span>
                    </button>
                    <button 
                        :class="{ active: activeTab === 'history' }" 
                        @click="activeTab = 'history'"
                        title="historico"
                    >
                        <PhClockCounterClockwise :size="18" />
                        <span class="tab-count">({{ historyGoals.length }})</span>
                    </button>
                </div>
                <button class="btn-outline-small" @click="toggleAddForm">
                    {{ showAddForm ? 'Visualizar metas' : '+ Adicionar' }}
                </button>
            </div>
        </div>
        <div class="card-body-wrapper">
            <!-- Camada 1: A Lista (Sobreposta nativamente pelo Grid) -->
            <div class="profile-card-content goals-container view-layer" :class="{ 'view-hidden': showAddForm }">
                <div v-if="profileStore.financialGoals && profileStore.financialGoals.length > 0" class="goals-list">
                    <div v-for="goal in currentGoals" :key="goal.id_goal" class="goal-item-card">
                        <div class="goal-header-wrapper">
                            <div class="goal-header-meta">
                                <span class="goal-status" :class="goal.status.replace(/ /g, '-').toLowerCase()">{{ goal.status }}</span>
                                <div class="goal-actions-top">
                                    <button v-if="goal.status === 'em andamento'" 
                                        class="action-btn check" 
                                        @click="completeGoal(goal.id_goal)" 
                                        title="Marcar como concluída">
                                        <PhCheckCircle :size="18" />
                                    </button>
                                    
                                    <button class="action-btn edit" @click="startEditGoal(goal)" title="Editar meta">
                                        <PhPencilSimple :size="18" />
                                    </button>
                                    
                                    <button class="action-btn delete" @click="confirmDeleteGoal(goal.id_goal)" title="Excluir meta">
                                        <PhTrash :size="18" />
                                    </button>
                                </div>
                            </div>
                            <span class="goal-title">{{ goal.description }}</span>
                        </div>
                        <div class="goal-details">
                            <div class="detail-col">
                                <span class="detail-label">Objetivo de Caixa</span>
                                <span class="detail-value highlight">{{ formatCurrency(goal.target_amount) }}</span>
                            </div>
                            <div class="detail-col text-right">
                                <span class="detail-label">Prazo Final</span>
                                <span class="detail-value">{{ formatDate(goal.deadline) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <p>Nenhuma meta financeira cadastrada ainda</p>
                </div>
            </div>

            <!-- Camada 2: O Formulário (Sobreposto na mesma altura dinamicamente) -->
            <form class="profile-card-content drawer-form view-layer" :class="{ 'view-hidden': !showAddForm }" @submit.prevent="saveNewGoal">
                <h3 class="form-title">Nova Meta Financeira</h3>
                <div class="form-grid">
                    <div class="profile-card-content-item full-width">
                        <label for="goal_desc">O que você quer alcançar?</label>
                        <input type="text" id="goal_desc" v-model="newGoalDescription" placeholder="Ex: Viagem para o Japão" required>
                    </div>
                    <div class="profile-card-content-item">
                        <label for="goal_amount">Valor Total (R$)</label>
                        <input type="number" id="goal_amount" v-model="newGoalAmount" placeholder="Ex: 5000" min="1" step="0.01" required>
                    </div>
                    <div class="profile-card-content-item">
                        <label for="goal_deadline">Data Limite</label>
                        <input type="date" id="goal_deadline" v-model="newGoalDeadline" :min="today" required>
                    </div>
                </div>
                <div class="form-actions-row">
                    <button class="btn-cancel" type="button" @click="toggleAddForm">Cancelar</button>
                    <button class="btn-apply" type="submit" :disabled="isSaving">
                        {{ isSaving ? 'Guardando...' : 'Salvar Nova Meta' }}
                    </button>
                </div>
            </form>
        </div>

        <ConfirmModal 
            :isOpen="isConfirmingDelete"
            title="Excluir Meta?"
            message="Essa ação deletará esta meta financeira permanentemente do banco de dados. Deseja mesmo continuar?"
            @confirm="executeDelete"
            @cancel="isConfirmingDelete = false"
        />
    </div>
</template>

<style scoped>
.profile-card {
    background: var(--bg-card);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.card-tabs {
    display: flex;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.25rem;
    border-radius: 0.75rem;
}

.card-tabs button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.card-tabs button.active {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.goal-header-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.goal-actions-top {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.action-btn.check:hover { color: #22c55e; border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.action-btn.edit:hover { color: #3b82f6; border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.action-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    
.card-header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.card-header-actions h2 {
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0;
}
    
.btn-outline-small {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-outline-small:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.card-body-wrapper {
    position: relative;
    flex: 1;
    padding-top: 1rem;
    display: grid;
    align-items: start;
}

.view-layer {
    grid-area: 1 / 1;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.view-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateX(-10px);
    position: absolute;
    width: 100%;
}

.goals-container {
    margin-top: 0;
}
    
/* Animação de Deslizamento Elegante */
.slide-fade-enter-active {
    transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
    transform: translateX(10px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateX(-10px);
    opacity: 0;
}
    
.form-title {
    color: var(--text-primary);
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-weight: 500;
}

.form-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
}

@media (min-width: 640px) {
    .form-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .full-width {
        grid-column: 1 / -1;
    }
}

.profile-card-content-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.profile-card-content-item label {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
}

.profile-card-content-item input {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.8rem;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.profile-card-content-item input:focus {
    border-color: var(--primary-color);
    outline: none;
}
    
.profile-card-content-item input[type=number]::-webkit-inner-spin-button, 
.profile-card-content-item input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.tab-count {
    font-weight: 600;
    font-size: 0.75rem;
    margin-left: 4px;
}

::-webkit-calendar-picker-indicator {
    filter: invert(0.8);
    cursor: pointer;
}

.form-actions-row {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
}
    
.btn-cancel {
    background-color: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 0.75rem 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel:hover {
    color: var(--text-primary);
}

/* Estilo Exclusivo da Lista de Metas Atuais */
.empty-state {
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem 0;
    font-size: 0.95rem;
}

.goals-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 350px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.goals-list::-webkit-scrollbar {
    width: 6px;
}

.goals-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
}
    
.goal-item-card {
    padding: 1.25rem;
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    background: rgba(255,255,255,0.02);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: transform 0.2s, border-color 0.2s;
}

.goal-item-card:hover {
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.04);
    transform: none;
}
    
.goal-header-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.goal-title {
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--text-primary);
    flex: 1;
    white-space: break-word;
    overflow-wrap: break-word;
    line-height: 1.4;
}
    
.goal-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
}

.goal-status.em-andamento {
    background: rgba(234, 179, 8, 0.15);
    color: #eab308;
    border: 1px solid rgba(234, 179, 8, 0.3);
}

.goal-status.concluída {
    background: rgba(34, 197, 94, 0.15) !important;
    color: #22c55e !important;
    border: 1px solid rgba(34, 197, 94, 0.3) !important;
    font-weight: 700;
}
    
.goal-details {
    display: flex;
    justify-content: space-between;
    background: rgba(0,0,0,0.2);
    padding: 0.75rem;
    border-radius: 0.5rem;
}

.detail-col {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.text-right {
    text-align: right;
}

.detail-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 500;
}

.detail-value {
    font-size: 0.95rem;
    color: var(--text-primary);
    font-weight: 500;
}

.detail-value.highlight {
    color: #fff;
    font-weight: 600;
}

</style>
