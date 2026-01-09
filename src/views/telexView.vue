<template>
    <!-- Vue d'accueil avec les trois options -->
    <div v-if="currentView === 'home'" class="home-container">
        <div class="subtitle">
            Manœuvres et Ordres de Départ
        </div>
        <div class="options-grid">
            <!-- Option 1: Créer un ordre de départ -->
            <div 
                :class="['option-card', { 'disabled': isPhone }]"
                @click="!isPhone && openTelexCreation()"
            >
                <div class="option-icon">
                    <img v-if="!isPhone" src="@/assets/icons/telex.svg" width="60" height="auto" alt="Télex">
                    <img v-else src="@/assets/icons/lock.svg" width="60" height="auto" alt="Verrouillé">
                </div>
                <div class="option-title">Créer un ordre de départ</div>
                <div v-if="isPhone" class="phone-message">
                    Cette fonctionnalité n'est pas disponible sur téléphone. Veuillez utiliser un ordinateur.
                </div>
                <div v-else class="option-description">
                    Créer et générer un ordre de départ complet avec affectation des agents et engins
                </div>
            </div>

            <!-- Option 2: Administration d'une manoeuvre -->
            <div 
                class="option-card"
                @click="openAdminView()"
            >
                <div class="option-icon">
                    <img src="@/assets/icons/disposition.svg" width="60" height="auto" alt="Administration">
                </div>
                <div class="option-title">Administration d'une manœuvre</div>
                <div class="option-description">
                    Gérer les ordres de départ, suivre les statuts des agents et engins
                </div>
            </div>

            <!-- Option 3: Manoeuvrant -->
            <div 
                class="option-card"
                @click="openAgentView()"
            >
                <div class="option-icon">
                    <img src="@/assets/icons/profile.svg" width="60" height="auto" alt="Agent">
                </div>
                <div class="option-title">Manoeuvrant</div>
                <div class="option-description">
                    Interface agent pour recevoir les alertes et confirmer les départs
                </div>
            </div>
        </div>
    </div>

    <!-- Vue de création de télex (code existant) -->
    <div v-else-if="currentView === 'telex'" class="telex-view">
        <TelexCreationComponent @close="currentView = 'home'" @openAdmin="openAdminView" />
    </div>

    <!-- Vue Administration (inspirée de manoeuvreAdmin.html) -->
    <div v-else-if="currentView === 'admin'" class="admin-view">
        <ManoeuvreAdminComponent @close="currentView = 'home'" />
    </div>

    <!-- Vue Agent (inspirée de manoeuvreAgent.html) -->
    <div v-else-if="currentView === 'agent'" class="agent-view">
        <ManoeuvreAgentComponent @close="currentView = 'home'" />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import TelexCreationComponent from './telexCreation.vue';
import ManoeuvreAdminComponent from './manoeuvreAdmin.vue';
import ManoeuvreAgentComponent from './manoeuvreAgent.vue';

const currentView = ref('home');
const isPhone = computed(() => window.innerWidth < 768);

const openTelexCreation = () => {
    if (!isPhone.value) {
        currentView.value = 'telex';
    }
}

const openAdminView = () => {
    currentView.value = 'admin';
}

const openAgentView = () => {
    currentView.value = 'agent';
}
</script>

<style scoped>
.home-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.option-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 250px;
}

.option-card:hover:not(.disabled) {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    border-color: #0078f3;
}

.option-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f5f5f5;
}

.option-icon {
    margin-bottom: 1rem;
}

.option-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 1rem;
}

.option-description {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
}

.phone-message {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-top: 1rem;
    font-weight: 600;
}

/* Styles existants pour la vue télex */
.full {
    width: 100%;
}

.consigne {
    color: #666666;
    text-align: justify;
    margin-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
    font-size: 0.8rem;
}

.consigne > .number {
    font-weight: bold;
    text-align: center;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 5px;
    border-radius: 30px;
    color: white;
    background-color: #0078f3;
    font-size: 14px;
}

.TextHighlight {
    color: #0078f3;
    font-weight: bold;
    font-size: 0.8rem;
}

.asupButton {
    background-color: #0078f3;
    color: white;
    padding: 1rem 2rem;
    border-radius: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2rem auto;
    max-width: 300px;
    transition: all 0.3s ease;
}

.asupButton:hover {
    background-color: #6196ff;
}

.fullView {
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    top: 0;
    left: 0;
    z-index: 1000;
}

.return {
    position: fixed;
    top: 1rem;
    left: 1rem;
    cursor: pointer;
    background-color: #f0f0f0;
    padding: 0.5rem;
    border-radius: 30px;
    display: flex;
    z-index: 1001;
}

.returnBtn {
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.return:hover {
    background-color: #e0e0e0;
}

.admin-view,
.agent-view {
    width: 100%;
    min-height: 100vh;
}

.telex-view {
    width: 100%;
}
</style>