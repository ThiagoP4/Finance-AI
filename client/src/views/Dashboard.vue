<script setup lang="ts">

  import { ref, onMounted, watch } from 'vue';
  import { supabase } from '../services/supabase';
  import { useDateStore } from '../stores/useDateStore';
  import { storeToRefs } from 'pinia';

  import {
    PhCurrencyDollar,
    PhShoppingCart,
    PhTrendUp,
    PhChartLine,
    PhTrendDown,
    PhArrowRight,
    PhWhatsappLogo
  } from '@phosphor-icons/vue'

  import VueApexCharts from 'vue3-apexcharts'
  import type { ApexOptions } from 'apexcharts'

  const dateStore = useDateStore();
  const { selectedMonth, selectedYear } = storeToRefs(dateStore);

  const dashboardData = ref({
    total: 0,
    count: 0,
    ticketMedio: 0,
    trend: {
      status: 'stable',
      text: 'Analisando...',
      current: 0,
      last: 0
    },
    pieChart: {
      series: [] as number[],
      labels: [] as string[],
      colors: [] as string[]
    },
    lineChart: {
      series: [] as any[],
      categories: [] as string[]
    }
  });

  // --- CONFIGURAÇÃO DO GRÁFICO DE PIZZA (DONUT) ---
  const pieSeries = ref<number[]>([]);


  const pieOptions = ref<ApexOptions>({
    labels: [],
    colors: [],
    chart: {type: 'donut', fontFamily: 'Inter, sans-serif'},
    legend: {position: 'bottom', fontSize: '14px'},
    dataLabels: {enabled: false},
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '16px', fontWeight: 600, formatter: (w: any) => 'R$ ' + w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toFixed(2) } } } } }
    });

  // --- CONFIGURAÇÃO DO GRÁFICO DE LINHAS ---

  const lineOptions =  ref<ApexOptions>({
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' }, // Toolbar false remove o menu de download
    stroke: { curve: 'smooth', width: 3 }, // Deixa a linha curva
    colors: ['#3B82F6'], // Azul
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    xaxis: { 
      categories: [], 
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: { show: true, borderColor: '#F1F5F9', strokeDashArray: 4 },
    tooltip: { 
      theme: 'light',
      x: { format: 'dd/MM/yyyy' }
     }
  });

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_data', {
        p_month: selectedMonth.value + 1,
        p_year: selectedYear.value
      });

      if (error) throw error;
      
      const apiData = data;

      if (!apiData) return;
      
      dashboardData.value = {
        total: Number(apiData.total) || 0,
        count: Number(apiData.count) || 0,
        ticketMedio: Number(apiData.ticketMedio) || 0,
        trend: {
          status: apiData.trend?.status || 'stable',
          text: apiData.trend?.text || 'Sem dados',
          current: Number(apiData.trend?.current) || 0,
          last: Number(apiData.trend?.last) || 0
        },
        pieChart: { series: [], labels: [], colors: [] },
        lineChart: { series: [], categories: [] }
      };

      // Atualiza Gráfico de Pizza
      if (apiData.pieChart && apiData.pieChart.series) {
        pieSeries.value = apiData.pieChart.series;
        pieOptions.value = {
          ...pieOptions.value,
          labels: apiData.pieChart.labels || [],
          colors: apiData.pieChart.colors || []
        };
      } else {
         // Se não tiver dados, zera o gráfico para não dar erro
         pieSeries.value = [];
      }
      

      // Atualiza Gráfico de Linha
      if (apiData.lineChart && apiData.lineChart.series) {
        const safeSeries = apiData.lineChart.series.map((serie: any) => ({
          ...serie,
          data: Array.isArray(serie.data) ? serie.data : []
        }));
        const hasData = safeSeries.some((s: any) => s.data && s.data.length > 0);
        if (hasData) {
          dashboardData.value.lineChart.series = safeSeries;
          lineOptions.value = {
            ...lineOptions.value,
            xaxis: { 
              ...lineOptions.value.xaxis,
              categories: apiData.lineChart.categories || []
            }
          };
          } else {
            // Se não tiver dados, zera o gráfico para não dar erro
            dashboardData.value.lineChart.series = [];
          }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      console.log("Erro ao conectar com o servidor. Verifique se o Backend está rodando.");
    }
  };

  watch([selectedMonth, selectedYear], () => {
    fetchData();
  });

  onMounted(() => {
    fetchData();
  });

</script>

