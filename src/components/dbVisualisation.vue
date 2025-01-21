<template>
<div id="filter" v-if="additionnalInfo" @click="additionnalInfo = false"></div>
<div v-if="additionnalInfo" class="additionnalInfoDiv">
    <div class="return">
        <div class="returnBtn" @click="additionnalInfo = false">Retour</div>
    </div>
    <div class="titre4">Informations supplémentaires</div>
    <div>
        <div class="moreInfo">
            <div>Code matériel : {{ props.materiel.idMateriel }}</div>
            <div>Nom matériel : {{ props.materiel.nomMateriel }}</div>
            <div>Nombre VSAV théorique : {{ props.materiel.nbVSAV }}</div>
            <div>Nombre en réserve théorique : {{ props.materiel.nbReserve }}</div>
            <div>Nombre total théorique : {{ props.materiel.nbVSAV + props.materiel.nbReserve }}</div>
        </div>
        <div class="titre4" id="beforeTable">Compte par agent</div>
        <div class="table">
            <div class="table-row" id="headerRow">
                <div class="table-cell">Nom de l'agent</div>
                <div class="table-cell">Réserve</div>
                <div class="table-cell">VSAV</div>
                <div class="table-cell">Total</div>
            </div>
            <div class="table-row" v-for="row in materielsInfo.compteParAgent" :key="row.idAgent">
                <div class="table-cell"><span class="nomAgent">{{ row.gradeAbbrAgent }} {{ row.nomAgent }}</span></div>
                <div class="table-cell figure">{{ row.reserveCount }}</div>
                <div class="table-cell figure">{{ row.vsavCount }}</div>
                <div class="table-cell figure">{{ row.totalCount }}</div>
            </div>
            <div class="table-row" id="headerRow">
                <div class="table-cell">Total :</div>
                <div class="table-cell figure">{{ reserveCount }}</div>
                <div class="table-cell figure">{{ vsavCount }}</div>
                <div class="table-cell figure">{{ totalCount }}</div>
            </div>
        </div>
    </div>
</div>   
<div class="container">
    <div class="subsubtitle" id="materielTitle">{{ props.materiel.nomMateriel }}</div>
    <div class="subContainer" id="countDiv" @click="additionnalInfo = true">
        <div class="titre4">Nombre</div>
        <div>Disponible VSAV :
            <span v-if="!notLoading">{{ vsavCount }}</span>
            <span :class="vsavCountDelta" v-if="!notLoading">{{ vsavDeltaText }}</span>
            <img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading">
        </div>
        <div>Reserve :
            <span v-if="!notLoading">{{ reserveCount }}</span>
            <span :class="reserveCountDelta" v-if="!notLoading">{{ reserveDeltaText }}</span>
            <img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading">
        </div>
        <div>Total :
            <span v-if="!notLoading">{{ totalCount }}</span>
            <span :class="totalCountDelta" v-if="!notLoading">{{ totalDeltaText }}</span>
            <img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading">
        </div>
    </div>
    <div class="subContainer">
        <div class="titre4">Lots</div>
        <div>
            <img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="notLoading">
            <div v-if="!notLoading">
                <div v-for="lot in materielsInfo.isolationLot" :key="lot.idLot">
                    <div>Lot {{ lot.numLot }} : <br> <span class="lotInfo">  {{ lot.nombreProduits }} {{ formattedProduit(lot.nombreProduits) }} - {{ formatedDate(lot.datePeremption) }} </span></div>
                </div>
                <div v-if="materielsInfo.isolationLot.length === 0">Aucun lot n'est présent dans la base de données.</div>
            </div>
        </div>
    </div>
</div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const sqlStore = useSqlStore();
const props = defineProps(['materiel'])
const materielsInfo = ref();
const vsavCount = ref();
const reserveCount = ref();
const totalCount = ref();
const notLoading = ref(true);
const vsavCountDelta = ref();
const reserveCountDelta = ref();
const totalCountDelta = ref();
const vsavDelta = ref();
const reserveDelta = ref();
const totalDelta = ref();
const vsavDeltaText = ref();
const reserveDeltaText = ref();
const totalDeltaText = ref();
const additionnalInfo = ref(false);

