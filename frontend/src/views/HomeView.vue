<template>
  <div class="home-container">
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('home.subtitle') }}</p>
    <div class="actions">
      <router-link to="/login" class="btn">Login</router-link>
      <router-link to="/register" class="btn btn-outline">Register</router-link>
    </div>
  </div>
</template>

<style scoped>
.home-container { text-align: center; padding: 50px; }
.actions { margin-top: 20px; }
.btn { margin: 0 10px; padding: 10px 20px; text-decoration: none; background: #4CAF50; color: white; border-radius: 5px; }
.btn-outline { background: transparent; border: 1px solid #4CAF50; color: #4CAF50; }
</style>