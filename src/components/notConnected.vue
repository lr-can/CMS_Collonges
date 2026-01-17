<template>
<div class="Alerte">
    <div id="notConnected">
        
    </div>
    <div class="subtitle">
        Bonjour,
    </div>
    <div class="subsubtitle">
        Bienvenue sur CMS Collonges.
    </div>
    
    <!-- Formulaire de connexion pour les responsables -->
    <div class="login-section">
        <div class="paragraph">
            Cellule pharmacie, Correspondant ASUP
        </div>
        <LoginForm />
    </div>
    
    <div class="paragraph">
        Equipier SSUAP et ASUP
    </div>
    <div class="asupButton" @click="$router.push({ path: 'asupGrandPublic' })">
          <div><img src="@/assets/icons/asup.svg" width="50" height="auto" ></div>
          <div>Accès agents ASUP</div>
        </div>
    <div class="asupButton" id="RI" @click="$router.push({ path: 'RIGrandPublic' })">
          <div><img src="@/assets/icons/report.svg" id="RIimg" width="45" height="auto" ></div>
          <div>Retour d'Intervention</div>
        </div>
        <div id="access">
        <a href="mailto:lorcan@brenders.fr">Demander un accès</a>
    </div>
</div>
    <div class="mentionsLegales">
        <a href="https://ct-collonges.notion.site/CMS-Collonges-3102ab80539a4d81a57ac247f046fa15?pvs=4">Mentions légales & CGU</a>
    </div>
</template>
<script setup>
import LoginForm from './LoginForm.vue';
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
    text-align: center;
    font-size: 12px;
    background-color: #f0f0f0;
    padding: 0.5rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 300px;
    height: 100px;
    transition: all 0.3s ease-in-out;}
.asupButton:hover{
    background-color: #e0e0e0;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}
.asupButton div{
    font-weight: bold;
    font-size: 1rem;
    margin: auto;
}
#RI{
    margin-top: 1rem;
    background-color: #fff4f4;
    color : #f60700;
    transition: all 0.3s ease-in-out;
}
#RI:hover{
    background-color: #ffd7d7;
    color : #ff3634;
    cursor: pointer;
}

#RIimg{
    filter: invert(21%) sepia(39%) saturate(7109%) hue-rotate(353deg) brightness(87%) contrast(125%);
    display: block;
}

.login-section {
    margin: 2rem auto;
    max-width: 400px;
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
.paragraph{
    margin: auto;
    margin-top: 2rem;
    font-size: 1rem;
    margin-bottom: 1rem;
    text-align: center;
}


</style>
