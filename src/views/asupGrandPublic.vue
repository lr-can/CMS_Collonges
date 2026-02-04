<template>
  <div class="subtitle">Déclaration ASUP</div>
  <div v-if="!step1 && !validationStep">
      Bienvenue sur l'espace de déclaration des actes de soins d'urgence sur préscription.
  </div>
  <div id="asupForm">
  <div>
    <div v-if="errorMessage" class="errorMessage">
        <span>{{ errorMessage }}</span>
      </div>
    <div id="step1" class="step" v-if="!step6 && !validationStep">
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
          <div id="agentInfoText">
            <span id="gradeSpan"><img :src="image_grade()" width="30px" height="auto"></span>
            {{ nomAgent }} {{ prenomAgent }} <span id="nivASUP"> {{ niveauASUP }}</span>
          </div>
          <div id="agentInfoLink"><a href="#" @click.prevent="resetAgent" class="not-you-link">Ce n'est pas vous ?</a></div>
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
      </div>
      <p>Indiquez le VSAV concerné</p>
      <div class="input">
        <Listbox v-model="selectedVSAV" :options="vsavList" optionLabel="label" placeholder="Sélection du VSAV" class="w-full md:w-14rem" :disabled="!showButton3" />
      </div>
      <div v-if="showButton3">
          <button @click="numInterValidation" class="arrow-button" :disabled="!showButton3">
            Valider
          </button>
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
      <div v-else>
        <p>Sélection des médicaments utilisés.</p>
        <div class="checkboxLine">
          <input id="acteAnnule" type="checkbox" v-model="acteAnnule" :disabled="step5">
          <label for="acteAnnule">Acte annulé / problème médicament</label>
        </div>
        <p v-if="acteAnnule" class="infoMessage">
          Vous pouvez valider sans sélectionner de médicament.
        </p>
        <div class="input">
          <MultiSelect v-model="selectedMedicaments" :options="medicamentsGroupes" optionLabel="code" optionGroupLabel="label" optionGroupChildren="items" display="chip" placeholder="Sélection des médicaments" class="w-full md:w-80" :disabled="step5">
            <template #option="slotProps">
                <div class="flex items-center">
                    <img alt="Lot" src="@/assets/icons/LOT.jpg" style="width: auto; height: 22px" />
                    <div>{{ slotProps.option.label.lot }}</div>
                    <div> - </div>
                    <img alt="Peremption" src="@/assets/icons/Expiry.jpg" style="width: auto; height: 20px" />
                    <div>{{ slotProps.option.label.peremption }}</div>
                </div>
            </template>
          </MultiSelect>
        </div>
        <p v-if="selectedMedicaments.length === 0 && !acteAnnule">Vous n'avez pas encore sélectionné de médicaments.</p>
        <p v-if="selectedMedicaments.length === 0 && acteAnnule">Aucun médicament sélectionné (acte annulé / problème médicament).</p>
        <p v-if="selectedMedicaments.length > 0">Vous avez sélectionné {{ selectedMedicaments.length }} médicament{{ selectedMedicaments.length > 1 ? 's' : '' }}.</p>
        <div v-if="(selectedMedicaments.length > 0 || acteAnnule) && !step5">
          <button @click="submitDeclaration" class="arrow-button">
            Valider
          </button>
        </div>
      </div> 
    </div>

    <div id="step6" v-if="step5" class="step">
      <div class="subsubtitle">
        Renseignements complémentaires
      </div>
      <div class="input">
        <InputSwitch v-model="hasSecondEffect" onLabel="Oui" offLabel="Non" class="w-9rem" aria-label="Effet secondaire" />
        <span>Effets secondaires </span>
      </div>
      <div v-if="hasSecondEffect" id="orangeAlert" @load="scrollToBottom()">
        ✉ Déclaration auprès de la <a href="mailto:pharmacieASUP@sdmis.fr">Pharmacie ASUP</a> du SDMIS à faire. <br> Intervention N°{{ numIntervention }} à préciser.
      </div>
      <p v-if="hasSecondEffect">Sélectionnez les effets secondaires</p>
      <div class="input" v-if="hasSecondEffect">
        <MultiSelect v-model="effetsSecondaires" display="chip" filter :options="effetsSecondairesList" placeholder="Selectionnez les effets secondaires" />
      </div>
      <p>Commentaire</p>
      <div class="input">
        <Textarea v-model="commentaire" autoResize rows="3" cols="30" fluid :invalid="commentaire.length > 250" />
      </div>
      <p v-if="commentaire.length > 250" class="errorMessage">Le commentaire ne doit pas dépasser 250 caractères.</p>
      <div>
        <button @click="getRecap" class="arrow-button">
          Valider
        </button>
      </div>
    </div>

    <div class="step" id="step6" v-if="step6">
      <div class="subsubtitle">
        Récapitulatif
      </div>
      <div>
        <p>Agent : {{ nomAgent }} {{ prenomAgent }}</p>
        <p>Médecin : Dr {{ nomMedecin }} {{ prenomMedecin }}</p>
        <p>Intervention : {{ numIntervention }}</p>
        <p>Acte de soin : {{ selectedSoin.label }}</p>
        <p v-if="acteAnnule">Acte annulé / problème médicament : Oui</p>
        <p>Médicaments : {{ exctractNameandCount() }}</p>
        <p>Effets secondaires : {{ effetsSecondaires.join(', ') }}</p>
        <p>Commentaire : {{ commentaire }}</p>
            </div>
            <div class="validationBtn" @click="sendDeclaration" :class="isLoading ? 'loadingBtn' : ''">
        <span v-if="isLoading"><img src="@/assets/loading.gif" alt="Chargement en cours..." width="50px" height="auto"></span><span v-else> Soumettre la déclaration</span>
      </div>
    </div>

    <div v-if="declarationResponse" :class="declarationResponse.message === 'Insertion réussie' ? 'validationMsg' : 'errorMessage'">
        {{ declarationResponse.message }}
      </div>

    <div v-if="validationStep">
      <div>
        <img src="@/assets/finished.gif" alt="" width="300px" height="auto">
      </div>
      <div class="lastMessage">La déclaration est terminée. <br> Vous pouvez à présent fermer la page.</div>
    </div>
  </div>
  <div id="blankSpaceBottom"></div>
