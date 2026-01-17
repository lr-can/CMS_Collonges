<template>
    <div class="reception-container">
        <div class="subtitle">
            Réception d'une commande
        </div>
        <div id="reinitialised" v-if="reset">La saisie a été réinitialisée.</div>
        <div id="reinitializing">
            <div class="returnBtn" @click="reinitialiser">Réinitialiser la saisie</div>
        </div>
        <form autocomplete="off">
            <label for="materiel">Matériel<span class="mandatory">*</span>
                <Dropdown id='materiel' v-model="selectedMateriel" editable :options="materiels" optionLabel="nomMateriel" placeholder="Sélectionnez un matériel" required class="form-item"/>
            </label>
            <label for="peremptionDate">Date de péremption
                <Calendar id="peremptionDate" v-model="peremptionDate" dateFormat="dd/mm/yy" class="form-item" placeholder="Insérez une date" />
            </label>
            <label for="numLot">Numéro de Lot<span class="mandatory">*</span>
                <InputText id="numLot" v-model="numLot" class="form-item" placeholder="Indiquez le numéro de lot" required/>
            </label>
            <label for="nbProduits">Nombre de produits<span class="mandatory">*</span>
                <InputNumber id="nbProduits" v-model="nbProduits" :min="1" :max="100" class="form-item" placeholder="Nombre de produits" required />
            </label>
            <div class="first-id-section">
                <label for="firstId">Premier ID disponible
                    <div class="first-id-input-group">
                        <InputNumber id="firstId" v-model="firstId" :min="1" class="form-item first-id-input" placeholder="Premier ID" :disabled="loadingIds" />
                        <button type="button" class="fetch-ids-btn" @click="fetchIds" :disabled="!nbProduits || nbProduits < 1 || loadingIds">
                            <span v-if="loadingIds">Chargement...</span>
                            <span v-else>Récupérer automatiquement</span>
                        </button>
                    </div>
                </label>
                <div v-if="retrievedIds.length > 0" class="retrieved-ids-display">
                    <p class="ids-label">IDs récupérés ({{ retrievedIds.length }}):</p>
                    <div class="ids-list">
                        <span v-for="(id, index) in retrievedIds" :key="index" class="id-badge">{{ id }}</span>
                    </div>
                </div>
            </div>
            <span class="mandatory">*</span> Champs obligatoires
            <div class="validationBtn" @click="submitForm" :class="{ 'disabled': loading || loadingIds }">
                <span v-if="loading || loadingIds">Chargement...</span>
                <span v-else>Envoyer vers la base de données</span>
            </div>
        </form>
        
        <div v-if="labels.length > 0" class="labels-section">
            <h3>Etiquettes à coller</h3>
            <div class="labels-grid">
                <div v-for="(label, index) in labels" :key="index" class="label-item">
                    <div class="label-content">
                        <p><strong>ID Stock:</strong> {{ label.idStock }}</p>
                        <p><strong>Matériel:</strong> {{ label.nomMateriel }}</p>
                        <p><strong>Date péremption:</strong> {{ label.datePeremption }}</p>
                        <p><strong>N° Lot:</strong> {{ label.numLot }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Warning from '../assets/sounds/Deleted.mp3';
import InputError from '../assets/sounds/InputError.mp3';
import { useAuth } from '@/composables/useAuth.js';

import { ref, onMounted, nextTick } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const { user: authUser } = useAuth();
const sqlStore = useSqlStore();

const materiels = ref([]);
const selectedMateriel = ref();
const peremptionDate = ref();
const numLot = ref();
const nbProduits = ref(null);
const firstId = ref(null);
const retrievedIds = ref([]);
const reset = ref(false);
const loading = ref(false);
const loadingIds = ref(false);
const labels = ref([]);
const warningSound = new Audio(Warning);
const errorSound = new Audio(InputError);

async function getMateriels() {
    await sqlStore.getMateriels();
    materiels.value = await sqlStore.materielsList;
}

onMounted(() => {
    getMateriels();
});

// Récupérer les IDs disponibles automatiquement
async function getNextAvailableIds(count) {
    loadingIds.value = true;
    retrievedIds.value = [];
    try {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };
        const response = await fetch(`https://api.cms-collonges.fr/nextAvailableIds/${count}`, requestOptions);
        const result = await response.json();
        if (result.nextIds && result.nextIds.length > 0) {
            firstId.value = result.nextIds[0];
            retrievedIds.value = result.nextIds;
            return result.nextIds;
        }
        return [];
    } catch (error) {
        console.error('Erreur lors de la récupération des IDs:', error);
        errorSound.play();
        alert('Erreur lors de la récupération des IDs disponibles.');
        return [];
    } finally {
        loadingIds.value = false;
    }
}

// Fonction pour récupérer les IDs manuellement (via le bouton)
async function fetchIds() {
    if (!nbProduits.value || nbProduits.value < 1) {
        errorSound.play();
        alert('Veuillez d\'abord indiquer le nombre de produits.');
        return;
    }
    await getNextAvailableIds(nbProduits.value);
}

