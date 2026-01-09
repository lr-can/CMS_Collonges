<template>
    <div class="admin-container">
        <div class="return-header">
            <button class="return-btn" @click="$emit('close')">← Retour</button>
        </div>
        <div class="container">
            <h1>Administration Manœuvre</h1>
            
            <div class="refresh-info">
                Mise à jour en temps réel via Firebase 🔥
            </div>

            <div v-if="error" class="error">
                {{ error }}
            </div>

            <div v-if="loading && !manoeuvreInfo" class="loading">
                Chargement des données...
            </div>

            <template v-else-if="manoeuvreInfo || Object.keys(manoeuvrants).length > 0">
                <!-- Info Manœuvre -->
                <div v-if="manoeuvreInfo" class="info-section">
                    <h2>Informations de la Manœuvre</h2>
                    <div class="info-item">
                        <span class="info-label">N° Manœuvre:</span>
                        <span>{{ manoeuvreInfo.numManoeuvre }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Titre:</span>
                        <span>{{ manoeuvreInfo.titleManoeuvre }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Adresse:</span>
                        <span>{{ manoeuvreInfo.adresseManoeuvre }}</span>
                    </div>
                </div>

                <!-- Bouton Fin de Manœuvre -->
                <div v-if="allOrdresDepartDeclenches" class="info-section warning-section">
                    <h2>Manœuvre terminée</h2>
                    <p>Tous les ordres de départ ont été déclenchés.</p>
                    <button 
                        class="btn btn-danger" 
                        @click="finirManoeuvre"
                    >
                        Finir la Manœuvre
                    </button>
                </div>

                <!-- Ordres de Départ -->
                <div v-for="od in ordresDepart" :key="od.numero" class="od-section">
                    <div class="od-header">
                        <div class="od-title">Ordre de Départ {{ od.numero }}</div>
                        <button 
                            class="btn btn-primary" 
                            @click="lancerOrdreDepart(od.numero)"
                            :disabled="od.status === 'done'"
                        >
                            {{ od.status === 'done' || od.status === 'received' ? 'Déclenché' : 'Lancer l\'OD' }}
                        </button>
                    </div>

                    <div v-for="engin in od.engins" :key="engin.id" 
                         :class="['engin-card', engin.statusAlerte.toLowerCase()]">
                        <div class="engin-header">
                            <div>
                                <div class="engin-name">{{ engin.nom }}</div>
                                <div class="engin-details">
                                    {{ engin.caserne }} - {{ engin.gfo }}
                                    <span class="status-badge" :class="'status-' + engin.statusAlerte.toLowerCase()">
                                        {{ engin.statusAlerte }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="agent-list">
                            <div v-for="agent in engin.agents" :key="agent.matricule" class="agent-item">
                                <div class="agent-info">
                                    <div class="agent-name">{{ agent.grade }} {{ agent.nom }} {{ agent.prenom }}</div>
                                    <div class="agent-details">
                                        Matricule: {{ agent.matricule }} | Rôle: {{ agent.role }}
                                    </div>
                                </div>
                                <div>
                                    <span class="status-badge" :class="'status-' + agent.statusConnexion.toLowerCase()">
                                        {{ agent.statusConnexion }}
                                    </span>
                                    <span class="status-badge" :class="'status-' + agent.statusAlerte.toLowerCase()" style="margin-left: 5px;">
                                        {{ agent.statusAlerte }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            
            <div v-else class="loading">
                Aucune manœuvre active
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase/config';
import { ref as dbRef, onValue } from 'firebase/database';

const emit = defineEmits(['close']);

const manoeuvreInfo = ref(null);
const manoeuvrants = ref({});
const loading = ref(true);
const error = ref(null);

let unsubscribeInfo = null;
let unsubscribeManoeuvrants = null;

const manoeuvrantsList = computed(() => {
    return Object.values(manoeuvrants.value).map(agent => ({
        matricule: agent.matricule || '',
        grade: agent.grade || '',
        nom: agent.nom || '',
        prenom: agent.prenom || '',
        engLib: agent.engin || '',
        engCaserne: agent.caserne || '',
        gfo: agent.gfo || '',
        role: agent.role || '',
        statusConnexion: agent.statusConnexion || 'PENDING',
        statusAlerte: agent.statusAlerte || 'PENDING',
        od: agent.ordreDepart || ''
    }));
});

const ordresDepart = computed(() => {
    const odMap = {};
    manoeuvrantsList.value.forEach(agent => {
        let odNum = agent.od;
        if (!odNum || odNum === 'undefined' || odNum === 'null') {
            return;
        }
        odNum = String(odNum).trim();
        if (odNum === '') {
            return;
        }
        
        if (!odMap[odNum]) {
            odMap[odNum] = {
                numero: odNum,
                engins: {}
            };
        }
        const enginKey = `${agent.engLib}_${agent.engCaserne}`;
        if (!odMap[odNum].engins[enginKey]) {
            odMap[odNum].engins[enginKey] = {
                id: enginKey,
                nom: agent.engLib,
                caserne: agent.engCaserne,
                gfo: agent.gfo,
                statusAlerte: agent.statusAlerte,
                agents: []
            };
        }
        odMap[odNum].engins[enginKey].agents.push(agent);
    });

    const ods = Object.values(odMap).map(od => {
        od.engins = Object.values(od.engins);
        const allDoneOrReceived = od.engins.every(engin => {
            return engin.agents.every(agent => 
                agent.statusAlerte === 'DONE' || agent.statusAlerte === 'RECEIVED'
            );
        });
        od.status = allDoneOrReceived ? 'done' : 'pending';
        return od;
    });

    return ods.sort((a, b) => {
        if (a.status === 'pending' && b.status === 'done') return -1;
        if (a.status === 'done' && b.status === 'pending') return 1;
        const numA = parseInt(a.numero);
        const numB = parseInt(b.numero);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return String(a.numero).localeCompare(String(b.numero));
    });
});

const allOrdresDepartDeclenches = computed(() => {
    if (ordresDepart.value.length === 0) return false;
    return ordresDepart.value.every(od => od.status === 'done');
});

function setupFirebaseListeners() {
    // Écouter les infos de manœuvre
    const infoRef = dbRef(db, 'manoeuvre/info');
    unsubscribeInfo = onValue(infoRef, (snapshot) => {
        if (snapshot.exists()) {
            manoeuvreInfo.value = snapshot.val();
        } else {
            manoeuvreInfo.value = null;
        }
        loading.value = false;
    }, (err) => {
        console.error('Error listening to manoeuvre info:', err);
        error.value = 'Erreur de connexion Firebase';
        loading.value = false;
    });

    // Écouter les manoeuvrants
    const manoeuvrantsRef = dbRef(db, 'manoeuvre/manoeuvrants');
    unsubscribeManoeuvrants = onValue(manoeuvrantsRef, (snapshot) => {
        if (snapshot.exists()) {
            manoeuvrants.value = snapshot.val();
        } else {
            manoeuvrants.value = {};
        }
        loading.value = false;
    }, (err) => {
        console.error('Error listening to manoeuvrants:', err);
        error.value = 'Erreur de connexion Firebase';
        loading.value = false;
    });
}

async function lancerOrdreDepart(ordreDepart) {
    if (!ordreDepart || ordreDepart === '' || ordreDepart === 'undefined') {
        error.value = 'Numéro d\'ordre de départ invalide';
        return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir lancer l'ordre de départ ${ordreDepart} ?`)) {
        return;
    }
    try {
        const encodedOrdreDepart = encodeURIComponent(String(ordreDepart));
        const response = await fetch(`https://api.cms-collonges.fr/declencherOrdreDepart/${encodedOrdreDepart}`, {
            method: 'POST'
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur lors du déclenchement: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        console.log('Ordre de départ lancé:', result);
        error.value = null;
        // Firebase met à jour automatiquement
    } catch (err) {
        error.value = err.message;
        console.error('Error launching OD:', err);
    }
}

async function finirManoeuvre() {
    if (!confirm('Êtes-vous sûr de vouloir terminer la manœuvre ? Cela réinitialisera toutes les données.')) {
        return;
    }
    try {
        const response = await fetch('https://api.cms-collonges.fr/reinitialiseManoeuvre', {
            method: 'POST'
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur lors de la réinitialisation: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        console.log('Manœuvre terminée:', result);
        error.value = null;
        alert('Manœuvre terminée avec succès !');
        // Firebase met à jour automatiquement
    } catch (err) {
        error.value = err.message;
        console.error('Error finishing manoeuvre:', err);
    }
}

onMounted(() => {
    setupFirebaseListeners();
});

onUnmounted(() => {
    if (unsubscribeInfo) unsubscribeInfo();
    if (unsubscribeManoeuvrants) unsubscribeManoeuvrants();
});
</script>

<style scoped>
/* Ton CSS reste identique */
.admin-container {
    width: 100%;
    min-height: 100vh;
    background: #f5f5f5;
    padding: 20px;
}

.return-header {
    margin-bottom: 20px;
}

.return-btn {
    padding: 10px 20px;
    background: #0078f3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}

.return-btn:hover {
    background: #6196ff;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
}

h1 {
    color: #2c3e50;
    margin-bottom: 30px;
    text-align: center;
}

.info-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-section h2 {
    color: #34495e;
    margin-bottom: 15px;
    font-size: 18px;
}

.info-item {
    margin-bottom: 8px;
}

.info-label {
    font-weight: bold;
    color: #555;
    display: inline-block;
    min-width: 150px;
}

.warning-section {
    background: #fff3cd;
    border: 2px solid #ffc107;
}

.warning-section h2 {
    color: #856404;
}

.warning-section p {
    margin-bottom: 15px;
    color: #856404;
}

.od-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.od-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid #3498db;
}

.od-title {
    font-size: 20px;
    font-weight: bold;
    color: #2c3e50;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.3s;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
}

.btn-primary:disabled {
    background: #95a5a6;
    cursor: not-allowed;
}

.btn-danger {
    background: #e74c3c;
    color: white;
}

.btn-danger:hover {
    background: #c0392b;
}

.engin-card {
    background: #ecf0f1;
    border-left: 4px solid #3498db;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
}

.engin-card.done {
    border-left-color: #27ae60;
    background: #d5f4e6;
}

.engin-card.pending {
    border-left-color: #f39c12;
    background: #fef5e7;
}

.engin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.engin-name {
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
}

.engin-details {
    color: #7f8c8d;
    font-size: 14px;
}

.agent-list {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #bdc3c7;
}

.agent-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    margin: 5px 0;
    background: white;
    border-radius: 4px;
}

.agent-info {
    flex: 1;
}

.agent-name {
    font-weight: bold;
    color: #2c3e50;
}

.agent-details {
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 2px;
}

.status-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.status-pending {
    background: #fff3cd;
    color: #856404;
}

.status-done {
    background: #d4edda;
    color: #155724;
}

.status-received {
    background: #cfe2ff;
    color: #084298;
}

.status-ok {
    background: #d1e7dd;
    color: #0f5132;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
}

.error {
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
}

.refresh-info {
    text-align: right;
    color: #7f8c8d;
    font-size: 12px;
    margin-bottom: 20px;
}
</style>