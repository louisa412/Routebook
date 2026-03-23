<template>
  <div class="timeline-container bg-[#EFEEF7]">
    <header class="timeline-header p-6 pb-2">
      <div class="trip-info flex items-center gap-2 cursor-pointer" @click="$emit('switch-trip')">
        <h1 class="text-[#231F40] text-2xl font-extrabold">{{ tripStore.tripName || '福岡之旅' }}</h1>
        <span class="text-[#6D5FB1] text-lg">▾</span>
      </div>
      <div class="trip-stats text-[#757199] text-xs font-bold mt-1 uppercase tracking-wide">
        {{ tripStore.days.length }} Days • 預算 ¥{{ (tripStore.totalBudget || 0).toLocaleString() }}
      </div>
    </header>

    <nav class="day-tabs flex gap-3 overflow-x-auto p-4 pb-6 no-scrollbar">
      <button 
        v-for="(day, index) in tripStore.days" :key="index"
        class="flex-shrink-0 w-[90px] h-[85px] rounded-[24px] border-none flex flex-col items-center justify-center transition-all duration-300 shadow-sm"
        :class="tripStore.currentDayIndex === index 
          ? 'bg-[#6D5FB1] text-white shadow-lg -translate-y-1' 
          : 'bg-white text-[#757199] hover:bg-[#DEDAF4]/30'"
        @click="tripStore.currentDayIndex = index"
      >
        <span class="text-[10px] font-bold opacity-80 mb-1 uppercase">{{ day.displayLabel }}</span>
        <span class="text-lg font-black" :class="tripStore.currentDayIndex === index ? 'text-white' : 'text-[#231F40]'">
          {{ day.dayTitle }}
        </span>
      </button>
    </nav>

    <main class="full-timeline px-4 pb-32">
      <div v-for="hour in 24" :key="hour - 1" class="hour-row flex min-h-[110px]">
        <div class="time-column w-14 flex flex-col items-end pr-4 relative">
          <span class="text-[11px] font-black text-[#757199] mt-1">{{ String(hour - 1).padStart(2, '0') }}:00</span>
          <div class="time-node w-2.5 h-2.5 rounded-full border-2 border-[#6D5FB1] bg-white absolute -right-[6px] top-2 z-10"></div>
          <div class="time-line absolute right-[-1px] top-4 bottom-[-4px] border-r-2 border-dashed border-[#DEDAF4]"></div>
        </div>

        <div class="event-column flex-1 pl-6 pb-6">
          <template v-if="getEventsByHour(hour - 1).length > 0">
            <div 
              v-for="event in getEventsByHour(hour - 1)" :key="event.id"
              class="event-card bg-white p-4 rounded-[28px] shadow-sm border-l-[6px] transition-transform active:scale-[0.98]" 
              :style="{ borderLeftColor: getCategoryColor(event.category) }"
              @click="$emit('edit', event)"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-[#231F40] text-[15px] font-black mb-1">{{ event.title }}</h3>
                  <p class="text-[#757199] text-[11px] font-medium flex items-center gap-1">
                    <span>📍</span> 
                    {{ event.isAtAccommodation ? (tripStore.lodging[tripStore.currentDayIndex]?.name || '住宿地點') : event.location }}
                  </p>
                  
                  <div v-if="event.images && event.images.length > 0" class="flex gap-2 mt-3">
                    <div 
                      v-for="(img, imgIdx) in event.images.slice(0, 3)" :key="imgIdx"
                      class="w-11 h-11 rounded-[12px] bg-cover bg-center border border-[#EFEEF7]"
                      :style="{ backgroundImage: `url(${img})` }"
                    ></div>
                    <div v-if="event.images.length > 3" class="h-11 px-2 rounded-[12px] bg-[#EFEEF7] flex items-center justify-center text-[10px] font-bold text-[#6D5FB1]">
                      +{{ event.images.length - 3 }}
                    </div>
                  </div>
                </div>

                <div v-if="event.budget > 0" class="bg-[#EFEEF7] text-[#6D5FB1] px-2 py-1 rounded-[10px] text-[11px] font-black ml-2">
                  ¥{{ event.budget.toLocaleString() }}
                </div>
              </div>
            </div>
          </template>

          <div v-else class="h-12 border-2 border-dashed border-[#DEDAF4] rounded-[20px] flex items-center justify-center cursor-pointer hover:bg-white/50 transition-colors" @click="addNewAtHour(hour - 1)">
            <span class="text-[#DEDAF4] text-xl font-light">+</span>
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

// 根據小時篩選行程
const getEventsByHour = (h: number) => {
  return tripStore.events.filter(e => 
    e.dateIndex === tripStore.currentDayIndex && e.hour === h
  )
}

const addNewAtHour = (h: number) => {
  emit('addNew', h) 
}

// 根據類別回傳顏色 (符合 J 人色系)
const getCategoryColor = (cat: string) => {
  const colors: Record<string, string> = {
    '美食': '#FFB067', // 暖橘
    '景點': '#7FA9FB', // 天藍
    '交通': '#8292D1', // 灰藍
    '購物': '#E993D1', // 粉紫
    '飯店': '#6BCB77'  // 嫩綠
  }
  return colors[cat] || '#DEDAF4'
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>