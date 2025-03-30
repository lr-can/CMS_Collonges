<template>
    <div class="subtitle">
        Gestion des péremptions ASUP
    </div>
    <div v-if="pageLoading">
        <img src="@/assets/loadingTiles.gif" alt="Loading" width="100%" height="auto">
    </div>
    <div v-if="showDocument && !documentSigned">
        <div class="part">
        <div class="subsubtitle">
            Demande de remplacement de médicaments périmés
        </div>
        <p>
            La demande de remplacement pour le mois {{ currentMonthName }} concerne les produits suivants :
        </p>
        <div>
            <table>
                <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                </tr>
                <tr>
                    <td>Salbutamol 5mg/2,5ml</td>
                    <td>{{ nbSalbuta5mg25ml1 +  nbSalbuta5mg25ml2}}</td>
                </tr>
                <tr>
                    <td>Ipratropium 0,5mg/2,5ml</td>
                    <td>{{ nbIpra05mg25ml1 + nbIpra05mg25ml2}}</td>
                </tr>
                <tr>
                    <td>Salbutamol 2,5mg/2,5ml</td>
                    <td>{{ nbSalbuta25mg25ml1 +  nbSalbuta25mg25ml2}}</td>
                </tr>
                <tr>
                    <td>Ipratropium 0,25mg/ml</td>
                    <td>{{ nbIpra025mgml1 + nbIpra025mgml2}}</td>
                </tr>
                <tr>
                    <td>Nyxoid</td>
                    <td>{{ nbNyxoid1 + nbNyxoid2 }}</td>
                </tr>
                <tr>
                    <td>Anapen 150</td>
                    <td>{{ nbAnapen1501 + nbAnapen1502 }}</td>
                </tr>
                <tr>
                    <td>Anapen 300</td>
                    <td>{{ nbAnapen3001 + nbAnapen3002  }}</td>
                </tr>
                <tr>
                    <td>Anapen 500</td>
                    <td>{{ nbAnapen5001 + nbAnapen5002 }}</td>
                </tr>
            </table>
        </div>
        </div>
        <div class="part">
        <div class="subsubtitle">
            Correspondant ASUP
        </div>
        <p>
            Signataire identifié : {{ nomCorrespondant1 }}
        </p>
        </div>
        <div class="part">
        <div class="subsubtitle">
            Signature
        </div>
        <div>
            <button @click="clearSignature()">Effacer</button>
        </div>
            <Vue3Signature
            ref="signature"
            :sigOption="optionsSig"
            :w="'100%'"
            :h="'120px'"
            class="signatureField"
            >
        </Vue3Signature>
    </div>
        <div class="validationBtn" @click="saveSignature">Sauvegarder la signature</div>
    </div>
    <div v-if="documentSigned && showDocument">
        <DocusealForm
        :key="formKey"
        :src="'https://docuseal.co/d/eenfBUR2pauqbw'"
        :email="email"
        @complete="onComplete"
        :values="documentData"
        data-skip-fields="true"
        :signature="signatureImage"
        @load="onLoad"
        language="fr"
        />
    </div>
    <div v-if="validationMessage" class="centered">
        <div>
            <img src="@/assets/illustrations/document-checkmark.png" alt="Checkmark by Freepik" width="100px" height="auto"/>
        </div>
        <div class="subsubtitle">
            Demande effectuée
        </div>
        <div>
            <p>
                La demande pour le mois {{ currentMonthName }} a bien été effectuée.<br>Vous pouvez télécharger la demande ci-dessous, ou la récupérer directement par mail, afin de la transmettre au service.
            </p>
        </div>
        <div>
            <a :href="newDemandeUrl">📄 Télécharger la demande</a>
        </div>

    </div>
    <div v-if="lastDemandeData && !pageLoading" class="centered">
        <div>
            <img src="@/assets/illustrations/calendar-folder.png" alt="Calendar Folder by Rizki Ahmad Fauzi" width="100px" height="auto"/>
        </div>
        <div class="subsubtitle">
            Demande déjà effectuée
        </div>
        <div>
            <p>
                La demande pour le mois {{ currentMonthName }} a déjà été effectuée par {{ lastDemandeData.correspondantAsup }}.
            </p>
        </div>
        <div>
            <a :href="lastDemandeData.url">📄 Télécharger la demande</a>
        </div>
    </div>
    <div v-if="showNoReplacement">
        <div class="centered">
            <div>
                <img src="@/assets/illustrations/no-replacement.png" alt="Empty Folder by Freepik" width="100px" height="auto"/>
            </div>
            <div class="subsubtitle">
                Aucune demande à effectuer
            </div>
            <div>
                <p>
                    Aucun remplacement de médicament n'est à demander pour le mois {{ currentMonthName }}.
                </p>
            </div>
        </div>
    </div>
    <div id="bottom"></div>
  </template>
  
  <script setup>
  import Vue3Signature from "vue3-signature"
  import { DocusealForm } from '@docuseal/vue'
  import { ref } from 'vue';
  import { useAuth0 } from '@auth0/auth0-vue';
  import { useSqlStore } from "@/stores/database.js";

  const auth0 = useAuth0();
  const sqlStore = useSqlStore();
  const clearSignature = () => {
            signature.value.clear();
        }

    const onLoad = () => {
            alert("Les données ont été préchargées, vous pouvez appuyer sur 'suivant' jusqu'à pouvoir soumettre le formulaire");
        }

    const onComplete = (data) => {
        console.log(data);
        showDocument.value = false;
        const DemandeData = {
            mois: new Date().toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }).replace("/", "-"),
            url: data.submission_url,
            correspondantAsup: data.values[10].value
        };
        sqlStore.addDemandePeremptionAsup(DemandeData);
        formKey.value += 1;
        newDemandeUrl.value = data.submission_url;
        validationMessage.value = true;
    }

    let currentDate = new Date();
    let formattedDate = currentDate.toLocaleDateString('fr-FR');


    const scrollToBottom = async () => {
            await new Promise(r => setTimeout(r, 500));
            const element = document.getElementById('bottom');
            element.scrollIntoView({ behavior: 'smooth' });
        }


    const pageLoading = ref(true);
    const currentMonthName = ref('');
    const optionsSig = {
        penColor: "rgb(0, 0, 0)",
        backgroundColor: "rgb(255,255,255)"
    };


    const date1 = ref(formattedDate);
    const date2 = ref(formattedDate);


    const vsav1 = ref(1);
    const vsav2 = ref(2);
    const signature = ref(null);
    const signatureImage = ref(null);
    const documentSigned = ref(false);

    const nbSalbuta5mg25ml1 = ref(0);
    const nbSalbuta5mg25ml2 = ref(0);

    const nbIpra05mg25ml1 = ref(0);
    const nbIpra05mg25ml2 = ref(0);

    const nbSalbuta25mg25ml1 = ref(0);
    const nbSalbuta25mg25ml2 = ref(0);

    const nbnebuMaskPed1 = ref(0);
    const nbnebuMaskPed2 = ref(0);

    const nbnebuMaskAdu1 = ref(0);
    const nbnebuMaskAdu2 = ref(0);

    const nbIpra025mgml1 = ref(0);
    const nbIpra025mgml2 = ref(0);
    const isLoaded = ref(false);

    const nbNyxoid1 = ref(0);
    const nbNyxoid2 = ref(0);

    const nbAnapen1501 = ref(0);
    const nbAnapen1502 = ref(0);

    const nbAnapen3001 = ref(0);
    const nbAnapen3002 = ref(0);

    const nbAnapen5001 = ref(0);
    const nbAnapen5002 = ref(0);

    const nbPenthrox1 = ref(0);
    const nbPenthrox2 = ref(0);

    const nbGlucaKit1 = ref(0);
    const nbGlucaKit2 = ref(0);

    const nbDoliPed1 = ref(0);
    const nbDoliPed2 = ref(0);

    const nbDoli5001 = ref(0);
    const nbDoli5002 = ref(0);

    const nbNaCl1 = ref(0);
    const nbNaCl2 = ref(0);

    const nomCorrespondant1 = ref('');
    const nomCorrespondant2 = ref('');
    const email = ref('');
    const lastDemandeData = ref({});

    const documentData = ref({});
    const validationMessage = ref(false);

    const showDocument = ref(false);
    const newDemandeUrl = ref('');
    const peremptionCount = ref({});
    const formKey = ref(42);

    const showNoReplacement = ref(false);
    
    const saveSignature = async () => {
    try {
        signatureImage.value = signature.value.save("png").replace("data:image/png;base64,", "");


        console.log("Signature Image Base64:", signatureImage.value);
        
        documentSigned.value = true;
        scrollToBottom();
    } catch (error) {
        console.error("Error saving signature:", error);
    }
}

    const verifyIfNoDemande = async () => {
        await sqlStore.getDemandePeremptionAsup();
        const currentMonth = new Date().toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }).replace("/", "-");
        const lastDemande = sqlStore.lastDemandePeremptionAsup;
        let currentMonthNameString = new Date().toLocaleDateString('fr-FR', { month: 'long'}); 
        if (currentMonthNameString === 'août' || currentMonthNameString === 'octobre' || currentMonthNameString === 'avril'){
            currentMonthName.value = "d'" + currentMonthNameString;
            } else {
            currentMonthName.value = "de " + currentMonthNameString;
        }

        if (lastDemande.mois === currentMonth) {
            showDocument.value = false;
            pageLoading.value = false;
            lastDemandeData.value = lastDemande;
        } else {
            let verification2 = await verifyIfReplacementNeeded();
            pageLoading.value = false;
            lastDemandeData.value = null;

            if (verification2 === true){
                generateDocumentData();
            } else {
                showNoReplacement.value = true;
            }
        }

    }
    const verifyIfReplacementNeeded = async () => {
        await sqlStore.getPeremptionCountAsup();
        peremptionCount.value = sqlStore.asupPeremptionData;

        if (peremptionCount.value.meta.total[0]["COUNT(*)"] > 0){
            return true;
        } else {
            return false;
        }
    }

    const updateVariables = async (data) => {
    await data.vsav1.forEach(item => {
        const variableName = `nb${item.prefixApp}1`;
        if (eval(variableName)) {
            eval(variableName).value = parseInt(item.toReplace);
        }
    });

    await data.vsav2.forEach(item => {
        const variableName = `nb${item.prefixApp}2`;
        if (eval(variableName)) {
            eval(variableName).value = parseInt(item.toReplace);
        }
    });
};

