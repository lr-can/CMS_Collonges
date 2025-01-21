<template>
    <div class="reader">
        <div class="subtitle">
            Scan des étiquettes
        </div>
        <Dropdown v-model="selected" :options="devices" optionLabel="label" optionsValue="deviceId" placeholder="Sélectionnez une autre camera" @change="newSelection" class="form-item" v-if="devices.length > 1"/>
        <div class="manualInput">
            <label for="withoutgrouping">ID à ajouter</label>
            <div id="inputTextDiv">
                <InputText v-model="inputedNumber" inputId="withoutgrouping" stye="width:200px"/>
            </div>
        </div>
        <div class="validationBtn" @click="changeResult()" id="SmallBtn">Valider l'entrée</div>
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
    <div id="filter" v-if="cancelClicked" @click="cancelClicked = false"></div>
    <div>
        <div class="validation-error" id="suppression">
            {{ deleted }}
        </div>
        <div v-if="visualisationAjout.length == 0">Aucun {{ props.info.nomMateriel }} a encore été ajouté.</div>
        <div v-if="visualisationAjout.length > 0" class="visualisation">
            <div class="todayItem" v-for="row in visualisationAjout" :key="row.idStock" @click="cancelClick(row.idStock)">{{ row.idStock }}</div>
        </div>
        <div v-if="cancelClicked" class="suppressionDiv">
                <div class="return">
                    <div class="returnBtn" @click="cancelClicked = false">Annuler</div>
                </div>
                <p>
                    Vous vous apprêtez à supprimer <span id="productSuppression">ID-{{ produitId }} ({{ props.info.nomMateriel }})</span>. Cette action est irréversible.</p>
                <div id="supprimer" @click="removeSelectedItem()"><span v-if="!deleting">Confirmer la suppression</span><span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="deleting"></span></div>
            </div>   
    </div>
</template>

<script setup>
import { QrcodeStream } from 'vue-qrcode-reader';
import InputText from 'primevue/inputnumber';
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import { useSqlStore } from "@/stores/database.js";
import { useAuth0 } from '@auth0/auth0-vue';
import Validation from '../assets/sounds/Validation.mp3';
import Error from '../assets/sounds/Error.mp3';
import Loading from '../assets/sounds/Loading.mp3';
import Deleted from '../assets/sounds/Deleted.mp3';

const inputedNumber = ref(999999);
const isValid = ref(false);
const paused = ref(false);
const result = ref('null');
const sqlStore = useSqlStore();
const dbResponse = ref("Chargement en cours...");
const visualisationAjout = ref([]);
const cancelClicked = ref(false);
const produitId = ref(0);
const deleted = ref("");
const deleting = ref(false);
const validationSound = new Audio(Validation);
const errorSound = new Audio(Error);
const loadingSound = new Audio(Loading);
const deletedSound = new Audio(Deleted);

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
const changeResult = async function() {
    result.value = inputedNumber.value;
    paused.value = true;
    loadingSound.play();
    await sendRequest();
    console.log(await dbResponse.value);
    if (dbResponse.value.message == "Le matériel a bien été créé."){
        isValid.value = true;
        loadingSound.pause();
        validationSound.play();
        getTodayItems();
        await timeout(2000);
    } else {
        isValid.value = false;
        loadingSound.pause();
        errorSound.play();
        if (dbResponse.value.message.includes('foreign')){
            dbResponse.value = {message: "L'utilisateur ne dispose pas des droits nécessaires pour effectuer cette action."};
        } else if (dbResponse.value.message.includes('Duplicate')){
            dbResponse.value = {message: `ID-${result.value} déjà présent dans la base de données.`};
        }
        await timeout(2000);
    }
        getTodayItems();
        paused.value = false;
        resetValidationState();
    
}

const onError = console.error

const resetValidationState = function() {
	isValid.value = undefined
}

const onDetect = async function([firstDetectedCode]) {
    vibrate();
	result.value = firstDetectedCode.rawValue
	paused.value = true
    loadingSound.play();

	await sendRequest()
    console.log(await dbResponse.value);
    if (dbResponse.value.message == "Le matériel a bien été créé."){
	isValid.value = true;
    loadingSound.pause();
    validationSound.play();     
    } else {
        isValid.value = false;
        loadingSound.pause();
        errorSound.play();
        if (dbResponse.value.message.includes('foreign')){
            dbResponse.value = {message: "L'utilisateur ne dispose pas des droits nécessaires pour effectuer cette action."};
        } else if (dbResponse.value.message.includes('Duplicate')){
            dbResponse.value = {message: `ID-${result.value} déjà présent dans la base de données.`};
        }
        await timeout(2000)
    }
    getTodayItems();
    paused.value = false
	await timeout(2000)
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
    
    selected.value = devices.value[devices.value.length - 1]
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

async function removeSelectedItem() {
    deleting.value = true;
    loadingSound.play();
    await sqlStore.cancelTodayCreation(produitId.value);
    let fistLenght = visualisationAjout.value.length;
    await getTodayItems();
    let secondLenght = visualisationAjout.value.length;
    cancelClicked.value = false;
    deleting.value = false;
    if (fistLenght > secondLenght){
        loadingSound.pause();
        deletedSound.play();
        deleted.value = "ID-" + produitId.value + " supprimé";
    } else {
        loadingSound.pause();
        errorSound.play();
        deleted.value = "Erreur lors de la suppression";
    }
    await timeout(2000);
    deleted.value = null;
}

function vibrate(){
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}
</script>

<style>  
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
    margin-top: 3.5rem;
}

#productSuppression{
    font-weight: bold;
}
.manualInput{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    padding: 1rem;
    background-color: #f6f6f6;
    border-radius: 5px;
}
.manualInput > label{
    margin-right: 0.5rem;
    flex: 0.1;
}
#withoutgrouping{
    width: 100%;
    flex: 0.5;
}
#inputTextDiv{
    width: 100%;
    margin-left: 2rem;
    flex: 0.5;
}
inputTextDiv > span, input{
    width: 100%;
    min-width: 100px;
}
#SmallBtn{
    margin-top: 0;
    margin-bottom: 1rem;
}
</style>