<template>
  <div class="kit-create-container">
    <div class="subtitle">Création d'un kit</div>
    <div class="subsubtitle">
      Créez un nouveau kit physique (sans contenu). Vous pourrez le réaliser ensuite avec les articles du catalogue.
    </div>
    <form class="kit-form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="nomKit">Type de kit <span class="mandatory">*</span></label>
        <Dropdown
          id="nomKit"
          v-model="selectedNomKit"
          :options="nomsKits"
          optionLabel="nomKit"
          placeholder="Sélectionnez un type de kit"
          class="form-item"
          @change="onNomKitChange"
        />
      </div>
      <div class="form-group">
        <label for="idKit">Numéro du kit <span class="mandatory">*</span></label>
        <div class="idkit-row">
          <InputText
            id="idKit"
            v-model="idKit"
            class="form-item form-item-large"
            placeholder="Ex. KIT-ACC-2025-001"
          />
          <button type="button" class="suggestion-btn" @click="fetchSuggestion" :disabled="loadingSuggestion">
            {{ loadingSuggestion ? '...' : 'Suggérer' }}
          </button>
        </div>
        <span v-if="idKitError" class="error-message">{{ idKitError }}</span>
      </div>
      <div class="form-group">
        <label for="matricule">Créateur (matricule) <span class="mandatory">*</span></label>
        <div class="createur-row">
          <InputText
            id="matricule"
            v-model="matricule"
            class="form-item form-item-large"
            placeholder="V99999"
            :class="{ 'p-invalid': agentError }"
            @keyup.enter="fetchAgentInfo"
          />
          <button type="button" class="suggestion-btn" @click="fetchAgentInfo" :disabled="!canFetchAgent || loadingAgent">
            {{ loadingAgent ? '...' : 'Rechercher' }}
          </button>
        </div>
        <div v-if="agentInfo" class="agent-info">
          <img v-if="gradeImageUrl" :src="gradeImageUrl" width="32" height="32" alt="" class="grade-img" />
          <span class="agent-name">{{ createurNom }}</span>
          <span class="matricule-chip">{{ matricule }}</span>
          <a href="#" class="reset-link" @click.prevent="resetAgent">Changer</a>
        </div>
        <span v-if="agentError" class="error-message">{{ agentError }}</span>
      </div>
      <div class="validationBtn" :class="{ disabled: !isFormValid || loading }" @click="submitForm">
        <span v-if="loading">Création en cours...</span>
        <span v-else>Créer le kit</span>
      </div>
    </form>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="messageErreur">
      <span id="redAlert">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { useSqlStore } from '@/stores/database.js';
import { useMatricule } from '@/composables/useMatricule.js';
import { loadAuthFromStorage } from '@/composables/useAuth.js';
import Sap2CL from '@/assets/grades/Sap 2CL.png';
import Sap1CL from '@/assets/grades/Sap 1CL.png';
import Caporal from '@/assets/grades/Caporal.png';
import CaporalChef from '@/assets/grades/Caporal-Chef.png';
import Sergent from '@/assets/grades/Sergent.png';
import SergentChef from '@/assets/grades/Sergent-Chef.png';
import Adjudant from '@/assets/grades/Adjudant.png';
import AdjudantChef from '@/assets/grades/Adjudant-Chef.png';
import Lieutenant from '@/assets/grades/Lieutenant.png';
import Capitaine from '@/assets/grades/Capitaine.png';
import Commandant from '@/assets/grades/Commandant.png';
import Professeur from '@/assets/grades/Professeur.png';
import Infirmiere from '@/assets/grades/Infirmière.png';

const dictGrades = {
  'Sap 2CL': Sap2CL,
  'Sap 1CL': Sap1CL,
  'Caporal': Caporal,
  'Caporal-Chef': CaporalChef,
  'Sergent': Sergent,
  'Sergent-Chef': SergentChef,
  'Adjudant': Adjudant,
  'Adjudant-Chef': AdjudantChef,
  'Lieutenant': Lieutenant,
  'Capitaine': Capitaine,
  'Commandant': Commandant,
  'Professeur': Professeur,
  'Infirmière': Infirmiere
};

