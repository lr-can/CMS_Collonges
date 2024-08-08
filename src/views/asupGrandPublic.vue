<template>
  <div class="subtitle">Déclaration ASUP</div>
  <div v-if="!step1">
      Bienvenue sur l'espace de déclaration des actes de soins d'urgence sur préscription.
  </div>
  <div id="asupForm">
  <div>
    <div v-if="errorMessage" class="errorMessage">
        <span>{{ errorMessage }}</span>
      </div>
    <div id="step1" class="step">
      <div class="subsubtitle">
      Agent ASUP
    </div>
    <p>Recherche par matricule</p>
      <div class="input">
        <div id="inputText">
          <InputText v-model="matricule" inputId="matricule" placeholder="V99999" :length="6" :invalid="!matricule.startsWith('V') || matricule.length !== 6 || responseError" :disabled="!showButton" />
        </div>
        <div v-if="showButton">
          <button @click="getAgentInfo" class="arrow-button" :disabled="!showButton">
            {{ buttonLabel }}
          </button>
        </div>
      </div>

      <div v-if="!showButton" id="agentInfo">
          <span id="gradeSpan"><img :src="image_grade()" width="30px" height="auto"></span>
          {{ nomAgent }} {{ prenomAgent }} <span id="nivASUP"> {{ niveauASUP }}</span>
        </div>
    </div>

    <div id="step2" v-if="step1" class="step">
      <div class="subsubtitle">
        Médecin prescripteur
      </div>
      <p>Recherche par numéro RPPS</p>
      <div class="input">
        <div id="inputTextDoc">
          <InputText v-model="rppsNumber" inputId="rppsNumber" placeholder="10xxxxxxxxxx" :length="11" :invalid="rppsNumber.length !== 11 || responseError" :disabled="!showButton2" />
        </div>
        <div v-if="showButton2">
          <button @click="getDoctorInfo" class="arrow-button" :disabled="!showButton2">
            {{ buttonLabel }}
          </button>
        </div>
      </div>
      <div v-if="!showButton2" id="doctorInfo">
          Dr {{ nomMedecin }} {{ prenomMedecin }}
        </div>
    </div>

    <div id="step3" v-if="step2" class="step">
      <div class="subsubtitle">
        Intervention
      </div>
      <p>Sélectionnez ou écrivez le numéro de l'intervention</p>
      <div class="input">
        <Dropdown v-model="selectedInter" editable :options="lastNotifsArray" optionLabel="label" placeholder="Sélection ou entrée" class="w-full md:w-14rem" :disabled="!showButton3" />
        <div v-if="showButton3">
          <button @click="numInterValidation" class="arrow-button" :disabled="!showButton3">
            Valider
          </button>
        </div>
      </div>
    </div>

    <div id="step4" v-if="step3" class="step">
      <div class="subsubtitle">
        Acte de soin prescrit
      </div>
      <p>Sélectionnez le soin réalisé</p>
      <div class="input">
        <Dropdown v-model="selectedSoin" :options="groupedSoins" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélection de l'acte" class="w-full md:w-14rem" :option-disabled="processAuthorization()" :disabled="!showButton4" />
        <div v-if="showButton4">
          <button @click="soinValidation" class="arrow-button" :disabled="!showButton4">
            Valider
          </button>
        </div>
      </div>  
    </div>

    <div id="step5" v-if="step4" class="step">
      <div class="subsubtitle">
        Médicaments utilisés
      </div>
      <div v-if="noDeclaration">
        <p>Vous n'avez pas besoin de déclarer de médicaments pour cet acte.</p>
      </div>
    </div>

  </div>
  <div id="blankSpaceBottom"></div>
</div>
</template>

<script setup>
import Sap2CL from '../assets/grades/Sap 2CL.png';
import Sap1CL from '../assets/grades/Sap 1CL.png';
import Caporal from '../assets/grades/Caporal.png';
import CaporalChef from '../assets/grades/Caporal-Chef.png';
import Sergent from '../assets/grades/Sergent.png';
import SergentChef from '../assets/grades/Sergent-Chef.png';
import Adjudant from '../assets/grades/Adjudant.png';
import AdjudantChef from '../assets/grades/Adjudant-Chef.png';
import Lieutenant from '../assets/grades/Lieutenant.png';
import Capitaine from '../assets/grades/Capitaine.png';
import Commandant from '../assets/grades/Commandant.png';
import Professeur from '../assets/grades/Professeur.png';
import Infirmiere from '../assets/grades/Infirmière.png';
import loader from '../assets/loading.gif';
import validationSound from '../assets/sounds/Validation.mp3';
import errorSound from '../assets/sounds/Warning.mp3';
import loadingSound from '../assets/sounds/Loading.mp3';