</div>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';
const auth0 = useAuth0();
const matriculeProfile = ref(null);
let utilisateur = null;

if (auth0 && auth0.user && auth0.user.value && auth0.user.value.profile && auth0.user.value.profile[0]){
  utilisateur = auth0.user.value;
  console.log('Utilisateur:', utilisateur);
  matriculeProfile.value = utilisateur.profile[0];
  console.log('Matricule:', matriculeProfile.value);
}


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
import generatingSound from '../assets/sounds/Generating.mp3';

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
import MultiSelect from 'primevue/multiselect';
import Listbox from 'primevue/listbox';
import InputSwitch from 'primevue/inputswitch';
import Textarea from 'primevue/textarea';


import { ref, onMounted } from 'vue';
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
const step6 = ref(false);
const validationStep = ref(false);

const showButton = ref(true);
const showButton2 = ref(true);
const showButton3 = ref(true);
const showButton4 = ref(true);
const isLoading = ref(false);

const agentGrade = ref(null);
const agentMail = ref('');
const prenomAgent = ref('');
const nomAgent = ref('');
const buttonLabel = ref();
const responseError = ref(false);
const errorMessage = ref('');
const lastNotifsArray = ref([]);
const selectedInter = ref(null);
const selectedVSAV = ref(null);
const declarationResponse = ref(null);

const rppsNumber = ref('10xxxxxxxxxx');
const doctorInfo = ref(null);
const nomMedecin = ref('');
const prenomMedecin = ref('');
const numIntervention = ref('');

const niveauASUP = ref('❌');
const selectedSoin = ref(null);
const selectedMedicaments = ref([]);
const medicamentsGroupes = ref([]);
const medicamentsList = ref([]);
const acteAnnule = ref(false);
const vsavAsup = ref(null);
const hasSecondEffect = ref(false);
const effetsSecondaires = ref([]);
const commentaire = ref('');

