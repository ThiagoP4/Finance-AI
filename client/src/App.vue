<script setup lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue'
import Dashboard from './components/Dashboard.vue';
</script>

<template>
  <DefaultLayout>
    <Dashboard />
  </DefaultLayout>
</template>

<style>
/* 3. Reset Global: Isso remove as bordas brancas padrão do navegador */
body {
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
}
</style>