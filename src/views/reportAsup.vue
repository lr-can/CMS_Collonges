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
                    <span class="bold">Agent :<br></span> <span class="agentInfo"><img :src="image_grade(detailData.agent.grade)" width="25px" height="auto"><span>{{ detailData.agent.nomAgent }} {{ detailData.agent.prenomAgent }} ({{ detailData.matriculeAgent }})</span></span>
                </p>
                <p>
                    <span class="bold">Acte :<br></span> {{ detailData.acteSoin }}
                </p>
                <p>
                    <span class="bold">Médicaments :<br></span> {{ detailData.idMedicamentsList ? detailData.idMedicamentsList.length : 'Aucun' }}
                </p>
                <p>
                    <span class="bold">Prescripteur :<br></span> Dr {{ detailData.medecinPrescripteur.nomExercice }} {{ detailData.medecinPrescripteur.prenomExercice }} ({{ detailData.medecinPrescripteur.identifiantRPPS }})
                </p>
                <p>
                    <span class="bold">Effets secondaires :<br></span> {{ detailData.effetsSecondaires != null ? detailData.effetsSecondaires : 'Aucun' }}
                </p>
                <p>
                    <span class="bold">Commentaire :<br></span> {{ detailData.commentaire != null ? detailData.commentaire : 'Aucun' }}
                </p>
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
                    Cliquez sur une ligne pour obtenir des informations détaillées sur l'intervention.
                </p>
                <div v-if="asupData.rows4.length != 0" class="utilisationsASUP-content">
                    <div class="utilisationsASUP-header">
                        <div class="utilisationsASUP-header-item">Date</div>
                        <div class="utilisationsASUP-header-item">Inter</div>
                        <div class="utilisationsASUP-header-item">Agent</div>
                        <div class="utilisationsASUP-header-item">ASUP</div>
                        <div class="utilisationsASUP-header-item">Méd. Utilisés</div>
                        <div class="utilisationsASUP-header-item">Prescripteur</div>
                    </div>
                    <div class="utilisationsASUP-content-items" v-for="item in asupData.rows4" :key="item.id" @click="showDetail(item.numIntervention)">
                        <div class="utilisationsASUP-content-item">{{ new Date(item.dateActe).toLocaleDateString() }}</div>
                        <div class="utilisationsASUP-content-item">{{ item.numIntervention }}</div>
                        <div class="utilisationsASUP-content-item agentInfo"><img :src="image_grade(item.agent.grade)" width="25px" height="auto"><span>{{ item.agent.nomAgent }} {{ item.agent.prenomAgent }}</span></div>
                        <div class="utilisationsASUP-content-item">{{ item.acteSoin }}</div>
                        <div class="utilisationsASUP-content-item">{{ item.idMedicamentsList ? item.idMedicamentsList.length() : "Aucun" }}</div>
                        <div class="utilisationsASUP-content-item">Dr {{ item.medecinPrescripteur.nomExercice }}</div>
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
                        <div v-if="sortedData && sortedData[selectedSoin.code] && sortedData[selectedSoin.code].length > 0" class="status1-content">
                            <div class="status1-header">
                                <div class="status1-header-item">Nbre</div>
                                <div class="status1-header-item">Nom Médicament</div>
                                <div class="status1-header-item">VSAV</div>
                                <div class="status1-header-item">Créateur</div>
                                <div class="status1-header-item">Date Péremption</div>
                                <div class="status1-header-item">Num Lot</div>
                            </div>
                            <div class="status1-content-items" v-for="item in sortedData[selectedSoin.code]" :key="item.id">
                                <div class="status1-content-item">{{ item.count }}</div>
                                <div class="status1-content-item">{{ item.nomMedicament }}</div>
                                <div class="status1-content-item">{{ item.affectationVSAV }}</div>
                                <div class="status1-content-item agentInfo"><img :src="image_grade(item.createur.grade)" width="25px" height="auto"><span>{{ item.createur.nomAgent }} {{ item.createur.prenomAgent }}</span></div>
                                <div class="status1-content-item">{{ new Date(item.datePeremption).toLocaleDateString() }}</div>
                                <div class="status1-content-item">{{ item.numLot }}</div>           
                            </div>
                        </div>
                        <div v-else class="status1-message">Aucun médicament enregistré pour cet acte.</div>
                    </div>
                </div>
            </div>
            <div class="status3">
            <div class="status3-title">Remplacements pour péremption</div>
            <div v-if="asupData && asupData.rows3 && asupData.rows3.length != 0" class="status3-content">
                <div class="status3-header">
                    <div class="status3-header-item">Nbre</div>
                    <div class="status3-header-item">Nom Médicament</div>
                        <div class="status3-header-item">VSAV</div>
                        <div class="status3-header-item">Créateur</div>
                        <div class="status3-header-item">Date Péremption</div>
                        <div class="status3-header-item">Num Lot</div>
                    </div>
                    <div class="status3-content-items" v-for="item in asupData.rows3" :key="item.id">
                        <div class="status3-content-item">{{ item.count }}</div>
                        <div class="status3-content-item">{{ item.nomMedicament }}</div>
                        <div class="status3-content-item">{{ item.affectationVSAV }}</div>
                        <div class="status3-content-item agentInfo"><img :src="image_grade(item.createur.grade)" width="25px" height="auto"><span>{{ item.createur.nomAgent }} {{ item.createur.prenomAgent }}</span></div>
                        <div class="status3-content-item">{{ new Date(item.datePeremption).toLocaleDateString() }}</div>
                        <div class="status3-content-item">{{ item.numLot }}</div>           
                    </div>
                </div>
                <div v-else class="status3-message">Aucun médicament à remplacer avant la fin du mois prochain.</div>
            </div>
            <div class="status2">
                <div class="status2-title">Médicaments utilisés en remplacement</div>
                <div v-if="asupData.rows2.length != 0" class="status2-content">
                    <div class="status2-header">
                        <div class="status2-header-item">Nbre</div>
                        <div class="status2-header-item">Nom Médicament</div>
                        <div class="status2-header-item">VSAV</div>
                        <div class="status2-header-item">Créateur</div>
                        <div class="status2-header-item">Date Péremption</div>
                        <div class="status2-header-item">Num Lot</div>
                    </div>
                    <div class="status2-content-items" v-for="item in asupData.rows2" :key="item.id">
                        <div class="status2-content-item">{{ item.count }}</div>
                        <div class="status2-content-item">{{ item.nomMedicament }}</div>
                        <div class="status2-content-item">{{ item.affectationVSAV }}</div>
                        <div class="status2-content-item agentInfo"><img :src="image_grade(item.createur.grade)" width="25px" height="auto"><span>{{ item.createur.nomAgent }} {{ item.createur.prenomAgent }}</span></div>
                        <div class="status2-content-item">{{ new Date(item.datePeremption).toLocaleDateString() }}</div>
                        <div class="status2-content-item">{{ item.numLot }}</div>           
                    </div>
                </div>
                <div v-else class="status2-message">Aucun médicament utilisé en cours de remplacement.</div>
            </div>
       </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import Dropdown from 'primevue/dropdown';


