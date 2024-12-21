<template>
    <div class="subtitle">
        Simulation d'un ordre de départ
    </div>
    <div class="full" v-if="verifyIfPhone()">
        <useComputer></useComputer>
    </div>
    <div  v-else>
        <div class="consigne">
                    <span class="number" id="premiereConsigne">1</span>
                    J'indique les <span class="TextHighlight">informations de base</span> de l'intervention simulée.
                </div>
                <div class="consigne">
                    <span  class="number" id="deuxiemeConsigne">2</span>
                    Je sélectionne les <span class="TextHighlight">groupes fonctionnels (GFO)</span> que je souhaite.
                </div>
                <div class="consigne">
                    <span class="number" id="troisiemeConsigne">3</span>
                    Je sélectionne les <span class="TextHighlight">agents de la caserne</span> que j'intègre dans la manœuvre en réalisant une affectation manuelle ou (semi)automatique.
                </div>
                <div class="consigne">
                    <span class="number" id="quatriemeConsigne">4</span>
                    J'ajoute les <span class="TextHighlight">agents extérieurs</span> que j'intègre dans la manœuvre en réalisant une affectation manuelle.
                </div>
            <div class="asupButton" @click="showApp = true">
        <div><img src="@/assets/icons/asup.svg" width="50" height="auto" ></div>
        <div>Accéder à l'application</div>
    </div>
    </div>

    <div class="fullView" v-if="showApp" >
        <div class="return">
                <div class="returnBtn" @click="showApp = false">Fermer</div>
        </div>
        <div class="subtitle titleApp">
        Simulation d'un ordre de départ
        </div>
        <div class="logoApp">
            <img src="@/assets/logoTitle.png" width="200px" height="auto" >
        </div>
        <div v-if="step == 1">
            <div class="subtitle">
                Informations de base
            </div>
            <div class="subsubtitle">
                Date et heure de l'intervention
            </div>
            <div class="formElement">
                <Calendar id="datepicker-24h" v-model="timeDateInter" showTime showSeconds hourFormat="24" fluid :disabled="!manualHour"/>
                <div class="flex items-center gap-2">
                <Checkbox v-model="manualHour" inputId="ingredient1" name="dateModify" value="false" :disabled="manualHour" />
                    <label for="ingredient1"> Modifier la date </label>
                </div>
            </div>
            <div class="subsubtitle">
                    Lieu de l'intervention
            </div>
            <div class="formElement">
                <AutoComplete v-model="selectedCity" :suggestions="filteredCities" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Hint: type 'a'">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
            </div>
            <div class="subsubtitle">
                    Sélection de la raison de l'intervention
            </div>
            <div class="formElement">
                <Dropdown v-model="selectedSinistre" :options="sinistres" optionLabel="label" editable optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélectionner un sinistre" class="w-full md:w-14rem">
                    <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        <div>{{ slotProps.option.label }}</div>
                    </div>
                    </template>
                </Dropdown>
            </div>
        </div>

    </div>
</template>

<script setup>
import useComputer from '../components/useComputer.vue';
import { useSqlStore } from "@/stores/database.js";
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import AutoComplete from 'primevue/autocomplete';
import { ref } from "vue";

const verifyIfPhone = () => {
    console.log(window.innerWidth);
    return window.innerWidth < 768;
}
const showApp = ref(false);
const step = ref(1);
const manualHour = ref(false);
const timeDateInter = ref(new Date());
const sinistres = ref([]);
const selectedSinistre = ref();

const sqlStore = useSqlStore();

async function getSinistres(){
    await sqlStore.getListSinistres();
    sinistres.value = await sqlStore.listSinistres;
}

getSinistres();

let timeDateInterInterval = setInterval(() => {
    if (!manualHour.value){
    timeDateInter.value = new Date();
    } else {
        clearInterval(timeDateInterInterval);
    }
}, 1000);


</script>

<style scoped>
.full {
    width: 100%;
}
.fullView {
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    top:0;
    left: 0;
}
.asupButton:hover{
    background-color: #e0e0e0;
}
.return{
    position: fixed;
    top: 1rem;
    left: 1rem;
    cursor: pointer;
    background-color: #f0f0f0;
    padding: 0.5rem;
    border-radius: 30px;
    display: flex;
    
}
.titleApp{
    position: fixed;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
}
.logoApp{
    position: fixed;
    top: 1rem;
    right: 1rem;
}
.return:hover{
    background-color: #e0e0e0;
}
.consigne{
    color: #666666;
    text-align: justify;
    margin-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
    font-size: 0.8rem;
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
    font-size: 14px;
}
.TextHighlight{
    color: #0078f3;
    font-weight: bold;
    font-size: 0.8rem;
}
.formElement{
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.formElement > div{
    margin-left: 1rem;
}
</style>