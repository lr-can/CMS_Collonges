<template>
  <div v-if="notAuthenticated">
    <notConnected/>
  
  </div>

  <div v-if="!notAuthenticated">
    Bienvenue, {{ nomUtilisateur }} !
  </div>
</template>
<script setup>
import { ref } from "vue";
import notConnected from '../components/notConnected.vue'

const notAuthenticated = ref(true);

</script>

<style>

</style>