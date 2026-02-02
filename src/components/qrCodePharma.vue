<template>
        <div class="list-header">
            <div class="subsubtitle">Matériel présent dans la pharmacie</div>
            <button type="button" class="help-btn" @click="toggleHelp">?</button>
        </div>
        <p v-if="showHelp" class="help-text">
            Cliquez sur un ID pour l'exclure de l'archivage. Les éléments exclus passent en bas dans "Toujours disponible".
        </p>
        <div class="quick-input">
            <input
                v-model="manualId"
                type="number"
                inputmode="numeric"
                placeholder="Saisir un ID"
                class="manual-input"
                @keyup.enter="toggleById"
            />
            <button type="button" class="manual-btn" @click="toggleById">Basculer</button>
        </div>
        <div v-if="manualError" class="input-error">{{ manualError }}</div>
        <div v-if="visualisationPharma.length == 0">Aucun {{ props.info.nomMateriel }} présent dans la pharmacie.</div>
        <div v-else>
            <div class="section-title">À archiver</div>
            <div v-if="toArchiveList.length == 0" class="empty-list">Aucun matériel à archiver.</div>
            <div v-if="toArchiveList.length > 0" class="visualisation">
                <div class="pharmaItem archiveItem" v-for="row in toArchiveList" :key="row.idStock" @click="toggleArchive(row.idStock)">
                    {{ row.idStock }}
                </div>
            </div>
            <div class="section-title">Toujours disponible</div>
            <div v-if="availableList.length == 0" class="empty-list">Aucun matériel disponible.</div>
            <div v-if="availableList.length > 0" class="visualisation">
                <div class="pharmaItem availableItem" v-for="row in availableList" :key="row.idStock" @click="toggleArchive(row.idStock)">
                    {{ row.idStock }}
                </div>
            </div>
        </div>
        <div id="supprimer" @click="archive()"><span v-if="!deleting">Confirmer l'archivage de {{ listToProcess.length }} élément{{ pluriel() }}</span><span><img src="@/assets/loading.gif" alt="" width="50px" height="auto" v-if="deleting"></span></div>
        
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSqlStore } from "@/stores/database.js";
import { useAuth0 } from '@auth0/auth0-vue';
import Loading from '../assets/sounds/Loading.mp3';
import Deleted from '../assets/sounds/Deleted.mp3';

const props = defineProps(['info']);

const sqlStore = useSqlStore();
const loadingSound = new Audio(Loading);
const deletedSound = new Audio(Deleted);
const auth0 = useAuth0();
const utilisateur = auth0?.user?.value || null;
const matricule = utilisateur?.profile?.[0] || localStorage.getItem('cms_auth_matricule') || '';
const visualisationPharma = ref([]);
const listToProcess = ref([]);
const deleting = ref(false);
const emit = defineEmits(['archive']);
const showHelp = ref(false);
const manualId = ref('');
const manualError = ref('');

const toggleHelp = () => {
    showHelp.value = !showHelp.value;
};

async function getVisualisationPharma(){
   await sqlStore.getVisualisationPharma(props.info.idMateriel);
   visualisationPharma.value = sqlStore.visualisationPharma;
   if (visualisationPharma.value.length == 0) {
       emit('archive');
   }
   let idStocksList = visualisationPharma.value
        .map((item) => Number(item.idStock))
        .filter((item) => Number.isFinite(item));
   listToProcess.value = idStocksList;

}

const toggleArchive = (idStock) => {
    const normalizedId = Number(idStock);
    if (!Number.isFinite(normalizedId)) {
        return;
    }
    loadingSound.pause();
    if (listToProcess.value.includes(normalizedId)) {
        listToProcess.value = listToProcess.value.filter((item) => item !== normalizedId);
        loadingSound.play();
    } else {
        listToProcess.value.push(normalizedId);
        loadingSound.play();
    }
    console.log(listToProcess.value);
}

const toArchiveList = computed(() => {
    return visualisationPharma.value.filter((item) => listToProcess.value.includes(Number(item.idStock)));
});

const availableList = computed(() => {
    return visualisationPharma.value.filter((item) => !listToProcess.value.includes(Number(item.idStock)));
});

