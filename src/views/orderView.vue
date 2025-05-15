<template>
    <div class="subtitle" v-if="!showCommande">
       Création d'une commande
    </div>
    <div v-if="!showCommande">
        <div id="IntroText">
                Sélectionnez les options à inclure dans la commande.
            </div>
        <form id="formOrder" v-if="commanding">
            <div id="peremptions" class="question" >
                <InputSwitch v-model="prochainesPeremptions" class="input"/>
                <div class="questionText">Péremption dans 1 mois</div>
            </div>
            <div id="missing" class="question">
                <InputSwitch v-model="missingMateriel" class="input"/>
                <div class="questionText">Matériel manquant</div>
            </div>
            <div id="notCountedItems" class="question">
                <InputSwitch v-model="notCountedItems" class="input"/>
                <div class="questionText">Matériel non compté</div>
            </div>
            <div class="question" v-if="notCountedItems" id="notCountedSelector">
                <div class="questionText" id="notCounted">Sélectionnez le matériel à inclure : </div>
                <MultiSelect v-model="notCountedList" display="chip" filter :options="optionsMatNotCounted" optionLabel="shortname" placeholder="Sélectionnez le matériel" />
            </div>
            <div class="validationBtn" @click="submitForm"><span v-if="gettingInfo">Chargement...</span><span v-if="!gettingInfo">Créer la commande</span></div>
        </form>


        <div id="filter" v-if="additionnalInfo" @click="additionnalInfo = false"></div>
        <div class="additionnalInfoDiv" v-if="additionnalInfo">
            <div class="return">
                <div class="returnBtn" @click="additionnalInfo = false">Retour</div>
            </div>
            <div class="messageErreur">
                <span id="redAlert" class="importantInfo">
                    <b>Attention</b>
                </span>
            </div>
            <div class="validation-error" id="archivage">
                {{ archived }}
            </div>
            <div>
                <p>Vous vous apprêtez à archiver l'ensemble du matériel qui périme dans le prochain mois. Cela concerne {{ nombreMaterielPeremption }}<span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="!nombreMaterielPeremption"></span> produits.</p>
                <p>
                    <b>Êtes-vous sûr de vouloir continuer ?</b>
                </p>
            </div>
            <div id="archiver" @click="archiverMateriel()"><span v-if="!archiving">Confirmer l'archivage</span><span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="archiving"></span></div>
        </div>  
    </div>
    <div v-if="showCommande">
        <div class="subtitle">
            Commande à passer
        </div>
        <div class="subsubtitle">
            Modifier la commande
        </div>
        <form id="commandeOperations" :class="formStyle">
            <div>
                <ToggleButton v-model="ADDorSUB" onLabel="Ajouter" offLabel="Supprimer"
                     class="w-9rem" aria-label="Do you confirm" />
            </div>
            <div>
                <InputNumber v-model="operationNumber" showButtons buttonLayout="horizontal" :min="0" :max="99">
                    <template #incrementbuttonicon>
                    +
                    </template>
                    <template #decrementbuttonicon>
                    -
                    </template>
                </InputNumber>
            </div>
            <div id="materielsList">
                <Dropdown id='materiel' v-model="selectedMaterielOperation" editable :options="materiels" optionLabel="nomMateriel" placeholder="Sélectionnez un matériel" required />
            </div>
        </form>
        <div class="validationBtn" @click="modifyCommande" id="modifierBtn">Modifier la commande</div>
        <div class="subsubtitle">
            Commande actuelle
        </div>
        <div class="commandeContainer">
            <div v-if="commande.length === 0 && !isGenerating">La commande ne comporte aucun materiel.</div>
            <div v-if="isGenerating" id="animation"><img src="@/assets/loading.gif" alt="" width="50px" height="auto">Création de la commande en cours...</div>
            <div class="commande">
                <commandeComponent :commande="commande"/>
            </div>
        </div>
        <div class="validationBtn" @click="ValidateOrder" id="validation">Valider la commande</div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import MultiSelect from 'primevue/multiselect';
