<template>
    <div>
        <div class="subtitle">
            Remplacement du matériel ASUP
        </div>
        <p>
                Formulaire à remplir lors de la réception de médicaments depuis le service.
        </p>
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
                <label for="integeronly">Nombre de médicaments<span class="mandatory">*</span>
                    <InputNumber v-model="nombreMedicaments" inputId="integeronly" showButtons buttonLayout="horizontal" :step="1"></InputNumber>
                </label>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';

const sqlStore = useSqlStore();
const medicaments = ref([]);
const selectedMedicament = ref();
const nombreMedicaments = ref(1);

async function getMateriels() {
    await sqlStore.getMedicamentsList();
    medicaments.value = await sqlStore.medicamentsList;
}

getMateriels();
</script>
<style scoped>
p{
    font-size: 0.8rem;
    margin-bottom: 1rem;
}
.p-inputnumber {
    width: 100%;
    padding-left: 0.5rem;
}
</style>