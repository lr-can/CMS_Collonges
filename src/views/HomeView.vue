<template>
  <div v-if="isloading">
    Chargement...
  </div>
  <div v-else>
    <div v-if="!isAuthenticated">
      <notConnected/>
    </div>
    <div v-if="isAuthenticated && currentProfile == ''">
      <div class="subtitle">
        Bonjour, {{ nomAgent }} !
      </div>
      <div class="subsubtitle">
        Choix du profil
      </div>
      <div class="card flex justify-center">
        <Listbox v-model="selectedProfile" :options="profilesList" optionLabel="label" class="w-full md:w-56" :disabled="profilesList.length <= 1" />
      </div>
      <div class="validationBtn" @click="profileSelection" v-if="profilesList.length > 0">
        Valider
      </div>
      <div v-else class="asupButton" @click="$router.push({ path: 'asupGrandPublic' })">
        <div><img src="@/assets/icons/asup.svg" width="50" height="auto" ></div>
        <div>Accès agents ASUP</div>
      </div>
    </div>
    <div v-if="isAuthenticated && currentProfile !== ''">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth0 } from '@auth0/auth0-vue';
import notConnected from '../components/notConnected.vue';
import nextExpiration from '../components/nextExpiration.vue';
import introText from '../components/introText.vue';
import Listbox from 'primevue/listbox';

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

const isAuthenticated = ref(false);
const grade = ref();
const greeting = ref("Bonjour,");
const isloading = ref(false);
const grade_url = ref("https://github.com/lr-can/CMS_Collonges/blob/main/src/assets/logo.png?raw=true");
const selectedProfile = ref(null);
const profilesList = ref([]);
const nomAgent = ref('');

if (!localStorage.getItem('currentProfile')) {
  localStorage.setItem('currentProfile', '');
}

const currentProfile = ref(localStorage.getItem('currentProfile'));

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

const changeProfile = (profile) => {
  if ( profile == 'Developpeur' || profile == 'Chef de Caserne') {
    profilesList.value = [
      { label: 'Gestion pharmacie', value: 'pharmacie' },
      { label: 'Gestion ASUP', value: 'asup' },
      { label: 'Gestion formation', value: 'formation' },
    ];
  } else if ( profile == 'Responsable Pharmacie') {
    profilesList.value = [
      { label: 'Gestion pharmacie', value: 'pharmacie' },
    ];
    selectedProfile.value = profilesList.value[0];
  } else if ( profile == 'Correspondant ASUP') {
    profilesList.value = [
      { label: 'Gestion ASUP', value: 'asup' },
    ];
    selectedProfile.value = profilesList.value[0];
  } else if ( profile == 'Responsable Formation') {
    profilesList.value = [
      { label: 'Gestion formation', value: 'formation' },
    ];
    selectedProfile.value = profilesList.value[0];
  } else {
    profilesList.value = [];
    for (const profil of profile.split("_")) {
      if (profil == 'pharmacie') {
        profilesList.value.push({ label: 'Gestion pharmacie', value: 'pharmacie' });
      } else if (profil == 'asup') {
        profilesList.value.push({ label: 'Gestion ASUP', value: 'asup' });
      } else if (profil == "formation"){
        profilesList.value.push({ label: 'Gestion formation', value: 'formation' });
      }
    }
  }
}

const profileSelection = () => {
  localStorage.setItem('currentProfile', selectedProfile.value.value);
  currentProfile.value = selectedProfile.value;
}

async function getAuthentification() {
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isFirefox = userAgent.includes("Firefox");
  const isChrome = userAgent.includes("Chrome") && !isSafari;

  try {
    if (isChrome || isFirefox) {
      // Authentification silencieuse pour Chrome et Firefox uniquement
      await auth0.getAccessTokenSilently();
      isAuthenticated.value = true;
      let utilisateur = await auth0.user.value;
      nomAgent.value = utilisateur.name;
      grade.value = utilisateur.profile[1];
      grade_url.value = image_grade(grade.value);

      let profile = utilisateur.profile[2];
      changeProfile(profile);

      const sapeurs = ['Sap 1CL', 'Sap 2CL'];
      if (grade.value == sapeurs[0] || grade.value == sapeurs[1]) {
        grade.value = `Sapeur`;
      }
      changeGreeting(grade.value);
    } else if (isSafari) {
      // Authentification requise pour Safari
      console.log('Authentification requise pour Safari');
    } else {
      // Authentification requise pour autres navigateurs
      console.log('Authentification requise pour un autre navigateur');
    }
  } catch (error) {
    if (error.error === 'login_required' || error.error === 'consent_required') {
      console.log('Authentification requise');
      isAuthenticated.value = false;
    } else {
      console.error('Erreur d\'authentification', error);
    }
  }
}

const getAuthInfo = async () => {
      console.log(auth0.user.value);
      let utilisateur = auth0.user.value;
      nomAgent.value = utilisateur.name;
      grade.value = utilisateur.profile[1];
      grade_url.value = image_grade(grade.value);

      let profile = utilisateur.profile[2];
      changeProfile(profile);

      const sapeurs = ['Sap 1CL', 'Sap 2CL'];
      if (grade.value == sapeurs[0] || grade.value == sapeurs[1]) {
        grade.value = `Sapeur`;
      }
      changeGreeting(grade.value);
}


onMounted(async () => {
  await getAuthentification();
  let profileCheck = setInterval(async () => {
    console.log('Checking profile');
    getAuthInfo();
    await auth0.checkSession();
    isAuthenticated.value = auth0.isAuthenticated.value;
    console.log("isAuthenticated: ", isAuthenticated.value);
    if (isAuthenticated.value == true) {
        clearInterval(profileCheck);
      }
  }, 2000);
});

const getProfile = () => {
  if (localStorage.getItem('currentProfile') == 'asup') {
    return 'asup';
  } else if (localStorage.getItem('currentProfile') == 'formation') {
    return 'formation';
  } else {
    return 'pharmacie';
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
.blank{
  background-color: white;
  height: 100dvh;
  position: absolute;
  top: 0;
  left: 0;
  width: 100dvw;
  z-index: 1000;
}
.blank > img{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>