const dict_grades = {
'Sap 2CL': Sap2CL,
'Sap 1CL': Sap1CL,
'Caporal': Caporal,
'Caporal-Chef': CaporalChef,
'Sergent': Sergent,
'Sergent-Chef': SergentChef,
'Adjudant': Adjudant,
'Adjudant-Chef': AdjudantChef,
'Lieutenant': Lieutenant,
'Capitaine': Capitaine,
'Commandant': Commandant,
'Infirmière': Infirmiere,
'Professeur': Professeur
};

import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const matricule = ref('Vxxxxx');
const noDeclaration = ref(false);
const sqlStore = useSqlStore();
const agentInfo = ref(null);
const step1 = ref(false);
const step2 = ref(false);
const step3 = ref(false);
const step4 = ref(false);
const step5 = ref(false);

const showButton = ref(true);
const showButton2 = ref(true);
const showButton3 = ref(true);
const showButton4 = ref(true);

const agentGrade = ref(null);
const prenomAgent = ref('');
const nomAgent = ref('');
const buttonLabel = ref();
const responseError = ref(false);
const errorMessage = ref('');
const lastNotifsArray = ref([]);
const selectedInter = ref(null);

const rppsNumber = ref('10xxxxxxxxxx');
const doctorInfo = ref(null);
const nomMedecin = ref('');
const prenomMedecin = ref('');
const numIntervention = ref('');

const niveauASUP = ref('❌');
const selectedSoin = ref(null);

const groupedSoins = ref([
  {
    label: 'ASUP Niv. 1',
    code: 'asup1',
    items: [
      { label: 'ECG 12 dérivations', code: 'ecg'},
      { label: 'Crise d\'asthme', code : 'asthme'},
      { label: 'Overdose d\'opiacés', code : 'naloxone'},
      {label: 'Choc anaphylactique', code : 'allergie'}
    ]
  },
  {
    label: 'ASUP Niv. 2',
    code: 'asup2',
    items: [
      {label: 'Prise de l\'hémoglobinémie', code: 'hemocue'},
      {label: 'Prise en charge de la douleur', code: 'methoxyflurane'},
      {label: 'Douleurs aigües par voie orale', code: 'paracetamol'},
      {label: 'Hypoglycémie', code: 'glucagon'}
    ]
  }
])

let validation = new Audio(validationSound);
let error = new Audio(errorSound);
let loading = new Audio(loadingSound);


buttonLabel.value = 'Rechercher';

const updateButtonLabel = () => {
  const dots = ['.', '..', '...'];
  let index = 0;
  return () => {
    buttonLabel.value = 'Recherche' + dots[index];
    index = (index + 1) % dots.length;
  };
};

const getAgentInfo = async () => {
  let intervalId = setInterval(updateButtonLabel(), 500);
  errorMessage.value = '';
  responseError.value = false;
  try {
      loading.play();
      await sqlStore.getAsupAgentInfo(matricule.value);
      const result = sqlStore.infoAsupAgent;
      console.log('Résultat de getAsupAgentInfo:', result);
    
      agentInfo.value = result;
      console.log('Valeur de agentInfo après mise à jour:', agentInfo.value);

      showButton.value = false;
      loading.pause();
      if (agentInfo.value === undefined) {
          console.error('Erreur: agentInfo.value est undefined');
      } else if (result.message){
          responseError.value = true;
          buttonLabel.value = 'Rechercher';
          showButton.value = true;
          errorMessage.value = sqlStore.infoAsupAgent.message;
          error.play();
      } else {
          step1.value = true;
          validation.play();
      }
      updateDataAgent(result);
      clearInterval(intervalId);
      loadLastInters();
      buttonLabel.value = 'Rechercher';
  } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'agent:', error);
  }
}

const image_grade = () => {
  if (agentGrade.value === null) {
    return loader;
  }
  else {
    return dict_grades[agentGrade.value];
  }
};

const updateDataAgent = (result) => {
  agentGrade.value = result.grade;
  prenomAgent.value = result.prenomAgent;
  nomAgent.value = result.nomAgent;
  if (result.asup2 == '1'){
    niveauASUP.value = 'ASUP Niv. 2️'
  } else if (result.asup1 == '1'){
    niveauASUP.value = 'ASUP Niv. 1️'
  } else {
    niveauASUP.value = '❌ Non formé(e)'
  }
}

const updateDoctorData = (result) => {
  nomMedecin.value = result.nomExercice.toUpperCase();
  prenomMedecin.value = result.prenomExercice;
}

