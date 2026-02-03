<template>
    <div>
        <div class="subtitle">
            Remplacement du matériel ASUP
        </div>
        <div v-if="validationGif">
            <div>
                <img src="@/assets/finished.gif" alt="" width="300px" height="auto">
            </div>
            <div class="lastMessage">La déclaration est terminée. <br> Vous pouvez à présent fermer la page.</div>
        </div>
        <div v-if="!validationGif">
            <p v-if="datePeremption == currentDate">
                    Formulaire à remplir lors de la réception de médicaments depuis le service.
            </p>
            <p><span class="mandatory">*</span>Champs obligatoires</p>
            <form autocomplete="off">
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
            </form>
        </div>
        <div v-if="showPanel" class="replacementPanelFilter" @click="showPanel = !showPanel"></div>
        <div v-if="showPanel" class="replacementPanel">
            <div v-show="showPanel && loadingInfo">
                <img src="@/assets/loadingTiles.gif" alt="Loading" width="200px" height="auto">
            </div>
            <div v-show="materielToAffect && !showConfirmation">
                <div class="subtitle">
                    Affectation du matériel restant
                </div>
                <p>Durant votre déclaration, {{ nombreMedicaments - (nombreVsav1 + nombreVsav2) }} n'étaient pas associés à un vsav.</p>
                <p>Restant à associer <span :class="classNombreAssocier">{{ nombreAAssocier - nombreAssocierVsav1 - nombreAssocierVsav2 > 0 ? nombreAAssocier - nombreAssocierVsav1 - nombreAssocierVsav2 : "OK!" }}</span> </p>
                <div class="formReplacement" id="affecation">
                    <div>
                        <label for="vsav1">VSAV1<span class="mandatory">*</span>
                            <InputNumber v-model="nombreAssocierVsav1" inputId="vsav1" showButtons buttonLayout="horizontal" :step="1" :min="0" :max="nombreAAssocier - nombreAssocierVsav2" :invalid="nombreAAssocier > nombreAssocierVsav1 + nombreAssocierVsav2" ></InputNumber>
                        </label>
                    </div>
                    <div>
                        <label for="vsav2">VSAV2<span class="mandatory">*</span>
                            <InputNumber v-model="nombreAssocierVsav2" inputId="vsav2" showButtons buttonLayout="horizontal" :step="1" :min="0" :max="nombreAAssocier - nombreAssocierVsav1" :invalid="nombreAAssocier > nombreAssocierVsav1 + nombreAssocierVsav2" ></InputNumber>
                        </label>
                    </div>
                </div>
            </div>
            <div v-show="showConfirmation">
                <div class="subtitle">
                    Confirmation
                </div>
                <p>
                    Le matériel a été remplacé avec succès.
                </p>
                <div class="lastButtons">
                    <div id="stop" @click="endDeclaration">Terminer les remplacements</div>
                    <div id="continue" @click="addNewMateriel">Ajouter un nouveau matériel</div>
                </div>
            </div>
            <div v-show="showPanel && !loadingInfo && !materielToAffect">
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
            <p v-if="!vsav2Selected && !vsav1Selected && !loadingInfo">Cliquez sur chaque VSAV lorsque vous avez rajouté le nombre de médicament associé.</p>
            <p v-if="vsav1Selected && !vsav2Selected">Encore {{ nombreVsav2 }} médicaments à rajouter pour VSAV2.</p>
            <p v-if="vsav2Selected && !vsav1Selected">Encore {{ nombreVsav1 }} médicaments à rajouter pour VSAV1.</p>
            <div class="validationBtn" id="replacementValidation" v-if="vsav1Selected && vsav2Selected && !loadingButton && !materielToAffect" @click="validateChange">
                {{ loadingButton == false ? 'Valider' : "" }}
            </div>
            <div v-if="materielToAffect && !loadingButton && !showConfirmation" class="validationBtn" id="replacementValidation" @click="validateAffectation">
                {{ loadingButton == false ? 'Valider' : "" }}
            </div>
            <div v-if="loadingButton" class="loadingButton"><img src="@/assets/loading.gif" alt="Loading" width="50px" height="auto"/></div>
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
import { useAuth0 } from '@auth0/auth0-vue';

