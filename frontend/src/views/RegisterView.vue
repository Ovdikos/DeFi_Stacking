<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const success = await authStore.register(email.value, password.value);
    if (success) {
      alert("Registration successful! Please login.");
      router.push('/login');
    }
  } catch (error) {
    alert("Registration failed: " + error);
  }
};
</script>

<template>
  <div class="form-container">
    <h2>{{ $t('nav.register') }}</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
      <button type="submit">Create Account</button>
    </form>
    <p class="switch-link">
      Already have an account? <router-link to="/login">Login here</router-link>
    </p>
  </div>
</template>

<style scoped>
.form-container { max-width: 350px; margin: 50px auto; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
h2 { text-align: center; color: #333; margin-bottom: 20px; }
input { display: block; width: 100%; margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
button { width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 1rem; }
button:hover { background: #45a049; }
.switch-link { text-align: center; margin-top: 15px; font-size: 0.9rem; }
.switch-link a { color: #2196F3; text-decoration: none; }
</style>