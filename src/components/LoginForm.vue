<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h1 class="login-title">Connexion</h1>
        <p class="login-subtitle">Connectez-vous pour accéder à votre espace</p>
      </div>
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
      <form @submit.prevent="handleLogin" autocomplete="off" class="login-form-content">
        <div class="form-group">
          <label for="email" class="form-label">
            Adresse email<span class="mandatory">*</span>
          </label>
          <InputText 
            id="email" 
            v-model="email" 
            type="email" 
            class="form-item" 
            placeholder="prenom.nom@sdmis.fr" 
            :disabled="loading"
            required
          />
        </div>
        <div class="form-group">
          <label for="matricule" class="form-label">
            Matricule<span class="mandatory">*</span>
          </label>
          <InputText 
            id="matricule" 
            v-model="matricule" 
            class="form-item" 
            placeholder="V00000" 
            :disabled="loading"
            required
          />
        </div>
        <div class="form-footer">
          <span class="mandatory-hint">* Champs obligatoires</span>
        </div>
        <button 
          type="submit" 
          class="login-button" 
          :class="{ 'disabled': loading, 'loading': loading }"
          :disabled="loading"
        >
          <span v-if="loading" class="button-content">
            <span class="spinner"></span>
            <span>Connexion en cours...</span>
          </span>
          <span v-else class="button-content">
            <span>Se connecter</span>
            <span class="button-arrow">→</span>
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import { useAuth } from '@/composables/useAuth.js';

const router = useRouter();
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
      // Connexion réussie, rediriger vers la page d'accueil
      router.push({ name: 'home' });
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.login-form {
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 2.5rem 2rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.login-form-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  display: block;
  margin: 0;
  letter-spacing: 0.01em;
}

.mandatory {
  color: #ce0500;
  margin-left: 0.2rem;
  font-weight: 700;
}

.form-item {
  width: 100%;
  font-family: 'Marianne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.form-item :deep(.p-inputtext) {
  width: 100%;
  padding: 0.875rem 1.125rem;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.form-item :deep(.p-inputtext):hover {
  border-color: #b0b0b0;
  background-color: #fff;
}

.form-item :deep(.p-inputtext):focus {
  border-color: #0078f3;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(0, 120, 243, 0.1);
  outline: none;
}

.form-item :deep(.p-inputtext:disabled) {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-footer {
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.mandatory-hint {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #0078f3 0%, #0056b3 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 120, 243, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.login-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 120, 243, 0.4);
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
}

.login-button:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 120, 243, 0.3);
}

.login-button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-button.loading {
  opacity: 0.8;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.button-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.login-button:hover:not(.disabled) .button-arrow {
  transform: translateX(4px);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  color: #d64d00;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  border: 1px solid rgba(214, 77, 0, 0.2);
  font-weight: 500;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .login-container {
    padding: 2rem 0;
  }

  .login-form {
    max-width: 520px;
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .login-form {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .login-subtitle {
    font-size: 0.9rem;
  }
}
</style>

