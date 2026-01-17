<template>
    <div>
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
                <InputNumber id="nbProduits" v-model="nbProduits" :min="1" :max="100" class="form-item" placeholder="Nombre de produits" required @update:modelValue="onNbProduitsChange" />
            </label>
            <label for="firstId">Premier ID disponible
                <InputNumber id="firstId" v-model="firstId" :min="1" class="form-item" placeholder="Premier ID" />
            </label>
            <span class="mandatory">*</span> Champs obligatoires
            <div class="validationBtn" @click="submitForm" :class="{ 'disabled': loading || loadingIds }">
                <span v-if="loading || loadingIds">Chargement...</span>
                <span v-else>Générer les étiquettes</span>
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
import { useAuth0 } from '@auth0/auth0-vue';

import { ref, onMounted } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const auth0 = useAuth0();
const sqlStore = useSqlStore();

const materiels = ref([]);
const selectedMateriel = ref();
const peremptionDate = ref();
const numLot = ref();
const nbProduits = ref(null);
const firstId = ref(null);
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

// Récupérer le premier ID disponible automatiquement
async function getNextAvailableIds(count) {
    loadingIds.value = true;
    try {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };
        const response = await fetch(`https://api.cms-collonges.fr/nextAvailableIds/${count}`, requestOptions);
        const result = await response.json();
        if (result.nextIds && result.nextIds.length > 0) {
            firstId.value = result.nextIds[0];
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

// Lorsque le nombre de produits change, récupérer automatiquement le premier ID
async function onNbProduitsChange() {
    if (nbProduits.value && nbProduits.value > 0) {
        await getNextAvailableIds(nbProduits.value);
    } else {
        firstId.value = null;
    }
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

        // Récupérer le matricule de l'utilisateur
        let idAgent = null;
        if (auth0.user.value && auth0.user.value.profile && auth0.user.value.profile[0]) {
            idAgent = auth0.user.value.profile[0];
        }

        // Créer toutes les entrées dans la base de données
        const currentDate = new Date();
        labels.value = [];
        
        for (let i = 0; i < ids.length; i++) {
            const idStock = parseInt(ids[i]);
            const request = {
                'idStock': idStock,
                'idMateriel': selectedMateriel.value.idMateriel,
                'idStatut': 1,
                'dateCreation': currentDate,
                'datePeremption': peremptionDateStr,
                'numLot': numLot.value,
                'idAgent': idAgent
            };
            
            // Ajouter à la base de données
            await sqlStore.createMateriel(request);
            
            // Ajouter à la liste des étiquettes
            labels.value.push({
                idStock: idStock,
                nomMateriel: selectedMateriel.value.nomMateriel,
                datePeremption: peremptionDateStr,
                numLot: numLot.value
            });
        }
        
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

const reinitialiser = () => {
    selectedMateriel.value = null;
    peremptionDate.value = null;
    numLot.value = null;
    nbProduits.value = null;
    firstId.value = null;
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
</style>