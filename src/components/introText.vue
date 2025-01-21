<template>
    <p>
        Bienvenue sur l'application de la gestion de la cellule médico-secouriste.
    </p>
<div class="subsubtitle">
    Etat de la base de données
</div>
  <div class="display">
    <div class="total" @click="redirectToSearch()">
        <span class="number">{{ displayPeremptions.nbTotal }}</span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading"> {{ labels[0] }}
    </div>
    <div class="Lots" @click="redirectToSearch()" :class="colorLots()">
        <span class="number">{{ displayPeremptions.nbLotsTotal }}<img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading"></span>
        <br> {{ labels[1] }}
    </div>
    <div class="reserve" @click="redirectToSearch()">
        <span class="number">{{ displayPeremptions.nbReserve }}<img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading"></span>
        <br> {{ labels[2] }}
    </div>
    <div class="vsav" @click="redirectToSearch()" :class="colorVSAV()">
        <span class="number">{{ displayPeremptions.nbVSAV }}<img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading"></span>
        <br> {{ labels[3] }}
    </div>
  </div>
  <div v-if="profileIsFormation()" class="btnGSheet">
    <gSheetBtn></gSheetBtn>
  </div>
</template>
<script setup>
import { ref } from 'vue'; 
import { useRouter } from 'vue-router';
import { useSqlStore } from "@/stores/database.js";
import gSheetBtn from './gSheetBtn.vue';

const props = defineProps(['profile'])

const displayPeremptions = ref({});
const sqlStore = useSqlStore();
const notLoading = ref(true);

async function getDisplayData(){
    if (props.profile === 'asup') {
        await sqlStore.getPeremptionDisplayAsup();
        displayPeremptions.value = await sqlStore.PeremptionsDisplayDataAsup;
    } else if (props.profile === 'formation') {
        await sqlStore.getPeremptionDisplayFormation();
        displayPeremptions.value = await sqlStore.PeremptionsDisplayDataFormation;
    } else {
    await sqlStore.getPeremptionDisplay();
    displayPeremptions.value = await sqlStore.PeremptionsDisplayData;
    }
    notLoading.value = false;
}

const $router = useRouter();

const labels = ref([]);

const profileIsFormation = () => {
    if (props.profile === 'formation'){
        return true;
    }
    return false;
}

if (props.profile === 'asup') {
    labels.value = ['médicaments', 'Déclarations ASUP', 'à disposition', 'en remplacement'];
} else if (props.profile === 'formation') {
    labels.value = ['Agents', 'Agents recyclés', 'Sans ICP', 'Non recyclés'];
} else {
    labels.value = ['médicaments', 'Lots différents', 'Reserve pharmacie', 'Disponible VSAV'];
}

const colorLots = () => {
    if (props.profile === 'asup' || props.profile === 'formation') {
        return 'greenLot';
    } else {
        return 'redLots';
    }
}

const colorVSAV = () => {
    if (props.profile === 'asup' || props.profile === 'formation') {
        return 'orangeVsav';
    } else {
        return '';
    }
}

const redirectToSearch = () => {
    if (props.profile === 'asup') {
        $router.push({ path: 'reportAsup' });
    } else {
        $router.push({ path: 'search' });
    }
}

getDisplayData();

</script>
<style>
.btnGSheet {
    margin-top: 3rem;
}
p{
    margin-top: 10px
}
.number{
    font-size: 2rem;
    font-weight: bold;
}
.display{
    margin-top: 20px;
    margin-left: 20px;
    display: grid;
    grid-template-areas: 
    'total total lots'
    'reserve vsav lots';
    column-gap: 5px;
    row-gap: 3px;
    align-content: space-evenly;
    align-items: center;
    text-align: center;
}
@media (max-width: 1024px) {
    .display{
        transform: translateX(-10%);
    }
    
}

.display > div{
    border-radius: 10px;
}
.total{
    grid-area: total;
    background-color: #f4f6ff;
    color: #0063cb;
    padding: 5px;
    transition: background-color 0.3s ease-in-out;
}
.total:hover{
    background-color: #d6deff;
    cursor: pointer;
}
.lots{
    padding: 2rem;
    padding-top: 5vh;
    padding-bottom: 5vh;
    transition: background-color 0.3s ease-in-out;
}
.redLots{
    padding: 1rem;
    padding-top: 5vh;
    padding-bottom: 5vh;
    transition: background-color 0.3s ease-in-out;
    grid-area: lots;
    background-color: #fef4f4;
    color: #e1000f;
}

.greenLot{
    padding: 1rem;
    padding-top: 5vh;
    padding-bottom: 5vh;
    transition: background-color 0.3s ease-in-out;
    grid-area: lots;
    background-color: #dffee6;
    color: #1f8d49;
}
.greenLot:hover{
    background-color: #8afcab;
    cursor: pointer;
}

.redlots:hover{
    background-color: #8afcab;
    cursor: pointer;
}
.reserve{
    grid-area: reserve;
    background-color: #f6f6f6;
    color: #666666;
    padding: 5px;
    transition: background-color 0.3s ease-in-out;
}
.reserve:hover{
    background-color: #ededed;
    cursor: pointer;
}
.vsav{
    grid-area: vsav;
    background-color: #f6f6f6;
    color: #666666;
    padding: 5px;
    transition: background-color 0.3s ease-in-out;
}
.vsav:hover{
    background-color: #ededed;
    cursor: pointer;
}
.orangeVsav{
    grid-area: vsav;
    background-color: #fff4f3;
    color: #d64d00;
    padding: 5px;
    transition: background-color 0.3s ease-in-out;
}
.orangeVsav:hover{
    background-color: #ffd7d3;
    cursor: pointer;
}
</style>