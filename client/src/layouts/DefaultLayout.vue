<script setup lang="ts">
    import { PhSignOut, PhTrendUp, PhHouse } from '@phosphor-icons/vue'
</script>

<template>
  <div class="layout-wrapper">
    <nav class="navbar">
      <div class="logo">
        <PhTrendUp size="28" weight="fill" class="logo-icon" />
        <span>Finance <span class="ai">AI</span></span>
      </div>

      <ul class="nav-links">
        <li><a href="#" class="active"><PhHouse size="20" /> Dashboard</a></li>
        <li><a href="#">Nova Compra</a></li>
        <li><a href="#">Categorias</a></li>
      </ul>

      <button class="logout-btn">
        <PhSignOut size="20" />
        Sair
      </button>
    </nav>

    <main class="content-area">
      <slot />
    </main>
  </div>
</template>

<style scoped>

    .layout-wrapper {
      font-family: 'Inter', sans-serif;
      background-color: #F8FAFC;
      min-height: 100vh;
    }

    .navbar {
      background-color: white;
      height: 70px;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #E2E8F0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1E293B;
        letter-spacing: -0.5px;
    }
    
    .logo-icon { color: #2563EB; }
    .ai { color: #2563EB; }

    .nav-links {
      list-style: none;
      display: flex;
      gap: 2rem;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: #64748B;
      font-weight: 500;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
    }

    .nav-links a:hover { color: #2563EB; }
    
    .nav-links a.active {
      color: #2563EB;
      border-bottom: #2563EB;
      font-weight: 600;
    }

    .logout-btn {
      background: transparent;
      border: 1px solid #F1F5F9;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: #EF4444;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background-color: #FEF2F2;
      border-color: #FECACA;
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
</style>