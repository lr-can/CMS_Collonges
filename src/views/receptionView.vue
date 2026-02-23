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
                <Dropdown
                    id="materiel"
                    v-model="selectedMateriel"
                    editable
                    :options="materielsOptionsGrouped"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    optionLabel="nomMateriel"
                    placeholder="Sélectionnez un matériel"
                    required
                    class="form-item"
                    @change="onMaterielChange"
                />
            </label>
            <label for="peremptionDate">Date de péremption
                <Calendar id="peremptionDate" v-model="peremptionDate" dateFormat="dd/mm/yy" class="form-item" placeholder="Insérez une date" />
            </label>
            <label for="numLot">Numéro de Lot<span class="mandatory">*</span>
                <InputText id="numLot" v-model="numLot" class="form-item" placeholder="Indiquez le numéro de lot" required/>
            </label>
            <label for="nbProduits">Nombre de produits<span class="mandatory">*</span>
                <InputText 
                    id="nbProduits" 
                    v-model="nbProduits" 
                    type="number"
                    inputmode="numeric"
                    class="form-item form-item-large" 
                    placeholder="Nombre de produits" 
                    required 
                    @blur="tryAutoFetchIds"
                />
                <span v-if="nbProduitsError" class="error-message">{{ nbProduitsError }}</span>
            </label>
            <div class="first-id-section">
                <label for="firstId">Premier ID disponible
                    <button type="button" class="fetch-ids-btn" @click="fetchIds" :disabled="!isNbProduitsValid || loadingIds">
                        <span v-if="loadingIds">Chargement...</span>
                        <span v-else>Récupérer automatiquement</span>
                    </button>
                    <InputText 
                        id="firstId" 
                        v-model="firstId" 
                        type="text"
                        class="form-item form-item-large first-id-input" 
                        placeholder="Ex. 101 ou K01" 
                        :disabled="loadingIds"
                        @blur="validateFirstId"
                    />
                    <span v-if="firstIdError" class="error-message">{{ firstIdError }}</span>
                </label>
                <div v-if="retrievedIds.length > 0" class="retrieved-ids-display">
                    <p class="ids-label">IDs récupérés ({{ retrievedIds.length }}):</p>
                    <div class="ids-list">
                        <span v-for="(id, index) in retrievedIds" :key="index" class="id-badge">{{ id }}</span>
                    </div>
                </div>
            </div>
            <span class="mandatory">*</span> Champs obligatoires
            <div class="validationBtn" @click="submitForm" :class="{ 'disabled': !isFormValid || loading || loadingIds }" :style="{ pointerEvents: (!isFormValid || loading || loadingIds) ? 'none' : 'auto' }">
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
import Warning from '../assets/sounds/Deleted.mp3';
import InputError from '../assets/sounds/InputError.mp3';
import { useAuth } from '@/composables/useAuth.js';

import { ref, onMounted, nextTick, computed } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const { user: authUser } = useAuth();
const sqlStore = useSqlStore();

const materiels = ref([]);
const materielKitItems = ref([]);
const materielsOptionsGrouped = ref([]);
const selectedMateriel = ref();
const peremptionDate = ref();
const numLot = ref();
const nbProduits = ref('');
const firstId = ref('');
const nbProduitsError = ref('');
const firstIdError = ref('');
const retrievedIds = ref([]);
const reset = ref(false);
const loading = ref(false);
const loadingIds = ref(false);
const labels = ref([]);
const warningSound = new Audio(Warning);
const errorSound = new Audio(InputError);

function onMaterielChange() {
    firstId.value = '';
    retrievedIds.value = [];
}

// Récupérer automatiquement le premier ID disponible à partir du plus proche, au blur du champ nbProduits
async function tryAutoFetchIds() {
    validateNbProduits();
    if (nbProduitsError.value || loadingIds.value || firstId.value) return;
    const count = Number(String(nbProduits.value || ''));
    if (count < 1 || count > 100) return;
    await getNextAvailableIds(count);
}

