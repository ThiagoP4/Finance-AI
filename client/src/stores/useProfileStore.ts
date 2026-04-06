import { defineStore } from 'pinia';
import { supabase } from '../services/supabase';

export const useProfileStore = defineStore('profile', {
    // 1. A Memória Pura (State)
    state: () => ({
        userId: '',
        userName: '',
        userEmail: '',
        userCpf: '',
        userPhone: '',
        userSecondPhone: '',
        avatarUrl: '',
        myCards: [] as any[],
        financialGoals: [] as any[],
        isLoadingProfile: false,
    }),

    // 2. Os Músculos (Ações que falam direto com o Banco de Dados)
    actions: {
        async fetchProfileData() {
            this.isLoadingProfile = true;
            try {
                // Passo 1: Pegar da Auth (Segurança)
                const { data: authData } = await supabase.auth.getUser();
                if (!authData.user) return;

                this.userId = authData.user.id;
                this.userEmail = authData.user.email || '';
                this.userPhone = authData.user.phone || '';

                // Passo 2: Pegar da tabela customizada
                const { data: profileData } = await supabase
                    .from('usr_profile')
                    .select('*')
                    .eq('id_profile', this.userId)
                    .single();

                if (profileData) {
                    this.userName = (profileData.first_name + ' ' + (profileData.last_name || '')).trim();
                    this.userCpf = profileData.cpf || '';
                    this.userSecondPhone = profileData.second_phone || '';
                    this.avatarUrl = profileData.avatar_url || '';
                }

                // Passo 3: Pegar os Pagamentos
                const { data: cardsData } = await supabase
                    .from('usr_payment')
                    .select('*')
                    .eq('user_id', this.userId);

                if (cardsData) this.myCards = cardsData;

                const { data: goalsData } = await supabase
                    .from('usr_goal')
                    .select('*')
                    .eq('user_id', this.userId)

                if (goalsData) this.financialGoals = goalsData;

            } catch (error) {
                console.error('Erro ao montar o Dashboard Central de Perfil:', error);
            } finally {
                this.isLoadingProfile = false;
            }
        },
        async saveFinancialGoal(description: string, target_amount: number, deadline: string) {
            if (!this.userId) return { success: false, message: 'Usuário não autenticado.' };
            try {
                const { data, error } = await supabase
                    .from('usr_goal')
                    .insert({
                        user_id: this.userId,
                        description: description,
                        target_amount: target_amount,
                        deadline: deadline,
                        status: 'em andamento'
                    })
                    .select()
                    .single();

                if (error) throw error;

                this.financialGoals.push(data);
                this.financialGoals.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                return { success: true }
            } catch (error: any) {
                console.error('Erro ao salvar meta financeira', error);
                return { success: false, message: error.message }
            }
        },
        async updateFinancialGoal(id_goal: string, updates: any) {
            try {
                const { data, error } = await supabase
                    .from('usr_goal')
                    .update(updates)
                    .eq('id_goal', id_goal)
                    .select()
                    .single();

                if (error) throw error;

                const index = this.financialGoals.findIndex(g => g.id_goal === id_goal);
                if (index !== -1) {
                    this.financialGoals[index] = data;
                }
                return { success: true };

            } catch (error: any) {
                console.error('Erro ao atualizar meta:', error);
                return { success: false, message: error.message };
            }
        },
        async deleteFinancialGoal(id_goal: string) {
            try {
                const { error } = await supabase
                    .from('usr_goal')
                    .delete()
                    .eq('id_goal', id_goal);

                if (error) throw error;

                this.financialGoals = this.financialGoals.filter(g => g.id_goal !== id_goal);

                return { success: true }
            } catch (error: any) {
                console.error('Erro ao deletar meta:', error)
                return { success: false, message: error.message };
            }
        }
    }
});