<template>
  <main class="container">

    <header class="page-header">
      <h1>Dashboard Financeiro</h1>
      <p>Análise completa dos seus gastos e tendências de consumo</p>
    </header>

    <section class="stats-overview">

      <div class="stat-card blue">
        <div class="card-header">
          <h2>Total de Gastos</h2>
          <PhCurrencyDollar size="32" weight="fill"></PhCurrencyDollar>
        </div>
        <p class="value">R$ {{ (dashboardData.total || 0).toFixed(2) }}</p>
      </div>
      <div class="stat-card green">
        <div class="card-header">
          <h2>Compras Realizadas</h2>
          <PhShoppingCart size="32" weight="fill"></PhShoppingCart>
        </div>
        <p class="value">{{ dashboardData.count || 0 }}</p>
      </div>
      <div class="stat-card purple">
        <div class="card-header">
          <h2>Média por Compra</h2>
          <PhChartLine size="32" weight="fill"></PhChartLine>
        </div>
        <p class="value">R$ {{ (dashboardData.ticketMedio || 0).toFixed(2) }}</p>
      </div>
      <div class="stat-card" :class="{
        'red': dashboardData.trend.status === 'up',
        'green': dashboardData.trend.status === 'down',
        'blue': dashboardData.trend.status === 'stable'
      }">
        <div class="card-header">
          <h2>Tendência de Consumo</h2>
          <PhTrendUp size="32" weight="fill" v-if="dashboardData.trend.status === 'up'"></PhTrendUp>
          <PhTrendDown size="32" weight="fill" v-else-if="dashboardData.trend.status === 'down'"></PhTrendDown>
          <PhArrowRight size="32" weight="fill" v-else></PhArrowRight>
        </div>
        <p class="value">{{ dashboardData.trend.text }}</p>
        <span style="font-size: 0.8rem; opacity: 0.8;">
          Mês anterior R$ {{ (dashboardData.trend.last || 0).toFixed(2) }}
        </span>
      </div>
    </section>

    <section class="detailed-analytics">
      <div class="chart-wrapper">
        <h2>Gastos por Categoria</h2>
        <div class="charts-placeholder">
          <VueApexCharts 
          v-if="pieSeries && pieSeries.length > 0"
          type="donut" 
          height="300" 
          :options="pieOptions" 
          :series="pieSeries" />
          <div v-else class="no-data-message">
            <p>Sem dados ou carregando...</p>
          </div>
        </div>
      </div>
  
      <div class="chart-wrapper">
        <h2>Análises Detalhadas por Categoria</h2>
        <div class="charts-placeholder">
          <VueApexCharts 
            v-if="dashboardData.lineChart && dashboardData.lineChart.series && dashboardData.lineChart.series.length > 0"
            type="area" 
            height="300" 
            :options="lineOptions" 
            :series="dashboardData.lineChart.series" />
            <div v-else class="no-data-message">
              <p>Sem dados ou carregando...</p>
            </div>
        </div>
      </div>
    </section>

    <!-- Botão de WhatsApp Flutuante (Exclusivo da Home) -->
    <a 
      href="https://wa.me/5527997816701" 
      target="_blank" 
      class="whatsapp-float"
      title="Fale com nosso Bot"
    >
      <PhWhatsappLogo :size="28" weight="fill" />
    </a>

  </main>
</template>

<style scoped>
  .page-header { margin-bottom: 2rem; }

  .page-header h1 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem 0;
  } 

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 1024px) {
    .stats-overview { grid-template-columns: repeat(2, 1fr); }

    .detailed-analytics { 
        grid-template-columns: 1fr; 
    }
  }
  @media (max-width: 640px) {
    .stats-overview { 
      grid-template-columns: 1fr !important; 
      gap: 1rem;
      margin-bottom: 1.5rem; 
    }
    .detailed-analytics { 
      grid-template-columns: 1fr !important;
      gap: 1rem;
    }
    .page-header h1 {
      font-size: 1.25rem; /* ~20px */
    }
    .page-header p {
      font-size: 0.85rem;
    }
    .value {
        font-size: 1.5rem !important; /* Diminui o número do valor */
    }
    .stat-card {
        padding: 1.25rem; /* Card mais compacto */
        min-height: auto;
    }
    .stat-card h2 { font-size: 0.8rem; }
    .chart-wrapper {
      padding: 1rem;
    }
    .chart-wrapper h2 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }

  .stat-card {
    padding: 1.5rem;
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px var(--shadow-color);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .stat-card h2 {
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
    opacity: 0.9;
    color: white;
  }

  .value {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0;
  }

  .blue { background-color: #1D4ED8; }
  .green { background-color: #047857; }
  .purple { background-color: #8B5CF6; }
  .red { background-color: #B91C1C; }

  .detailed-analytics {
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 1.5rem;
  }

  .chart-wrapper {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 1.5rem;
    border-radius: 16px;
    overflow: hidden; 
    width: 100%;
  }
  
  .chart-wrapper h2 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
  }

  .no-data-message {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    background-color: rgba(0,0,0, 0.02);
    border-radius: 8px;
  }

  @media (max-width: 640px) {
    .page-header {
      display: flex;
      flex-direction: column;
    }
  }

  /* Estilo do Botão de WhatsApp Minimalista */
  .whatsapp-float {
      position: fixed;
      width: 50px;
      height: 50px;
      bottom: 25px;
      right: 25px;
      background-color: #25d366;
      color: #FFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      z-index: 1000;
      text-decoration: none;
      transition: transform 0.2s ease;
  }

  .whatsapp-float:hover {
      transform: translateY(-3px);
      background-color: #1ed760;
  }

  @media (max-width: 768px) {
      .whatsapp-float {
          width: 45px;
          height: 45px;
          bottom: 20px;
          right: 20px;
      }
  }
</style>