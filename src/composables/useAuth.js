import { ref, computed } from 'vue';

// État global de l'authentification
const user = ref(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);

// Clés de stockage
const STORAGE_KEYS = {
  USER: 'cms_auth_user',
  AUTHENTICATED: 'cms_auth_authenticated',
  EMAIL: 'cms_auth_email',
  MATRICULE: 'cms_auth_matricule'
};

/**
 * Récupère les informations d'authentification depuis l'API
 * @param {string} email - Adresse email de l'utilisateur
 * @param {string} matricule - Matricule de l'utilisateur
 * @returns {Promise<Object>} - Objet utilisateur ou null
 */
export async function fetchAuthInfo(email, matricule) {
  isLoading.value = true;
  try {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    
    const response = await fetch(`https://api.cms-collonges.fr/getAuthInfo/${encodeURIComponent(email)}/${encodeURIComponent(matricule)}`, requestOptions);
    const result = await response.json();
    
    if (result.success && result.user) {
      // Construire l'objet user au format attendu par l'application
      const userData = {
        profile: [
          result.user.matricule || result.user.profile?.[0] || '',
          result.user.grade || result.user.profile?.[1] || '',
          result.user.role || result.user.profile?.[2] || ''
        ],
        name: result.user.name || '',
        email: result.user.email || email
      };
      
      // Stocker dans localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true');
      localStorage.setItem(STORAGE_KEYS.EMAIL, email);
      localStorage.setItem(STORAGE_KEYS.MATRICULE, matricule);
      
      user.value = userData;
      isAuthenticated.value = true;
      
      return userData;
    } else {
      // Échec de l'authentification
      clearAuth();
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations d\'authentification:', error);
    clearAuth();
    return null;
  } finally {
    isLoading.value = false;
  }
}

/**
 * Charge les informations d'authentification depuis le localStorage
 */
export function loadAuthFromStorage() {
  try {
    const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTHENTICATED);
    if (storedAuth === 'true') {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
        return user.value;
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'authentification depuis le stockage:', error);
    clearAuth();
  }
  return null;
}

/**
 * Efface les informations d'authentification
 */
export function clearAuth() {
  user.value = null;
  isAuthenticated.value = false;
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED);
  localStorage.removeItem(STORAGE_KEYS.EMAIL);
  localStorage.removeItem(STORAGE_KEYS.MATRICULE);
  localStorage.removeItem('currentProfile');
  localStorage.removeItem('auth0_authenticated');
}

/**
 * Composable pour utiliser l'authentification (remplace useAuth0)
 */
export function useAuth() {
  // Charger depuis le stockage au démarrage si disponible
  if (!user.value && !isAuthenticated.value) {
    loadAuthFromStorage();
  }
  
  return {
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    fetchAuthInfo,
    clearAuth,
    loadAuthFromStorage
  };
}

