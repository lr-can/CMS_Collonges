<template>
    <div class="reader">
        <div class="subtitle">
            Scan des étiquettes
        </div>
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
                <p> ID-{{ result }} ajouté</p>
            </div>
            <div v-if="validationError" class="validation-error">
                <p>Erreur : {{ dbResponse.message }}</p>
            </div>
            <div v-if="validationPending" class="validation-pending">
                <p><img src="@/assets/loading.gif" alt="" width="50px" height="auto">Ajout de ID-{{ result }}...</p>
            </div>
    </div>
    <div class="subsubtitle">
        Ajoutés aujourd'hui
    </div>
    <div id="filter" v-if="cancelClicked"></div>
    <div class="visualisation">
        <div v-if="visualisationAjout.length == 0">Aucun {{ props.info.nomMateriel }} a encore été ajouté.</div>
        <div class="todayItem" v-else v-for="row in visualisationAjout" :key="row.idStock" @click="cancelClick(row.idStock)">{{ row.idStock }}</div>
        <div v-if="cancelClicked" class="suppressionDiv">
            <div class="return">
                <div class="returnBtn" @click="cancelClicked = false">Annuler</div>
            </div>
            <p>Vous vous apprêtez à supprimer <span id="productSuppression">ID-{{ produitId }} ({{ props.info.nomMateriel }})</span>.</p>
            <div id="supprimer">Confirmer la suppression</div>
        </div>   
    </div>
</template>

<script setup>
import { QrcodeStream } from 'vue-qrcode-reader';
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useSqlStore } from "@/stores/database.js";
import { useAuth0 } from '@auth0/auth0-vue';

const isValid = ref(false);
const paused = ref(false);
const result = ref('null');
const sqlStore = useSqlStore();
const dbResponse = ref("Chargement en cours...");
const visualisationAjout = ref([]);
const cancelClicked = ref(false);
const produitId = ref(0);

const auth0 = useAuth0();
let utilisateur = auth0.user.value;
const props = defineProps(['info']);

async function sendRequest() {
    const currentDate = new Date();
    const request = {
        'idStock': parseInt(result.value),
        'idMateriel': props.info.idMateriel,
        'idStatut': 1,
        'dateCreation': currentDate,
        'datePeremption': props.info.datePeremption,
        'numLot': props.info.numLot,
        'idAgent': utilisateur.profile[0],
    };
    await sqlStore.createMateriel(request);
    dbResponse.value = await sqlStore.responseCreation;
}

async function getTodayItems(){
    await sqlStore.getTodayCreation(props.info.idMateriel);
    visualisationAjout.value = await sqlStore.todayCreationList;
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

const onError = console.error

const resetValidationState = function() {
	isValid.value = undefined
}

const onDetect = async function([firstDetectedCode]) {
	result.value = firstDetectedCode.rawValue
	paused.value = true

	await sendRequest()
    console.log(await dbResponse.value);
    if (dbResponse.value.message == "Le matériel a bien été créé."){
	isValid.value = true;
    } else {
        isValid.value = false
    }
    getTodayItems();
	await timeout(2000)
	paused.value = false

    resetValidationState()
}

const timeout = function(ms) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms)
	})
}
const devices = ref([]);
const selected = ref();

const getDevices = async () => {
    devices.value = (await navigator.mediaDevices.enumerateDevices()).filter(
        ({ kind }) => kind === 'videoinput'
    );
    
    selected.value = devices.value[0]
};

getDevices();
const newSelection = () => {
    console.log(selected.value);
}
getTodayItems();

const cancelClick = (idStock) => {
    cancelClicked.value = true;
    produitId.value = idStock;
};
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
.todayItem{
    border-radius: 10px;
    flex: 0 1 30%;
    background-image: linear-gradient(to right bottom, #f4f6ff 60%, #c2cfff 100%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
    color: #0078f3;
    padding: 5px;
    text-align: center;
    margin: auto;
    margin: 0.1rem;
}
.todayItem:hover{
    cursor: pointer;
    background-image: linear-gradient(to right bottom, #d6deff 60%, #d6deff 100%);
    transition: background-image 0.3s ease;
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
    margin-top: 4rem;
}
#filter{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100vh;
    -webkit-filter: blur(5px);
    -moz-filter: blur(5px);
    -o-filter: blur(5px);
    -ms-filter: blur(5px);
    filter: blur(5px);
    backdrop-filter: blur(5px);
    z-index: 0;
}

#productSuppression{
    font-weight: bold;
}
</style>