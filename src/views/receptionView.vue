<template>
        <div v-if="!scan">
            <div class="subtitle">
                Réception d'un commande
            </div>
            <form autocomplete="off">
                    <label for="materiel">Matériel<span class="mandatory">*</span>
                        <Dropdown id='materiel' v-model="selectedMateriel" editable :options="materiels" optionLabel="nomMateriel" placeholder="Sélectionnez un matériel" required class="form-item"/>
                    </label>
                    <label for="peremptionDate">Date de péremption
                        <Calendar id="peremptionDate" v-model="peremptionDate" dateFormat="dd/mm/yy" class="form-item" placeholder="Insérez une date" />
                    </label>
                    <label for="numLot">Numéro de Lot<span class="mandatory">*</span>
                        <InputText id="numLot" v-model="numLot" class="form-item" placeholder="Indiquez le numéro de lot" required/>
                    </label>
                    <span class="mandatory">*</span> Champs obligatoires
                <div class="validationBtn" @click="submitForm">Passer au scan</div>
            </form>
        </div>
        <div v-if="scan">
            <div class="return">
                <div class="returnBtn" @click="switching">Retour</div>
            </div>
            <qrCode :info="{
                idMateriel: selectedMateriel.idMateriel,
                datePeremption: peremptionDate,
                numLot: numLot,
                nomMateriel: selectedMateriel.nomMateriel
            }" />
        </div>
</template>

<script setup>
import qrCode from '../components/qrCodeAjout.vue';
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
const numLot = ref();

async function getMateriels() {
    await sqlStore.getMateriels();
    materiels.value = await sqlStore.materielsList;
}

getMateriels();

async function submitForm() {
    if (!selectedMateriel.value || !numLot.value) {
        alert('Au moins un champ obligatoire n\'a pas été rempli.');
        return;
    }
    if (!peremptionDate.value){
        peremptionDate.value = '2999-12-31';
    } else {
        let peremptionDateStr = new Date(peremptionDate.value);
        peremptionDate.value = peremptionDateStr.toISOString().split('T')[0];
    }
    switching();
}
const switching = () => {
    scan.value = !scan.value;
}
</script>
<style>
.mandatory{
    color: #ce0500;

}
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
.return{
    margin-bottom: 1.5rem;
    background-color: #e5e5e5;
    color: #666666;
    width: 10vh;
    min-width: 10vh;
    max-width: 15vh;
    padding: 5px;
    border-radius: 30px;
    text-align: center;
}
.returnBtn{
    cursor: pointer;
}

</style>