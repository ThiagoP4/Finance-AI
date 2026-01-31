<script setup lang="ts">

  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  

  import {
    PhCurrencyDollar,
    PhShoppingCart,
    PhTrendUp,
    PhChartLine
  } from '@phosphor-icons/vue'

  import VueApexCharts from 'vue3-apexcharts'
  import type { ApexOptions } from 'apexcharts'

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
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '16px', fontWeight: 600 } } } } }
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
      const response = await axios.get('http://localhost:3000/dashboard');
      const apiData = response.data;
      
      dashboardData.value = apiData;
      pieSeries.value = apiData.pieChart.series;
      pieOptions.value = {
        ...pieOptions.value,
        labels: apiData.pieChart.labels,
        colors: apiData.pieChart.colors
      };
      lineOptions.value = {
        ...lineOptions.value,
        xaxis: { 
          ...lineOptions.value.xaxis,
          categories: apiData.lineChart.categories 
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      alert("Erro ao conectar com o servidor. Verifique se o Backend está rodando.");
    }
  };

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
        <p class="value">R$ {{ dashboardData.total.toFixed(2) }}</p>
      </div>
      <div class="stat-card green">
        <div class="card-header">
          <h2>Compras Realizadas</h2>
          <PhShoppingCart size="32" weight="fill"></PhShoppingCart>
        </div>
        <p class="value">5</p>
      </div>
      <div class="stat-card purple">
        <div class="card-header">
          <h2>Média por Compra</h2>
          <PhChartLine size="32" weight="fill"></PhChartLine>
        </div>
        <p class="value">{{ dashboardData.ticketMedio.toFixed(2) }}</p>
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
          Mês anterior R$ {{ dashboardData.trend.last.toFixed(2) }}
        </span>
      </div>
    </section>

    <section class="detailed-analytics">
      <div class="chart-wrapper">
        <h2>Gastos por Categoria</h2>
        <div class="charts-placeholder">
          <VueApexCharts type="donut" height="300" :options="pieOptions" :series="pieSeries" />
        </div>
      </div>
  
      <div class="chart-wrapper">
        <h2>Análises Detalhadas por Categoria</h2>
        <div class="charts-placeholder">
          <VueApexCharts type="area" height="300" :options="lineOptions" :series="dashboardData.lineChart.series" />
        </div>
      </div>
    </section>

  </main>
</template>

<style scoped>

  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header { margin-bottom: 2rem; }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    padding: 1.5rem;
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  }

  .value {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0;
  }

  .blue { background-color: #2563EB; }
  .green { background-color: #10B981; }
  .purple { background-color: #8B5CF6; }
  .red { background-color: #EF4444; }

  .detailed-analytics {
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 1.5rem;
  }

  .chart-wrapper {
    border: 1px solid #ddd;
    padding: 1.5rem;
    border-radius: 8px;
  }

</style>