const loadLastInters = async () => {
  try {
    await sqlStore.getLastNotifs();
    let lastInters = sqlStore.lastNotifs;
    lastNotifsArray.value = lastInters.map(inter => ({
        label: `N°${inter.numeroInter} - ${inter.notificationTitre.slice(0,25)}${inter.notificationTitre.length > 25 ? '...' : ''}`,
        code: inter.numeroInter
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des dernières interventions:', error);
  }
}

const getDoctorInfo = async () => {
  let intervalId2 = setInterval(updateButtonLabel(), 500);
  errorMessage.value = '';
  responseError.value = false;
  try {
      loading.play();
      await sqlStore.getDoctorInfo(rppsNumber.value);
      const result = sqlStore.doctorInfo;
      console.log('Résultat de getAsupDoctorInfo:', result);
    
      doctorInfo.value = result;
      console.log('Valeur de agentInfo après mise à jour:', doctorInfo.value);

      showButton2.value = false;
      
      loading.pause();
      if (doctorInfo.value === undefined) {
          console.error('Erreur: docteurInfo.value est undefined');
      } else if (result.message){
          responseError.value = true;
          buttonLabel.value = 'Rechercher';
          showButton2.value = true;
          errorMessage.value = sqlStore.doctorInfo.message.replace("Error: Unable to parse range: RPPS!A#N/A:C#N/A", "Impossible de trouver le médecin correspondant au RPPS : " + rppsNumber.value);
          error.play();
      } else {
          step2.value = true;
          validation.play();
      }
      updateDoctorData(result);
      clearInterval(intervalId2);
      buttonLabel.value = 'Rechercher';
  } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'agent:', error);
  }
}
const numInterValidation = () => {
  loading.play();
  showButton3.value = false;
  console.log('Intervention sélectionnée:', selectedInter.value);
  step3.value = true;
  let numInter = '';
  if (!selectedInter.value.code){
    numInter = selectedInter.value;
    selectedInter.value = 'N°' + numInter + ' - ' + 'Entrée manuelle';
  } else {
    numInter = selectedInter.value.code;
  }
  numIntervention.value = numInter;
}
const processAuthorization = () => {
  let data = agentInfo.value;
  return (option) => {
    // Vérifier si l'option est un groupe
    if (option.items) {
      if (option.code === 'asup1' && data.asup1 == '1') {
        return false; // Le groupe n'est pas désactivé
      }
      if (option.code === 'asup2' && data.asup2 == '1') {
        return false; // Le groupe n'est pas désactivé
      }
    } else {
      // Vérifier les éléments individuels
      if (option.code === 'ecg' && data.asup1 == '1') {
        return false;
      }
      if (option.code === 'asthme' && data.asup1 == '1') {
        return false;
      }
      if (option.code === 'naloxone' && data.asup1 == '1') {
        return false;
      }
      if (option.code === 'allergie' && data.asup1 == '1') {
        return false;
      }
      if (option.code === 'hemocue' && data.asup2 == '1') {
        return false;
      }
      if (option.code === 'methoxyflurane' && data.asup2 == '1') {
        return false;
      }
      if (option.code === 'paracetamol' && data.asup2 == '1') {
        return false;
      }
      if (option.code === 'glucagon' && data.asup2 == '1') {
        return false;
      }
    }
    return true; 
  };
};
const soinValidation = () => {
  loading.play();
  showButton4.value = false;
  console.log('Soin sélectionné:', selectedSoin.value);
  step4.value = true;
  if (selectedSoin.value.code == 'ecg'||selectedSoin.value.code == 'hemocue'){
    noDeclaration.value = true;
    step5.value = true;
  }
}
</script>

<style scoped>
#asupForm{
  margin: auto;
  margin-top: 1rem;
  font-size: 12px;
}
#asupForm div{
  margin: auto;
  margin-top: 1rem;
  font-size: 12px;
}
#asupForm div div{
  font-weight: bold;
  font-size: 1rem;
  width: 100%;
}
.subsubtitle{
  font-size: 3rem;
  text-align: left;
  margin-bottom: 0;
}
.input{
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap; 
  margin-top: 0;
  padding-top: 0;
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
}
.arrow-button:hover{
  background-color: #6196ff;
}	
#blankSpaceBottom{
  margin-bottom: 5rem;
  display: block;
  height: 2rem;
}
#nivASUP{
  font-weight: normal;
  margin-left: 1rem;
}
#agentInfo, .errorMessage {
  display: flex;
  align-items: center;
  font-size: 1rem;
  flex: 1;
  justify-content: flex-start;
  text-align: left;
  margin-top: 1rem;
}
.errorMessage {
  color: red;
  font-size: 0.5rem;
  margin-top: 0;
  margin-bottom: 0; 
}

#inputText{
  flex: 0.2;
  width: 20%;
}
#inputTextDoc{
  flex: 0.5;
  width: 50%;
}
.p-inputtext{
  width: 15vh;
}
#inputTextDoc .p-inputtext{
  width: 20vh;
}
  #gradeSpan {
    overflow: hidden;
    object-fit: cover;
    object-position: center;
    margin-right: 5px;
    
  }
#gradeSpan img{
  border-radius: 5px;
}
.step{
  border-top: 1px solid #e5e5e5;
  padding-bottom: 1rem;
}
</style>