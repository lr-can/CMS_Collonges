<template>
    <div class="title">
        Prochaines péremptions
    </div>
    <div v-for="row in NextPeremptions" :key="row.numeroLot" class="prochain-peremption">
        <div class="expirant" :class="giveClass(row.datePeremption)" @click="getSummary(row.numLot)">
            <div class="materiel">{{ row.nomMateriel }}</div>
            <div class="lot">Lot {{ row.numLot }}</div>
        </div>
        <div class="peremption" :class="giveClassBis(row.datePeremption)">{{ prettyDate(row.datePeremption) }}</div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const sqlStore = useSqlStore();
const NextPeremptions = ref([]);

async function getNextExpiration(){
    await sqlStore.getNextPeremptions();
    NextPeremptions.value = await sqlStore.NextPeremptions;
}
const prettyDate = (date) => {
    const today = new Date();
    const expirationDate = new Date(date);
    const timeDelta = expirationDate.getTime() - today.getTime();
    const daysDelta = Math.floor(timeDelta / (1000 * 60 * 60 * 24));
    const weeksDelta = Math.floor(daysDelta / 7);
    const monthsDelta = Math.floor(daysDelta / 30);

    if (daysDelta < 0) {
        if (daysDelta == -1) {
            return "Hier";
        } else {
            let absDaysDelta = Math.abs(daysDelta);
            return '+' + absDaysDelta + ' j.';
        }
    } else if (daysDelta == 0) {
        return 'Auj.'; 
    } else if (daysDelta == 1) {
        return 'Demain';
    } else if (daysDelta < 7) {
        return daysDelta + ' jours';
    } else if (daysDelta < 30) {
        return weeksDelta + ' sem.';
    } else {
        return monthsDelta + ' mois';
    }
}
const giveClass = (date) => {
    const today = new Date();
    const expirationDate = new Date(date);
    const timeDelta = expirationDate.getTime() - today.getTime();
    const daysDelta = Math.floor(timeDelta / (1000 * 60 * 60 * 24));

    if (daysDelta <= 0) {
        return 'over';
    } else if (daysDelta < 7) {
        return 'days';
    } else if (daysDelta < 30) {
        return 'weeks';
    } else {
        return 'months';
    }
}
const giveClassBis = (date) => {
    const today = new Date();
    const expirationDate = new Date(date);
    const timeDelta = expirationDate.getTime() - today.getTime();
    const daysDelta = Math.floor(timeDelta / (1000 * 60 * 60 * 24));

    if (daysDelta <= 0) {
        return 'over_date';
    }
    if (daysDelta < 7) {
        return 'days_date';
    } else if (daysDelta < 30) {
        return 'weeks_date';
    } else {
        return 'months_date';
    }
}

const getSummary = (numLot) => {
    console.log(numLot);
}

getNextExpiration();
</script>
<style>
.prochain-peremption {
        display: grid;
        grid-template-areas: 
        'materiel materiel materiel peremption'
        'lot lot lot peremption';
        column-gap: 5px;
        row-gap: 10px;
        margin-left: 0;
}

.lot{
    grid-area: lot;
    font-size: 80%;
    margin-right: 30px;
}
.peremption{
    grid-area: peremption;
    width: 20vw;
    text-align: left;
    padding-top: 20%;
    font-size: 120%;
    font-weight: bold;
}

.materiel{
    grid-area: materiel;
    font-size: 100%;
    width: 60vw;
}

@media (min-width: 1024px) {
 .materiel{
    width: 15vw;
    }
    .peremption{
        width: 5vw;
    }
}
.over{
    background-color: #000000;
    color: white;
}
.days{
    background-color: #f60700;
    color: white;
}
.weeks{
    background-color: #fc5d00;
    color: white;
}
.months{
    background-color: #FFCA00;
    color: white;
}
.expirant{
    padding: 3%;
    border-radius: 10px;
    opacity: 0.95;
}
.over_date{
    color: #000000;
}
.days_date{
    color: #f60700;
}
.weeks_date{
    color: #fc5d00;
}
.months_date{
    color: #FFCA00;
}
</style>