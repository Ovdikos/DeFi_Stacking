<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../services/api';

const authStore = useAuthStore();
const router = useRouter();

const pools = ref([]);
const myStakes = ref([]);
const loading = ref(true);

const currentPage = ref(1);
const itemsPerPage = 3;

const paginatedStakes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return myStakes.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(myStakes.value.length / itemsPerPage));
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

const showStakeModal = ref(false);
const selectedPool = ref(null);
const stakeAmount = ref(100);
const newPool = ref({ name: '', apy: '', lockPeriod: '', risk: 'Low', desc: '' });

const fetchData = async () => {
  try {
    loading.value = true;

    const poolsRes = await api.get('/pools');
    pools.value = poolsRes.data.pools;

    if (authStore.isAuthenticated) {
      const stakesRes = await api.get('/my-stakes');
      myStakes.value = stakesRes.data.stakes;
    } else {
      myStakes.value = [];
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

const openStakeModal = (pool) => {
  if (!authStore.isAuthenticated) {
    if (confirm("You must be logged in to stake. Go to login page?")) {
      router.push('/login');
    }
    return;
  }

  selectedPool.value = pool;
  showStakeModal.value = true;
};

const submitStake = async () => {
  if (stakeAmount.value <= 0) return alert("Amount must be positive");
  try {
    await api.post('/stake', { pool_id: selectedPool.value.id, amount: stakeAmount.value });
    alert(`Successfully staked!`);
    showStakeModal.value = false;
    await fetchData();
  } catch (error) {
    alert(error.response?.data?.message || "Staking failed");
  }
};

const handleClaim = async (stakeId) => {
  if (!confirm("Are you sure you want to withdraw your funds and rewards?")) return;

  try {
    await api.post('/claim', { stakeId });
    alert("Funds claimed to your wallet!");
    await fetchData();
  } catch (error) {
    alert("Error claiming: " + (error.response?.data?.message || "Unknown error"));
  }
};

const createPool = async () => {
  try {
    await api.post('/pools', newPool.value);
    alert('Pool created!');
    newPool.value = { name: '', apy: '', lockPeriod: '', risk: 'Low', desc: '' };
    await fetchData();
  } catch (error) {
    alert("Error: " + error.response?.data?.message);
  }
};

const selectedRisk = ref('All');

const filteredPools = computed(() => {
  if (selectedRisk.value === 'All') {
    return pools.value;
  }
  return pools.value.filter(pool => pool.risk_level === selectedRisk.value);
});

onMounted(() => {
  fetchData();
});


</script>

<template>
  <div class="dashboard">
    <div class="header-flex">
      <h1>{{ $t('nav.dashboard') }}</h1>

      <span v-if="authStore.isAdmin" class="role-badge admin">Admin Mode</span>
      <span v-else-if="authStore.isAuthenticated" class="role-badge user">Investor Mode</span>
      <span v-else class="role-badge guest">Guest View</span>
    </div>

    <div v-if="authStore.isAdmin" class="section admin-panel">
      <h2>⚡ Admin: Create New Liquidity Pool</h2>
      <form @submit.prevent="createPool" class="admin-form">
        <input v-model="newPool.name" placeholder="Pool Name" required />
        <div class="row">
          <input v-model="newPool.apy" type="number" placeholder="APY %" step="0.1" required />
          <input v-model="newPool.lockPeriod" type="number" placeholder="Lock Days" required />
          <select v-model="newPool.risk"><option>Low</option><option>Medium</option><option>High</option></select>
        </div>
        <input v-model="newPool.desc" placeholder="Description" required />
        <button type="submit" class="btn-admin">Create Pool</button>
      </form>
    </div>

    <div v-if="loading" class="loading">Loading market data...</div>

    <div v-else class="grid-container">

      <div v-if="authStore.isAuthenticated" class="section my-stakes">
        <h2>My Active Stakes</h2>
        <div v-if="myStakes.length === 0" class="empty-state">No active stakes.</div>
        <div v-else>
          <div v-for="stake in paginatedStakes" :key="stake.id" class="stake-card">
            <div class="stake-header">
              <span class="pool-name">{{ stake.pool_name }}</span>
              <span class="status-badge" :class="stake.status">{{ stake.status }}</span>
            </div>
            <div class="stake-details">
              <div class="detail-row">
                <span>Staked Amount:</span>
                <strong>${{ stake.amount }}</strong>
              </div>
              <div class="detail-row">
                <span>Est. Reward:</span>
                <strong class="profit">+${{ stake.profit }}</strong>
              </div>
              <div class="detail-row">
                <span>APY:</span>
                <span class="green">{{ stake.apy_percentage }}%</span>
              </div>
              <small class="date">Unlock: {{ new Date(stake.unlock_date).toLocaleDateString() }}</small>
            </div>

            <div v-if="stake.status === 'completed'" class="stake-actions">
              <button @click="handleClaim(stake.id)" class="btn-claim">
                Claim ${{ (parseFloat(stake.amount) + parseFloat(stake.profit)).toFixed(2) }}
              </button>
            </div>

            <div v-if="stake.status === 'claimed'" class="stake-actions">
              <span class="claimed-text">Paid out</span>
            </div>
          </div>
          <div class="pagination" v-if="totalPages > 1">
            <button @click="prevPage" :disabled="currentPage === 1">«</button>
            <span>Page {{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">»</button>
          </div>
        </div>
      </div>

      <div v-else class="section guest-promo">
        <h2>Start Earning Today</h2>
        <p>Create an account to track your portfolio and stake assets.</p>
        <router-link to="/register" class="btn-promo">Create Account</router-link>
      </div>

      <div class="section pools-list">
        <div class="pools-header">
          <h2>Available Liquidity Pools</h2>

          <div class="filter-box">
            <label>Risk Level:</label>
            <select v-model="selectedRisk">
              <option value="All">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div v-for="pool in filteredPools" :key="pool.id" class="pool-card">
          <div class="pool-info">
            <h3>{{ pool.name }}</h3>
            <p class="desc">{{ pool.description }}</p>
            <div class="tags">
              <span class="tag" :class="pool.risk_level.toLowerCase()">{{ pool.risk_level }}</span>
              <span class="tag">Lock: {{ pool.min_lock_period }}d</span>
            </div>
          </div>
          <div class="pool-action">
            <div class="apy">{{ pool.apy_percentage }}%</div>
            <button @click="openStakeModal(pool)" class="btn-stake">Stake</button>
          </div>
        </div>

        <div v-if="filteredPools.length === 0" class="empty-state">
          No pools found for this risk level.
        </div>
      </div>
    </div>

    <div v-if="showStakeModal" class="modal-overlay">
      <div class="modal">
        <h3>Stake in {{ selectedPool?.name }}</h3>
        <input v-model="stakeAmount" type="number" min="1" />
        <div class="modal-actions">
          <button @click="submitStake" class="btn-confirm">Confirm</button>
          <button @click="showStakeModal = false" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.role-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.85rem;
  color: white;
}

.role-badge.admin {
  background: #ff9800;
}

.role-badge.user {
  background: #2196F3;
}

.role-badge.guest {
  background: #9e9e9e;
}


.guest-promo {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.btn-promo {
  display: inline-block;
  background: #2196F3;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  margin-top: 15px;
}


.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.pool-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.pools-header h2 {
  margin-bottom: 0;
  font-size: 1.3rem;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
}

.filter-box select {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  cursor: pointer;
  outline: none;
}

.filter-box select:focus {
  border-color: #2196F3;
}

.stake-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  display: block;
  transition: transform 0.2s;
}

.stake-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.stake-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.pool-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-badge.completed {
  background: #f5f5f5;
  color: #757575;
  border: 1px solid #e0e0e0;
}

.status-badge.claimed {
  background: #e0e0e0;
  color: #9e9e9e;
  border: 1px solid #bdbdbd;
  text-decoration: line-through;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

.profit {
  color: #4CAF50;
}

.date {
  display: block;
  margin-top: 10px;
  color: #888;
  font-size: 0.8rem;
}

.stake-actions {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  text-align: center;
}

.btn-claim {
  width: 100%;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-claim:hover {
  opacity: 0.9;
}

.claimed-text {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.apy {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4CAF50;
}

.tag {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 4px;
  background: #eee;
  margin-right: 5px;
}

.tag.low {
  background: #e8f5e9;
  color: #2e7d32;
}

.tag.medium {
  background: #fff3e0;
  color: #ef6c00;
}

.tag.high {
  background: #ffebee;
  color: #c62828;
}

.btn-stake {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.admin-panel {
  border: 2px solid #ff9800;
  margin-bottom: 30px;
  background: #fff8e1;
}

.admin-form input, .admin-form select {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.admin-form .row {
  display: flex;
  gap: 10px;
}

.btn-admin {
  background: #ff9800;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
}


.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-confirm {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
}

.btn-cancel {
  background: #999;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
}

</style>