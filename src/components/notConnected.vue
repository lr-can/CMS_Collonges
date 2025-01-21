<template>
<div class="Alerte">
    <div id="notConnected">
        
    </div>
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
    <div id="access">
        <a href="mailto:lorcan@brenders.fr">Demander un accès</a>
    </div>
    <div class="asupButton" @click="$router.push({ path: 'asupGrandPublic' })">
        <div><img src="@/assets/icons/asup.svg" width="50" height="auto" ></div>
        <div>Accès agents ASUP</div>
        </div>
</div>
    <div class="mentionsLegales">
        <a href="https://ct-collonges.notion.site/CMS-Collonges-3102ab80539a4d81a57ac247f046fa15?pvs=4">Mentions légales & CGU</a>
    </div>
</template>
<script setup>
import { useAuth0 } from '@auth0/auth0-vue';

const auth0 = useAuth0();

const redirect = () => {
    auth0.loginWithRedirect();

}

</script>

<style>
#access{
    margin: auto;
    margin-top: 2rem;
    text-align: center;
    font-size: 12px;
}
.asupButton{
    margin: auto;
    margin-top: 3rem;
    text-align: center;
    font-size: 12px;
    background-color: #f0f0f0;
    padding: 0.5rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
}
.asupButton div{
    font-weight: bold;
    font-size: 1rem;
    margin: auto;
}
.asupButton div img{
    opacity: 0.7;
}
.mentionsLegales{
    margin: auto;
    position: fixed;
    bottom: 3rem;
    right: 1rem;
    text-align: right;
    font-size: 12px;
    width: 100%;
    margin-bottom: 2rem;
}
.mentionsLegales > a{
    color : #7b7b7b;
}



</style>