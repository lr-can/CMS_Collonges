<template>
  <div class="subtitle">Déclaration ASUP</div>
  <div>
      Bienvenue sur l'espace de déclaration des actes de soins d'urgence sur préscription.
  </div>
  <div id="asupForm">
  <div>
    <div class="subsubtitle">
      Agent ASUP
    </div>
    <div class="input">
      <div id="inputText">
        <InputText v-model="matricule" inputId="matricule" placeholder="V99999" :length="6" :invalid="!matricule.startsWith('V') || matricule.length !== 6" :disabled="!showButton" />
      </div>
      <div v-if="showButton">
        <button @click="getAgentInfo" class="arrow-button">
          →
        </button>
      </div>
      <div v-if="!showButton" id="agentInfo">
        <span id="gradeSpan"><img :src="image_grade()" width="30px" height="auto"></span>
      {{ nomAgent }} {{ prenomAgent }}
    </div>
    </div>
  </div>
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
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const matricule = ref('V99999');
const sqlStore = useSqlStore();
const agentInfo = ref(null);

const showButton = ref(true);
const agentGrade = ref(null);
const prenomAgent = ref('');
const nomAgent = ref('');

const getAgentInfo = async () => {
  try {
      await sqlStore.getAsupAgentInfo(matricule.value);
      const result = sqlStore.infoAsupAgent;
      console.log('Résultat de getAsupAgentInfo:', result);
    
      agentInfo.value = result;
      console.log('Valeur de agentInfo après mise à jour:', agentInfo.value);
      
      if (agentInfo.value === undefined) {
          console.error('Erreur: agentInfo.value est undefined');
      }
      showButton.value = false;
      updateDataAgent(result);
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
  font-size: 2rem;
  text-align: left;
  margin-bottom: 0;
}
.input{
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  padding-top: 0;
}
.arrow-button{
  background-color: #4CAF50;
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 25%;
  width: 30px;
  height: 30px;
}
.arrow-button:hover{
  background-color: #45a049;
}	
#agentInfo {
  display: flex;
  align-items: center;
  font-size: 1rem;
  flex: 1;
  justify-content: center;
}

#inputText{
  flex: 0.3;
  width: 33%;
}
.p-inputtext{
  width: 15vh;
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
</style>