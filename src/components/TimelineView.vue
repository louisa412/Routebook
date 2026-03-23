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

    <main class="px-4 pt-6 pb-32">
      <div v-for="hour in 24" :key="hour - 1" class="hour-row flex min-h-[80px]">
        <div class="time-column w-12 flex flex-col items-end pr-3 relative">
          <span class="text-[10px] font-black text-[#757199]/60 mt-0.5">{{ String(hour - 1).padStart(2, '0') }}:00</span>
          <div class="time-node w-2 h-2 rounded-full border-2 border-[#6D5FB1] bg-white absolute -right-[5px] top-1.5 z-10"></div>
          <div class="time-line absolute right-[-1px] top-4 bottom-[-4px] border-r border-dashed border-[#DEDAF4]"></div>
        </div>

        <div class="event-column flex-1 pl-5 pb-5">
          <template v-if="getEventsByHour(hour - 1).length > 0">
            <div 
              v-for="event in getEventsByHour(hour - 1)" :key="event.id"
              class="event-card bg-white p-4 rounded-[24px] shadow-sm border-l-[5px] mb-3 transition-all active:scale-[0.98]" 
              :style="{ borderLeftColor: getCategoryColor(event.category) }"
              @click="$emit('edit', event)"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span class="bg-[#EFEEF7] text-[#6D5FB1] text-[10px] font-black px-2 py-0.5 rounded-full">
                  {{ String(event.hour).padStart(2, '0') }}:{{ String(event.minute).padStart(2, '0') }}
                </span>
                <h3 class="text-[#231F40] text-[15px] font-black leading-tight">{{ event.title }}</h3>
              </div>

              <p class="text-[#757199] text-[11px] font-medium flex items-center gap-1 mb-2">
                <span class="opacity-50 text-[12px]">📍</span> 
                {{ event.isAtAccommodation ? (tripStore.lodging[tripStore.currentDayIndex]?.name || '住宿地點') : event.location }}
              </p>
              
              <div class="flex justify-between items-end">
                <div v-if="event.images && event.images.length > 0" class="flex gap-1.5">
                  <div 
                    v-for="(img, imgIdx) in event.images.slice(0, 3)" :key="imgIdx"
                    class="w-9 h-9 rounded-[10px] bg-cover bg-center border border-[#EFEEF7]"
                    :style="{ backgroundImage: `url(${img})` }"
                  ></div>
                  <div v-if="event.images.length > 3" class="h-9 w-9 rounded-[10px] bg-[#EFEEF7] flex items-center justify-center text-[9px] font-bold text-[#6D5FB1]">
                    +{{ event.images.length - 3 }}
                  </div>
                </div>
                <div v-else></div> <div v-if="event.budget > 0" class="text-[#6D5FB1] text-[11px] font-black flex items-center gap-0.5">
                  <span class="text-[9px] opacity-60">JPY</span> ¥{{ event.budget.toLocaleString() }}
                </div>
              </div>
            </div>
          </template>

          <div v-else class="h-10 border border-dashed border-[#DEDAF4]/40 rounded-[18px] flex items-center justify-center cursor-pointer hover:bg-white/40 transition-colors" @click="addNewAtHour(hour - 1)">
            <span class="text-[#DEDAF4] text-lg font-light">+</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/tripStore'

const tripStore = useTripStore()
const emit = defineEmits(['edit', 'addNew', 'switch-trip'])

// 根據小時與日期索引篩選行程，並依分鐘排序（確保 08:00 在 08:30 前面）
const getEventsByHour = (h: number) => {
  return tripStore.events
    .filter(e => e.dateIndex === tripStore.currentDayIndex && e.hour === h)
    .sort((a, b) => a.minute - b.minute)
}

const addNewAtHour = (h: number) => {
  emit('addNew', h) 
}

const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    '美食': '#FFB067', '景點': '#7FA9FB', '交通': '#8292D1', '購物': '#E993D1', '飯店': '#6BCB77'
  }
  return colors[cat] || '#DEDAF4'
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* 防止點擊時出現藍色框框 */
* { -webkit-tap-highlight-color: transparent; }
</style>