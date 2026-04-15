<script setup lang="ts">    

    import { ref, onMounted, computed, type PropType } from 'vue';
    import { supabase } from '../services/supabase';
    import { PhPlus } from '@phosphor-icons/vue';
    import FormLayout from '../layouts/FormLayout.vue';
    import { useAlertStore } from '../stores/useAlertStore';
    import { useProfileStore } from '../stores/useProfileStore';
    import { POPULAR_BANKS } from '../utils/banks';

    const { showAlert } = useAlertStore();
    const profileStore = useProfileStore();

    const props = defineProps({
        transactionData: {
            type: Object as PropType<any>,
            default: null
        },
        type: {
            type: String as PropType<string>,
            default: 'compras'
        }
    });

    const description = ref('');
    const value = ref('');
    const categoryId = ref('');
    const date = ref(new Date().toISOString().split('T')[0]); // Data de hoje
    const paymentId = ref<number | string>('');
    const categories = ref<any[]>([]);
    const loading = ref(false);
    
    // Estados para Cadastro Rápido (Overlays)
    const isAddingQuickCategory = ref(false);
    const newQuickCategoryName = ref('');
    const isAddingQuickPayment = ref(false);
    const newQuickPaymentNickname = ref('');
    const newQuickPaymentBank = ref('');

    const isInstallment = ref(false);
    const installmentNumber = ref('');

    const emit = defineEmits(['close', 'saved']);
    const isEditing = computed(() => !!props.transactionData);
    const isIncome = computed(() => props.type === 'entradas');

    onMounted(async () => {
        try {
            const tipoCategoria = isIncome.value ? 'receita' : 'despesa';

            const { data, error } = await supabase
                .from('fin_category')
                .select('*')
                .eq('type', tipoCategoria);
                
            if (error) throw error;
            categories.value = data;
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
        if (profileStore.myCards.length === 0) {
            await profileStore.fetchProfileData();
        }

        if(props.transactionData) {
            description.value = props.transactionData.title;
            value.value = props.transactionData.value;
            categoryId.value = props.transactionData.categoryId;
            paymentId.value = props.transactionData.payment_id || '';
            date.value = props.transactionData.date.split('T')[0]; // Formata para YYYY-MM-DD
        }
    });

    const fetchCategories = async () => {
        try {
            const tipoCategoria = isIncome.value ? 'receita' : 'despesa';
            const { data, error } = await supabase
                .from('fin_category')
                .select('*')
                .eq('type', tipoCategoria);
            if (error) throw error;
            categories.value = data;
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    };

    const handleQuickCategory = async () => {
        if (!newQuickCategoryName.value) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('fin_category')
                .insert({
                    description: newQuickCategoryName.value,
                    type: isIncome.value ? 'receita' : 'despesa',
                    color: '#7C3AED', // Cor padrão roxa
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            
            await fetchCategories();
            categoryId.value = data.idCategory;
            isAddingQuickCategory.value = false;
            newQuickCategoryName.value = '';
            showAlert('Categoria cadastrada!', 'success');
        } catch (error) {
            console.error('Erro ao cadastrar categoria rápida:', error);
            showAlert('Erro ao cadastrar categoria.', 'error');
        }
    };

    const handleQuickPayment = async () => {
        if (!newQuickPaymentNickname.value || !newQuickPaymentBank.value) return;
        try {
            await profileStore.savePaymentMethod(
                newQuickPaymentNickname.value,
                newQuickPaymentBank.value,
                'crédito'
            );
            
            // O store já atualiza o myCards internamente no savePaymentMethod
            // Procuramos o ID do card recém criado pelo nickname (simplificação)
            const newCard = profileStore.myCards.find(c => c.nickname === newQuickPaymentNickname.value);
            if (newCard) paymentId.value = newCard.id_payment;

            isAddingQuickPayment.value = false;
            newQuickPaymentNickname.value = '';
            newQuickPaymentBank.value = '';
            showAlert('Cartão cadastrado!', 'success');
        } catch (error) {
            console.error('Erro ao cadastrar pagamento rápido:', error);
            showAlert('Erro ao cadastrar cartão.', 'error');
        }
    };

    const handleSubmit = async () => {
        if (!description.value || !value.value || !date.value) {
            showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        if(!isIncome.value && !categoryId.value) {
            showAlert('Por favor, selecione uma Categoria.', 'warning');
            return;
        }

        if(!isIncome.value && !paymentId.value) {
            showAlert('Por favor, selecione a Forma de Pagamento.', 'warning');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        // Se por acaso o usuário não estiver logado, bloqueia a função
        if (!user) {
        console.error("Usuário não autenticado!");
        return;
        }

        loading.value = true;

        try {
            const payload = {
                title: description.value,
                value: parseFloat(value.value.toString()),
                categoryId: categoryId.value || null,
                payment_id: !isIncome.value ? (paymentId.value || null) : null,
                date: date.value,
                user_id: user.id,
                ...(!isIncome.value ? { total_installments: isInstallment.value ? Number(installmentNumber.value) : 1 } : {})
            };
            
            const table = isIncome.value ? 'fin_income' : 'fin_purchase';
            const primaryKey = isIncome.value ? 'idIncome' : 'idPurchase';

            if(isEditing.value) {
                const { error } = await supabase
                    .from(table)
                    .update(payload)
                    .eq(primaryKey, props.transactionData[primaryKey]);
                if (error) throw error;
            } else {

                if(isIncome.value) {
                    const { error } = await supabase
                        .from('fin_income')
                        .insert(payload);
                    if (error) throw error;
                } else {
                const { data: returnData, error: purchaseError } = await supabase
                    .from('fin_purchase')
                    .insert(payload)
                    .select('idPurchase')
                    .single();
                if(purchaseError) throw purchaseError;

                const idCompraGerada = returnData.idPurchase;
                const totalValuesToDivide = payload.value;
                const installment = isInstallment.value;
                const installmentQtd = installment ? Number(installmentNumber.value) : 1;
                const valuePerInstallment = parseFloat((totalValuesToDivide / installmentQtd).toFixed(2));

                const installmentsData = [];

                let currentDateInstallment = new Date(payload.date);

                for(let i = 1; i <= installmentQtd; i++) {
                    installmentsData.push({
                        purchaseId: idCompraGerada,
                        installmentNumber: i,
                        value: valuePerInstallment,
                        dueDate: currentDateInstallment.toISOString(),
                        paid: i === 1 && !installment
                    });
                    currentDateInstallment.setMonth(currentDateInstallment.getMonth() + 1);
                }

                const { error: insError } = await supabase.from('fin_installment').insert(installmentsData);
                if(insError) throw insError;
                }
            }
        
            emit('saved');
            emit('close');
        } catch (error) {
            console.error('Erro ao adicionar compra:', error);
            showAlert('Ocorreu um erro ao adicionar a compra. Tente novamente.', 'error');
        } finally {
            loading.value = false; // <--- DESTRAVA O BOTÃO
        }
    };

</script>

<template>
    <FormLayout :title="isEditing ? (isIncome ? 'Editar Entrada' : 'Editar Compra') : (isIncome ? 'Nova Entrada' : 'Nova Compra')" :subtitle="isIncome ? 'Preencha os dados da receita' : 'Preencha os dados da despesa'" @close="$emit('close')">
        
        <form @submit.prevent="handleSubmit">

            <div class="form-group">
                <label>Descrição <span class="required">*</span></label>
                <input 
                    type="text" 
                    v-model="description"
                    placeholder="Ex: Supermercado, Uber..."
                    class="input-field" 
                />
            </div>

            <div class="form-group">
                <label>Valor (R$) <span class="required">*</span></label>
                <input 
                    type="number" 
                    v-model.number="value"
                    step="0.01"
                    placeholder="0.00"
                    class="input-field" 
                />
            </div>

            <div class="form-group">
                <label>Categoria <span class="required" v-if="!isIncome">*</span></label>
                <div class="field-with-action">
                    <div class="select-wrapper">
                        <select v-model="categoryId" class="input-field">
                            <option value="" disabled selected>Selecione...</option>
                            <option v-for="cat in categories" :key="cat.idCategory" :value="cat.idCategory">
                                {{ cat.description }}
                            </option>
                        </select>
                    </div>
                    <button type="button" class="quick-add-btn" @click="isAddingQuickCategory = !isAddingQuickCategory" title="Nova Categoria">
                        <PhPlus size="16" />
                    </button>
                    
                    <!-- Overlay Categoria -->
                    <div v-if="isAddingQuickCategory" class="quick-add-overlay">
                        <input type="text" v-model="newQuickCategoryName" placeholder="Nome da Categoria..." class="input-field-mini" @keyup.enter="handleQuickCategory">
                        <div class="overlay-actions">
                            <button type="button" @click="isAddingQuickCategory = false" class="btn-cancel">Cancelar</button>
                            <button type="button" @click="handleQuickCategory" class="btn-save">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-group" v-if="!isIncome">
                <label>Forma de Pagamento <span class="required">*</span></label>
                <div class="field-with-action">
                    <div class="select-wrapper">
                        <select v-model="paymentId" class="input-field" :required="!isIncome">
                            <option value="" disabled selected>Selecione o pagamento</option>
                            <option v-for="card in profileStore.myCards" :key="card.id_payment" :value="card.id_payment">
                                {{ card.bank_name }} - {{ card.nickname }}
                            </option>
                        </select>
                    </div>
                    <button type="button" class="quick-add-btn" @click="isAddingQuickPayment = !isAddingQuickPayment" title="Novo Cartão">
                        <PhPlus size="16" />
                    </button>

                    <!-- Overlay Pagamento -->
                    <div v-if="isAddingQuickPayment" class="quick-add-overlay">
                        <input type="text" v-model="newQuickPaymentNickname" placeholder="Apelido (ex: NuBank)" class="input-field-mini">
                        <select v-model="newQuickPaymentBank" class="input-field-mini">
                            <option value="" disabled selected>Instituição...</option>
                            <option v-for="bank in POPULAR_BANKS" :key="bank.id" :value="bank.name">{{ bank.name }}</option>
                        </select>
                        <div class="overlay-actions">
                            <button type="button" @click="isAddingQuickPayment = false" class="btn-cancel">Cancelar</button>
                            <button type="button" @click="handleQuickPayment" class="btn-save">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="installment-card" v-if="!isIncome">
                <div class="card-text">
                    <span class="card-title">Compra Parcelada?</span>
                    <span class="card-subtitle">Divide o valor em parcelas</span>
                </div>
                <label class="switch">
                    <input 
                        type="checkbox" 
                        v-model="isInstallment" 
                    />
                    <span class="slider"></span>
                </label>
            </div>

            <div class="installment-card" v-if="!isIncome && isInstallment"
            style="margin-top: 12px; flex-direction: column; align-items: flex-start;">
                <label  class="card-title mb-2">Quantidade de Parcelas</label>
                 <div class="select-wrapper w-100">
                    <select v-model.number="installmentNumber" class="input-field">
                        <option v-for="n in 23" :key="n" :value="n + 1">
                            {{ n + 1 }}x
                        </option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Data <span class="required">*</span></label>
                <input 
                    type="date" 
                    v-model="date"
                    class="input-field" 
                />
            </div>  

            <button type="submit" class="btn-primary">
                <PhPlus size="20" weight="bold" />
                {{ isEditing ? 'Salvar Alterações' : (isIncome ? 'Adicionar Entrada' : 'Adicionar Compra') }}
            </button>

        </form>

    </FormLayout>
</template>

<style scoped>
    .required {
        color: #B91C1C;
    }

    .divider {
        text-align: center;
        margin: 1.5rem 0;
        position: relative;
    }

    .installment-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: var(--bg-card);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        margin-bottom: 1rem;
    }

    .card-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .card-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .card-subtitle {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .mb-2 {
        margin-bottom: 8px;
    }

    .w-100 {
        width: 100%;
    }

     .switch {
        position: relative;
        display: inline-block;
        width: 46px;   /* Largura total da pista */
        height: 24px;  /* Altura total da pista */
    }
    /* Esconde o checkbox HTML original */
    .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
    }
    /* A pista (slider) */
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #5c5c5e; /* Cor de fundo do switch desligado */
        transition: .3s;
        border-radius: 24px; /* Bordas super arredondadas */
    }
    /* A bolinha do switch */
    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: #000000; /* Cor da bolinha quando desligada */
        transition: .3s;
        border-radius: 50%;
    }
    /* Estado: LIGADO (:checked) */
    .switch input:checked + .slider {
        background-color: #7C3AED; 
    }
    /* Muda a cor da bolinha quando liga e joga ela pra direita */
    .switch input:checked + .slider:before {
        background-color: #FFFFFF;
        transform: translateX(22px); 
    }

    .divider::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border-color); /* Variável de borda */
        z-index: 0;
    }

    .divider span {
        background: var(--bg-card); /* Fundo do card (branco ou dark) para não cortar a linha */
        padding: 0 10px;
        color: var(--text-secondary); /* Texto secundário */
        font-size: 0.85rem;
        position: relative;
        z-index: 1;
    }

    .btn-primary {
        margin-top: 1.5rem;
    }

    /* Quick Add UI */
    .field-with-action {
        display: flex;
        gap: 0;
        align-items: stretch;
        position: relative;
    }

    .field-with-action .select-wrapper {
        flex: 1;
    }

    .field-with-action .select-wrapper .input-field {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
        height: 100%;
    }

    .quick-add-btn {
        background: var(--bg-card);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        width: 42px;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: 0.2s;
        border-left: 1px solid var(--border-color);
    }

    .quick-add-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    .quick-add-overlay {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 12px;
        z-index: 100;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        margin-top: 8px;
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .input-field-mini {
        width: 100%;
        padding: 0.6rem;
        background: var(--bg-hover);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 0.85rem;
    }

    .overlay-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .btn-cancel {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 0.8rem;
        cursor: pointer;
    }

    .btn-save {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
    }

    /* Botão WhatsApp */
    .btn-whatsapp {
        width: 100%;
        padding: 0.9rem;
        background-color: #ECFDF5;
        color: #059669;
        border: 1px solid #10B981;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
    }

    .btn-whatsapp:hover {
        background-color: #D1FAE5;
    }
    
    @media (max-width: 640px) {
        /* Reduz espaço do botão principal */
        .btn-primary {
            margin-top: 1rem;
        }

        /* Reduz o espaço do "ou" */
        .divider {
            margin: 1rem 0;
        }
        
        /* Botão do WhatsApp mais compacto */
        .btn-whatsapp {
            padding: 0.75rem;
            font-size: 0.95rem;
        }
    }

</style>