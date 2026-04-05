<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
    <div class="absolute inset-0 bg-[#231F40]/40 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative bg-[#EFEEF7] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
      <div class="p-6 overflow-y-auto max-h-[85vh]">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-[#231F40] text-xl font-black">編輯行程</h2>
          <button @click="$emit('close')" class="text-[#757199] text-2xl">×</button>
        </div>

        <div class="space-y-5">
          <!-- 名稱 -->
          <div>
            <label class="field-label">行程名稱</label>
            <input v-model="form.title" type="text" placeholder="例如：由布院之森" class="field-input" />
          </div>

          <!-- 時間 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="field-label">開始時間</label>
              <input v-model="form.startTime" type="time" class="time-input" />
            </div>
            <div>
              <label class="field-label">結束時間</label>
              <input v-model="form.endTime" type="time" class="time-input" />
            </div>
          </div>

          <!-- 地點來源 -->
          <div>
            <label class="field-label">地點來源</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="source-btn"
                :class="form.locationSource === 'manual' ? 'source-btn--active' : 'source-btn--inactive'"
                @click="form.locationSource = 'manual'"
              >手動輸入地點</button>
              <button
                type="button"
                class="source-btn"
                :class="form.locationSource === 'lodging' ? 'source-btn--active' : 'source-btn--inactive'"
                @click="form.locationSource = 'lodging'"
              >使用當日住宿</button>
            </div>
          </div>

          <!-- 地點 + 預算 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="field-label">地點</label>
              <input
                v-model="form.location"
                type="text"
                :disabled="form.locationSource === 'lodging'"
                :placeholder="form.locationSource === 'lodging' ? '已使用當日住宿' : '輸入地點'"
                class="field-input"
                :class="form.locationSource === 'lodging' ? 'opacity-50 cursor-not-allowed' : ''"
              />
              <p v-if="form.locationSource === 'lodging'" class="text-[11px] text-[#757199] mt-2">
                住宿預覽：{{ lodgingPreview }}
              </p>
            </div>
            <div>
              <label class="field-label">預算 (JPY)</label>
              <input v-model.number="form.price" type="number" class="field-input text-[#6D5FB1] font-bold" />
            </div>
          </div>

          <!-- 圖片上傳 -->
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
            <button @click="$emit('close')" class="flex-1 py-4 rounded-[20px] text-[#757199] font-bold bg-white active:scale-95 transition-transform">取消</button>
            <button @click="handleSave" class="flex-1 py-4 rounded-[20px] text-white font-bold bg-[#6D5FB1] shadow-lg shadow-[#6D5FB1]/20 active:scale-95 transition-transform">儲存行程</button>
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
import ImageUploader from './ImageUploader.vue'

const props = defineProps<{ isOpen: boolean; event: TripEvent | null }>()
const emit = defineEmits(['close'])

const tripStore = useTripStore()
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
      locationSource: newVal.locationSource === 'lodging' ? 'lodging' : 'manual'
    }
  }
}, { immediate: true })

const handleSave = () => {
  if (form.value.endTime <= form.value.startTime) {
    alert('J 人提示：結束時間必須晚於開始時間喔！')
    return
  }
  tripStore.updateEvent({ ...form.value })
  emit('close')
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

.field-label { @apply text-[#757199] text-[10px] font-bold uppercase tracking-widest mb-2 block; }
.field-input { @apply w-full bg-white border-none rounded-[18px] p-4 text-[#231F40] font-bold shadow-sm focus:ring-2 focus:ring-[#6D5FB1] outline-none; }
.time-input { @apply w-full bg-white border-none rounded-[18px] p-3 text-center font-bold text-[#6D5FB1] shadow-sm outline-none cursor-pointer; }
.source-btn { @apply py-3 px-3 rounded-[14px] text-xs font-bold border transition-colors; }
.source-btn--active { @apply bg-[#6D5FB1] text-white border-[#6D5FB1]; }
.source-btn--inactive { @apply bg-white text-[#757199] border-transparent; }

input[type="time"] { -webkit-appearance: none; min-height: 44px; }
</style>