const effetsSecondairesList = ref([
  'Maux de tête',
  'Nausées',
  'Vomissements',
  'Douleurs abdominales',
  'Éruptions cutanées',
  'Effets sur le système nerveux central',
  'Toux',
  'Étourdissements',
  'Palpitations',
  'Tremblements sévères',
  'Transpiration excessive',
  'Nausées graves',
  'Vomissements sévères',
  'Agitation sévère',
  'Augmentation significative de la pression artérielle',
  'Douleurs musculaires sévères',
  'Dysfonctionnement hépatique',
  'Toxicité hépatique',
  'Insuffisance hépatique',
  'Hypotension sévère',
  'Somnolence excessive',
  'Étourdissements graves',
  'Réactions allergiques graves',
  'Hyperglycémie passagère',
  'Tachycardie',
  'Crampes musculaires sévères',
  'Nervosité extrême',
  'Bronchospasme',
  'Pharyngite sévère',
  'Sécheresse buccale extrême',
  'Autre'
]);


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
]);

const vsavList = ref([
  {label: 'VSAV 1', code: '1'},
  {label: 'VSAV 2', code: '2'},
])

let validation = new Audio(validationSound);
let errorAudio = new Audio(errorSound);
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

const autoScrolltoBottom = async () => {
  await new Promise(r => setTimeout(r, 500));
  const element = document.getElementById('blankSpaceBottom');
  element.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
          errorAudio.play();
      } else {
          step1.value = true;
          validation.play();
          // Sauvegarder dans le cache après récupération réussie
          localStorage.setItem('cms_matricule', matricule.value);
          localStorage.setItem('cms_agent_info', JSON.stringify(result));
          console.log('Informations agent sauvegardées dans le cache');
      }
      updateDataAgent(result);
      clearInterval(intervalId);
      loadLastInters();
      buttonLabel.value = 'Rechercher';
  } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'agent:', error);
  }
}

const tryLoadFromCache = async () => {
    // D'abord, vérifier le cache localStorage
    const cachedMatricule = localStorage.getItem('cms_matricule');
    if (cachedMatricule) {
        console.log('Matricule trouvé dans le cache:', cachedMatricule);
        matricule.value = cachedMatricule;
        // Vérifier aussi les infos agent en cache pour affichage immédiat
        const cachedAgentInfo = localStorage.getItem('cms_agent_info');
        if (cachedAgentInfo) {
            try {
                const agentInfo = JSON.parse(cachedAgentInfo);
                updateDataAgent(agentInfo);
                showButton.value = false;
                step1.value = true;
                console.log('Infos agent récupérées depuis le cache (affichage immédiat)');
            } catch (error) {
                console.error('Erreur lors de la lecture du cache agent:', error);
            }
        }
        // Toujours appeler getAgentInfo pour mettre à jour le cache et vérifier les données
        console.log('Mise à jour des informations agent depuis le serveur...');
        await getAgentInfo();
        return;
    }
    
    // Si pas de cache, essayer Auth0
    if (matriculeProfile.value) {
        matricule.value = matriculeProfile.value;
        getAgentInfo();
    }
}

// Charger depuis le cache au montage du composant
onMounted(() => {
    tryLoadFromCache();
});

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
  agentMail.value = result.email;
  if (result.asup2 == '1'){
    niveauASUP.value = 'ASUP Niv. 2️'
  } else if (result.asup1 == '1'){
    niveauASUP.value = 'ASUP Niv. 1️'
  } else {
    niveauASUP.value = '❌ Non formé(e)'
  }
}

