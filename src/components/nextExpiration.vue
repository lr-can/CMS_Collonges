<template>
    <div class="subsubtitle" @click="clicking()" id="prochainePeremption">
        <span id="toggle">
          <img src="@/assets/illustrations/arrow.svg" alt="" width="14px" height="auto" :class="isClicked()"></span>
        Prochaines péremptions
        <Transition>
            <span id="notification" v-show="blinking">
            <img :src="notificationSource" alt="" width="25px" height="auto" >
            </span>
        </Transition>
      </div>
      <Transition>
        <div class="Expiration" v-show="showExpiration">
            <div v-if="NextPeremptions.length > 0" @click="props.profile == 'pharmacie' ? $router.push('/peremptions') : ''" :style="props.profile == 'pharmacie' ? {cursor:'pointer'} : {cursor: 'not-allowed'}">
        <div v-for="row in NextPeremptions" :key="row.numeroLot" class="prochain-peremption">
            <div class="expirant" :class="giveClass(row.datePeremption)" @click="getSummary(row.numLot)">
                <div class="materiel">{{ row.nomMateriel }}</div>
                <div class="lot">Lot {{ row.numLot }}</div>
            </div>
            <div class="peremption" :class="giveClassBis(row.datePeremption)">{{ prettyDate(row.datePeremption) }}</div>
        </div>
    </div>
    <div v-else>
        <div class="expirant">
            <div cl ass="materiel OK">Aucune péremption à signaler dans les 6 prochains mois</div>
        </div>
    </div>
        </div>
    </Transition>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const sqlStore = useSqlStore();
const NextPeremptions = ref([]);
const showExpiration = ref(false);
const notificationSource = ref("");
const blinking = ref(true);
const props = defineProps(["profile"])

async function getNextExpiration(){
    if (props.profile === 'asup'){
        await sqlStore.getNextPeremptionsAsup();
        NextPeremptions.value = await sqlStore.NextPeremptionsAsup;
    } else {
    await sqlStore.getNextPeremptions();
    NextPeremptions.value = await sqlStore.NextPeremptions;
    }
    getImgSource();
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

    if (props.profile === 'asup'){
        if (daysDelta <= 60) {
            return 'over';
        } else if (daysDelta < 90) {
            return 'days';
        } else if (daysDelta < 100) {
            return 'weeks';
        } else {
            return 'months';
        }
    } else if (daysDelta <= 30) {
        return 'over';
    } else if (daysDelta < 60) {
        return 'days';
    } else if (daysDelta < 90) {
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

    if (props.profile === 'asup'){
        if (daysDelta <= 60) {
            return 'over_date';
        } else if (daysDelta < 90) {
            return 'days_date';
        } else if (daysDelta < 100) {
            return 'weeks_date';
        } else {
            return 'months_date';
        }
    } else if (daysDelta <= 30) {
        return 'over_date';
    }
    if (daysDelta < 60) {
        return 'days_date';
    } else if (daysDelta < 90) {
        return 'weeks_date';
    } else {
        return 'months_date';
    }
}

const getSummary = (numLot) => {
    console.log(numLot);
}

getNextExpiration();

const clicking = () => {
  showExpiration.value = !showExpiration.value;
}

const isClicked  = ()=> {
  if (showExpiration.value == true){
    return "clicked"
  }
  else{
    return "notClicked"
  }
}
const getImgSource = () => {
    if (NextPeremptions.value.length == 0){
        notificationSource.value = "https://raw.githubusercontent.com/lr-can/CMS_Collonges/5a344a95117201da949fe971432b9d59b57a0b20/src/assets/illustrations/ok.svg";
    } else {
        let closestExpiration = NextPeremptions.value[0].datePeremption;
        const closestExpirationClass = giveClass(closestExpiration);
        const base_URL = 'https://raw.githubusercontent.com/lr-can/CMS_Collonges/5a344a95117201da949fe971432b9d59b57a0b20/src/assets/illustrations/'
        if (closestExpirationClass == 'over'){
            notificationSource.value = base_URL+"warning.svg";
        } else if (closestExpirationClass == 'days'){
            notificationSource.value = base_URL+"beware.svg";
        } else if (closestExpirationClass == 'weeks'){
            notificationSource.value = base_URL+"attention.svg";
        } else {
            notificationSource.value = base_URL+"takecare.svg";
        }
        showExpiration.value = true;
}
}
setInterval(() => {
    blinking.value = !blinking.value;
}, 1000);

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
    color: #e1000f;
    background-color: #fff4f4;
}
.days{
    color: #fc5d00;
    background-color: #fff4f3;

}
.weeks{
    color: #C3992A;
    background-color: #fef5e8;
}
.months{
    color: #666666;
    background-color: #f6f6f6;
}
.expirant{
    padding: 3%;
    border-radius: 10px;
    opacity: 0.95;
}
.over_date{
    color: #e1000f;
}
.days_date{
    color: #fc5d00;
}
.weeks_date{
    color: #C3992A;
}
.months_date{
    color: #666666;
}
.OK{
    color: #1f8d49;
    background-color: #dffee6;
    padding: 10px;
    width: 100%;
    border-radius: 10px;
}
#toggle{
  vertical-align: middle;
}
.clicked{
  transform: rotate(90deg);
  transition: transform 0.3s ease-in-out;
}

.notClicked{
  transform: rotate(0deg);
  transition: transform 0.3s ease-in-out;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
#prochainePeremption{
    margin-top: 20px;
}
#notification{
    position: absolute;
    margin-left: 5px;
    
}
</style>