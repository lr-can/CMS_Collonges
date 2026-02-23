<template>
  <div class="kit-inventaire-container">
    <div class="subtitle">Inventaire des kits</div>
    <div class="subsubtitle">
      Kits dont la date de péremption est dans moins de 2 mois – à modifier si nécessaire.
    </div>
    <RouterLink to="/kits/create" class="create-kit-link">
      Créer un kit
    </RouterLink>
    <div v-if="loading" class="loading-container">
      <img src="@/assets/loadingTiles.gif" alt="Chargement..." class="loading-image" />
    </div>
    <div v-else>
      <div v-if="kitsPerimes.length === 0" class="empty-state">
        Aucun kit à inventorier (péremption dépassée).
      </div>
      <div v-else class="kits-list">
        <div
          v-for="kit in kitsPerimes"
          :key="kit.idKit"
          class="kit-card"
          @click="openKitDetail(kit.idKit)"
        >
          <div class="kit-card-header">
            <span class="kit-id">{{ kit.idKit }}</span>
            <span v-if="estDejaPerime(kit.datePeremption)" class="status-badge status-perime">Périmé</span>
            <span v-else class="status-badge status-bientot">Périme bientôt</span>
          </div>
          <div class="kit-card-body">
            <div class="kit-row">
              <span class="kit-label">Type :</span>
              <span class="kit-value">{{ kit.nomKit }}</span>
            </div>
            <div class="kit-row">
              <span class="kit-label">Date péremption :</span>
              <span class="kit-value kit-date-perime">{{ formatDate(kit.datePeremption) }}</span>
            </div>
          </div>
          <div class="kit-card-footer">
            <span class="open-hint">Cliquez pour ouvrir la fiche</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useSqlStore } from '@/stores/database.js';

const sqlStore = useSqlStore();
const kitsPerimes = ref([]);
const loading = ref(true);

function formatDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('fr-FR');
}

function estDejaPerime(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && d < new Date();
}

async function loadKits() {
  loading.value = true;
  try {
    kitsPerimes.value = await sqlStore.getKitsPerimantBientot();
  } catch (e) {
    console.error(e);
    kitsPerimes.value = [];
  } finally {
    loading.value = false;
  }
}

function openKitDetail(idKit) {
  const url = sqlStore.getKitDetailUrl(idKit);
  window.open(url, '_blank', 'noopener,noreferrer');
}

onMounted(loadKits);
</script>

<style scoped>
.kit-inventaire-container {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
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
  max-width: 400px;
}

.create-kit-link {
  display: inline-block;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f4f6ff;
  color: #0063cb;
  border: 1px solid #0063cb;
  border-radius: 20px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.create-kit-link:hover {
  background-color: #d6deff;
}

.empty-state {
  margin-top: 2rem;
  padding: 2rem;
  text-align: center;
  background-color: #f6f6f6;
  border-radius: 20px;
  color: #666;
}

.kits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.kit-card {
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: box-shadow 0.2s, background-color 0.2s;
}

.kit-card:hover {
  background-color: #f4f6ff;
  box-shadow: 0 4px 12px rgba(0, 99, 203, 0.15);
}

.kit-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.kit-id {
  font-weight: 700;
  color: #0063cb;
  font-size: 1rem;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-perime {
  background-color: #fff4f4;
  color: #ce0500;
}

.status-bientot {
  background-color: #fff8e6;
  color: #b86d00;
}

.kit-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.kit-row {
  display: flex;
  gap: 0.5rem;
}

.kit-label {
  font-weight: 600;
  color: #666;
  min-width: 130px;
}

.kit-value {
  color: #333;
}

.kit-date-perime {
  color: #ce0500;
}

.kit-card-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
}

.open-hint {
  font-size: 0.85rem;
  color: #0063cb;
}

@media (min-width: 1024px) {
  .kit-inventaire-container {
    max-width: 700px;
  }

  .kits-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