import InputSwitch from 'primevue/inputswitch';
import InputNumber from 'primevue/inputnumber';
import ToggleButton from 'primevue/togglebutton';
import Dropdown from 'primevue/dropdown';
import commandeComponent from '@/components/commandeComponent.vue';
import loadingSound from '../assets/sounds/Loading.mp3';
import deleted from '../assets/sounds/Deleted.mp3';
import generating from '../assets/sounds/Generating.mp3';
import validation from '../assets/sounds/Validation.mp3';


const sqlStore = useSqlStore();

const loading = new Audio(loadingSound);
const deletedSound = new Audio(deleted);
const generatingSound = new Audio(generating);
const validationSound = new Audio(validation);

const isGenerating = ref(false);
const additionnalInfo = ref(false);
const theoryMaterielList = ref([]);
const gettingInfo = ref(false);
const realMaterielList = ref([]);
const formStyle = ref('ajout');
const operationNumber = ref(1);
const ADDorSUB = ref(true);
const commanding = ref(true);
const nombreMaterielPeremption = ref();
const archiving = ref(false);
const prochainesPeremptions = ref(true);
const missingMateriel = ref(true);
const notCountedItems = ref(false);
const selectedMaterielOperation = ref();
const archivePromise = ref(false);
const materiels = ref([]);
const showCommande = ref(false);
const notCountedList = ref();
const emailsAdresses = ref([]);
const archived = ref();
const commande = ref([]);
const optionsMatNotCounted = ref([
    {shortname: 'Aiguilles',
        fullname: {quantity: 1, nomCommande: 'Boîte d\'aiguilles autopiquantes', idMateriel: 'aiguAPique'}
    },
    {shortname: 'Protections thermomètres', fullname: {quantity: 50, nomCommande : 'protections pour thermomètre', idMateriel: 'protThermo'},
},
    {shortname: 'Chiffons', fullname: {quantity: 1, nomCommande : 'Carton de chiffons d\'essuyage à usage unique', idMateriel: 'chiffon'}
},
    {shortname: 'Draps', fullname: {quantity: 2, nomCommande : 'Cartons de draps à usage unique', idMateriel: 'drap'}
},
    {shortname: 'Piles AAA', fullname: {quantity: 1, nomCommande: 'Boîte de piles AAA', idMateriel: 'pileAAA'}
},
    {shortname: 'Piles plates', fullname: {quantity: 1, nomCommande: 'Boîte de piles plates', idMateriel: 'pilePlate'}
},
{shortname: 'Plombs', fullname: {quantity: 1, nomCommande: 'Lot de plombs pour TCHESE', idMateriel: 'plombs'}
},
    {shortname: 'Cartons DASRI', fullname: {quantity: 5, nomCommande: 'Cartons DASRI', idMateriel: 'DASRIc'}
},
    {shortname: 'Collecteurs d\'aiguilles', fullname: {quantity: 4, nomCommande: 'Collecteurs d\'aiguilles DASRI', idMateriel: 'DASRIa'}
},
    {shortname: 'Rouleau DASRI', fullname: {quantity: 4, nomCommande: 'Rouleaux de sac DASRI', idMateriel: 'DASRIs'}
},
    {shortname: 'Rasoir', fullname: {quantity: 4, nomCommande: 'Rasoir à usage unique', idMateriel: 'rasoir'}
},
    {shortname: 'Spray désinfectant', fullname: {quantity: 2, nomCommande: 'Sprays désinfectants', idMateriel: 'spray'}},
    {shortname: 'Désinfectant cellule', fullname: {quantity: 2, nomCommande: 'Bidons de désinfectant pour cellule de VSAV', idMateriel: 'desinfectantCellule'}},
    {shortname: "Electrodes pour ECG", fullname: {quantity: 1, nomCommande: 'Carton d\'électrodes pour ECG', idMateriel: 'electrodesECG'}},
])

optionsMatNotCounted.value.sort((a, b) => a.shortname.localeCompare(b.shortname));
async function getMateriels() {
    await sqlStore.getMateriels();
    materiels.value = await sqlStore.materielsList;
}
async function getEmailsAdresses(){
    await sqlStore.getEmailsAdresses();
    emailsAdresses.value = await sqlStore.adressesMails;
}
getMateriels();
getEmailsAdresses();


