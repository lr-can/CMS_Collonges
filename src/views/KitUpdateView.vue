<template>
  <div class="kit-update-container">
    <div class="subtitle">Modifier un kit</div>
    <div class="subsubtitle">
      Scannez le QR code ou le code-barres du kit, sélectionnez-le dans la liste ou entrez son numéro pour accéder à la fiche de détail.
    </div>
    <div class="kit-form">
      <div class="form-group">
        <label for="kitSelect">Sélectionner un kit <span class="mandatory">*</span></label>
        <Dropdown
          id="kitSelect"
          v-model="selectedKit"
          :options="completKits"
          optionLabel="idKit"
          :placeholder="loadingKits ? 'Chargement...' : 'Choisir un kit'"
          class="form-item form-item-large"
          :disabled="loadingKits"
          @change="onKitSelect"
        >
          <template #option="slotProps">
            <div class="kit-option">
              <span class="kit-id">{{ slotProps.option.idKit }}</span>
              <span class="kit-type">{{ slotProps.option.nomKit }}</span>
            </div>
          </template>
          <template #selected="slotProps">
            <span v-if="!slotProps.value">{{ slotProps.placeholder }}</span>
            <div v-else class="kit-option">
              <span class="kit-id">{{ slotProps.value.idKit }}</span>
              <span class="kit-type">{{ slotProps.value.nomKit }}</span>
            </div>
          </template>
        </Dropdown>
      </div>
      <div class="form-group">
        <label for="idKit">Ou saisir le numéro manuellement</label>
        <InputText
          id="idKit"
          v-model="idKit"
          class="form-item form-item-large"
          placeholder="Ex. KIT-ACC-2025-001"
        />
      </div>
      <div class="scan-section" v-if="showScanner">
        <div v-if="cameras.length >= 1" class="camera-select-row">
          <label for="cameraSelect">Caméra :</label>
          <Dropdown
            id="cameraSelect"
            v-model="selectedCamera"
            :options="cameraOptions"
            optionLabel="label"
            optionValue="deviceId"
            placeholder="Choisir la caméra"
            class="camera-dropdown"
          />
        </div>
        <QrcodeStream
          v-if="showScanner"
          :key="selectedCamera || 'default'"
          :paused="paused"
          :formats="scanFormats"
          @detect="onDetect"
          @error="onScanError"
          @camera-on="onCameraOn"
          :constraints="cameraConstraints"
          class="qr-reader"
        />
        <p v-if="cameraError" class="camera-hint camera-error">{{ cameraError }}</p>
      </div>
      <div class="actions-row">
        <button type="button" class="secondary-btn" @click="toggleScanner">
          {{ showScanner ? 'Masquer le scan' : 'Scanner le QR code' }}
        </button>
        <div class="validationBtn" :class="{ disabled: !getCurrentIdKit() }" @click="openKitDetail">
          Ouvrir la fiche kit
        </div>
      </div>
    </div>
    <div v-if="errorMessage" class="messageErreur">
      <span id="redAlert">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { QrcodeStream } from 'vue-qrcode-reader';
import { useSqlStore } from '@/stores/database.js';

const sqlStore = useSqlStore();
const API_BASE = 'https://api.cms-collonges.fr';
const STORAGE_KEY_CAMERA = 'kit-update-last-camera';

const completKits = ref([]);
const selectedKit = ref(null);
const idKit = ref('');
const loadingKits = ref(false);
const showScanner = ref(false);
const paused = ref(false);
const cameras = ref([]);
const selectedCamera = ref(null);
const errorMessage = ref('');
const cameraError = ref('');

const scanFormats = ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8'];

const cameraOptions = computed(() =>
  cameras.value.map((d) => ({
    deviceId: d.deviceId,
    label: d.label || `Caméra ${cameras.value.indexOf(d) + 1}`
  }))
);

const cameraConstraints = computed(() => ({
  audio: false,
  facingMode: 'environment',
  ...(selectedCamera.value ? { deviceId: { exact: selectedCamera.value } } : {})
}));

