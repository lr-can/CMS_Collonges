<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <div class="pwa-install-content">
      <div class="pwa-install-icon">
        <img src="@/assets/logo.png" alt="CMS Collonges" width="48" height="48" />
      </div>
      <div class="pwa-install-text">
        <h3>Installer l'application</h3>
        <p v-if="!isIOS">Ajoutez CMS Collonges à votre écran d'accueil pour un accès rapide et une meilleure expérience.</p>
        <div v-if="isIOS" class="ios-instructions">
          <p><strong>Pour installer sur iOS :</strong></p>
          <ol>
            <li>Appuyez sur le bouton <strong>Partager</strong> <span class="share-icon">⎋</span></li>
            <li>Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong></li>
            <li>Appuyez sur <strong>"Ajouter"</strong></li>
          </ol>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button @click="installPWA" class="install-btn" v-if="!isIOS">
          Installer
        </button>
        <button @click="dismissPrompt" class="dismiss-btn">
          {{ isIOS ? 'Fermer' : 'Plus tard' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const showInstallPrompt = ref(false);
let deferredPrompt = null;

const isIOS = computed(() => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
});

const checkInstallability = () => {
  // Vérifier si l'app est déjà installée
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    return false;
  }

  // Vérifier si l'utilisateur a déjà rejeté l'installation
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10);
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    // Réafficher après 7 jours
    if (daysSinceDismissed < 7) {
      return false;
    }
  }

  return true;
};

const handleBeforeInstallPrompt = (e) => {
  // Empêcher le prompt par défaut
  e.preventDefault();
  deferredPrompt = e;
  
  if (checkInstallability()) {
    showInstallPrompt.value = true;
  }
};

const installPWA = async () => {
  if (!deferredPrompt) {
    // Pour iOS, les instructions sont déjà affichées dans le prompt
    if (isIOS.value) {
      return;
    }
    return;
  }

  // Afficher le prompt d'installation
  deferredPrompt.prompt();
  
  // Attendre la réponse de l'utilisateur
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('L\'utilisateur a accepté l\'installation');
    localStorage.setItem('pwa-install-accepted', Date.now().toString());
  } else {
    console.log('L\'utilisateur a refusé l\'installation');
  }
  
  deferredPrompt = null;
  showInstallPrompt.value = false;
};

const dismissPrompt = () => {
  showInstallPrompt.value = false;
  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
};

const handleAppInstalled = () => {
  console.log('PWA installée');
  showInstallPrompt.value = false;
  deferredPrompt = null;
  localStorage.setItem('pwa-install-accepted', Date.now().toString());
};

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
  
  // Pour iOS, vérifier si on peut afficher les instructions
  if (isIOS.value && checkInstallability()) {
    // Attendre un peu avant d'afficher pour iOS
    setTimeout(() => {
      if (!window.navigator.standalone) {
        showInstallPrompt.value = true;
      }
    }, 3000);
  }
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2rem);
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.pwa-install-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pwa-install-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.pwa-install-icon img {
  border-radius: 12px;
}

.pwa-install-text {
  text-align: center;
}

.pwa-install-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.pwa-install-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.ios-instructions {
  text-align: left;
  margin-top: 0.5rem;
}

.ios-instructions p {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.ios-instructions ol {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  font-size: 0.85rem;
  line-height: 1.6;
}

.ios-instructions li {
  margin-bottom: 0.5rem;
}

.share-icon {
  display: inline-block;
  font-size: 1.2em;
  margin: 0 0.25rem;
}

.pwa-install-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.install-btn,
.dismiss-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.install-btn {
  background-color: #0078f3;
  color: white;
}

.install-btn:hover {
  background-color: #0066cc;
  transform: translateY(-1px);
}

.install-btn:active {
  transform: translateY(0);
}

.dismiss-btn {
  background-color: #f0f0f0;
  color: #333;
}

.dismiss-btn:hover {
  background-color: #e0e0e0;
}

@media (min-width: 1024px) {
  .pwa-install-prompt {
    bottom: 100px;
  }
}
</style>
