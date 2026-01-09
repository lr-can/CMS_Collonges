<template>
  <div class="subtitle">{{ title }}</div>
  <div class="coming-soon-message">
    <p>Cette fonctionnalité sera disponible prochainement.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta?.title || 'À venir')
</script>

<style scoped>
.coming-soon-message {
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  color: #666;
}
</style>

