<script setup lang="ts">
import { supabase } from '../../services/supabase';
import { useAlertStore } from '../../stores/useAlertStore';
import { useProfileStore } from '../../stores/useProfileStore';

const alertStore = useAlertStore();
const profileStore = useProfileStore();

const applyCpfMask = () => {
    let v = profileStore.userCpf?.replace(/\D/g, '') || '';
    if (v.length > 11) v = v.slice(0, 11);
    
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    profileStore.userCpf = v;
};

const applyPhoneMask = () => {
    let v = profileStore.userSecondPhone?.replace(/\D/g, '') || '';
    if (v.length > 11) v = v.slice(0, 11);
    
    if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    
    profileStore.userSecondPhone = v;
};

const savePersonalData = async () => {
    alertStore.showAlert('Salvando seus dados...', 'warning');
    try {
        // Passo 1: Atualizar o Email de fato na Conta/Login do cara
        const { error: authError } = await supabase.auth.updateUser({
            email: profileStore.userEmail,
        });
        
        if (authError) throw authError;

        // Passo 2: Atualizar os Dados Públicos da tabela usr_profile
                // Passo 2: Atualizar os Dados Públicos da tabela usr_profile
        const { error: dbError } = await supabase
            .from('usr_profile')
            .upsert({
                id_profile: profileStore.userId,
                cpf: profileStore.userCpf,
                first_name: profileStore.userName.split(' ')[0] || '',
                last_name: profileStore.userName.split(' ').slice(1).join(' ') || '',
                second_phone: profileStore.userSecondPhone,
                avatar_url: profileStore.avatarUrl, 
                role_id: 1, 
                updated_at: new Date().toISOString()
            });


        if (dbError) throw dbError;

        alertStore.showAlert('Dados Pessoais salvos com sucesso!', 'success');
    } catch (error: any) {
        console.error('Erro ao salvar dados pessoais:', error);
        alertStore.showAlert('Erro ao salvar dados: ' + error.message, 'error');
    }
};
</script>

<template>
    <div class="profile-card">
        <h2>Dados Pessoais</h2>
        <form class="profile-card-content" @submit.prevent="savePersonalData">
            <div class="form-grid">
                <div class="profile-card-content-item full-width">
                    <label for="name">Nome Completo</label>
                    <input type="text" id="name" v-model="profileStore.userName">
                </div>
                <div class="profile-card-content-item full-width">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" v-model="profileStore.userEmail" placeholder="Digite seu novo E-mail de login">
                </div>
                <div class="profile-card-content-item full-width">
                    <label for="cpf">CPF</label>
                    <input type="text" id="cpf" v-model="profileStore.userCpf" @input="applyCpfMask" maxlength="14" placeholder="000.000.000-00">
                </div>
                <!-- O Telefone principal é somente leitura e puxado do Auth -->
                <div class="profile-card-content-item">
                    <label for="phone">Telefone Principal</label>
                    <input type="tel" id="phone" v-model="profileStore.userPhone" disabled title="Gerenciado pelo provedor de segurança.">
                </div>
                <div class="profile-card-content-item">
                    <label for="second_phone">Telefone Adicional</label>
                    <input type="tel" id="second_phone" v-model="profileStore.userSecondPhone" @input="applyPhoneMask" maxlength="15" placeholder="(XX) 99999-9999">
                </div>
            </div>
            <!-- Esse botão ativa a function ali em cima que salva os dados da nuvem puxando do Store VUE -->
            <button class="btn-apply" type="submit">Salvar Dados</button>
        </form>
    </div>
</template>

<style scoped>
    /* CSS Isolado e Blindado do Componente */
    .profile-card { background: var(--bg-card); border-radius: 1rem; padding: 2rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .profile-card h2 { color: var(--text-primary); font-size: 1.25rem; margin: 0 0 1.5rem 0; font-weight: 600; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }
    
    .form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
    
    /* Configuração perfeita do Layout do Grid Responsivo (Lado a Lado no PC) */
    @media (min-width: 768px) {
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .full-width { grid-column: 1 / -1; }
    }

    .profile-card-content-item { display: flex; flex-direction: column; gap: 0.5rem; }
    .profile-card-content-item label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
    .profile-card-content-item input { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); padding: 0.8rem; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
    .profile-card-content-item input:focus { border-color: var(--primary-color); outline: none; }
    .profile-card-content-item input:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .btn-apply { margin-top: 1.5rem; background-color: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; align-self: flex-start; }
    .btn-apply:hover { opacity: 0.9; }
</style>
