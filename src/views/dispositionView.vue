<template>
     <div v-if="introduction">
            <div class="subtitle">
                Mise à disposition du matériel
            </div>
            <form>
                <div class="consigne">
                    <span class="number" id="premiereConsigne">1</span>
                    Je sélectionne le <span class="TextHighlight">type d'inventaire</span> que je souhaite réaliser.
                </div>
                <div class="consigne">
                    <span  class="number" id="deuxiemeConsigne">2</span>
                    Pour chaque matériel, je réalise la <span class="TextHighlight">suppression du matériel</span> sorti en scannant les étiquettes restantes.
                </div>
                <div class="consigne">
                    <span class="number" id="troisiemeConsigne">3</span>
                    Pour chaque matériel, j'effectue la <span class="TextHighlight">mise à disposition</span> du matériel en scannant les étiquettes.
                </div>
                <div class="question">
                    <ToggleButton v-model="PartialOrComplete" onLabel="Inventaire Complet" offLabel="Inventaire Partiel"
                     class="w-9rem" aria-label="Do you confirm" />
                </div>
                <div class="validationBtn" @click="submitForm">Valider le choix</div>
            </form>
    </div>
    <div v-if="listLoaded">
        <div class="progressBar">
            <div class="progression" :style="{width: currentProgression * 100 + '%'}"></div>
        </div>
        <div class="subtitle">
            {{ currentMateriel }}
        </div>
        <div class="subsubtitle">
                Suppression du materiel utilisé
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ToggleButton from 'primevue/togglebutton';
import { useSqlStore } from "@/stores/database.js";

const introduction = ref(true);
const PartialOrComplete = ref(true);
const sqlStore = useSqlStore();
const materielsToCheck = ref([]);
const currentMateriel = ref("Materiel");
const currentIdMateriel = ref('');
const currentObjectif = ref('');
const currentZone = ref('');
const materielLenght = ref(0);
const currentProgression = ref(0);
const listLoaded = ref(false);

const submitForm = async () => {
    if(PartialOrComplete.value){
        await sqlStore.getMaterielsToCheck("Complete");
        materielsToCheck.value = await sqlStore.materielsToCheck;
        materielLenght.value = materielsToCheck.value.length;

    }else{
        await sqlStore.getMaterielsToCheck("partial");
        materielsToCheck.value = await sqlStore.materielsToCheck;
        materielLenght.value = materielsToCheck.value.length;
    }
    console.log(materielsToCheck.value)
    listLoaded.value = true;
    introduction.value = false;
    progress();
}
const progress = async () => {
    if(materielsToCheck.value.length > 0){
        currentMateriel.value = materielsToCheck.value[0].nomMateriel;
        currentIdMateriel.value = materielsToCheck.value[0].idMateriel;
        currentObjectif.value = materielsToCheck.value[0].nbVsav;
        currentZone.value = materielsToCheck.value[0].zone;
        currentIdMateriel.value = materielsToCheck.value[0].idMateriel;
        materielsToCheck.value.shift();
        currentProgression.value = (materielLenght.value - materielsToCheck.value.length) / materielLenght.value;
    }else{
        listLoaded.value = false;
    }

}
</script>
<style>
.consigne{
    color: #666666;
    text-align: justify;
    margin-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
}
.consigne > .number{
    font-weight: bold;
    text-align: center;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin: 5px;
    border-radius: 30px;
    color: white;
    background-color: #0078f3;
    font-size: 18px;
}
.TextHighlight{
    color: #0078f3;
    font-weight: bold;
}
.question{
    margin-top: 2rem;
    text-align: center;
}
.progressBar{
    width: 90%;
    height: 1rem;
    background-color: #e8edff;
    border-radius: 30px;
    margin: auto;
    margin-bottom: 1.5rem;
    
}
.progression{
    height: 100%;
    background-color: #0078f3;
    border-radius: 30px;
}

</style>