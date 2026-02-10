<template>
    <div v-if="introduction" class="intro-wrapper">
        <div class="subtitle">Mise à disposition du matériel</div>
        <div class="consigne">
            <span class="number">1</span>
            Je sélectionne le <span class="TextHighlight">type d'inventaire</span> que je souhaite réaliser.
        </div>
        <div class="consigne">
            <span class="number">2</span>
            Une <span class="TextHighlight">liste Firebase</span> des matériels à vérifier est créée.
            Les matériels sont visibles en temps réel avec un statut <b>disponible</b> / <b>verrouillé</b> / <b>validé</b>.
        </div>
        <div class="consigne">
            <span class="number">3</span>
            Je peux verrouiller plusieurs matériels, puis les vérifier un par un
            (suppression puis mise à disposition).
        </div>
        <div class="consigne">
            <span class="number">4</span>
            En fin de traitement, je valide le retour d'intervention
            (<b>partiel</b> ou <b>complet</b>) pour déclencher le reset.
        </div>
        <div class="question">
            <ToggleButton
                v-model="partialOrComplete"
                onLabel="Inventaire Complet"
                offLabel="Inventaire Partiel"
                class="w-9rem"
                aria-label="Choix du mode d'inventaire"
            />
        </div>
        <div v-if="errorMessage" class="status-message error">{{ errorMessage }}</div>
        <div v-if="infoMessage" class="status-message info">{{ infoMessage }}</div>
        <div class="validationBtn" @click="startOrJoinSession">
            <span v-if="!isLoading">{{ loadingMessage || "Charger la liste de vérification" }}</span>
            <span v-else>
                <img src="@/assets/loading.gif" alt="Chargement" width="50px" height="auto">
                {{ loadingMessage || "Chargement..." }}
            </span>
        </div>
    </div>

    <div v-else-if="finished" class="finished-wrapper">
        <div class="subtitle">Mise à disposition du matériel</div>
        <div>
            <img src="@/assets/finished.gif" alt="Terminé" width="300px" height="auto">
        </div>
        <div class="subsubtitle">
            Le reset retour d'intervention (mode {{ sessionModeLabel }}) a été exécuté.
        </div>
        <div class="validationBtn" @click="resetViewState">Lancer un nouveau cycle</div>
    </div>

    <div v-else class="session-wrapper">
        <div class="subtitle">Liste du matériel à vérifier</div>
        <div v-if="errorMessage" class="status-message error">{{ errorMessage }}</div>
        <div v-if="infoMessage" class="status-message info">{{ infoMessage }}</div>

        <div class="mode-chip">
            Mode actif : <b>{{ sessionModeLabel }}</b>
        </div>

        <div class="progressBar">
            <div class="progression" :style="{ width: `${currentProgression * 100}%` }"></div>
        </div>
        <div class="progress-label">
            {{ doneCount }} / {{ totalCount }} matériels validés
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">Disponibles</div>
                <div class="stat-value">{{ availableCount }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Verrouillés (moi)</div>
                <div class="stat-value">{{ lockedByMeCount }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Verrouillés (autres)</div>
                <div class="stat-value">{{ lockedByOthersCount }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Validés</div>
                <div class="stat-value">{{ doneCount }}</div>
            </div>
        </div>

        <div v-if="materials.length === 0" class="empty-message">
            Aucun matériel à vérifier pour ce mode.
        </div>
        <p v-else class="hint-click">
            Cliquez sur une carte disponible pour la verrouiller et démarrer directement sa mise à disposition.
        </p>
        <div v-if="lockedByMeCount > 0" class="small-action release-action" @click="releaseMyLocks">
            Libérer mes verrouillages actifs ({{ lockedByMeCount }})
        </div>

        <div v-else class="materials-grid">
            <div
                v-for="material in materials"
                :key="material.idMateriel"
                class="material-card"
                :class="statusClass(material)"
                @click="handleMaterialClick(material)"
            >
                <div class="material-header">
                    <span :class="zoneClass(material.zone)">Zone {{ material.zone || "Autre" }}</span>
                    <span class="status-badge">{{ statusLabel(material) }}</span>
                </div>
                <div class="material-title">{{ material.nomMateriel }}</div>
                <div class="material-meta">
                    Objectif VSAV : <b>{{ material.nbVSAV }}</b>
                </div>
                <div class="material-actions-inline">
                    <span v-if="isLockedByOther(material)" class="locked-by">
                        Verrouillé par {{ material.lockedBy }}
                    </span>
                </div>
            </div>
        </div>

        <div v-if="currentMaterial" class="check-panel">
            <div class="subtitle panel-title">
                <span :class="zoneClass(currentMaterial.zone)">Zone {{ currentMaterial.zone || "Autre" }}</span>
                <span id="currentMateriel">{{ currentMaterial.nomMateriel }}</span>
            </div>
            <div class="subsubtitle" v-if="notArchived">Suppression du matériel utilisé</div>
            <div class="subsubtitle" v-if="notDisposition">Mise à disposition du matériel</div>

            <div v-if="notArchived">
                <qrCodePharma :info="currentMaterialInfo" @archive="handleArchiveDone" />
            </div>
            <div v-if="notDisposition">
                <qrCodeReserve :info="currentMaterialInfo" @disposition="handleDispositionDone" />
            </div>

            <div class="small-action" @click="closeCurrentMaterialPanel">Fermer ce matériel</div>
        </div>

        <div class="final-step">
            <div class="subsubtitle">Validation finale du retour d'intervention</div>
            <p>
                La validation appelle <b>reinitialiserRetourIntervention</b> puis <b>resetRICount</b>
                avec le mode {{ sessionModeLabel }}.
            </p>
            <div class="validationBtn" :class="{ disabled: !canValidateReset || isResetting }" @click="validateRetourIntervention">
                <span v-if="!isResetting">Valider le retour d'intervention ({{ sessionModeLabel }})</span>
                <span v-else>
                    <img src="@/assets/loading.gif" alt="Reset en cours" width="50px" height="auto">
                    Vérification et reset en cours...
                </span>
            </div>
            <p v-if="!canValidateReset" class="hint">
                Pour valider : tous les matériels doivent être en <b>validé</b> et aucun verrouillage ne doit rester actif.
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";
import ToggleButton from "primevue/togglebutton";
import { useSqlStore } from "@/stores/database.js";
import qrCodePharma from "../components/qrCodePharma.vue";
import qrCodeReserve from "../components/qrCodeReserve.vue";
import { db } from "@/firebase/config";
import {
    get,
    onValue,
    ref as firebaseRef,
    remove,
    runTransaction,
    set,
    update
} from "firebase/database";

const SESSION_PATH = "disposition/retourIntervention";

const auth0 = useAuth0();
const sqlStore = useSqlStore();

const introduction = ref(true);
const finished = ref(false);
const partialOrComplete = ref(true);
const isLoading = ref(false);
const isResetting = ref(false);
const loadingMessage = ref("");
const errorMessage = ref("");
const infoMessage = ref("");

const notArchived = ref(false);
const notDisposition = ref(false);

const firebaseSession = ref(null);
const currentMaterialId = ref("");
const savingMaterial = ref(false);

let unsubscribeSession = null;

const utilisateur = auth0?.user?.value || null;
const matricule = ref(
    utilisateur?.profile?.[0] || localStorage.getItem("cms_auth_matricule") || "inconnu"
);

const sessionRef = firebaseRef(db, SESSION_PATH);

const selectedMode = computed(() => (partialOrComplete.value ? "complete" : "partial"));
const sessionMode = computed(() => firebaseSession.value?.mode || selectedMode.value);
const sessionModeLabel = computed(() => (sessionMode.value === "complete" ? "complet" : "partiel"));

const materials = computed(() => {
    const rawMap = firebaseSession.value?.materials || {};
    return Object.values(rawMap)
        .map((item) => ({
            ...item,
            status: item.status || "available",
            lockedBy: item.lockedBy || null
        }))
        .sort((a, b) => {
            const zoneA = String(a.zone || "");
            const zoneB = String(b.zone || "");
            if (zoneA !== zoneB) {
                return zoneA.localeCompare(zoneB, "fr");
            }
            return String(a.nomMateriel || "").localeCompare(String(b.nomMateriel || ""), "fr");
        });
});

const currentMaterial = computed(() => {
    if (!currentMaterialId.value) {
        return null;
    }
    return materials.value.find((item) => item.idMateriel === currentMaterialId.value) || null;
});

const currentMaterialInfo = computed(() => {
    if (!currentMaterial.value) {
        return {
            idMateriel: "",
            objectif: 0,
            zone: "",
            nomMateriel: ""
        };
    }
    return {
        idMateriel: currentMaterial.value.idMateriel,
        objectif: currentMaterial.value.nbVSAV,
        zone: currentMaterial.value.zone,
        nomMateriel: currentMaterial.value.nomMateriel
    };
});

const doneCount = computed(() => materials.value.filter((item) => item.status === "done").length);
const availableCount = computed(() => materials.value.filter((item) => item.status === "available").length);
const lockedByMe = computed(() =>
    materials.value.filter((item) => item.status === "locked" && item.lockedBy === matricule.value)
);
const lockedByOthers = computed(() =>
    materials.value.filter((item) => item.status === "locked" && item.lockedBy !== matricule.value)
);
const lockedByMeCount = computed(() => lockedByMe.value.length);
const lockedByOthersCount = computed(() => lockedByOthers.value.length);
const totalCount = computed(() => materials.value.length);

const currentProgression = computed(() => {
    if (totalCount.value === 0) {
        return 1;
    }
    return doneCount.value / totalCount.value;
});

const canValidateReset = computed(() => {
    if (!firebaseSession.value) {
        return false;
    }
    if (savingMaterial.value || isResetting.value) {
        return false;
    }
    if (currentMaterialId.value) {
        return false;
    }
    if (lockedByMeCount.value > 0 || lockedByOthersCount.value > 0) {
        return false;
    }
    return doneCount.value === totalCount.value;
});

const clearMessages = () => {
    errorMessage.value = "";
    infoMessage.value = "";
};

const closeCurrentMaterialPanel = () => {
    currentMaterialId.value = "";
    notArchived.value = false;
    notDisposition.value = false;
};

const attachSessionListener = () => {
    if (unsubscribeSession) {
        unsubscribeSession();
    }
    unsubscribeSession = onValue(
        sessionRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                firebaseSession.value = null;
                if (!finished.value) {
                    introduction.value = true;
                    closeCurrentMaterialPanel();
                }
                return;
            }
            firebaseSession.value = snapshot.val();
        },
        (error) => {
            errorMessage.value = `Erreur Firebase : ${error.message}`;
        }
    );
};

const hydrateExistingSession = async () => {
    try {
        const snapshot = await get(sessionRef);
        if (snapshot.exists() && snapshot.val()?.status === "open") {
            firebaseSession.value = snapshot.val();
            introduction.value = false;
            finished.value = false;
            infoMessage.value = `Session ${snapshot.val().mode === "complete" ? "complète" : "partielle"} chargée depuis Firebase.`;
            attachSessionListener();
        }
    } catch (error) {
        errorMessage.value = `Impossible de lire la session Firebase : ${error.message}`;
    }
};

const buildMaterialsMap = (list) => {
    return list.reduce((acc, item) => {
        if (!item?.idMateriel) {
            return acc;
        }
        acc[item.idMateriel] = {
            idMateriel: item.idMateriel,
            nomMateriel: item.nomMateriel || item.idMateriel,
            nbVSAV: Number(item.nbVSAV) || 0,
            zone: item.zone || "Autre",
            status: "available",
            lockedBy: null,
            lockedAt: null,
            completedBy: null,
            completedAt: null,
            updatedAt: Date.now()
        };
        return acc;
    }, {});
};

const startOrJoinSession = async () => {
    clearMessages();
    isLoading.value = true;
    loadingMessage.value = "Initialisation de la session...";

    try {
        const snapshot = await get(sessionRef);
        const existing = snapshot.exists() ? snapshot.val() : null;

        if (existing?.status === "open") {
            firebaseSession.value = existing;
            introduction.value = false;
            finished.value = false;
            attachSessionListener();
            if (existing.mode !== selectedMode.value) {
                infoMessage.value = `Session déjà en cours en mode ${existing.mode === "complete" ? "complet" : "partiel"} (votre choix a été ignoré).`;
            } else {
                infoMessage.value = "Session en cours rejointe.";
            }
            return;
        }

        const typeRequest = selectedMode.value === "complete" ? "Complete" : "partial";
        loadingMessage.value = "Récupération de la liste à vérifier...";
        await sqlStore.getMaterielsToCheck(typeRequest);
        const list = Array.isArray(sqlStore.materielsToCheck) ? sqlStore.materielsToCheck : [];
        const materialsMap = buildMaterialsMap(list);

        loadingMessage.value = "Création de la session Firebase...";
        await set(sessionRef, {
            status: "open",
            mode: selectedMode.value,
            createdAt: Date.now(),
            createdBy: matricule.value,
            updatedAt: Date.now(),
            materials: materialsMap
        });

        introduction.value = false;
        finished.value = false;
        attachSessionListener();

        if (list.length === 0) {
            infoMessage.value = "Aucun matériel à vérifier. Vous pouvez valider le reset.";
        } else {
            infoMessage.value = `${list.length} matériel${list.length > 1 ? "s" : ""} chargé${list.length > 1 ? "s" : ""} dans Firebase.`;
        }
    } catch (error) {
        errorMessage.value = `Erreur lors du chargement de la session : ${error.message}`;
    } finally {
        loadingMessage.value = "";
        isLoading.value = false;
    }
};

const isLockedByMe = (material) => material.status === "locked" && material.lockedBy === matricule.value;
const isLockedByOther = (material) => material.status === "locked" && material.lockedBy !== matricule.value;

const statusLabel = (material) => {
    if (material.status === "done") {
        return "validé";
    }
    if (isLockedByMe(material)) {
        return "verrouillé (vous)";
    }
    if (isLockedByOther(material)) {
        return "verrouillé";
    }
    return "disponible";
};

const statusClass = (material) => {
    if (material.status === "done") {
        return "status-done";
    }
    if (isLockedByMe(material)) {
        return "status-locked-me";
    }
    if (isLockedByOther(material)) {
        return "status-locked-other";
    }
    return "status-available";
};

const zoneClass = (zone) => {
    const normalized = String(zone || "").toUpperCase();
    if (normalized.startsWith("B")) {
        return "zoneBoite";
    }
    if (normalized.startsWith("O")) {
        return "zoneOxy";
    }
    if (normalized.startsWith("R")) {
        return "zoneRea";
    }
    if (normalized.startsWith("K")) {
        return "zoneKits";
    }
    if (normalized.startsWith("D")) {
        return "zoneDiv";
    }
    return "Autre";
};

const handleMaterialClick = async (material) => {
    clearMessages();
    if (!material?.idMateriel) {
        return;
    }

    if (material.status === "done") {
        infoMessage.value = `${material.nomMateriel} est déjà validé.`;
        return;
    }

    if (isLockedByOther(material)) {
        infoMessage.value = `${material.nomMateriel} est verrouillé par ${material.lockedBy}.`;
        return;
    }

    if (isLockedByMe(material)) {
        startMaterialCheck(material);
        return;
    }

    const materialRef = firebaseRef(db, `${SESSION_PATH}/materials/${material.idMateriel}`);

    try {
        const tx = await runTransaction(materialRef, (current) => {
            if (!current) {
                return current;
            }
            const currentStatus = current.status || "available";
            if (currentStatus !== "available") {
                return current;
            }
            return {
                ...current,
                status: "locked",
                lockedBy: matricule.value,
                lockedAt: Date.now(),
                updatedAt: Date.now()
            };
        });

        if (!tx.snapshot.exists()) {
            return;
        }

        const after = tx.snapshot.val();

        if (after.status === "locked" && after.lockedBy === matricule.value) {
            infoMessage.value = `${after.nomMateriel} verrouillé. Ouverture du traitement...`;
            startMaterialCheck(after);
            return;
        }

        if (after.status === "locked" && after.lockedBy !== matricule.value) {
            infoMessage.value = `${after.nomMateriel} vient d'être verrouillé par ${after.lockedBy}.`;
            return;
        }

        if (after.status === "done") {
            infoMessage.value = `${after.nomMateriel} est déjà validé.`;
        }
    } catch (error) {
        errorMessage.value = `Erreur de verrouillage : ${error.message}`;
    }
};

const startMaterialCheck = (material) => {
    clearMessages();
    if (!isLockedByMe(material)) {
        infoMessage.value = "Vous devez verrouiller ce matériel avant de le vérifier.";
        return;
    }
    currentMaterialId.value = material.idMateriel;
    notArchived.value = true;
    notDisposition.value = false;
};

const handleArchiveDone = () => {
    notArchived.value = false;
    notDisposition.value = true;
};

const completeCurrentMaterial = async () => {
    if (!currentMaterial.value?.idMateriel) {
        return;
    }
    const material = currentMaterial.value;
    const materialRef = firebaseRef(db, `${SESSION_PATH}/materials/${material.idMateriel}`);
    savingMaterial.value = true;
    clearMessages();
    try {
        const tx = await runTransaction(materialRef, (current) => {
            if (!current) {
                return current;
            }
            if (current.status === "done") {
                return current;
            }
            if (current.status === "locked" && current.lockedBy === matricule.value) {
                return {
                    ...current,
                    status: "done",
                    lockedBy: null,
                    lockedAt: null,
                    completedBy: matricule.value,
                    completedAt: Date.now(),
                    updatedAt: Date.now()
                };
            }
            return current;
        });

        if (!tx.snapshot.exists()) {
            throw new Error("Matériel introuvable.");
        }

        const after = tx.snapshot.val();
        if (after.status !== "done") {
            throw new Error("Impossible de finaliser ce matériel (verrouillage perdu ou déjà traité).");
        }
        infoMessage.value = `${after.nomMateriel} marqué comme validé.`;
        closeCurrentMaterialPanel();
    } catch (error) {
        errorMessage.value = `Erreur de validation matériel : ${error.message}`;
    } finally {
        savingMaterial.value = false;
    }
};

const handleDispositionDone = async () => {
    notDisposition.value = false;
    await completeCurrentMaterial();
};

const releaseMyLocks = async () => {
    clearMessages();
    if (!firebaseSession.value || lockedByMe.value.length === 0) {
        return;
    }
    const updatesPayload = {
        updatedAt: Date.now()
    };
    for (const material of lockedByMe.value) {
        updatesPayload[`materials/${material.idMateriel}/status`] = "available";
        updatesPayload[`materials/${material.idMateriel}/lockedBy`] = null;
        updatesPayload[`materials/${material.idMateriel}/lockedAt`] = null;
        updatesPayload[`materials/${material.idMateriel}/updatedAt`] = Date.now();
    }

    try {
        await update(sessionRef, updatesPayload);
        infoMessage.value = "Tous vos verrouillages ont été libérés.";
        closeCurrentMaterialPanel();
    } catch (error) {
        errorMessage.value = `Erreur lors de la libération des verrouillages : ${error.message}`;
    }
};

const validateRetourIntervention = async () => {
    clearMessages();
    if (!canValidateReset.value) {
        errorMessage.value = "Validation impossible : il reste des matériels non validés ou des verrouillages actifs.";
        return;
    }

    const confirmed = window.confirm(
        `Confirmer le retour d'intervention ${sessionModeLabel.value} et lancer le reset ?`
    );
    if (!confirmed) {
        return;
    }

    isResetting.value = true;
    try {
        infoMessage.value = "Vérification du reset en cours...";
        await sqlStore.reinitialiserRetourIntervention();
        const resetType = sessionMode.value === "complete" ? "complet" : "partiel";
        await sqlStore.resetRICount(resetType, matricule.value);
        await remove(sessionRef);

        if (unsubscribeSession) {
            unsubscribeSession();
            unsubscribeSession = null;
        }

        firebaseSession.value = null;
        closeCurrentMaterialPanel();
        finished.value = true;
        introduction.value = false;
        infoMessage.value = `Reset ${resetType} effectué avec succès.`;
    } catch (error) {
        errorMessage.value = `Erreur pendant le reset : ${error.message}`;
    } finally {
        isResetting.value = false;
    }
};

const resetViewState = () => {
    clearMessages();
    finished.value = false;
    introduction.value = true;
    partialOrComplete.value = true;
    firebaseSession.value = null;
    closeCurrentMaterialPanel();
};

const handleBeforeUnload = () => {
    releaseMyLocks();
};

watch(currentMaterial, (value) => {
    if (!value && currentMaterialId.value) {
        closeCurrentMaterialPanel();
        return;
    }
    if (!value) {
        return;
    }
    if (value.status !== "locked" || value.lockedBy !== matricule.value) {
        closeCurrentMaterialPanel();
    }
});

onMounted(async () => {
    await hydrateExistingSession();
    window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
    if (unsubscribeSession) {
        unsubscribeSession();
        unsubscribeSession = null;
    }
    window.removeEventListener("beforeunload", handleBeforeUnload);
    releaseMyLocks();
});
</script>

<style scoped>
.intro-wrapper,
.session-wrapper,
.finished-wrapper {
    width: 100%;
}

.consigne {
    color: #666666;
    text-align: justify;
    margin-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e5e5;
}

.consigne > .number {
    font-weight: bold;
    text-align: center;
    padding: 5px 10px;
    margin: 5px;
    border-radius: 30px;
    color: white;
    background-color: #0078f3;
    font-size: 18px;
}

.TextHighlight {
    color: #0078f3;
    font-weight: bold;
}

.question {
    margin-top: 2rem;
    text-align: center;
}

.status-message {
    margin-top: 1rem;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.9rem;
}

.status-message.error {
    background-color: #fff4f4;
    color: #ce0500;
}

.status-message.info {
    background-color: #f4f6ff;
    color: #0078f3;
}

.mode-chip {
    display: inline-block;
    margin-bottom: 1rem;
    background-color: #f4f6ff;
    color: #0078f3;
    border-radius: 999px;
    padding: 0.4rem 0.9rem;
    font-size: 0.9rem;
}

.progressBar {
    width: 100%;
    height: 1rem;
    background-color: #e8edff;
    border-radius: 30px;
    margin: auto;
    margin-bottom: 0.4rem;
    overflow: hidden;
}

.progression {
    height: 100%;
    background-color: #0078f3;
    border-radius: 30px;
    transition: width 0.2s ease;
}

.progress-label {
    color: #666666;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.stat-card {
    border-radius: 10px;
    background-color: #f8f7f7;
    padding: 0.8rem;
    border: 1px solid #ececec;
}

.stat-title {
    color: #666666;
    font-size: 0.8rem;
}

.stat-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #333333;
}

