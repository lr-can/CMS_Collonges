import { computed } from 'vue';
import { useAuth } from './useAuth.js';

// Couleurs par profil
export const PROFILE_COLORS = {
  pharmacie: {
    primary: '#0063cb',
    background: '#f4f6ff',
    hover: '#d6deff'
  },
  asup: {
    primary: '#1f8d49',
    background: '#dffee6',
    hover: '#8afcab'
  },
  formation: {
    primary: '#d64d00',
    background: '#fff4f3',
    hover: '#ffd7d3'
  },
  public: {
    primary: '#666666',
    background: '#f6f6f6',
    hover: '#ededed'
  }
};

// Définition de toutes les routes avec leurs permissions
export const ROUTES_CONFIG = [
  // Routes Pharmacie
  {
    path: '/order',
    name: 'Commande',
    icon: 'order.svg',
    profile: 'pharmacie',
    requiresAuth: true
  },
  {
    path: '/disposition',
    name: 'Disposition',
    icon: 'disposition.svg',
    profile: 'pharmacie',
    requiresAuth: true
  },
  {
    path: '/search',
    name: 'Recherche',
    icon: 'search.svg',
    profile: 'pharmacie',
    requiresAuth: true
  },
  {
    path: '/reception',
    name: 'Réception',
    icon: 'reception.svg',
    profile: 'pharmacie',
    requiresAuth: true
  },
  {
    path: '/peremptions',
    name: 'Péremptions',
    icon: 'peremptions.svg',
    profile: 'pharmacie',
    requiresAuth: true
  },
  // Routes ASUP
  {
    path: '/replaceAsup',
    name: 'Remplacement ASUP',
    icon: 'replace.svg',
    profile: 'asup',
    requiresAuth: true
  },
  {
    path: '/expiryAsup',
    name: 'Expiration ASUP',
    icon: 'expiry.svg',
    profile: 'asup',
    requiresAuth: true
  },
  {
    path: '/reportAsup',
    name: 'Rapport ASUP',
    icon: 'report.svg',
    profile: 'asup',
    requiresAuth: true
  },
  // Routes Formation
  {
    path: '/formationSearch',
    name: 'Recherche Formation',
    icon: 'search.svg',
    profile: 'formation',
    requiresAuth: true
  },
  {
    path: '/formationSearchAgent',
    name: 'Recherche Agent',
    icon: 'searchAgent.svg',
    profile: 'formation',
    requiresAuth: true
  },
  {
    path: '/demandeFormation',
    name: 'Demande de formation',
    icon: 'searchAgent.svg',
    profile: 'formation',
    requiresAuth: false
  },
  // Routes Publiques
  {
    path: '/asupGrandPublic',
    name: 'ASUP Grand Public',
    icon: 'asup.svg',
    profile: 'public',
    requiresAuth: false
  },
  {
    path: '/RIGrandPublic',
    name: 'Retour d\'Intervention',
    icon: 'report.svg',
    profile: 'public',
    requiresAuth: false
  },
  {
    path: '/telex',
    name: 'Telex',
    icon: 'telex.svg',
    profile: 'public',
    requiresAuth: false
    // Route publique accessible à tous, y compris les utilisateurs avec le profil pharmacie
  },
  {
    path: '/inventaires',
    name: 'Inventaires',
    icon: 'search.svg',
    profile: 'public',
    requiresAuth: false
  },
  {
    path: '/demandeFormation',
    name: 'Demande de formation',
    icon: 'searchAgent.svg',
    profile: 'public',
    requiresAuth: false
  },
];

export function useRoutes() {
  const { isAuthenticated: authIsAuthenticated, user: authUser } = useAuth();
  
  const isAuthenticated = computed(() => authIsAuthenticated.value);
  
  const currentProfile = computed(() => {
    return localStorage.getItem('currentProfile') || '';
  });
  
  // Vérifier si l'utilisateur a tous les accès (Développeur ou Chef de Caserne)
  const hasFullAccess = (userProfile) => {
    if (!userProfile) return false;
    return userProfile === 'Developpeur' || userProfile === 'Chef de Caserne';
  };
  
  // Obtenir les profils disponibles pour l'utilisateur
  const getAvailableProfiles = (userProfile) => {
    if (!userProfile) return [];
    
    const profiles = [];
    if (userProfile === 'Developpeur' || userProfile === 'Chef de Caserne') {
      profiles.push('pharmacie', 'asup', 'formation');
    } else if (userProfile === 'Responsable Pharmacie') {
      profiles.push('pharmacie');
    } else if (userProfile === 'Correspondant ASUP') {
      profiles.push('asup');
    } else if (userProfile === 'Responsable Formation') {
      profiles.push('formation');
    } else {
      // Format: "pharmacie_asup" etc.
      const profileParts = userProfile.split('_');
      profileParts.forEach(part => {
        if (['pharmacie', 'asup', 'formation'].includes(part)) {
          profiles.push(part);
        }
      });
    }
    return profiles;
  };
  
  // Vérifier si une route est accessible
  const isRouteAccessible = (route) => {
    if (route.requiresAuth && !isAuthenticated.value) {
      return false;
    }
    
    if (route.customCheck) {
      return route.customCheck(isAuthenticated.value, currentProfile.value);
    }
    
    if (route.profile === 'public') {
      return true;
    }
    
    if (!isAuthenticated.value) {
      return false;
    }
    
    // Vérifier si l'utilisateur a tous les accès (Développeur ou Chef de Caserne)
    const user = authUser.value;
    if (user && user.profile && user.profile[2]) {
      const userProfile = user.profile[2];
      // Si l'utilisateur est développeur ou chef de caserne, il a accès à tout
      if (hasFullAccess(userProfile)) {
        return true;
      }
    }
    
    // Si l'utilisateur a un profil sélectionné, vérifier qu'il correspond
    if (currentProfile.value && route.profile !== currentProfile.value) {
      return false;
    }
    
    // Si pas de profil sélectionné, vérifier que l'utilisateur a accès à ce profil
    if (!currentProfile.value && isAuthenticated.value) {
      if (user && user.profile && user.profile[2]) {
        const availableProfiles = getAvailableProfiles(user.profile[2]);
        return availableProfiles.includes(route.profile);
      }
    }
    
    return true;
  };
  
  // Grouper les routes par profil
  const routesByProfile = computed(() => {
    const grouped = {
      pharmacie: [],
      asup: [],
      formation: [],
      public: []
    };
    
    ROUTES_CONFIG.forEach(route => {
      if (isRouteAccessible(route) || !route.requiresAuth) {
        grouped[route.profile].push(route);
      }
    });
    
    return grouped;
  });
  
  return {
    isAuthenticated,
    currentProfile,
    routesByProfile,
    isRouteAccessible,
    getAvailableProfiles,
    hasFullAccess,
    PROFILE_COLORS
  };
}

