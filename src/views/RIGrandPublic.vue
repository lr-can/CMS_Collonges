<template>
<div class="subtitle">Retour d'intervention SSUAP</div>
  <div v-if="!step1 && !validationStep">
      Bienvenue sur l'espace de déclaration des retours d'intervention SSUAP.
  </div>
  <div id="asupForm">
    <div>
        <div v-if="errorMessage" class="errorMessage">
            <span>{{ errorMessage }}</span>
        </div>
        <div id="step1" class="step" v-if="!validationStep">
      <div class="subsubtitle">
      Equipier déclarateur
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
          {{ nomAgent }} {{ prenomAgent }}
        </div>
    </div>

        <div v-if="step2 && !validationStep" class="step">
            <div class="subsubtitle">
                Chef d'agrès
            </div>
            <p>Sélectionnez le chef d'agrès dans la liste déroulante</p>
            <div class="input">
                <div id="inputTextDoc">
                    <Dropdown v-model="selected_chef_agres" @change="step3 = true; autoScrolltoBottom(); getAllVehicules()" :options="list_chef_agress" optionLabel="label_short" optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélectionner un chef d'agrès" :filter="true" filterBy="label_short" :showClear="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
            </div>
        </div>

        <div v-if="step3" class="step">
            <div class="subsubtitle">
                Intervention
            </div>
            <p>Sélectionnez l'intervention concernée par la déclaration</p>
            <div class="input">
                <div id="inputTextDoc">
                    <Dropdown v-model="selectedInter" @change="step4 = true; autoScrolltoBottom()" :options="lastNotifsArray" optionLabel="label" :filter="true" filterBy="label" :showClear="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
            </div>
            <div id="interInfo" v-if="selectedInter">
                <div>
                    <span style="font-style: italic; color: grey; font-size: 0.8rem;">Numéro d'intervention : </span><br><span style="font-weight: normal; font-size: 1rem;">{{ selectedInter.numeroInter }}</span>
                </div>
                <div>
                    <span style="font-style: italic; color: grey; font-size: 0.8rem;">Raison de sortie : </span><br><span style="font-weight: normal; font-size: 1rem;">{{ selectedInter.notificationTitre }}</span>
                </div>
                <div>
                    <span style="font-style: italic; color: grey; font-size: 0.8rem;">Date : </span><br><span style="font-weight: normal; font-size: 1rem;">{{ selectedInter.notificationDate }}</span>
                </div>
                <div>
                    <span style="font-style: italic; color: grey; font-size: 0.8rem;">Adresse : </span><br><span style="font-weight: normal; font-size: 1rem;">{{ selectedInter.notificationAdresse.replace(`${selectedInter.notificationVille} `, '') + " " + selectedInter.notificationVille }}</span>
                </div>
            </div>
        
            <div v-if="step4" class="step">
                <div class="subsubtitle">
                    Véhicule utilisé
                </div>
                <p>Sélectionnez le véhicule utilisé durant l'intervention</p>
                <div class="input">
                    <div id="inputTextDoc">
                        <Listbox v-model="selectedVehicule" @change="step5 = true;" :options="vehicules" filterBy="label" :showClear="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                    </div>
                </div>
            </div>
            <div v-if="step5" class="step">
                <div class="subsubtitle">
                    Matériel utilisé
                </div>
                <div class="input flex sized1">
                    <InputSwitch v-model="materielUtilise" :trueValue="true" :falseValue="false" id="nivASUP" style="width: 40px;"/>
                    <p style="font-size: 0.8rem; font-style: italic;">Du matériel a été utilisé durant l'intervention</p>
                </div>
                <div v-if="materielUtilise" class="input flex sized1">
                    <InputSwitch v-model="onlySimpleMateriel" :trueValue="true" :falseValue="false" id="nivASUP" style="width: 40px;"/>
                    <p style="font-size: 0.8rem; font-style: italic;">Matériel pour bilan utilisé uniquement</p>
                </div>
            </div>
        
            <div v-if="step5 && materielUtilise && !onlySimpleMateriel" class="step">
                <div class="subsubtitle">
                    Sélection du matériel utilisé
                </div>
                <p>Oxygénothérapie</p>
                <div class="input flex sized1">
                    <InputSwitch v-model="usedOxygene" :trueValue="true" :falseValue="false" id="nivASUP" style="width: 40px;"/>
                    <p style="font-size: 0.8rem; font-style: italic;">Oxygène utilisé durant l'intervention</p>
                </div>
                <div v-if="usedOxygene" class="input flex sized1">
                    <InputSwitch v-model="bouteilleRemplacement" :trueValue="true" :falseValue="false" id="nivASUP" style="width: 40px;"/>
                    <p style="font-size: 0.8rem; font-style: italic;">Au moins d'une des bouteilles a été remplacée</p>
                </div>
                <div v-if="bouteilleRemplacement" class="errorMessage" style="font-size:0.9rem">
                    Assurez-vous que {{ selected_chef_agres.label_short }} a bien demandé le remplacement de la bouteille au guichet unique avant de valider la déclaration.
                </div>
                <div v-if="usedOxygene" class="input">
                    <Listbox v-model="listOxygenotherapy" :options="Object.keys(materiels_list.Oxygenotherapie)" :showClear="true" :multiple="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
                <p>Réanimation/aspiration</p>
                <div class="input">
                    <Listbox v-model="listReaAspi" :options="Object.keys(materiels_list['Réanimation/aspiration'])" :showClear="true" :multiple="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
                <p>Plaies/Affections cutanées</p>
                <div class="input">
                    <Listbox v-model="listPlaies" :options="Object.keys(materiels_list['Plaies/Affections cutanées'])" :showClear="true" :multiple="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
                <p>Traumatologie/divers</p>
                <div v-if="listTraumatologie.includes('Ceinture trochantérienne')" class="errorMessage"  style="font-size:0.9rem;">
                    Assurez-vous que {{ selected_chef_agres.label_short }} a bien demandé le remplacement de la ceinture trochantérienne au guichet unique en précisant le numéro d'intervention ({{ selectedInter.numeroInter }}) avant de valider la déclaration.
                </div>
                <div class="input">
                    <Listbox v-model="listTraumatologie" :options="Object.keys(materiels_list['Traumatologie/divers'])" :showClear="true" :multiple="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
                <p>Kits</p>
                <div class="input">
                    <Listbox v-model="listKits" :options="Object.keys(materiels_list.Kits)" :multiple="true" :showClear="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
                <p>Autres matériels</p>
                <div class="input">
                    <Textarea v-model="materiel_manual" :rows="5" :cols="30" :showClear="true" :appendTo="'self'" :class="{ 'p-invalid': responseError }"/>
                </div>
            </div>
                

        </div>
    </div>
    <div id="blankSpaceBottom"></div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const step1 = ref(false)
