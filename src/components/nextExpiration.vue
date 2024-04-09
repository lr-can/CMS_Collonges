<template>
    <div v-for="row in NextPeremptions" :key="row.numeroLot">
        <div>{{ row.numLot }}</div>
        <div>{{ row.datePeremption }}</div>
        <div>{{ row.nomMateriel }}</div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";

const sqlStore = useSqlStore();
const NextPeremptions = ref([]);

async function getNextExpiration(){
    await sqlStore.getNextPeremptions();
    NextPeremptions.value = await sqlStore.NextPeremptions;
}
getNextExpiration();
</script>
<style>
</style>