<template>
  <div class="demande-formation">
    <div class="subtitle">Demande de formation</div>
    <div v-if="!validationStep">
      <p v-if="step < 2" class="welcome-text">
        Bienvenue sur l'espace de demande d'inscription à une formation.
      </p>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Étape 1 : Sélection agent -->
      <div v-if="step >= 1" class="step">
        <div class="subsubtitle">Agent</div>
        <p>Recherche par matricule</p>
        <div class="input-row">
          <InputText
            v-model="matricule"
            inputId="matricule"
            placeholder="V99999"
            :class="{ 'p-invalid': responseError }"
            :disabled="!showMatriculeInput && agentInfo"
            @keyup.enter="agentInfo ? null : getAgentInfo()"
          />
          <button
            v-if="showMatriculeInput || !agentInfo"
            class="arrow-button"
            @click="getAgentInfo"
            :disabled="!canSearchAgent"
          >
            {{ buttonLabel }}
          </button>
        </div>

        <div v-if="agentInfo" class="agent-info">
          <div class="agent-info-text">
            <span v-if="agentGrade" class="grade-span">
              <img :src="imageGrade()" width="32" height="32" alt="" class="grade-img" />
            </span>
            <span class="agent-name">{{ nomAgent }} {{ prenomAgent }}</span>
            <Chip :label="matricule" class="matricule-chip" />
          </div>
          <a href="#" @click.prevent="resetAgent" class="not-you-link">Ce n'est pas vous ?</a>
        </div>
      </div>

      <!-- Étape 2 : Sélection du catalogue (année) -->
      <div v-if="step >= 2 && agentInfo" class="step">
        <div class="subsubtitle">Catalogue</div>
        <p>Sélectionnez l'année du catalogue de formation</p>
        <div class="year-cards">
          <div
            class="year-card"
            :class="{ selected: selectedYear === currentYear, disabled: !catalogues[currentYear]?.formations?.length }"
            @click="selectYear(currentYear)"
          >
            <span class="year-label">Catalogue {{ currentYear }}</span>
          </div>
          <div
            class="year-card"
            :class="{ selected: selectedYear === nextYear, disabled: isNextYearDisabled }"
            @click="!isNextYearDisabled && selectYear(nextYear)"
          >
            <span class="year-label">Catalogue {{ nextYear }}</span>
          </div>
        </div>
      </div>

      <!-- Étape 3 : Sélection de la formation -->
      <div v-if="step >= 3 && selectedYear" class="step">
        <div class="subsubtitle">Formation</div>
        <p>Recherchez et sélectionnez une formation</p>
        <div class="filters-row">
          <IconField iconPosition="left" class="search-field">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="formationFilter"
              placeholder="Rechercher (intitulé, titre, catégorie)..."
              class="filter-input"
            />
          </IconField>
          <MultiSelect
            v-model="selectedCategories"
            :options="categoriesOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Catégories"
            :showClear="true"
            display="chip"
            class="filter-multiselect"
          />
          <MultiSelect
            v-model="selectedTypes"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Type"
            :showClear="true"
            class="filter-multiselect type-select"
          />
          <MultiSelect
            v-model="selectedPublics"
            :options="publicOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Public concerné"
            :showClear="true"
            display="chip"
            class="filter-multiselect"
          />
        </div>
        <div v-if="Object.keys(formationsByCategory).length === 0" class="formations-empty">
          Aucune formation ne correspond aux critères sélectionnés.
        </div>
        <div v-else class="formations-list">
          <div
            v-for="(formationsGroup, categorie) in formationsByCategory"
            :key="categorie"
            class="category-group"
          >
            <div class="category-title">{{ categorie }}</div>
            <div
              v-for="formation in formationsGroup"
              :key="formation.intitule + formation.titre"
              class="formation-card"
              :class="{ selected: selectedFormation === formation }"
              @click="selectFormation(formation)"
            >
              <div class="formation-card-header">
                <span class="formation-intitule">{{ formation.intitule }}</span>
                <span
                  class="formation-type-chip"
                  :class="formation.typeEvaluation === 'certificative' ? 'certificative' : 'formative'"
                >
                  {{ formation.typeEvaluation === 'certificative' ? 'Certificative' : 'Formative' }}
                </span>
              </div>
              <div class="formation-card-body">
                {{ formation.titre }}
              </div>
              <div class="formation-duree">
                {{ formatDuree(formation.dureeJoursHeures) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 4 : Informations formation + Sélection des sessions -->
      <div v-if="step >= 4 && selectedFormation" class="step">
        <div class="subsubtitle">Détails de la formation</div>
        <div class="formation-details">
          <span
            class="type-chip"
            :class="selectedFormation.typeEvaluation === 'certificative' ? 'certificative' : 'formative'"
          >
            {{ selectedFormation.typeEvaluation === 'certificative' ? 'Certificative' : 'Formative' }}
          </span>
          <span class="detail-item">
            Durée : {{ formatDuree(selectedFormation.dureeJoursHeures) }}
          </span>
          <span class="detail-item">Intitulé : {{ selectedFormation.intitule }}</span>
          <span class="detail-item">Catégorie : {{ selectedFormation.categorie }}</span>
        </div>

        <div v-if="selectedFormation.preRequis || selectedFormation.objectif || selectedFormation.preparationAvantStage" class="formation-extra-details">
          <div v-if="selectedFormation.preRequis" class="extra-detail-block">
            <div class="extra-detail-label">Pré-requis</div>
            <div class="extra-detail-content">{{ selectedFormation.preRequis }}</div>
          </div>
          <div v-if="selectedFormation.objectif" class="extra-detail-block">
            <div class="extra-detail-label">Objectif</div>
            <div class="extra-detail-content">{{ selectedFormation.objectif }}</div>
          </div>
          <div v-if="selectedFormation.preparationAvantStage" class="extra-detail-block">
            <div class="extra-detail-label">Préparation avant stage</div>
            <div class="extra-detail-content">{{ selectedFormation.preparationAvantStage }}</div>
          </div>
        </div>

        <div class="subsubtitle" style="margin-top: 1.5rem">Sélection des sessions (2 vœux)</div>
        <p>Sélectionnez vos deux sessions préférées par ordre de préférence</p>

        <div class="sessions-grid">
          <div
            v-for="session in availableSessions"
            :key="session.sessionId"
            class="session-card"
            :class="{
              disabled: isSessionPast(session),
              'voeu-1': selectedVoeu1 === session,
              'voeu-2': selectedVoeu2 === session
            }"
            @click="selectSession(session)"
          >
            <div class="session-chip">{{ session.sessionId }}</div>
            <div class="session-nom">{{ session.nomShort }}</div>
            <div class="session-dates">
              {{ formatDate(session.dateDebut) }} → {{ formatDate(session.dateFin) }}
            </div>
            <div class="session-centre">{{ session.centreFormation }}</div>
            <div v-if="selectedVoeu1 === session" class="voeu-badge">Vœu n°1</div>
            <div v-else-if="selectedVoeu2 === session" class="voeu-badge">Vœu n°2</div>
          </div>
        </div>

        <div v-if="selectedVoeu1 || selectedVoeu2" class="voeux-summary">
          <div v-if="selectedVoeu1">
            <strong>Vœu 1 :</strong> {{ selectedVoeu1.sessionId }} - {{ formatDate(selectedVoeu1.dateDebut) }} - {{ selectedVoeu1.centreFormation }}
          </div>
          <div v-if="selectedVoeu2">
            <strong>Vœu 2 :</strong> {{ selectedVoeu2.sessionId }} - {{ formatDate(selectedVoeu2.dateDebut) }} - {{ selectedVoeu2.centreFormation }}
          </div>
        </div>
      </div>

      <!-- Étape 5 : Hébergement, Commentaire et récapitulatif -->
      <div v-if="step >= 5" class="step">
        <div v-if="showHebergementStep" class="hebergement-section">
          <div class="subsubtitle">Hébergement</div>
          <p>Souhaitez-vous faire une demande d'hébergement ?</p>
          <div class="hebergement-options">
            <label class="radio-option">
              <input type="radio" v-model="hebergement" :value="true" />
              Oui
            </label>
            <label class="radio-option">
              <input type="radio" v-model="hebergement" :value="false" />
              Non
            </label>
          </div>
        </div>

        <div class="subsubtitle">Commentaire</div>
        <Textarea
          v-model="commentaire"
          rows="4"
          placeholder="Commentaire éventuel..."
          class="commentaire-input"
        />

        <div class="subsubtitle" style="margin-top: 1.5rem">Récapitulatif</div>
        <div class="recap">
          <p><strong>Agent :</strong> {{ nomAgent }} {{ prenomAgent }} ({{ agentGrade }}) - {{ matricule }}</p>
          <p><strong>Email :</strong> {{ agentMail }}</p>
          <p><strong>Formation :</strong> {{ selectedFormation?.intitule }}</p>
          <p><strong>Vœu 1 :</strong> {{ selectedVoeu1?.sessionId }} - {{ selectedVoeu1 ? formatDate(selectedVoeu1.dateDebut) : '-' }}</p>
          <p><strong>Vœu 2 :</strong> {{ selectedVoeu2?.sessionId }} - {{ selectedVoeu2 ? formatDate(selectedVoeu2.dateDebut) : '-' }}</p>
          <p v-if="showHebergementStep"><strong>Hébergement :</strong> {{ hebergement ? 'Oui' : 'Non' }}</p>
          <p v-if="commentaire"><strong>Commentaire :</strong> {{ commentaire }}</p>
        </div>

        <div class="submit-row">
          <button class="nav-button" @click="step = 4">Retour</button>
          <button
            class="submit-button"
            :disabled="isSubmitting"
            @click="submitDemande"
          >
            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande' }}
          </button>
        </div>
      </div>

      <!-- Boutons de navigation -->
      <div v-if="step > 1 && step < 5" class="nav-buttons">
        <button class="nav-button" @click="step--">Retour</button>
      </div>
    </div>

    <!-- Message de succès -->
    <div v-else-if="validationStep" class="validation-msg">
      <p>Demande envoyée avec succès !</p>
      <p>Vous pouvez fermer cette page.</p>
      <button class="back-button" @click="$router.push('/')">Retour à l'accueil</button>
    </div>

    <!-- Dialog : Session < 2 mois -->
    <Dialog
      v-model:visible="showSessionWarningDialog"
      header="Attention"
      :modal="true"
      :closable="true"
      :style="{ width: '90vw', maxWidth: '400px' }"
    >
      <p>Session inférieure à deux mois, les inscriptions doivent se faire au moins deux mois à l'avance.</p>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSqlStore } from '@/stores/database.js'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import MultiSelect from 'primevue/multiselect'
import Chip from 'primevue/chip'
import Sap2CL from '@/assets/grades/Sap 2CL.png'
import Sap1CL from '@/assets/grades/Sap 1CL.png'
import Caporal from '@/assets/grades/Caporal.png'
import CaporalChef from '@/assets/grades/Caporal-Chef.png'
import Sergent from '@/assets/grades/Sergent.png'
import SergentChef from '@/assets/grades/Sergent-Chef.png'
import Adjudant from '@/assets/grades/Adjudant.png'
import AdjudantChef from '@/assets/grades/Adjudant-Chef.png'
import Lieutenant from '@/assets/grades/Lieutenant.png'
import Capitaine from '@/assets/grades/Capitaine.png'
import Commandant from '@/assets/grades/Commandant.png'
import Professeur from '@/assets/grades/Professeur.png'
import Infirmiere from '@/assets/grades/Infirmière.png'
import loader from '@/assets/loading.gif'

const BASE_URL = 'https://raw.githubusercontent.com/lr-can/affichageCT/refs/heads/main'
const CENTRES_HEBERGEMENT = ['Ecole du SDMIS', "Caserne de Saint-Priest"]

const sqlStore = useSqlStore()

const step = ref(1)
const validationStep = ref(false)
const errorMessage = ref('')
const matricule = ref('')
const agentInfo = ref(null)
const showMatriculeInput = ref(true)
const buttonLabel = ref('Rechercher')
const responseError = ref(false)

const nomAgent = ref('')
const prenomAgent = ref('')
const agentGrade = ref(null)
const agentMail = ref('')

const catalogues = ref({})
const selectedYear = ref(null)
const currentYear = ref(new Date().getFullYear())
const nextYear = ref(new Date().getFullYear() + 1)

const formationFilter = ref('')
const selectedCategories = ref([])
const selectedTypes = ref([])
const selectedPublics = ref(['SPV'])
const selectedFormation = ref(null)
const selectedVoeu1 = ref(null)
const selectedVoeu2 = ref(null)
const hebergement = ref(false)
const commentaire = ref('')
const showSessionWarningDialog = ref(false)

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
}

