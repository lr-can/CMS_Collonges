<template>
  <div v-if="isloading">
    Chargement...
  </div>
  <div v-else>
    <div v-if="isAuthenticated">
      <div class="subtitle">
        Bonjour, {{ nomAgent }} !
      </div>
      <div class="profiles-section">
        <div class="subsubtitle">
          Profils disponibles
        </div>
        <div class="profile-chips">
          <div 
            v-for="profile in availableProfiles" 
            :key="profile"
            class="profile-chip"
            :style="{ 
              backgroundColor: PROFILE_COLORS[profile].background,
              color: PROFILE_COLORS[profile].primary,
              borderColor: PROFILE_COLORS[profile].primary
            }"
          >
            {{ getProfileShortLabel(profile) }}
          </div>
        </div>
      </div>
      <div class="subsubtitle" style="margin-top: 2rem;">
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
              :class="{ 'locked': !isRouteAccessible(route) }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.public.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.public.primary : '#999999',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="handleLockedRouteClick(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
              <div v-if="!isRouteAccessible(route)" class="lock-message">
                Bientôt disponible
              </div>
            </div>
          </div>
        </div>

        <!-- Section Pharmacie -->
        <div v-if="hasProfileAccess('pharmacie')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.pharmacie.background, color: PROFILE_COLORS.pharmacie.primary }">
            <h3>Gestion Pharmacie</h3>
          </div>
          <!-- Mini tableau de bord Pharmacie -->
          <div class="mini-dashboard">
            <introText :profile="'pharmacie'" />
            <div @click="clicking" class="mini-next-expiration">
              <nextExpiration :profile="'pharmacie'" />
            </div>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('pharmacie')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route) }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.pharmacie.primary : '#999999',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="handleLockedRouteClick(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
              <div v-if="!isRouteAccessible(route) && !isAuthenticated" class="lock-message">
                Cliquez pour vous connecter
              </div>
            </div>
          </div>
        </div>

        <!-- Section ASUP -->
        <div v-if="hasProfileAccess('asup')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.asup.background, color: PROFILE_COLORS.asup.primary }">
            <h3>Gestion ASUP</h3>
          </div>
          <!-- Mini tableau de bord ASUP -->
          <div class="mini-dashboard">
            <introText :profile="'asup'" />
            <div @click="clicking" class="mini-next-expiration">
              <nextExpiration :profile="'asup'" />
            </div>
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('asup')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route) }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.asup.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.asup.primary : '#999999',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="handleLockedRouteClick(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
              <div v-if="!isRouteAccessible(route) && !isAuthenticated" class="lock-message">
                Cliquez pour vous connecter
              </div>
            </div>
          </div>
        </div>

        <!-- Section Formation -->
        <div v-if="hasProfileAccess('formation')" class="profile-section">
          <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.formation.background, color: PROFILE_COLORS.formation.primary }">
            <h3>Gestion Formation</h3>
          </div>
          <!-- Mini tableau de bord Formation -->
          <div class="mini-dashboard">
            <introText :profile="'formation'" />
          </div>
          <div class="routes-grid">
            <div 
              v-for="route in getAllRoutesForProfile('formation')" 
              :key="route.path"
              class="route-card"
              :class="{ 'locked': !isRouteAccessible(route) }"
              :style="{ 
                backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.formation.background : '#f0f0f0',
                color: isRouteAccessible(route) ? PROFILE_COLORS.formation.primary : '#999999',
                opacity: isRouteAccessible(route) ? 1 : 0.6
              }"
              @click="handleLockedRouteClick(route)"
            >
              <div class="icon-container">
                <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
                <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
              </div>
              <span>{{ route.name }}</span>
              <div v-if="!isRouteAccessible(route) && !isAuthenticated" class="lock-message">
                Cliquez pour vous connecter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Afficher aussi les tuiles si non authentifié -->
    <div v-if="!isAuthenticated" class="menu-container">
      <div class="subsubtitle" style="margin-top: 1rem;">
        Choisissez une option ci-dessous
      </div>
      
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
            :class="{ 'locked': !isRouteAccessible(route) }"
            :style="{ 
              backgroundColor: isRouteAccessible(route) ? PROFILE_COLORS.public.background : '#f0f0f0',
              color: isRouteAccessible(route) ? PROFILE_COLORS.public.primary : '#999999',
              opacity: isRouteAccessible(route) ? 1 : 0.6
            }"
            @click="handleLockedRouteClick(route)"
          >
            <div class="icon-container">
              <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
              <img v-if="!isRouteAccessible(route)" :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
            </div>
            <span>{{ route.name }}</span>
            <div v-if="!isRouteAccessible(route)" class="lock-message">
              Bientôt disponible
            </div>
          </div>
        </div>
      </div>

      <!-- Section Pharmacie -->
      <div class="profile-section">
        <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.pharmacie.background, color: PROFILE_COLORS.pharmacie.primary }">
          <h3>Gestion Pharmacie</h3>
        </div>
        <div class="routes-grid">
          <div 
            v-for="route in getAllRoutesForProfile('pharmacie')" 
            :key="route.path"
            class="route-card locked"
            :style="{ 
              backgroundColor: '#f0f0f0',
              color: '#999999',
              opacity: 0.6
            }"
            @click="router.push('/login')"
          >
            <div class="icon-container">
              <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
              <img :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
            </div>
            <span>{{ route.name }}</span>
            <div class="lock-message">
              Cliquez pour vous connecter
            </div>
          </div>
        </div>
      </div>

      <!-- Section ASUP -->
      <div class="profile-section">
        <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.asup.background, color: PROFILE_COLORS.asup.primary }">
          <h3>Gestion ASUP</h3>
        </div>
        <div class="routes-grid">
          <div 
            v-for="route in getAllRoutesForProfile('asup')" 
            :key="route.path"
            class="route-card locked"
            :style="{ 
              backgroundColor: '#f0f0f0',
              color: '#999999',
              opacity: 0.6
            }"
            @click="router.push('/login')"
          >
            <div class="icon-container">
              <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
              <img :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
            </div>
            <span>{{ route.name }}</span>
            <div class="lock-message">
              Cliquez pour vous connecter
            </div>
          </div>
        </div>
      </div>

      <!-- Section Formation -->
      <div class="profile-section">
        <div class="section-header" :style="{ backgroundColor: PROFILE_COLORS.formation.background, color: PROFILE_COLORS.formation.primary }">
          <h3>Gestion Formation</h3>
        </div>
        <div class="routes-grid">
          <div 
            v-for="route in getAllRoutesForProfile('formation')" 
            :key="route.path"
            class="route-card locked"
            :style="{ 
              backgroundColor: '#f0f0f0',
              color: '#999999',
              opacity: 0.6
            }"
            @click="router.push('/login')"
          >
            <div class="icon-container">
              <img :src="getIconPath(route.icon)" :alt="route.name" width="32" height="auto" />
              <img :src="getIconPath('lock.svg')" alt="Verrouillé" class="lock-icon" width="16" height="auto" />
            </div>
            <span>{{ route.name }}</span>
            <div class="lock-message">
              Cliquez pour vous connecter
            </div>
          </div>
        </div>
      </div>
    </div>
    <pwaInstallPrompt />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from '@/composables/useAuth.js';
