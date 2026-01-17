<template>
  <div v-if="isloading">
    Chargement...
  </div>
  <div v-else>
    <div v-if="!isAuthenticated">
      <notConnected/>
    </div>
    <div v-else-if="isAuthenticated && currentProfile == ''">
      <div class="subtitle">
        Bonjour, {{ nomAgent }} !
      </div>
      <div class="subsubtitle">
        Choisissez une option ci-dessous
      </div>
      
      <!-- Menu global classé par profil -->
      <div class="menu-container">
        <!-- Section Publique (en haut) -->
        <div class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.public.background, color: PROFILE_COLORS.public.primary }">
            <h3>Accès Public</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in routesByProfile.public" 
              :key="route.path"
              class="route-card"
              :style="{ 
                backgroundColor: PROFILE_COLORS.public.background,
                color: PROFILE_COLORS.public.primary,
                borderColor: PROFILE_COLORS.public.primary
              }"
              @click="navigateToRoute(route)"
            >
              <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>

        <!-- Section Pharmacie -->
        <div v-if="hasProfileAccess('pharmacie')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.pharmacie.background, color: PROFILE_COLORS.pharmacie.primary }">
            <h3>Gestion Pharmacie</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('pharmacie')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route), 'active-profile': currentProfile === 'pharmacie' }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.primary : '#999999',
                borderColor: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.primary : '#cccccc',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="navigateToRoute(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>

        <!-- Section ASUP -->
        <div v-if="hasProfileAccess('asup')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.asup.background, color: PROFILE_COLORS.asup.primary }">
            <h3>Gestion ASUP</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('asup')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route), 'active-profile': currentProfile === 'asup' }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.asup.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.asup.primary : '#999999',
                borderColor: isRouteAccessible(route) ? PROFILE_COLORS.asup.primary : '#cccccc',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="navigateToRoute(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>

        <!-- Section Formation -->
        <div v-if="hasProfileAccess('formation')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.formation.background, color: PROFILE_COLORS.formation.primary }">
            <h3>Gestion Formation</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('formation')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route), 'active-profile': currentProfile === 'formation' }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.formation.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.formation.primary : '#999999',
                borderColor: isRouteAccessible(route) ? PROFILE_COLORS.formation.primary : '#cccccc',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="navigateToRoute(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isAuthenticated && currentProfile !== ''">
      <div class="subtitle">
        Bonjour, {{ nomAgent }} !
      </div>
      <div class="subsubtitle">
        Profil actif : {{ getProfileLabel(currentProfile) }}
      </div>
      <div class="dashboard-link" @click="router.push('/dashboard')">
        <div class="dashboard-card">
          <span>📊 Accéder au tableau de bord</span>
        </div>
      </div>
      <div class="subsubtitle" style="margin-top: 2rem;">
        Ou choisissez une option ci-dessous
      </div>
      
      <!-- Menu global classé par profil (toujours visible) -->
      <div class="menu-container">
        <!-- Section Publique (en haut) -->
        <div class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.public.background, color: PROFILE_COLORS.public.primary }">
            <h3>Accès Public</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in routesByProfile.public" 
              :key="route.path"
              class="route-card"
              :style="{ 
                backgroundColor: PROFILE_COLORS.public.background,
                color: PROFILE_COLORS.public.primary,
                borderColor: PROFILE_COLORS.public.primary
              }"
              @click="navigateToRoute(route)"
            >
              <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>

        <!-- Section Pharmacie -->
        <div v-if="hasProfileAccess('pharmacie')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.pharmacie.background, color: PROFILE_COLORS.pharmacie.primary }">
            <h3>Gestion Pharmacie</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('pharmacie')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route), 'active-profile': currentProfile === 'pharmacie' }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.primary : '#999999',
                borderColor: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.primary : '#cccccc',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="navigateToRoute(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>

        <!-- Section ASUP -->
        <div v-if="hasProfileAccess('asup')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.asup.background, color: PROFILE_COLORS.asup.primary }">
            <h3>Gestion ASUP</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('asup')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route), 'active-profile': currentProfile === 'asup' }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.asup.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.asup.primary : '#999999',
                borderColor: isRouteAccessible(route) ? PROFILE_COLORS.asup.primary : '#cccccc',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="navigateToRoute(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>

        <!-- Section Formation -->
        <div v-if="hasProfileAccess('formation')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.formation.background, color: PROFILE_COLORS.formation.primary }">
            <h3>Gestion Formation</h3>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('formation')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route), 'active-profile': currentProfile === 'formation' }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.formation.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.formation.primary : '#999999',
                borderColor: isRouteAccessible(route) ? PROFILE_COLORS.formation.primary : '#cccccc',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="navigateToRoute(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <pwaInstallPrompt />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAuth } from '@/composables/useAuth.js';
