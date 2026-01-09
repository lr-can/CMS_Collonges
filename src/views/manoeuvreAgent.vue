<template>
    <div class="agent-container">
        <!-- Écran de connexion -->
        <div v-if="screen === 'login'" class="login-screen">
            <div class="return-header">
                <button class="return-btn" @click="$emit('close')">← Retour</button>
            </div>
            <div class="login-form">
                <div class="subtitle">BIP Manœuvre</div>
                <div class="login-instructions">
                    <div class="instruction-item">
                        <span class="instruction-label">Agents de Collonges:</span>
                        <span class="instruction-example">V + matricule (ex: V30001)</span>
                    </div>
                    <div class="instruction-item">
                        <span class="instruction-label">Autres agents:</span>
                        <span class="instruction-example">3 premières lettres nom + prénom (ex: DUPJEA pour DUPONT Jean)</span>
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label" for="matricule">Identifiant</label>
                    <input 
                        type="text" 
                        id="matricule"
                        v-model="matricule" 
                        @keyup.enter="connect"
                        autocomplete="off"
                        placeholder="Ex: V30001 ou DUPJEA"
                        class="p-inputtext p-component"
                    />
                </div>
                <button class="validationBtn" @click="connect">Connexion</button>
                <div v-if="loginError" class="error-message">{{ loginError }}</div>
            </div>
        </div>

        <!-- Écran d'instructions -->
        <div v-if="screen === 'instructions'" class="instruction-screen">
            <div class="instruction-content">
                <div class="instruction-warning">⚠️ IMPORTANT ⚠️</div>
                <ul class="instruction-list">
                    <li>🔊 Mettez le son à FOND</li>
                    <li>📱 Ne verrouillez PAS votre téléphone</li>
                    <li>🔔 Autorisez les notifications</li>
                    <li>📳 Autorisez les vibrations</li>
                </ul>
                <button class="btn-continue" @click="startBip">CONTINUER</button>
            </div>
        </div>

        <!-- Écran du bip -->
        <div v-if="screen === 'bip'" class="bip-container">
            <div class="bip-device">
                <div :class="['bip-screen', { active: isAlertActive }]">
                    <div class="screen-header">
                        <div class="battery-info">
                            <span class="battery-level">{{ batteryLevel }}%</span>
                            <div class="battery-icon">
                                <div class="battery-fill" :style="{ width: batteryLevel + '%' }"></div>
                            </div>
                            <div v-if="isConnected" class="signal-icon">
                                <div class="signal-bar"></div>
                                <div class="signal-bar"></div>
                                <div class="signal-bar"></div>
                                <div class="signal-bar"></div>
                            </div>
                        </div>
                        <div class="time-display">{{ currentTime }}</div>
                    </div>
                    <div class="screen-content">
                        <div v-if="!isAlertActive" class="screen-waiting">
                            CMS COLLONGES<br/>{{ agentData ? agentData.matricule : '' }}
                        </div>
                        <div v-else class="screen-alert">
                            {{ alertMessage || 'ALERTE' }}
                        </div>
                    </div>
                </div>
                <div class="bip-buttons">
                    <div :class="['bip-button', 'btn-yellow']" @click="acknowledge"></div>
                    <div class="bip-button" @click="refreshData"></div>
                    <div class="bip-button" @click="disconnect">OFF</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase/config';
import { ref as dbRef, onValue, get, update } from 'firebase/database';

const emit = defineEmits(['close']);

const screen = ref('login');
const matricule = ref('');
const loginError = ref('');
const agentData = ref(null);
const agentFirebaseKey = ref(null);
const manoeuvreInfo = ref(null);
const batteryLevel = ref(100);
const currentTime = ref('');
const timeInterval = ref(null);
const isConnected = ref(false);
const isAlertActive = ref(false);
const alertMessage = ref('');
const audio = ref(null);
const vibrationInterval = ref(null);
const isAlertLoopActive = ref(false);
const permissionsGranted = ref(false);

// Listeners Firebase
let unsubscribeAgent = null;
let unsubscribeInfo = null;
let unsubscribeAllManoeuvrants = null;

