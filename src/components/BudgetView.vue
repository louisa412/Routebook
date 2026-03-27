<template>
  <div class="budget-page">
    <div class="summary-box">
      <div class="summary-item">
        <p class="label">總預算 (Total Budget)</p>
        <h2 class="amount">¥ {{ (tripStore.totalBudget || 0).toLocaleString() }}</h2>
      </div>
      <div class="divider"></div>
      <div class="summary-item">
        <div class="flex justify-between items-end">
          <div>
            <p class="label">已規劃支出 (Estimated)</p>
            <h2 class="amount highlight">¥ {{ tripStore.totalSpent.toLocaleString() }}</h2>
          </div>
          <div class="text-right pb-1">
            <p class="text-[10px] opacity-70 font-bold uppercase">剩餘</p>
            <p class="text-lg font-black">{{ remainingPercent }}%</p>
          </div>
        </div>
      </div>
    </div>

    <h3 class="section-title">支出分佈統計</h3>
    
    <div class="stats-container">
      <div v-if="Object.keys(categoryTally).length > 0">
        <div v-for="(amount, cat) in categoryTally" :key="cat" class="cat-row">
          <div class="cat-info">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: getCategoryColor(cat) }"></span>
              <span class="cat-name">{{ getCategoryLabel(cat) }}</span>
            </div>
            <span class="cat-price">¥ {{ amount.toLocaleString() }}</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar" 
                 :style="{ 
                   width: Math.max((amount / (tripStore.totalSpent || 1) * 100), 2) + '%',
                   backgroundColor: getCategoryColor(cat)
                 }">
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="py-10 text-center text-[#757199]/40 text-sm italic">
        尚未設定任何帶有金額的行程
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '../stores/tripStore'
import type { EventCategory } from '../types'

const tripStore = useTripStore()

/**
 * 💡 核心修復：計算各分類的支出總額
 * 從 tripStore.events 裡面撈出所有 price 進行加總
 */
const categoryTally = computed(() => {
  const tally: Record<string, number> = {}
  
  tripStore.events.forEach(event => {
    if (event.price && event.price > 0) {
      const cat = event.category || 'todo'
      tally[cat] = (tally[cat] || 0) + Number(event.price)
    }
  })
  
  return tally
})

/**
 * 計算剩餘預算百分比
 */
const remainingPercent = computed(() => {
  const total = tripStore.totalBudget || 1
  const spent = tripStore.totalSpent
  const percent = Math.round(((total - spent) / total) * 100)
  return Math.max(percent, 0)
})

/**
 * 翻譯分類標籤
 */
const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    food: '美食餐飲',
    spot: '景點門票',
    transport: '交通運輸',
    shopping: '購物血拼',
    hotel: '住宿費用',
    todo: '其他支出'
  }
  return labels[cat] || cat
}

/**
 * 取得分類顏色 (與 TimelineView 保持一致)
 */
const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    food: '#FFB067',
    spot: '#7FA9FB',
    transport: '#8292D1',
    shopping: '#E993D1',
    hotel: '#6BCB77',
    todo: '#DEDAF4'
  }
  return colors[cat] || '#DEDAF4'
}
</script>

<style scoped>
.budget-page { padding: 25px 20px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }

.summary-box {
  background: linear-gradient(135deg, #6D5FB1 0%, #8E82D6 100%);
  border-radius: 28px;
  padding: 30px;
  color: white;
  box-shadow: 0 15px 35px rgba(109, 95, 177, 0.25);
  margin-bottom: 35px;
}

.summary-item .label { font-size: 11px; opacity: 0.7; margin: 0 0 5px 0; font-weight: 800; uppercase; tracking-wider; }
.summary-item .amount { font-size: 32px; margin: 0; font-weight: 900; letter-spacing: -1px; }
.summary-item .amount.highlight { color: #DEDAF4; }

.divider { height: 1px; background: rgba(255,255,255,0.15); margin: 20px 0; }

.section-title { font-size: 16px; font-weight: 900; color: #231F40; margin-bottom: 20px; padding-left: 5px; }

.stats-container { background: white; padding: 25px; border-radius: 28px; box-shadow: 0 8px 20px rgba(109, 95, 177, 0.05); }

.cat-row { margin-bottom: 22px; }
.cat-row:last-child { margin-bottom: 0; }

.cat-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; font-weight: 800; }
.cat-name { color: #757199; }
.cat-price { color: #6D5FB1; }

.progress-container { height: 8px; background: #EFEEF7; border-radius: 10px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 10px; transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