const step2 = ref(false)
const step3 = ref(false)
const step4 = ref(false)
const step5 = ref(false)
const validationStep = ref(false)
const errorMessage = ref('')
const showButton = ref(true)
const buttonLabel = ref('Rechercher')
const selectedInter = ref(null)
const selectedVehicule = ref(null)
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Listbox from 'primevue/listbox';
import InputSwitch from 'primevue/inputswitch';
import Textarea from 'primevue/textarea';

const materielUtilise = ref(true);
const onlySimpleMateriel = ref(false);
const usedOxygene = ref(false);
const bouteilleRemplacement = ref(false);
const materiel_manual = ref('');


import { useAuth0 } from '@auth0/auth0-vue';
const auth0 = useAuth0();
const matriculeProfile = ref(null);
let utilisateur = null;

let attempts = 0;

const tryAuth0User = async () => {
    if (auth0.user.value && auth0.user.value.profile && auth0.user.value.profile[0]) {
        utilisateur = auth0.user.value;
        console.log('Utilisateur:', utilisateur);
        matriculeProfile.value = utilisateur.profile[0] ? utilisateur.profile[0] : null;
        console.log('Matricule:', matriculeProfile.value);
        if (matriculeProfile.value) {
            matricule.value = matriculeProfile.value;
            getAgentInfo();
        }
    } else if (attempts < 10) {
        attempts++;
        console.log(`Attempt ${attempts}: Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        tryAuth0User();
    } else {
        console.error('Failed to retrieve user after 3 attempts.');
    }
};

tryAuth0User();

const matricule = ref('')
const agentInfo = ref('')
const agentGrade = ref(null)
const prenomAgent = ref('')
const nomAgent = ref('')
const agentMail = ref('')
const responseError = ref(false)
const lastNotifsArray = ref([])
import { useSqlStore } from "@/stores/database.js";
const sqlStore = useSqlStore()
const list_chef_agress = ref([])
const selected_chef_agres = ref(null)


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
const pouvantChoquer = [
    "cardiaque",
    "hemorragie",
    "membre",
    "electrisation",
    "brulure",
    "noyee",
    "pendaison",
    "arme",
    "tentative",
    "repondant",
    "ensevelie",
    "accident",
    "agression",
    "hauteur",
    "explosion",
    "gaz",
    "glissement",
    "effondrement"
];

const listOxygenotherapy = ref([]);
const listReaAspi = ref([]);
const listPlaies = ref([]);
const listTraumatologie = ref([]);
const listKits = ref([]);

const materiels_list = ref({
    "bilan": {
        "Compresses": true,
        "Aiguilles auto-piquantes": true,
        "Protection thermomètre": true,
        "Sac vomitoire": true,
        "Sac urinal": true,
        "Drap": true,
        "Boîte de gants": true
    },
    "Oxygenotherapie": {
        "MHC Adulte": false,
        "MHC Enfant" : false,
    },
    "Réanimation/aspiration":{
        "Insufflateur manuel": false,
        "Filtre anti-bactérien": false,
        "Sonde buccopharyngée CH26": false,
        "Kit jetable pour l'aspirateur à mucosité": false,
        "Aspirateur à mucosité pédiatrique": false,
        "Electrodes DSA": false,
        "Canule": false,
    },
    "Plaies/Affections cutanées":{
        "Bande extensible 5 cm":false,
        "Bande extensible 10 cm":false,
        "(Mini)Versol": false,
        "Pansement compressif d'urgence":false,
        "Pansement hémostatique (QuickClot®)": false,
        "Garrot (coton ou tourniquet)": false,
        "Champ de soin stérile":false,
        "Désinfectant dosette": false,
        "Pansement absorbant":false,
        "Sparadrap": false,
        "Sparaplaie": false,
        "Brulstop": false,
    },
    "Traumatologie/divers":{
        "Poches de froid": false,
        "Couverture de survie": false,
        "Ceinture trochantérienne": false,
        "Echarpes triangulaires": false,
        "Glucopulse": false,
    },
    "Kits":{
        "Lot COVID/EPI SUAP NIVEAU 2": false,
        "Kit accouchement": false,
        "Kit membre sectionné": false,
        "Kit AEV/AES": false,
    }
});

let validation = new Audio(validationSound);
let errorAudio = new Audio(errorSound);
let loading = new Audio(loadingSound);

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
const loadLastInters = async () => {
  try {
    await sqlStore.getLastNotifs();
    await getAgentsList();
    let lastInters = sqlStore.lastNotifs;
    lastNotifsArray.value = lastInters.map(inter => ({
        ...inter,
        label: `N°${inter.numeroInter} - ${inter.notificationTitre.slice(0,25)}${inter.notificationTitre.length > 25 ? '...' : ''}`,
        code: inter.numeroInter
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des dernières interventions:', error);
  }
}

const vehicules = ref([]);
const getAllVehicules = async () => {
    try {
        let isPromptSecours = false;
        if (selected_chef_agres.value && selected_chef_agres.value.PSSAP_ca != 0 && selected_chef_agres.value.SAP_ca == 0) {
            isPromptSecours = true;
        } else {
            isPromptSecours = false;
        }
        vehicules.value = await sqlStore.getVehiculesRI(isPromptSecours);
    } catch (error) {
        console.error('Erreur lors de la récupération des véhicules:', error);
    }
}
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

loadLastInters();

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
      }
      updateDataAgent(result);
      clearInterval(intervalId);
      buttonLabel.value = 'Rechercher';
      step2.value = true;
      await autoScrolltoBottom();
  } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'agent:', error);
  }
}

const getAgentsList = async () => {
  try {
    await sqlStore.getAgentsList();
    list_chef_agress.value = [
        {
            label: 'Chef d\'Agrès SAP',
            items: sqlStore.agentsList.filter(chef => (chef.SAP_ca != 0))
        },
        {
            label: 'Chef d\'Agrès PSSAP',
            items: sqlStore.agentsList.filter(chef => (chef.PSSAP_ca != 0 && chef.SAP_ca == 0))
        }
    ];
    console.log('Liste des agents:', list_chef_agress.value);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
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
  agentMail.value = result.email;
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
#interInfo{
  margin-top: 1rem;
  font-size: 0.8rem;
  padding: 1rem;
  border-radius: 5px;
  background-color: #f8f7f7;
  display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    flex-direction: column;
    
}
#interInfo div{
    font-weight: normal;
    font-size: 0.8rem;
}
.sized1 > p {
    font-size: 0.8rem;
    margin-left: 1rem;
    margin-bottom: 0;
    margin-top: 0;
    font-style: italic;
    color: grey;
    font-weight: normal;
    flex: 0.8;
    text-align: left;

}
</style>