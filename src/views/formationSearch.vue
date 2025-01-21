<template>
    <div class="subtitle">
        Recherche par type de FMPA
    </div>
    <gSheetBtn :typeBtn="'partial'"></gSheetBtn>
</template>

<script setup>
import { ref, onMounted } from "vue";
import gSheetBtn from '../components/gSheetBtnReduce.vue';
</script>

<style scoped>
/* Your component styles go here */
</style>