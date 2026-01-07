<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <header>
    <nav>
      <div class="logo">DeFi Staking</div>
      <div class="links">
        <router-link to="/">{{ $t('nav.home') }}</router-link>
        <router-link to="/dashboard">{{ $t('nav.dashboard') }}</router-link>

        <template v-if="auth.isAuthenticated">
          <button @click="logout" class="logout-btn">{{ $t('nav.logout') }}</button>
        </template>

        <template v-else>
          <router-link to="/login">{{ $t('nav.login') }}</router-link>
          <router-link to="/register">{{ $t('nav.register') }}</router-link>
        </template>

        <select v-model="$i18n.locale" class="lang-select">
          <option value="en">EN</option>
          <option value="ua">UA</option>
        </select>
      </div>
    </nav>
  </header>

  <RouterView />
</template>

<style>
body { margin: 0; font-family: sans-serif; background-color: #f4f6f8; }

header { background: #333; color: white; padding: 1rem 2rem; }
nav { display: flex; justify-content: space-between; align-items: center; }
.logo { font-weight: bold; font-size: 1.2rem; color: #4CAF50; }
.links a { color: white; text-decoration: none; margin-left: 15px; }
.links a.router-link-active { color: #4CAF50; }
.logout-btn { margin-left: 15px; background: #f44336; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
.lang-select { margin-left: 15px; padding: 5px; }
</style>