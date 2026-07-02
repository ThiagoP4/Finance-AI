<script setup lang="ts">
    import { storeToRefs } from "pinia";
    import { PhArrowDownLeft, PhArrowUpRight, PhChartBar, PhCreditCard } from '@phosphor-icons/vue';

    import { useProfileStore } from "../stores/useProfileStore";
    const profileStore = useProfileStore();
    const { userName } = storeToRefs(profileStore);

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
                <h2>R$ 10.000,00</h2>
                <div class="balance-details">

                    <!-- Receitas -->
                    <div class="financial-item">
                        <div class="icon-circle icon-income">
                            <PhArrowDownLeft size="18" weight="bold" />
                        </div>
                        <div class="financial-text">
                            <span>Receitas</span>
                            <p>R$ 10.000,00</p>
                        </div>
                    </div>
                    
                    <!-- Despesas -->
                    <div class="financial-item">
                        <div class="icon-circle icon-expense">
                            <PhArrowUpRight size="18" weight="bold" />
                        </div>
                        <div class="financial-text">
                            <span>Despesas</span>
                            <p>R$ 10.000,00</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARTÃO DE FORMAS DE PAGAMENTO -->
            <div class="card mycards-card">
                <h3>Meus Cartões</h3>
                <div class="credit-card-mockup">
                    <div class="cc-header">
                        <PhCreditCard size="22" weight="fill" />
                        <span>Nubank</span>
                    </div>
                    <div class="cc-body">
                        <p class="cc-name">Thiago Silva</p>
                        <p class="cc-dates">Fecha dia 1 e Vence dia 8</p>
                    </div>
                </div>
            </div>

            <!-- CARTÃO DE ULTIMAS TRANSAÇÕES-->
            <div class="card transactions-card">
                <h3>Últimas Transações</h3>

                <div class="transactions-list">
                    <div class="transaction-item">
                        <div class="tx-icon tx-expense">
                            <span>$</span>
                        </div>
                        <div class="tx-info">
                            <h4>Uber</h4>
                            <p>14/06/2026</p>
                        </div>
                        <div class="tx-value negative">
                            -R$ 150,00
                        </div>
                    </div>
                </div>
            </div>

            <!-- CARTÃO DE ESTATÍSTICAS -->
            <div class="card statistics-card">
                <div class="stats-header">
                    <h3>Estatísticas</h3>
                    <button class="btn-details">
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
    gap: 2rem;
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
    gap: 1.5rem;
}

.card {
    background-color: var(--bg-card);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}


/* === SALDO === */
.balance-card {
    background: linear-gradient(145deg, #2a1f1f 0%, #1e1515 100%);
    border: 1px solid rgba(239, 68, 68, 0.1);
}

.balance-card h3 {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.balance-card h2 {
    font-size: 2.8rem; /* Tamanho Gigante igual ao layout */
    font-weight: 700;
    color: var(--text-primary);
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
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.icon-expense {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
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

.credit-card-mockup {
    background: linear-gradient(135deg, #2a2a2a 0%, #151515 100%);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
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
    font-family: 'Courier New', Courier, monospace; /* Dá aquela cara de número de cartão */
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


/* === TRANSAÇÕES === */
.transactions-card h3, .stats-card h3, .mycards-card h3 {
    font-size: 0.95rem;
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.transactions-list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tx-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 1rem;
}

.tx-expense {
    background-color: rgba(255, 255, 255, 0.05); 
    color: #a1a1aa;
}

.tx-info {
    flex: 1;
}

.tx-info h4 {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-primary);
    font-weight: 600;
}
.tx-info p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.2rem;
}

.tx-value {
    font-weight: 600;
    font-size: 0.95rem;
}

.tx-value.negative {
    color: #ef4444;
}


/* === ESTATÍSTICAS === */
.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

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
    padding: 0.4rem 0.8rem; 
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-details:hover {
    background: rgba(255, 255, 255, 0.05);
}

.chart-placeholder {
    width: 100%;
    height: 180px;
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