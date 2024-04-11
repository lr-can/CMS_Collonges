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
      <div @click="logout" id="logout">
        Se déconnecter
      </div>
    </div>
</template> 

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';
import { ref } from 'vue';

const auth0 = useAuth0();

let utilisateur = auth0.user.value;

const matricule = ref(utilisateur.profile[0]);
const grade = ref(utilisateur.profile[1]);
const nom = ref(utilisateur.name);
const role = ref(utilisateur.profile[2]);

const image_grade = (current_grade) => {
  return `src/assets/grades/${current_grade}.png?raw=true`
};

const image_role = (current_role) => {
  return `src/assets/roles/${current_role}.png?raw=true`
};

const logout = () => {
          auth0.logout({ 
            logoutParams: { 
              returnTo: window.location.origin
            } 
          })
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
#logout{
  margin-top: 5rem;
  color: red;
  font-size: 16px;
  text-align: center;
}
#information_role{
  margin-top: 1rem;
}
</style>