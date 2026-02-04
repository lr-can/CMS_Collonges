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
                <th>Quantité</th>
                <th>Matériel</th>
                <th>Statut</th>
                <th>Numéro de Lot</th>
                <th>Date de Péremption</th>
                <th>IDs</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in peremption" :key="item.numLot + formatDate(item.datePeremption)">
                <td>
                  <span class="quantity-badge">{{ item.Nombre }}</span>
                </td>
                <td>{{ item.nomMateriel }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(item.nomStatut)">
                    {{ item.nomStatut }}
                  </span>
                </td>
                <td>{{ item.numLot }}</td>
                <td>
                  <span :class="{ 'invalid-date': isInvalidDate(item.datePeremption) }">
                    {{ formatDate(item.datePeremption) }}
                  </span>
                </td>
                <td>
                  <div v-if="item.id_list && item.id_list.length > 0" class="ids-container">
                    <span 
                      v-for="(id, index) in item.id_list" 
                      :key="index" 
                      class="id-chip"
                    >
                      {{ id }}
                    </span>
                  </div>
                  <span v-else class="no-ids">-</span>
                </td>
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
              <span class="card-badge">Quantité: {{ item.Nombre }}</span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-label">Statut:</span>
                <span class="card-value">
                  <span class="status-badge" :class="getStatusClass(item.nomStatut)">
                    {{ item.nomStatut }}
                  </span>
                </span>
              </div>
              <div class="card-row">
                <span class="card-label">Numéro de Lot:</span>
                <span class="card-value">{{ item.numLot }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Date de Péremption:</span>
                <span class="card-value" :class="{ 'card-date': !isInvalidDate(item.datePeremption), 'invalid-date': isInvalidDate(item.datePeremption) }">
                  {{ formatDate(item.datePeremption) }}
                </span>
              </div>
              <div class="card-row card-ids-row">
                <span class="card-label">IDs:</span>
                <div v-if="item.id_list && item.id_list.length > 0" class="ids-container">
                  <span 
                    v-for="(id, index) in item.id_list" 
                    :key="index" 
                    class="id-chip"
                  >
                    {{ id }}
                  </span>
                </div>
                <span v-else class="no-ids">-</span>
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
  }

  .peremption-table td:last-child {
    white-space: normal;
  }

  .peremption-table .ids-container {
    max-width: 300px;
  }
  
  .peremption-table th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  .peremption-table tr:hover {
    background-color: #f9f9f9;
  }

  .peremption-table .status-badge {
    font-size: 12px;
    padding: 3px 10px;
  }

  @media screen and (min-width: 1024px) {
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 2rem;
    }

    .table-container {
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      overflow: hidden;
      background-color: #fff;
    }

    .peremption-table th,
    .peremption-table td {
      padding: 14px 16px;
    }
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
    color: rgb(0, 0, 0);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
    white-space: nowrap;
    min-width: 60px;
    text-align: center;
  }

  .quantity-badge {
    display: inline-block;
    background-color: #4a90e2;
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    min-width: 35px;
  }

  .ids-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .id-chip {
    display: inline-block;
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid #90caf9;
  }

  .no-ids {
    color: #999;
    font-style: italic;
    font-size: 13px;
  }

  .card-ids-row {
    flex-wrap: wrap;
  }

  .card-ids-row .card-label {
    width: 100%;
    margin-bottom: 6px;
  }

  .card-ids-row .ids-container {
    width: 100%;
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

  .invalid-date {
    color: #999;
    font-style: italic;
    font-weight: 500;
  }

  /* Styles pour les badges de statut */
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
  }

  .status-vsav {
    background-color: #004985;
    color: white;
  }

  .status-pharmacy {
    background-color: #975b00;
    color: white;
  }

  .status-default {
    background-color: #f44336;
    color: white;
  }

  /* Styles pour les dates invalides dans le tableau */
  .peremption-table .invalid-date {
    color: #999;
    font-style: italic;
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
    if (!dateString || dateString === 'INVALID' || dateString === 'Invalid Date' || dateString === 'null' || dateString === 'undefined') {
      return 'Date invalide';
    }
    try {
      // Gérer le format DD/MM/YYYY (ex: "28/01/2026")
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Les mois sont 0-indexés en JavaScript
          const year = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
            return date.toLocaleDateString('fr-FR');
          }
        }
      }
      // Essayer le format standard
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  const isInvalidDate = (dateString) => {
    if (!dateString || dateString === 'INVALID' || dateString === 'Invalid Date' || dateString === 'null' || dateString === 'undefined') {
      return true;
    }
    try {
      // Gérer le format DD/MM/YYYY (ex: "28/01/2026")
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Les mois sont 0-indexés en JavaScript
          const year = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime()) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
            return false; // Date valide
          }
        }
      }
      // Essayer le format standard
      const date = new Date(dateString);
      return isNaN(date.getTime());
    } catch (error) {
      return true;
    }
  };

  const getStatusClass = (statut) => {
    if (!statut) return 'status-default';
    const statutLower = statut.toLowerCase().trim();
    
    // Mapping des statuts vers des classes CSS
    if (statutLower === 'dispo vsav') {
      return 'status-vsav';
    } else if (statutLower === 'réserve pharmacie' || statutLower === 'reserve pharmacie') {
      return 'status-pharmacy';
    }
    
    return 'status-default';
  };
  </script>
  