<template>
  <div>
    <label class="text-[#757199] text-[10px] font-bold uppercase tracking-widest mb-2 block">行程照片</label>
    <div class="flex flex-wrap gap-3">
      <div v-for="(url, idx) in modelValue" :key="idx" class="relative">
        <div
          class="w-20 h-20 rounded-[20px] bg-cover bg-center border-2 border-white shadow-sm cursor-pointer"
          :style="{ backgroundImage: `url(${url})` }"
          @click="$emit('preview', url)"
        ></div>
        <button @click="removeImage(idx)"
          class="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">×</button>
      </div>
      <label v-if="!isUploading"
        class="w-20 h-20 rounded-[20px] border-2 border-dashed border-[#DEDAF4] bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8F7FF] transition-colors">
        <input type="file" class="hidden" accept="image/*" @change="handleUpload" />
        <span class="text-[#6D5FB1] text-2xl">+</span>
        <span class="text-[9px] text-[#757199] font-bold">上傳照片</span>
      </label>
      <div v-else class="w-20 h-20 rounded-[20px] bg-white flex items-center justify-center border border-[#DEDAF4]">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-[#6D5FB1] border-t-transparent"></div>
      </div>
    </div>

    <!-- 全螢幕預覽 -->
    <div v-if="previewUrl" class="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" @click="previewUrl = null">
      <img :src="previewUrl" class="max-w-full max-h-full object-contain rounded-lg" />
      <button class="absolute top-6 right-6 text-white text-3xl leading-none">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ modelValue: string[]; storagePath: string }>()
const emit = defineEmits<{ 'update:modelValue': [string[]]; preview: [string] }>()
const isUploading = ref(false)
const previewUrl = ref<string | null>(null)

const CLOUD_NAME = 'dorwexx0o'
const UPLOAD_PRESET = 'Rootbook'

const handleUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', props.storagePath)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || '上傳失敗')
    emit('update:modelValue', [...props.modelValue, data.secure_url])
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('照片上傳失敗，請檢查網路連線。')
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
