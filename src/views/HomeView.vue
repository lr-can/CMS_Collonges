<template>
  <div v-if="isloading">
    Chargement...
  </div>
  <div v-else>
  <div v-if="!isAuthenticated">
    <notConnected/>
  
  </div>

  <div v-if="isAuthenticated">
    <div class="subtitle">
      {{ greeting }} <span id="grade_img"> <img :src="grade_url"  width="25px" height="auto"></span>{{ grade }} !
    </div>
    <div class="introText">
      <introText/>
    </div>
    <div @click="clicking">
      <nextExpiration/>
    </div>
  </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useAuth0 } from '@auth0/auth0-vue';
import notConnected from '../components/notConnected.vue';
import nextExpiration from '../components/nextExpiration.vue';
import introText from '../components/introText.vue';

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
  'Professeur': Professeur
};


const isAuthenticated = ref(true);
const grade = ref();
const greeting = ref("Bonjour,");
const isloading = ref(false);
const grade_url = ref("https://github.com/lr-can/CMS_Collonges/blob/main/src/assets/logo.png?raw=true");

const auth0 = useAuth0();

async function changeGreeting(grade) {
  const mesRespectsGrades = ['Lieutenant', 'Capitaine', 'Commandant', 'Colonel', 'Contrôleur Général'];
  const BonjourGradesAdj = ['Adjudant', 'Adjudant-Chef'];

  for (let j = 0; j < BonjourGradesAdj.length; j++)
  if (grade == BonjourGradesAdj[j]) {
    greeting.value = `Bonjour, mon`;
  }

  for (let i = 0; i < mesRespectsGrades.length; i++) {
    if (grade == mesRespectsGrades[i]) {
      greeting.value = `Mes respects, mon`;
    }
  }
  
}

const image_grade = (current_grade) => {
  return dict_grades[current_grade];
};

async function getAuthentification() {
  await new Promise(r => setTimeout(r, 1000));
  isAuthenticated.value = false;
  await auth0.isAuthenticated.value;
  let authentification_status = auth0.isAuthenticated.value;
  if (authentification_status === true){
    isAuthenticated.value = authentification_status;
  let utilisateur = await auth0.user.value;
  grade.value = await utilisateur.profile[1];
  grade_url.value = image_grade(grade.value);


  const sapeurs = ['Sap 1CL', 'Sap 2CL']
  if (grade.value == sapeurs[0] || grade.value == sapeurs[1]) {
    grade.value = `Sapeur`;
  }
  console.log(grade.value);
  changeGreeting(grade.value);
  }
}


for (let i = 0; i < 20; i++) {
  console.log('checking authentification');
  if (auth0.user.value === null) {
    getAuthentification();
  } else {
    getAuthentification();
    break;

  }
}

</script>

<style>
.Expiration {
  margin-top: 20px;
}
.introText {
  margin-top: 10px;
  margin-bottom: 15px;
  text-align: justify;
  font-size: 14px;
}
#grade_img {
  display: inline-block;
  vertical-align: text-bottom;
  margin-left: 5px;
  margin-right: 5px;
  border-radius: 7px;
  overflow: hidden;
  height: 25px;
}

</style>