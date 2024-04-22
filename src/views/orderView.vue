<template>
    <div class="subtitle">
       Création d'une commande
    </div>
    <div>
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
            <div class="question" v-if="notCountedItems">
                <div class="questionText" id="notCounted">Sélectionnez le matériel à inclure : </div>
                <SelectButton class="selector" v-model="notCountedList" :options="optionsMatNotCounted" optionLabel="shortname" multiple aria-labelledby="multiple" />
            </div>
            <div class="validationBtn" @click="submitForm">Créer la commande</div>
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
</template>

<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import SelectButton from 'primevue/selectbutton';
import InputSwitch from 'primevue/inputswitch';


const sqlStore = useSqlStore();

const additionnalInfo = ref(false);
const theoryMaterielList = ref([]);
const realMaterielList = ref([]);
const commanding = ref(true);
const nombreMaterielPeremption = ref();
const archiving = ref(false);
const prochainesPeremptions = ref(true);
const missingMateriel = ref(true);
const notCountedItems = ref(false);
const notCountedList = ref();
const archived = ref();
const commande = ref([]);
const optionsMatNotCounted = ref([
    {shortname: 'Aiguilles', fullname: '1 × Aiguilles autopiques (boîte)'},
    {shortname: 'Protections thermomètres', fullname: '50 × protection pour thermomètre'},
    {shortname: 'Chiffons', fullname: '1 × chiffons d\'essuyage à usage unique (carton)'},
    {shortname: 'Draps', fullname: '1 × draps à usage unique (carton)'},
    {shortname: 'Piles AAA', fullname: '1 × boîte de piles AAA'},
    {shortname: 'Piles plates', fullname: '1 × boîte de piles plates'},
])

async function submitForm() {
    if(prochainesPeremptions.value){
        additionnalInfo.value = true;
        await sqlStore.getOneMonthPeremption();
        nombreMaterielPeremption.value = sqlStore.oneMonthPeremption;
    }
    if (notCountedItems.value){
        getUnCountedItems();
    }
    await getTheoryCount();
    await getRealCount();
    getDelta();
    console.log(commande.value);
}

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function archiverMateriel() {
    archiving.value = true;
    await sqlStore.archivePeremption();
    archived.value = await sqlStore.archivagePeremptionResponse;
    await timeout(2000);
    additionnalInfo.value = false;
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
        if (delta > 0){
            commande.value.push(delta + ' × ' + theoryMaterielList.value[index].nomMateriel.replace('(lot de 10)', ''));
        }
        theoryMaterielList.value.splice(index, 1);
    }
    for (let i = 0; i < theoryMaterielList.value.length; i++) {
        let nbVsav = parseInt(theoryMaterielList.value[i].nbVSAV);
        let nbReserve = parseInt(theoryMaterielList.value[i].nbReserve);
        let delta = nbVsav + nbReserve;
        commande.value.push(delta + ' × ' + theoryMaterielList.value[i].nomMateriel.replace('(lot de 10)', ''));
    }
}
</script>
<style>
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
.p-inputswitch-slider::before{
    top: 20%;
}
.p-selectbutton .p-button.p-highlight{
    background-color: #f4f6ff;
    color: #0078f3;
}
.p-selectbutton{
    width: 100%;
    display: grid;
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
  backdrop-filter: blur(5px);
  z-index: 0;
}
</style>