import { useRouter } from 'vue-router';
import pwaInstallPrompt from '../components/pwaInstallPrompt.vue';
import { useRoutes, PROFILE_COLORS, ROUTES_CONFIG } from '@/composables/useRoutes.js';
import introText from '../components/introText.vue';
import nextExpiration from '../components/nextExpiration.vue';

const { user: authUser } = useAuth();
const router = useRouter();
const { isAuthenticated, routesByProfile, getAvailableProfiles, isRouteAccessible: checkRouteAccess, hasFullAccess } = useRoutes();

const isloading = ref(false);
const nomAgent = ref('');
const availableProfiles = ref([]);

const getProfileShortLabel = (profile) => {
  const labels = {
    'pharmacie': 'Pharmacie',
    'asup': 'ASUP',
    'formation': 'Formation'
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
  // Routes temporairement bloquées (en développement)
  if (route.path === '/demandeFormation') {
    return false;
  }
  
  // Pour les routes publiques, toujours accessibles (sauf celles bloquées ci-dessus)
  if (route.profile === 'public') {
    return true;
  }
  
  // Si la route nécessite une authentification et que l'utilisateur n'est pas authentifié
  if (route.requiresAuth && !isAuthenticated.value) {
    return false;
  }
  
  // Vérifier si l'utilisateur a tous les accès (Développeur ou Chef de Caserne)
  const user = authUser.value;
  if (user && user.profile && user.profile[2]) {
    const userProfile = user.profile[2];
    if (hasFullAccess(userProfile)) {
      // Les développeurs ont accès à tout
      return true;
    }
  }
  
  // Si l'utilisateur n'a pas accès au profil, la route n'est pas accessible
  if (!hasProfileAccess(route.profile)) {
    return false;
  }
  
  // Si l'utilisateur est authentifié et a accès au profil, la route est accessible
  if (route.requiresAuth && isAuthenticated.value && hasProfileAccess(route.profile)) {
    return true;
  }
  
  // Utiliser la fonction du composable
  return checkRouteAccess(route);
};

const getIconPath = (iconName) => {
  return new URL(`../assets/icons/${iconName}`, import.meta.url).href;
};

const handleLockedRouteClick = (route) => {
  if (!isRouteAccessible(route)) {
    // Si la route est bloquée (en développement), ne rien faire ou afficher un message
    if (route.path === '/demandeFormation') {
      // Les routes en développement sont bloquées
      return;
    }
    // Si la route n'est pas accessible et que l'utilisateur n'est pas authentifié, rediriger vers login
    if (!isAuthenticated.value) {
      router.push('/login');
      return;
    }
  }
  // Sinon, naviguer normalement
  navigateToRoute(route);
};

const navigateToRoute = async (route) => {
  console.log('Navigation vers:', route.path);
  console.log('Route accessible?', isRouteAccessible(route));
  console.log('Profil requis:', route.profile);
  
  if (!isRouteAccessible(route)) {
    console.log('Route non accessible, navigation bloquée');
    return;
  }
  
  try {
    await router.push(route.path);
    console.log('Navigation réussie vers:', route.path);
  } catch (error) {
    console.error('Erreur lors de la navigation:', error);
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
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  gap: 0.4rem;
  min-height: 90px;
}

.route-card:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  filter: brightness(0.95);
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

.lock-message {
  font-size: 0.7rem;
  color: #999999;
  margin-top: 0.3rem;
  text-align: center;
  font-style: italic;
}

.header-section {
  margin-bottom: 1.5rem;
}

.login-header {
  margin-bottom: 1rem;
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

.profiles-section {
  margin-bottom: 1.5rem;
}

.profile-chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.profile-chip {
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  border: 1.5px solid;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: default;
  transition: all 0.2s ease-in-out;
  user-select: none;
  white-space: nowrap;
}

.dashboard-link-inline {
  margin: 1rem 0;
  cursor: pointer;
}

.dashboard-card-inline {
  padding: 1rem 1.5rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid;
  transition: all 0.2s ease-in-out;
}

.dashboard-card-inline:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mini-dashboard {
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  font-size: 0.85rem;
  transform: scale(0.85);
  transform-origin: top left;
  width: 117.65%; /* Compense le scale pour garder la largeur */
}

.mini-dashboard :deep(.subsubtitle) {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.mini-dashboard :deep(.display) {
  margin-top: 10px;
  margin-left: 10px;
  transform: scale(0.9);
  transform-origin: top left;
}

.mini-dashboard :deep(.number) {
  font-size: 1.5rem;
}

.mini-dashboard :deep(.Expiration) {
  font-size: 0.9rem;
}

.mini-dashboard :deep(.prochain-peremption) {
  margin-left: 0;
  margin-bottom: 0.5rem;
}

.mini-dashboard :deep(.expirant) {
  padding: 0.5rem;
  font-size: 0.85rem;
}

.mini-dashboard :deep(.peremption) {
  font-size: 1rem;
  padding-top: 10%;
}

.mini-dashboard :deep(.materiel) {
  font-size: 0.9rem;
}

.mini-next-expiration {
  margin-top: 0.5rem;
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

  .menu-container {
    margin-top: 2rem;
  }

  .profile-section {
    margin-bottom: 2rem;
  }

  .routes-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .route-card {
    min-height: 120px;
    padding: 1.5rem 1.25rem;
  }

  .route-card span {
    font-size: 0.95rem;
  }

  .profiles-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .profile-chips {
    flex-wrap: wrap;
  }

  .mini-dashboard {
    transform: none;
    width: 100%;
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
  }

  .mini-dashboard :deep(.subsubtitle) {
    font-size: 1rem;
  }

  .mini-dashboard :deep(.display) {
    transform: none;
    margin-left: 0;
  }

  .mini-dashboard :deep(.number) {
    font-size: 1.8rem;
  }

  .mini-dashboard :deep(.peremption) {
    font-size: 1.1rem;
    padding-top: 0;
  }
}
</style>