const sqlStore = useSqlStore();
const medicaments = ref([]);
const selectedMedicament = ref();
const nombreMedicaments = ref(1);
const datePeremption = ref();
const currentDate = new Date();
const showConfirmation = ref(false);
const numLot = ref();
const showPanel = ref(false);
const vsav1Selected = ref(false);
const vsav2Selected = ref(false);
const materielToAffect = ref(false);
const nombreAAssocier = ref(0);
const nombreAssocierVsav1 = ref(0);
const loadingButton = ref(false);
const nombreAssocierVsav2 = ref(0);
const materielAAssocier = ref([]);
const validationGif = ref(false);

const classNombreAssocier = () => {
    return nombreAAssocier.value - nombreAssocierVsav1.value - nombreAssocierVsav2.value > 0 ? 'remaining' : 'ok';
}

const medicamentsToReplace = ref([]);
const nombreVsav1 = ref(0);
const nombreVsav2 = ref(0);
const materielAremplacer = ref([]);
const loadingInfo = ref(false);

const auth0 = useAuth0();
let utilisateur = null;
if (auth0 && auth0.user && auth0.user.value) {
  utilisateur = auth0.user.value;
}
const matricule = ref(utilisateur && utilisateur.profile && utilisateur.profile[0] ? utilisateur.profile[0] : '');

async function getMateriels() {
    await sqlStore.getMedicamentsList();
    medicaments.value = sqlStore.medicamentsList;
    datePeremption.value = currentDate;
}

async function getMedicamentToReplace(medId) {
    loadingInfo.value = true;
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
    if (nombreVsav1.value == 0){
        vsav1Selected.value = true;
    }
    if (nombreVsav2.value == 0){
        vsav2Selected.value = true;
    }
    loadingInfo.value = false;
}

const submitForm = async () => {
    console.log(selectedMedicament.value, datePeremption.value, numLot.value, nombreMedicaments.value);
    showPanel.value = true;
    await getMedicamentToReplace(selectedMedicament.value.value);
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
    let remainingMedicaments = parseInt(nombreMedicaments.value) - (parseInt(nombreVsav1.value) + parseInt(nombreVsav2.value));
    let vsavNombreDict = {
        vsav1: nombreVsav1.value,
        vsav2: nombreVsav2.value,
        remaining: remainingMedicaments
    };
    const datePeremptionToFormat = new Date(datePeremption.value.getTime() + 5 * 60 * 60 * 1000);
    const formattedDate = datePeremptionToFormat.toISOString().split('T')[0];
    let newMedicamentInfo = {
        selectedMedicament: selectedMedicament.value,
        datePeremption: formattedDate,
        numLot: numLot.value
    };
    console.log(materielAremplacer.value);

    let confirmationMessage = `Confirmez-vous l'archivage d${materielAremplacer.value.length == 1 ? "'" : "e"} ${materielAremplacer.value.length} médicament${materielAremplacer.value.length == 1 ? "" : "s"}, ainsi que l'ajout de ${nombreMedicaments.value} ${selectedMedicament.value.label} ?`;
    console.log(newMedicamentInfo);
    console.log(materielAremplacer.value, vsavNombreDict, newMedicamentInfo, matricule.value);
    if (confirm(confirmationMessage)) {
        loadingButton.value = true;
        await sqlStore.replaceAsup(materielAremplacer.value, vsavNombreDict, newMedicamentInfo, matricule.value);
        loadingButton.value = false;
        await sqlStore.getWhithAffection(selectedMedicament.value.value);
        materielAAssocier.value = sqlStore.materielAAssocier;
        nombreAAssocier.value = materielAAssocier.value.length;
        if (nombreAAssocier.value > 0) {
            materielToAffect.value = true;
        } else {
            materielToAffect.value = false;
        }
    }
}