async function connect() {
    if (!matricule.value.trim()) {
        loginError.value = 'Veuillez entrer un identifiant';
        return;
    }
    
    loginError.value = '';

    try {
        // Récupérer les données depuis Firebase
        const manoeuvrantsRef = dbRef(db, 'manoeuvre/manoeuvrants');
        const snapshot = await get(manoeuvrantsRef);
        
        if (!snapshot.exists()) {
            loginError.value = 'Aucune manœuvre active';
            return;
        }

        const manoeuvrants = snapshot.val();
        let foundAgent = null;
        let foundKey = null;

        // Chercher l'agent correspondant
        for (const [key, agent] of Object.entries(manoeuvrants)) {
            const agentMatricule = (agent.matricule || '').toUpperCase();
            const inputMatricule = matricule.value.toUpperCase();
            
            if (agentMatricule === inputMatricule || 
                agentMatricule.endsWith(inputMatricule) ||
                matchNomPrenom(agent, inputMatricule)) {
                foundAgent = agent;
                foundKey = key;
                break;
            }
        }

        if (!foundAgent) {
            loginError.value = 'Agent non trouvé';
            return;
        }

        agentFirebaseKey.value = foundKey;
        agentData.value = {
            matricule: foundAgent.matricule,
            grade: foundAgent.grade,
            nom: foundAgent.nom,
            prenom: foundAgent.prenom,
            engLib: foundAgent.engin,
            engCaserne: foundAgent.caserne,
            gfo: foundAgent.gfo,
            role: foundAgent.role,
            statusConnexion: foundAgent.statusConnexion || 'PENDING',
            statusAlerte: foundAgent.statusAlerte || 'PENDING',
            od: foundAgent.ordreDepart || ''
        };

        // Mettre à jour le statut de connexion via l'API
        try {
            const connResponse = await fetch(`https://api.cms-collonges.fr/changeConnexion/${agentData.value.matricule}`, {
                method: 'POST'
            });
            if (connResponse.ok) {
                agentData.value.statusConnexion = 'OK';
                isConnected.value = true;
            }
        } catch (err) {
            console.error('Error updating connection status:', err);
        }

        screen.value = 'instructions';
    } catch (err) {
        loginError.value = 'Erreur: ' + err.message;
        console.error('Error connecting:', err);
    }
}

function matchNomPrenom(agent, input) {
    const nom = (agent.nom || '').toUpperCase().substring(0, 3);
    const prenom = (agent.prenom || '').toUpperCase().substring(0, 3);
    const expected = nom + prenom;
    return expected === input.toUpperCase();
}

async function requestPermissions() {
    try {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker enregistré:', registration);
            } catch (err) {
                console.error('Erreur enregistrement Service Worker:', err);
            }
        }
        
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
        
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }

        permissionsGranted.value = true;
    } catch (err) {
        console.error('Error requesting permissions:', err);
    }
}

async function startBip() {
    await requestPermissions();
    screen.value = 'bip';
    updateTime();
    timeInterval.value = setInterval(() => updateTime(), 1000);
    startBatteryMonitoring();
    loadAudio();
    
    // Écoute temps réel Firebase
    setupFirebaseListeners();
}

function setupFirebaseListeners() {
    // Écouter les changements de l'agent spécifique
    const agentRef = dbRef(db, `manoeuvre/manoeuvrants/${agentFirebaseKey.value}`);
    unsubscribeAgent = onValue(agentRef, (snapshot) => {
        if (snapshot.exists()) {
            const agent = snapshot.val();
            const previousStatusAlerte = agentData.value.statusAlerte;
            
            agentData.value = {
                matricule: agent.matricule,
                grade: agent.grade,
                nom: agent.nom,
                prenom: agent.prenom,
                engLib: agent.engin,
                engCaserne: agent.caserne,
                gfo: agent.gfo,
                role: agent.role,
                statusConnexion: agent.statusConnexion || 'PENDING',
                statusAlerte: agent.statusAlerte || 'PENDING',
                od: agent.ordreDepart || ''
            };
            
            isConnected.value = agentData.value.statusConnexion === 'OK';
            
            // Détection changement d'alerte
            const newStatusAlerte = agentData.value.statusAlerte;
            const wasInactive = previousStatusAlerte !== 'DONE';
            const isNowActive = newStatusAlerte === 'DONE';
            
            if (isNowActive && wasInactive) {
                // Nouvelle alerte
                isAlertActive.value = true;
                const vehicule = (agentData.value.engLib || '').toUpperCase().replace('-', '');
                const role = (agentData.value.role || '').toUpperCase();
                const gfo = (agentData.value.gfo || '').toUpperCase();
                alertMessage.value = `${vehicule}-${role}-${gfo}`;
                startAlert();
            } else if (!isNowActive && isAlertActive.value) {
                isAlertActive.value = false;
                stopAlert();
            }
        }
    });

    // Écouter les infos de manœuvre
    const infoRef = dbRef(db, 'manoeuvre/info');
    unsubscribeInfo = onValue(infoRef, (snapshot) => {
        if (snapshot.exists()) {
            manoeuvreInfo.value = snapshot.val();
        }
    });

    // Écouter tous les manoeuvrants (pour compter les engins)
    const allManoeuvrantsRef = dbRef(db, 'manoeuvre/manoeuvrants');
    unsubscribeAllManoeuvrants = onValue(allManoeuvrantsRef, (snapshot) => {
        // Données utilisées dans startAlert()
    });
}