async function getDbData(){
    notLoading.value = true;
    console.log(props.materiel);
    await sqlStore.dbVision(props.materiel.idMateriel);
    materielsInfo.value = await sqlStore.dbVisionData;
    notLoading.value = false;
    insertData();
    console.log(materielsInfo.value);
}
const insertData = () =>{
    vsavCount.value = materielsInfo.value.compteTotal[0].vsavCount;
    reserveCount.value = materielsInfo.value.compteTotal[0].reserveCount;
    totalCount.value = materielsInfo.value.compteTotal[0].totalCount;
    vsavDelta.value = vsavCount.value - props.materiel.nbVSAV;
    reserveDelta.value = reserveCount.value - props.materiel.nbReserve;
    totalDelta.value = totalCount.value - (props.materiel.nbVSAV + props.materiel.nbReserve);
    vsavCountDelta.value = giveState(vsavDelta.value);
    reserveCountDelta.value = giveState(reserveDelta.value);
    totalCountDelta.value = giveState(totalDelta.value);
    vsavDeltaText.value = vsavCountDelta.value + " " + Math.abs(vsavDelta.value).toString().replace('0', '');
    reserveDeltaText.value = reserveCountDelta.value + " " + Math.abs(reserveDelta.value).toString().replace('0', '');
    totalDeltaText.value = totalCountDelta.value + " " + Math.abs(totalDelta.value).toString().replace('0', ' ');
    
}
const giveState = (delta) =>{
    if(delta > 0){
        return "Surplus";
    } else if (delta < 0){
        return "Manque";
    } else {
        return "OK";
    }
}
const formatedDate = (date) =>{
    return new Date(date).toLocaleDateString();
}
const formattedProduit = (nb) =>{
    if(nb > 1){
        return "produits";
    } else {
        return "produit";
    }
}
getDbData();
</script>
<style scoped>
    .container{
        margin: 0 auto;
        margin-top: 2rem;
        width: 100%;
        border-radius: 35px;
        background-color: #eeeeee;
        padding-left: 5px;
        padding-right: 5px;
        padding-top: 2px;
        padding-bottom: 5px;
    }
    #materielTitle{
        text-align: left;
        margin-left: 20px;
        font-size: 1.3rem;
        font-weight: 500;
    }
    .subContainer{
        width: 95%;
        margin: 0 auto;
        padding: 9px;
        background-color: white;
        border-radius: 20px;
        line-height: 2rem;
        margin-bottom: 10px;
        font-size: 14px;
    }
    .subContainer:nth-child(3){
        font-size: 14px;
        line-height: 1.5rem;
    }
    .titre4{
        font-weight: bold;
        font-size: 18px;

    }
    .Manque{
        color: #f60700;
        background-color: #fff4f4;
        border-radius: 5px;
        padding: 5px;
        margin-left: 2%;
    }
    .Surplus{
        color: #0078f3;
        background-color: #f4f6ff;
        border-radius: 5px;
        padding: 5px;
        margin-left: 2%;
    }
    .OK{
        color: #1f8d49;
        background-color: #dffee6;
        border-radius: 5px;
        padding: 5px;
        margin-left: 2%;
    }
    .lotInfo{
        color: #666666;
        margin-left: 10%
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
#beforeTable{
    margin-top: 2rem;
}
#headerRow > div{
    font-weight: bold;
    color: #666666;
}
#countDiv:hover{
    cursor: pointer;
}
.table{
    display: table;
    table-layout: fixed;
    
}
.table-row{
    display: table-row;
}

.table-cell{
    display: table-cell;
    padding: 5px;
    border-bottom: 1px solid #eeeeee;
}
.moreInfo{
    font-size: 12px;
    color: #666666;
}
.nomAgent{
    font-size: 13px;
}
#countDiv:hover{
    background-image: linear-gradient(to right bottom,  #ffff 5%, #eeeeee 80%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
    color: #666666;
    transition: 0.3s ease;
}
</style>