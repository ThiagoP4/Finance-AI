<script setup lang="ts">
import { onMounted } from 'vue';
import { useProfileStore } from '../stores/useProfileStore';

// O Poder da Componentização:
import ProfileHeader from '../components/profile/ProfileHeader.vue';
import ProfilePersonalDetails from '../components/profile/ProfilePersonalDetails.vue';
import ProfileSecurity from '../components/profile/ProfileSecurity.vue';
import ProfileFinancialGoals from '../components/profile/ProfileFinancialGoals.vue';
import ProfilePaymentMethods from '../components/profile/ProfilePaymentMethods.vue';

const profileStore = useProfileStore();

onMounted(() => {
    profileStore.fetchProfileData();
});
</script>

<template>
    <div class="profile-container">
        
        <!-- Estado de Loading Mestre Global -->
        <div v-if="profileStore.isLoadingProfile" class="loading-overlay">
            <svg class="spin-icon-giant" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <p>Carregando Cofre Seguro...</p>
        </div>

        <!-- Só mostra o painel se já achou os dados (Evita piscar tela) -->
        <div v-else class="profile-content">
        
            <ProfileHeader />

            <!-- A Grade Mestra Reconstruída -->
            <div class="profile-dashboard-grid">
                
                <!-- Coluna Esquerda -->
                <div class="column-stack">
                    <ProfilePersonalDetails />
                    <ProfileSecurity />
                </div>

                <!-- Coluna Direita -->
                <div class="column-stack">
                    <ProfileFinancialGoals />
                    <ProfilePaymentMethods />
                </div>
                
            </div>
        </div>
    </div>
</template>

<style scoped>
    .profile-container { 
        max-width: 1200px; margin: 0 auto; color: var(--text-primary); 
    }
    .page-title { 
        color: var(--text-primary); margin-bottom: 2rem; font-size: 2rem; font-weight: bold; 
    }
    
    .loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: var(--primary-color); }
    .loading-overlay p { margin-top: 1rem; color: var(--text-secondary); font-weight: 500; font-size: 1.1rem; }
    
    .profile-dashboard-grid { 
        display: grid; 
        grid-template-columns: 1fr; 
        gap: 2rem; 
        align-items: start; }
    .column-stack { display: flex; flex-direction: column; gap: 2rem; }
    
    @media (min-width: 1024px) {
        .profile-dashboard-grid { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .spin-icon-giant { animation: spin 1s linear infinite; opacity: 0.8; }
</style>
