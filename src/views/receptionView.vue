<template>
    <div v-if="!scan">
        <div class="subtitle">
            Réception d'un commande
        </div>
        <form>
                <label for="materiel">Matériel
                    <Dropdown id='materiel' v-model="selectedMateriel" editable :options="materiels" optionLabel="nomMateriel" placeholder="Sélectionnez un matériel" class="form-item"/>
                </label>
                <label for="peremptionDate">Date de péremption
                    <Calendar id="peremptionDate" v-model="peremptionDate" dateFormat="dd/mm/yy" class="form-item" placeholder="Insérez une date"/>
                </label>
                <label for="numLot">Numéro de Lot
                    <InputText id="numLot" v-model="numLot" class="form-item" placeholder="Indiquez le numéro de lot"/>
                </label>
            <div class="validationBtn" @click="submitForm">Passer au scan</div>
        </form>
    </div>
    <div v-if="scan">
        <qrCode/>
    </div>
</template>

<script setup>
import qrCode from '../components/qrCode.vue';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';


import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const sqlStore = useSqlStore();


const scan = ref(false);
const materiels = ref([]);
const selectedMateriel = ref();
const peremptionDate = ref();

async function getMateriels() {
    await sqlStore.getMateriels();
    materiels.value = await sqlStore.materielsList;
}

getMateriels();

async function submitForm() {
    scan.value = true;
}
</script>
<style>
.form-item{
    border-radius: 30px;
    width: 100%;
    font-family: 'Marianne';
    margin-bottom: 1.5rem;
}
.form-item > input{
    border-radius: 30px;
}
label{
    font-weight: 500;
    font-size: 16px;
    margin-top: 1.5rem;
    margin-bottom: 1.2rem;
}
</style>