import { useRouter } from 'vue-router';
import notConnected from '../components/notConnected.vue';
import DashboardView from './DashboardView.vue';
import pwaInstallPrompt from '../components/pwaInstallPrompt.vue';
import { useRoutes, PROFILE_COLORS, ROUTES_CONFIG } from '@/composables/useRoutes.js';

const { user: authUser } = useAuth();
const router = useRouter();
const { isAuthenticated, routesByProfile, getAvailableProfiles, isRouteAccessible: checkRouteAccess, hasFullAccess } = useRoutes();

const isloading = ref(false);
const nomAgent = ref('');
const availableProfiles = ref([]);

const currentProfile = computed(() => {
  return localStorage.getItem('currentProfile') || '';
});

const getProfileLabel = (profile) => {
  const labels = {
    'pharmacie': 'Gestion Pharmacie',
    'asup': 'Gestion ASUP',
    'formation': 'Gestion Formation'
  };
  return labels[profile] || profile;
};

const hasProfileAccess = (profile) => {
  return availableProfiles.value.includes(profile);
};

const getAllRoutesForProfile = (profile) => {
  return ROUTES_CONFIG.filter(route => route.profile === profile);
};

const isRouteAccessible = (route) => {
  // Pour les routes publiques, toujours accessibles
  if (route.profile === 'public') {
    return true;
  }
  
  // Vérifier si l'utilisateur a tous les accès (Développeur ou Chef de Caserne)
  const user = authUser.value;
  if (user && user.profile && user.profile[2]) {
    const userProfile = user.profile[2];
    if (hasFullAccess(userProfile)) {
      // Les développeurs ont accès à tout, même si un profil différent est sélectionné
      return true;
    }
  }
  
  // Si l'utilisateur n'a pas accès au profil, la route n'est pas accessible
  if (!hasProfileAccess(route.profile)) {
    return false;
  }
  
  // Si un profil est sélectionné, seules les routes de ce profil sont accessibles
  // (sauf pour les développeurs qui ont déjà été gérés ci-dessus)
  if (currentProfile.value && route.profile !== currentProfile.value) {
    return false;
  }
  
  // Si pas de profil sélectionné mais route nécessite auth, accessible si utilisateur a le profil
  if (!currentProfile.value && route.requiresAuth && isAuthenticated.value) {
    return hasProfileAccess(route.profile);
  }
  
  // Utiliser la fonction du composable
  return checkRouteAccess(route);
};

const getIconPath = (iconName) => {
  return new URL(`../assets/icons/${iconName}`, import.meta.url).href;
};

