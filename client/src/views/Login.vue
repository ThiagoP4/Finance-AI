<script setup lang="ts">
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { supabase } from '../services/supabase';
    import { PhEnvelope, PhLockKey, PhSignIn, PhUserPlus, PhUser, PhPhone } from '@phosphor-icons/vue';
    import { useAlertStore } from '../stores/useAlertStore';
    import logoUrl from '../assets/somma-logo.svg';

    const { showAlert } = useAlertStore();


    const router = useRouter();
    const loading = ref(false);
    const isSignUp = ref(false);
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const firstName = ref('');
    const lastName = ref('');  
    const phone = ref('');

    const handleAuth = async () => {
        loading.value = true;
        errorMessage.value = '';

        const cleanEmail = email.value.trim();

        try {
            if (isSignUp.value) {
                const { error: authError } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: password.value,
                    options: {
                        data: {
                            first_name: firstName.value,
                            last_name: lastName.value,
                            phone: phone.value
                        }
                    }
                });
                if (authError) throw authError;
                // O trigger handle_new_user() no banco cria o perfil automaticamente
                showAlert('Cadastro realizado! Verifique seu email para confirmar a conta.', 'success');
                isSignUp.value = false;
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: password.value,
                });
                if (error) throw error;
                showAlert('Login realizado com sucesso!', 'success');
                
                // Pequeno atraso para garantir que a sessão seja atualizada no local storage 
                setTimeout(() => {
                    router.push('/');
                }, 100);
            }
        } catch (error) {
            console.error('Erro de autenticação:', error);
            errorMessage.value = 'Ocorreu um erro. Verifique suas credenciais e tente novamente.';
        } finally {
            loading.value = false;
        }
    };

</script>


<template>
    <div class="login-container">
        <div class="login-card">
            <div class="header">
                <img :src="logoUrl" alt="Somma Logo" class="login-logo" />
                <h1>{{ isSignUp ? 'Crie sua conta' : 'Bem-vindo ao Somma AI' }}</h1>
                <p>{{ isSignUp ? 'Preencha seus dados para começar' : 'Faça login para acessar seu painel' }}</p>
            </div>
            <form @submit.prevent="handleAuth">
                <div v-if="isSignUp">
                    <div class="form-row">
                        <div class="form-group half">
                            <label>Nome</label>
                            <div class="input-wrapper">
                                <PhUser size="20" class="input-icon"/>
                                <input
                                    type="text"
                                    v-model="firstName"
                                    placeholder="João"
                                    required
                                    class="input-field"
                                />
                            </div>
                        </div>
                        <div class="form-group half">
                            <label>Sobrenome</label>
                            <div class="input-wrapper">
                                <input
                                    type="text"
                                    v-model="lastName"
                                    placeholder="Silva"
                                    required
                                    class="input-field"
                                    style="padding-left: 1rem;" 
                                />
                            </div>
                        </div>
                    </div> <div class="form-group">
                        <label>Telefone</label>
                        <div class="input-wrapper">
                            <PhPhone size="20" class="input-icon"/>
                            <input
                                type="tel"
                                v-model="phone"
                                placeholder="(11) 99999-9999"
                                required
                                class="input-field"
                            />
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <div class="input-wrapper">
                        <PhEnvelope size="20"  class="input-icon"/>
                        <input
                            type="email"
                            id="email"
                            v-model="email"
                            placeholder="seu@email.com"
                            required
                            class="input-field"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label>Senha</label>
                    <div class="input-wrapper">
                        <PhLockKey size="20" class="input-icon"/>
                        <input
                            type="password"
                            v-model="password"
                            placeholder="********"
                            required
                            class="input-field"
                            minlength="8"
                        />
                    </div>
                </div>

                <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
                
                <button type="submit" class="btn-primary" :disabled="loading">
                    <span v-if="loading">Carregando...</span>
                    <span v-else class="btn-content">
                        <component :is="isSignUp ? PhUserPlus : PhSignIn" size="20" weight="bold" />
                        {{ isSignUp ? 'Cadastrar' : 'Entrar' }}
                    </span>
                </button>
            </form>

            <div class="toggle-mode">
                <p>
                    {{ isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?' }}
                    <a href="#" @click.prevent="isSignUp = !isSignUp">
                        {{ isSignUp ? 'Faça login' : 'Cadastre-se' }}
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .login-container {
        min-height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-page);
        position: fixed;
        top: 0;
        left: 0;
    }

    .login-card {
        background-color: var(--bg-card);
        padding: 3rem;
        border-radius: 16px;
        border: 1px solid var(--border-color);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .header h1 { margin: 1rem 0 0.5rem; color: var(--text-primary); }
    .header p { margin-top: 0.5rem; color: var(--text-secondary); }

    .login-logo {
        width: 64px;
        height: 64px;
        object-fit: contain;
        margin: 0 auto;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-icon {
        position: absolute;
        left: 12px;
        color: var(--text-secondary);
        pointer-events: none;
    }

    .input-field {
        width: 100%;
        padding: 0.85rem 1rem 0.85rem 45px; /* Espaço para o ícone */
        border: 1px solid var(--border-color);
        background-color: var(--bg-input); /* Fundo sutilmente diferente do card */
        color: var(--text-primary);
        border-radius: 8px;
        font-size: 1rem;
        outline: none;
        transition: all 0.2s;
    }

    .input-field:focus {
        border-color: var(--text-secondary);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2); /* Anel de foco azul */
        background-color: var(--bg-card);
    }

    .input-field::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-row {
        display: flex;
        gap: 1rem; /* Espaço entre Nome e Sobrenome */
    }

    .form-group.half {
        flex: 1; /* Faz cada campo ocupar 50% da linha */
        min-width: 0; /* Previne quebra de layout em telas pequenas */
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary);
    }

    .btn-primary {
        margin-top: 1rem;
        width: 100%;
        padding: 0.9rem;
        background-color: var(--primary-color);
        color: var(--text-inverse);
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
    }

    .btn-primary:hover:not(:disabled) {
        /* Usa a cor de hover do tema */
        background-color: var(--primary-hover);
    }

    .btn-primary:hover {
        filter: brightness(1.1); /* Clareia um pouco no hover */
    }
    
    .btn-primary:active {
        transform: translateY(1px);
    }

    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .toggle-mode {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .toggle-mode a {
        color: var(--text-primary);
        text-decoration: none;
        font-weight: 600;
    }

    .toggle-mode a:hover {
        text-decoration: underline;
    }

    .error-msg {
        color: var(--danger-color);
        font-size: 0.85rem;
        margin-top: 0.5rem;
        text-align: center;
    }
</style>