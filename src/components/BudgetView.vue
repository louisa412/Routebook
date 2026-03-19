<template>
  <div class="budget-page">
    <div class="summary-box">
      <div class="summary-item">
        <p class="label">總預算</p>
        <h2 class="amount">¥ {{ tripStore.totalBudget.toLocaleString() }}</h2>
      </div>
      <div class="divider"></div>
      <div class="summary-item">
        <p class="label">已規劃支出</p>
        <h2 class="amount highlight">¥ {{ tripStore.totalSpent.toLocaleString() }}</h2>
      </div>
    </div>

    <h3 class="section-title">支出分佈統計</h3>
    
    <div class="stats-container">
      <div v-for="(amount, cat) in tripStore.categoryTally" :key="cat" class="cat-row">
        <div class="cat-info">
          <span class="cat-name">{{ cat }}</span>
          <span class="cat-price">¥ {{ amount.toLocaleString() }}</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" 
               :style="{ width: (amount / (tripStore.totalSpent || 1) * 100) + '%' }">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/tripStore'
const tripStore = useTripStore()
</script>

<style scoped>
.budget-page { padding: 25px 20px; --rt-primary: #6D5FB1; --rt-secondary: #DEDAF4; }

.summary-box {
  background: linear-gradient(135deg, #6D5FB1 0%, #8E82D6 100%);
  border-radius: 28px;
  padding: 30px;
  color: white;
  box-shadow: 0 15px 35px rgba(109, 95, 177, 0.25);
  margin-bottom: 35px;
}

.summary-item .label { font-size: 13px; opacity: 0.8; margin: 0 0 5px 0; font-weight: 600; }
.summary-item .amount { font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -1px; }
.summary-item .amount.highlight { color: #E0DBFF; }

.divider { height: 1px; background: rgba(255,255,255,0.15); margin: 20px 0; }

.section-title { font-size: 18px; font-weight: 800; color: #231F40; margin-bottom: 20px; }

.stats-container { background: white; padding: 25px; border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }

.cat-row { margin-bottom: 20px; }
.cat-row:last-child { margin-bottom: 0; }

.cat-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; font-weight: 700; }
.cat-name { color: #757199; }
.cat-price { color: var(--rt-primary); }

.progress-container { height: 10px; background: #F0EEF9; border-radius: 5px; overflow: hidden; }
.progress-bar { height: 100%; background: var(--rt-primary); border-radius: 5px; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>