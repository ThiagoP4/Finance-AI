<script setup lang="ts">
    import  { ref, onMounted } from 'vue';
    import { storeToRefs } from "pinia";
    import { PhArrowDownLeft, PhArrowUpRight, PhChartBar, PhCreditCard, PhListDashes } from '@phosphor-icons/vue';
    import { useProfileStore } from "../stores/useProfileStore";
    import { supabase } from '../services/supabase';

    const profileStore = useProfileStore();
    const { userName, myCards } = storeToRefs(profileStore);

   const totalIncome = ref(0);
   const totalExpense = ref(0);
   const currentBalance = ref(0);

   const recentTransactions = ref<any[]>([]);

   const fetchFinancialSummary = async () => {
    try {
        const now = new Date();
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const today = now.toISOString().split('T')[0];

        const { data: incomes } = await supabase
            .from('fin_income')
            .select('value')
            .gte('date', startOfMonth)
            .lte('date', endOfMonth)
            .eq('user_id', profileStore.userId)

        totalIncome.value = (incomes || []).reduce((acc, curr) => acc + Number(curr.value), 0)

        const { data: expenses } = await supabase
        .from('fin_installment')
        .select('value')
        .gte('dueDate', startOfMonth)
        .lte('dueDate', endOfMonth)

        totalExpense.value = (expenses || []).reduce((acc, curr) => acc + Number(curr.value), 0)

        currentBalance.value = totalIncome.value - totalExpense.value;
    
        const { data: latestIncomes } = await supabase
            .from('fin_income')
            .select('title, value, date')
            .gte('date', startOfMonth)
            .lte('date', today)
            .order('date', { ascending: false })
            .limit(5);

        const { data: latestExpenses } = await supabase
            .from('fin_installment')
            .select('value, dueDate, fin_purchase!inner(title)')
            .gte('dueDate', startOfMonth)
            .lte('dueDate', today)
            .order('dueDate', { ascending: false })
            .limit(5);
        
        // Mesclando
        const mappedIncomes = (latestIncomes || []).map((i: any) => ({
            title: i.title,
            value: Number(i.value),
            date: i.date,
            type: 'income'
        }));
        const mappedExpenses = (latestExpenses || []).map((e: any) => ({
            title: e.fin_purchase?.title || 'Despesa',
            value: Number(e.value),
            date: e.dueDate,
            type: 'expense'
        }));

        recentTransactions.value = [...mappedIncomes, ...mappedExpenses]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
            

    } catch (error) {
        console.error("Erro ao buscar dados financeiros", error);
    }
   }

   onMounted(async () => {
    if(myCards.value.length === 0) {
        await profileStore.fetchProfileData();
    }
    await fetchFinancialSummary()
   });

   const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
   };

   const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // Pega apenas a data (YYYY-MM-DD) e descarta a hora (T00:00:00...)
    const onlyDate = dateStr.split('T')[0] || "";
    const parts = onlyDate.split('-');
    if (parts.length === 3){
         return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('pt-BR');
   };

</script>

