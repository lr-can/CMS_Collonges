<template>
  <div class="coming-soon-container">
    <div class="coming-soon-content">
      <div class="coming-soon-icon">🚧</div>
      <h1 class="coming-soon-title">Inventaires</h1>
      <p class="coming-soon-subtitle">Cette fonctionnalité arrive prochainement</p>
      <div class="coming-soon-message">
        <p>En attendant, rendez-vous sur :</p>
        <a 
          href="https://ct-collonges.notion.site/8fdfaf3070c1442eb2701e3a29b3b145?v=f55166cc5fed49449b2baf58e312d5db&source=copy_link" 
          target="_blank" 
          rel="noopener noreferrer"
          class="external-link"
        >
          https://ct-collonges.notion.site/...
        </a>
      </div>
      <button @click="$router.push('/')" class="back-button">
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.coming-soon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.coming-soon-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.coming-soon-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.coming-soon-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 2rem 0;
}

.coming-soon-message {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.coming-soon-message p {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-weight: 500;
}

.external-link {
  color: #0078f3;
  text-decoration: underline;
  word-break: break-all;
  display: inline-block;
  transition: color 0.2s ease;
}

.external-link:hover {
  color: #0056b3;
}

.back-button {
  margin-top: 2rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #0078f3 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 120, 243, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 120, 243, 0.4);
}

@media (max-width: 640px) {
  .coming-soon-content {
    padding: 2rem 1.5rem;
  }

  .coming-soon-title {
    font-size: 2rem;
  }

  .coming-soon-subtitle {
    font-size: 1rem;
  }
}
</style>

