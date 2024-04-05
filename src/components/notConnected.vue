<template>
<div class="Alerte">
    <div class="messageErreur">
        <span id="redAlert">
        Non connecté
        </span>
    </div>
    <div id="message">
        Bonjour,
    </div>
    <div>
        Cette application est reservée au personnel dûment authentifié.
    </div>
    <div class="validationBtn" @click="redirect">
        Se connecter
    </div>
</div>
</template>
<script setup>
import { useAuth0 } from '@auth0/auth0-vue';
import {ref} from 'vue';
const auth0 = useAuth0();

const redirect = () => {
    auth0.loginWithRedirect();

}


</script>

<style>

</style>