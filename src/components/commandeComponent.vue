<template>
    <div class="commande">
        <div v-for="item in commande" :key="item.idMateriel" class="CommandeContainer">
            <div class="quantity">{{ item.quantity }} </div>
            <div class="nomCommande">{{ item.nomCommande }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps(['commande']);
const commande = ref(props.commande);

</script>

<style scoped>
.CommandeContainer{
    display: grid;
    grid-template-areas: 'quantity nomCommande nomCommande nomCommande';
    grid-template-columns: 0.5fr 4fr;
    gap: 1rem;
}
.nomCommande{
    grid-area: nomCommande;
    text-align: left;
}
.quantity{
    grid-area: quantity;
    text-align: center;

}
</style>