async function submitForm() {
    if (!selectedMateriel.value || !numLot.value || !nbProduits.value) {
        errorSound.play();
        alert('Au moins un champ obligatoire n\'a pas été rempli.');
        return;
    }

    loading.value = true;
    
    try {
        // Générer les IDs : soit depuis l'API, soit à partir du firstId si modifié manuellement
        let ids = [];
        if (firstId.value && firstId.value > 0) {
            // Si l'utilisateur a modifié le premier ID manuellement, générer une séquence
            for (let i = 0; i < nbProduits.value; i++) {
                ids.push(firstId.value + i);
            }
        } else {
            // Sinon, récupérer depuis l'API
            ids = await getNextAvailableIds(nbProduits.value);
            if (ids.length !== nbProduits.value) {
                throw new Error('Nombre d\'IDs insuffisant');
            }
        }

        // Préparer la date de péremption
        let peremptionDateStr;
        if (!peremptionDate.value) {
            peremptionDateStr = new Date('2999-12-31').toISOString().split('T')[0];
        } else {
            peremptionDateStr = new Date(peremptionDate.value).toISOString().split('T')[0];
        }

        // Récupérer le matricule de l'utilisateur depuis le cache
        let idAgent = null;
        const utilisateur = authUser.value;
        if (utilisateur && utilisateur.profile && utilisateur.profile[0]) {
            idAgent = utilisateur.profile[0];
        } else {
            // Fallback : récupérer depuis le cache localStorage
            idAgent = localStorage.getItem('cms_auth_matricule');
        }

        // Créer toutes les entrées dans la base de données
        const currentDate = new Date();
        labels.value = [];
        
        // Construire un tableau de données à envoyer à l'API en une seule requête
        const dataList = ids.map(id => {
            const idStock = parseInt(id);
            return {
                'idStock': idStock,
                'idMateriel': selectedMateriel.value.idMateriel,
                'idStatut': 1,
                'dateCreation': currentDate,
                'datePeremption': peremptionDateStr,
                'numLot': numLot.value,
                'idAgent': idAgent
            };
        });

        // Envoyer la liste à la base de données (adapter l'API pour supporter ce format)
        await sqlStore.createMateriel(dataList);

        // Ajouter à la liste des étiquettes
        labels.value = ids.map(id => ({
            idStock: parseInt(id),
            nomMateriel: selectedMateriel.value.nomMateriel,
            datePeremption: peremptionDateStr,
            numLot: numLot.value
        }));
        
        // Scroller vers le bas après la création des étiquettes
        await nextTick();
        scrollToBottom();
        
    } catch (error) {
        console.error('Erreur lors de la création des produits:', error);
        errorSound.play();
        alert('Erreur lors de la création des produits. Veuillez réessayer.');
        labels.value = [];
    } finally {
        loading.value = false;
    }
}

const timeout = function(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

// Fonction pour scroller vers le bas de la page
const scrollToBottom = () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
}

const reinitialiser = () => {
    selectedMateriel.value = null;
    peremptionDate.value = null;
    numLot.value = null;
    nbProduits.value = null;
    firstId.value = null;
    retrievedIds.value = [];
    labels.value = [];
    reset.value = true;
    warningSound.play();
    timeout(2000).then(() => {
        reset.value = false;
    });
}
</script>
<style>
.mandatory{
    color: #ce0500;
}
.form-item{
    border-radius: 30px;
    width: 100%;
    font-family: 'Marianne';
    margin-bottom: 1.5rem;
}
.form-item > input{
    border-radius: 30px;
}
.form-item input[disabled] {
    background-color: #f0f0f0;
    cursor: not-allowed;
}
label{
    font-weight: 500;
    font-size: 16px;
    margin-top: 1.5rem;
    margin-bottom: 1.2rem;
}
.returnBtn{
    cursor: pointer;
}
#reinitializing{
    margin-bottom: 1rem;
    background-color: #e5e5e5;
    color: #666666;
    width: 20vh;
    min-width: 20vh;
    max-width: 25vh;
    padding: 5px;
    border-radius: 30px;
    text-align: center;
    margin-left: 50%;
}
#reinitialised{
    background-color: #fff4f3;
    color: #d64d00;
    border-radius: 5px;
    text-align: center;
    max-width: 100%;
    margin-bottom: 1rem;
}
.validationBtn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.labels-section {
    margin-top: 3rem;
}
.labels-section h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #333;
}
.labels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}
.label-item {
    border: 2px solid #e5e5e5;
    border-radius: 10px;
    padding: 1rem;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.label-content p {
    margin: 0.5rem 0;
    font-size: 14px;
}
.label-content strong {
    color: #333;
    font-weight: 600;
}
.first-id-section {
    margin-top: 1.5rem;
}
.first-id-input-group {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}
.first-id-input {
    flex: 1;
}
.fetch-ids-btn {
    background-color: #0078f3;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 0.75rem 1.5rem;
    font-family: 'Marianne';
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    white-space: nowrap;
    min-width: 180px;
}
.fetch-ids-btn:hover:not(:disabled) {
    background-color: #0056b3;
}
.fetch-ids-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #cccccc;
}
.retrieved-ids-display {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f4f6ff;
    border-radius: 10px;
    border: 1px solid #d6deff;
}
.ids-label {
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin-bottom: 0.75rem;
}
.ids-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.id-badge {
    background-color: #0078f3;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: inline-block;
}
.reception-container {
    padding-bottom: 10rem;
    min-height: 100vh;
}
</style>