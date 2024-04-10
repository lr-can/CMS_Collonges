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
      Bienvenue, {{ nomUtilisateur }} !
    </div>
    <div class="introText">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi dolorum veniam iure quam numquam distinctio laudantium eaque possimus esse sed, corrupti neque. Perspiciatis dicta iure cumque! In doloremque deleniti cumque.
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

const isAuthenticated = ref(true);
const nomUtilisateur = ref();
const isloading = ref(false);

const auth0 = useAuth0();

getAuthentification()

async function getAuthentification() {
  await auth0.isAuthenticated.value;
  let authentification_status = auth0.isAuthenticated.value;
  isAuthenticated.value = authentification_status;
  let utilisateur = auth0.user.value;
  console.log(utilisateur)
  nomUtilisateur.value = utilisateur.name;
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