const generateDocumentData = async () => {
        const utilisateur = auth0.user.value;
        email.value = utilisateur.email;
        nomCorrespondant1.value = utilisateur.name;
        nomCorrespondant2.value = utilisateur.name;

        // Extraire les données de peremptionCount.value
        const data = peremptionCount.value.data;
        await updateVariables(data);
        
        // Mettre à jour documentData.value avec les nouvelles valeurs
        documentData.value = {
            date1: date1.value,
            date2: date2.value,
            vsav1: vsav1.value,
            vsav2: vsav2.value,
            nbSalbuta5mg25ml1: nbSalbuta5mg25ml1.value,
            nbSalbuta5mg25ml2: nbSalbuta5mg25ml2.value,
            nbIpra05mg25ml1: nbIpra05mg25ml1.value,
            nbIpra05mg25ml2: nbIpra05mg25ml2.value,
            nbSalbuta25mg25ml1: nbSalbuta25mg25ml1.value,
            nbSalbuta25mg25ml2: nbSalbuta25mg25ml2.value,
            nbIpra025mgml1: nbIpra025mgml1.value,
            nbIpra025mgml2: nbIpra025mgml2.value,
            nbNyxoid1: nbNyxoid1.value,
            nbNyxoid2: nbNyxoid2.value,
            nbAnapen1501: nbAnapen1501.value,
            nbAnapen1502: nbAnapen1502.value,
            nbAnapen3001: nbAnapen3001.value,
            nbAnapen3002: nbAnapen3002.value,
            nbAnapen5001: nbAnapen5001.value,
            nbAnapen5002: nbAnapen5002.value,
            nomCorrespondant1: nomCorrespondant1.value,
            nomCorrespondant2: nomCorrespondant2.value,
            signatureCorrespondant1: signatureImage.value,
        }
        await new Promise(r => setTimeout(r, 1000));
        
        console.log(documentData.value);
        pageLoading.value = false;
        showDocument.value = true;
        let asup2 = {
            nbDoli5001: nbDoli5001.value,
            nbDoli5002: nbDoli5002.value,
            nbDoliPed1: nbDoliPed1.value,
            nbDoliPed2: nbDoliPed2.value,
            nbGlucaKit1: nbGlucaKit1.value,
            nbGlucaKit2: nbGlucaKit2.value,
            nbPenthrox1: nbPenthrox1.value,
            nbPenthrox2: nbPenthrox2.value
        };
        console.log(asup2);
        scrollToBottom();
        isLoaded.value = true;
    };


    verifyIfNoDemande();
  
  </script>
  
<style scoped>
#bottom {
    height: 100px;
    display: block;
}
.centered{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.centered > div{
    margin-bottom: 1rem;
}
.signatureField{
    margin-top: 1rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    margin-top: 1rem;
    font-size: small;
    color: #273961;
}


th, td {
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f4f6ff;
    font-weight: bold;
}
tr:nth-child(odd) {
    background-color: #f4f6ff;
}
tr{
    border-bottom: 1px solid #bccdff;

}
button{
    background-color: white;
    color: #0078f3;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 0.5rem;
    border: 1px solid #0078f3;
    transition: color-fade 0.5s ease-in-out;
}
button:hover{
    background-color: #f4f6ff;
}
@keyframes color-fade {
    0% {
        color: #0078f3;
    }
    50% {
        color: #f4f6ff;
    }
    100% {
        color: #0078f3;
    }
}
</style>