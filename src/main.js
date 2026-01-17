import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/aura-light-blue/theme.css';
import ConfirmationService from 'primevue/confirmationservice';

import App from './App.vue'
import router from './router'
import { loadAuthFromStorage } from './composables/useAuth.js'

// Charger l'authentification depuis le cache au démarrage
loadAuthFromStorage();

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue);
app.use(ConfirmationService);

app.mount('#app')
