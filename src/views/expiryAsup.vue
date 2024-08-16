<template>
    <div class="subtitle">
        Gestion des péremptions ASUP
    </div>
    <div v-if="pageLoading">
        <img src="@/assets/loadingTiles.gif" alt="Loading" width="100%" height="auto">
    </div>
    <div v-if="showDocument">
        <DocusealForm
        :src="'https://docuseal.co/d/eenfBUR2pauqbw'"
        :email="'lorcan.brenders@gmail.com'"
        @complete="onComplete"
        :remember-signature="true"
        :values="documentData"
        />
    </div>
  </template>
  
  <script setup>
  import { DocusealForm } from '@docuseal/vue';
  import { ref } from 'vue';
  import { useAuth0 } from '@auth0/auth0-vue';

  const auth0 = useAuth0();


    const onComplete = (data) => {
        console.log(data);
        showDocument.value = false;
    }
    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleDateString('fr-FR');

    const pageLoading = ref(true);

    const date1 = ref(formattedDate);
    const date2 = ref(formattedDate);

    const vsav1 = ref(1);
    const vsav2 = ref(2);

    const nbSalbuta5mg25ml1 = ref(0);
    const nbSalbuta5mg25ml2 = ref(0);

    const nbIpra05mg25ml1 = ref(0);
    const nbIpra05mg25ml2 = ref(0);

    const nbSalbuta25mg25ml1 = ref(0);
    const nbSalbuta25mg25ml2 = ref(0);

    const nbIpra025mgml1 = ref(0);
    const nbIpra025mgml2 = ref(0);

    const nbNyxoid1 = ref(0);
    const nbNyxoid2 = ref(0);

    const nbAnapen1501 = ref(0);
    const nbAnapen1502 = ref(0);

    const nbAnapen3001 = ref(0);
    const nbAnapen3002 = ref(0);

    const nbAnapen5001 = ref(0);
    const nbAnapen5002 = ref(0);

    const nomCorrespondant1 = ref('');
    const nomCorrespondant2 = ref('');
    const email = ref('');

    const documentData = ref({});

    const showDocument = ref(false);

    const generateDocumentData = async () => {
        const utilisateur = auth0.user.value;
        email.value = utilisateur.email;
        nomCorrespondant1.value = utilisateur.name;
        nomCorrespondant2.value = utilisateur.name;
        await new Promise(r => setTimeout(r, 5000));
            vsav1.value = 1;
            vsav2.value = 2;
            nbSalbuta5mg25ml1.value = 1;
            nbSalbuta5mg25ml2.value = 2;
            nbIpra05mg25ml1.value = 3;
            nbIpra05mg25ml2.value = 4;
            nbSalbuta25mg25ml1.value = 5;
            nbSalbuta25mg25ml2.value = 6;
            nbIpra025mgml1.value = 7;
            nbIpra025mgml2.value = 8;
            nbNyxoid1.value = 9;
            nbNyxoid2.value = 10;
            nbAnapen1501.value = 11;
            nbAnapen1502.value = 12;
            nbAnapen3001.value = 13;
            nbAnapen3002.value = 14;
            nbAnapen5001.value = 15;
            nbAnapen5002.value = 16;

        documentData.value = {
            date1: date1.value,
            date2: date2.value,
            vsav1: vsav1.value,
            vsav2: vsav2.value,
            nbSalbuta5mg25ml1: nbSalbuta5mg25ml1.value,
            nbSalbuta5mg25ml2: nbSalbuta5mg25ml2.value,
            nbIpra05mg25ml1: nbIpra05mg25ml1.value,
            nbIpra05mg25ml2: nbIpra05mg25ml2.value,
            nbSalbuta25mg25ml1: nbSalbuta25mg25ml1.value,
            nbSalbuta25mg25ml2: nbSalbuta25mg25ml2.value,
            nbIpra025mgml1: nbIpra025mgml1.value,
            nbIpra025mgml2: nbIpra025mgml2.value,
            nbNyxoid1: nbNyxoid1.value,
            nbNyxoid2: nbNyxoid2.value,
            nbAnapen1501: nbAnapen1501.value,
            nbAnapen1502: nbAnapen1502.value,
            nbAnapen3001: nbAnapen3001.value,
            nbAnapen3002: nbAnapen3002.value,
            nbAnapen5001: nbAnapen5001.value,
            nbAnapen5002: nbAnapen5002.value,
            nomCorrespondant1: nomCorrespondant1.value,
            nomCorrespondant2: nomCorrespondant2.value
        }
        pageLoading.value = false;
        showDocument.value = true;
    }
    generateDocumentData();
  
  </script>
  
<style scoped>
</style>