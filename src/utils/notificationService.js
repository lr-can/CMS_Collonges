/**
 * Service de gestion des notifications
 * À paramétrer selon vos besoins
 */

/**
 * Initialise le service de notifications
 */
export async function initNotificationService() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('Les notifications ne sont pas supportées sur ce navigateur');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Ajouter les gestionnaires d'événements pour les notifications
    if (registration) {
      // Les gestionnaires sont déjà définis dans le service worker
      console.log('[Notification Service] Service worker prêt pour les notifications');
      return true;
    }
  } catch (error) {
    console.error('[Notification Service] Erreur lors de l\'initialisation:', error);
    return false;
  }
}

/**
 * Envoie une notification via le service worker
 */
export async function sendNotification(title, options = {}) {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      badge: '/img/icons/android-chrome-192x192.png',
      icon: '/img/icons/android-chrome-192x192.png',
      tag: 'cms-notification',
      requireInteraction: false,
      ...options,
    });
    
    return true;
  } catch (error) {
    console.error('[Notification Service] Erreur lors de l\'envoi de notification:', error);
    return false;
  }
}

/**
 * Demande la permission pour les notifications
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('[Notification Service] Erreur lors de la demande de permission:', error);
    return 'denied';
  }
}

/**
 * Vérifie la permission actuelle
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}
