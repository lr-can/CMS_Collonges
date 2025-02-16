<template>
    <div class="subtitle">
      Péremptions
    </div>
    <div class="subsubtitle">
      Péremption d'ici le {{ givePeremptionDate() }}
    </div>
    <div v-if="peremptionLoading">
      <img src="../assets/loadingTiles.gif" alt="Chargement..." width="400px" height="auto" />
    </div>
    <div v-else class="table-container">
      <table class="peremption-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Matériel</th>
            <th>Statut</th>
            <th>Numéro de Lot</th>
            <th>Date de Péremption</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in peremption" :key="item.numLot + formatDate(item.datePeremption)">
            <td>{{ item.Nombre }}</td>
            <td>{{ item.nomMateriel }}</td>
            <td>{{ item.nomStatut }}</td>
            <td>{{ item.numLot }}</td>
            <td>{{ item.datePeremption}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <style scoped>
  .subtitle {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .subsubtitle {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .table-container {
    width: 100%;
    overflow-x: auto;
    margin-top: 20px;
  }
  
  .peremption-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .peremption-table th,
  .peremption-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    white-space: nowrap; /* Prevents text from wrapping */
  }
  
  .peremption-table th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  .peremption-table tr:hover {
    background-color: #f9f9f9;
  }
  </style>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  import { useSqlStore } from "@/stores/database.js";
  
  const sqlStore = useSqlStore();
  
  const peremption = ref([]);
  const peremptionLoading = ref(true);
  
  onMounted(async () => {
    const data = await sqlStore.getPeremptionAndCount();
    console.log(data);
    peremption.value = data;
    peremptionLoading.value = false;
  });
  
  const givePeremptionDate = () => {
    const now = new Date();
    const twoMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return twoMonthsFromNow.toLocaleDateString();
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  </script>
  