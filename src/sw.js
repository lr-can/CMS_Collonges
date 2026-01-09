// Service Worker pour CMS Collonges - Manoeuvre
// Ce fichier sera utilise avec la strategie injectManifest de vite-plugin-pwa

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Pattern de vibration : 1300ms vibration, 1000ms silence
const VIBRATION_PATTERN = [1300, 1000];

// =============================================================================
// WORKBOX - GESTION DU CACHE
// =============================================================================

// Precache des fichiers statiques
precacheAndRoute(self.__WB_MANIFEST);

// Nettoyer les anciens caches
cleanupOutdatedCaches();

// Prendre le controle immediatement
self.skipWaiting();
clientsClaim();

// Cache pour les routes de navigation
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: 'navigation-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 heures
      }),
    ],
  }),
  {
    allowlist: [/^\//],
  }
);
registerRoute(navigationRoute);

// Cache pour Firebase
registerRoute(
  ({ url }) => url.hostname.includes('firebaseio.com') || url.hostname.includes('firebase'),
  new NetworkFirst({
    cacheName: 'firebase-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60, // 1 heure
      }),
    ],
  })
);

// Cache pour l'API CMS Collonges
registerRoute(
  ({ url }) => url.hostname === 'api.cms-collonges.fr',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Cache pour la sonnerie (IMPORTANT - Cache First pour offline)
registerRoute(
  ({ url }) => url.pathname.endsWith('/sonnerie.mp3') || url.pathname.endsWith('.mp3'),
  new CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
      }),
    ],
  })
);

// Cache pour les images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
      }),
    ],
  })
);

// =============================================================================
// GESTION DES NOTIFICATIONS PUSH AVEC BOUCLE (TELEPHONE VERROUILLE)
// =============================================================================

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification recue');
  
  // Donnees par defaut
  let notificationData = {
    title: 'ALERTE MANOEUVRE',
    body: 'Nouvelle alerte',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'manoeuvre-alert',
    requireInteraction: true,
    vibrate: VIBRATION_PATTERN,
    silent: false,
    renotify: true,
    timestamp: Date.now(),
    data: {
      url: '/',
    },
  };

  // Parser les donnees personnalisees du push
  if (event.data) {
    try {
      const pushData = event.data.json();
      
      // Construction du titre personnalise : VSAV-CA-SAP
      const vehicule = (pushData.engLib || '').toUpperCase().replace('-', '');
      const role = (pushData.role || '').toUpperCase();
      const gfo = (pushData.gfo || '').toUpperCase();
      const title = vehicule + '-' + role + '-' + gfo;
      
      // Construction du body avec toutes les infos
      const numManoeuvre = pushData.numManoeuvre || '?';
      const od = pushData.od || '?';
      const dateHeure = pushData.dateHeure || '';
      const libelleManoeuvre = pushData.libelleManoeuvre || 'Manoeuvre';
      const adresse = pushData.adresseManoeuvre || 'Adresse non disponible';
      const nombreEngins = pushData.nombreEngins || 0;
      
      const body = 'N ' + numManoeuvre + '/' + od + ' - ' + dateHeure + '\n' + libelleManoeuvre + '\n' + adresse + '\n' + nombreEngins + ' Engins';
      
      notificationData = {
        title: title,
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'manoeuvre-' + pushData.matricule + '-' + Date.now(),
        requireInteraction: true,
        vibrate: VIBRATION_PATTERN,
        silent: false,
        renotify: true,
        timestamp: Date.now(),
        data: {
          url: '/',
          matricule: pushData.matricule,
          od: pushData.od,
          numManoeuvre: pushData.numManoeuvre,
          engLib: pushData.engLib,
          role: pushData.role,
          gfo: pushData.gfo,
        },
        actions: [
          {
            action: 'open',
            title: 'Ouvrir',
            icon: '/favicon.ico'
          },
          {
            action: 'acknowledge',
            title: 'Depart',
            icon: '/favicon.ico'
          },
        ],
      };
      
      console.log('[Service Worker] Notification preparee pour:', pushData.matricule);
    } catch (e) {
      console.error('[Service Worker] Erreur parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    Promise.all([
      // Afficher la notification
      self.registration.showNotification(notificationData.title, notificationData),
      
      // Envoyer message aux clients ouverts pour demarrer sonnerie/vibration EN BOUCLE
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => {
          console.log('[Service Worker]', clients.length, 'client(s) ouvert(s)');
          clients.forEach(client => {
            client.postMessage({
              type: 'START_ALERT_LOOP',
              pattern: VIBRATION_PATTERN,
              data: notificationData.data,
            });
          });
        })
    ])
    .then(() => {
      console.log('[Service Worker] Notification affichee + alerte en boucle demarree');
    })
    .catch(error => {
      console.error('[Service Worker] Erreur affichage notification:', error);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic sur notification');
  console.log('[Service Worker] Action:', event.action);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/';

  // ARRETER LA BOUCLE DE SONNERIE/VIBRATION
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Envoyer message pour arreter la boucle
        clients.forEach(client => {
          client.postMessage({
            type: 'STOP_ALERT_LOOP',
          });
        });

        // Action : Acquitter / Depart
        if (action === 'acknowledge') {
          console.log('[Service Worker] Action ACKNOWLEDGE demandee');
          
          clients.forEach(client => {
            client.postMessage({
              type: 'ACKNOWLEDGE_ALERT',
              data: notificationData,
            });
          });
          
          if (clients.length > 0) {
            return clients[0].focus();
          } else {
            if (self.clients.openWindow) {
              return self.clients.openWindow(urlToOpen);
            }
          }
        } else {
          // Action par defaut : Ouvrir
          if (clients.length > 0) {
            for (const client of clients) {
              const clientUrl = new URL(client.url);
              const targetUrl = new URL(urlToOpen, self.location.origin);
              
              if (clientUrl.origin === targetUrl.origin && 'focus' in client) {
                return client.focus().then(focusedClient => {
                  focusedClient.postMessage({
                    type: 'NOTIFICATION_CLICKED',
                    data: notificationData,
                  });
                  return focusedClient;
                });
              }
            }
          }
          
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification fermee (swipe)');
  
  // ARRETER LA BOUCLE
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'STOP_ALERT_LOOP',
          });
          client.postMessage({
            type: 'NOTIFICATION_CLOSED',
            tag: event.notification.tag,
            timestamp: Date.now(),
          });
        });
      })
  );
});

// =============================================================================
// COMMUNICATION AVEC LES CLIENTS
// =============================================================================

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message recu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  }
  
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({
      type: 'SW_RESPONSE',
      data: { received: true },
    });
  }
});

// =============================================================================
// GESTION DES ERREURS
// =============================================================================

self.addEventListener('error', (event) => {
  console.error('[Service Worker] Erreur:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Promise rejetee:', event.reason);
});

console.log('[Service Worker] Service Worker charge avec Workbox');
console.log('[Service Worker] Pattern de vibration:', VIBRATION_PATTERN);