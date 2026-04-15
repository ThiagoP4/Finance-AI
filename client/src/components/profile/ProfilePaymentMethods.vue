<script setup lang="ts">

    import { ref } from 'vue'
    import { useProfileStore } from '../../stores/useProfileStore';
    import { useAlertStore } from '../../stores/useAlertStore'
    import ConfirmModal from '../ConfirmModal.vue'
    import { PhPencilSimple, PhTrash } from '@phosphor-icons/vue';
    import { POPULAR_BANKS, getBankLogoUrl } from '../../utils/banks';

    const profileStore = useProfileStore();
    const showAddForm = ref(false)
    const isSaving = ref(false)
    const editingCardId = ref<number | null>(null)
    
    const alertStore = useAlertStore();
    
    const newNickname = ref('')
    const newBankName = ref('')
    const newMethodType = ref('crédito')
    const newClosingDay = ref<number | ''>('')
    const newDueDay = ref<number | ''>('')
    
    const isConfirmingDelete = ref(false)
    const cardToDelete = ref<number | null>(null)

    const handleImageError = (e: Event, fallbackName: string) => {
        const target = e.target as HTMLImageElement;
        if (target && !target.src.includes('ui-avatars')) {
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff`;
        } else if (target) {
            target.style.display = 'none';
        }
    }

    const toggleAddForm = () => {
        showAddForm.value = !showAddForm.value 
        if(!showAddForm.value) {
            newNickname.value = ''
            newBankName.value = ''
            newMethodType.value = 'crédito'
            newClosingDay.value = ''
            newDueDay.value = ''
            editingCardId.value = null
        }
    }

    const saveCard = async () => {
        if (!newNickname.value || !newBankName.value) return;

        isSaving.value = true;
        try {
            const payload = {
                nickname: newNickname.value,
                bank_name: newBankName.value,
                method_type: newMethodType.value,
                closing_day: newClosingDay.value || null,
                due_day: newDueDay.value || null
            }

            if (editingCardId.value) {
                await profileStore.updatePaymentMethod(editingCardId.value, payload);
            } else {
                await profileStore.savePaymentMethod(
                    newNickname.value, 
                    newBankName.value, 
                    newMethodType.value,
                    newClosingDay.value || undefined,
                    newDueDay.value || undefined
                );
            }
            
            toggleAddForm() // Fecha e reseta form ao terminar
        } catch (error) {
            console.error('Erro ao salvar método:', error)
        } finally {
            isSaving.value = false;
        }
    }

    const startEditCard = (card: any) => {
        newNickname.value = card.nickname;
        newBankName.value = card.bank_name;
        newMethodType.value = card.method_type;
        newClosingDay.value = card.closing_day || '';
        newDueDay.value = card.due_day || '';
        editingCardId.value = card.id_payment;
        showAddForm.value = true;
    }

    const confirmDeleteCard = (id: number) => {
        cardToDelete.value = id;
        isConfirmingDelete.value = true;
    }

    const deleteCard = async () => {
        if(cardToDelete.value) {
            alertStore.showAlert('Apagando...', 'warning');
            await profileStore.deletePaymentMethod(cardToDelete.value);
            isConfirmingDelete.value = false;
            cardToDelete.value = null;
            alertStore.showAlert('Método de pagamento removido com sucesso.', 'success');
        }
    }

</script>

<template>
    <div class="profile-card">
        <div class="card-header-actions">
            <h2>Meus Pagamentos</h2>
            <div class="header-controls">
                <button class="btn-outline-small" @click="toggleAddForm">
                    {{ showAddForm ? 'Visualizar pagamentos' : '+ Adicionar' }}
                </button>
            </div> 
        </div>

        <div class="card-body-wrapper">
            <div class="profile-card-content view-layer" :class="{ 'view-hidden': showAddForm }">
                <!-- O Vue Renderiza automaticamente os cartões do banco aqui! -->
                <div v-if="profileStore.myCards && profileStore.myCards.length > 0" class="cards-list">
                    
                    <div v-for="card in profileStore.myCards" :key="card.id_payment" class="payment-card-item">
                        <div class="card-info" style="flex-direction: row; align-items: center; gap: 1rem;">
                            <!-- Exibe a logo do banco se achar no nosso utils -->
                            <img v-if="getBankLogoUrl(card.bank_name)" 
                                 :src="getBankLogoUrl(card.bank_name) ?? undefined" 
                                 :alt="card.bank_name" 
                                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: contain; background: white; padding: 2px;" 
                                 @error="(e) => handleImageError(e, card.bank_name)" />
                            
                            <div class="card-text">
                                <p class="card-name">{{ card.nickname }}</p>
                                <p class="card-type">{{ card.bank_name }} - {{ card.method_type }}</p>
                                <p class="card-invoice" v-if="card.method_type === 'crédito' && (card.closing_day || card.due_day)">
                                    <span v-if="card.closing_day">Fecha dia {{ card.closing_day }}</span>
                                    <span v-if="card.closing_day && card.due_day"> &bull; </span>
                                    <span v-if="card.due_day">Vence dia {{ card.due_day }}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div class="card-actions">
                            <button class="action-btn edit" @click="startEditCard(card)" title="Editar pagamento">
                                <PhPencilSimple :size="18" />
                            </button>
                            <button class="action-btn delete" @click="confirmDeleteCard(card.id_payment)" title="Excluir pagamento">
                                <PhTrash :size="18" />
                            </button>
                        </div>
                    </div>

                </div>
                <div v-else class="empty-state">
                    <p>Nenhum método de pagamento cadastrado</p>
                </div>
            </div>

            <form class="profile-card-content drawer-form view-layer" :class="{ 'view-hidden': !showAddForm }" @submit.prevent="saveCard">
                <div class="form-grid">
                    <div class="profile-card-content-item">
                        <label for="nickname">Apelido do Cartão</label>
                        <input type="text" id="nickname" v-model="newNickname" placeholder="Ex: NuBank Crédito" required>
                    </div>
                    <div class="profile-card-content-item">
                        <label for="bankName">Instituição Emissora</label>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <!-- Preview Dinâmico da Logo -->
                            <img v-if="newBankName && getBankLogoUrl(newBankName)" 
                                 :src="getBankLogoUrl(newBankName) ?? undefined" 
                                 alt="Logo" 
                                 style="width: 40px; height: 40px; border-radius: 8px; object-fit: contain; background: white; padding: 2px;" 
                                 @error="(e) => handleImageError(e, newBankName)" />
                            
                            <select id="bankName" v-model="newBankName" required style="flex: 1;">
                                <option value="" disabled>Selecione seu banco...</option>
                                <option v-for="bank in POPULAR_BANKS" :key="bank.id" :value="bank.name">{{ bank.name }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="profile-card-content-item">
                        <label for="methodType">Tipo</label>
                        <select id="methodType" v-model="newMethodType" required>
                            <option value="crédito">Crédito</option>
                            <option value="débito">Débito</option>
                            <option value="vale refeição">Vale Refeição</option>
                            <option value="vale alimentação">Vale Alimentação</option>
                            <option value="pix">Pix</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                    <div class="profile-card-content-item" v-if="newMethodType === 'crédito'">
                        <label for="closingDay">Dia do Fechamento</label>
                        <input type="number" id="closingDay" v-model.number="newClosingDay" placeholder="Ex: 5" min="1" max="31">
                    </div>
                    <div class="profile-card-content-item" v-if="newMethodType === 'crédito'">
                        <label for="dueDay">Dia do Vencimento</label>
                        <input type="number" id="dueDay" v-model.number="newDueDay" placeholder="Ex: 15" min="1" max="31">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary" :disabled="isSaving">
                        {{ isSaving ? 'Salvando...' : 'Salvar' }}
                    </button>
                    <button type="button" class="btn-outline" @click="toggleAddForm">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <ConfirmModal 
        :is-open="isConfirmingDelete"
        title="Excluir Método de Pagamento"
        message="Tem certeza que deseja excluir este método de pagamento? Esta ação não pode ser desfeita."
        confirm-text="Excluir"
        cancel-text="Cancelar"
        @confirm="deleteCard"
        @cancel="isConfirmingDelete = false; cardToDelete = null"
    />
</template>

<style scoped>
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

    .cards-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .payment-card-item {
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.02);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .card-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .card-name {
        font-weight: bold;
        margin: 0;
        color: var(--text-primary);
    }

    .card-type {
        color: var(--text-secondary);
        font-size: 0.85rem;
        margin: 0;
        text-transform: capitalize;
    }

    .card-invoice {
        color: var(--primary-color);
        font-size: 0.75rem;
        margin: 0.15rem 0 0 0;
        font-weight: 500;
    }

    .card-actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        background: transparent;
        border: none;
        padding: 0.4rem;
        border-radius: 0.4rem;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }

    .action-btn.delete:hover {
        border-color: var(--danger-color);
        color: var(--danger-color);
        background: rgba(239, 68, 68, 0.1);
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
    }

    .btn-primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.6rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
    }

    .btn-primary:hover:not(:disabled) {
        background: var(--primary-color-hover);
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-outline {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        padding: 0.6rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
    }

    .btn-outline:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }
</style>
