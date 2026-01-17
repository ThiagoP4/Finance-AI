<script setup lang="ts">

  import {
    PhCurrencyDollar,
    PhShoppingCart,
    PhTrendUp,
    PhChartLine
  } from '@phosphor-icons/vue'

  import VueApexCharts from 'vue3-apexcharts'
  import type { ApexOptions } from 'apexcharts'

  // --- CONFIGURAÇÃO DO GRÁFICO DE PIZZA (DONUT) ---
  const pieSeries = [62, 19, 12, 8] // Dados exemplo
  const pieOptions: ApexOptions = {
    labels: ['Alimentação', 'Transporte', 'Lazer', 'Outros'],
    colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
    chart: {type: 'donut', fontFamily: 'Inter, sans-serif'},
    legend: {position: 'bottom', fontSize: '14px'},
    dataLabels: {enabled: false},
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '16px', fontWeight: 600 } } } } }
    }

  // --- CONFIGURAÇÃO DO GRÁFICO DE LINHAS ---
  const lineSeries = [{ name: 'Gastos', data: [500, 700, 800, 600, 900, 1100, 1300]}]
  const lineOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' }, // Toolbar false remove o menu de download
    stroke: { curve: 'smooth', width: 3 }, // Deixa a linha curva
    colors: ['#3B82F6'], // Azul
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    xaxis: { 
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'], 
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    grid: { show: true, borderColor: '#F1F5F9', strokeDashArray: 4 },
    tooltip: { theme: 'light' }
  }

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
        <p class="value">R$ 5.000,00</p>
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
        <p class="value">R$ 1.000,00</p>
      </div>
      <div class="stat-card red">
        <div class="card-header">
          <h2>Tendência de Consumo</h2>
          <PhTrendUp size="32" weight="fill"></PhTrendUp>
        </div>
        <p class="value">Em alta</p>
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
          <VueApexCharts type="area" height="300" :options="lineOptions" :series="lineSeries" />
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