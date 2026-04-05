<template>
  <div class="info-view px-5 py-6">
    <h2 class="text-[#231F40] text-2xl font-black mb-6">住宿安排</h2>

    <div class="space-y-4">
      <div 
        v-for="(day, index) in tripStore.days" 
        :key="index"
        class="hotel-card bg-white p-5 rounded-[28px] shadow-sm border border-[#6D5FB1]/5 flex gap-4 items-center"
      >
        <div class="day-badge bg-[#EFEEF7] w-14 h-14 rounded-[20px] flex flex-col items-center justify-center flex-shrink-0">
          <span class="text-[#6D5FB1] text-[10px] font-black uppercase">{{ day.weekday }}</span>
          <span class="text-[#6D5FB1] text-lg font-black">{{ index + 1 }}</span>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[#757199] text-[10px] font-bold uppercase tracking-widest mb-1">
            {{ day.displayLabel }} 住宿
          </p>
          <h3 class="text-[#231F40] text-base font-black truncate">
            {{ tripStore.lodging[index]?.name || '尚未設定飯店' }}
          </h3>
          <p class="text-[#757199] text-xs truncate opacity-70">
            {{ tripStore.lodging[index]?.address || '點擊編輯地址' }}
          </p>
        </div>

        <button class="w-10 h-10 rounded-full bg-[#F8F7FF] text-[#6D5FB1] flex items-center justify-center">
          📍
        </button>
      </div>
    </div>

    <div class="mt-8 p-6 bg-[#6D5FB1]/5 rounded-[24px] border border-dashed border-[#6D5FB1]/20">
      <p class="text-[#6D5FB1] text-xs font-bold leading-relaxed">
        💡 Routebook 提醒：住宿資訊會自動連動至時間軸中標記為「飯店」或「住宿」的行程卡片。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/useTripStore'
const tripStore = useTripStore()
</script>

<style scoped>
.info-view {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