function updateTime() {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function startBatteryMonitoring() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            batteryLevel.value = Math.round(battery.level * 100);
            battery.addEventListener('levelchange', () => {
                batteryLevel.value = Math.round(battery.level * 100);
            });
        });
    }
}

function loadAudio() {
    audio.value = new Audio('/sonnerie.mp3');
    audio.value.loop = true;
    audio.value.preload = 'auto';
}

function startVibrationLoop() {
    if (!('vibrate' in navigator)) return;
    
    stopVibrationLoop();
    isAlertLoopActive.value = true;
    
    const vibrate = () => {
        if (!isAlertLoopActive.value) return;
        navigator.vibrate([1300, 1000]);
        vibrationInterval.value = setTimeout(vibrate, 2300);
    };
    
    vibrate();
}

function stopVibrationLoop() {
    isAlertLoopActive.value = false;
    
    if (vibrationInterval.value) {
        clearTimeout(vibrationInterval.value);
        vibrationInterval.value = null;
    }
    
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
    }
}

async function startAlert() {
    console.log('🚨 Démarrage alerte en boucle');
    
    // Démarrer vibration en boucle
    startVibrationLoop();
    
    // Démarrer sonnerie en boucle
    if (audio.value) {
        audio.value.currentTime = 0;
        audio.value.volume = 1.0;
        audio.value.loop = true;
        
        audio.value.play().catch(err => {
            console.error('Error playing audio:', err);
        });
    }

    // Préparer les données de notification
    const od = agentData.value.od || '';
    let numManoeuvre = '';
    let libelleManoeuvre = '';
    let adresse = '';
    
    if (manoeuvreInfo.value) {
        numManoeuvre = manoeuvreInfo.value.numManoeuvre || '';
        libelleManoeuvre = manoeuvreInfo.value.titleManoeuvre || '';
        adresse = manoeuvreInfo.value.adresseManoeuvre || '';
    }
    
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const dateHeure = `${dd}/${MM} ${hh}:${mm}`;
    
    // Compter les engins
    let nombreEnginsTotal = 0;
    try {
        const manoeuvrantsRef = dbRef(db, 'manoeuvre/manoeuvrants');
        const snapshot = await get(manoeuvrantsRef);
        
        if (snapshot.exists()) {
            const manoeuvrants = snapshot.val();
            const enginsUniques = new Set();
            const odNum = parseInt(od) || 0;
            
            Object.values(manoeuvrants).forEach(agent => {
                const agentOD = parseInt(agent.ordreDepart) || 0;
                const engLib = agent.engin || '';
                const engCaserne = agent.caserne || '';
                
                if (agentOD > 0 && agentOD <= odNum && engLib) {
                    enginsUniques.add(`${engLib}_${engCaserne}`);
                }
            });
            
            nombreEnginsTotal = enginsUniques.size;
        }
    } catch (err) {
        console.error('Error counting engins:', err);
    }
    
    // Données personnalisées pour cet agent
    const notificationData = {
        matricule: agentData.value.matricule,
        engLib: agentData.value.engLib,
        role: agentData.value.role,
        gfo: agentData.value.gfo,
        od: od,
        numManoeuvre: numManoeuvre,
        libelleManoeuvre: libelleManoeuvre,
        adresseManoeuvre: adresse,
        dateHeure: dateHeure,
        nombreEngins: nombreEnginsTotal,
        timestamp: Date.now(),
    };
    
    // Titre et body formatés
    const vehicule = (agentData.value.engLib || '').toUpperCase().replace('-', '');
    const role = (agentData.value.role || '').toUpperCase();
    const gfo = (agentData.value.gfo || '').toUpperCase();
    const notificationTitle = `🚨 ${vehicule}-${role}-${gfo}`;
    const notificationBody = `🚧 N°${numManoeuvre || '?'}/${od} - ${dateHeure}\n${libelleManoeuvre || 'Manœuvre'}\n${adresse || 'Adresse non disponible'}\n${nombreEnginsTotal} Engins`;
    
    // Envoyer la notification
    try {
        if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            
            await registration.showNotification(notificationTitle, {
                body: notificationBody,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `manoeuvre-${agentData.value.matricule}-${Date.now()}`,
                requireInteraction: true,
                vibrate: [1300, 1000],
                renotify: true,
                silent: false,
                timestamp: Date.now(),
                data: notificationData,
                actions: [
                    {
                        action: 'open',
                        title: '🚒 Ouvrir',
                    },
                    {
                        action: 'acknowledge',
                        title: '✅ Départ',
                    },
                ],
            });
            
            console.log('✅ Notification envoyée');
        }
    } catch (error) {
        console.error('❌ Erreur notification:', error);
    }
}