const sqlStore = useSqlStore();
const { getStoredMatricule, getStoredAgentInfo, saveMatricule, saveAgentInfo } = useMatricule();

const nomsKits = ref([]);
const selectedNomKit = ref(null);
const idKit = ref('');
const matricule = ref('');
const createurNom = ref('');
const createurId = ref('');
const agentInfo = ref(null);
const agentError = ref('');
const loading = ref(false);
const loadingSuggestion = ref(false);
const loadingAgent = ref(false);
const idKitError = ref('');
const successMessage = ref('');
const errorMessage = ref('');

const gradeImageUrl = computed(() => {
  const grade = agentInfo.value?.grade;
  return grade ? dictGrades[grade] || null : null;
});

const canFetchAgent = computed(() => {
  return matricule.value?.trim().startsWith('V') && matricule.value?.trim().length === 6;
});

const isFormValid = computed(() => {
  return !!selectedNomKit.value?.nomKit && !!idKit.value?.trim() && !!createurNom.value?.trim() && (!!agentInfo.value || !!(createurId.value || matricule.value?.trim()));
});

function onNomKitChange() {
  idKitError.value = '';
  fetchSuggestion();
}

async function fetchSuggestion() {
  if (!selectedNomKit.value?.nomKit) return;
  loadingSuggestion.value = true;
  idKitError.value = '';
  try {
    const suggestion = await sqlStore.getKitsNextIdKit(selectedNomKit.value.nomKit);
    if (suggestion) {
      idKit.value = suggestion;
    }
  } finally {
    loadingSuggestion.value = false;
  }
}

async function loadNomsKits() {
  nomsKits.value = await sqlStore.getKitsNomsKits();
}

function normalizeAgentResponse(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return null;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  if (raw.data && typeof raw.data === 'object') return raw.data;
  if (raw.message && !raw.nomAgent && !raw.nom) return null;
  return raw;
}

function buildAgentFromResult(result) {
  const r = normalizeAgentResponse(result);
  if (!r || (typeof r === 'object' && r.message && !r.nomAgent)) return null;
  const m = r.matricule || matricule.value?.trim();
  const nom = (r.nomAgent || r.nom || '').toString().toUpperCase();
  const prenom = (r.prenomAgent || r.prenom || '').toString();
  const grade = r.grade || null;
  const createurNomStr = (nom && prenom ? `${nom} ${prenom}` : (r.nomAgent || r.nom || '') + ' ' + (r.prenomAgent || r.prenom || '')).trim() || m;
  return { matricule: m, grade, nomAgent: nom || r.nomAgent, prenomAgent: prenom || r.prenomAgent, createurNomStr };
}

function buildAgentFromAuthUser(user) {
  if (!user?.profile?.[0]) return null;
  const m = user.profile[0];
  if (m !== matricule.value?.trim()) return null;
  const grade = user.profile[1] || null;
  const name = user.name || '';
  const parts = name.trim().split(/\s+/);
  const createurNomStr = parts.length >= 2
    ? `${(parts[parts.length - 1] || '').toUpperCase()} ${(parts[0] || '')}`
    : name;
  return { matricule: m, grade, nomAgent: parts[parts.length - 1], prenomAgent: parts[0], createurNomStr };
}

async function fetchAgentInfo() {
  if (!canFetchAgent.value || loadingAgent.value) return;
  agentError.value = '';
  loadingAgent.value = true;
  const m = matricule.value.trim();
  let agent = null;

  try {
    try {
      const result = await sqlStore.getAgentByMatricule(m);
      agent = buildAgentFromResult(result);
    } catch {
      try {
        await sqlStore.getAsupAgentInfo(m);
        const raw = sqlStore.infoAsupAgent;
        agent = buildAgentFromResult(raw);
      } catch {
        agent = null;
      }
    }

    if (!agent) {
      const cached = getStoredAgentInfo();
      if (cached && !cached.message && (cached.matricule === m || getStoredMatricule() === m)) {
        agent = buildAgentFromResult(cached);
      }
    }

    if (!agent) {
      loadAuthFromStorage();
      const authMatricule = localStorage.getItem('cms_auth_matricule');
      if (authMatricule === m) {
        const userJson = localStorage.getItem('cms_auth_user');
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            agent = buildAgentFromAuthUser(user);
          } catch {}
        }
      }
    }

    if (agent) {
      agentInfo.value = { matricule: agent.matricule, grade: agent.grade, nomAgent: agent.nomAgent, prenomAgent: agent.prenomAgent };
      createurId.value = agent.matricule;
      createurNom.value = agent.createurNomStr?.trim() || agent.matricule;
      saveMatricule(m);
      saveAgentInfo(agentInfo.value);
    } else {
      agentError.value = 'Agent non trouvé. Vérifiez le matricule ou réessayez plus tard.';
      agentInfo.value = null;
      createurNom.value = '';
      createurId.value = '';
    }
  } catch (err) {
    console.error(err);
    agentError.value = 'Erreur lors de la recherche. Utilisez le cache si vous êtes connecté.';
    agentInfo.value = null;
    createurNom.value = '';
    createurId.value = '';
  } finally {
    loadingAgent.value = false;
  }
}

