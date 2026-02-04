<script setup>
console.log(`%cFait avec amour 🫶, sueur 💪💦 et larmes 🥹 par le Caporal Lorcan BRENDERS pour un stage de projet universitaire.`, "background-color: #f4f6ff; color: #0078f3; text-align:justify; padding: 1rem; border-radius: 1rem;font-size:20px;font-weight:bold;");
import { RouterLink, RouterView } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import { ref, watch, computed, onMounted } from 'vue';
import { useSqlStore } from "@/stores/database.js";

import Bing from '@/assets/sounds/Bing.mp3';
const UpdateAudio = new Audio(Bing);

const sqlStore = useSqlStore();

const { isAuthenticated: authIsAuthenticated, loadAuthFromStorage } = useAuth();
const isAuthenticated = computed(() => authIsAuthenticated.value);
const appLoading = ref(true);
const commitBackend = ref('0');
const commitFrontend = ref('0');
const isUpdated = ref(false);

sqlStore.getLastCommitNumber('cms_collonges_backend').then((commit) => {
  if (commit === null) {
    commitBackend.value = '00';
  } else {
    commitBackend.value = commit;
  }
});

sqlStore.getLastCommitNumber('CMS_Collonges').then((commit) => {
  if (commit === null) {
    commitFrontend.value = '00';
  } else {
    commitFrontend.value = commit;
  }
  if (localStorage.getItem('lastCommitFrontend') !== commit) {
    isUpdated.value = true;
  }
  localStorage.setItem('lastCommitFrontend', commit);
});


const initialise = async () => {
  console.log('Checking authentication');
  try {
    // Charger l'authentification depuis le cache
    loadAuthFromStorage();
    const authenticated = localStorage.getItem('cms_auth_authenticated') === 'true';
    
    if (authenticated) {
      console.log('Authentication found in cache');
      localStorage.setItem('cms_auth_authenticated', 'true');
    } else {
      console.log('Authentication required');
      localStorage.removeItem('cms_auth_authenticated');
    }
  } catch (error) {
    console.error('Error during authentication check', error);
  } finally {
    await new Promise(r => setTimeout(r, 1500));
    appLoading.value = false;  // End the loading state here
  }
};

onMounted(() => {
  initialise();
});

// Ne réinitialiser le profil que s'il n'existe pas déjà
if (!localStorage.getItem('currentProfile')) {
  localStorage.setItem('currentProfile', '');
}

const currentProfile = ref(localStorage.getItem('currentProfile'));

// Ne plus forcer la redirection vers home - laisser le router gérer la navigation naturellement
// La redirection initiale vers '/' se fera automatiquement si nécessaire


let profileCheck = setInterval(() => {
  currentProfile.value = localStorage.getItem('currentProfile');
}, 1000);

watch(currentProfile, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    console.log('Profile changé:', newValue);
    clearInterval(profileCheck);
  }
});

async function reloadApp() {
  UpdateAudio.play();
  await new Promise(r => setTimeout(r, 1000));
  window.location.reload();
}

initialise();
</script>


