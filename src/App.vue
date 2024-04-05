<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <div class="top-menu" id="logoCell">
        <nav>
        <RouterLink to="/">
          <img alt="CMS logo" class="logo" src="@/assets/logoTitle.png" width="170vh" height="auto" />
        </RouterLink>
      </nav>
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
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
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

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
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

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
