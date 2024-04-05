<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="top-menu" id="logoCell">
      <a href="/">
        <img alt="CMS logo" class="logo" src="@/assets/logoTitle.png" width="170vh" height="auto" />
      </a>
    </div>
    <div class="top-menu" id="profile">
      <nav>
        <RouterLink to="/profile"><img alt="Profile" src="@/assets/icons/profile.svg" width="30" height="auto" /></RouterLink>
      </nav>
    </div>
  </header>
  <div id="RouterView">
    <RouterView />
  </div>
  <div class="wrapper">
      <nav>
        <RouterLink to="/"><img alt="Profile" src="@/assets/icons/home.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/reception"><img alt="Reception" src="@/assets/icons/reception.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/disposition"><img alt="Disposition" src="@/assets/icons/disposition.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/search"><img alt="Search" src="@/assets/icons/search.svg" width="30" height="auto" /></RouterLink>
        <RouterLink to="/order"><img alt="Order" src="@/assets/icons/order.svg" width="30" height="auto" /></RouterLink>
      </nav>
    </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  display: flex;
  justify-content: space-between;
}

.top-menu{
  height: 15vh;
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
    left: 20vw;
    right: 20vw;
    bottom: 0.5rem;
    border-radius: 15px;
    opacity: 0.95;
  }

}
</style>