<template>
  <transition>
    <div v-if="appLoading" class="blank">
      <div class="loading-content">
        <img src="@/assets/loadingApp.gif" alt="Loading" width="200px" height="auto">
        <div class="versionNum">Version 2.2.0-{{commitBackend}}.{{commitFrontend}}</div>
      </div>
    </div>
  </transition>
  <div class="app-shell">
    <header>
      <div class="top-menu" id="logoCell">
        <a href="/">
          <img alt="CMS logo" class="logo" src="@/assets/logoTitle.png" width="170vh" height="auto" />
        </a>
      </div>
      <div class="top-menu" id="profile">
        <nav class="profile-nav">
          <RouterLink to="/profile" v-if="isAuthenticated"><img alt="Profile" src="@/assets/icons/profile.svg" width="30" height="auto" /></RouterLink>
        </nav>
      </div>
    </header>
    <div v-if="isUpdated && !appLoading" class="update" @click="reloadApp">
      <span>Une mise à jour de l'application a été effectuée !<br> Cliquez pour recharger.</span>
    </div>
    <div id="RouterView">
      <RouterView />
    </div>
  </div>
  <div class="wrapper">
    <nav>
      <RouterLink to="/"><img alt="Profile" src="@/assets/icons/home.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/peremptions" v-if="isAuthenticated && currentProfile == 'pharmacie'"><img alt="Peremption" src="@/assets/icons/peremptions.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/reception" v-if="isAuthenticated && currentProfile == 'pharmacie'"><img alt="Reception" src="@/assets/icons/reception.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/disposition" v-if="isAuthenticated && currentProfile == 'pharmacie'"><img alt="Disposition" src="@/assets/icons/disposition.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/search" v-if="isAuthenticated && currentProfile == 'pharmacie'"><img alt="Search" src="@/assets/icons/search.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/order" v-if="isAuthenticated && currentProfile == 'pharmacie'"><img alt="Order" src="@/assets/icons/order.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/asupGrandPublic" v-if="!isAuthenticated || currentProfile == ''"><img alt="ASUP" src="@/assets/icons/asup.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/RIGrandPublic" v-if="!isAuthenticated || currentProfile == ''"><img alt="RI" src="@/assets/icons/report.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/replaceAsup" v-if="isAuthenticated && currentProfile == 'asup'"><img alt="Order" src="@/assets/icons/replace.svg" width="25" height="auto" /></RouterLink>
      <RouterLink to="/expiryAsup" v-if="isAuthenticated && currentProfile == 'asup'"><img alt="Order" src="@/assets/icons/expiry.svg" width="25" height="auto" /></RouterLink>
      <RouterLink to="/reportAsup" v-if="isAuthenticated && currentProfile == 'asup'"><img alt="Order" src="@/assets/icons/report.svg" width="25" height="auto" /></RouterLink>
      <RouterLink to="/formationSearch" v-if="isAuthenticated && currentProfile == 'formation'"><img alt="Search" src="@/assets/icons/search.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/formationSearchAgent" v-if="isAuthenticated && currentProfile == 'formation'"><img alt="Search Agent" src="@/assets/icons/searchAgent.svg" width="30" height="auto" /></RouterLink>
      <RouterLink to="/telex" v-if="(isAuthenticated && currentProfile != 'pharmacie') || !isAuthenticated"><img alt="telex" src="@/assets/icons/telex.svg" width="30" height="auto" /></RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
}

header {
  line-height: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.5rem;
}

.top-menu {
  display: flex;
  align-items: center;
  padding: 0;
}

#profile {
  padding: 0;
}

#RouterView {
  padding: 1.5rem 0 2.5rem;
}

.logo {
  display: block;
  margin: 0 auto;
  width: clamp(120px, 38vw, 180px);
}

#logoNav {
  opacity: 1;
}

.wrapper nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  overflow-x: auto;
  white-space: nowrap;
}

.wrapper nav a.router-link-exact-active {
  opacity: 0.25;
}

.wrapper nav a {
  opacity: 0.85;
}

.wrapper nav a.router-link-exact-active:hover {
  background-color: transparent;
}

.wrapper nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

.wrapper nav a:first-of-type {
  border: 0;
}

.wrapper {
  position: fixed; 
  bottom: 0;
  left: 0;
  right: 0;
  height: 15vw;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

@media (min-width: 1024px) {
  .app-shell {
    max-width: var(--layout-max-width);
    margin: 0 auto;
    background: white;
    border-radius: var(--layout-shell-radius);
    box-shadow: var(--layout-shell-shadow);
    padding: 1.5rem 2rem 2rem;
  }

  header {
    padding-bottom: 0;
  }

  #RouterView {
    padding: 1.5rem 0 0;
  }

  .wrapper {
    top: var(--layout-gutter);
    bottom: var(--layout-gutter);
    left: var(--layout-gutter);
    right: auto;
    width: var(--layout-side-width);
    height: auto;
    border-radius: 18px;
    opacity: 0.98;
    padding: 0.75rem 0.5rem;
  }

  .wrapper nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    white-space: normal;
  }

  .wrapper nav a {
    border-left: none;
    border-bottom: 1px solid var(--color-border);
    padding: 0.6rem 0;
  }

  .wrapper nav a:last-of-type {
    border-bottom: none;
  }
}

.blank {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.versionNum {
  font-size: 1.2rem;
  text-align: center;
  margin-top: 0.5rem;
}

.update {
  background-color: #f4f6ff;
  color: #0078f3;
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  cursor: pointer;
}

@media (min-width: 1024px) {
  .update {
    border-radius: 10px;
    margin-top: 0.5rem;
  }
}
</style>