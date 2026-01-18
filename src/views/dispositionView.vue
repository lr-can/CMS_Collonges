<template>
     <div v-if="introduction">
            <div class="subtitle">
                Mise à disposition du matériel
            </div>
            <form>
                <div class="consigne">
                    <span class="number" id="premiereConsigne">1</span>
                    Je sélectionne le <span class="TextHighlight">type d'inventaire</span> que je souhaite réaliser.
                </div>
                <div class="consigne">
                    <span  class="number" id="deuxiemeConsigne">2</span>
                    Pour chaque matériel, je réalise la <span class="TextHighlight">suppression du matériel</span> sorti en scannant les étiquettes restantes.
                </div>
                <div class="consigne">
                    <span class="number" id="troisiemeConsigne">3</span>
                    Pour chaque matériel, j'effectue la <span class="TextHighlight">mise à disposition</span> du matériel en scannant les étiquettes.
                </div>
                <div class="question">
                    <ToggleButton v-model="PartialOrComplete" onLabel="Inventaire Complet" offLabel="Inventaire Partiel"
                     class="w-9rem" aria-label="Do you confirm" />
                </div>
                <div class="validationBtn" @click="submitForm"><span v-if="!isLoading">Valider le choix</span><span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="isLoading"></span></div>
            </form>
    </div>
    <div v-if="listLoaded">
        <div class="progressBar">
            <div class="progression" :style="{width: currentProgression * 100 + '%'}"></div>
        </div>
        <div class="subtitle">
            <span :class="zone()">{{ currentZoneText }}</span><span id="currentMateriel" class="subtitle">{{ currentMateriel }}</span>
        </div>
        <div class="subsubtitle" v-if="notArchived">
                Suppression du materiel utilisé
        </div>
        <div class="subsubtitle" v-if="notDisposition">
                Mise à disposition du matériel
        </div>
        <div v-if="notArchived">
            <qrCodePharma :info="information" @archive="archived()" />
        </div>
        <div v-if="notDisposition">
            <qrCodeReserve :info="information" @disposition="next()"/>
        </div>
    </div>
    <div v-if="finished">
        <div class="subtitle">
                Mise à disposition du matériel
        </div>
        <div>
            <img src="@/assets/finished.gif" alt="" width="300px" height="auto">
        </div>
        <div class="subsubtitle">
            La mise à disposition est terminée.
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import ToggleButton from 'primevue/togglebutton';
import { useSqlStore } from "@/stores/database.js";
import  qrCodePharma  from "../components/qrCodePharma.vue";
import qrCodeReserve from '../components/qrCodeReserve.vue';

const auth0 = useAuth0();

let utilisateur = null;
if (auth0 && auth0.user && auth0.user.value) {
  utilisateur = auth0.user.value;
}

const matricule = ref(utilisateur && utilisateur.profile && utilisateur.profile[0] ? utilisateur.profile[0] : '');

const introduction = ref(true);
const PartialOrComplete = ref(true);
const sqlStore = useSqlStore();
const materielsToCheck = ref([]);
const currentMateriel = ref("Materiel");
const currentIdMateriel = ref('');
const currentObjectif = ref('');
const currentZone = ref('');
const materielLenght = ref(0);
const currentProgression = ref(0);
const notArchived = ref(true);
const listLoaded = ref(false);
const notDisposition = ref(false);
const isLoading = ref(false);
const currentZoneText = ref('');
const finished = ref(false);
const information = ref({
    idMateriel: '',
    datePeremption: '',
    numLot: ''
});

const submitForm = async () => {
    isLoading.value = true;
    if(PartialOrComplete.value){
        await sqlStore.getMaterielsToCheck("Complete");
        materielsToCheck.value = await sqlStore.materielsToCheck;
        materielLenght.value = materielsToCheck.value.length;

    }else{
        await sqlStore.getMaterielsToCheck("partial");
        materielsToCheck.value = await sqlStore.materielsToCheck;
        materielLenght.value = materielsToCheck.value.length;
    }
    console.log(materielsToCheck.value)
    listLoaded.value = true;
    introduction.value = false;
    currentIdMateriel.value !== "" ? await sqlStore.RI_checked(currentIdMateriel.value) : null;
    progress();
    isLoading.value = false;
}
const progress = async () => {
    if(materielsToCheck.value.length > 0){
        currentMateriel.value = materielsToCheck.value[0].nomMateriel;
        currentIdMateriel.value = materielsToCheck.value[0].idMateriel;
        currentObjectif.value = materielsToCheck.value[0].nbVSAV;
        currentZone.value = materielsToCheck.value[0].zone;
        currentIdMateriel.value = materielsToCheck.value[0].idMateriel;
        information.value = {
            idMateriel: currentIdMateriel.value,
            objectif: currentObjectif.value,
            zone: currentZone.value,
            nomMateriel: currentMateriel.value
        }
        materielsToCheck.value.shift();
        currentProgression.value = (materielLenght.value - materielsToCheck.value.length) / materielLenght.value;
    }else{
        listLoaded.value = false;
        await sqlStore.reinitialiserRetourIntervention();
        let type = PartialOrComplete.value ? "complet" : "partiel";
        await sqlStore.resetRICount(type, matricule.value);
        finished.value = true;
    }

}
const archived = () => {
    console.log('archivé !');
    notArchived.value = false;
    notDisposition.value = true;
}

const zone = () => {
    currentZoneText.value = "Zone " + currentZone.value;
    if (currentZone.value.startsWith('B')) {
        return 'zoneBoite';
    } else if (currentZone.value.startsWith('O')) {
        return 'zoneOxy';
    } else if (currentZone.value.startsWith('R')) {
        return 'zoneRea';
    } else if (currentZone.value.startsWith('K')) {
        return 'zoneKits';
    } else if (currentZone.value.startsWith('D')) {
        return 'zoneDiv';
    } else {
        currentZoneText.value = 'Autre';
        return 'Autre';
    }
}
const next = () => {
    notDisposition.value = false;
    notArchived.value = true;
    progress();
}
</script>
<style>
.consigne{
    color: #666666;
    text-align: justify;
    margin-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
}
.consigne > .number{
    font-weight: bold;
    text-align: center;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 5px;
    border-radius: 30px;
    color: white;
    background-color: #0078f3;
    font-size: 18px;
}
.TextHighlight{
    color: #0078f3;
    font-weight: bold;
}
.question{
    margin-top: 2rem;
    text-align: center;
}
.progressBar{
    width: 90%;
    height: 1rem;
    background-color: #e8edff;
    border-radius: 30px;
    margin: auto;
    margin-bottom: 1.5rem;
    overflow: hidden;
    
}
.progression{
    height: 100%;
    background-color: #0078f3;
    border-radius: 30px;
}


.Autre{
    background-color: #eeeeee;
    color: #666666;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}
.zoneBoite{
    background-color: #dffee6;
    color: #1f8d49;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}
.zoneOxy{
    background-color: #f4f6ff;
    color: #0078f3;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}
.zoneRea{
    background-color: #fff4f4;
    color: #f60700;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}
.zoneKits{
    background-color: #fff4f3;
    color: #d64d00;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}
.zoneDiv{
    background-color: #fef3fd;
    color: #A558A0;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    font-weight: bold;
}

#currentMateriel{
    margin-left: 1rem;
}

</style>