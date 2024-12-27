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
        <div id="mapid" v-if="selectedAddress != ''">
                <img :src="mapSource"
                width="300px" height="300px"/>
        </div>
        <div v-if="step == 1" id="appStep1">
            <div id="layoutMargin"></div>
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
                <AutoComplete v-model="selectedAddress" :suggestions="searchedAddress" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress" class="arrow-button" :class="isLoading" v-if="!showAddress && typeof(selectedAddress) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
            </div>
            <div v-if="showAddress">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoie" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommune" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivre" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonnees" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erp" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtage" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatiment" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>  
            <div v-if="showAddress" class="subsubtitle">
                PRV, PRI, PRM
            </div>
            <div v-if="showAddress" id="prvField">
                <div class="flex items-center gap-2">
                <Checkbox v-model="prvCondition" inputId="prv" name="dateModify" value="false" :disabled="prvCondition" />
                    <label for="prv">Ajouter un PRV </label>
                </div>
                <div class="formElement" v-if="prvCondition">
                <AutoComplete v-model="selectedAddressPRV" :suggestions="searchedAddressPRV" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress3">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress3" class="arrow-button" :class="isLoading" v-if="!showAddress3 && typeof(selectedAddressPRV) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
                </div>
                <div v-if="showAddress3">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoiePRV" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress3">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommunePRV" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress3" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivrePRV" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonneesPRV" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress3">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erpPRV" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress3" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtagePRV" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatimentPRV" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>
            </div>
            <div v-if="showAddress" id="priField">
                <div class="flex items-center gap-2">
                <Checkbox v-model="priCondition" inputId="pri" name="dateModify" value="false" :disabled="priCondition" />
                    <label for="pri">Ajouter un PRI </label>
                </div>
                <div class="formElement" v-if="priCondition">
                <AutoComplete v-model="selectedAddressPRI" :suggestions="searchedAddressPRI" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress4">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress4" class="arrow-button" :class="isLoading" v-if="!showAddress4 && typeof(selectedAddressPRI) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
                </div>
                <div v-if="showAddress4">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoiePRI" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress4">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommunePRI" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress4" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivrePRI" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonneesPRI" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress4">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erpPRI" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress4" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtagePRI" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatimentPRI" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>
            </div>
            <div v-if="showAddress" id="prmField">
                <div class="flex items-center gap-2">
                <Checkbox v-model="prmCondition" inputId="prm" name="dateModify" value="false" :disabled="prmCondition" />
                    <label for="prm">Ajouter un PRM </label>
                </div>
                <div class="formElement" v-if="prmCondition">
                <AutoComplete v-model="selectedAddressPRM" :suggestions="searchedAddressPRM" @complete="search" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Chercher l'adresse" :disabled="showAddress2">
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center country-item">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </AutoComplete>
                <button @click="getMoreAddress2" class="arrow-button" :class="isLoading" v-if="!showAddress2 && typeof(selectedAddressPRM) == 'object'">
                    <span v-if="!loading">→</span><span v-else><img src="@/assets/loading2.gif" alt="" width="20px" height="auto"></span>
                </button>
                </div>
                <div v-if="showAddress2">
                <label for="Voie" class="labelForm">Voie</label>
                <InputText v-model="addressVoiePRM" inputId="Voie" placeholder="Voie de l'adresse" />
            </div>
            <div v-if="showAddress2">
                <label for="Commune" class="labelForm">Commune</label>
                <InputText v-model="addressCommunePRM" inputId="Commune" placeholder="Commune" />
            </div>
            <div v-if="showAddress2" class="flexx">
                <div>
                    <label for="Livre" class="labelForm">Livre</label><br>
                    <Dropdown v-model="addressLivrePRM" :options="livres" placeholder="Livre" class="w-full md:w-14rem" />
                </div>
                <div id="coordonnees">
                    <label for="coordonnees" class="labelForm">Coordonnées</label>
                    <InputText v-model="coordonneesPRM" inputId="coordonnees" placeholder="Coordonnées Livre" />
                </div>
            </div>
            <div v-if="showAddress2">
                <label for="erp" class="labelForm">ERP</label><br>
                <Dropdown v-model="erpPRM" :options="erpList" placeholder="Sélectionner un ERP" fluid class="w-full md:w-14rem" />
            </div>
            <div v-if="showAddress2" class="flexx">
                <div>
                    <label for="Etage" class="labelForm">Etage</label><br>
                    <Dropdown v-model="addressEtagePRM" :options="etages" placeholder="Etage" class="w-full md:w-14rem" />
                </div>
                <div id="Batiment">
                    <label for="Batiment" class="labelForm">Bâtiment</label>
                    <InputText v-model="addressBatimentPRM" inputId="Batiment" placeholder="Bâtiment" class="w-5rem md:w-5rem" />
                </div>
            </div>
            <p>REMARQUE : Vous aurez la possibilité d'affecter certains <br>ou tous les engins à des PRM, PRV ou PRI plus tard.</p>
            </div>
            <div class="subsubtitle">
                    Sélection de la raison de l'intervention
            </div>
            <div class="formElement">
                <Dropdown v-model="selectedSinistre" :options="sinistres" @change="getSinistreGFO" optionLabel="labelComplet" editable optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélectionner un sinistre" class="w-full md:w-14rem">
                    <template #optiongroup="slotProps">
                    <div class="flex align-items-center">
                        <div>{{ slotProps.option.label }}</div>
                    </div>
                    </template>
                </Dropdown>
            </div>
            <div v-if="typeof(selectedSinistre) == 'object'" class="gfoList">
                <Chips v-model="gfos" />
            </div>
            <div id="layoutMargin"></div>
        </div>
    </div>
