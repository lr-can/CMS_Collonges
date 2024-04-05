<template>
  <div v-if="isloading">
    Chargement...
  </div>
  <div v-else>
  <div v-if="!isAuthenticated">
    <notConnected/>
  
  </div>

  <div v-if="isAuthenticated">
    Bienvenue, {{ nomUtilisateur }} !
  </div>
</div>
</template>
<script setup>
import { ref } from "vue";
import { useAuth0 } from '@auth0/auth0-vue';
import notConnected from '../components/notConnected.vue';

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

</style>