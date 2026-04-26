<script setup lang="ts">
    import { ref } from 'vue';
    import { 
        PhX, PhMoon, PhUser, PhHeart, 
        PhArrowsClockwise, PhGear, PhQuestion, PhInfo, PhSignOut 
    } from '@phosphor-icons/vue';
    import { useRouter } from 'vue-router';
    import { supabase } from '../services/supabase';
    import logoUrl from '../assets/somma-logo.svg';

    const props = defineProps<{ isOpen: boolean }>();
    const emit = defineEmits(['close']);
    const router = useRouter();

    const navigateTo = (route: string) => {
        emit('close');
        router.push(route);
    };

    const isDarkMode = ref(true);

    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
        if (isDarkMode.value) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark')
            } else {
                document.body.classList.remove('dark');
                localStorage.removeItem('theme')
            }
    };

    const handleLogout = async () => {
        try {
            emit('close')
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
        }
    }

    // Lista de itens do menu para não repetir HTML
    const menuItems = [
        { icon: PhUser, title: 'Meu Perfil', subtitle: 'Suas informações pessoais', route: '/profile' },
        { icon: PhHeart, title: 'Casal', subtitle: 'Finanças em casal', route: '/casal' },
        { icon: PhArrowsClockwise, title: 'Assinaturas', subtitle: 'Gerencie seus serviços', route: '/assinaturas' },
        { icon: PhGear, title: 'Configurações', subtitle: 'Preferências do app', route: '/config' },
        { icon: PhQuestion, title: 'Ajuda', subtitle: 'Dúvidas e suporte', route: '/ajuda' },
        { icon: PhInfo, title: 'Sobre', subtitle: 'Informações do app', route: '/sobre' },
    ];
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isOpen" class="sidebar-backdrop" @click="emit('close')"></div>
        </Transition>
        <Transition name="slide">
            <aside v-if="isOpen" class="sidebar">
                <div class="sidebar-header">
                    <div class="brand">
                        <img :src="logoUrl" alt="Somma Logo" class="logo-img" />
                        <span class="brand-text">Somma <strong>AI</strong></span>
                    </div>
                    <button class="close-btn" @click="emit('close')">
                        <PhX size="16" />
                    </button>
                </div>
                <div class="theme-toggle-wrapper">
                    <div class="theme-info">
                        <PhMoon size="18" :weight="isDarkMode ? 'fill' : 'regular'" color="var(--primary-color)" />
                        <span>Tema Escuro</span>
                    </div>
                    <button class="switch" :class="{ 'active': isDarkMode }" @click="toggleTheme">
                        <span class="switch-thumb"></span>
                    </button>
                </div>
                    <div class="menu-section">
                        <span class="section-label">MENU</span>
                        <nav class="menu-list">
                            <button class="menu-item" v-for="item in menuItems" :key="item.title" @click="navigateTo(item.route)">
                                <div class="item-icon">
                                    <component :is="item.icon" size="18" />
                                </div>
                                <div class="item-text">
                                    <span class="item-title">{{ item.title }}</span>
                                    <span class="item-subtitle">{{ item.subtitle }}</span>
                                </div>
                            </button>
                        </nav>
                    </div>
                <div class="sidebar-footer">
                    <button class="logout-btn" @click="handleLogout">
                        <PhSignOut size="18" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </Transition>
    </Teleport>


</template>

<style scoped>

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.3s ease;
    }
    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }

    .slide-enter-active, .slide-leave-active {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .slide-enter-from, .slide-leave-to {
        transform: translateX(-100%);
    }

    .sidebar-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9998;
    }

    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 300px;
        height: 100vh;
        background-color: var(--bg-card);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
    }

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .logo-img {
        width: 28px;
        height: 28px;
        object-fit: contain;
    }
    .brand-text {
        font-size: 1rem;
        color: var(--text-primary);
    }

    .close-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 50%;
        transition: 0.2s
    }
    .close-btn:hover {
        background-color: var(--bg-page);
        color: var(--text-primary);
    }

    .theme-toggle-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 1.2rem 1.5rem;
        padding: 0.5rem 0.8rem;
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-color);
        border-radius: 12px;
    }
    .theme-info {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        font-size: 0.85rem;
        color: var(--text-primary);
    }

    .switch {
        width: 40px; 
        height: 24px; 
        border-radius: 99px;
        background-color: var(--border-color); border: none;
        position: relative; 
        cursor: pointer; 
        transition: background-color 0.3s;
    }
    .switch.active {  background-color: var(--primary-color); }
    .switch-thumb {
        position: absolute; top: 3px; left: 3px;
        width: 18px; height: 18px; border-radius: 50%;
        background-color: white; transition: transform 0.3s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .switch.active .switch-thumb {  transform: translateX(16px); }

    .menu-section {
        flex: 1; 
        padding: 0 1rem; 
        overflow-y: auto;
    }
    .section-label {
        display: block; 
        padding: 0 0.5rem; 
        margin-bottom: 0.8rem;
        font-size: 0.75rem; 
        font-weight: 600; 
        color: var(--text-secondary); letter-spacing: 0.05em;
    }
    
    .menu-list { display: flex; flex-direction: column; gap: 4px; }
    
    .menu-item {
        display: flex; 
        align-items: center; 
        gap: 16px;
        background: transparent; border: none; width: 100%; text-align: left;
        padding: 0.8rem 1rem; border-radius: 10px; cursor: pointer; transition: 0.2s;
    }
    .menu-item:hover { background-color: rgba(255,255,255, 0.03); }
    
    .item-icon { color: var(--text-secondary); display: flex; align-items: center; }
    .menu-item:hover .item-icon { color: var(--text-primary); }
    
    .item-text { display: flex; flex-direction: column; gap: 2px; }
    .item-title { color: var(--text-primary); font-size: 0.95rem; font-weight: 500; }
    .item-subtitle { color: var(--text-secondary); font-size: 0.75rem; }

    /* Rodapé */
    .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); }
    .logout-btn {
        display: flex; align-items: center; gap: 12px;
        background: transparent; border: none; width: 100%;
        padding: 0.8rem 1rem; border-radius: 10px; cursor: pointer; transition: 0.2s;
        color: var(--danger-color); font-weight: 500; font-size: 0.95rem;
    }
    .logout-btn:hover { background-color: rgba(239, 68, 68, 0.1); }
    


</style>