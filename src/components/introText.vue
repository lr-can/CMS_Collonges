<template>
    <p>
        Bienvenue sur l'application de la gestion de la cellule médico-secouriste.
    </p>
<div class="subsubtitle">
    Etat de la base de données
</div>
  <div class="display">
    <div class="total">
        <span class="number">{{ displayPeremptions.nbTotal }}</span> produits
    </div>
    <div class="lots">
        <span class="number">{{ displayPeremptions.nbLotsTotal }}</span>
        <br> lots
    </div>
    <div class="reserve">
        <span class="number">{{ displayPeremptions.nbReserve }}</span>
        <br> en réserve
    </div>
    <div class="vsav">
        <span class="number">{{ displayPeremptions.nbVSAV }}</span>
        <br> à disposition
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const displayPeremptions = ref({});
const sqlStore = useSqlStore();

async function getDisplayData(){
    await sqlStore.getPeremptionDisplay();
    displayPeremptions.value = await sqlStore.PeremptionsDisplayData;
}

getDisplayData();

</script>
<style>
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
.display > div{
    border-radius: 10px;
}
.total{
    grid-area: total;
    background-color: #f4f6ff;
    color: #0063cb;
    padding: 5px;

}
.lots{
    grid-area: lots;
    background-color: #fef4f4;
    color: #e1000f;
    padding: 10px;
    padding-top: 5vh;
    padding-bottom: 5vh;
}
.reserve{
    grid-area: reserve;
    background-color: #f6f6f6;
    color: #666666;
    padding: 5px;
}
.vsav{
    grid-area: vsav;
    background-color: #f6f6f6;
    color: #666666;
    padding: 5px;
}
</style>