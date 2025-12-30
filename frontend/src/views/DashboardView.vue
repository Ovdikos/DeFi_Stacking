<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const pools = ref([]);
const myStakes = ref([]);
const loading = ref(true);

const showStakeModal = ref(false);
const selectedPool = ref(null);
const stakeAmount = ref(0);

const fetchData = async () => {
  try {
    loading.value = true;
    const [poolsRes, stakesRes] = await Promise.all([
      api.get('/pools'),
      api.get('/my-stakes')
    ]);

    pools.value = poolsRes.data.pools;
    myStakes.value = stakesRes.data.stakes;
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to load dashboard data.");
  } finally {
    loading.value = false;
  }
};

const openStakeModal = (pool) => {
  selectedPool.value = pool;
  stakeAmount.value = 100;
  showStakeModal.value = true;
};

const submitStake = async () => {
  if (stakeAmount.value <= 0) return alert("Amount must be positive");

  try {
    await api.post('/stake', {
      pool_id: selectedPool.value.id,
      amount: stakeAmount.value
    });

    alert(`Successfully staked ${stakeAmount.value} tokens!`);
    showStakeModal.value = false;
    await fetchData();
  } catch (error) {
    alert(error.response?.data?.message || "Staking failed");
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="dashboard">
    <h1>{{ $t('nav.dashboard') }}</h1>

    <div v-if="loading" class="loading">Loading blockchain data...</div>

    <div v-else class="grid-container">

      <div class="section my-stakes">
        <h2>My Active Stakes</h2>
        <div v-if="myStakes.length === 0" class="empty-state">
          You have no active stakes yet. Start earning!
        </div>

        <div v-else class="stakes-list">
          <div v-for="stake in myStakes" :key="stake.id" class="stake-card">
            <div class="stake-header">
              <span class="pool-name">{{ stake.pool_name }}</span>
              <span class="status-badge" :class="stake.status">{{ stake.status }}</span>
            </div>
            <div class="stake-details">
              <p>Amount: <strong>{{ stake.amount }}</strong></p>
              <p>APY: <span class="green">{{ stake.apy_percentage }}%</span></p>
              <p class="date">Staked: {{ new Date(stake.staked_at).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section pools-list">
        <h2>Available Liquidity Pools</h2>
        <div v-for="pool in pools" :key="pool.id" class="pool-card">
          <div class="pool-info">
            <h3>{{ pool.name }}</h3>
            <p class="desc">{{ pool.description }}</p>
            <div class="tags">
              <span class="tag risk" :class="pool.risk_level.toLowerCase()">Risk: {{ pool.risk_level }}</span>
              <span class="tag lock">Lock: {{ pool.min_lock_period }} days</span>
            </div>
          </div>
          <div class="pool-action">
            <div class="apy">{{ pool.apy_percentage }}% <small>APY</small></div>
            <button @click="openStakeModal(pool)" class="btn-stake">Stake Now</button>
          </div>
        </div>
      </div>

    </div>

    <div v-if="showStakeModal" class="modal-overlay">
      <div class="modal">
        <h3>Stake in {{ selectedPool?.name }}</h3>
        <p>Enter amount to lock:</p>
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
.dashboard { padding: 20px; max-width: 1200px; margin: 0 auto; }
.grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }

.section { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.pool-card, .stake-card { border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }

.apy { font-size: 1.5rem; font-weight: bold; color: #4CAF50; text-align: right; }
.green { color: #4CAF50; font-weight: bold; }
.desc { color: #666; font-size: 0.9rem; margin: 5px 0; }

.tags { display: flex; gap: 10px; margin-top: 10px; }
.tag { font-size: 0.8rem; padding: 3px 8px; border-radius: 4px; background: #eee; }
.tag.risk.low { background: #e8f5e9; color: #2e7d32; }
.tag.risk.medium { background: #fff3e0; color: #ef6c00; }
.tag.risk.high { background: #ffebee; color: #c62828; }

.btn-stake { background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; }
.btn-stake:hover { background: #1976D2; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; }
.modal { background: white; padding: 30px; border-radius: 10px; width: 400px; }
.modal input { width: 100%; padding: 10px; margin: 15px 0; font-size: 1.2rem; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-confirm { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; }
.btn-cancel { background: #999; color: white; border: none; padding: 10px 20px; border-radius: 5px; }

@media (max-width: 768px) {
  .grid-container { grid-template-columns: 1fr; }
}
</style>