function stopAlert() {
    console.log('🛑 Arrêt alerte');
    
    stopVibrationLoop();
    
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
    }
}

async function acknowledge() {
    if (isAlertActive.value) {
        console.log('✅ Acquittement');
        
        stopAlert();
        
        try {
            const response = await fetch(`https://api.cms-collonges.fr/departManoeuvre/${agentData.value.matricule}`, {
                method: 'POST'
            });
            if (response.ok) {
                console.log('✅ Départ confirmé via API');
            }
        } catch (err) {
            console.error('Error acknowledging:', err);
            if (agentData.value.statusAlerte === 'DONE') {
                isAlertActive.value = true;
                startAlert();
            }
        }
    }
}

function refreshData() {
    console.log('Firebase écoute déjà les changements en temps réel');
}

function disconnect() {
    stopAlert();
    if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
        return;
    }
    
    if (unsubscribeAgent) unsubscribeAgent();
    if (unsubscribeInfo) unsubscribeInfo();
    if (unsubscribeAllManoeuvrants) unsubscribeAllManoeuvrants();
    
    if (timeInterval.value) clearInterval(timeInterval.value);
    if (audio.value) {
        audio.value.pause();
        audio.value = null;
    }
    
    screen.value = 'login';
    agentData.value = null;
    agentFirebaseKey.value = null;
    manoeuvreInfo.value = null;
    emit('close');
}

onMounted(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker enregistré:', registration.scope);
            })
            .catch((error) => {
                console.log('Échec Service Worker:', error);
            });
        
        // Écouter les messages du Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📬 Message du SW:', event.data);
            
            switch (event.data.type) {
                case 'START_ALERT_LOOP':
                    if (!isAlertActive.value) {
                        isAlertActive.value = true;
                        startAlert();
                    }
                    break;
                    
                case 'STOP_ALERT_LOOP':
                    stopAlert();
                    break;
                    
                case 'ACKNOWLEDGE_ALERT':
                    acknowledge();
                    break;
                    
                case 'NOTIFICATION_CLICKED':
                    console.log('Notification cliquée:', event.data);
                    stopAlert();
                    break;
            }
        });
    }
});

onUnmounted(() => {
    stopAlert();
    
    if (unsubscribeAgent) unsubscribeAgent();
    if (unsubscribeInfo) unsubscribeInfo();
    if (unsubscribeAllManoeuvrants) unsubscribeAllManoeuvrants();
    
    if (timeInterval.value) clearInterval(timeInterval.value);
    if (audio.value) {
        audio.value.pause();
        audio.value = null;
    }
});
</script>

<style scoped>
/* Ton CSS reste identique */
.agent-container {
    width: 100%;
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text);
    font-family: 'Marianne', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
}

.login-screen {
    background: var(--color-background);
    color: var(--color-text);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.return-header {
    margin-bottom: 2rem;
}

.return-btn {
    background: transparent;
    border: 1px solid #e5e5e5;
    color: #0078f3;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-family: 'Marianne', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    transition: all 0.3s ease;
}

.return-btn:hover {
    background-color: #f4f6ff;
    border-color: #0078f3;
}

.login-form {
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
}

.login-instructions {
    font-size: 14px;
    margin-bottom: 2rem;
    line-height: 1.6;
    color: var(--color-text);
    background: #f4f6ff;
    padding: 1rem;
    border-radius: 8px;
}

.instruction-item {
    margin-bottom: 1rem;
    text-align: left;
}

.instruction-item:last-child {
    margin-bottom: 0;
}

.instruction-label {
    font-weight: bold;
    display: block;
    margin-bottom: 0.3rem;
    color: #0078f3;
}

.instruction-example {
    font-style: italic;
    color: #666666;
    font-size: 13px;
}

.input-group {
    margin-bottom: 1.5rem;
}

.input-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 14px;
    font-weight: bold;
    color: var(--color-text);
}

input[type="text"] {
    width: 100%;
    padding: 0.75rem;
    background: var(--color-background);
    border: 1px solid #e5e5e5;
    color: var(--color-text);
    font-family: 'Marianne', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 15px;
    border-radius: 5px;
    transition: all 0.3s ease;
}

