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
      {{ greeting }} {{ grade }} 🫡 !
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

async function getAuthentification() {
  await auth0.isAuthenticated.value;
  let authentification_status = auth0.isAuthenticated.value;
  isAuthenticated.value = authentification_status;
  let utilisateur = auth0.user.value;
  grade.value = utilisateur.profile[1];

  const sapeurs = ['Sap 1CL', 'Sap 2CL']
  if (grade.value == sapeurs[0] || grade.value == sapeurs[1]) {
    grade.value = `Sapeur`;
  }

  changeGreeting(grade.value);
}

isloading.value = false;

setTimeout(getAuthentification, 1000)
setTimeout(getAuthentification, 2000)


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
</style>