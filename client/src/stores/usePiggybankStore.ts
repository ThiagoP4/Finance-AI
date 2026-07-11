import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../services/supabase';
import { useProfileStore } from './useProfileStore';

export interface Piggybank {
    id_piggybank: string;
    user_id: string;
    title: string;
    target_amount: number;
    current_amount: number;
    composes_balance: boolean;
    created_at: string;
}

export const usePiggybankStore = defineStore('piggybank', () => {
    const piggybanks = ref<Piggybank[]>([]);
    const isLoading = ref(false);
    
    // Pegamos a store de profile para ter acesso ao ID do usuário logado
    const profileStore = useProfileStore();

    const fetchPiggybanks = async () => {
        isLoading.value = true;
        try {
            if(!profileStore.userId) await profileStore.fetchProfileData();

            const { data, error } = await supabase
                .from('fin_piggybank')
                .select('*')
                .eq('user_id', profileStore.userId)
                .order('created_at', { ascending: true });

            if(error) throw error;
            piggybanks.value = data || [];

        } catch (error) {
            console.error('[PiggybankStore] Error fetching piggybanks:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const createPiggybank = async (title: string, target_amount: number, composes_balance: boolean) => {
        try {
            const { data, error } = await supabase
                .from('fin_piggybank')
                .insert([{
                    user_id: profileStore.userId,
                    title,
                    target_amount,
                    composes_balance,
                    current_amount: 0
                }])
                .select()
                .single();

                if(error) throw error;
                if(data) piggybanks.value.push(data);
        } catch (error) {
            console.error('[PiggybankStore] Error creating piggybank:', error);
            throw error;
        }
    };
    
    const updatePiggybank = async (id: string, updates: Partial<Piggybank>) => {
        try {
            const { error } = await supabase
                .from('fin_piggybank')
                .update(updates)
                .eq('id_piggybank', id)

            if (error) throw error;

            const index = piggybanks.value.findIndex(p => p.id_piggybank === id);
            if(index !== -1) {
                piggybanks.value[index] = { ...piggybanks.value[index], ...updates } as Piggybank;
            }

        } catch(error) {
            console.error('Erro ao atualizar cofrinho:', error);
            throw error;
        }
    };

    const deletePiggybank = async (id: string) => {
        try {
            const { error } = await supabase
                .from('fin_piggybank')
                .delete()
                .eq('id_piggybank', id);
            
            if (error) throw error;

            piggybanks.value = piggybanks.value.filter(p => p.id_piggybank !== id);
        } catch (error) {
            console.error('Erro ao excluir cofrinho:', error);
            throw error;
        }
    };

    const getAvailableToDeposit = async () => {
        try {
            const { data: incomes } = await supabase
                .from('fin_income')
                .select('value')
                .eq('user_id', profileStore.userId);
            
            const totalIncomes = (incomes || []).reduce((acc, curr) => acc + Number(curr.value), 0);
            const totalAlreadySaved = piggybanks.value.reduce((acc, curr) => acc + Number(curr.current_amount), 0);
            
            return totalIncomes - totalAlreadySaved;
        } catch (error) {
            console.error('Erro ao buscar disponível:', error);
            return 0;
        }
    };

    const addTransaction = async (id_piggybank: string, type: 'deposit' | 'withdraw', amount: number) => {
        try {
            const piggybank = piggybanks.value.find(p => p.id_piggybank === id_piggybank);

            if(!piggybank) {
                throw new Error('Cofrinho não encontrado');
            }

            if (type === 'deposit') {
                // Calcula o total de entradas (incomes) de todos os tempos
                const { data: incomes } = await supabase
                    .from('fin_income')
                    .select('value')
                    .eq('user_id', profileStore.userId);
                
                const totalIncomes = (incomes || []).reduce((acc, curr) => acc + Number(curr.value), 0);

                // Calcula quanto o usuário já tem guardado em todos os cofrinhos
                const totalAlreadySaved = piggybanks.value.reduce((acc, curr) => acc + Number(curr.current_amount), 0);

                // O valor máximo disponível para depositar é o Total de Entradas - O que já foi guardado
                const maxAvailable = totalIncomes - totalAlreadySaved;

                if (amount > maxAvailable) {
                    throw new Error(`Saldo insuficiente! O valor máximo que você pode depositar das suas entradas é R$ ${maxAvailable.toFixed(2).replace('.', ',')}.`);
                }
            }

            const { error: txError } = await supabase
                .from('fin_piggybank_transaction')
                .insert([{
                    piggybank_id: id_piggybank,
                    user_id: profileStore.userId,
                    transaction_type: type,
                    amount
                }])
                
            if (txError) throw txError;

            const newAmount = type === 'deposit'
             ? Number(piggybank.current_amount) + Number(amount)
             : Number(piggybank.current_amount) - Number(amount);

            await updatePiggybank(id_piggybank, { current_amount: newAmount });

        } catch (error) {
            console.error('[PiggybankStore] Error adding transaction:', error);
            throw error;
        }
    }

    return {
        piggybanks,
        isLoading,
        fetchPiggybanks,
        createPiggybank,
        updatePiggybank,
        deletePiggybank,
        addTransaction,
        getAvailableToDeposit
    }
})