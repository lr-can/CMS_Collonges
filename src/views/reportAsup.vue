<template>
    <div class="subtitle">
        Rapport mensuel ASUP
    </div>
    <div>
        <div class="subsubtitle">
            Encore un peu de patience !
        </div>
        <div id="message">
            <img src="https://cdn.dribbble.com/users/1912990/screenshots/6496981/web_developing.gif" alt="Building" width="300px" height="auto">
        </div>
        <p id="message">
            La page que vous cherchez à atteindre est en cours de développement. Revenez plus tard !
        </p>
    </div>
</template>
<script setup>
import { ref } from 'vue';
</script>
<style scoped>
#message {
    margin: auto;
    text-align: center;
    margin-top: 3rem;
    margin-bottom: 1rem;
}

</style>