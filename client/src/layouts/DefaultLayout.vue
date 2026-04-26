<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { RouterLink, useRoute } from 'vue-router'
    import { PhHouse, PhFolders, PhSparkle, PhCalendarBlank, PhCaretDown, PhCaretLeft, PhCaretRight, PhCreditCard, PhList } from '@phosphor-icons/vue'
    import { storeToRefs } from 'pinia';
    import { onClickOutside } from '@vueuse/core';
    import Sidebar from '../components/Sidebar.vue';
    import logoUrl from '../assets/somma-logo.svg';
    import { useFilterStore } from '../stores/useFilterStore';
    import { useProfileStore } from '../stores/useProfileStore';


    const isDark = ref(false);
    const route = useRoute();
    const isSidebarOpen = ref(false);

    const filterStore = useFilterStore();
    const profileStore = useProfileStore();

    const { selectedMonth, selectedYear, filterMode, selectedCardIds } = storeToRefs(filterStore);

    const { selectMonth, nextYear, previousYear, monthNames, toggleCardSelection } = filterStore;
    const isDateDropdownOpen = ref(false);
    const dateDropdownRef = ref<HTMLElement | null>(null);

    onClickOutside(dateDropdownRef, () => {
        isDateDropdownOpen.value = false;
    })

    const handleMonthSelection = (index: number) => {
        selectMonth(index);
        isDateDropdownOpen.value = false;
    }

    onMounted(async () => {
        // Verifica o tema salvo no localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDark.value = true;
            document.body.classList.add('dark')
        }
        await profileStore.fetchProfileData(); 
        
        // Se entrar no modo fatura e não tiver nada selecionado, selecionamos o primeiro por padrão
        // para não começar "vazio" a menos que o usuário desmarque.
        if (filterMode.value === 'invoice' && selectedCardIds.value.length === 0 && profileStore.myCards.length > 0) {
            selectedCardIds.value = [profileStore.myCards[0].id_payment];
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
          <button class="date-btn" :class="{ 'mode-invoice-active': filterMode === 'invoice' }" @click="isDateDropdownOpen = !isDateDropdownOpen">
            <PhCalendarBlank size="18" v-if="filterMode === 'month'" />
            <PhCreditCard size="18" v-else />
            <span>{{ filterMode === 'month' ? monthNames[selectedMonth] + ' ' + selectedYear : 'Fatura de ' + monthNames[selectedMonth] }}</span>
            <PhCaretDown size="16" />
          </button>

          <div class="date-dropdown" v-if="isDateDropdownOpen">
            <div class="filter-tabs">
              <button
                class="tab-btn"
                :class="{ active: filterMode === 'month' }"
                @click="filterStore.setFilterMode('month')"
              >
              <PhCalendarBlank size="18" /> Por mês
              </button>
              <button
                class="tab-btn invoice-tab"
                :class="{ active: filterMode === 'invoice' }"
                @click="filterStore.setFilterMode('invoice')"
              >
                <PhCreditCard size="18" /> Por Fatura
              </button>
            </div>

            <div v-if="filterMode === 'month'">
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
            <div v-else class="invoice-selector">
              <p class="selector-title">Cartões selecionados:</p>
              <div class="cards-chips-grid">
                <div 
                  v-for="card in profileStore.myCards" 
                  :key="card.id_payment"
                  class="card-chip-item"
                  :class="{ selected: selectedCardIds.includes(card.id_payment) }"
                  @click="toggleCardSelection(card.id_payment)"
                >
                  <div class="chip-icon">
                    <PhCreditCard weight="fill" />
                  </div>
                  <div class="chip-details">
                    <span class="chip-name">{{ card.nickname }}</span>
                    <span class="chip-bank">{{ card.bank_name }}</span>
                  </div>
                  <div class="chip-check" v-if="selectedCardIds.includes(card.id_payment)">
                    <PhSparkle weight="fill" size="12" />
                  </div>
                </div>
              </div>
              <p v-if="profileStore.myCards.length === 0" class="no-cards-msg">Nenhum cartão cadastrado.</p>
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
      width: 280px;
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

    .filter-tabs {
      display: flex;
      background-color: var(--bg-page);
      padding: 4px;
      border-radius: 10px;
      margin-bottom: 0.8rem;
      gap: 4px;
    }

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.4rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      justify-content: center;
    }

    .tab-btn.active {
      background-color: var(--primary-color);
      color: white;
    }

    .tab-btn.invoice-tab.active {
        background-color: var(--primary-color);
    }
  
    .invoice-selector {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .selector-title {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.2rem;
    }

    .cards-chips-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      max-height: 250px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .card-chip-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 12px;
      border: 1.5px solid var(--border-color);
      background-color: var(--bg-page);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .card-chip-item:hover {
      border-color: var(--text-secondary);
      transform: translateX(4px);
    }

    .card-chip-item.selected {
      border-color: var(--accent-color);
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.02) 100%);
    }

    .chip-icon {
      width: 32px;
      height: 32px;
      background-color: var(--bg-card);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      transition: all 0.2s;
    }

    .card-chip-item.selected .chip-icon {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
      box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);
    }

    .chip-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .chip-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .chip-bank {
      font-size: 0.7rem;
      color: var(--text-secondary);
    }

    .chip-check {
      color: var(--accent-color);
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes popIn {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    .no-cards-msg {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-align: center;
        padding: 1rem;
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
          border: 1px solid var(--primary-color) !important;
          color: var(--primary-color);
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