function resetAgent() {
  matricule.value = '';
  agentInfo.value = null;
  createurNom.value = '';
  createurId.value = '';
  agentError.value = '';
}

async function submitForm() {
  if (!isFormValid.value || loading.value) return;
  idKitError.value = '';
  successMessage.value = '';
  errorMessage.value = '';
  loading.value = true;
  try {
    const res = await sqlStore.postKitsCompletKit({
      idKit: idKit.value.trim(),
      nomKit: selectedNomKit.value.nomKit,
      createurId: createurId.value || matricule.value?.trim() || ''
    });
    if (res?.message === 'Kit créé.' || res?.id) {
      successMessage.value = `Kit créé (id: ${res.id || '—'}). Vous pouvez le réaliser ou le modifier.`;
      idKit.value = '';
      selectedNomKit.value = null;
    } else {
      errorMessage.value = res?.message || 'Erreur lors de la création.';
    }
  } catch (e) {
    errorMessage.value = 'Erreur réseau ou serveur.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function getMatriculeFromCache() {
  return getStoredMatricule() || localStorage.getItem('cms_auth_matricule') || '';
}

onMounted(async () => {
  loadNomsKits();
  const cached = getMatriculeFromCache();
  if (cached) {
    matricule.value = cached;
    const cachedAgent = getStoredAgentInfo();
    if (cachedAgent && !cachedAgent.message) {
      agentInfo.value = cachedAgent;
      createurId.value = cachedAgent.matricule || cached;
      const nom = (cachedAgent.nomAgent || '').toUpperCase();
      const prenom = (cachedAgent.prenomAgent || '');
      createurNom.value = nom && prenom ? `${nom} ${prenom}` : '';
    } else {
      await fetchAgentInfo();
    }
  }
});
</script>

<style scoped>
.kit-create-container {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.kit-form {
  margin-top: 1rem;
  background-color: #f6f6f6;
  padding: 1.5rem;
  border-radius: 30px;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-item {
  width: 100%;
}

.form-item-large {
  min-width: 200px;
}

.idkit-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.idkit-row .form-item {
  flex: 1;
}

.createur-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.createur-row .form-item {
  flex: 1;
}

.agent-info {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #f0f7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.grade-img {
  vertical-align: middle;
  border-radius: 8px;
  object-fit: cover;
}

.agent-name {
  margin-right: 0.25rem;
  font-weight: 600;
}

.matricule-chip {
  padding: 0.2rem 0.5rem;
  background: #e8f4ff;
  color: #0063cb;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.reset-link {
  margin-left: auto;
  font-size: 0.9rem;
  color: #0063cb;
  text-decoration: none;
}

.reset-link:hover {
  text-decoration: underline;
}

.suggestion-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: #f4f6ff;
  color: #0063cb;
  border: 1px solid #0063cb;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.suggestion-btn:hover:not(:disabled) {
  background-color: #d6deff;
}

.suggestion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mandatory {
  color: #f60700;
}

.error-message {
  display: block;
  color: #f60700;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.hint {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #dffee6;
  color: #1f8d49;
  border-radius: 12px;
}

.validationBtn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 1024px) {
  .kit-form {
    max-width: 600px;
  }
}
</style>
