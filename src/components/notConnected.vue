<template>
<div class="Alerte">
    <div id="messageErreur">
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
    <div id="loginBtn" @click="redirect">
        Se connecter
    </div>
</div>
</template>
<script setup>
const redirect = () => {
    console.log('button clicked');
}
</script>

<style>
#messageErreur{
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 12px;
  border-radius: 5px;
  background-color: #fff4f4;
  color: #f60700;
  width: 30vw;
  text-align: center;
  height: 1.5rem;
  padding: 0.2rem 0;
}
#message{
  font-size: 16px;
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}
#loginBtn{
  margin-top: 2rem;
  border-radius: 20px;
  background-image: linear-gradient(to right bottom, #0078f3 5%, #18753c 100%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
  height: 2.2rem;
  text-align: center;
  padding: 0.4rem 0;
  color: white;
  max-width: 60vw;
  min-width: 15vw;
  margin-left: auto;
  margin-right: auto;
}
.Alerte{
    text-align: justify;
}
</style>