<template>
    <div class="home-container">
        <header class="home-header">
            <h1>Olá {{ userName }}!</h1>
            <p>Informações Financeiras</p>
        </header>
        <div class="dashboard-grid">
            <div class="card balance-card">

                <!-- CARTÃO DE SALDO -->
                <h3>Saldo disponível</h3>
                <h2>{{ formatCurrency(currentBalance) }}</h2>
                <div class="balance-details">

                    <!-- Receitas -->
                    <div class="financial-item">
                        <div class="icon-circle icon-income">
                            <PhArrowDownLeft size="18" weight="bold" />
                        </div>
                        <div class="financial-text">
                            <span>Receitas</span>
                            <p>{{ formatCurrency(totalIncome) }}</p>
                        </div>
                    </div>
                    
                    <!-- Despesas -->
                    <div class="financial-item">
                        <div class="icon-circle icon-expense">
                            <PhArrowUpRight size="18" weight="bold" />
                        </div>
                        <div class="financial-text">
                            <span>Despesas</span>
                            <p>{{ formatCurrency(totalExpense) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARTÃO DE FORMAS DE PAGAMENTO -->
            <div class="card mycards-card">
                <h3>Meus Cartões</h3>
                <div class="cards-scroll-container" v-if="myCards.length > 0">
                    <div class="credit-card-mockup" v-for="card in myCards" :key="card.id_payment">
                        <div class="cc-header">
                            <PhCreditCard size="22" weight="fill" />
                            <span class="cc-bank">{{ card.bank_name || 'Meu Banco' }}</span>
                        </div>
                        <div class="cc-body">
                            <p class="cc-name"> {{ card.nickname || 'Meu Cartão' }}</p>
                            <p class="cc-dates">Fecha dia {{ card.closing_day || 'X' }} • Vence dia {{ card.due_day || 'X' }}</p>
                        </div>
                    </div>
                </div>
                <div v-else style="color: gray; font-size: 0.9rem; text-align: center; margin-top: 1rem;">
                    Nenhum cartão cadastrado
                    <button class="btn-details" @click="$router.push('/settings')">
                        <PhCreditCard size="16" /> Adicionar
                    </button>              
                </div>
            </div>

            <!-- CARTÃO DE ULTIMAS TRANSAÇÕES-->
            <div class="card transactions-card">
                <div class="card-header">
                    <h3>Últimas Transações</h3>
                    <button class="btn-details" @click="$router.push('/records')">
                        <PhListDashes size="16" /> Ver mais
                    </button>
                </div>
                <div class="transactions-list">
                    <div class="transaction-item" v-for="(tx, index) in recentTransactions" :key="index">
                        <div class="tx-icon" :style="{ 
                            color: tx.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)',
                            backgroundColor: tx.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)'
                        }">
                            <span>$</span>
                        </div>
                        <div class="tx-info">
                            <h4>{{ tx.title }}</h4>
                            <p>{{ formatDate(tx.date) }}</p>
                        </div>
                        <div class="tx-value" :class="{ 'negative': tx.type === 'expense', 'positive': tx.type === 'income' }">
                            {{ tx.type === 'expense' ? '-' : '+' }} {{ formatCurrency(tx.value) }}
                        </div>
                    </div>
                    
                    <div v-if="recentTransactions.length === 0" style="color: gray; text-align: center;">
                        Sem transações neste mês.
                    </div>
                </div>
            </div>

            <!-- CARTÃO DE ESTATÍSTICAS -->
            <div class="card statistics-card">
                <div class="card-header">
                    <h3>Estatísticas</h3>
                    <button class="btn-details" @click="$router.push('/dashboard')">
                        <PhChartBar size="16" /> Detalhes
                    </button>
                </div>
                <div class="stats-content">
                    <div class="chart-placeholder">
                        <h2>Gráfico</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>


/* === GERAL === */
.home-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.home-header h1 {
    font-size: 2rem;
    margin-bottom: 0.2rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.home-header p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.card {
    background-color: var(--bg-card);
    border-radius: 16px;
    padding: 1.25rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}


/* === SALDO === */
.balance-card {
    background: var(--card-highlight-bg);
    border: 1px solid var(--card-highlight-border);
}

.balance-card h3 {
    font-size: 0.9rem;
    color: var(--card-highlight-title);
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.balance-card h2 {
    font-size: 2.8rem; /* Tamanho Gigante igual ao layout */
    font-weight: 700;
    color: var(--card-highlight-text);
    margin-bottom: 2rem;
    letter-spacing: -1px;
}

.balance-details {
    display: flex;
    gap: 2.5rem;
}

.financial-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-income {
    background-color: var(--success-bg);
    color: var(--success-text);
}

.icon-expense {
    background-color: var(--danger-bg);
    color: var(--danger-text);
}

.financial-text span {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
    letter-spacing: 0.5px;
}


.financial-text p {
    font-size: 1.4rem;
    color: var(--text-primary);
    font-weight: 700;
    margin: 0;
}

/* === FORMAS DE PAGAMENTO === */

.cards-scroll-container {
    display: flex;
    align-items: center;
    overflow-x: auto;
    gap: 1rem;
    padding-bottom: 0.8rem;
    margin-top: 1rem;
    scrollbar-width: thin;
    scrollbar-color: var(--border-color) transparent;
}

.cards-scroll-container::-webkit-scrollbar {
    height: 6px;
}

.cards-scroll-container::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 4px;
}

.credit-card-mockup {
    min-width: 260px;
    height: 160px;
    flex-shrink: 0;
    background: var(--card-nested-bg);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--card-nested-border);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.cc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary);
}

.cc-bank {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
}

.cc-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.cc-number {
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.15rem;
    letter-spacing: 2px;
    color: var(--text-primary);
    font-weight: bold;
    margin: 0;
}

.cc-dates {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
}

.mycards-card {
    overflow: hidden;
    display: flex;
    flex-direction: column;
}


/* === TRANSAÇÕES === */
.transactions-card h3, .stats-card h3, .mycards-card h3 {
    font-size: 0.95rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 1rem;
}

.transactions-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tx-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.8rem;
}

.tx-info {
    flex: 1;
}

.tx-info h4 {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 600;
}
.tx-info p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.1rem;
}

.tx-value {
    font-weight: 600;
    font-size: 0.9rem;
}

.tx-value.negative {
    color: var(--danger-color);
}

.tx-value.positive {
    color: var(--success-color);
}


.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}


/* === ESTATÍSTICAS === */

.stats-header h3 {
    margin-bottom: 0;
}

.btn-details {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-details:hover {
    background: rgba(255, 255, 255, 0.05);
}

.chart-placeholder {
    width: 100%;
    height: 150px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px dashed var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
}


@media(max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}
</style>