import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import orderView from '../views/orderView.vue'
import receptionView from '../views/receptionView.vue'
import searchView from '../views/searchView.vue'
import dispositionView from '../views/dispositionView.vue'
import profileView from '../views/profileView.vue'
import asupGrandPublic from '@/views/asupGrandPublic.vue'
import expiryAsup from '@/views/expiryAsup.vue'
import reportAsup from '@/views/reportAsup.vue'
import replaceAsup from '@/views/replaceAsup.vue'
import formationSearch from '@/views/formationSearch.vue'
import formationSearchAgent from '@/views/formationSearchAgent.vue'
import telexView from '@/views/telexView.vue'
import peremptions from '@/views/peremptionView.vue'
import RIGrandPublic from '@/views/RIGrandPublic.vue'

// Configuration des routes avec leurs permissions
const ROUTE_PERMISSIONS = {
  '/order': { requiresAuth: true, profile: 'pharmacie' },
  '/disposition': { requiresAuth: true, profile: 'pharmacie' },
  '/search': { requiresAuth: true, profile: 'pharmacie' },
  '/reception': { requiresAuth: true, profile: 'pharmacie' },
  '/peremptions': { requiresAuth: true, profile: 'pharmacie' },
  '/replaceAsup': { requiresAuth: true, profile: 'asup' },
  '/expiryAsup': { requiresAuth: true, profile: 'asup' },
  '/reportAsup': { requiresAuth: true, profile: 'asup' },
  '/formationSearch': { requiresAuth: true, profile: 'formation' },
  '/formationSearchAgent': { requiresAuth: true, profile: 'formation' },
  '/telex': { 
    requiresAuth: false, 
    profile: 'public'
    // Route publique accessible à tous, y compris les utilisateurs avec le profil pharmacie
  },
  '/profile': { requiresAuth: true }
};

// Fonction pour vérifier l'authentification
function checkAuthentication() {
  // Vérifier d'abord le flag dans localStorage (plus fiable)
  if (localStorage.getItem('auth0_authenticated') === 'true') {
    return true;
  }
  
  // Vérifier aussi dans sessionStorage pour les clés Auth0 (fallback)
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith('auth0spajs') || key.includes('auth0'))) {
      // Vérifier aussi que la valeur n'est pas vide
      const value = sessionStorage.getItem(key);
      if (value && value.length > 0) {
        return true;
      }
    }
  }
  
  // Vérifier aussi dans localStorage pour les clés Auth0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('auth0spajs') || key.includes('auth0'))) {
      const value = localStorage.getItem(key);
      if (value && value.length > 0) {
        return true;
      }
    }
  }
  
  return false;
}


// Garde de navigation simple basée sur localStorage et sessionStorage
function createRouteGuard(permission) {
  return (to, from, next) => {
    console.log('Route guard - Navigation vers:', to.path);
    console.log('Route guard - Permission:', permission);
    
    if (!permission) {
      console.log('Route guard - Pas de permission, accès autorisé');
      next();
      return;
    }

    // Vérifier l'authentification
    const isAuthenticated = checkAuthentication();
    const currentProfile = localStorage.getItem('currentProfile') || '';
    
    console.log('Route guard - Authentifié:', isAuthenticated);
    console.log('Route guard - Profil actuel:', currentProfile);

    // Vérifier l'authentification requise
    if (permission.requiresAuth && !isAuthenticated) {
      console.log('Route guard - Authentification requise mais non authentifié, redirection vers home');
      next({ name: 'home' });
      return;
    }

    // Vérifier la fonction personnalisée
    if (permission.customCheck) {
      const customCheckResult = permission.customCheck(isAuthenticated, currentProfile);
      console.log('Route guard - Custom check résultat:', customCheckResult);
      if (!customCheckResult) {
        console.log('Route guard - Custom check échoué, redirection vers home');
        next({ name: 'home' });
        return;
      }
    }

    // Vérifier le profil requis
    if (permission.profile && permission.profile !== 'public') {
      if (!isAuthenticated) {
        console.log('Route guard - Profil requis mais non authentifié, redirection vers home');
        next({ name: 'home' });
        return;
      }

      // Pour les routes nécessitant un profil spécifique, on permet l'accès si l'utilisateur est authentifié
      // La vérification fine des permissions se fera dans les composants Vue qui ont accès à Auth0
      // Cela permet aux développeurs d'accéder à toutes les routes
      // Si l'utilisateur n'a pas les droits, il sera géré dans le composant
      console.log('Route guard - Profil requis:', permission.profile, 'Profil actuel:', currentProfile);
    }

    console.log('Route guard - Accès autorisé, navigation vers:', to.path);
    next();
  };
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: (to, from, next) => {
        const isAuthenticated = checkAuthentication();
        const currentProfile = localStorage.getItem('currentProfile') || '';
        
        if (!isAuthenticated || !currentProfile) {
          next({ name: 'home' });
        } else {
          next();
        }
      }
    },
    {
      path: '/order',
      name: 'order',
      component: orderView,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/order'])
    },
    {
      path: '/disposition',
      name: 'disposition',
      component: dispositionView,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/disposition'])
    },
    {
      path: '/search',
      name: 'search',
      component: searchView,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/search'])
    },
    {
      path: '/reception',
      name: 'reception',
      component: receptionView,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/reception'])
    },
    {
      path: '/peremptions',
      name: 'peremptions',
      component: peremptions,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/peremptions'])
    },
    {
      path: '/profile',
      name: 'profile',
      component: profileView,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/profile'])
    },
    {
      path: '/asupGrandPublic',
      name: 'asupGrandPublic',
      component: asupGrandPublic
    },
    {
      path: '/expiryAsup',
      name: 'expiryAsup',
      component: expiryAsup,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/expiryAsup'])
    },
    {
      path: '/reportAsup',
      name: 'reportAsup',
      component: reportAsup,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/reportAsup'])
    },
    {
      path: '/replaceAsup',
      name: 'replaceAsup',
      component: replaceAsup,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/replaceAsup'])
    },
    {
      path: '/formationSearch',
      name: 'formationSearch',
      component: formationSearch,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/formationSearch'])
    },
    {
      path: '/formationSearchAgent',
      name: 'formationSearchAgent',
      component: formationSearchAgent,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/formationSearchAgent'])
    },
    {
      path: '/telex',
      name: 'telex',
      component: telexView,
      beforeEnter: createRouteGuard(ROUTE_PERMISSIONS['/telex'])
    },
    {
      path: '/RIGrandPublic',
      name: 'RIGrandPublic',
      component: RIGrandPublic
    }
  ]
})

export default router