</template>

<script setup>
import useComputer from '../components/useComputer.vue';
import { useSqlStore } from "@/stores/database.js";
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import AutoComplete from 'primevue/autocomplete';
import Chips from 'primevue/chips';
import { ref, watch, computed } from "vue";

const verifyIfPhone = () => {
    return window.innerWidth < 768;
}
const showApp = ref(false);
const step = ref(1);
const manualHour = ref(false);
const timeDateInter = ref(new Date());
const sinistres = ref([]);
const selectedSinistre = ref();
const selectedAddress = ref();
const searchedAddress = ref([]);
const showAddress = ref(false);
const loading = ref(false);
const moreAddress = ref({});
const mapSource = ref('https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=500&height=500&center=lonlat:4.84665,45.81745&zoom=15&marker=lonlat:4.84665,45.81745;type:circle;color:%23ff0000;size:small;icon:local_fire_department;icontype:material;iconsize:small;strokecolor:%23ff0000&scaleFactor=2&apiKey=75c6e5ac06e84d3a95473195e7af529d');

const sqlStore = useSqlStore();

async function getSinistres(){
    await sqlStore.getListSinistres();
    sinistres.value = await sqlStore.listSinistres;
}

watch(selectedAddress, (newValue) => {
    if (newValue) {
        processAddress({ value: newValue });
    }
});

async function processAddress(){
    if (!selectedAddress.value || typeof selectedAddress.value !== 'object') {
        return;
    }
    console.log(selectedAddress.value);
    let lon = selectedAddress.value.lon;
    let lat = selectedAddress.value.lat;
    mapSource.value = `https://maps.geoapify.com/v1/staticmap?style=osm-liberty&width=500&height=500&center=lonlat:${lon},${lat}&zoom=17.1&pitch=60&marker=lonlat:${lon},${lat};type:material;color:red;icon:emergency_share&scaleFactor=2&apiKey=75c6e5ac06e84d3a95473195e7af529d`;
}

const search = async (event) => {
    if (event.query.length <= 4) {
        return;
    }
    await sqlStore.searchAddress(event.query);
    searchedAddress.value = await sqlStore.searchedAddress;
    searchedAddressPRM.value = await sqlStore.searchedAddress;
    searchedAddressPRV.value = await sqlStore.searchedAddress;
    searchedAddressPRI.value = await sqlStore.searchedAddress;
}

getSinistres();

let timeDateInterInterval = setInterval(() => {
    if (!manualHour.value){
    timeDateInter.value = new Date();
    } else {
        clearInterval(timeDateInterInterval);
    }
}, 1000);

const addressVoie = ref('Voie de base');
const addressCommune = ref('Commune de base');
const addressLivre = ref('Collonges');
const coordonnees = ref('Coordonnées de base');
const erp = ref('');
const addressBatiment = ref('');
const addressEtage = ref('');
const prmCondition = ref(false);
const selectedAddressPRM = ref();
const searchedAddressPRM = ref([]);
const showAddress2 = ref(false);
const addressVoiePRM = ref('Voie de base');
const addressCommunePRM = ref('Commune de base');
const addressLivrePRM = ref('Collonges');
const coordonneesPRM = ref('Coordonnées de base');
const erpPRM = ref('');
const addressBatimentPRM = ref('');
const addressEtagePRM = ref('');
const gfos = ref([]);
const gfosBase = ref([]);
const addressLivrePRV = ref('Collonges');
const addressEtagePRV = ref('');
const addressBatimentPRV = ref('');
const selectedAddressPRV = ref();
const searchedAddressPRV = ref([]);
const showAddress3 = ref(false);
const addressVoiePRV = ref('Voie de base');
const addressCommunePRV = ref('Commune de base');
const coordonneesPRV = ref('Coordonnées de base');
const erpPRV = ref('');
const prvCondition = ref(false);
const addressLivrePRI = ref('Collonges');
const addressEtagePRI = ref('');
const addressBatimentPRI = ref('');
const selectedAddressPRI = ref();
const searchedAddressPRI = ref([]);
const showAddress4 = ref(false);
const addressVoiePRI = ref('Voie de base');
const addressCommunePRI = ref('Commune de base');
const coordonneesPRI = ref('Coordonnées de base');
const erpPRI = ref('');
const priCondition = ref(false);