const sqlStore = useSqlStore();
const asupData = ref({});
const isLoading = ref(false);
const showPanel = ref(false);
const detailData = ref({});
const imgLoading = ref(true);
const sortedData = ref({});
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
  return dict_grades[current_grade];
};

const selectedSoin = ref(null);

const getData = async () => {
    isLoading.value = true;
    await sqlStore.getAsupVizData();
    asupData.value = sqlStore.asupVizData;
    sortedData.value = asupData.value.rows1.reduce((acc, item) => {
        if (!acc[item.acteSoin]) {
            acc[item.acteSoin] = [];
        }
        acc[item.acteSoin].push(item);
        return acc;
    }, {});
    console.log(sortedData.value);
    isLoading.value = false;

};

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

.status3-content {
    display: table;
    width: 120%;
    margin-bottom: 1rem;
    overflow-x: scroll;
    white-space: nowrap;
}
.status2-content {
    display: table;
    width: 120%;
    margin-bottom: 1rem;
    overflow-x: scroll;
    white-space: nowrap;
}
.utilisationsASUP-content {
    display: table;
    width: 120%;
    margin-bottom: 1rem;
    overflow-x: scroll;
    white-space: nowrap;
}
.status1-content {
    display: table;
    width: 120%;
    margin-bottom: 1rem;
    overflow-x: scroll;
    white-space: nowrap;
}
.status1-header{
    display: table-row;
}
.status3-header{
    display: table-row;
}
.status2-header{
    display: table-row;
}
.utilisationsASUP-header{
    display: table-row;
}
.status3-header-item{
    display: table-cell;
    font-weight: bold;
    padding: 0.5rem;
    color: #d64d00;
    border-bottom: 1px solid #d64d00;
    text-align: center;
    vertical-align: middle;
}
.status2-header-item{
    display: table-cell;
    color: #0078f3;
    font-weight: bold;
    padding: 0.5rem;
    border-bottom: 1px solid #0078f3;
    text-align: center;
    vertical-align: middle;
}
.utilisationsASUP-header-item{
    color: #009081;
    display: table-cell;
    font-weight: bold;
    padding: 0.5rem;
    border-bottom: 1px solid #009081;
    text-align: center;
    vertical-align: middle;
}

.status3-content-items{
    display: table-row;
    padding: 0.5rem;
}
.status2-content-items{
    display: table-row;
    padding: 0.5rem;
}
.utilisationsASUP-content-items{
    display: table-row;
    padding: 0.5rem;
}
.status1-content-items{
    display: table-row;
    padding: 0.5rem;
}
.status3-content-item{
    display: table-cell;
    border-bottom: 1px solid #d64d00;
    text-align: center;
    vertical-align: middle;
    padding: 0.5rem;
}
.status2-content-item{
    display: table-cell;
    border-bottom: 1px solid #0078f3;
    text-align: center;
    vertical-align: middle;
    padding: 0.5rem;
}
.utilisationsASUP-content-item{
    display: table-cell;
    border-bottom: 1px solid #009081;
    text-align: center;
    vertical-align: middle;
    padding: 0.5rem;
}
.status1-content-item{
    display: table-cell;
    border-bottom: 1px solid #C08C65;
    text-align: center;
    vertical-align: middle;
    padding: 0.5rem;
}
.status1-header-item{
    display: table-cell;
    font-weight: bold;
    padding: 0.5rem;
    color: #C08C65;
    border-bottom: 1px solid #C08C65;
    text-align: center;
    vertical-align: middle;
}
.utilisationsASUP-content-item:hover{
    background-color: #dffdf7;
    cursor: pointer;
}
.status3-content-items:nth-child(odd){
    background-color: #fff4f3;
}
.status2-content-items:nth-child(odd){
    background-color: #f4f6ff;
}
.utilisationsASUP-content-items:nth-child(odd){
    background-color: #dffdf7;
}
.status1-content-items:nth-child(odd){
    background-color: #fbf5f2;
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
    display: flex;
    align-items: left;
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
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
}
</style>