const navigateToRoute = async (route) => {
  console.log('Navigation vers:', route.path);
  console.log('Route accessible?', isRouteAccessible(route));
  console.log('Profil actuel:', currentProfile.value);
  console.log('Profil requis:', route.profile);
  
  if (!isRouteAccessible(route)) {
    console.log('Route non accessible, navigation bloquée');
    return;
  }
  
  // Si la route nécessite un profil et qu'aucun n'est sélectionné, le sélectionner automatiquement
  // Pour les développeurs, on peut toujours sélectionner le profil même s'ils ont accès à tout
  const user = authUser.value;
  const isFullAccess = user && user.profile && user.profile[2] && hasFullAccess(user.profile[2]);
  
  let profileToSet = null;
  
  if (route.profile && route.profile !== 'public') {
    if (!currentProfile.value) {
      // Si aucun profil n'est sélectionné, le sélectionner automatiquement
      if (hasProfileAccess(route.profile) || isFullAccess) {
        profileToSet = route.profile;
      }
    } else if (currentProfile.value !== route.profile && !isFullAccess) {
      // Si un profil différent est sélectionné et que l'utilisateur n'a pas accès complet, bloquer
      console.log('Profil différent sélectionné et pas d\'accès complet');
      return;
    } else if (currentProfile.value !== route.profile && isFullAccess) {
      // Si développeur, changer le profil pour correspondre à la route
      profileToSet = route.profile;
    }
  }
  
  // Si on doit changer le profil, le faire avant la navigation
  if (profileToSet) {
    localStorage.setItem('currentProfile', profileToSet);
    console.log('Profil sélectionné automatiquement:', profileToSet);
    // Attendre un tick pour que localStorage soit bien mis à jour
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  console.log('Tentative de navigation vers:', route.path);
  console.log('Profil dans localStorage avant navigation:', localStorage.getItem('currentProfile'));
  
  try {
    // Utiliser replace au lieu de push pour éviter les problèmes de navigation
    const result = await router.push(route.path);
    console.log('Résultat de la navigation:', result);
    
    // Si la navigation a été interceptée (redirection), on peut essayer avec replace
    if (result && result.name === 'home' && route.path !== '/') {
      console.log('Navigation interceptée, tentative avec replace');
      await router.replace(route.path);
    }
    
    console.log('Navigation réussie vers:', route.path);
    console.log('Route actuelle après navigation:', router.currentRoute.value.path);
  } catch (error) {
    console.error('Erreur lors de la navigation:', error);
    // En cas d'erreur, essayer avec replace
    try {
      await router.replace(route.path);
      console.log('Navigation réussie avec replace');
    } catch (replaceError) {
      console.error('Erreur avec replace aussi:', replaceError);
    }
  }
};

const getAuthInfo = async () => {
  const utilisateur = authUser.value;
  if (utilisateur) {
    nomAgent.value = utilisateur.name || '';
    if (utilisateur.profile && utilisateur.profile[2]) {
      availableProfiles.value = getAvailableProfiles(utilisateur.profile[2]);
      console.log('Profils disponibles:', availableProfiles.value);
      console.log('Rôle utilisateur:', utilisateur.profile[2]);
      console.log('A accès complet:', hasFullAccess(utilisateur.profile[2]));
    }
  }
};

onMounted(async () => {
  getAuthInfo();
});
</script>

<style scoped>
.menu-container {
  margin-top: 1.5rem;
}

.profile-section {
  margin-bottom: 1.5rem;
}

.section-header {
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.route-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.75rem;
  border-radius: 8px;
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  gap: 0.4rem;
  min-height: 90px;
}

.route-card:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-width: 2px;
}

.icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-container img:first-child {
  display: block;
}

.lock-icon {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.route-card.locked {
  cursor: not-allowed;
}

.route-card.locked:hover {
  transform: none;
  box-shadow: none;
  border-width: 1.5px;
}

.route-card span {
  font-weight: 500;
  font-size: 0.8rem;
  line-height: 1.2;
}

.route-card.active-profile {
  box-shadow: 0 0 0 2px rgba(0, 99, 203, 0.4);
  border-width: 2px;
}

.dashboard-link {
  margin: 1.5rem 0;
  cursor: pointer;
}

.dashboard-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  transition: transform 0.2s ease-in-out;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (min-width: 768px) {
  .routes-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  .route-card {
    padding: 1.25rem 1rem;
    min-height: 100px;
  }
  
  .route-card span {
    font-size: 0.85rem;
  }
}

@media (min-width: 1024px) {
  .routes-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  .section-header {
    padding: 0.875rem 1.25rem;
  }
  
  .section-header h3 {
    font-size: 1.1rem;
  }
}
</style>