const resetAgent = () => {
  // Réinitialiser le formulaire
  showButton.value = true;
  showButton2.value = true;
  showButton3.value = true;
  showButton4.value = true;
  matricule.value = 'Vxxxxx';
  step1.value = false;
  step2.value = false;
  step3.value = false;
  step4.value = false;
  step5.value = false;
  step6.value = false;
  agentGrade.value = null;
  prenomAgent.value = '';
  nomAgent.value = '';
  agentMail.value = '';
  agentInfo.value = null;
  niveauASUP.value = '❌';
  rppsNumber.value = '10xxxxxxxxxx';
  nomMedecin.value = '';
  prenomMedecin.value = '';
  acteAnnule.value = false;
  errorMessage.value = '';
  responseError.value = false;
  buttonLabel.value = 'Rechercher';
  // Vider le cache localStorage
  localStorage.removeItem('cms_matricule');
  localStorage.removeItem('cms_agent_info');
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
          errorAudio.play();
      } else {
          step2.value = true;
          validation.play();
      }
      updateDoctorData(result);
      clearInterval(intervalId2);
      buttonLabel.value = 'Rechercher';
      autoScrolltoBottom();
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
  vsavAsup.value = selectedVSAV.value.code;
  autoScrolltoBottom();
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
const soinValidation = async () => {
  loading.play();
  showButton4.value = false;
  console.log('Soin sélectionné:', selectedSoin.value);
  if (selectedSoin.value.code == 'ecg'||selectedSoin.value.code == 'hemocue'){
    noDeclaration.value = true;
    step5.value = true;
  } else {
      await sqlStore.getAsupAvailableMedicaments(selectedSoin.value.code, vsavAsup.value);
      medicamentsGroupes.value = sqlStore.asupAvailableMedicaments;
  }
  step4.value = true;
  autoScrolltoBottom();
}
const exctractNameandCount = () => {
  let medicaments = selectedMedicaments.value;
  if (medicaments.length === 0) {
    return acteAnnule.value ? 'Aucun (acte annulé / problème médicament)' : '';
  }
  let medicamentsCount = {};
  let medicamentsList = [];
  medicaments.forEach(medicament => {
    let name = medicament.label.name;
    if (medicamentsCount[name]) {
      medicamentsCount[name]++;
    } else {
      medicamentsCount[name] = 1;
    }
  });
  for (let name in medicamentsCount) {
    medicamentsList.push(name + ' x' + medicamentsCount[name]);
  }
  const summary = medicamentsList.join(', ');
  return acteAnnule.value ? `${summary} (acte annulé / problème médicament)` : summary;
}
const submitDeclaration = () => {
  loading.play();
  medicamentsList.value = selectedMedicaments.value.map(medicament => medicament.code);
  console.log('Médicaments sélectionnés:', selectedMedicaments.value);
  step5.value = true;
  autoScrolltoBottom();
}
const getRecap = () => {
  loading.play();
  step6.value = true;
  autoScrolltoBottom();
  step5.value = false;
  step4.value = false;
  step3.value = false;
  step2.value = false;
  step1.value = false;
}
const generating = new Audio(generatingSound);

