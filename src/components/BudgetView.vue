<template>
  <div class="budget-page">

    <!-- 總覽（台幣） -->
    <div class="summary-box">
      <div class="summary-item">
        <p class="label">總預算 (BUDGET)</p>
        <h2 class="amount">NT$ {{ twdBudget.toLocaleString() }}</h2>
        <p class="text-[11px] opacity-60 mt-1">¥{{ (tripStore.totalBudget || 0).toLocaleString() }} × {{ tripStore.exchangeRate }}</p>
      </div>
      <div class="divider"></div>
      <div class="summary-item">
        <div class="flex justify-between items-end">
          <div>
            <p class="label">合計支出 (SPENT)</p>
            <h2 class="amount highlight">NT$ {{ grandTotalTWD.toLocaleString() }}</h2>
          </div>
          <div class="text-right pb-1">
            <p class="text-[10px] opacity-70 font-bold uppercase">剩餘</p>
            <p class="text-lg font-black">{{ remainingPercent }}%</p>
          </div>
        </div>
        <div class="mt-3 h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
          <div class="h-full bg-white rounded-full transition-all duration-700"
            :style="{ width: Math.min(100 - remainingPercent, 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 來源 Tab -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="t in sourceTabs" :key="t.id"
        @click="activeSource = t.id"
        class="flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-black transition-all"
        :class="activeSource === t.id ? 'bg-[#6D5FB1] text-white shadow-md' : 'bg-white text-[#757199]'"
      >
        <span>{{ t.icon }}</span>{{ t.name }}
      </button>
    </div>

    <h3 class="section-title">MOZE 分類統計（NT$）</h3>
    <div class="stats-container">
      <div v-if="Object.keys(mozeTally).length > 0">
        <div v-for="(amount, cat) in mozeTally" :key="cat" class="cat-row">
          <div class="cat-info">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: getMozeColor(cat) }"></span>
              <span class="cat-name">{{ cat }}</span>
            </div>
            <span class="cat-price">NT$ {{ amount.toLocaleString() }}</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar"
              :style="{ width: Math.max((amount / (grandTotalTWD || 1) * 100), 2) + '%', backgroundColor: getMozeColor(cat) }">
            </div>
          </div>
        </div>
      </div>
      <div v-else class="py-10 text-center text-[#757199]/40 text-sm italic">
        此來源尚無帶有金額的項目
      </div>
    </div>

    <!-- 預算 + 匯率設定 -->
    <div class="mt-6 bg-white rounded-[24px] p-5 space-y-4">
      <div>
        <p class="text-[11px] font-black uppercase tracking-widest text-[#757199] mb-3">總預算（日圓）</p>
        <div class="flex gap-3 items-center">
          <span class="text-[#6D5FB1] font-black">¥</span>
          <input v-model.number="budgetDraft" type="number"
            class="flex-1 bg-[#EFEEF7] rounded-[14px] px-4 py-3 font-black text-[#231F40] outline-none border-none" />
          <button @click="saveBudget" class="bg-[#6D5FB1] text-white px-5 py-3 rounded-[14px] font-bold text-sm">儲存</button>
        </div>
      </div>
      <div>
        <p class="text-[11px] font-black uppercase tracking-widest text-[#757199] mb-1">匯率設定</p>
        <p class="text-[10px] text-[#757199]/60 mb-3">1 日圓 = ? 台幣（例如 0.22）</p>
        <div class="flex gap-3 items-center">
          <span class="text-[11px] text-[#757199] font-bold">1 JPY =</span>
          <input v-model.number="rateDraft" type="number" step="0.001"
            class="flex-1 bg-[#EFEEF7] rounded-[14px] px-4 py-3 font-black text-[#231F40] outline-none border-none" />
          <span class="text-[11px] text-[#757199] font-bold">TWD</span>
          <button @click="saveRate" class="bg-[#6D5FB1] text-white px-5 py-3 rounded-[14px] font-bold text-sm">儲存</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripStore } from '../stores/useTripStore'
import { useListStore } from '../stores/useListStore'
import type { MozeCategory } from '../types'
import { EVENT_TO_MOZE } from '../types'

const tripStore = useTripStore()
const listStore = useListStore()

const budgetDraft = ref(tripStore.totalBudget)
const rateDraft = ref(tripStore.exchangeRate)
const saveBudget = () => { tripStore.totalBudget = budgetDraft.value }
const saveRate = () => { tripStore.updateExchangeRate(rateDraft.value) }

// 把任何幣別換算成台幣
const toTWD = (price: number, currency?: string) => {
  if (!price) return 0
  return currency === 'TWD' ? price : Math.round(price * tripStore.exchangeRate)
}

const twdBudget = computed(() =>
  Math.round((tripStore.totalBudget || 0) * tripStore.exchangeRate)
)

type SourceId = 'all' | 'events' | 'shopping' | 'todo'
const activeSource = ref<SourceId>('all')
const sourceTabs = [
  { id: 'all'      as SourceId, icon: '📊', name: '全部' },
  { id: 'events'   as SourceId, icon: '🗓', name: '行程' },
  { id: 'shopping' as SourceId, icon: '🛍', name: '採購清單' },
  { id: 'todo'     as SourceId, icon: '✅', name: '待辦清單' },
]

const mozeTally = computed(() => {
  const tally: Partial<Record<MozeCategory, number>> = {}
  const add = (cat: MozeCategory, price: number, currency?: string) => {
    const twd = toTWD(price, currency)
    if (!twd) return
    tally[cat] = (tally[cat] || 0) + twd
  }

  if (activeSource.value === 'all' || activeSource.value === 'events')
    tripStore.events.forEach(e => add(e.budgetCategory || EVENT_TO_MOZE[e.category] || '其他', e.price, e.currency))
  if (activeSource.value === 'all' || activeSource.value === 'shopping')
    listStore.shoppingList.forEach(i => add(i.budgetCategory || '購物', i.price || 0, i.currency))
  if (activeSource.value === 'all' || activeSource.value === 'todo')
    listStore.todos.forEach(i => add(i.budgetCategory || '其他', i.price || 0, i.currency))

  return Object.fromEntries(
    Object.entries(tally).sort(([, a], [, b]) => b - a)
  ) as Partial<Record<MozeCategory, number>>
})

const grandTotalTWD = computed(() =>
  Object.values(mozeTally.value).reduce((s, v) => s + (v || 0), 0)
)

const remainingPercent = computed(() =>
  Math.max(Math.round(((twdBudget.value - grandTotalTWD.value) / (twdBudget.value || 1)) * 100), 0)
)

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
.section-title { font-size: 16px; font-weight: 900; color: #231F40; margin-bottom: 16px; }
.stats-container { background: white; padding: 25px; border-radius: 28px; }
.cat-row { margin-bottom: 20px; }
.cat-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 800; }
.cat-name { color: #757199; }
.cat-price { color: #6D5FB1; }
.progress-container { height: 8px; background: #EFEEF7; border-radius: 10px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 10px; transition: width 1s ease; }
</style>
