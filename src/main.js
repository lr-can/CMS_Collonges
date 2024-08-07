import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/aura-light-blue/theme.css'
import ConfirmationService from 'primevue/confirmationservice';


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(
    createAuth0({
      domain: "dev-2hk03xxk88bgh0s8.eu.auth0.com",
      clientId: "GcY1BuX5ievgEqPebRtUCC6Fm32d2feN",
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  );

app.mount('#app')
