<script setup lang="ts">
    import { ref, onMounted, computed, watch } from 'vue';
    import { supabase } from '../services/supabase';
    import { PhFunnel, PhMicrosoftExcelLogo, PhCreditCard } from '@phosphor-icons/vue';
    import ListLayout from '../layouts/ListLayout.vue';
    import NewTransaction from '../components/NewTransaction.vue';
    import NewCategory from '../components/NewCategory.vue';
    import FloatingTabs from '../components/FloatingTabs.vue';
    import TransactionList from '../components/TransactionsList.vue';
    import CategoryGrid from '../components/CategoryGrid.vue';
    import { useTabsSwipe } from '../composables/useTabsSwipe';
    import { useAlertStore } from '../stores/useAlertStore';
    import { useFilterStore } from '../stores/useFilterStore';
    import { storeToRefs } from 'pinia';

    const { showAlert } = useAlertStore();

    interface Registry {
        idPurchase?: number; /* Opcional devido a Entradas */
        idIncome?: number;   /* Opcional devido a Compras */
        title: string;
        value: number;
        date: string;
        fin_category: { /* O Join retorna com o nome da tabela no Supabase */
            description: string;
            color: string;
        } | null; 
        categoryId?: number;
        payment_id?: number;
    }

    const registries = ref<any[]>([]);
    const loading = ref(true);
    const cardsInfo = ref<any[]>([]);

    const fetchCardsInfo = async () => {
        const { data } = await supabase.from('usr_payment').select('idPayment, nickname, closing_day');
        cardsInfo.value = data || [];
    };

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const invoicePeriodText = computed(() => {
        if (filterMode.value !== 'invoice' || selectedCardIds.value.length === 0) return '';
        
        const selectedCards = cardsInfo.value.filter(c => selectedCardIds.value.includes(c.idPayment));
        if (selectedCards.length === 1) {
            const card = selectedCards[0];
            const day = card.closing_day || 1;
            const endDate = new Date(selectedYear.value, selectedMonth.value, day);
            const startDate = new Date(selectedYear.value, selectedMonth.value - 1, day + 1);
            
            return `Exibindo fatura de ${monthNames[selectedMonth.value]}: ${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
        }
        
        return `Exibindo faturas de ${monthNames[selectedMonth.value]}`;
    });
    const showFilter = ref(false);
    const isModalOpen = ref(false);
    const isCategoryModalOpen = ref(false);
    const registryToEdit = ref<Registry | null>(null);
    const filterStore = useFilterStore();
    const { selectedMonth, selectedYear, filterMode, selectedCardIds } = storeToRefs(filterStore);
    
    const search = ref('');
    const searchCategory = ref('');
    const searchData = ref('');

    const categories = ref<any[]>([]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
            .from('fin_category')
            .select('*')
            .order('description', { ascending: true });
            if(error) throw error;
            categories.value = data || [];
        } catch (error) {
            console.error(error);
            showAlert('Erro ao carregar categorias', 'error');
        }
    }
    

    const touchArea = ref<HTMLElement | null>(null);
    const { tabs, currentTab: currentTab, moveTab: moveTab } = useTabsSwipe(['compras', 'entradas', 'categorias'], touchArea);
    
    
    watch([currentTab, selectedMonth, selectedYear, filterMode, selectedCardIds], () => {
        fetchRegistries();
    }, { deep: true });

    const totalValue = computed(() => {
        if (currentTab.value === 'categorias') return 0;
        
        // Se for receitas, soma tudo (pois não tem botão de pago ainda)
        if (currentTab.value === 'entradas') {
            return registries.value.reduce((acc, item) => acc + (item.value || 0), 0);
        }

        // Se for compras, soma APENAS as efetivadas (item.paid === true)
        return registries.value.reduce((acc, item) => {
            return item.paid ? acc + (item.value || 0) : acc;
        }, 0);
    });

    const openEditModal = (item: Registry) => {
        registryToEdit.value = item; // Passa os dados da linha clicada
        if(currentTab.value === 'categorias') {
            isCategoryModalOpen.value = true;
            return;
        } else {
            isModalOpen.value = true;     // Abre o modal de edição de compra
        }
    };

    const openNewModal = () => {
        if(currentTab.value === 'categorias') {
            isCategoryModalOpen.value = true;
            return;
        } else {
            registryToEdit.value = null; // Limpa qualquer dado antigo
            isModalOpen.value = true;     // Abre o modal de nova compra
        }
    };

    const togglePaymentStatus = async (item: any) => {
        if(currentTab.value === 'entradas' || currentTab.value === 'categorias') return;
        
        const newStatus = !item.paid;
        
        try {
            const { error } = await supabase
            .from('fin_installment')
            .update({ paid: newStatus })
            .eq('idInstallment', item.idInstallment);

            if(error) throw error;

            item.paid = newStatus;
            if(item.paid === true) {
                showAlert('Status atualizado para Efetivado', 'success');
            } else {
                showAlert('Status atualizado para Pendente', 'success');
            }
        } catch (error) {
            console.error(error);
            showAlert('Erro ao atualizar status', 'error');
        }
    
    }

    const fetchRegistries = async () => {
        loading.value = true;
        try {
            if (cardsInfo.value.length === 0) await fetchCardsInfo();
            // Datas base para o modo Mensal (calendário)
            const startDate = new Date(selectedYear.value, selectedMonth.value, 1).toISOString().split('T')[0];
            const endDate = new Date(selectedYear.value, selectedMonth.value + 1, 0).toISOString().split('T')[0];

            // 1. ABA CATEGORIAS
            if (currentTab.value === 'categorias') {
                const { data, error } = await supabase
                    .from('fin_category')
                    .select('*, fin_purchase(value)')
                    .gte('fin_purchase.date', startDate)
                    .lte('fin_purchase.date', endDate);
                
                if (error) throw error;
                registries.value = (data || []).map((cat: any) => ({
                    idCategory: cat.idCategory,
                    description: cat.description || '',
                    color: cat.color || '#cccccc',
                    type: cat.type,
                    value: (cat.fin_purchase || []).reduce((acc: number, p: any) => acc + (p.value || 0), 0),
                }));
                return;
            }

            // 2. ABA ENTRADAS
            if (currentTab.value === 'entradas') {
                const { data, error } = await supabase
                    .from('fin_income')
                    .select('*, fin_category(description, color)')
                    .order('date', { ascending: false })
                    .gte('date', startDate)
                    .lte('date', endDate);
                
                if (error) throw error;
                registries.value = data || [];
                return;
            }

            // 3. ABA COMPRAS (Onde entra a lógica de Fatura)
            if (currentTab.value === 'compras') {
                if (filterMode.value === 'invoice' && selectedCardIds.value.length === 0) {
                    registries.value = [];
                    loading.value = false;
                    return;
                }

                let query = supabase.from('fin_installment').select(`
                    idInstallment,
                    installmentNumber,
                    value,
                    dueDate,
                    paid,
                    purchaseId,
                    fin_purchase!inner(
                        title, 
                        value, 
                        date, 
                        total_installments,
                        categoryId,
                        payment_id,
                        usr_payment(nickname, bank_name, closing_day),
                        fin_category(description, color)
                    )
                `);

                if (filterMode.value === 'invoice') {
                    // Modo Fatura: Filtra pelos cartões e usa um range seguro de datas
                    query = query.in('fin_purchase.payment_id', selectedCardIds.value);
                    const safeStart = new Date(selectedYear.value, selectedMonth.value - 1, 1).toISOString().split('T')[0];
                    const safeEnd = new Date(selectedYear.value, selectedMonth.value + 1, 15).toISOString().split('T')[0];
                    query = query.gte('dueDate', safeStart).lte('dueDate', safeEnd);
                } else {
                    // Modo Mensal: Filtra pelo mês calendário
                    query = query.gte('dueDate', startDate).lte('dueDate', endDate);
                }

                const { data, error } = await query.order('dueDate', { ascending: false });
                if (error) throw error;
                // 4. MAPEAMENTO E FILTRO FINO
                let result = (data || []).map((item: any) => {
                    const sufixo = item.fin_purchase.total_installments > 1
                        ? `(${item.installmentNumber}/${item.fin_purchase.total_installments}x)`
                        : '';

                    return {
                        idPurchase: item.purchaseId,
                        idInstallment: item.idInstallment,
                        title: `${item.fin_purchase.title} ${sufixo}`.trim(),
                        value: item.value,
                        date: item.dueDate,
                        paid: item.paid,
                        fin_category: item.fin_purchase.fin_category,
                        categoryId: item.fin_purchase.categoryId,
                        payment_id: item.fin_purchase.payment_id,
                        payment: item.fin_purchase.usr_payment
                    };
                });

                if (filterMode.value === 'invoice') {
                    registries.value = result.filter(item => {
                        const closingDay = item.payment?.closing_day || 1;
                        const closingDate = new Date(selectedYear.value, selectedMonth.value, closingDay);
                        const startDateCycle = new Date(selectedYear.value, selectedMonth.value - 1, closingDay + 1);
                        const itemDate = new Date(item.date);
                        return itemDate >= startDateCycle && itemDate <= closingDate;
                    });
                } else {
                    registries.value = result;
                }
            }
        } catch (error) {
            console.error(error);
            showAlert('Erro ao carregar registros', 'error');
        } finally {
            loading.value = false;
        }
    };

    const deleteRegistry = async (id: number) => {
        const msg = currentTab.value === 'categorias' 
        ? 'Excluir Categoria (todas as compras associadas também serão excluídas)' 
        : currentTab.value === 'compras' ? 'Excluir Compra' : 'Excluir Entrada';
        if (!confirm(`Deseja realmente ${msg}?`)) return
        try {
            let table = '';
            let columnId = '';
            if(currentTab.value === 'categorias'){
                table = 'fin_category';
                columnId = 'idCategory';
            } else if (currentTab.value === 'compras') {
                table = 'fin_purchase';
                columnId = 'idPurchase';
            } else {
                table = 'fin_income';
                columnId = 'idIncome';
            }
            const { error } = await supabase.from(table).delete().eq(columnId, id);
            if (error) throw error;
            showAlert('Registro excluído com sucesso', 'success');
            fetchRegistries();
        } catch (e) { showAlert('Erro ao excluir', 'error'); }
    };


    onMounted(() => {
        fetchCategories();
        fetchRegistries();
    });
    
</script>

<template>
    <div ref="touchArea">
        <ListLayout
            :title="currentTab === 'compras' ? 'Minhas Compras' : currentTab === 'entradas' ? 'Entradas' : currentTab === 'categorias' ? 'Categorias' : ''"
            :buttonText="currentTab === 'compras' ? 'Nova Compra' : currentTab === 'entradas' ? 'Nova Entrada' : currentTab === 'categorias' ? 'Nova Categoria' : ''"
            :loading="loading"
            :items="registries"
            :totalValue="currentTab === 'categorias' ? 0 : totalValue"
            @addNew="openNewModal"
        >
            <template #header v-if="invoicePeriodText">
                <div class="invoice-period-badge">
                    <PhCreditCard :size="18" weight="fill" />
                    <span>{{ invoicePeriodText }}</span>
                </div>
            </template>

        <template #actions>
            <button 
                class="btn-secondary"
                @click="showFilter = !showFilter" 
                :class="{ 'btn-active': showFilter }"
            >
                <PhFunnel size="18" /> Filtrar
            </button>
            <button class="btn-secondary">
                <PhMicrosoftExcelLogo size="18" /> Excel
            </button>
        </template>
        <template #filters v-if="showFilter">
            <div class="filter-card">
                <div class="filter-row">
                    <div class="input-group">
                        <label>Buscar</label>
                        <input type="text" placeholder="Digite para buscar..." v-model="search" />
                    </div>
                    <div class="input-group">
                        <label>Categoria</label>
                        <select v-model="searchCategory">
                            <option value="">Todas</option>
                            <option v-for="category in categories" :key="category.idCategory" :value="category.idCategory">{{ category.description }}</option>
                        </select> 
                    </div>
                    <div class="input-group">
                        <label>Data</label>
                        <input type="date" v-model="searchData"/>
                    </div>
                    <div class="filter-footer">
                        <button class="btn-clean" @click="showFilter = false">Limpar</button>
                        <button class="btn-apply" @click="fetchRegistries()">Filtrar</button>
                    </div>
                </div>
            </div>
        </template>

       <template #body>
            <TransactionList 
                v-if="currentTab === 'compras' || currentTab === 'entradas'" 
                :items="registries" 
                :currentTab="currentTab"
                @edit="openEditModal"
                @delete="deleteRegistry"
                @toggle-paid="togglePaymentStatus"
            />

            <CategoryGrid 
                v-else-if="currentTab === 'categorias'" 
                :items="registries"
                @delete="deleteRegistry"
            />
        </template>

        </ListLayout>
        <FloatingTabs :tabs="tabs" :currentTab="currentTab" @move="moveTab" @select="currentTab = $event" />
        <NewTransaction 
            v-if="isModalOpen" 
            :transactionData="registryToEdit"
            :type="currentTab"
            @close="isModalOpen = false" 
            @saved="fetchRegistries" />

        <NewCategory 
            v-if="isCategoryModalOpen"
            :categoryData="registryToEdit" 
            @close="isCategoryModalOpen = false" 
            @saved="fetchRegistries" />
            
    </div>
</template>

<style scoped>
    .invoice-period-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(30, 64, 175, 0.1);
        color: #3B82F6;
        padding: 0.4rem 1rem;
        border-radius: 99px;
        font-weight: 500;
        font-size: 0.9rem;
        border: 1px solid rgba(59, 130, 246, 0.2);
        margin-bottom: 1rem;
        margin-left: 0.5rem;
    }
</style>