function extractIdKit(raw) {
  const s = String(raw || '').trim();
  // Lien API ou URL contenant idKit= / id= : on ne garde que l’ID
  const urlMatch =
    s.match(/kitDetail(?:\.html)?[?&]idKit=([^&\s#]+)/i) ||
    s.match(/[?&]idKit=([^&\s#]+)/i) ||
    s.match(/[?&]id=([^&\s#]+)/i);
  if (urlMatch) return decodeURIComponent(urlMatch[1].trim());
  // Sinon, si c’est déjà un identifiant type KIT-XXX
  if (/^KIT-[A-Z0-9\-\/]+$/i.test(s)) return s;
  return s;
}

function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 400;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
}

function onDetect(payload) {
  const [first] = Array.isArray(payload) ? payload : [payload];
  if (!first?.rawValue) return;
  const extracted = extractIdKit(first.rawValue);
  idKit.value = extracted;
  const found = completKits.value.find((k) => k.idKit === extracted);
  if (found) {
    errorMessage.value = '';
    selectedKit.value = found;
    paused.value = true;
    if (navigator.vibrate) navigator.vibrate(200);
    setTimeout(() => { paused.value = false; }, 1500);
  } else {
    errorMessage.value = 'Kit non trouvé.';
    playErrorSound();
    paused.value = true;
    setTimeout(() => { paused.value = false; }, 2000);
  }
}

function getCurrentIdKit() {
  return (selectedKit.value?.idKit || idKit.value || '').trim();
}

function getKitDetailBackendUrl(id) {
  return `${API_BASE}/kitDetail?idKit=${encodeURIComponent(id)}`;
}

async function loadCompletKits() {
  loadingKits.value = true;
  try {
    completKits.value = await sqlStore.getKitsCompletKit();
  } catch (e) {
    console.error(e);
    completKits.value = [];
  } finally {
    loadingKits.value = false;
  }
}

function onKitSelect() {
  if (selectedKit.value?.idKit) idKit.value = selectedKit.value.idKit;
}

function toggleScanner() {
  showScanner.value = !showScanner.value;
  if (showScanner.value) {
    cameraError.value = '';
    if (cameras.value.length === 0) initCamera();
  }
}

async function initCamera() {
  try {
    cameraError.value = '';
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === 'videoinput');
    cameras.value = videoInputs;
    if (videoInputs.length > 0) {
      const lastUsedId = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CAMERA) : null;
      const lastUsed = lastUsedId ? videoInputs.find((d) => d.deviceId === lastUsedId) : null;
      selectedCamera.value = lastUsed ? lastUsed.deviceId : videoInputs[videoInputs.length - 1].deviceId;
    } else {
      cameraError.value = 'Aucune caméra détectée. Branchez une caméra ou autorisez l\'accès.';
    }
  } catch (e) {
    console.error(e);
    cameraError.value = 'Impossible d\'accéder à la caméra.';
  }
}

watch(selectedCamera, (deviceId) => {
  if (deviceId && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CAMERA, deviceId);
  }
});

function onScanError(err) {
  console.error('Scan error:', err);
  if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
    cameraError.value = 'Accès à la caméra refusé. Autorisez l\'accès dans les paramètres du navigateur.';
  } else if (err?.name === 'NotFoundError') {
    cameraError.value = 'Aucune caméra trouvée.';
  } else if (err) {
    cameraError.value = 'Impossible d\'ouvrir la caméra. Vérifiez les autorisations.';
  }
}

function onCameraOn() {
  cameraError.value = '';
  if (cameras.value.length === 0 || cameras.value.some((d) => !d.label)) initCamera();
}

function openKitDetail() {
  const kit = getCurrentIdKit();
  if (!kit) {
    errorMessage.value = 'Veuillez sélectionner un kit, scanner un QR code ou saisir son numéro.';
    return;
  }
  errorMessage.value = '';
  window.open(getKitDetailBackendUrl(kit), '_blank', 'noopener,noreferrer');
}

onMounted(() => {
  loadCompletKits();
  if (showScanner.value) initCamera();
});
</script>

<style scoped>
.kit-update-container {
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

.kit-option {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.kit-option .kit-id {
  font-weight: 600;
  color: #333;
}

.kit-option .kit-type {
  font-size: 0.85rem;
  color: #666;
}

.camera-select-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.camera-select-row label {
  font-weight: 600;
  font-size: 0.9rem;
}

.camera-dropdown {
  min-width: 200px;
}

.scan-section {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border-radius: 20px;
  max-height: 280px;
  background-color: #fff;
  padding: 0.75rem;
}

.qr-reader {
  scale: 1.2;
}

.camera-hint {
  padding: 2rem;
  color: #666;
}

.camera-hint.camera-error {
  color: #c00;
  font-weight: 600;
}

.actions-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.secondary-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background-color: #f4f6ff;
  color: #0063cb;
  border: 1px solid #0063cb;
  font-weight: 600;
  cursor: pointer;
}

.secondary-btn:hover {
  background-color: #d6deff;
}

.validationBtn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mandatory {
  color: #f60700;
}

@media (min-width: 1024px) {
  .kit-form {
    max-width: 600px;
  }

  .actions-row {
    flex-direction: row;
    align-items: center;
  }
}
</style>
