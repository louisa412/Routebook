<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
    <div class="absolute inset-0 bg-[#231F40]/40 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative bg-[#EFEEF7] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
      <div class="p-6 overflow-y-auto max-h-[85vh]">

        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-[#231F40] text-xl font-black">規劃新旅行</h2>
            <p class="text-[11px] text-[#757199] mt-0.5">行程清空，清單與設定保留</p>
          </div>
          <button @click="$emit('close')" class="text-[#757199] text-2xl leading-none">×</button>
        </div>

        <div class="space-y-5">
          <div>
            <label class="field-label">旅行名稱</label>
            <input v-model="form.name" type="text" placeholder="例如：京都秋季之旅 2026" class="field-input" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="field-label">出發日期</label>
              <input v-model="form.start" type="date" class="field-input cursor-pointer" />
            </div>
            <div>
              <label class="field-label">天數</label>
              <input v-model.number="form.days" type="number" min="1" max="30" class="field-input text-center font-black text-[#6D5FB1]" />
            </div>
          </div>

          <div>
            <label class="field-label">總預算（日圓）</label>
            <div class="flex items-center gap-2">
              <span class="text-[#6D5FB1] font-black">¥</span>
              <input v-model.number="form.budget" type="number" class="flex-1 field-input text-[#6D5FB1] font-bold" />
            </div>
          </div>

          <!-- 警告 -->
          <div class="bg-amber-50 border border-amber-200 rounded-[16px] p-4">
            <p class="text-amber-700 text-xs font-bold leading-relaxed">
              ⚠️ 確認後，目前所有<span class="font-black">行程事件與住宿設定</span>會被清空。<br>
              待辦、採購、行李清單及匯率設定會保留。
            </p>
          </div>

          <div class="flex gap-3 pt-2 pb-2">
            <button @click="$emit('close')" class="flex-1 py-4 rounded-[20px] text-[#757199] font-bold bg-white active:scale-95 transition-transform">取消</button>
            <button @click="handleConfirm" :disabled="!isValid"
              class="flex-1 py-4 rounded-[20px] text-white font-black bg-[#6D5FB1] shadow-lg shadow-[#6D5FB1]/20 active:scale-95 transition-transform disabled:opacity-40">
              開始新旅行 ✈️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTripStore } from '../stores/useTripStore'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const tripStore = useTripStore()

const form = ref({
  name: '',
  start: '',
  days: 5,
  budget: 50000
})

const isValid = computed(() =>
  form.value.name.trim() && form.value.start && form.value.days >= 1
)

const handleConfirm = () => {
  if (!isValid.value) return
  tripStore.resetTrip({
    name: form.value.name.trim(),
    start: form.value.start,
    days: form.value.days,
    budget: form.value.budget
  })
  emit('close')
}
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.field-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #757199; margin-bottom: 8px; }
.field-input { width: 100%; background: white; border: none; border-radius: 18px; padding: 16px; color: #231F40; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.06); outline: none; box-sizing: border-box; }
</style>