// Validation du nombre de produits
const validateNbProduits = () => {
    nbProduitsError.value = '';
    const valueStr = nbProduits.value ? String(nbProduits.value).trim() : '';
    
    if (!valueStr) {
        nbProduitsError.value = 'Le nombre de produits est obligatoire';
        return false;
    }
    
    const num = Number(valueStr);
    if (isNaN(num) || !Number.isInteger(num)) {
        nbProduitsError.value = 'Veuillez entrer un nombre entier valide';
        return false;
    }
    
    if (num < 1) {
        nbProduitsError.value = 'Le nombre doit être au moins 1';
        return false;
    }
    
    if (num > 100) {
        nbProduitsError.value = 'Le nombre ne peut pas dépasser 100';
        return false;
    }
    
    return true;
};

// Validation du premier ID (entier ou K+entier ex. K01, K02)
const validateFirstId = () => {
    firstIdError.value = '';
    const valueStr = (firstId.value != null ? String(firstId.value) : '').trim();
    if (!valueStr) return true;

    const m = valueStr.match(/^K(\d+)$/i);
    if (m) {
        const n = parseInt(m[1], 10);
        if (n >= 1) return true;
        firstIdError.value = 'L\'ID doit être au moins 1';
        return false;
    }
    const num = Number(valueStr);
    if (!isNaN(num) && Number.isInteger(num) && num >= 1) return true;
    firstIdError.value = 'Entrez un entier (ex. 101) ou K+entier (ex. K01)';
    return false;
};

// Computed pour vérifier si le nombre de produits est valide
const isNbProduitsValid = computed(() => {
    const valueStr = nbProduits.value ? String(nbProduits.value).trim() : '';
    if (!valueStr) return false;
    const num = Number(valueStr);
    return !isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 100;
});

// Computed pour vérifier si tous les champs obligatoires sont remplis et valides
const isFormValid = computed(() => {
    if (!selectedMateriel.value) return false;
    const numLotStr = numLot.value ? String(numLot.value).trim() : '';
    if (!numLotStr) return false;
    if (!isNbProduitsValid.value) return false;
    if (nbProduitsError.value) return false;

    const firstIdStr = firstId.value ? String(firstId.value) : '';
    if (firstIdStr && firstIdStr.trim() && firstIdError.value) return false;
    return true;
});

const KITS_A_EXCLURE = ['kit aev/aes', 'kit accouchement', 'kit membre sectionné', 'kit aes', 'kit aev'];

function normalizeForExclude(str) {
    return String(str || '').toLowerCase().trim();
}

function isKitExclu(item) {
    const nom = normalizeForExclude(item?.nomMateriel || item?.nomCommun);
    return KITS_A_EXCLURE.some((k) => nom.includes(k) || nom === k);
}

async function fetchMaterielKit() {
    if (typeof sqlStore.getKitsMaterielKit === 'function') {
        return await sqlStore.getKitsMaterielKit();
    }
    try {
        const res = await fetch('https://api.cms-collonges.fr/kits/materielKit', { method: 'GET', redirect: 'follow' });
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.data || []);
    } catch {
        return [];
    }
}

async function getMateriels() {
    await sqlStore.getMateriels();
    const classic = await sqlStore.materielsList;
    const classicArr = Array.isArray(classic) ? classic : Object.values(classic || {});
    const classicFiltered = classicArr.filter((m) => !isKitExclu(m));
    materiels.value = classicFiltered;

    const mk = await fetchMaterielKit();
    materielKitItems.value = mk || [];

    const groups = [];

    groups.push({
        label: 'Matériel classique',
        items: classicFiltered.map((m) => ({
            ...m,
            nomMateriel: m.nomMateriel || m.nomCommande,
            idMateriel: m.idMateriel || m.id,
            isKitItem: false
        }))
    });

    const kitItems = materielKitItems.value.map((m) => ({
        id: m.id,
        idMateriel: m.id,
        nomMateriel: m.nomCommun || m.nomCommande,
        isKitItem: true,
        materielKit: m
    }));

    if (kitItems.length > 0) {
        groups.push({ label: 'Matériel pour kits', items: kitItems });
    }

    materielsOptionsGrouped.value = groups;
}

onMounted(() => {
    getMateriels();
});

