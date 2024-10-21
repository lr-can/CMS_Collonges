<template>
    <div class="subtitle">Base de données</div>
    <div class="button">
        <a href="https://api.cms-collonges.fr/getRecap">📄 Récapitulatif PDF</a>
    </div>
    <form autocomplete="off">
        <label for="materiel">Matériel<span class="mandatory">*</span>
        <Dropdown id='materiel' v-model="selectedMateriel" editable :options="materiels" optionLabel="nomMateriel" placeholder="Sélectionnez un matériel" required class="form-item" @change="resetState" />
        </label>
    </form>
    <div class="validationBtn" @click="submitForm" id="recherche">Rechercher</div>
    <div v-if="formSubmitted"><dbVisualisation :materiel="selectedMateriel"/></div>
</template>

<script setup>

import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import Dropdown from 'primevue/dropdown';
import InputError from '../assets/sounds/InputError.mp3';
import dbVisualisation from '@/components/dbVisualisation.vue';

const sqlStore = useSqlStore();
const materiels = ref([]);
const selectedMateriel = ref();
const errorSound = new Audio(InputError);
const formSubmitted = ref(false);

async function getMateriels() {
    await sqlStore.getMateriels();
    materiels.value = await sqlStore.materielsList;
}
getMateriels();

async function submitForm() {
    if (!selectedMateriel.value) {
        errorSound.play();
        alert('Au moins un champ obligatoire n\'a pas été rempli.');
        return;
    }
    formSubmitted.value = true;
    console.log(selectedMateriel.value);
}
const resetState = () => {
    formSubmitted.value = false;
}
</script>

<style>
#recherche{
    margin-top: 1rem;
}
.button{
    margin-bottom: 1rem;
    text-align: right;
}
</style>