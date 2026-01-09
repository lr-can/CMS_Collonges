import { ref } from 'vue';

const permission = ref(null);
const subscription = ref(null);

/**
 * Composable pour gérer les notifications push
 * À paramétrer plus tard selon vos besoins
 */
export function useNotifications() {
  /**
   * Vérifie si les notifications sont supportées
   */
  const isSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
  };

  /**
   * Vérifie la permission actuelle
   */
  const checkPermission = async () => {
    if (!isSupported()) {
      return 'unsupported';
    }
    
    if (Notification.permission === 'granted') {
      permission.value = 'granted';
      return 'granted';
    } else if (Notification.permission === 'denied') {
      permission.value = 'denied';
      return 'denied';
    } else {
      permission.value = 'default';
      return 'default';
    }
  };

  /**
   * Demande la permission pour les notifications
   */
  const requestPermission = async () => {
    if (!isSupported()) {
      throw new Error('Les notifications ne sont pas supportées sur ce navigateur');
    }

    try {
      const result = await Notification.requestPermission();
      permission.value = result;
      return result;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      throw error;
    }
  };

  /**
   * Envoie une notification locale (pour tests)
   * À remplacer par votre logique de notifications push
   */
  const sendNotification = async (title, options = {}) => {
    if (!isSupported()) {
      console.warn('Les notifications ne sont pas supportées');
      return;
    }

    const currentPermission = await checkPermission();
    if (currentPermission !== 'granted') {
      console.warn('Permission de notification non accordée');
      return;
    }

    // Vérifier si le service worker est enregistré
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        badge: '/img/icons/android-chrome-192x192.png',
        icon: '/img/icons/android-chrome-192x192.png',
        ...options,
      });
    } else {
      // Fallback pour les navigateurs sans service worker
      new Notification(title, options);
    }
  };

  /**
   * S'abonne aux notifications push
   * À implémenter avec votre serveur de push
   */
  const subscribeToPush = async () => {
    if (!isSupported()) {
      throw new Error('Les notifications push ne sont pas supportées');
    }

    const currentPermission = await checkPermission();
    if (currentPermission !== 'granted') {
      throw new Error('Permission de notification non accordée');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // TODO: Remplacer par votre clé publique VAPID
      const vapidPublicKey = 'VOTRE_CLE_PUBLIQUE_VAPID_ICI';
      
      subscription.value = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // TODO: Envoyer la subscription à votre serveur
      console.log('Subscription:', subscription.value);
      
      return subscription.value;
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      throw error;
    }
  };

  /**
   * Se désabonne des notifications push
   */
  const unsubscribeFromPush = async () => {
    if (subscription.value) {
      await subscription.value.unsubscribe();
      subscription.value = null;
    }
  };

  /**
   * Convertit une clé VAPID base64 en Uint8Array
   */
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    permission,
    subscription,
    isSupported,
    checkPermission,
    requestPermission,
    sendNotification,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
