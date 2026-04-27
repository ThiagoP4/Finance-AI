import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import './style.css'
import router from './router'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

// Avisa ao sistema de update que o app carregou com sucesso
CapacitorUpdater.notifyAppReady();

import './style.css' 

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router) 
app.mount('#app')