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
      <div class="subsubtitle">
        <span id="toggle">
          <img src="@/assets/illustrations/arrow.svg" alt="" width="14px" height="auto" :class="isClicked()"></span>
        Prochaines péremptions
      </div>
      <Transition>
        <div class="Expiration" v-show="showExpiration">
          <nextExpiration/>
        </div>
    </Transition>
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
const showExpiration = ref(false);

const auth0 = useAuth0();

getAuthentification()

const clicking = () => {
  showExpiration.value = !showExpiration.value;
}

const isClicked  = ()=> {
  if (showExpiration.value == true){
    return "clicked"
  }
  else{
    return "notClicked"
  }
}

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
  margin-top: 10px;
  margin-bottom: 15px;
  text-align: justify;
  font-size: 14px;
}
#toggle{
  vertical-align: middle;
}
.clicked{
  transform: rotate(90deg);
  transition: transform 0.3s ease-in-out;
}

.notClicked{
  transform: rotate(0deg);
  transition: transform 0.3s ease-in-out;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>