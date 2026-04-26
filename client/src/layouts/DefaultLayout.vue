<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { RouterLink, useRoute } from 'vue-router'
    import { PhHouse, PhFolders, PhSparkle, PhCalendarBlank, PhCaretDown, PhCaretLeft, PhCaretRight, PhList } from '@phosphor-icons/vue'
    import { useDateStore } from '../stores/useDateStore';
    import { storeToRefs } from 'pinia';
    import { onClickOutside } from '@vueuse/core';
    import Sidebar from '../components/Sidebar.vue';
    import logoUrl from '../assets/somma-logo.svg';


    const isDark = ref(false);
    const route = useRoute();
    const dateStore = useDateStore();
    const isSidebarOpen = ref(false);

    const { selectedMonth, selectedYear } = storeToRefs(dateStore);

    const { selectMonth, nextYear, previousYear, monthNames } = dateStore;
    const isDateDropdownOpen = ref(false);
    const dateDropdownRef = ref<HTMLElement | null>(null);

    onClickOutside(dateDropdownRef, () => {
        isDateDropdownOpen.value = false;
    })

    const handleMonthSelection = (index: number) => {
        selectMonth(index);
        isDateDropdownOpen.value = false;
    }

    onMounted(() => {
        // Verifica o tema salvo no localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDark.value = true;
            document.body.classList.add('dark')
        }
    });
</script>

<template>
  <div class="layout-wrapper">
    <nav class="navbar" v-if="route.path !== '/login'">
      <div class="left-actions">
        <button class="hamburger-btn" @click="isSidebarOpen = true">
          <PhList size="26" />
        </button>
        <div class="logo">
          <img :src="logoUrl" alt="Somma Logo" class="logo-img" />
          <span class="brand-text">
             <strong style="color: var(--text-primary)">Somma</strong>
             <strong class="gradient-text">AI</strong>
          </span>
        </div>
      </div>


    <ul class="nav-links">
        <li>
            <RouterLink to="/" active-class="active">
                <PhHouse size="20" /> Dashboard
            </RouterLink>
        </li>
        <li>
            <RouterLink to="/records" active-class="active">
                <PhFolders size="20" weight="bold" /> Registros
            </RouterLink>
        </li>
        <li>
        <RouterLink to="/copilot" class="btn-ia" active-class="active-ai">
            <PhSparkle size="20" /> Modo IA
        </RouterLink>
        </li>
      </ul>

      <div class="right-actions">

        <div class="date-selector-container" ref="dateDropdownRef">
          <button class="date-btn" @click="isDateDropdownOpen = !isDateDropdownOpen">
            <PhCalendarBlank size="18" />
            <span>{{ monthNames[selectedMonth] }} {{ selectedYear }}</span>
            <PhCaretDown size="16" />
          </button>
          <div class="date-dropdown" v-if="isDateDropdownOpen">
            <div class="year-selector">
              <button @click="previousYear()"><PhCaretLeft size="18" weight="bold" /></button>
                    <span>{{ selectedYear }}</span>
                    <button @click="nextYear()"><PhCaretRight size="18" weight="bold" /></button>
            </div>
            <div class="months-grid">
              <button 
                v-for="(month, index) in monthNames" 
                :key="month" 
                @click="handleMonthSelection(index)"
                :class="['month-btn', { active: selectedMonth === index }]"
              >
                {{ month }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </nav>

    <main class="content-area">
      <slot />
    </main>
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />
  </div>
</template>

<style scoped>

    .layout-wrapper {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-page);
      color: var(--text-primary);
      min-height: 100vh;
    }

    .navbar {
      background-color: var(--bg-card);
      height: 70px;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 6px -1px var(--shadow-color);
    }

    .left-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .hamburger-btn {
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 6px;
      transition: background-color 0.2s;
    }

    .hamburger-btn:hover {
        background-color: var(--bg-page);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.5px;
    }
    
    .logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .brand-text {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.3rem; /* Cria o espaço entre Somma e AI */
    }

    .gradient-text {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-links {
      list-style: none;
      display: flex;
      gap: 2rem;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
    }

    .nav-links a:hover { 
      background-color: var(--bg-page);
      color: var(--primary-color); 
    }
    
    .nav-links a.active {
      color: var(--text-inverse);
      background: var(--primary-gradient);
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.2);
    }

    /* Estilo do botão Modo IA (Contorno Rosa/Accent) */
    .nav-links a.btn-ia {
      color: var(--accent-color);
      border: 1.5px solid var(--accent-color);
      padding: 0.55rem 1.15rem; /* compensate for border */
    }
    
    .nav-links a.btn-ia:hover {
      background-color: var(--accent-color);
      color: var(--text-inverse);
    }

    .nav-links a.active-ai {
      background-color: var(--accent-color);
      color: var(--text-inverse);
      font-weight: 600;
    }

    .right-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .date-selector-container {
      position: relative;
    }

    .date-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s;
    }

    .date-btn:hover {
      background-color: var(--bg-page);
      border-color: var(--text-secondary);
    }

    .date-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 200;
      width: 250px;
      animation: fadeIn 0.15s ease-out;
    }

    .year-selector {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 1rem;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
    }

    .year-selector button {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .year-selector button:hover {
      color: var(--text-primary);
      background-color: var(--bg-page);
    }

    .months-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .month-btn {
      background: transparent;
      border: none;
      color: var(--text-primary);
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }

    .month-btn:hover {
      background-color: var(--bg-page);
    }

    .month-btn.active {
      background-color: var(--primary-color);
      color: var(--bg-card);
    }
    .content-area {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      /* 1. Reduzir padding lateral do menu */
      .navbar {
        height: 60px; /* Reduz de 70px para 60px */
        padding: 0 1rem !important;
        display: grid; 
        grid-template-columns: 1fr auto 1fr; /* Divide em 3 partes: Esquerda Livre, Meio Fixo, Direita Livre */
        align-items: center;
      }
      .content-area {
        padding: 1rem !important; /* Reduz de 2rem para 1rem */
      }
      .logo span, .nav-links a span, .logout-btn span {
          display: none; 
      }

      .date-btn span {
        display: none;
      }
      
      .left-actions { justify-self: start; }

      .logo-icon { width: 40px; height: 40px; border-radius: 10px; }
      
      /* Restaurar links do meio no celular - vamos ajustar o tamanho deles */
      .nav-links {
          display: flex;
          gap: 0.8rem;
      }

      .nav-links a {
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 8px !important;
          background: transparent !important;
          color: var(--text-secondary);
          font-size: 0;
          gap: 0 !important; /* Remove o espaço do texto invisível */
      }

      .nav-links a.active {
          background: var(--primary-gradient) !important;
          color: white !important;
      }

      .nav-links a.btn-ia {
          border: 1px solid var(--accent-color) !important;
          color: var(--accent-color);
      }

      .nav-links a svg {
          width: 20px;
          height: 20px;
          display: block;
          margin: 0 auto; /* Garante centralização horizontal absoluta */
      }

      /* 4. Ajustar botão de Sair */
      .logout-btn {
          font-size: 0; /* Esconde texto "Sair" */
          padding: 0.5rem; /* Botão quadrado */
      }
      
      /* 5. Ajustar container da direita */
      .right-actions {
          justify-self: end;
      }
    }
    @media (max-width: 640px) {
      .content-area {
        padding: 1rem !important; /* Reduz de 2rem para 1rem no celular */
      }
      .navbar {
        padding: 0 1rem !important; /* Ajusta o menu também */
      }
      .date-dropdown {
          right: 0;
          left: auto;
          width: 240px;
      }
      .logo {
          position: static;
          transform: none;
      }
    }
</style>