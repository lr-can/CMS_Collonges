<template>
  <div class="text">
    <p>
      Bienvenue sur l'application de gestion de la cellule médico-secouriste de la Caserne de Collonges-Au-Mont-D'Or.
    </p>
    <p>
      Notre base de données recense {{  displayPeremptions.nbReserve }} produits dans la réserve, {{ displayPeremptions.nbVSAV }} disponibles pour les VSAV, soit un total de {{ displayPeremptions.nbTotal }} produits de {{ displayPeremptions.nbLotsTotal }} lots différents.
    </p>
    <p v-if="displayPeremptions.nbProduits == 0">
      Bonne nouvelle ! Aucune péremption n'est à signaler sur les 6 prochains mois !
    </p>
    <p v-else>
      Oh, oh ! <br> {{ displayPeremptions.nbProduits }} produits sont périmés ou vont l'être dans les 6 prochains mois.
      A titre informatif, {{ displayPeremptions.nbLots }} <span v-if="displayPeremptions.nbLots > 1">lots sont</span><span v-else>lot est</span> concerné<span v-if="displayPeremptions.nbLots > 1">s</span>.
    </p>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const displayPeremptions = ref({});
const sqlStore = useSqlStore();

async function getDisplayData(){
    await sqlStore.getPeremptionDisplay();
    displayPeremptions.value = await sqlStore.PeremptionsDisplayData;
}

getDisplayData();

</script>
<style>
p{
    margin-top: 10px
}
</style>