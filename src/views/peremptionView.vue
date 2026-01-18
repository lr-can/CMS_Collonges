<template>
    <div class="container">
      <div class="subtitle">
        Péremptions
      </div>
      <div class="subsubtitle">
        Péremption d'ici le {{ givePeremptionDate() }}
      </div>
      <div v-if="peremptionLoading" class="loading-container">
        <img src="../assets/loadingTiles.gif" alt="Chargement..." class="loading-image" />
      </div>
      <div v-else>
        <!-- Vue desktop : Tableau -->
        <div class="table-container">
          <table class="peremption-table">
            <thead>
              <tr>
                <th>Qté</th>
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
                <td>{{ formatDate(item.datePeremption) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Vue mobile : Cartes -->
        <div class="cards-container">
          <div 
            v-for="item in peremption" 
            :key="item.numLot + formatDate(item.datePeremption)"
            class="peremption-card"
          >
            <div class="card-header">
              <span class="card-title">{{ item.nomMateriel }}</span>
              <span class="card-badge">{{ item.Nombre }}</span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-label">Statut:</span>
                <span class="card-value">{{ item.nomStatut }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Numéro de Lot:</span>
                <span class="card-value">{{ item.numLot }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Date de Péremption:</span>
                <span class="card-value card-date">{{ formatDate(item.datePeremption) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .container {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
  
  .subtitle {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .subsubtitle {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  
  .loading-image {
    max-width: 100%;
    height: auto;
    width: 100%;
    max-width: 400px;
  }
  
  /* Vue desktop : Tableau */
  .table-container {
    width: 100%;
    overflow-x: auto;
    margin-top: 20px;
    display: block;
  }
  
  .peremption-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }
  
  .peremption-table th,
  .peremption-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
  }
  
  .peremption-table th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  .peremption-table tr:hover {
    background-color: #f9f9f9;
  }
  
  /* Vue mobile : Cartes */
  .cards-container {
    display: none;
    width: 100%;
    margin-top: 20px;
    gap: 15px;
  }
  
  .peremption-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
  }
  
  .peremption-card:active {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    flex: 1;
    margin-right: 10px;
  }
  
  .card-badge {
    background-color: #4a90e2;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
    min-width: 40px;
    text-align: center;
  }
  
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 0;
  }
  
  .card-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
    margin-right: 10px;
    flex-shrink: 0;
  }
  
  .card-value {
    font-size: 14px;
    color: #333;
    text-align: right;
    flex: 1;
    word-break: break-word;
  }
  
  .card-date {
    color: #d32f2f;
    font-weight: 600;
  }
  
  /* Media queries pour responsive */
  @media screen and (max-width: 768px) {
    .container {
      padding: 8px;
    }
    
    .subtitle {
      font-size: 20px;
      margin-bottom: 8px;
    }
    
    .subsubtitle {
      font-size: 16px;
      margin-bottom: 15px;
    }
    
    .loading-image {
      max-width: 300px;
    }
    
    /* Masquer le tableau sur mobile */
    .table-container {
      display: none;
    }
    
    /* Afficher les cartes sur mobile */
    .cards-container {
      display: flex;
      flex-direction: column;
    }
    
    .peremption-card {
      padding: 12px;
      margin-bottom: 12px;
    }
    
    .card-title {
      font-size: 15px;
    }
    
    .card-badge {
      font-size: 13px;
      padding: 5px 10px;
    }
    
    .card-label,
    .card-value {
      font-size: 13px;
    }
  }
  
  @media screen and (max-width: 480px) {
    .container {
      padding: 5px;
    }
    
    .subtitle {
      font-size: 18px;
    }
    
    .subsubtitle {
      font-size: 14px;
    }
    
    .peremption-card {
      padding: 10px;
    }
    
    .card-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .card-title {
      width: 100%;
      margin-right: 0;
    }
    
    .card-row {
      flex-direction: column;
      gap: 4px;
    }
    
    .card-value {
      text-align: left;
    }
  }
  
  /* Pour les très petits écrans */
  @media screen and (max-width: 360px) {
    .subtitle {
      font-size: 16px;
    }
    
    .subsubtitle {
      font-size: 13px;
    }
    
    .card-title {
      font-size: 14px;
    }
    
    .card-label,
    .card-value {
      font-size: 12px;
    }
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
  