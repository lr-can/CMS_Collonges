<template>
    <div>
        <div class="subtitle">
            Remplacement du matériel ASUP
        </div>
        <p v-if="datePeremption == currentDate">
                Formulaire à remplir lors de la réception de médicaments depuis le service.
        </p>
        <p><span class="mandatory">*</span>Champs obligatoires</p>
        <div class="formReplacement">
            <label for="materiel">Matériel<span class="mandatory">*</span>
                <Dropdown id='materiel' v-model="selectedMedicament" editable :options="medicaments" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélectionnez un médicament" required class="form-item" >
                    <template #optiongroup="slotProps">
                        <div class="flex align-items-center">
                            <div>{{ slotProps.option.label }}</div>
                        </div>
                    </template>
                </Dropdown>
            </label>  
            <div v-if="selectedMedicament">
                <label>Date de péremption<span class="mandatory">*</span>
                    <Calendar v-model="datePeremption" dateFormat="dd/mm/yy" :invalid="datePeremption < currentDate" /><br>
                    <small id="username-help" v-if="datePeremption == currentDate">Pour MM/AAAA, mettre le 31 pour le jour</small>
                </label>
            </div>
            <div v-if="datePeremption > currentDate">
                <label>Numéro de lot <span class="mandatory">*</span>
                    <InputText type="text" v-model="numLot" placeholder="Lot" id="lot" />
                </label>
            </div>  
            <div v-if="numLot">
                <label for="integeronly">Nombre de médicaments<span class="mandatory">*</span><br>
                    <InputNumber v-model="nombreMedicaments" inputId="integeronly" showButtons buttonLayout="horizontal" :step="1" :min="1" :invalid="nombreMedicaments < 1" ></InputNumber>
                </label>
            </div>
            <div class="validationBtn" @click="submitForm" v-if="selectedMedicament && datePeremption > currentDate && numLot && nombreMedicaments">
                Ajouter les médicaments
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import InputText from 'primevue/inputtext';

const sqlStore = useSqlStore();
const medicaments = ref([]);
const selectedMedicament = ref();
const nombreMedicaments = ref(1);
const datePeremption = ref();
const currentDate = new Date();
const numLot = ref();

async function getMateriels() {
    await sqlStore.getMedicamentsList();
    medicaments.value = sqlStore.medicamentsList;
    datePeremption.value = currentDate;
}

getMateriels();
</script>
<style scoped>
p{
    font-size: 0.8rem;
    margin-bottom: 1rem;
}
.formReplacement > div {
    margin-bottom: 1rem;
}
#username-help {
    font-size: 0.8rem;
    color: var(--color-text);
    font-style: italic;
    padding-left: 0.5rem;
}
</style>