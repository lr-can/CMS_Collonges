<template>
  <div class="login-view-container">
    <div class="login-view-content">
      <LoginForm />
    </div>
  </div>
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue';
</script>

<style scoped>
.login-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.login-view-content {
  width: 100%;
  max-width: 450px;
}
</style>

