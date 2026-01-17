<template>
  <div>
    <div class="subtitle">
      {{ greeting }} <span id="grade_img"> <img :src="grade_url"  width="25px" height="auto"></span>{{ grade }} !
    </div>
    <div class="introText">
      <introText :profile="getProfile()" />
    </div>
    <div @click="clicking" v-if="getProfile() != 'formation'">
      <nextExpiration :profile="getProfile()" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from '@/composables/useAuth.js';
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
import Infirmiere from '../assets/grades/Infirmière.png';

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
  'Professeur': Professeur,
  'Infirmière': Infirmiere
};

const grade = ref();
const greeting = ref("Bonjour,");
const grade_url = ref("https://github.com/lr-can/CMS_Collonges/blob/main/src/assets/logo.png?raw=true");

const currentProfile = ref(localStorage.getItem('currentProfile'));

const { user: authUser } = useAuth();

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

const getAuthInfo = async () => {
  const utilisateur = authUser.value;
  if (utilisateur && utilisateur.profile) {
    grade.value = utilisateur.profile[1] || '';
    grade_url.value = image_grade(grade.value);

    const sapeurs = ['Sap 1CL', 'Sap 2CL'];
    if (grade.value == sapeurs[0] || grade.value == sapeurs[1]) {
      grade.value = `Sapeur`;
    }
    changeGreeting(grade.value);
  }
};

const clicking = () => {
  // Fonction pour gérer le clic sur nextExpiration
};

const getProfile = () => {
  if (localStorage.getItem('currentProfile') == 'asup') {
    return 'asup';
  } else if (localStorage.getItem('currentProfile') == 'formation') {
    return 'formation';
  } else {
    return 'pharmacie';
  }
}

onMounted(async () => {
  await getAuthInfo();
});
</script>

<style scoped>
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