const toggleById = () => {
    manualError.value = '';
    const parsedId = parseInt(String(manualId.value || '').trim(), 10);
    if (!Number.isFinite(parsedId)) {
        manualError.value = "Veuillez saisir un ID valide.";
        return;
    }
    const exists = visualisationPharma.value.some((item) => Number(item.idStock) === parsedId);
    if (!exists) {
        manualError.value = "ID introuvable dans la liste.";
        return;
    }
    toggleArchive(parsedId);
    manualId.value = '';
};

onMounted(() => {
    getVisualisationPharma();
});
const archive = async () => {
    deleting.value = true;
    const data = {
        idAgent: matricule,
        materielsList: listToProcess.value
    };

    const confirmArchive = async () => {
        if (confirm(`Confirmer l'archivage de ${listToProcess.value.length} élément${pluriel()} ?`)) {
            await sqlStore.archivePharma(data);
            listToProcess.value = [];
            deleting.value = false;
            deletedSound.play();
            emit('archive');
        } else {
            deleting.value = false;
        }
    };

    await confirmArchive();
};

const pluriel = () => {
    if (listToProcess.value.length > 1) {
        return 's';
    }
    return '';
}
</script>

<style scoped>  
.list-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.validation-success {
    background-color: #dffee6;
    color: #18753c;
    border-radius: 5px;
    text-align: center;
    max-width: 50%;
}

.validation-error {
    background-color: #fff4f4;
    color: #ce0500;
    border-radius: 5px;
    text-align: center;
    max-width: 100%;
}
#suppression{
    background-color: #fff4f3;
    color: #d64d00;
}

.validation-pending {
    background-color: #f4f6ff;
    color: #0078f3;
    border-radius: 5px;
    text-align: center;
    max-width: 70%;
}
.help-btn{
    border: 1px solid #e0e0e0;
    background-color: #fff;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-weight: bold;
    cursor: pointer;
    color: #0078f3;
}
.help-btn:hover{
    background-color: #f4f6ff;
}
.help-text{
    margin: 0.5rem 0 1rem 0;
    color: #666666;
    font-size: 0.9rem;
}
.quick-input{
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
}
.manual-input{
    flex: 1;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    font-size: 0.95rem;
}
.manual-btn{
    border: none;
    background-color: #0078f3;
    color: white;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    cursor: pointer;
    font-weight: 600;
}
.manual-btn:hover{
    background-color: #0056b3;
}
.input-error{
    color: #ce0500;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}
.section-title{
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #333333;
}
.empty-list{
    color: #666666;
    margin-bottom: 0.5rem;
}
.pharmaItem{
    border-radius: 10px;
    flex: 0 1 30%;
    padding: 5px;
    text-align: center;
    margin: auto;
    margin: 0.1rem;
    background-image: linear-gradient(to right bottom, #eeeeee 60%, #fff4f4 100%);
        background-size: 140% 140%;
			animation: gradient 2s ease infinite;
    color: #666666;
}
.archiveItem{
    background-image: linear-gradient(to right bottom, #ffdddd 60%, #f60700 100%);
    color: #f60700;
}
.availableItem{
    background-image: linear-gradient(to right bottom, #eeeeee 60%, #dffee6 100%);
    color: #1f8d49;
}
@media (min-width: 1024px){
.archiveItem:hover{
    cursor: pointer;
    background-image: linear-gradient(to right bottom, #ffdddd 60%, #f60700 100%);
    transition: background-image 0.3s ease;
    color: #f60700;
}
.availableItem:hover{
    cursor: pointer;
    background-image: linear-gradient(to right bottom, #dffee6 60%, #1f8d49 100%);
    transition: background-image 0.3s ease;
    color: #1f8d49;
}
}
.visualisation{
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 2rem;
}
#supprimer{
    margin-top: 3rem;
  color: #f60700;
  font-size: 16px;
  margin-bottom: 2rem;
  text-align: center;
}
#supprimer:hover{
    cursor: pointer;
    background-color: #fff4f4;
    color: #f60700;
    transition: background-color 0.3s ease;
    border-radius: 35px;
}

.suppressionDiv{
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    width: 90%;
    max-width: 400px;
    height: 40vh;
    max-height: 300px;
    border-radius: 35px;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    padding: 2.5rem;
    z-index: 1;

}
.suppressionDiv > p{
    margin-top: 3.5rem;
}

#productSuppression{
    font-weight: bold;
}
</style>