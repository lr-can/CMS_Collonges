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
        <div v-if="cameras.length > 1" class="camera-select-row">
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
          v-if="selectedCamera"
          :paused="paused"
          :formats="scanFormats"
          @detect="onDetect"
          @error="onScanError"
          :constraints="cameraConstraints"
          class="qr-reader"
        />
        <p v-else class="camera-hint">Autorisez l'accès à la caméra pour scanner le QR code ou le code-barres.</p>
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
import { ref, computed, onMounted } from 'vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { QrcodeStream } from 'vue-qrcode-reader';
import { useSqlStore } from '@/stores/database.js';

const sqlStore = useSqlStore();
const API_BASE = 'https://api.cms-collonges.fr';

const completKits = ref([]);
const selectedKit = ref(null);
const idKit = ref('');
const loadingKits = ref(false);
const showScanner = ref(false);
const paused = ref(false);
const cameras = ref([]);
const selectedCamera = ref(null);
const errorMessage = ref('');

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
  const urlMatch = s.match(/kitDetail(?:\.html)?[?&]idKit=([^&\s]+)/i) || s.match(/[?&]idKit=([^&\s]+)/i) || s.match(/[?&]id=([^&\s]+)/i);
  if (urlMatch) return decodeURIComponent(urlMatch[1]);
  if (/^KIT-[A-Z0-9\-\/]+$/i.test(s)) return s;
  return s;
}

function onDetect(payload) {
  const [first] = Array.isArray(payload) ? payload : [payload];
  if (!first?.rawValue) return;
  const extracted = extractIdKit(first.rawValue);
  idKit.value = extracted;
  const found = completKits.value.find((k) => k.idKit === extracted);
  if (found) selectedKit.value = found;
  paused.value = true;
  if (navigator.vibrate) navigator.vibrate(200);
  setTimeout(() => { paused.value = false; }, 1500);
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
  if (showScanner.value && cameras.value.length === 0) initCamera();
}

async function initCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === 'videoinput');
    cameras.value = videoInputs;
    if (videoInputs.length > 0) {
      selectedCamera.value = videoInputs.length > 1 ? videoInputs[videoInputs.length - 1].deviceId : videoInputs[0].deviceId;
    }
  } catch (e) {
    console.error(e);
    errorMessage.value = 'Impossible d\'accéder à la caméra.';
  }
}

function onScanError(err) {
  console.error('Scan error:', err);
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