const sendDeclaration = async () => {
  loading.play();
  isLoading.value = true;
  let data = {
    matricule: matricule.value,
    medecinPrescripteur: rppsNumber.value,
    grade: agentGrade.value,
    numIntervention: numIntervention.value,
    acteSoin: selectedSoin.value.code,
    idMedicamentsList: medicamentsList.value.join(','),
    effetsSecondaires: effetsSecondaires.value.join(','),
    commentaire: commentaire.value
  };
  let emailData = {
    agent: `${prenomAgent.value} ${nomAgent.value} (${matricule.value})`,
    agentMail: agentMail.value,
    medecin: `Dr ${prenomMedecin.value} ${nomMedecin.value} (${rppsNumber.value})`,
    vsav: selectedVSAV.value.label,
    intervention: `${!selectedInter.value.code ? selectedInter.value : selectedInter.value.code}`,
    soin: selectedSoin.value.label,
    medicaments: exctractNameandCount(),
    effetsSecondaires: effetsSecondaires.value.join(','),
    commentaire: commentaire.value
  };
  console.log('Données de la déclaration:', data);
  console.log('Données de l\'email:', emailData);
  try {
    loading.pause();
    generating.play();
    await sqlStore.sendAsupDeclaration(data);
    declarationResponse.value = sqlStore.responseAsupDeclaration;
    await sqlStore.sendAsupEmail(emailData);
    generating.pause();
    isLoading.value = false;
    validation.play();
    await new Promise(r => setTimeout(r, 2000));
    if (sqlStore.responseAsupDeclaration.message == "Insertion réussie") {
      validationStep.value = true;
    } else {
      throw new Error(sqlStore.responseAsupDeclaration.message);
    }
    autoScrolltoBottom();
    step6.value = false;
    step1.value = false;
    step2.value = false;
    step3.value = false;
    step4.value = false;
    step5.value = false;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la déclaration:', error);
    declarationResponse.value = error;
    errorAudio.play();
    await new Promise(r => setTimeout(r, 4000));
    step6.value = false;
    step1.value = false;
    step2.value = false;
    step3.value = false;
    step4.value = false;
    step5.value = false;
    isLoading.value = false;
    autoScrolltoBottom();
    showButton.value = true;
    showButton2.value = true;
    showButton3.value = true;
    showButton4.value = true;
    validationStep.value = false;
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
.checkboxLine{
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: normal;
  margin-top: 0.5rem;
}
.checkboxLine input{
  margin: 0;
}
.infoMessage{
  font-style: italic;
  color: #666666;
  font-size: 0.8rem;
  margin-top: 0.5rem;
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
  animation: buttonAnimation 5s ease infinite;
}	
.lastMessage{
  text-align: center;
  font-size: 1.5rem;
  margin-top: 1rem;
}
@keyframes buttonAnimation {
  0% {
    background-color: #A558A0 ;
  }
  25% {
    background-color: #1f8d49;
  }
  50% {
    background-color: #d64d00;
  }
  75% {
    background-color: #f60700;
  }
  100% {
    background-color: #0078f3;
}
}

#blankSpaceBottom{
  margin-bottom: 5rem;
  display: block;
  height: 2rem;
}
#orangeAlert{
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
  font-size: 0.8rem;
  font-weight: lighter;
}
#orangeAlert a{
  color: #d64d00;
  text-decoration: underline;
  font-weight: bold;
}
.validationMsg{
  background-color: #dffee6;
  color: #1f8d49;
  font-size: 0.8rem;
  padding: 1rem;
  border-radius: 5px;
}
.errorMessage{
  background-color: #fff4f4;
  color: #f60700;
  font-size: 0.8rem;
  padding: 1rem;
  border-radius: 5px;
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
  gap: 0.5rem;
}

.not-you-link {
  font-size: 0.85rem;
  color: #0078f3;
  text-decoration: underline;
  margin-left: 0.5rem;
  cursor: pointer;
}

.not-you-link:hover {
  color: #0056b3;
}
.errorMessage {
  color: red;
  font-size: 0.8rem;
  margin-top: 0;
  margin-bottom: 0; 
}
.input span{
  padding-top: 1rem;
  flex: 0.8;
  text-align: left;
}

#inputText{
  flex: 0.2;
  width: 20%;
}
#inputTextDoc{
  flex: 0.5;
  width: 50%;
}
.w-9rem{
  width: 2.5rem;
  max-width: 2.5rem;
  vertical-align: middle;
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
p{
  margin-top: 1rem;
  text-align: left;
  margin-bottom: 0;
}
.flex{
  display: flex;
  align-items: center;
  margin-left: 10px;
}
.flex img{
  margin-right: 5px;
}
.p-inputtextarea{
  width: 100%;
}
.loadingBtn{
  background-color: white;
  border: 1px solid #0078f3;
}

#agentInfo{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
}

#agentInfoText{
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
}
#agentInfoText span{
  min-width: 30px;
}
#agentInfoLink{
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

@media (min-width: 1024px) {
  #asupForm {
    max-width: 900px;
  }

  #asupForm,
  #asupForm div {
    font-size: 14px;
  }

  .subsubtitle {
    font-size: 2rem;
  }

  .input {
    gap: 1rem;
  }

  .p-inputtext {
    width: 100%;
    max-width: 320px;
  }

  #inputText,
  #inputTextDoc {
    width: auto;
    flex: 1;
  }

  #inputTextDoc .p-inputtext {
    width: 100%;
  }

  .arrow-button {
    min-width: 120px;
    height: 2.5rem;
  }
}
</style>