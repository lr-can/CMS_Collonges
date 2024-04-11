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
      {{ greeting }} {{ grade }} !
    </div>
    <div class="introText">
      <introText/>
    </div>
    <div class="Expiration">
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
const greeting = ref("Bonjour");
const isloading = ref(false);

const auth0 = useAuth0();

getAuthentification()

async function changeGreeting(grade) {
  const mesRespectsGrades = ['Lieutenant', 'Capitaine', 'Commandant', 'Colonel', 'Contrôleur Général'];
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
  console.log(utilisateur)
  grade.value = utilisateur.profile[1];
  changeGreeting(grade.value);
}

isloading.value = false;

setTimeout(getAuthentification, 1000)


</script>

<style>
.Expiration {
  margin-top: 20px;
}
.introText {
  margin-top: 20px;
  text-align: justify;
}
</style>