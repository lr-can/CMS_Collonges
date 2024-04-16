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

const auth0 = useAuth0();
let utilisateur = auth0.user.value;
const props = defineProps(['info']);

async function sendRequest() {
    const currentDate = new Date().toISOString().split('T')[0];
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
    
	await timeout(2000)
	paused.value = false
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
    max-width: 50%;
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
</style>