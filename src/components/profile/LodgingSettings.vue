<template>
  <section class="lodging-card">
    <div class="lodging-header">
      <h3>住宿設定</h3>
      <span class="text-xs text-[#757199]">修改後會同步到使用「當日住宿」的行程</span>
    </div>
    <div class="lodging-list">
      <div v-for="day in sortedDays" :key="day" class="lodging-item">
        <p class="lodging-day">{{ dayLabel(day) }}</p>
        <label class="field-label">住宿名稱</label>
        <input v-model="draft[day].name" class="field-input" placeholder="例如：福岡皇家花園酒店" />
        <label class="field-label">住宿地址</label>
        <input v-model="draft[day].address" class="field-input" placeholder="例如：福岡市博多區..." />
        <button @click="save(day)" class="save-btn">儲存 Day {{ day + 1 }} 住宿</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTripStore } from '../../stores/useTripStore'
const tripStore = useTripStore()
const draft = ref<Record<number, { name: string; address: string }>>({})
watch(() => tripStore.lodging, (newLodging) => { draft.value = JSON.parse(JSON.stringify(newLodging || {})) }, { immediate: true, deep: true })
const sortedDays = computed(() => Object.keys(draft.value).map(Number).sort((a, b) => a - b))
const dayLabel = (day: number) => { const info = tripStore.days[day]; return info ? `${info.dayTitle} · ${info.displayLabel}` : `Day ${day + 1}` }
const save = (day: number) => { if (!draft.value[day]) draft.value[day] = { name: '', address: '' }; tripStore.updateLodging(day, draft.value[day]) }
</script>

<style scoped>
.lodging-card { background: white; padding: 24px 20px; border-radius: 24px; box-shadow: 0 10px 30px rgba(109,95,177,.05); }
.lodging-header { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 16px; }
.lodging-header h3 { margin: 0; color: #231F40; }
.lodging-list { display: grid; gap: 14px; }
.lodging-item { border: 1px solid #ece9ff; border-radius: 16px; padding: 14px; background: #faf9ff; }
.lodging-day { font-size: 12px; color: #6D5FB1; font-weight: 800; margin-bottom: 8px; }
.field-label { display: block; font-size: 11px; color: #757199; margin: 8px 0 4px; }
.field-input { width: 100%; border: 1px solid #e6e3f7; border-radius: 10px; padding: 10px 12px; font-size: 14px; box-sizing: border-box; background: white; color: #231F40; }
.save-btn { margin-top: 12px; width: 100%; background: #6D5FB1; color: white; border: none; border-radius: 10px; padding: 10px; font-weight: 700; }
</style>
