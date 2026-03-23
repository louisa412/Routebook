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
          <div>
            <label class="text-[#757199] text-[10px] font-bold uppercase tracking-widest mb-2 block">行程名稱</label>
            <input v-model="editForm.title" type="text" class="w-full bg-white border-none rounded-[18px] p-4 text-[#231F40] font-bold shadow-sm focus:ring-2 focus:ring-[#6D5FB1] outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[#757199] text-[10px] font-bold uppercase mb-2 block">開始時間</label>
              <div class="flex gap-2">
                <input v-model.number="editForm.hour" type="number" min="0" max="23" class="w-full bg-white border-none rounded-[18px] p-3 text-center font-bold text-[#6D5FB1]" />
                <span class="flex items-center text-[#6D5FB1]">:</span>
                <input v-model.number="editForm.minute" type="number" min="0" max="59" class="w-full bg-white border-none rounded-[18px] p-3 text-center font-bold text-[#6D5FB1]" />
              </div>
            </div>
            <div>
              <label class="text-[#757199] text-[10px] font-bold uppercase mb-2 block">預算 (JPY)</label>
              <input v-model.number="editForm.budget" type="number" class="w-full bg-white border-none rounded-[18px] p-3 text-[#6D5FB1] font-bold shadow-sm outline-none" />
            </div>
          </div>

          <div>
            <label class="text-[#757199] text-[10px] font-bold uppercase mb-2 block">地點</label>
            <input 
              v-model="editForm.location" 
              type="text" 
              :placeholder="editForm.isAtAccommodation ? '自動帶入飯店地址' : '輸入詳細地點或地址'"
              class="w-full bg-white border-none rounded-[18px] p-4 text-[#231F40] text-sm shadow-sm outline-none"
            />
          </div>

          <div>
            <label class="text-[#757199] text-[10px] font-bold uppercase mb-2 block">行程照片附件 (Firebase Storage)</label>
            <div class="flex flex-wrap gap-3">
              <div v-for="(url, idx) in editForm.images" :key="idx" class="relative group">
                <div 
                  class="w-20 h-20 rounded-[20px] bg-cover bg-center border-2 border-white shadow-sm"
                  :style="{ backgroundImage: `url(${url})` }"
                ></div>
                <button @click="removeImage(idx)" class="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">×</button>
              </div>

              <label v-if="!isUploading" class="w-20 h-20 rounded-[20px] border-2 border-dashed border-[#DEDAF4] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8F7FF] transition-colors">
                <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                <span class="text-[#6D5FB1] text-2xl">+</span>
                <span class="text-[9px] text-[#757199] font-bold">上傳照片</span>
              </label>

              <div v-else class="w-20 h-20 rounded-[20px] bg-white flex items-center justify-center border border-[#DEDAF4]">
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-[#6D5FB1] border-t-transparent"></div>
              </div>
            </div>
          </div>

          <div>
            <label class="text-[#757199] text-[10px] font-bold uppercase mb-2 block">備註 (Note)</label>
            <textarea v-model="editForm.note" rows="3" class="w-full bg-white border-none rounded-[18px] p-4 text-[#231F40] text-sm shadow-sm outline-none resize-none"></textarea>
          </div>

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
import { ref, watch } from 'vue'
import { useTripStore } from '../stores/tripStore'
import type { TripEvent } from '../types'
import { storage } from '../firebase' // 確保 firebase/index.ts 有 export storage
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const props = defineProps<{
  isOpen: boolean
  event: TripEvent | null
}>()

const emit = defineEmits(['close', 'save'])
const tripStore = useTripStore()

const editForm = ref<TripEvent>({} as TripEvent)
const isUploading = ref(false)

// 監聽傳入的事件進行初始化
watch(() => props.event, (newVal) => {
  if (newVal) {
    editForm.value = JSON.parse(JSON.stringify(newVal)) // 深拷貝，避免直接改到 Store
  }
}, { immediate: true })

// 處理 Firebase 照片上傳
const handleFileUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    // 建立路徑：trips/{tripId}/{eventId}/{timestamp}_{filename}
    const fileName = `${Date.now()}_${file.name}`
    const fileRef = storageRef(storage, `trips/${tripStore.tripName}/${editForm.value.id}/${fileName}`)
    
    const snapshot = await uploadBytes(fileRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    if (!editForm.value.images) editForm.value.images = []
    editForm.value.images.push(downloadURL)
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('照片上傳失敗，請檢查 Firebase Storage 權限設定。')
  } finally {
    isUploading.value = false
  }
}

const removeImage = (idx: number) => {
  editForm.value.images.splice(idx, 1)
}

const handleSave = () => {
  // 將修改後的資料同步回 Store
  const idx = tripStore.events.findIndex(e => e.id === editForm.value.id)
  if (idx !== -1) {
    tripStore.events[idx] = { ...editForm.value }
    tripStore.saveToCloud() // 觸發 Firebase Firestore 同步
  }
  emit('close')
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 隱藏 Number Input 的箭頭 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>