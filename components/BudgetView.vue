<template>
  <div class="budget-page">

    <!-- 總覽 -->
    <div class="summary-box">
      <div class="summary-item">
        <p class="label">總預算 (TOTAL BUDGET)</p>
        <h2 class="amount">¥ {{ (tripStore.totalBudget || 0).toLocaleString() }}</h2>
      </div>
      <div class="divider"></div>
      <div class="summary-item">
        <div class="flex justify-between items-end">
          <div>
            <p class="label">合計支出 (TOTAL SPENT)</p>
            <h2 class="amount highlight">¥ {{ grandTotal.toLocaleString() }}</h2>
          </div>
          <div class="text-right pb-1">
            <p class="text-[10px] opacity-70 font-bold uppercase">剩餘</p>
            <p class="text-lg font-black">{{ remainingPercent }}%</p>
          </div>
        </div>
        <div class="mt-3 h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
          <div class="h-full bg-white rounded-full transition-all duration-700" :style="{ width: Math.min(100 - remainingPercent, 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 來源說明 -->
    <div class="flex gap-2 px-1 mb-4">
      <span class="source-chip">🗓 行程</span>
      <span class="source-chip">🛍 採購清單</span>
    </div>

    <!-- MOZE 分類統計 -->
    <h3 class="section-title">MOZE 分類統計</h3>
    <div class="stats-container">
      <div v-if="Object.keys(mozeTally).length > 0">
        <div v-for="(amount, cat) in mozeTally" :key="cat" class="cat-row">
          <div class="cat-info">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getMozeColor(cat) }"></span>
              <span class="cat-name">{{ cat }}</span>
            </div>
            <span class="cat-price">¥ {{ amount.toLocaleString() }}</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: Math.max((amount / (grandTotal || 1) * 100), 2) + '%', backgroundColor: getMozeColor(cat) }"></div>
          </div>
        </div>
      </div>
      <div v-else class="py-10 text-center text-[#757199]/40 text-sm italic">
        尚未設定任何帶有金額的行程或採購項目
      </div>
    </div>

    <!-- 預算設定 -->
    <div class="mt-6 bg-white rounded-[24px] p-5">
      <p class="text-[11px] font-black uppercase tracking-widest text-[#757199] mb-3">調整總預算</p>
      <div class="flex gap-3 items-center">
        <span class="text-[#6D5FB1] font-black">¥</span>
        <input
          v-model.number="budgetDraft"
          type="number"
          class="flex-1 bg-[#EFEEF7] rounded-[14px] px-4 py-3 font-black text-[#231F40] outline-none border-none"
        />
        <button @click="saveBudget" class="bg-[#6D5FB1] text-white px-5 py-3 rounded-[14px] font-bold text-sm">儲存</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripStore } from '../stores/useTripStore'
import { useListStore } from '../stores/useListStore'
import type { MozeCategory } from '../types'
import { MOZE_CATEGORIES, EVENT_TO_MOZE } from '../types'

const tripStore = useTripStore()
const listStore = useListStore()

const budgetDraft = ref(tripStore.totalBudget)
const saveBudget = () => { tripStore.totalBudget = budgetDraft.value }

// 合併行程 + 採購清單，按 MOZE 分類加總
const mozeTally = computed(() => {
  const tally: Partial<Record<MozeCategory, number>> = {}

  // 行程事件
  tripStore.events.forEach(event => {
    if (!event.price || event.price <= 0) return
    const cat: MozeCategory = event.budgetCategory || EVENT_TO_MOZE[event.category] || '其他'
    tally[cat] = (tally[cat] || 0) + Number(event.price)
  })

  // 採購清單
  listStore.shoppingList.forEach(item => {
    if (!item.price || item.price <= 0) return
    const cat: MozeCategory = item.budgetCategory || '購物'
    tally[cat] = (tally[cat] || 0) + Number(item.price)
  })

  // 按金額排序
  return Object.fromEntries(
    Object.entries(tally).sort(([, a], [, b]) => b - a)
  ) as Partial<Record<MozeCategory, number>>
})

const grandTotal = computed(() =>
  Object.values(mozeTally.value).reduce((sum, v) => sum + (v || 0), 0)
)

const remainingPercent = computed(() => {
  const total = tripStore.totalBudget || 1
  return Math.max(Math.round(((total - grandTotal.value) / total) * 100), 0)
})

const MOZE_COLORS: Record<string, string> = {
  '交通': '#8292D1', '家居': '#6BCB77', '飲食': '#FFB067', '娛樂': '#7FA9FB',
  '購物': '#E993D1', '二三次元周邊': '#C084FC', '個人': '#F9A8D4',
  '醫療': '#86EFAC', '家庭': '#FCD34D', '生活': '#67E8F9', '學習': '#A5B4FC', '其他': '#DEDAF4'
}

const getMozeColor = (cat: string) => MOZE_COLORS[cat] || '#DEDAF4'
</script>

<style scoped>
.budget-page { padding: 25px 20px; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
.summary-box { background: linear-gradient(135deg, #6D5FB1 0%, #8E82D6 100%); border-radius: 28px; padding: 30px; color: white; margin-bottom: 20px; }
.label { font-size: 11px; opacity: 0.7; margin-bottom: 5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
.amount { font-size: 32px; margin: 0; font-weight: 900; letter-spacing: -1px; }
.amount.highlight { color: #DEDAF4; }
.divider { height: 1px; background: rgba(255,255,255,0.15); margin: 20px 0; }
.source-chip { font-size: 11px; font-weight: 700; background: white; color: #6D5FB1; border-radius: 999px; padding: 4px 10px; }
.section-title { font-size: 16px; font-weight: 900; color: #231F40; margin-bottom: 16px; }
.stats-container { background: white; padding: 25px; border-radius: 28px; }
.cat-row { margin-bottom: 20px; }
.cat-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 800; }
.cat-name { color: #757199; }
.cat-price { color: #6D5FB1; }
.progress-container { height: 8px; background: #EFEEF7; border-radius: 10px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 10px; transition: width 1s ease; }
</style>
