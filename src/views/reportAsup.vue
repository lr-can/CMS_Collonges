<template>
    <div v-if="showPanel" class="replacementPanelFilter" @click="showPanel = !showPanel"></div>
    <div v-if="showPanel" class="replacementPanel">
        <div class="return">
            <div class="returnBtn" @click="showPanel = !showPanel">Retour</div>
        </div>
            <div class="subtitle">Intervention {{ detailData.numIntervention }}</div>
            <div class="illustration" @click="navigate()">
                <img :src="backgroundImageSrc()" alt="Illustration" width="100%" height="auto" class="illustrationImg" @load="imgLoading = false">
                <div v-if="imgLoading" class="imgLoading">
                    <img src="@/assets/loading.gif" alt="Loading" width="50px" height="auto">
                </div>
            </div>
            <div>
                <p>
                    <span class="bold">Raison :<br></span> {{ detailData.interventionDetails.notificationTitre }}
                </p>
                <p>
                    <span class="bold">Date :<br></span> {{ new Date(detailData.dateActe).toLocaleDateString() }}
                </p>
                <p>
                    <span class="bold">Heure :<br></span> {{ new Date(detailData.dateActe).toLocaleTimeString() }}
                </p>
                <p>
                    <span class="bold">Lieu :<br></span> {{ detailData.interventionDetails.notificationAdresse }}
                </p>
            </div>
            <div class="subtitle">ASUP</div>
            <div>
                <p>
                    <span class="bold">Agent :<br></span>
                    <span class="agentInfo">
                        <img v-if="image_grade(detailData.agent?.grade)" :src="image_grade(detailData.agent?.grade)" width="25px" height="auto">
                        <span>
                            {{ formatAgentName(detailData.agent) }}
                            <span v-if="detailData.matriculeAgent"> ({{ detailData.matriculeAgent }})</span>
                        </span>
                    </span>
                </p>
                <p>
                    <span class="bold">Acte :<br></span> {{ detailData.acteSoin }}
                </p>
                <p>
                    <span class="bold">Médicaments :<br></span> {{ detailData.idMedicamentsList ? detailData.idMedicamentsList.length : 'Aucun' }}
                </p>
                <p>
                    <span class="bold">Effets secondaires :<br></span> {{ detailData.effetsSecondaires != null ? detailData.effetsSecondaires : 'Aucun' }}
                </p>
                <p>
                    <span class="bold">Commentaire :<br></span> {{ detailData.commentaire != null ? detailData.commentaire : 'Aucun' }}
                </p>
            </div>
            <div class="subtitle">Médecin</div>
            <div>
                <div class="doctor-card">
                    <div class="doctor-card-name">{{ formatDoctorDisplayName(detailData.medecinPrescripteur) }}</div>
                    <div class="doctor-card-rpps">RPPS : {{ formatDoctorRpps(detailData.medecinPrescripteur) }}</div>
                    <div class="doctor-card-row">
                        <span class="card-label">Spécialité</span>
                        <span>{{ formatDoctorSpeciality(detailData.medecinPrescripteur) }}</span>
                    </div>
                    <div class="doctor-card-row">
                        <span class="card-label">Structure</span>
                        <span>{{ formatDoctorStructure(detailData.medecinPrescripteur) }}</span>
                    </div>
                    <div class="doctor-card-row">
                        <span class="card-label">Ville</span>
                        <span>{{ formatDoctorCity(detailData.medecinPrescripteur) }}</span>
                    </div>
                    <div class="doctor-card-row">
                        <span class="card-label">Téléphone</span>
                        <span>{{ formatDoctorPhone(detailData.medecinPrescripteur) }}</span>
                    </div>
                </div>
            </div>
        </div>
    <div class="subtitle">
        Données ASUP
    </div>
    <p class="message">
        Plus d'informations sont disponibles sur les rapports mensuels que vous recevez par mail.
    </p>
    <div id="viz">
       <div v-if="isLoading">
            <img src="@/assets/loadingTiles.gif" alt="Loading" width="300px" height="auto">
       </div>
       <div v-else>
            <div class="utilisationsASUP">
                <div class="utilisationsASUP-title">Historique ASUP</div>
                <p id="utilisationMessage">
                    Cliquez sur une carte pour obtenir des informations détaillées sur l'intervention.
                </p>
                <div v-if="sortedHistory.length !== 0" class="utilisationsASUP-content">
                    <div class="utilisationsASUP-cards cards-grid">
                        <div class="utilisationsASUP-card" v-for="item in visibleHistory" :key="item.id" @click="showDetail(item.numIntervention)">
                            <div class="utilisationsASUP-card-header">
                                <span class="utilisationsASUP-date">{{ new Date(item.dateActe).toLocaleDateString() }}</span>
                                <span class="utilisationsASUP-inter">Inter {{ item.numIntervention }}</span>
                            </div>
                            <div class="utilisationsASUP-card-row">
                                <span class="card-label">Agent</span>
                                <span class="agentInfo">
                                    <img v-if="image_grade(item.agent?.grade)" :src="image_grade(item.agent?.grade)" width="25px" height="auto">
                                    <span>{{ formatAgentName(item.agent) }}</span>
                                </span>
                            </div>
                            <div class="utilisationsASUP-card-row">
                                <span class="card-label">ASUP</span>
                                <span>{{ item.acteSoin }}</span>
                            </div>
                            <div class="utilisationsASUP-card-row">
                                <span class="card-label">Méd. utilisés</span>
                                <span>{{ item.idMedicamentsList ? item.idMedicamentsList.length : "Aucun" }}</span>
                            </div>
                            <div class="utilisationsASUP-card-row">
                                <span class="card-label">Prescripteur</span>
                                <span>{{ formatDoctorDisplayName(item.medecinPrescripteur) }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="hasMoreHistory" class="list-actions">
                        <button type="button" class="see-more-btn" @click="toggleHistory">
                            {{ showAllHistory ? 'Voir moins' : 'Voir plus' }}
                        </button>
                    </div>
                </div>
                <div v-else class="utilisationsASUP-message">Aucune utilisation ASUP enregistrée.</div>
            </div>
            <div class="database">
                <div class="database-title">Médicaments enregistrés</div>
                <div>
                    <Dropdown id="dropdown" v-model="selectedSoin" :options="groupedSoins" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" placeholder="Sélectionnez un acte" class="w-full md:w-56" />
                </div>
                <div>
                    <div v-if="selectedSoin != null">
                        <div v-if="selectedItems.length > 0" class="status1-content">
                            <div class="status-cards cards-grid">
                                <div class="status-card status1-card" v-for="item in visibleSelectedItems" :key="item.id">
                                    <div class="status-card-header">
                                        <span class="status-card-title">{{ item.nomMedicament }}</span>
                                        <span class="status-card-count">x{{ item.count }}</span>
                                    </div>
                                    <div class="status-card-row">
                                        <span class="card-label">VSAV</span>
                                        <span>{{ item.affectationVSAV }}</span>
                                    </div>
                                    <div class="status-card-row">
                                        <span class="card-label">Créateur</span>
                                        <span class="agentInfo">
                                            <img v-if="image_grade(item.createur?.grade)" :src="image_grade(item.createur?.grade)" width="25px" height="auto">
                                            <span>{{ formatAgentName(item.createur) }}</span>
                                        </span>
                                    </div>
                                    <div class="status-card-row">
                                        <span class="card-label">Péremption</span>
                                        <span>{{ new Date(item.datePeremption).toLocaleDateString() }}</span>
                                    </div>
                                    <div class="status-card-row">
                                        <span class="card-label">Lot</span>
                                        <span>{{ item.numLot }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-if="hasMoreSelectedItems" class="list-actions">
                                <button type="button" class="see-more-btn" @click="toggleRegistered">
                                    {{ showAllRegistered ? 'Voir moins' : 'Voir plus' }}
                                </button>
                            </div>
                        </div>
                        <div v-else class="status1-message">Aucun médicament enregistré pour cet acte.</div>
                    </div>
                </div>
            </div>
            <div class="status3">
            <div class="status3-title">Remplacements pour péremption</div>
            <div v-if="expiringItems.length !== 0" class="status3-content">
                <div class="status-cards cards-grid">
                    <div class="status-card status3-card" v-for="item in visibleExpiringItems" :key="item.id">
                        <div class="status-card-header">
                            <span class="status-card-title">{{ item.nomMedicament }}</span>
                            <span class="status-card-count">x{{ item.count }}</span>
                        </div>
                        <div class="status-card-row">
                            <span class="card-label">VSAV</span>
                            <span>{{ item.affectationVSAV }}</span>
                        </div>
                        <div class="status-card-row">
                            <span class="card-label">Créateur</span>
                            <span class="agentInfo">
                                <img v-if="image_grade(item.createur?.grade)" :src="image_grade(item.createur?.grade)" width="25px" height="auto">
                                <span>{{ formatAgentName(item.createur) }}</span>
                            </span>
                        </div>
                        <div class="status-card-row">
                            <span class="card-label">Péremption</span>
                            <span>{{ new Date(item.datePeremption).toLocaleDateString() }}</span>
                        </div>
                        <div class="status-card-row">
                            <span class="card-label">Lot</span>
                            <span>{{ item.numLot }}</span>
                        </div>
                    </div>
                </div>
                <div v-if="hasMoreExpiringItems" class="list-actions">
                    <button type="button" class="see-more-btn" @click="toggleExpiring">
                        {{ showAllExpiring ? 'Voir moins' : 'Voir plus' }}
                    </button>
                </div>
            </div>
            <div v-else class="status3-message">Aucun médicament à remplacer avant la fin du mois prochain.</div>
            </div>
            <div class="status2">
                <div class="status2-title">Médicaments utilisés en remplacement</div>
                <div v-if="replacementItems.length !== 0" class="status2-content">
                    <div class="status-cards cards-grid">
                        <div class="status-card status2-card" v-for="item in visibleReplacementItems" :key="item.id">
                            <div class="status-card-header">
                                <span class="status-card-title">{{ item.nomMedicament }}</span>
                                <span class="status-card-count">x{{ item.count }}</span>
                            </div>
                            <div class="status-card-row">
                                <span class="card-label">VSAV</span>
                                <span>{{ item.affectationVSAV }}</span>
                            </div>
                            <div class="status-card-row">
                                <span class="card-label">Créateur</span>
                                <span class="agentInfo">
                                    <img v-if="image_grade(item.createur?.grade)" :src="image_grade(item.createur?.grade)" width="25px" height="auto">
                                    <span>{{ formatAgentName(item.createur) }}</span>
                                </span>
                            </div>
                            <div class="status-card-row">
                                <span class="card-label">Péremption</span>
                                <span>{{ new Date(item.datePeremption).toLocaleDateString() }}</span>
                            </div>
                            <div class="status-card-row">
                                <span class="card-label">Lot</span>
                                <span>{{ item.numLot }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="hasMoreReplacementItems" class="list-actions">
                        <button type="button" class="see-more-btn" @click="toggleReplacement">
                            {{ showAllReplacement ? 'Voir moins' : 'Voir plus' }}
                        </button>
                    </div>
                </div>
                <div v-else class="status2-message">Aucun médicament utilisé en cours de remplacement.</div>
            </div>
       </div>
    </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import Dropdown from 'primevue/dropdown';


const sqlStore = useSqlStore();
const asupData = ref({});
const isLoading = ref(false);
const showPanel = ref(false);
const detailData = ref({});
const imgLoading = ref(true);
const sortedData = ref({});
const previewLimit = 3;
const showAllHistory = ref(false);
const showAllRegistered = ref(false);
const showAllExpiring = ref(false);
const showAllReplacement = ref(false);
const groupedSoins = ref([
  {
    label: 'ASUP Niv. 1',
    code: 'asup1',
    items: [
      { label: 'Crise d\'asthme', code : 'asthme'},
      { label: 'Overdose d\'opiacés', code : 'naloxone'},
      {label: 'Choc anaphylactique', code : 'allergie'}
    ]
  },
  {
    label: 'ASUP Niv. 2',
    code: 'asup2',
    items: [
      {label: 'Prise en charge de la douleur', code: 'methoxyflurane'},
      {label: 'Douleurs aigües par voie orale', code: 'paracetamol'},
      {label: 'Hypoglycémie', code: 'glucagon'}
    ]
  }
]);

import Sap2CL from '../assets/grades/Sap 2CL.png';
import Sap1CL from '../assets/grades/Sap 1CL.png';
import Caporal from '../assets/grades/Caporal.png';
import CaporalChef from '../assets/grades/Caporal-Chef.png';
import Sergent from '../assets/grades/Sergent.png';
import SergentChef from '../assets/grades/Sergent-Chef.png';
import Adjudant from '../assets/grades/Adjudant.png';
import AdjudantChef from '../assets/grades/Adjudant-Chef.png';
import Lieutenant from '../assets/grades/Lieutenant.png';
import Capitaine from '../assets/grades/Capitaine.png';
import Commandant from '../assets/grades/Commandant.png';
import Professeur from '../assets/grades/Professeur.png';
import Infirmiere from '../assets/grades/Infirmière.png';

const dict_grades = {
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
  'Infirmière': Infirmiere,
  'Professeur': Professeur
};

const image_grade = (current_grade) => {
  if (!current_grade) {
    return null;
  }
  return dict_grades[current_grade] ?? null;
};

const formatAgentName = (agent) => {
  if (!agent) {
    return 'Agent non renseigné';
  }
  const nomComplet = [agent.nomAgent, agent.prenomAgent].filter(Boolean).join(' ');
  return nomComplet || 'Agent non renseigné';
};

const doctorFallbackText = 'Non renseigné';

const isDoctorObject = (doctorData) => {
    return Boolean(doctorData) && typeof doctorData === 'object' && !Array.isArray(doctorData);
};

const cleanDoctorValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value)
        .replace(/\s*\n\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const splitDoctorValues = (value) => {
    const cleanedValue = cleanDoctorValue(value);
    if (!cleanedValue) {
        return [];
    }
    return cleanedValue
        .split('|')
        .map(item => item.trim())
        .filter(Boolean);
};

const normalizeDoctorPhone = (phoneValue) => {
    const digitsOnly = cleanDoctorValue(phoneValue).replace(/\D/g, '');
    if (!digitsOnly) {
        return '';
    }
    if (digitsOnly.startsWith('33') && digitsOnly.length === 11) {
        return `0${digitsOnly.slice(2)}`;
    }
    if (digitsOnly.length === 9) {
        return `0${digitsOnly}`;
    }
    if (digitsOnly.length === 10) {
        return digitsOnly.startsWith('0') ? digitsOnly : `0${digitsOnly.slice(-9)}`;
    }
    return digitsOnly.startsWith('0') ? digitsOnly : `0${digitsOnly}`;
};

const getDoctorField = (doctorData, fieldName) => {
    if (!isDoctorObject(doctorData)) {
        return '';
    }
    return cleanDoctorValue(doctorData[fieldName]);
};

const formatDoctorDisplayName = (doctorData) => {
    const nom = getDoctorField(doctorData, 'nomExercice');
    const prenom = getDoctorField(doctorData, 'prenomExercice');
    const fullName = [nom, prenom].filter(Boolean).join(' ');
    return fullName ? `Dr ${fullName}` : 'Médecin non renseigné';
};

const formatDoctorRpps = (doctorData) => {
    if (!isDoctorObject(doctorData)) {
        return cleanDoctorValue(doctorData) || doctorFallbackText;
    }
    return getDoctorField(doctorData, 'identifiantRPPS') || doctorFallbackText;
};

const formatDoctorSpeciality = (doctorData) => {
    return getDoctorField(doctorData, 'specialites') || doctorFallbackText;
};

const formatDoctorStructure = (doctorData) => {
    const structures = splitDoctorValues(getDoctorField(doctorData, 'structures'));
    return structures.length > 0 ? structures.join(' | ') : doctorFallbackText;
};

const formatDoctorCity = (doctorData) => {
    const cities = splitDoctorValues(getDoctorField(doctorData, 'communes'));
    return cities.length > 0 ? cities.join(' | ') : doctorFallbackText;
};

const formatDoctorPhone = (doctorData) => {
    const phones = splitDoctorValues(getDoctorField(doctorData, 'telephones'))
        .map(normalizeDoctorPhone)
        .filter(Boolean);
    return phones.length > 0 ? phones.join(' | ') : doctorFallbackText;
};

const selectedSoin = ref(null);

const sortedHistory = computed(() => {
    const rows = Array.isArray(asupData.value?.rows4) ? asupData.value.rows4 : [];
    return [...rows].sort((a, b) => new Date(b.dateActe) - new Date(a.dateActe));
});

const visibleHistory = computed(() => {
    if (showAllHistory.value) {
        return sortedHistory.value;
    }
    return sortedHistory.value.slice(0, previewLimit);
});

const hasMoreHistory = computed(() => sortedHistory.value.length > previewLimit);

const selectedItems = computed(() => {
    const code = selectedSoin.value?.code;
    const items = code ? sortedData.value?.[code] : [];
    return Array.isArray(items) ? items : [];
});

const visibleSelectedItems = computed(() => {
    if (showAllRegistered.value) {
        return selectedItems.value;
    }
    return selectedItems.value.slice(0, previewLimit);
});

const hasMoreSelectedItems = computed(() => selectedItems.value.length > previewLimit);

const expiringItems = computed(() => {
    return Array.isArray(asupData.value?.rows3) ? asupData.value.rows3 : [];
});

const visibleExpiringItems = computed(() => {
    if (showAllExpiring.value) {
        return expiringItems.value;
    }
    return expiringItems.value.slice(0, previewLimit);
});

const hasMoreExpiringItems = computed(() => expiringItems.value.length > previewLimit);

const replacementItems = computed(() => {
    return Array.isArray(asupData.value?.rows2) ? asupData.value.rows2 : [];
});

const visibleReplacementItems = computed(() => {
    if (showAllReplacement.value) {
        return replacementItems.value;
    }
    return replacementItems.value.slice(0, previewLimit);
});

const hasMoreReplacementItems = computed(() => replacementItems.value.length > previewLimit);

const toggleHistory = () => {
    showAllHistory.value = !showAllHistory.value;
};

const toggleRegistered = () => {
    showAllRegistered.value = !showAllRegistered.value;
};

const toggleExpiring = () => {
    showAllExpiring.value = !showAllExpiring.value;
};

const toggleReplacement = () => {
    showAllReplacement.value = !showAllReplacement.value;
};

const getData = async () => {
    isLoading.value = true;
    await sqlStore.getAsupVizData();
    asupData.value = sqlStore.asupVizData;
    const rows1 = Array.isArray(asupData.value?.rows1) ? asupData.value.rows1 : [];
    sortedData.value = rows1.reduce((acc, item) => {
        if (!acc[item.acteSoin]) {
            acc[item.acteSoin] = [];
        }
        acc[item.acteSoin].push(item);
        return acc;
    }, {});
    console.log(sortedData.value);
    isLoading.value = false;

};

watch(selectedSoin, () => {
    showAllRegistered.value = false;
});

getData();

const showDetail = (numIntervention) => {
    showPanel.value = true;
    detailData.value = asupData.value.rows4.find(item => item.numIntervention === numIntervention);
    console.log(numIntervention);
};

const backgroundImageSrc = () => {
    let lon = detailData.value.interventionDetails.notificationLon;
    let lat = detailData.value.interventionDetails.notificationLat;
    let url = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${lon},${lat}&zoom=14&marker=lonlat:${lon},${lat};type:circle;color:%23ff0000;size:xx-large;icon:sos;icontype:material;iconsize:small;strokecolor:%23ff0000&scaleFactor=2&apiKey=75c6e5ac06e84d3a95473195e7af529d`;
    return url;
}

const navigate = () => {
    let lon = detailData.value.interventionDetails.notificationLon;
    let lat = detailData.value.interventionDetails.notificationLat;
    let lonDeg = Math.abs(lon).toFixed(6) + (lon >= 0 ? 'E' : 'O');
    let latDeg = Math.abs(lat).toFixed(6) + (lat >= 0 ? 'N' : 'S');
    window.open(`https://www.google.fr/maps/place/${latDeg}+${lonDeg}/@${lat},${lon},14z`);
}

</script>
<style scoped>
#viz{
    overflow-x: auto;
}
.illustrationImg{
    border-radius: 10px;
    scale: 1.1;
}
.illustrationImg:hover{
    scale: 1.2;
    cursor: pointer;
}
.illustration > div{
    margin: auto;
}
.replacementPanelFilter {
    backdrop-filter: blur(10px) brightness(0.8);
    width: 100vw;
    height: 100vh;
    z-index: 3;
    position: fixed;
    top: 0;
    left: 0;

}

.replacementPanel {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background-color: white;
    border-radius: 10px;
    padding: 1rem;
    flex-wrap: wrap;
    min-width: 30%;
    max-width: 50%;
    max-height: 80vh;
    transition: all 0.5s ease-in-out;
    overflow-y: scroll;
}
@media screen and (max-width: 768px) {
    .replacementPanel {
        min-width: 90vw;
        max-width: 90vw;
    }
    
}
@media screen and (min-width: 900px) {
    .replacementPanel {
        min-width: 20vw;
        max-width: 20vw;
    }
}
.bold{
    font-weight: bold;
}
#dropdown{
    width: 100%;
    margin: auto;
    margin-top: 1rem;
    margin-bottom: 1rem;
}
.imgLoading{
    margin: auto;
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.replacementPanel > div {
    margin: 1rem;
}
#utilisationMessage{
    font-style: italic;
    color: #666666;
    margin-bottom: 1rem;
    font-size: 0.8rem;
}
.status3, .status2, .utilisationsASUP, .database{
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 1rem;
}
.status3-title{
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #d64d00;
}
.status2-title{
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #0078f3;
}
.utilisationsASUP-title{
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #009081;
}
.database-title{
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #C08C65;
}

.status1-content,
.status2-content,
.status3-content,
.utilisationsASUP-content {
    width: 100%;
    margin-bottom: 1rem;
}

.cards-grid{
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}
@media (min-width: 900px) {
    .cards-grid{
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (min-width: 1200px) {
    .cards-grid{
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

.utilisationsASUP-card{
    border: 1px solid #dffdf7;
    border-radius: 12px;
    padding: 0.85rem;
    background-color: #f7fffd;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    word-break: break-word;
}
.utilisationsASUP-card:hover{
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px;
}
.utilisationsASUP-card-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #009081;
}
.utilisationsASUP-date,
.utilisationsASUP-inter{
    font-size: 0.95rem;
}
.utilisationsASUP-card-row{
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.85rem;
}
.utilisationsASUP-card-row .agentInfo{
    justify-content: flex-start;
}
.doctor-card{
    border: 1px solid #dffdf7;
    border-radius: 12px;
    padding: 0.85rem;
    background-color: #f7fffd;
    margin-top: 0.5rem;
}
.doctor-card-name{
    font-size: 0.95rem;
    font-weight: 700;
    color: #009081;
    margin-bottom: 0.25rem;
}
.doctor-card-rpps{
    color: #666666;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
}
.doctor-card-row{
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 0.5rem;
    align-items: start;
    padding: 0.25rem 0;
    font-size: 0.85rem;
}

.status-card{
    border-radius: 12px;
    padding: 0.85rem;
    border: 1px solid transparent;
    background-color: white;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    word-break: break-word;
}
.status-card:hover{
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px;
}
.status-card-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: bold;
}
.status-card-title{
    font-size: 0.95rem;
}
.status-card-count{
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
}
.status-card-row{
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.85rem;
}
.status1-card{
    border-color: #C08C65;
    background-color: #fbf5f2;
}
.status1-card .status-card-header{
    color: #C08C65;
}
.status2-card{
    border-color: #0078f3;
    background-color: #f4f6ff;
}
.status2-card .status-card-header{
    color: #0078f3;
}
.status3-card{
    border-color: #d64d00;
    background-color: #fff4f3;
}
.status3-card .status-card-header{
    color: #d64d00;
}

.card-label{
    color: #666666;
    font-weight: 600;
}

.list-actions{
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;
}
.see-more-btn{
    border: 1px solid #666666;
    background-color: white;
    color: #333333;
    border-radius: 999px;
    padding: 0.4rem 1.2rem;
    font-weight: bold;
    cursor: pointer;
}
.see-more-btn:hover{
    background-color: #f6f6f6;
}

@media (min-width: 900px) {
    .utilisationsASUP-card-row,
    .status-card-row{
        font-size: 0.95rem;
        grid-template-columns: 130px 1fr;
    }
    .doctor-card-row{
        font-size: 0.95rem;
        grid-template-columns: 130px 1fr;
    }
    .status-card-title,
    .utilisationsASUP-date,
    .utilisationsASUP-inter{
        font-size: 1rem;
    }
}
.status3-message, .status2-message, .utilisationsASUP-message, .status1-message, .message{
    font-style: italic;
    text-align: center;
    margin-top: 1rem;
    text-align: left;
    color: #666666;
    margin-bottom: 1.3rem;
    font-size: 0.8rem;
}


.agentInfo {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
    text-align: left;
}
.agentInfo > img {
    margin-right: 0.5rem;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    border-radius: 5px;
}
.agentInfo > span {
    display: inline;
    vertical-align: middle;
}
</style>