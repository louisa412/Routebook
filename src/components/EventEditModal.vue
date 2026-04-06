<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
    <div class="absolute inset-0 bg-[#231F40]/40 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-[#EFEEF7] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
      <div class="p-6 overflow-y-auto max-h-[85vh]">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-[#231F40] text-xl font-black">{{ isNew ? '新增行程' : '編輯行程' }}</h2>
          <button @click="$emit('close')" class="text-[#757199] text-2xl leading-none">×</button>
        </div>

        <div class="space-y-5">

          <!-- 行程分類 -->
          <div>
            <label class="field-label">行程分類（影響顏色）</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="cat in eventCategories" :key="cat.id" type="button"
                class="py-3 rounded-[14px] text-xs font-black border-2 transition-all flex flex-col items-center gap-1"
                :class="form.category === cat.id ? 'border-[#6D5FB1] bg-[#6D5FB1] text-white' : 'border-transparent bg-white text-[#757199]'"
                @click="form.category = cat.id; form.budgetCategory = categoryToMoze[cat.id]">
                <span class="text-lg">{{ cat.icon }}</span>
                <span>{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <!-- 事件類型 -->
          <div>
            <label class="field-label">事件類型</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" class="type-btn" :class="form.eventType !== 'point' ? 'type-btn--active' : 'type-btn--inactive'" @click="form.eventType = 'range'">
                <span class="text-lg mb-1">⏱</span>
                <span class="font-black text-xs">區段事件</span>
                <span class="text-[10px] opacity-70">有開始與結束時間</span>
              </button>
              <button type="button" class="type-btn" :class="form.eventType === 'point' ? 'type-btn--active' : 'type-btn--inactive'" @click="form.eventType = 'point'">
                <span class="text-lg mb-1">📍</span>
                <span class="font-black text-xs">點狀事件</span>
                <span class="text-[10px] opacity-70">抵達 / 起飛 / 退房</span>
              </button>
            </div>
          </div>

          <!-- 名稱 -->
          <div>
            <label class="field-label">行程名稱</label>
            <input v-model="form.title" type="text" placeholder="例如：由布院之森" class="field-input" />
          </div>

          <!-- 時間 -->
          <div class="grid gap-4" :class="form.eventType === 'point' ? 'grid-cols-1' : 'grid-cols-2'">
            <div>
              <label class="field-label">{{ form.eventType === 'point' ? '時間點' : '開始時間' }}</label>
              <input v-model="form.startTime" type="time" class="time-input" />
            </div>
            <div v-if="form.eventType !== 'point'">
              <label class="field-label">結束時間</label>
              <input v-model="form.endTime" type="time" class="time-input" />
            </div>
          </div>

          <!-- 地點來源 -->
          <div>
            <label class="field-label">地點來源</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" class="source-btn" :class="form.locationSource === 'manual' ? 'source-btn--active' : 'source-btn--inactive'" @click="form.locationSource = 'manual'">手動輸入地點</button>
              <button type="button" class="source-btn" :class="form.locationSource === 'lodging' ? 'source-btn--active' : 'source-btn--inactive'" @click="form.locationSource = 'lodging'">使用當日住宿</button>
            </div>
          </div>

          <!-- 地點 -->
          <div>
            <label class="field-label">地點</label>
            <input v-model="form.location" type="text"
              :disabled="form.locationSource === 'lodging'"
              :placeholder="form.locationSource === 'lodging' ? '已使用當日住宿' : '輸入地點'"
              class="field-input"
              :class="form.locationSource === 'lodging' ? 'opacity-50 cursor-not-allowed' : ''" />
            <p v-if="form.locationSource === 'lodging'" class="text-[11px] text-[#757199] mt-1.5">住宿預覽：{{ lodgingPreview }}</p>
          </div>

          <!-- 預算 + 幣別 -->
          <div>
            <label class="field-label">預算</label>
            <div class="flex gap-2">
              <div class="flex bg-white rounded-[14px] overflow-hidden shadow-sm flex-shrink-0">
                <button type="button"
                  class="px-3 py-3 text-xs font-black transition-all"
                  :class="form.currency !== 'TWD' ? 'bg-[#6D5FB1] text-white' : 'text-[#757199]'"
                  @click="form.currency = 'JPY'">¥ JPY</button>
                <button type="button"
                  class="px-3 py-3 text-xs font-black transition-all"
                  :class="form.currency === 'TWD' ? 'bg-[#6D5FB1] text-white' : 'text-[#757199]'"
                  @click="form.currency = 'TWD'">NT$ TWD</button>
              </div>
              <input v-model.number="form.price" type="number" class="flex-1 field-input text-[#6D5FB1] font-bold" />
            </div>
            <p v-if="form.price && form.currency !== 'TWD'" class="text-[11px] text-[#757199] mt-1.5">
              ≈ NT$ {{ Math.round(form.price * tripStore.exchangeRate).toLocaleString() }}（匯率 {{ tripStore.exchangeRate }}）
            </p>
          </div>

          <!-- MOZE 分類 -->
          <div>
            <label class="field-label">MOZE 分類</label>
            <select v-model="form.budgetCategory" class="field-input text-sm cursor-pointer">
              <option v-for="bc in mozeCats" :key="bc" :value="bc">{{ bc }}</option>
            </select>
          </div>

          <!-- 照片 -->
          <ImageUploader
            v-model="form.images"
            :storage-path="`trips/${tripStore.tripName}/${form.id}`"
          />

          <!-- 備註 -->
          <div>
            <label class="field-label">備註</label>
            <textarea v-model="form.note" rows="3" placeholder="寫些小提醒..." class="field-input resize-none"></textarea>
          </div>

          <!-- 操作 -->
          <div class="flex gap-3 pt-4 pb-2">
            <button v-if="!isNew" @click="handleDelete" class="px-5 py-4 rounded-[20px] text-red-400 font-bold bg-white border border-red-200 active:scale-95 transition-transform">刪除</button>
            <button @click="$emit('close')" class="flex-1 py-4 rounded-[20px] text-[#757199] font-bold bg-white active:scale-95 transition-transform">取消</button>
            <button @click="handleSave" class="flex-1 py-4 rounded-[20px] text-white font-bold bg-[#6D5FB1] shadow-lg active:scale-95 transition-transform">儲存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTripStore } from '../stores/useTripStore'
import type { TripEvent } from '../types'
import { MOZE_CATEGORIES, EVENT_TO_MOZE } from '../types'
import ImageUploader from './ImageUploader.vue'

const props = defineProps<{ isOpen: boolean; event: TripEvent | null; isNew?: boolean }>()
const emit = defineEmits(['close'])
const tripStore = useTripStore()
const mozeCats = MOZE_CATEGORIES

const eventCategories = [
  { id: 'transport', name: '交通', icon: '🚆' },
  { id: 'food',      name: '美食', icon: '🍜' },
  { id: 'spot',      name: '景點', icon: '🏯' },
  { id: 'shopping',  name: '購物', icon: '🛍' },
  { id: 'hotel',     name: '住宿', icon: '🏨' },
  { id: 'todo',      name: '其他', icon: '📌' },
]

const categoryToMoze: Record<string, string> = {
  transport: '交通', food: '飲食', spot: '娛樂',
  shopping: '購物', hotel: '生活', todo: '其他'
}

const form = ref<TripEvent>({} as TripEvent)

const lodgingPreview = computed(() => {
  const hotel = tripStore.lodging[form.value.day]
  if (!hotel) return '當日尚未設定住宿'
  return [hotel.name, hotel.address].filter(Boolean).join(' · ')
})

watch(() => props.event, (newVal) => {
  if (newVal) {
    form.value = {
      ...JSON.parse(JSON.stringify(newVal)),
      eventType: newVal.eventType ?? 'range',
      currency: newVal.currency ?? 'JPY',
      locationSource: newVal.locationSource === 'lodging' ? 'lodging' : 'manual',
      budgetCategory: newVal.budgetCategory || EVENT_TO_MOZE[newVal.category] || '其他'
    }
  }
}, { immediate: true })

const handleSave = () => {
  if (!form.value.title?.trim()) { alert('請填寫行程名稱'); return }
  if (form.value.eventType !== 'point' && form.value.endTime <= form.value.startTime) {
    alert('結束時間必須晚於開始時間'); return
  }
  if (props.isNew) { tripStore.addEvent({ ...form.value }) }
  else { tripStore.updateEvent({ ...form.value }) }
  emit('close')
}

const handleDelete = () => {
  if (confirm('確定刪除這筆行程？')) { tripStore.deleteEvent(form.value.id); emit('close') }
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.field-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #757199; margin-bottom: 8px; }
.field-input { width: 100%; background: white; border: none; border-radius: 18px; padding: 16px; color: #231F40; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.06); outline: none; box-sizing: border-box; }
.time-input { width: 100%; background: white; border: none; border-radius: 18px; padding: 12px; text-align: center; font-weight: 700; color: #6D5FB1; box-shadow: 0 2px 8px rgba(0,0,0,0.06); outline: none; min-height: 44px; -webkit-appearance: none; }
.type-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; border-radius: 16px; border: 2px solid transparent; transition: all 0.2s; gap: 2px; }
.type-btn--active { background: #6D5FB1; color: white; border-color: #6D5FB1; }
.type-btn--inactive { background: white; color: #757199; }
.source-btn { padding: 12px; border-radius: 14px; font-size: 12px; font-weight: 700; border: 2px solid transparent; transition: all 0.2s; width: 100%; }
.source-btn--active { background: #6D5FB1; color: white; border-color: #6D5FB1; }
.source-btn--inactive { background: white; color: #757199; }
</style>
