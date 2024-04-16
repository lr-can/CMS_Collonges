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

const isAuthenticated = ref(true);
const grade = ref();
const greeting = ref("Bonjour,");
const isloading = ref(false);
const grade_url = ref("https://github.com/lr-can/CMS_Collonges/blob/main/src/assets/logo.png?raw=true");

const auth0 = useAuth0();

getAuthentification()

async function changeGreeting(grade) {
  const mesRespectsGrades = ['Lieutenant', 'Capitaine', 'Commandant', 'Colonel', 'Contrôleur Général'];
  const BonjourGradesAdj = ['Adjudant', 'Adjudant-Chef'];

  for (let j = 0; j < mesRespectsGrades.length; j++)
  if (grade ==BonjourGradesAdj[j]) {
    greeting.value = `Bonjour, mon`;
  }

  for (let i = 0; i < mesRespectsGrades.length; i++) {
    if (grade == mesRespectsGrades[i]) {
      greeting.value = `Mes respects, mon`;
    }
  }
  
}
const image_grade = (current_grade) => {
  return `https://github.com/lr-can/CMS_Collonges/blob/main/src/assets/grades/${current_grade}.png?raw=true`
};

async function getAuthentification() {
  isAuthenticated.value = false;
  await auth0.isAuthenticated.value;
  let authentification_status = auth0.isAuthenticated.value;
  isAuthenticated.value = authentification_status;
  let utilisateur = auth0.user.value;
  grade.value = utilisateur.profile[1];
  grade_url.value = image_grade(grade.value);


  const sapeurs = ['Sap 1CL', 'Sap 2CL']
  if (grade.value == sapeurs[0] || grade.value == sapeurs[1]) {
    grade.value = `Sapeur`;
  }

  changeGreeting(grade.value);
}

if (auth0.isAuthenticated.value == false) {
  setTimeout(getAuthentification, 1000)
  console.log("ici")
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