<template>
  <div>
    <label class="text-[#757199] text-[10px] font-bold uppercase mb-2 block">行程照片附件</label>
    <div class="flex flex-wrap gap-3">
      <div v-for="(url, idx) in modelValue" :key="idx" class="relative">
        <div
          class="w-20 h-20 rounded-[20px] bg-cover bg-center border-2 border-white shadow-sm"
          :style="{ backgroundImage: `url(${url})` }"
        ></div>
        <button
          @click="removeImage(idx)"
          class="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
        >×</button>
      </div>

      <label
        v-if="!isUploading"
        class="w-20 h-20 rounded-[20px] border-2 border-dashed border-[#DEDAF4] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8F7FF] transition-colors"
      >
        <input type="file" class="hidden" accept="image/*" @change="handleUpload" />
        <span class="text-[#6D5FB1] text-2xl">+</span>
        <span class="text-[9px] text-[#757199] font-bold">上傳照片</span>
      </label>

      <div v-else class="w-20 h-20 rounded-[20px] bg-white flex items-center justify-center border border-[#DEDAF4]">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-[#6D5FB1] border-t-transparent"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storage } from '../firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const props = defineProps<{
  modelValue: string[]
  storagePath: string   // 例如 `trips/福岡/event-123`
}>()

const emit = defineEmits<{
  'update:modelValue': [string[]]
}>()

const isUploading = ref(false)

const handleUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const fileRef = storageRef(storage, `${props.storagePath}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(fileRef, file)
    const url = await getDownloadURL(snapshot.ref)
    emit('update:modelValue', [...props.modelValue, url])
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('照片上傳失敗，請檢查網路或 Firebase 設定。')
  } finally {
    isUploading.value = false
  }
}

const removeImage = (idx: number) => {
  const updated = [...props.modelValue]
  updated.splice(idx, 1)
  emit('update:modelValue', updated)
}
</script>
