<template>
  <div class="info-view bg-[#EFEEF7] min-h-screen p-6 pb-32">
    <header class="mb-8">
      <h1 class="text-[#231F40] text-2xl font-extrabold mb-1">住宿指揮中心</h1>
      <p class="text-[#757199] text-sm font-medium">設定後，行程卡片將自動連動地址</p>
    </header>

    <div class="space-y-4">
      <div 
        v-for="(day, index) in tripStore.days" 
        :key="index"
        class="lodging-card bg-white p-5 rounded-[28px] shadow-sm border border-transparent focus-within:border-[#6D5FB1]/20 transition-all"
      >
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <span class="bg-[#6D5FB1] text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">
              {{ day.dayTitle }}
            </span>
            <span class="text-[#757199] text-[11px] font-bold uppercase tracking-wider">
              {{ day.displayLabel }}
            </span>
          </div>
          <div class="text-[#DEDAF4]">🏨</div>
        </div>

        <div class="mb-3">
          <label class="text-[10px] text-[#757199] font-black uppercase mb-1 block ml-1">飯店名稱</label>
          <input 
            v-if="tripStore.lodging[index]"
            v-model="tripStore.lodging[index].name" 
            placeholder="尚未輸入飯店..." 
            @change="tripStore.saveToCloud()"
            class="w-full bg-[#EFEEF7]/50 border-none rounded-[16px] p-3 text-[#231F40] font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#6D5FB1]/10 transition-all" 
          />
        </div>

        <div>
          <label class="text-[10px] text-[#757199] font-black uppercase mb-1 block ml-1">飯店地址 (Google Maps 連動用)</label>
          <input 
            v-if="tripStore.lodging[index]"
            v-model="tripStore.lodging[index].address" 
            placeholder="尚未輸入地址..." 
            @change="tripStore.saveToCloud()"
            class="w-full bg-[#EFEEF7]/50 border-none rounded-[16px] p-3 text-[#757199] font-medium text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#6D5FB1]/10 transition-all" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/tripStore'
const tripStore = useTripStore()
</script>

<style scoped>
.info-view {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 讓 iOS 點擊輸入框更滑順 */
input {
  -webkit-tap-highlight-color: transparent;
}
</style>