async function submitForm() {
    gettingInfo.value = true;
    loading.play();
    await sqlStore.getOneMonthPeremption();
    nombreMaterielPeremption.value = sqlStore.oneMonthPeremption;

    if(prochainesPeremptions.value && nombreMaterielPeremption.value > 0){
        additionnalInfo.value = true;
        while(!archivePromise.value) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    gettingInfo.value = false;
    showCommande.value = true;
    isGenerating.value = true;
    generatingSound.play();

    if (notCountedItems.value){
        await timeout(2000);
        getUnCountedItems();
    }
    if (missingMateriel.value){
    await getTheoryCount();
    await getRealCount();
    getDelta();
    }
    isGenerating.value = false;
    generatingSound.pause();
    console.log(commande.value);
}

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function archiverMateriel() {
    archiving.value = true;
    loading.play();
    await sqlStore.archivePeremption();
    archived.value = await sqlStore.archivagePeremptionResponse;
    deletedSound.play();
    await timeout(2000);
    additionnalInfo.value = false;
    archivePromise.value = true;
}

const getUnCountedItems = () => {
    for (let i = 0; i < notCountedList.value.length; i++) {
        commande.value.push(notCountedList.value[i].fullname);}
}
async function getTheoryCount(){
    await sqlStore.getMateriels();
    theoryMaterielList.value = sqlStore.materielsList;
}
async function getRealCount(){
    await sqlStore.getRealCount();
    realMaterielList.value = sqlStore.realCountList;

}
const getDelta = () => {
    for (let i = 0; i < realMaterielList.value.length; i++) {
        let currentIdMateriel = realMaterielList.value[i].idMateriel;
        let index = theoryMaterielList.value.findIndex(item => item.idMateriel === currentIdMateriel);

        let nbVsav = parseInt(theoryMaterielList.value[index].nbVSAV);
        let nbReserve = parseInt(theoryMaterielList.value[index].nbReserve);

        let delta = (nbVsav + nbReserve) - parseInt(realMaterielList.value[i].realCount);

        if (currentIdMateriel === 'comp10' || currentIdMateriel === 'dosiseptine10' || currentIdMateriel === "vomix"){
            if (currentIdMateriel === 'comp10'){
            delta = Math.floor((delta * 11)/50);
            } else {
                delta = Math.floor((delta * 11)/20);
            }
        }


        if (delta > 0){
            if (delta < 2) {
                commande.value.push({quantity: 1, nomCommande: theoryMaterielList.value[index].nomCommandeSingulier, idMateriel: theoryMaterielList.value[index].idMateriel});
            } else {
                commande.value.push({quantity: delta, nomCommande: theoryMaterielList.value[index].nomCommandePluriel, idMateriel: theoryMaterielList.value[index].idMateriel});
            }
        }
        theoryMaterielList.value.splice(index, 1);
    }
    for (let i = 0; i < theoryMaterielList.value.length; i++) {
        let nbVsav = parseInt(theoryMaterielList.value[i].nbVSAV);
        let nbReserve = parseInt(theoryMaterielList.value[i].nbReserve);
        let currentIdMateriel = theoryMaterielList.value[i].idMateriel;
        let delta = nbVsav + nbReserve;
        
        if (currentIdMateriel === 'comp10' || currentIdMateriel === 'dosiseptine10'){
            if (currentIdMateriel === 'comp10'){
            delta = Math.floor((delta * 11)/50);
            } else {
                delta = Math.floor((delta * 5.5)/20);
            }
        }
        if (delta > 0){
            if (delta < 2) {
                    commande.value.push({quantity: 1, nomCommande: theoryMaterielList.value[i].nomCommandeSingulier, idMateriel: theoryMaterielList.value[i].idMateriel});
                } else {
                    commande.value.push({quantity: delta, nomCommande: theoryMaterielList.value[i].nomCommandePluriel, idMateriel: theoryMaterielList.value[i].idMateriel});
                }
        }
    }
}
const modifyCommande = () => {
    loading.play();
    let index = commande.value.findIndex(item => item.idMateriel === selectedMaterielOperation.value.idMateriel);
    if (index === -1){
        commande.value.push({quantity: operationNumber.value, nomCommande: selectedMaterielOperation.value.nomCommandePluriel, idMateriel: selectedMaterielOperation.value.idMateriel});
    } else {
        if (ADDorSUB.value){
            commande.value[index].quantity += operationNumber.value;
        } else {
            commande.value[index].quantity -= operationNumber.value;
            if (commande.value[index].quantity < 1){
                commande.value.splice(index, 1);
            }
        }
    }
}
const copyContent = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
const ValidateOrder = async () => {
    validationSound.play();
    let rows = [];
for (let i = 0; i < commande.value.length; i++) {
    rows.push(commande.value[i].quantity + " x " + commande.value[i].nomCommande);
} 
let rowsString = rows.join("\n");
await copyContent(rowsString);
let object = 'Nouvelle commande'
let intro = `Bonjour, \n Merci de prendre en compte la commande suivante : \n`;
let outro = `\n Cordialement, \n `;
let mail = intro + `\n\n<<<Inclure le contenu du presse papier ici>>>\n\n`+ outro;
let mailURL = encodeURIComponent(mail);
window.location.href = `mailto:lena.palermo@sdmis.fr?subject=${encodeURIComponent(object)}&body=${mailURL}`;
    
}

</script>
<style scoped>
#formOrder{
    margin-top: 2rem;
    background-color: #f6f6f6;
    padding: 1rem;
    border-radius: 30px;
}
.question{
    margin-bottom: 0.5rem;
    margin-top: 1rem;
    font-size: 16px;
    display: flex;

}
.question > .questionText {
    margin-left: 1rem;
}
#IntroText {
    margin-bottom: 1rem;
    color: #666666;
    font-size: 14px;

}
.selector > div{
    background-color: #f4f6ff;
    padding: 5px;
}
#notCounted{
    margin-top: 1rem;
    width: 100%;
    font-size: 14px;
}
.additionnalInfoDiv{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    width: 90%;
    padding-bottom: 2rem;
    max-width: 400px;
    border-radius: 35px;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    padding: 2.5rem;
    z-index: 1;
}
.importantInfo{
    font-size: 18px;
}
#archiver{
margin-top: 2rem;
  color: #f60700;
  font-size: 16px;
  text-align: center;
}
#archiver:hover{
    cursor: pointer;
    background-color: #fff4f4;
    color: #f60700;
    transition: background-color 0.3s ease;
    border-radius: 35px;
}
.validation-error {
    background-color: #fff4f4;
    color: #ce0500;
    border-radius: 5px;
    text-align: center;
    max-width: 100%;
}
#archivage{
    background-color: #fff4f3;
    color: #d64d00;
}
#filter{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100dvh;
  -webkit-filter: blur(5px);
  -moz-filter: blur(5px);
  -o-filter: blur(5px);
  -ms-filter: blur(5px);
  filter: blur(5px);
  backdrop-filter: brightness(0.90) blur(5px);
  z-index: 0;
}
.commande{
    width: 100%;
    min-height: 30dvh;
    max-height: 40dvh;
    overflow-y: auto;
}

.commande::-webkit-scrollbar {
  display: none;
}


.commande::-webkit-scrollbar {
  -ms-overflow-style: none;  
  scrollbar-width: none; 
}
.commandeContainer{
    padding: 2rem;
    background-color: #eeeeee;
    border-radius: 30px;
    color: #666666;
}

#commandeOperations{
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 1rem;


}
#materielsList{
    width: 100%;
    margin-top: 1rem;
}
#materiel{
    width: 100%;
    margin: auto;
    margin-top: 1rem;
}
#commandeOperations{
    background-color: #f6f6f6;
    border-radius: 25px;
}

#modifierBtn{
    margin-top: 1rem;
    margin-bottom: 1rem;
}
#validation{
    margin-bottom: 2rem;
}
#animation{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
}
#notCountedSelector{
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
}
</style>