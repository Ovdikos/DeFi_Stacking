<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const authStore = useAuthStore();
const loading = ref(false);

const form = ref({
  email: '',
  currentPassword: '',
  newPassword: ''
});

onMounted(() => {
  if (authStore.user) {
    form.value.email = authStore.user.email;
  }
});

const handleUpdate = async () => {
  if (!form.value.currentPassword) {
    alert("Please enter your current password to confirm changes.");
    return;
  }

  loading.value = true;
  try {
    const res = await api.put('/profile', {
      email: form.value.email,
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    });

    alert(res.data.message);

    form.value.currentPassword = '';
    form.value.newPassword = '';

    if (authStore.user.email !== form.value.email) {
      authStore.user.email = form.value.email;
    }

  } catch (error) {
    alert(error.response?.data?.message || "Update failed");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="profile-container">
    <h1>My Profile</h1>

    <div class="profile-card">
      <div class="user-avatar">
        <span>{{ form.email.charAt(0).toUpperCase() }}</span>
      </div>

      <div class="user-info">
        <p class="role">Role: <strong>{{ authStore.user?.role }}</strong></p>
        <p class="id">User ID: #{{ authStore.user?.id }}</p>
      </div>

      <form @submit.prevent="handleUpdate" class="profile-form">
        <div class="form-group">
          <label>Email Address</label>
          <input v-model="form.email" type="email" required />
        </div>

        <div class="divider">
          <span>Change Password (Optional)</span>
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input v-model="form.newPassword" type="password" placeholder="Leave blank to keep current" />
        </div>

        <div class="form-group required">
          <label>Current Password (Required)</label>
          <input v-model="form.currentPassword" type="password" placeholder="Confirm with current password" required />
        </div>

        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

h1 { text-align: center; margin-bottom: 30px; color: #333; }

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}

.user-info {
  text-align: center;
  margin-bottom: 30px;
  color: #666;
}

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #555; }
.form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; transition: border 0.2s; }
.form-group input:focus { border-color: #2196F3; outline: none; }

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 30px 0;
  color: #999;
  font-size: 0.85rem;
}
.divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #eee; }
.divider span { padding: 0 10px; }

.required label::after { content: " *"; color: red; }

.btn-save {
  width: 100%;
  padding: 14px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}
.btn-save:disabled { background: #a5d6a7; cursor: not-allowed; }
</style>