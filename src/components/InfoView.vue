<template>
  <div class="info-view">
    <div class="section-title">🏨 每日住宿設定</div>
    <div class="lodging-card" v-for="(day, index) in tripStore.days" :key="index">
      <div class="day-info">
        <span class="day-label">Day {{ index + 1 }}</span>
        <span class="date-label">{{ day.date }} ({{ day.weekday }})</span>
      </div>
      <input v-model="tripStore.lodging[index].name" placeholder="飯店名稱..." @change="tripStore.saveToCloud()" class="hotel-input" />
      <input v-model="tripStore.lodging[index].address" placeholder="飯店地址..." @change="tripStore.saveToCloud()" class="address-input" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/tripStore'
const tripStore = useTripStore()
</script>

<style scoped>
.info-view { padding: 20px; animation: fadeIn 0.4s ease; }
.section-title { font-weight: 800; color: var(--rt-primary); margin-bottom: 20px; font-size: 18px; }
.lodging-card { background: white; padding: 16px; border-radius: 20px; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(109,95,177,0.05); }
.day-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
.day-label { color: var(--rt-primary); font-weight: 800; }
.hotel-input { width: 100%; border: none; font-weight: 700; font-size: 16px; color: var(--rt-text); outline: none; margin-bottom: 4px; }
.address-input { width: 100%; border: none; font-size: 12px; color: var(--rt-muted); outline: none; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>