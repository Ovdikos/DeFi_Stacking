<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  } else {
    alert('Invalid credentials');
  }
};
</script>

<template>
  <div class="form-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Enter DeFi</button>
    </form>
  </div>
</template>

<style scoped>
.form-container { max-width: 300px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
button { width: 100%; padding: 10px; background: #2196F3; color: white; border: none; cursor: pointer; }
</style>