// Récupérer les IDs disponibles automatiquement (classique ou stockKit pour matériel kit)
async function getNextAvailableIds(count) {
    loadingIds.value = true;
    retrievedIds.value = [];
    const isKit = selectedMateriel.value?.isKitItem === true;
    const url = isKit
        ? `https://api.cms-collonges.fr/kits/nextAvailableStockKitIds/${count}`
        : `https://api.cms-collonges.fr/nextAvailableIds/${count}`;
    try {
        const requestOptions = { method: "GET", redirect: "follow" };
        const response = await fetch(url, requestOptions);
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
    if (!validateNbProduits()) {
        errorSound.play();
        return;
    }
    const count = Number(String(nbProduits.value || ''));
    await getNextAvailableIds(count);
}

async function submitForm() {
    // Vérifier si le formulaire est valide
    if (!isFormValid.value || loading.value || loadingIds.value) {
        return;
    }
    
    // Valider tous les champs (double vérification)
    if (!validateNbProduits()) {
        errorSound.play();
        return;
    }
    
    if (firstId.value && !validateFirstId()) {
        errorSound.play();
        return;
    }

    loading.value = true;

    try {
        const nbProduitsNum = Number(String(nbProduits.value || ''));
        const peremptionDateStr = !peremptionDate.value
            ? new Date('2999-12-31').toISOString().split('T')[0]
            : new Date(peremptionDate.value).toISOString().split('T')[0];
        const currentDate = new Date();
        labels.value = [];

        let ids = [];
        const firstIdStr = firstId.value ? String(firstId.value).trim() : '';
        if (firstIdStr) {
            const firstIdNum = Number(firstIdStr);
            if (firstIdNum > 0) {
                for (let i = 0; i < nbProduitsNum; i++) {
                    ids.push(firstIdNum + i);
                }
            }
        }
        if (ids.length === 0) {
            ids = await getNextAvailableIds(nbProduitsNum);
            if (ids.length !== nbProduitsNum) {
                throw new Error('Nombre d\'IDs insuffisant');
            }
        }
        let idAgent = null;
        const utilisateur = authUser.value;
        if (utilisateur?.profile?.[0]) idAgent = utilisateur.profile[0];
        else idAgent = localStorage.getItem('cms_auth_matricule');
        const dataList = ids.map((id) => ({
            idStock: parseInt(id),
            idMateriel: selectedMateriel.value.idMateriel,
            idStatut: 1,
            dateCreation: currentDate,
            datePeremption: peremptionDateStr,
            numLot: numLot.value,
            idAgent: idAgent
        }));
        await sqlStore.createMateriel(dataList);
        labels.value = ids.map((id) => ({
            idStock: toIdStock(id),
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
    nbProduits.value = '';
    firstId.value = '';
    nbProduitsError.value = '';
    firstIdError.value = '';
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
.form-item-large {
    font-size: 1.2rem;
}
.form-item-large :deep(input) {
    font-size: 1.2rem;
    padding: 1rem;
}
.form-item input[disabled] {
    background-color: #f0f0f0;
    cursor: not-allowed;
}
.error-message {
    display: block;
    color: #ce0500;
    font-size: 14px;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
label{
    font-weight: 500;
    font-size: 16px;
    margin-top: 1.5rem;
    margin-bottom: 1.2rem;
    display: block;
}
/* Styles pour s'assurer que Dropdown et Calendar s'affichent correctement */
.form-item :deep(.p-dropdown),
.form-item :deep(.p-calendar) {
    width: 100%;
    display: block;
}
.form-item :deep(.p-dropdown .p-dropdown-label),
.form-item :deep(.p-calendar .p-inputtext) {
    width: 100%;
    border-radius: 30px;
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
.validationBtn {
    width: 100%;
    min-height: 60px;
    padding: 1.5rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    background-color: #0078f3;
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
.validationBtn:hover:not(.disabled) {
    background-color: #0056b3;
}
.validationBtn.disabled {
    background-color: #e0e0e0 !important;
    color: #999999 !important;
    cursor: not-allowed !important;
    opacity: 0.7;
    box-shadow: none;
}
.validationBtn.disabled:hover {
    background-color: #e0e0e0 !important;
    color: #999999 !important;
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
.first-id-section label {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.first-id-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
}
.first-id-input {
    width: 100%;
    margin-top: 0.5rem;
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
    width: 100%;
    margin-bottom: 0.5rem;
    order: -1;
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

@media (min-width: 1024px) {
    .reception-container {
        max-width: 900px;
        margin: 0 auto;
        padding-bottom: 6rem;
    }

    #reinitializing {
        margin-left: 0;
    }
}
</style>