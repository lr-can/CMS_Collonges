<template>
    <div v-if="showPanel" class="replacementPanelFilter" @click="showPanel = !showPanel"></div>
    <div v-if="showPanel" class="replacementPanel">
        <div class="return">
            <div class="returnBtn" @click="showPanel = !showPanel">Retour</div>
        </div>
            <div class="subtitle">Intervention {{ detailData.numIntervention }}</div>
            <div class="illustration" @click="navigate()">
                <img :src="backgroundImageSrc()" alt="Illustration" width="100%" height="auto" class="illustrationImg">
            </div>
            <div>
                <p>
                    <span class="bold">Raison :</span> {{ detailData.interventionDetails.notificationTitre }}
                </p>
                <p>
                    <span class="bold">Date :</span> {{ new Date(detailData.dateActe).toLocaleDateString() }}
                </p>
                <p>
                    <span class="bold">Heure :</span> {{ new Date(detailData.dateActe).toLocaleTimeString() }}
                </p>
                <p>
                    <span class="bold">Lieu :</span> {{ detailData.interventionDetails.notificationAdresse }}
                </p>
            </div>
            <div class="subtitle">ASUP</div>
            <div>
                <p>
                    <span class="bold">Agent :</span> {{ detailData.agent.nomAgent }} {{ detailData.agent.prenomAgent }} ({{ detailData.matriculeAgent }})
                </p>
                <p>
                    <span class="bold">Acte :</span> {{ detailData.acteSoin }}
                </p>
                <p>
                    <span class="bold">Médicaments :</span> {{ detailData.idMedicamentsList.length != 0 ? detailData.idMedicamentsList.length : 'Aucun' }}
                </p>
                <p>
                    <span class="bold">Prescripteur :</span> Dr {{ detailData.medecinPrescripteur.nomExercice }} {{ detailData.medecinPrescripteur.prenomExercice }} ({{ detailData.medecinPrescripteur.identifiantRPPS }})
                </p>
                <p>
                    <span class="bold">Effets secondaires :</span> {{ detailData.effetsSecondaires != null ? detailData.effetsSecondaires : 'Aucun' }}
                </p>
                <p>
                    <span class="bold">Commentaire :</span> {{ detailData.commentaire != null ? detailData.commentaire : 'Aucun' }}
                </p>
            </div>
        </div>
    <div class="subtitle">
        Données ASUP
    </div>
    <div id="viz">
       <div v-if="isLoading">
            <img src="@/assets/loadingTiles.gif" alt="Loading" width="300px" height="auto">
       </div>
       <div v-else>
            <div class="status3">
                <div class="status3-title">Remplacements pour péremption</div>
                <div v-if="asupData.rows3.length != 0" class="status3-content">
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
                        <div class="status3-content-item">{{ item.matriculeCreateur }}</div>
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
                        <div class="status2-content-item">{{ item.matriculeCreateur }}</div>
                        <div class="status2-content-item">{{ new Date(item.datePeremption).toLocaleDateString() }}</div>
                        <div class="status2-content-item">{{ item.numLot }}</div>           
                    </div>
                </div>
                <div v-else class="status2-message">Aucun médicament utilisé en cours de remplacement.</div>
            </div>
            <div class="utilisationsASUP">
                <div class="utilisationsASUP-title">Historique ASUP</div>
                <div v-if="asupData.rows4.length != 0" class="utilisationsASUP-content">
                    <div class="utilisationsASUP-header">
                        <div class="utilisationsASUP-header-item">Agent</div>
                        <div class="utilisationsASUP-header-item">Date</div>
                        <div class="utilisationsASUP-header-item">Inter</div>
                        <div class="utilisationsASUP-header-item">ASUP</div>
                        <div class="utilisationsASUP-header-item">Méd. Utilisés</div>
                        <div class="utilisationsASUP-header-item">Prescripteur</div>
                    </div>
                    <div class="utilisationsASUP-content-items" v-for="item in asupData.rows4" :key="item.id" @click="showDetail(item.numIntervention)">
                        <div class="utilisationsASUP-content-item">{{ item.agent.nomAgent }} {{ item.agent.prenomAgent }}</div>
                        <div class="utilisationsASUP-content-item">{{ new Date(item.dateActe).toLocaleDateString() }}</div>
                        <div class="utilisationsASUP-content-item">{{ item.numIntervention }}</div>
                        <div class="utilisationsASUP-content-item">{{ item.acteSoin }}</div>
                        <div class="utilisationsASUP-content-item">{{ item.idMedicamentsList.length }}</div>
                        <div class="utilisationsASUP-content-item">Dr {{ item.medecinPrescripteur.nomExercice }}</div>
                    </div>
                </div>
                <div v-else class="utilisationsASUP-message">Aucune utilisation ASUP enregistrée.</div>
            </div>
       </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useSqlStore } from "@/stores/database.js";


const sqlStore = useSqlStore();
const asupData = ref({});
const isLoading = ref(false);
const showPanel = ref(false);
const detailData = ref({});

const getData = async () => {
    isLoading.value = true;
    await sqlStore.getAsupVizData();
    asupData.value = sqlStore.asupVizData;
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
    let url = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=200&center=lonlat:${lon},${lat}&zoom=14&marker=lonlat:${lon},${lat};type:circle;color:%23ff0000;size:xx-large;icon:sos;icontype:material;iconsize:small;strokecolor:%23ff0000&scaleFactor=2&apiKey=75c6e5ac06e84d3a95473195e7af529d`;
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
    flex-direction: column;
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
    overflow-y: auto;
}
@media screen and (max-width: 768px) {
    .replacementPanel {
        min-width: 90%;
        max-width: 90%;
    }
    
}
.bold{
    font-weight: bold;
}


.replacementPanel > div {
    margin: 1rem;
}
.status3, .status2, .utilisationsASUP{
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
    border-bottom: 1px solid #d64d00;
    text-align: center;
    vertical-align: middle;
}
.status2-header-item{
    display: table-cell;
    font-weight: bold;
    padding: 0.5rem;
    border-bottom: 1px solid #0078f3;
    text-align: center;
    vertical-align: middle;
}
.utilisationsASUP-header-item{
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
.status3-message, .status2-message, .utilisationsASUP-message{
    font-size: 1rem;
    font-style: italic;
    text-align: center;
    margin-top: 1rem;
    text-align: left;
    color: #666666;
}
</style>