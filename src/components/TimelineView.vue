<template>
  <div class="timeline-container bg-[#EFEEF7] min-h-screen">
    <nav class="sticky top-0 z-30 bg-[#EFEEF7]/90 backdrop-blur-md p-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-[#6D5FB1]/5">
      <button 
        v-for="(day, index) in tripStore.days" :key="index"
        class="flex-shrink-0 w-[85px] h-[75px] rounded-[22px] border-none flex flex-col items-center justify-center transition-all duration-300"
        :class="tripStore.currentDayIndex === index 
          ? 'bg-[#6D5FB1] text-white shadow-lg shadow-[#6D5FB1]/20' 
          : 'bg-white text-[#757199]'"
        @click="tripStore.currentDayIndex = index"
      >
        <span class="text-[9px] font-bold opacity-80 uppercase mb-1">{{ day.displayLabel }}</span>
        <span class="text-base font-black">{{ day.dayTitle }}</span>
      </button>
    </nav>

<main class="px-4 pt-6 pb-32 relative">
  <div v-for="hour in 24" :key="hour - 1" class="hour-row flex h-[100px] border-t border-[#DEDAF4]/30 relative">
    <div class="time-column w-12 flex flex-col items-end pr-3">
      <span class="text-[10px] font-black text-[#757199]/60 mt-[-6px] bg-[#EFEEF7] px-1 z-10">
        {{ String(hour - 1).padStart(2, '0') }}:00
      </span>
    </div>
    <div class="absolute left-[48px] top-0 bottom-0 border-r border-dashed border-[#DEDAF4]"></div>
  </div>

  <div 
    v-for="event in currentDayEvents" :key="event.id"
    class="event-card absolute left-[65px] right-4 bg-white p-4 rounded-[24px] shadow-lg border-l-[6px] transition-all active:scale-[0.98] z-20 overflow-hidden"
    :style="getEventStyle(event)"
    @click="$emit('edit', event)"
  >
    <div class="flex items-center gap-2 mb-1">
      <span class="bg-[#EFEEF7] text-[#6D5FB1] text-[10px] font-black px-2 py-0.5 rounded-full">
        {{ event.startTime }} - {{ event.endTime }}
      </span>
    </div>
    <h3 class="text-[#231F40] text-[14px] font-black truncate">{{ event.title }}</h3>
    <p class="text-[#757199] text-[10px] flex items-center gap-1 opacity-80 mt-1">📍 {{ event.location }}</p>
  </div>
</main>

<script setup lang="ts">
// ... 保留現有的 import
import { computed } from 'vue'

const currentDayEvents = computed(() => {
  return tripStore.events.filter(e => e.day === tripStore.currentDayIndex)
})

// 💡 關鍵：計算卡片的絕對位置與高度
const getEventStyle = (event: any) => {
  const hourHeight = 100 // 必須與 hour-row 的 h-[100px] 一致
  
  const [startH, startM] = event.startTime.split(':').map(Number)
  const [endH, endM] = event.endTime.split(':').map(Number)
  
  const top = (startH + startM / 60) * hourHeight
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  const height = (durationMinutes / 60) * hourHeight

  return {
    top: `${top}px`,
    height: `${Math.max(height, 60)}px`, // 最小高度 60px 避免文字擠壓
    borderLeftColor: getCategoryColor(event.category)
  }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
* { -webkit-tap-highlight-color: transparent; }
</style>