const livres = ["Collonges",  "Fontaines", "Caluire","LYON RD", "Albigny", "Neuville", "Rillieux", "StDidier"];
const erpList = ref([]);
const etages = ["MI","VP", "-3", "-2", "-1", "RdC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];


const getMoreAddress = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddress.value.lon, selectedAddress.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress.value = true;
    console.log(moreAddress.value);
    addressVoie.value = selectedAddress.value.housenumber ? selectedAddress.value.housenumber + ' ' + selectedAddress.value.street : selectedAddress.value.street;
    addressCommune.value = selectedAddress.value.city.toUpperCase();
    coordonnees.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erp.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}
const getMoreAddress2 = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddressPRM.value.lon, selectedAddressPRM.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress2.value = true;
    console.log(moreAddress.value);
    addressVoiePRM.value = selectedAddressPRM.value.housenumber ? selectedAddressPRM.value.housenumber + ' ' + selectedAddressPRM.value.street : selectedAddressPRM.value.street;
    addressCommunePRM.value = selectedAddressPRM.value.city.toUpperCase();
    coordonneesPRM.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erpPRM.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}

const getMoreAddress3 = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddressPRV.value.lon, selectedAddressPRV.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress3.value = true;
    console.log(moreAddress.value);
    addressVoiePRV.value = selectedAddressPRV.value.housenumber ? selectedAddressPRV.value.housenumber + ' ' + selectedAddressPRV.value.street : selectedAddressPRV.value.street;
    addressCommunePRV.value = selectedAddressPRV.value.city.toUpperCase();
    coordonneesPRV.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erpPRV.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}

const getMoreAddress4 = async () => {
    loading.value = true;
    await sqlStore.getMoreAddress(selectedAddressPRI.value.lon, selectedAddressPRI.value.lat);
    moreAddress.value = await sqlStore.moreAddress;
    showAddress4.value = true;
    console.log(moreAddress.value);
    addressVoiePRI.value = selectedAddressPRI.value.housenumber ? selectedAddressPRI.value.housenumber + ' ' + selectedAddressPRI.value.street : selectedAddressPRI.value.street;
    addressCommunePRI.value = selectedAddressPRI.value.city.toUpperCase();
    coordonneesPRI.value = moreAddress.value.mapCoordinates == "inconnu" ? "" : moreAddress.value.mapCoordinates;
    erpList.value.push(" ");
    for (const erp of moreAddress.value.erp){
        erpList.value.push(erp.feature.toUpperCase().replace(/GROUPEMENT/g, 'GT').replace(/ETABLISSEMENT/g, 'ETB'));	
    }
    if(moreAddress.value.erp[0].distance < 60){
        erpPRI.value = moreAddress.value.erp[0].feature.toUpperCase().replace(/GROUPEMENT/g, 'GT');
    }
    
    loading.value = false;
}

const isLoading = () => {
    return loading.value ? 'loading' : '';
}

let maxConfigCollonges = {
    "SAP" : 2,
    "PSSAP": 3,
    "PSINC": 1,
    "INC": 1,
    "INFAMU": 2,
    "CDG": 2,
    "AQUA": 1

}

const getSinistreGFO = async () => {
    console.log(selectedSinistre.value);
    gfos.value = selectedSinistre.value.listGfo;
    gfosBase.value = selectedSinistre.value.listGfo;
}

const gfoSuppression = computed(() => {
    return gfosBase.value.filter(gfo => !gfos.value.includes(gfo));
})

</script>

<style scoped>
.full {
    width: 100%;
}
.gfoList{
    margin-top: 1rem;
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
#appStep1{
    padding-right: 5rem;
    transform: translateX(+5rem);
    overflow: auto;
}
#prvField, #priField, #prmField{
    margin-top: 1rem;
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
.flexx{
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
}
.arrow-button{
  background-color: #0078f3;
  flex: 0.2;
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  margin-left: 1rem;
  cursor: pointer;
  border-radius: 5px;
  height: 2rem;
  min-width: 30px;
  transition: all 0.3s ease;
}
.arrow-button:hover{
  background-color: #6196ff;
}	
.loading{
    background-color: white;
    border: #0078f3 1px solid;
    cursor: not-allowed;
}
.titleApp{
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background-color: white;
    border-radius: 30px;
    width: 50%;
    text-align: center;
    padding: 1rem;
}
#layoutMargin{
    height: 7rem;
}
#coordonnees, #Batiment{
    margin-left: 1rem;

}
.logoApp{
    position: fixed;
    top: 1rem;
    right: 1rem;
}
.labelForm{
    font-weight: 700;
    color: #666666;
    margin-right: 2rem;
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
#mapid{
    position: fixed;
    left: 3rem;
    border-radius: 30px;
    overflow: hidden;
    scale: 1.5;
    width: 300px;
    height: 300px;
}
.subsubtitle{
    padding-top: 1rem;
    border-top: #e5e5e5 1px solid;
}
</style>