const imageGrade = () => {
  return agentGrade.value ? (dictGrades[agentGrade.value] || loader) : loader
}

const canSearchAgent = computed(() => {
  return matricule.value?.startsWith('V') && matricule.value?.length === 6
})

const isNextYearDisabled = computed(() => {
  const cat = catalogues.value[nextYear.value]
  return !cat || !cat.formations || cat.formations.length === 0
})

const typeOptions = [
  { label: 'Certificative', value: 'certificative' },
  { label: 'Formative', value: 'formative' }
]

const publicOptions = [
  { label: 'SPP', value: 'SPP' },
  { label: 'SPV', value: 'SPV' },
  { label: 'JSP', value: 'JSP' },
  { label: 'PATS', value: 'PATS' },
  { label: 'Partenaires privés', value: 'Partenaires privés' }
]

const categoriesOptions = computed(() => {
  const formations = catalogues.value[selectedYear.value]?.formations || []
  const cats = [...new Set(formations.map((f) => f.categorie || 'Autre').filter(Boolean))]
  return cats.sort().map((c) => ({ label: c, value: c }))
})

const formationsByCategory = computed(() => {
  const formations = catalogues.value[selectedYear.value]?.formations || []
  const filter = formationFilter.value?.toLowerCase() || ''
  const cats = selectedCategories.value
  const types = selectedTypes.value

  let filtered = formations
  if (filter) {
    filtered = filtered.filter(
      (f) =>
        f.intitule?.toLowerCase().includes(filter) ||
        f.titre?.toLowerCase().includes(filter) ||
        f.categorie?.toLowerCase().includes(filter)
    )
  }
  if (cats?.length) {
    filtered = filtered.filter((f) => cats.includes(f.categorie || 'Autre'))
  }
  if (types?.length) {
    filtered = filtered.filter((f) => types.includes(f.typeEvaluation))
  }
  if (selectedPublics.value?.length) {
    filtered = filtered.filter((f) => {
      const publics = (f.publicConcerne || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
      return selectedPublics.value.some((sel) => publics.includes(sel))
    })
  }

  const grouped = {}
  filtered.forEach((f) => {
    const cat = f.categorie || 'Autre'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(f)
  })
  return grouped
})

const availableSessions = computed(() => {
  if (!selectedFormation.value) return []
  return (selectedFormation.value.sessions || []).filter((s) => !s.annulee)
})

const showHebergementStep = computed(() => {
  if (!selectedFormation.value || !selectedVoeu1.value) return false
  const duree = selectedFormation.value.dureeJoursHeures
  const jours = (duree?.jours || 0) + (duree?.heures > 0 ? 1 : 0)
  if (jours < 2) return false
  const centres = [selectedVoeu1.value?.centreFormation, selectedVoeu2.value?.centreFormation].filter(Boolean)
  return centres.some((c) => CENTRES_HEBERGEMENT.includes(c))
})

function isSessionPast(session) {
  const end = new Date(session.dateFin)
  end.setHours(23, 59, 59)
  return end < new Date()
}

function isSessionLessThan2Months(session) {
  const start = new Date(session.dateDebut)
  const now = new Date()
  const diffMs = start - now
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays < 60
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDuree(dureeJoursHeures) {
  if (!dureeJoursHeures) return '-'
  const jours = dureeJoursHeures.jours ?? 0
  const heures = dureeJoursHeures.heures ?? 0
  const parts = []
  if (jours > 0) {
    parts.push(jours === 1 ? '1 jour' : `${jours} jours`)
  }
  if (heures > 0) {
    parts.push(jours > 0 ? `et ${heures} h` : `${heures} h`)
  }
  return parts.length ? parts.join(' ') : '-'
}

const updateDataAgent = (result) => {
  agentGrade.value = result.grade
  prenomAgent.value = result.prenomAgent
  nomAgent.value = result.nomAgent
  agentMail.value = result.email
}

const resetAgent = () => {
  showMatriculeInput.value = true
  matricule.value = ''
  agentInfo.value = null
  nomAgent.value = ''
  prenomAgent.value = ''
  agentGrade.value = null
  agentMail.value = ''
  step.value = 1
  localStorage.removeItem('cms_matricule')
  localStorage.removeItem('cms_agent_info')
}

const getAgentInfo = async () => {
  errorMessage.value = ''
  responseError.value = false
  buttonLabel.value = 'Recherche...'
  try {
    await sqlStore.getAsupAgentInfo(matricule.value)
    const result = sqlStore.infoAsupAgent

    if (result?.message) {
      responseError.value = true
      errorMessage.value = result.message
      buttonLabel.value = 'Rechercher'
      return
    }

    agentInfo.value = result
    updateDataAgent(result)
    showMatriculeInput.value = false
    buttonLabel.value = 'Rechercher'
    localStorage.setItem('cms_matricule', matricule.value)
    localStorage.setItem('cms_agent_info', JSON.stringify(result))
    step.value = 2
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Erreur lors de la recherche'
    buttonLabel.value = 'Rechercher'
  }
}

const loadCatalogue = async (year) => {
  try {
    const res = await fetch(`${BASE_URL}/calendrier_formation_${year}.json`)
    const data = await res.json()
    if (data && data.formations && Array.isArray(data.formations) && data.formations.length > 0) {
      catalogues.value[year] = data
      return data
    }
    catalogues.value[year] = {}
    return {}
  } catch {
    catalogues.value[year] = {}
    return {}
  }
}

const selectYear = (year) => {
  if (year === nextYear.value && isNextYearDisabled.value) return
  selectedYear.value = year
  formationFilter.value = ''
  selectedCategories.value = []
  selectedTypes.value = []
  selectedPublics.value = ['SPV']
  selectedFormation.value = null
  selectedVoeu1.value = null
  selectedVoeu2.value = null
  step.value = 3
}

const selectFormation = (formation) => {
  selectedFormation.value = formation
  selectedVoeu1.value = null
  selectedVoeu2.value = null
  step.value = 4
}

const selectSession = (session) => {
  if (isSessionPast(session)) return
  if (isSessionLessThan2Months(session)) {
    showSessionWarningDialog.value = true
    return
  }

  if (selectedVoeu1.value === session) {
    selectedVoeu1.value = null
    if (selectedVoeu2.value) {
      selectedVoeu1.value = selectedVoeu2.value
      selectedVoeu2.value = null
    }
    return
  }
  if (selectedVoeu2.value === session) {
    selectedVoeu2.value = null
    return
  }

  if (!selectedVoeu1.value) {
    selectedVoeu1.value = session
  } else if (!selectedVoeu2.value) {
    selectedVoeu2.value = session
    step.value = 5
  }
}

const isSubmitting = ref(false)

const submitDemande = async () => {
  if (!selectedVoeu1.value || !selectedVoeu2.value) {
    errorMessage.value = 'Veuillez sélectionner deux sessions (vœu 1 et vœu 2)'
    return
  }

  const payload = {
    agent: {
      nom: nomAgent.value,
      prenom: prenomAgent.value,
      grade: agentGrade.value,
      matricule: matricule.value,
      adresseMail: agentMail.value
    },
    formation: selectedFormation.value
      ? {
          intitule: selectedFormation.value.intitule,
          titre: selectedFormation.value.titre,
          categorie: selectedFormation.value.categorie
        }
      : null,
    voeu1: selectedVoeu1.value,
    voeu2: selectedVoeu2.value,
    hebergement: showHebergementStep.value ? hebergement.value : null,
    commentaire: commentaire.value
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const response = await fetch('https://api.cms-collonges.fr/demandeFormation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errText = await response.text()
      throw new Error(errText || `Erreur ${response.status}`)
    }
    validationStep.value = true
  } catch (err) {
    console.error('Erreur envoi demande formation:', err)
    errorMessage.value = err.message || 'Erreur lors de l\'envoi de la demande. Veuillez réessayer.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  const cachedMatricule = localStorage.getItem('cms_matricule')
  const cachedAgent = localStorage.getItem('cms_agent_info')

  if (cachedMatricule) {
    matricule.value = cachedMatricule
    if (cachedAgent) {
      try {
        const parsed = JSON.parse(cachedAgent)
        agentInfo.value = parsed
        updateDataAgent(parsed)
        showMatriculeInput.value = false
        step.value = 2
      } catch {}
    } else {
      await getAgentInfo()
    }
  }

  await loadCatalogue(currentYear.value)
  await loadCatalogue(nextYear.value)
})
</script>

<style scoped>
.demande-formation {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-text {
  color: #666;
  margin-bottom: 1rem;
}

.error-message {
  background: #fef4f4;
  color: #e1000f;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.step {
  margin: 1.5rem 0;
  padding: 1rem 0;
}

.input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.input-row :deep(.p-inputtext) {
  flex: 1;
  max-width: 200px;
}

.agent-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f6f6f6;
  border-radius: 8px;
}

.agent-info-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.grade-span {
  display: inline-flex;
  align-items: center;
}

.grade-img {
  vertical-align: middle;
  border-radius: 8px;
  object-fit: cover;
}

.matricule-chip {
  margin-left: auto;
}

.matricule-chip :deep(.p-chip) {
  background: #e8f4ff;
  color: #0063cb;
  font-weight: 600;
}

.agent-name {
  margin-right: 0.5rem;
}

.not-you-link {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  text-decoration: none;
}

.not-you-link:hover {
  text-decoration: underline;
}

.year-cards {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.year-card {
  flex: 1;
  min-width: 140px;
  padding: 1.25rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  background: white;
}

.year-card:hover:not(.disabled) {
  border-color: #d64d00;
  background: #fff4f3;
}

.year-card.selected {
  border-color: #d64d00;
  background: #fff4f3;
  color: #d64d00;
}

.year-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f0f0f0;
}

.year-label {
  font-weight: 600;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin: 0.75rem 0;
}

.search-field {
  flex: 1;
  min-width: 200px;
}

.search-field .filter-input {
  width: 100%;
  padding-left: 2.5rem;
}

.filter-multiselect {
  min-width: 160px;
}

.filter-multiselect.type-select {
  min-width: 140px;
}

.filter-input {
  width: 100%;
  max-width: 400px;
}

.formations-empty {
  padding: 2rem;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.formations-list {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.category-group {
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
}

.formation-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.formation-card:hover {
  border-color: #d64d00;
  background: #fff9f8;
}

.formation-card.selected {
  border-color: #d64d00;
  background: #fff4f3;
}

.formation-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.formation-intitule {
  font-weight: 600;
}

.formation-type-chip {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.formation-type-chip.certificative {
  background: #fef4f4;
  color: #e1000f;
}

.formation-type-chip.formative {
  background: #e8f4ff;
  color: #0063cb;
}

.formation-card-body {
  font-size: 0.9rem;
  color: #333;
  margin-top: 0.25rem;
}

.formation-duree {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.formation-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.type-chip {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}

.type-chip.certificative {
  background: #fef4f4;
  color: #e1000f;
}

.type-chip.formative {
  background: #e8f4ff;
  color: #0063cb;
}

.detail-item {
  font-size: 0.9rem;
  color: #555;
}

.formation-extra-details {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.extra-detail-block {
  padding: 1rem;
  background: #f6f6f6;
  border-radius: 8px;
}

.extra-detail-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.extra-detail-content {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  white-space: pre-line;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.session-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.session-card:hover:not(.disabled) {
  border-color: #d64d00;
  background: #fff9f8;
}

.session-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.session-card.voeu-1,
.session-card.voeu-2 {
  border-color: #d64d00;
  background: #fff4f3;
}

.session-chip {
  font-size: 0.75rem;
  font-weight: 600;
  color: #d64d00;
  margin-bottom: 0.25rem;
}

.session-nom {
  font-size: 0.85rem;
  font-weight: 500;
}

.session-dates {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.session-centre {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

.voeu-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  background: #d64d00;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.voeux-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: #f6f6f6;
  border-radius: 8px;
  font-size: 0.9rem;
}

.hebergement-section {
  margin-bottom: 1.5rem;
}

.hebergement-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.commentaire-input {
  width: 100%;
  max-width: 500px;
  margin-top: 0.5rem;
}

.recap {
  background: #f6f6f6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.95rem;
}

.recap p {
  margin: 0.5rem 0;
}

.submit-row {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  align-items: center;
}

.submit-button {
  margin-top: 0;
  padding: 0.75rem 1.5rem;
  background: #d64d00;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover {
  background: #b83d00;
}

.nav-buttons {
  margin-top: 1.5rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.nav-button:hover {
  background: #e0e0e0;
}

.validation-msg {
  text-align: center;
  padding: 2rem;
}

.validation-msg p {
  margin: 0.5rem 0;
}

.back-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #d64d00;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.arrow-button {
  padding: 0.5rem 1rem;
  background: #d64d00;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.arrow-button:hover:not(:disabled) {
  background: #b83d00;
}

.arrow-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