input[type="text"]:focus {
    outline: none;
    border-color: #0078f3;
    box-shadow: 0 0 0 3px rgba(0, 120, 243, 0.1);
}

.error-message {
    color: #f60700;
    margin-top: 1rem;
    font-size: 14px;
    background: #fff4f4;
    padding: 0.75rem;
    border-radius: 5px;
    text-align: center;
}

.instruction-screen {
    background: var(--color-background);
    color: var(--color-text);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    text-align: center;
}

.instruction-content {
    max-width: 400px;
    width: 100%;
}

.instruction-warning {
    font-size: 18px;
    margin-bottom: 2rem;
    color: #d64d00;
    font-weight: bold;
    background: #fff4f3;
    padding: 1rem;
    border-radius: 8px;
}

.instruction-list {
    text-align: left;
    margin-bottom: 2rem;
    line-height: 2;
    background: #f4f6ff;
    padding: 1.5rem;
    border-radius: 8px;
}

.instruction-list li {
    margin-bottom: 0.75rem;
    color: var(--color-text);
}

.btn-continue {
    width: 100%;
    padding: 0.75rem;
    border: none;
    font-family: 'Marianne', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    border-radius: 20px;
    background-image: linear-gradient(to right bottom, #0078f3 5%, #18753c 100%);
    background-size: 140% 140%;
    animation: gradient 2s ease infinite;
    color: white;
    height: 2.5rem;
    text-align: center;
}

.btn-continue:hover {
    cursor: pointer;
    background-image: linear-gradient(to right bottom, #0078f3 5%, #18753c 70%);
    background-size: 140% 140%;
    animation: gradient 1.5s ease infinite;
}

.bip-container {
    background: #000;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 10px;
    justify-content: center;
    align-items: center;
}

.bip-device {
    flex: 1;
    background: #1a1a1a;
    border: 3px solid #333;
    border-radius: 15px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

.bip-screen {
    background: #c3d6a5;
    border: 2px solid #96a57d;
    border-radius: 5px;
    padding: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    font-family: 'VT323', monospace;
    position: relative;
    min-height: 200px;
    max-height: 200px;
    color: #2d3126;
}

.bip-screen.active {
    background: #ffeb3b;
    border-color: #f1cd00;
}

.screen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    height: 30px;
}

.battery-info {
    display: flex;
    align-items: center;
    gap: 5px;
}

.battery-level {
    font-size: 12px;
    color: #2d3126;
}

.battery-icon {
    width: 20px;
    height: 10px;
    border: 1px solid #2d3126;
    position: relative;
    background: #2d3126;
}

.battery-icon::after {
    content: '';
    position: absolute;
    right: -3px;
    top: 2px;
    width: 2px;
    height: 6px;
    background: #2d3126;
}

.battery-fill {
    height: 100%;
    background: #2d3126;
    transition: width 0.3s;
}

.signal-icon {
    width: 15px;
    height: 10px;
    display: flex;
    align-items: flex-end;
    gap: 2px;
}

.signal-bar {
    width: 2px;
    background: #2d3126;
}

.signal-bar:nth-child(1) { height: 30%; }
.signal-bar:nth-child(2) { height: 50%; }
.signal-bar:nth-child(3) { height: 70%; }
.signal-bar:nth-child(4) { height: 100%; }

.time-display {
    font-size: 14px;
    color: #2d3126;
}

.screen-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 18px;
    line-height: 1.8;
    font-family: 'VT323', monospace;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.screen-waiting {
    color: #2d3126;
    font-weight: normal;
}

.screen-alert {
    color: #2d3126;
    font-weight: bold;
    font-size: 20px;
}

.bip-buttons {
    position: relative;
    width: 270px;
    height: 130px;
    margin: 30px auto 0 auto;
    display: block;
}

.bip-button {
    position: absolute;
    width: 50px;
    height: 50px;
    background: #e0e0e0;
    border: 2px solid #bbb;
    border-radius: 50%;
    color: #222;
    font-family: 'VT323', monospace;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.10);
    z-index: 1;
}

.bip-button.btn-yellow {
    width: 100px;
    height: 100px;
    left: 50%;
    top: 15px;
    transform: translateX(-50%);
    margin-left: 0;
    background: #ffeb3b;
    color: #333;
    border-color: #ffe300;
    font-weight: bold;
    z-index: 2;
}

.bip-button.btn-yellow:active {
    background: #ffe066;
}

.bip-button.btn-2 {
    left: calc(50% + 70px);
    top: 40px;
}

.bip-button.btn-3 {
    left: calc(50% + 70px);
    top: 15px;
}

.bip-button:active:not(.btn-yellow) {
    background: #cacaca;
    color: #000;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
</style>