.empty-message {
    color: #666666;
    margin: 1rem 0;
    font-style: italic;
}

.hint-click {
    color: #666666;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.materials-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
}

.material-card {
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 0.8rem;
    background-color: white;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.material-card:hover {
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px;
}

.material-card.status-available {
    border-left: 5px solid #0078f3;
}

.material-card.status-locked-me {
    border-left: 5px solid #d64d00;
    background-color: #fff4f3;
}

.material-card.status-locked-other {
    border-left: 5px solid #666666;
    background-color: #f6f6f6;
}

.material-card.status-done {
    border-left: 5px solid #1f8d49;
    background-color: #dffee6;
}

.material-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.status-badge {
    border-radius: 999px;
    padding: 0.2rem 0.6rem;
    background-color: #eeeeee;
    color: #666666;
    font-size: 0.75rem;
    font-weight: 600;
}

.material-title {
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.material-meta {
    color: #666666;
    font-size: 0.85rem;
    margin-bottom: 0.6rem;
}

.material-actions-inline {
    display: flex;
    justify-content: flex-end;
    min-height: 1.2rem;
}

.locked-by {
    color: #666666;
    font-size: 0.8rem;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.chip {
    border: none;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    cursor: pointer;
    background-color: #fff4f3;
    color: #d64d00;
    font-size: 0.8rem;
}

.small-action {
    margin-top: 0.8rem;
    text-align: center;
    color: #0078f3;
    cursor: pointer;
    font-size: 0.85rem;
}

.small-action:hover {
    text-decoration: underline;
}

.release-action {
    margin-bottom: 1rem;
    text-align: right;
}

.check-panel {
    border-top: 1px solid #e5e5e5;
    padding-top: 1rem;
    margin-top: 1rem;
}

.panel-title {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex-wrap: wrap;
}

.final-step {
    margin-top: 1.5rem;
    border-top: 1px solid #e5e5e5;
    padding-top: 1rem;
}

.final-step > p {
    color: #666666;
    font-size: 0.9rem;
    margin: 0.6rem 0;
}

.hint {
    font-style: italic;
}

.validationBtn {
    margin-top: 1rem;
    padding: 0.8rem;
    border-radius: 30px;
    background-color: #0078f3;
    color: white;
    text-align: center;
    cursor: pointer;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.validationBtn.disabled {
    background-color: #e0e0e0;
    color: #999999;
    cursor: not-allowed;
}

.Autre {
    background-color: #eeeeee;
    color: #666666;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

.zoneBoite {
    background-color: #dffee6;
    color: #1f8d49;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

.zoneOxy {
    background-color: #f4f6ff;
    color: #0078f3;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

.zoneRea {
    background-color: #fff4f4;
    color: #f60700;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

.zoneKits {
    background-color: #fff4f3;
    color: #d64d00;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

.zoneDiv {
    background-color: #fef3fd;
    color: #a558a0;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
}

#currentMateriel {
    font-size: 1.1rem;
}

@media (min-width: 900px) {
    .materials-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .stats-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}
</style>