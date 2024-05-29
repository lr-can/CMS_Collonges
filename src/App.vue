<script setup>
console.log(`%cFait avec amour 🫶, sueur 💪💦 et larmes 🥹 par le Caporal Lorcan BRENDERS pour un stage de projet universitaire.`, "background-color: #f4f6ff; color: #0078f3; text-align:justify; padding: 1rem; border-radius: 1rem;font-size:20px;font-weight:bold;");

import { RouterLink, RouterView } from 'vue-router';
import { useAuth0 } from '@auth0/auth0-vue';
import {ref} from 'vue';
import errorWriting from './components/errorWriting.vue';
const auth0 = useAuth0();
const isAuthenticated = ref(auth0.isAuthenticated);
const prof = ref(false);
const appLoading = ref(true);
async function getAuthentification(){
  await new Promise(r => setTimeout(r, 1000));
}
async function isProf(){
  await new Promise(r => setTimeout(r, 1000));
  let utilisateur = await auth0.user.value;
  let role = await utilisateur.profile[2];
  if (role === 'Professeur'){
    prof.value = true;
  }
}
for (let i = 0; i < 20; i++) {
  console.log('checking authentification');
  if (isAuthenticated.value === null) {
    getAuthentification();
  } else {
    getAuthentification();
    isAuthenticated.value = auth0.isAuthenticated;
    isProf();
  }
}
setTimeout(() => {
  appLoading.value = false;
}, 2000);
</script>

<template>
    <transition>
      <div v-if="appLoading" class="blank">
    <img src="@/assets/loadingApp.gif" alt="Loading" width="150px" height="auto">
    </div>
  </transition>
  <header>
    <div class="top-menu" id="logoCell">
      <a href="/">
        <img alt="CMS logo" class="logo" src="@/assets/logoTitle.png" width="170vh" height="auto" />
      </a>
    </div>
    <div class="top-menu" id="profile">
      <nav>
        <RouterLink to="/profile" v-if="isAuthenticated"><img alt="Profile" src="@/assets/icons/profile.svg" width="30" height="auto" /></RouterLink>
      </nav>
    </div>
  </header>
  <div v-if="prof">
    <errorWriting />
  </div>
  <div id="RouterView">
    <RouterView />
  </div>
  <div class="wrapper">
      <nav>
        <RouterLink to="/"><img alt="Profile" src="@/assets/icons/home.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/reception" v-if="isAuthenticated"><img alt="Reception" src="@/assets/icons/reception.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/disposition" v-if="isAuthenticated"><img alt="Disposition" src="@/assets/icons/disposition.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/search" v-if="isAuthenticated"><img alt="Search" src="@/assets/icons/search.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/order" v-if="isAuthenticated"><img alt="Order" src="@/assets/icons/order.svg" width="30" height="auto" /></RouterLink>
      </nav>
    </div>
</template>

<style scoped>
header {
  line-height: 1;
  max-height: 20vh;
  display: flex;
  justify-content: space-between;
}

.top-menu{
  height: 12vh;
  padding: 0px;
}

#profile{
  padding: auto; 
}

#RouterView{
  padding: 1.5rem;
}
.logo {
  display: block;
  margin: 0 auto 2rem;
}

#logoNav{
  opacity: 1;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a.router-link-exact-active {
  opacity: 0.25;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.wrapper{
    position: fixed; 
    bottom: 0;
    left: 0;
    right: 0;
    height: 15vw;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
}
@media (min-width: 1024px) {
  .wrapper{
    height: 5vw;
    left: 35vw;
    right: 35vw;
    bottom: 0.5rem;
    border-radius: 15px;
    opacity: 0.95;
  }

}
</style>
