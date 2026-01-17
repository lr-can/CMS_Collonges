<template>
  <div class="login-container">
    <div class="login-form">
      <div class="subtitle">
        Connexion
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <form @submit.prevent="handleLogin" autocomplete="off">
        <label for="email">Adresse email<span class="mandatory">*</span>
          <InputText 
            id="email" 
            v-model="email" 
            type="email" 
            class="form-item" 
            placeholder="prenom.nom@sdmis.fr" 
            :disabled="loading"
            required
          />
        </label>
        <label for="matricule">Matricule<span class="mandatory">*</span>
          <InputText 
            id="matricule" 
            v-model="matricule" 
            class="form-item" 
            placeholder="V00000" 
            :disabled="loading"
            required
          />
        </label>
        <span class="mandatory">*</span> Champs obligatoires
        <div class="login-button" @click="handleLogin" :class="{ 'disabled': loading }">
          <span v-if="loading">Connexion en cours...</span>
          <span v-else>Se connecter</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { useAuth } from '@/composables/useAuth.js';

const { fetchAuthInfo } = useAuth();

const email = ref('');
const matricule = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (!email.value || !matricule.value) {
    error.value = 'Veuillez remplir tous les champs obligatoires.';
    return;
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    error.value = 'Veuillez entrer une adresse email valide.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const user = await fetchAuthInfo(email.value, matricule.value);
    if (!user) {
      error.value = 'Identifiants incorrects. Veuillez réessayer.';
    } else {
      // Connexion réussie, recharger la page pour mettre à jour l'état
      window.location.reload();
    }
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    error.value = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.mandatory {
  color: #ce0500;
}

.form-item {
  border-radius: 30px;
  width: 100%;
  font-family: 'Marianne';
  margin-bottom: 1.5rem;
}

.form-item > input {
  border-radius: 30px;
}

.form-item input[disabled] {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

label {
  font-weight: 500;
  font-size: 16px;
  margin-top: 1.5rem;
  margin-bottom: 1.2rem;
  display: block;
  text-align: left;
}

label:first-of-type {
  margin-top: 0;
}

.login-button {
  background-color: #0078f3;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1.5rem;
  transition: all 0.3s ease-in-out;
}

.login-button:hover:not(.disabled) {
  background-color: #0056b3;
}

.login-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fff4f3;
  color: #d64d00;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
</style>

