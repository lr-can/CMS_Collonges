<template>
        <Dropdown v-model="selected" :options="devices" optionLabel="label" optionsValue="deviceId" placeholder="Sélectionnez une autre camera" @change="newSelection" class="form-item" v-if="devices.length > 1"/>
        <div id="camera">
            <QrcodeStream 
            :paused="paused"
            @detect="onDetect"
            v-if="selected"
            @error="onError"
            @camera-on="resetValidationState"
            :constraints="{audio: false, facingMode: 'environment', deviceId: selected.deviceId}"
            id="readerComponent"></QrcodeStream>
        </div>
        <div v-if="validationSuccess" class="validation-success">
                <p> Modification prise en compte </p>
            </div>
            <div v-if="validationError" class="validation-error">
                <p>Erreur</p>
            </div>
            <div v-if="validationPending" class="validation-pending">
                <p><img src="@/assets/loading.gif" alt="" width="50px" height="auto">Changement dans la sélection...</p>
            </div>
        <div class="subsubtitle">
            Matériel présent dans la pharmacie
        </div>
        <div v-if="visualisationPharma.length == 0">Aucun {{ props.info.nomMateriel }} présent dans la pharmacie.</div>
        <div v-if="visualisationPharma.length > 0" class="visualisation">
            <div class="pharmaItem" v-for="row in visualisationPharma" :class="getSelectionStatus(row.idStock)" :key="row.idStock" @click="RemoveInList(row.idStock)">{{ row.idStock }}</div>
        </div>
        <div id="supprimer" @click="archive()"><span v-if="!deleting">Confirmer l'archivage de {{ listToProcess.length }} élément{{ pluriel() }}</span><span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="deleting"></span></div>
        
</template>

<script setup>
import { QrcodeStream } from 'vue-qrcode-reader';
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useSqlStore } from "@/stores/database.js";
import { useAuth0 } from '@auth0/auth0-vue';
import Loading from '../assets/sounds/Loading.mp3';
import Deleted from '../assets/sounds/Deleted.mp3';

const props = defineProps(['info']);

const isValid = ref(false);
const paused = ref(false);
const result = ref('null');
const sqlStore = useSqlStore();
const loadingSound = new Audio(Loading);
const deletedSound = new Audio(Deleted);
const auth0 = useAuth0();
const utilisateur = auth0?.user?.value || null;
const matricule = utilisateur?.profile?.[0] || localStorage.getItem('cms_auth_matricule') || '';
const selected = ref(null);
const devices = ref([]);
const visualisationPharma = ref([]);
const listToProcess = ref([]);
const deleting = ref(false);
const emit = defineEmits(['archive']);

const getDevices = async () => {
    devices.value = (await navigator.mediaDevices.enumerateDevices()).filter(
        ({ kind }) => kind === 'videoinput'
    );
    
    selected.value = devices.value[devices.value.length - 1];
    getVisualisationPharma();
};

getDevices();
const newSelection = () => {
    console.log(selected.value);
}

async function getVisualisationPharma(){
   await sqlStore.getVisualisationPharma(props.info.idMateriel);
   visualisationPharma.value = sqlStore.visualisationPharma;
   if (visualisationPharma.value.length == 0) {
       emit('archive');
   }
   let idStocksList = visualisationPharma.value.map((item) => item.idStock);
   listToProcess.value = idStocksList;

}

const RemoveInList = (idStock) => {
    loadingSound.pause();
    if (listToProcess.value.includes(idStock)) {
        listToProcess.value = listToProcess.value.filter((item) => item !== idStock);
        loadingSound.play();
    } else {
        listToProcess.value.push(idStock);
        loadingSound.play();
    }
    console.log(listToProcess.value);
}

const getSelectionStatus = (idStock) => {
    if (listToProcess.value.includes(idStock)) {
        return 'selected';
    }
    return '';
}

const validationPending = computed(() => {
	return isValid.value === undefined && paused.value
})

const validationSuccess = computed(() => {
	return isValid.value === true
})

const validationError = computed(() => {
    return isValid.value === false
})

const resetValidationState = function() {
	isValid.value = undefined
}


const onError = console.error

function vibrate(){
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}
const timeout = function(ms) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms)
	})
}

const onDetect = async function([firstDetectedCode]) {
    vibrate();
	result.value = parseInt(firstDetectedCode.rawValue);
	paused.value = true;
    loadingSound.play();
    await RemoveInList(result.value);
    isValid.value = true; 
    await timeout(500);
    paused.value = false;
    await timeout(2000);
    resetValidationState();


}
const archive = async () => {
    deleting.value = true;
    const data = {
        idAgent: matricule,
        materielsList: listToProcess.value
    };

    const confirmArchive = async () => {
        if (confirm(`Confirmer l'archivage de ${listToProcess.value.length} élément${pluriel()} ?`)) {
            await sqlStore.archivePharma(data);
            listToProcess.value = [];
            deleting.value = false;
            deletedSound.play();
            emit('archive');
        } else {
            deleting.value = false;
        }
    };

    await confirmArchive();
};

const pluriel = () => {
    if (listToProcess.value.length > 1) {
        return 's';
    }
    return '';
}
</script>

<style scoped>  
.reader{
    position: relative;
    width: 100%;
    height: 100%;
}

.validation-success {
    background-color: #dffee6;
    color: #18753c;
    border-radius: 5px;
    text-align: center;
    max-width: 50%;
}

.validation-error {
    background-color: #fff4f4;
    color: #ce0500;
    border-radius: 5px;
    text-align: center;
    max-width: 100%;
}
#suppression{
    background-color: #fff4f3;
    color: #d64d00;
}

.validation-pending {
    background-color: #f4f6ff;
    color: #0078f3;
    border-radius: 5px;
    text-align: center;
    max-width: 70%;
}
#camera {
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: 30px;
        max-height: 30vh;
    }
#readerComponent {
        scale: 1.2;
    }
.pharmaItem{
    border-radius: 10px;
    flex: 0 1 30%;
    padding: 5px;
    text-align: center;
    margin: auto;
    margin: 0.1rem;
    background-image: linear-gradient(to right bottom, #eeeeee 60%, #fff4f4 100%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
    color: #666666;
}
@media (min-width: 1024px){
.pharmaItem:hover{
    cursor: pointer;
    background-image: linear-gradient(to right bottom, #ffdddd 60%, #f60700 100%);
    transition: background-image 0.3s ease;
    color: #f60700;
}
}
.selected{
    background-image: linear-gradient(to right bottom, #ffdddd 60%, #ff9c9c 100%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
    color: #f60700;
}
.visualisation{
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 2rem;
}
#supprimer{
    margin-top: 3rem;
  color: #f60700;
  font-size: 16px;
  margin-bottom: 2rem;
  text-align: center;
}
#supprimer:hover{
    cursor: pointer;
    background-color: #fff4f4;
    color: #f60700;
    transition: background-color 0.3s ease;
    border-radius: 35px;
}

.suppressionDiv{
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    width: 90%;
    max-width: 400px;
    height: 40vh;
    max-height: 300px;
    border-radius: 35px;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    padding: 2.5rem;
    z-index: 1;

}
.suppressionDiv > p{
    margin-top: 3.5rem;
}

#productSuppression{
    font-weight: bold;
}
</style>