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
    <div v-if="showPanel" class="replacementPanelFilter" @click="showPanel = !showPanel"></div>
    <div v-if="showPanel" class="replacementPanel">
        <div v-if="showPanel && loading">
            <img src="" alt="">
        </div>
        <div v-if="showPanel && !loading">
            <div class="return">
                <div class="returnBtn" @click="showPanel = !showPanel">Retour</div>
            </div>
            <div class="subtitle">
                Matériel à remplacer
            </div>
            <div class="vsav" @click="vsav1Selected = !vsav1Selected" :class="vsavSelected('vsav1')">
                <img src="@/assets/illustrations/SP_vsav_02.png" alt="VSAV Image" style="width: 80px; height: auto;">
                <div class="vsav-info">
                    <div class="vsav-title">VSAV-1</div>
                    <div class="vsav-number">{{ vsav1Selected ? "OK" : nombreVsav1 }}</div>
                </div>
            </div>
            <div class="vsav" @click="vsav2Selected = !vsav2Selected" :class="vsavSelected('vsav2')">
                <img src="@/assets/illustrations/SP_vsav_02.png" alt="VSAV Image" style="width: 80px; height: auto;">
                <div class="vsav-info">
                    <div class="vsav-title">VSAV-2</div>
                    <div class="vsav-number">{{vsav2Selected ? "OK" : nombreVsav2 }}</div>
                </div>
            </div>
        </div>
        <p v-if="!vsav2Selected && !vsav1Selected">Cliquez sur chaque VSAV lorsque vous avez rajouté le nombre de médicament associé.</p>
        <p v-if="vsav1Selected && !vsav2Selected">Encore {{ nombreVsav2 }} médicaments à rajouter pour VSAV2.</p>
        <p v-if="vsav2Selected && !vsav1Selected">Encore {{ nombreVsav1 }} médicaments à rajouter pour VSAV1.</p>
        <div class="validationBtn" id="replacementValidation" v-if="vsav1Selected && vsav2Selected" @click="validateChange">
            Valider
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
const showPanel = ref(false);
const vsav1Selected = ref(false);
const vsav2Selected = ref(false);

const medicamentsToReplace = ref([]);
const nombreVsav1 = ref(0);
const nombreVsav2 = ref(0);
const materielAremplacer = ref([]);

async function getMateriels() {
    await sqlStore.getMedicamentsList();
    medicaments.value = sqlStore.medicamentsList;
    datePeremption.value = currentDate;
}

async function getMedicamentToReplace(medId) {
    await sqlStore.getMedicamentsToReplace(medId);
    medicamentsToReplace.value = sqlStore.medicamentsToReplace;

    const vsav1 = [];
    const vsav2 = [];

    // Séparer les médicaments par affectation VSAV
    medicamentsToReplace.value.forEach(med => {
        if (med.affectationVSAV === 1) {
            vsav1.push(med);
        } else if (med.affectationVSAV === 2) {
            vsav2.push(med);
        }
    });

    const totalToReplace = vsav1.length + vsav2.length;

    if (nombreMedicaments.value >= totalToReplace) {
        nombreVsav1.value = vsav1.length;
        nombreVsav2.value = vsav2.length;
    } else {
        const totalMedicaments = nombreMedicaments.value;
        const halfMedicaments = Math.floor(totalMedicaments / 2);

        nombreVsav1.value = Math.min(vsav1.length, halfMedicaments);
        nombreVsav2.value = Math.min(vsav2.length, totalMedicaments - nombreVsav1.value);

        if (nombreVsav1.value + nombreVsav2.value < totalMedicaments) {
            if (vsav1.length > nombreVsav1.value) {
                nombreVsav1.value += totalMedicaments - (nombreVsav1.value + nombreVsav2.value);
            } else if (vsav2.length > nombreVsav2.value) {
                nombreVsav2.value += totalMedicaments - (nombreVsav1.value + nombreVsav2.value);
            }
        }
    }

    // Obtenir la liste du matériel à remplacer
    materielAremplacer.value = [
        ...vsav1.slice(0, nombreVsav1.value),
        ...vsav2.slice(0, nombreVsav2.value)
    ];
}

const submitForm = async () => {
    console.log(selectedMedicament.value, datePeremption.value, numLot.value, nombreMedicaments.value);
    await getMedicamentToReplace(selectedMedicament.value.value);
    showPanel.value = true;
}

const vsavSelected = (vsav) => {
    if (vsav == 'vsav1') {
        return vsav1Selected.value ? 'selected' : '';
    } else if (vsav == 'vsav2') {
        return vsav2Selected.value ? 'selected' : '';
    }
}

getMateriels();

const validateChange = async () => {
    let remainingMateriel = parseInt(nombreMedicaments.value) - materielAremplacer.value.length;
    let newMedicamentInfo = {
        selectedMedicament: selectedMedicament.value,
        datePeremption: datePeremption.value,
        numLot: numLot.value,
        nombreMedicaments: nombreMedicaments.value
    };
    console.log(materielAremplacer.value);

    let confirmationMessage = `Confirmez-vous le remplacement de ${materielAremplacer.value.length} médicament${materielAremplacer.value.length == 1 ? "" : "s"}, ainsi que l'ajout de ${nombreMedicaments.value} "${selectedMedicament.value.label}" ?`;
    console.log(newMedicamentInfo);
    if (confirm(confirmationMessage)) {
        await sqlStore.replaceAsup(materielAremplacer.value, remainingMateriel, newMedicamentInfo);
    }
}
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
.vsav {
    display: flex;
    align-items: center;
    flex: 1;
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 10px;
}
.vsav-info {
    margin-left: 1rem;
}
.vsav-title {
    font-size: 1.2rem;
    font-weight: bold;
}
.vsav-number {
    font-size: 3rem;
}
.replacementPanel {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background-color: white;
    border-radius: 10px;
    padding: 1rem;
    flex-wrap: wrap;
}
.replacementPanel > div {
    margin: 1rem;
}
.replacementPanelFilter {
    backdrop-filter: blur(10px) brightness(0.8);
    width: 100vw;
    height: 100vh;
    z-index: 3;
    position: fixed;
    top: 0;
    left: 0;

}
.selected {
    background-color: #d6deff;
    color: #0078f3;
    transition: change-color 0.3s ease;
}
@keyframes change-color {
    0% {
        background-color: white;
    }
    100% {
        background-color: #d6deff;
        color: #0078f3;
    }
    
}
#replacementValidation{
    min-width: 70%;
}

</style>