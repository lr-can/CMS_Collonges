<template>
    <div class="reader">
        <QrcodeStream 
        :paused="paused"
        @detect="onDetect"
        @error="onError"
        @camera-on="resetValidationState"
        id="readerComponent"></QrcodeStream>
        <div v-if="validationSuccess" class="validation-success">
            <p> ID-{{ result }} ajouté</p>
        </div>
        <div v-if="validationError" class="validation-error">
            <p>Erreur</p>
        </div>
        <div v-if="validationPending" class="validation-pending">
            <p>Ajout de ID-{{ result }}...</p>
        </div>
    </div>
</template>

<script setup>
import { QrcodeStream } from 'vue-qrcode-reader';
import { ref, computed } from 'vue';

const isValid = ref(false);
const paused = ref(false);
const result = ref('null');

const validationPending = computed(() => {
	return isValid.value === undefined && paused.value
})

const validationSuccess = computed(() => {
	return isValid.value === true
})

const validationError = computed(() => {
    return isValid.value === false
})

const onError = console.error

const resetValidationState = function() {
	isValid.value = undefined
}

const onDetect = async function([firstDetectedCode]) {
	result.value = firstDetectedCode.rawValue
	paused.value = true

	await timeout(3000)
	isValid.value = result.value.startsWith('http')

	await timeout(2000)
	paused.value = false
}

const timeout = function(ms) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, ms)
	})
}
</script>

<style scoped>  
.reader{
    position: relative;
    width: 100%;
    height: 100%;
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
    max-width: 50%;
}

.validation-pending {
    background-color: #f4f6ff;
    color: #0078f3;
    border-radius: 5px;
    text-align: center;
    max-width: 50%;
}
</style>