<template>
    <div class="subtitle">
        Simulation d'un ordre de départ
    </div>
    <div class="full" v-if="verifyIfPhone()">
        <useComputer></useComputer>
    </div>
</template>

<script setup>
import useComputer from '../components/useComputer.vue';
import { ref, onMounted } from "vue";

const verifyIfPhone = () => {
    console.log(window.innerWidth);
    return window.innerWidth < 768;
}
</script>

<style scoped>
.full {
    width: 100%;
}
</style>