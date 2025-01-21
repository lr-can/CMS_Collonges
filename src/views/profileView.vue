<template>
    <div class="title">
      Profil
    </div>
    <div class="information-layout">
      <div class="information-grade">
        <img :src="image_grade(grade)" width="85vw" height="auto">
      </div>
      <div class="information-texte">
        <span id="grade">
          {{ grade }}
        </span>
        <br>
        <span id="nom">
          {{ nom }}
        </span>
        <br>
        <span id="matricule">{{ matricule }}</span>
      </div>
    </div>
    <div class="title">
      Rôle
    </div>
    <div class="information-layout">
      <div class="information-grade">
        <img :src="image_role(role)" width="85vw" height="auto">
      </div>
      <div class="information-texte">
        <span id="information-role">
          {{ role }}
        </span>
      </div>
    </div>
    <div>
      <div class="logoutBtns">
        <div @click="changeProfile" id="changeProfile">Changer de profil</div>
        <div @click="logout" id="logout">Se déconnecter</div>
      </div>
    </div>
    <div>
      <div class="versionNum">CMS Collonges | Version 2.2.0-{{commitBackend}}.{{commitFrontend}}<br><a href="https://ct-collonges.notion.site/CMS-Collonges-3102ab80539a4d81a57ac247f046fa15?pvs=4">Mentions légales & CGU</a></div>
    </div>
</template> 

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const sqlStore = useSqlStore();


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

const commitBackend = ref('0');
const commitFrontend = ref('0');

sqlStore.getLastCommitNumber('cms_collonges_backend').then((commit) => {
  if (commit === null) {
    commitBackend.value = '00';
  } else {
    commitBackend.value = commit;
  }
});

sqlStore.getLastCommitNumber('CMS_Collonges').then((commit) => {
  if (commit === null) {
    commitFrontend.value = '00';
  } else {
    commitFrontend.value = commit;
  }
});

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
  'Infirmière': Infirmiere,
  'Professeur': Professeur
};

import Developpeur from '../assets/roles/Developpeur.png';
import Responsable from '../assets/roles/Responsable Pharmacie.png';
import Chef from '../assets/roles/Chef de Caserne.png';
import Agent from '../assets/roles/Agent.png';
import Prof from '../assets/roles/Professeur.png';
import Multiples from '../assets/roles/Rôles multiples.png';
import ASUPCorrespondant from '../assets/roles/Correspondant ASUP.png';

const dict_roles = {
  'Developpeur': Developpeur,
  'Responsable Pharmacie': Responsable,
  'Chef de Caserne': Chef,
  'Agent': Agent,
  'Professeur': Prof,
  'Rôles multiples': Multiples,
  'Correspondant ASUP': ASUPCorrespondant
};

const auth0 = useAuth0();

let utilisateur = auth0.user.value;

const matricule = ref(utilisateur.profile[0]);
const grade = ref(utilisateur.profile[1]);
const nom = ref(utilisateur.name);
const role = ref(utilisateur.profile[2].replace(/_(.*)/, ''));

const showButtonProfile = ref(true);
if (role.value == 'Correspondant ASUP' || role.value == "Resonsable Pharmacie" || role.value == "Responsable Formation") {
  showButtonProfile.value = false;
}

const image_grade = (current_grade) => {
  return dict_grades[current_grade];
};

const image_role = (current_role) => {
  return dict_roles[current_role];
};

const logout = () => {
          auth0.logout({ 
            logoutParams: { 
              returnTo: window.location.origin
            } 
          })
    };

const changeProfile = () => {
  window.location.reload();
};
</script>
<style>
#grade{
  font-size: 12px;
}
#nom{
  font-weight: bold;
  font-size: 16px;
}
.information-grade{
  grid-area: grade;
}
.information-grade > img{
  border-radius: 20px;
}
.information-texte{
  grid-area: texte;
  padding: 0.5rem;
}
.information-layout{
  display: flex;
  grid-template-areas:
    'grade texte texte'
    'grade texte texte';
  margin-bottom: 2rem;
}
#information_role{
  margin-top: 1rem;
}
.versionNum{
  font-size: 12px;
  text-align: center;
  position: fixed;
  bottom: 6rem;
  width: 100%;
  left: 0;
}
.logoutBtns{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 3rem;
  margin-bottom: 5rem;
}
.logoutBtns > div{
  padding: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 5px;
}
@media (max-width: 768px) {
  .logoutBtns > div{
    margin-top: 1rem;
    min-width: 90%;
  }
  
}
#logout{
  color: white;
  background-color: #f60700;
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
}
#logout:hover{
  background-color: #ff5150;
  cursor: pointer;
}
#changeProfile{
  padding: 0.5rem;
  border-radius: 5px;
  color: #0078f3;
  border : 1px solid #0078f3;
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
}
#changeProfile:hover{
  background-color: #0078f3;
  color: white;
  cursor: pointer;
}

</style>