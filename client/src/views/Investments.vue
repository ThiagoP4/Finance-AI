<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue';
    import { usePiggybankStore, type Piggybank } from '../stores/usePiggybankStore';
    import { PhPiggyBank, PhTrendUp, PhPlus, PhTrash, PhArrowDownLeft, PhArrowUpRight } from '@phosphor-icons/vue'
    import PiggybankModal from '../components/Piggybank/PiggybankModal.vue'
    import PiggybankTransaction from '../components/Piggybank/PiggybankTransaction.vue'

    const piggybankStore = usePiggybankStore();

    const activeTab = ref('cofrinhos');

    const isCreateModalOpen = ref(false);
    const isTransactionModalOpen = ref(false);
    const transactionData = ref({
        piggybank: null as Piggybank | null,
        type: 'deposit' as 'deposit' | 'withdraw'
    });
    const openTransactionModal = (piggy: Piggybank, type: 'deposit' | 'withdraw') => {
        transactionData.value = { piggybank: piggy, type };
        isTransactionModalOpen.value = true;
    };
    const handleDelete = async (id: string) => {
        if(confirm('Tem certeza que deseja excluir este cofrinho?')) {
            await piggybankStore.deletePiggybank(id);
        }
    };
    const calculateProgress = (current: number, target: number) => {
        if (target === 0) return 100;
        const calc = (current / target) * 100;
        return calc > 100 ? 100 : Math.round(calc);
    };

    onMounted(async () => {
        await piggybankStore.fetchPiggybanks();
    });

    const totalGuardado = computed(() => {
        return piggybankStore.piggybanks
            .filter(p => p.composes_balance === true)
            .reduce((acc, curr) => acc + Number(curr.current_amount), 0);
    });

    const totalReservado = computed(() => {
        return piggybankStore.piggybanks
            .filter(p => p.composes_balance === false)
            .reduce((acc, curr) => acc + Number(curr.current_amount), 0);
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
</script>

<template>
    <div class="investments-container">
        <header class="page-header">
            <h1>Investimentos</h1>
        </header>
        <div class="tabs">
            <button
                class="tab-btn"
                :class="{
                    'active': activeTab === 'cofrinhos'
                }"
                @click="activeTab = 'cofrinhos'"
            >
                <PhPiggyBank size="18" weight="bold" /> Cofrinhos
            </button>
            <button
                class="tab-btn"
                :class="{
                    'active': activeTab === 'investimentos'
                }"
                @click="activeTab = 'investimentos'"
            >
                <PhTrendUp size="18" weight="bold" /> Ativos
            </button>
        </div>
        <div v-if="activeTab === 'cofrinhos'" class="tab-content">
            <div class="summary-cards">
                <div class="card summary-card guardado">
                    <span class="cart-title">Total guardado</span>
                    <h2 class="card-value">{{ formatCurrency(totalGuardado) }}</h2>
                </div>
                <div class="card summary-card reservado">
                    <span class="cart-title">Total reservado</span>
                    <h2 class="card-value">{{ formatCurrency(totalReservado) }}</h2>
                </div>
            </div>
            <div class="actions-row">
                <button class="btn-primary" @click="isCreateModalOpen = true">
                    <PhPlus size="16" weight="bold" />
                    Criar cofrinho
                </button>
            </div>
            <div v-if="piggybankStore.isLoading" style="color: var(--text-secondary); padding: 1rem;">
                Carregando seus cofrinhos...
            </div>
            <div v-else class="piggybanks-grid">
                <div v-for="piggy in piggybankStore.piggybanks" :key="piggy.id_piggybank" class="piggy-card">
                    <div class="piggy-header">
                        <div class="piggy-title-area">
                            <div class="piggy-icon">
                                <PhPiggyBank weight="fill" size="20" />
                            </div>
                            <span class="piggy-title">{{ piggy.title }}</span>
                        </div>
                        <div class="piggy-actions">
                            <button class="icon-btn delete-btn" @click="handleDelete(piggy.id_piggybank)">
                                <PhTrash size="18" weight="bold" />
                            </button>
                        </div>
                    </div>
                    <h3 class="piggy-amount">{{ formatCurrency(piggy.current_amount) }}</h3>
                    <div class="piggy-meta">
                        <span>Meta: {{ formatCurrency(piggy.target_amount) }}</span>
                        <span>{{ calculateProgress(piggy.current_amount, piggy.target_amount) }}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: calculateProgress(piggy.current_amount, piggy.target_amount) + '%' }"></div>
                    </div>
                    <div class="piggy-buttons">
                        <button class="btn-outline" @click="openTransactionModal(piggy, 'deposit')">
                            <PhArrowDownLeft size="16" /> Depositar
                        </button>
                        <button class="btn-outline" @click="openTransactionModal(piggy, 'withdraw')">
                            <PhArrowUpRight size="16" /> Sacar
                        </button>
                    </div>
                </div>
                <p v-if="piggybankStore.piggybanks.length === 0" style="color: var(--text-secondary); padding: 1rem;">
                    Nenhum cofrinho criado ainda
                </p>
            </div>
        </div>
        <div v-if="activeTab === 'ativos'" class="tab-content">
            <p style="color: var(--text-secondary); padding: 1rem;">Aba de ativos em construção...</p>
        </div>  
    </div>

    <PiggybankModal 
        v-if="isCreateModalOpen" 
        @close="isCreateModalOpen = false" 
    />
    
    <PiggybankTransaction 
        v-if="isTransactionModalOpen && transactionData.piggybank" 
        :piggybank="transactionData.piggybank" 
        :type="transactionData.type" 
        @close="isTransactionModalOpen = false" 
    />

</template>

<style scoped>
    .investments-container {
        display: flex;
        flex-direction: column;
    }

    .page-header h1{
        font-size: 2rem;
        color: var(--text-primary);
    }
    
    .tabs {
        display: flex;
        gap: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
    }

    .tab-btn { 
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.5rem 0;
        position: relative;
        transition: color 0.2s;
    }

    .tab-btn:hover {
        color: var(--text-primary);
    }

    .tab-btn.active {
        color: var(--text-primary);
    }

    .tab-btn.active:after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--primary-color);
        border-radius: 2px 2px 0 0;
    }

    .card {
        background-color: var(--bg-card);
        border-radius: 12px;
        padding: 1.25rem;
        border: 1px solid var(--border-color);
        flex: 1;
    }

    .summary-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .summary-cards {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .card-title {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .card-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }

    .actions-row {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }

    /* GRID DE COFRINHOS */
    .piggybanks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .piggy-card {
        background-color: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1.25rem;
        border-top: 4px solid var(--success-color, #2ed573);
    }

    .piggy-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .piggy-title-area {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    .piggy-icon {
        background-color: rgba(46, 213, 115, 0.1);
        color: var(--success-color, #2ed573);
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .piggy-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 1rem;
    }

    .icon-btn {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        transition: color 0.2s;
    }
    .icon-btn.delete-btn:hover { color: var(--danger-color, #ff4757); }

    .piggy-amount {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--text-primary);
        margin: 0 0 0.2rem 0;
    }

    .piggy-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .progress-bar {
        width: 100%;
        height: 6px;
        background-color: var(--bg-page);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--primary-color, #ff4757);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .piggy-buttons {
        display: flex;
        gap: 0.8rem;
    }

    .btn-outline {
        flex: 1;
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        padding: 0.5rem;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-outline:hover {
        background: var(--bg-page);
    }

</style>