const validateAffectation = async () => {
    if (nombreAssocierVsav1.value + nombreAssocierVsav2.value != nombreAAssocier.value) {
        alert("Le nombre de médicaments à associer ne correspond pas au nombre de médicaments restant à associer.");
        return;
    }
    const vsavNombreDict = {
        vsav1: materielAAssocier.value.slice(0, nombreAssocierVsav1.value),
        vsav2: materielAAssocier.value.slice(nombreAssocierVsav1.value, nombreAssocierVsav1.value + nombreAssocierVsav2.value)
    };
    let confirmationMessage = `Confirmez-vous l'association de ${nombreAssocierVsav1.value} médicament${nombreAssocierVsav1.value == 1 ? "" : "s"} au VSAV-1 et de ${nombreAssocierVsav2.value} médicament${nombreAssocierVsav2.value == 1 ? "" : "s"} au VSAV-2 ?`;
    if (confirm(confirmationMessage)) {
        loadingButton.value = true;
        await sqlStore.affectToVsav(vsavNombreDict);
        loadingButton.value = false;
        showConfirmation.value = true;
    }
}
const endDeclaration = () => {
    validationGif.value = true;
    showPanel.value = false;
}

const addNewMateriel = () => {
    showPanel.value = false;
    selectedMedicament.value = null;
    datePeremption.value = currentDate;
    numLot.value = null;
    nombreMedicaments.value = 1;
    showConfirmation.value = false;
    vsav1Selected.value = false;
    vsav2Selected.value = false;
    materielToAffect.value = false;
    nombreAAssocier.value = 0;
    nombreAssocierVsav1.value = 0;
    nombreAssocierVsav2.value = 0;
    materielAAssocier.value = [];
    getMateriels();
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
    min-width: 30%;
    max-width: 50%;
    transition: all 0.5s ease-in-out;
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
    min-width: 30%;
}

@media (max-width: 768px) {
    .replacementPanel {
        min-width: 80%;
        max-width: 90%;
    }
    #replacementValidation {
        min-width: 80%;
    }
}
.remaining{
    color: #f60700;
    background-color: #fff4f4;
    padding: 0.5rem;
    border-radius: 5px;
    font-weight: bold;
}
.ok{
    color: #0078f3;
    background-color: #f4f6ff;
    padding: 0.5rem;
    border-radius: 5px;
    font-weight: bold;
}
.loadingButton{
    background-color: white;
    color: #0078f3;
    cursor: not-allowed;
    text-align: center;
    padding: 0.5rem;
    width: 80%;
    border : 1px solid #0078f3;
    border-radius: 100px;
}
#affectation{
    display: flex;
    justify-content: space-around;
}
#affecation > div{
    width: 100%;
    margin-top: 1.2rem;
}

.lastButtons{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 3rem;
  margin-bottom: 5rem;
}
.lastButtons > div{
  padding: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 5px;
}
@media (max-width: 768px) {
  .lastButtons > div{
    margin-top: 1rem;
    min-width: 90%;
  }
  
}
#stop{
    color: #f60700;
    border : 1px solid #f60700;
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
}
#stop:hover{
  background-color: #ff5150;
  cursor: pointer;
}
#continue{
  padding: 0.5rem;
  border-radius: 5px;
  color: white;
  background-color: #0078f3;
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
}
#continue:hover{
  background-color: #0078f3;
  color: white;
  cursor: pointer;
}
.remaining{
    color: #f60700;
    background-color: #fff4f4;
    padding: 0.5rem;
    border-radius: 5px;
    font-weight: bold;
}
.ok{
    color: #0078f3;
    background-color: #f4f6ff;
    padding: 0.5rem;
    border-radius: 5px;
    font-weight: bold;
}

</style>
