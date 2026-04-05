<template>
  <div class="timeline-container bg-[#EFEEF7] min-h-screen">

    <!-- 日期選擇列 -->
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
      <!-- 時間軸格線 -->
      <div v-for="hour in 24" :key="hour - 1" class="hour-row flex h-[100px] border-t border-[#DEDAF4]/30 relative">
        <div class="time-column w-12 flex flex-col items-end pr-3">
          <span class="text-[10px] font-black text-[#757199]/60 mt-[-6px] bg-[#EFEEF7] px-1 z-10">
            {{ String(hour - 1).padStart(2, '0') }}:00
          </span>
        </div>
        <div class="absolute left-[48px] top-0 bottom-0 border-r border-dashed border-[#DEDAF4]"></div>
      </div>

      <!-- 區段事件（range） -->
      <div
        v-for="event in rangeEvents" :key="event.id"
        class="event-card absolute left-[65px] right-4 bg-white p-4 rounded-[24px] shadow-lg border-l-[6px] transition-all active:scale-[0.98] z-20 overflow-hidden cursor-pointer"
        :style="getRangeStyle(event)"
        @click="$emit('edit', event)"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="bg-[#EFEEF7] text-[#6D5FB1] text-[10px] font-black px-2 py-0.5 rounded-full">
            {{ event.startTime }} – {{ event.endTime }}
          </span>
        </div>
        <h3 class="text-[#231F40] text-[14px] font-black truncate">{{ event.title }}</h3>
        <button
          v-if="tripStore.getResolvedEventLocation(event)"
          type="button"
          class="text-[#757199] text-[10px] flex items-center gap-1 opacity-80 mt-1"
          @click.stop="openLocationInMaps(event)"
        >
          📍 {{ tripStore.getResolvedEventLocation(event) }}
        </button>
      </div>

      <!-- 點狀事件（point） -->
      <div
        v-for="event in pointEvents" :key="event.id"
        class="point-event absolute left-[52px] right-4 z-20 flex items-center gap-2 cursor-pointer"
        :style="getPointStyle(event)"
        @click="$emit('edit', event)"
      >
        <!-- 時間點標記 -->
        <div class="flex-shrink-0 flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" :style="{ backgroundColor: getCategoryColor(event.category) }"></div>
          <span class="text-[11px] font-black text-[#757199]">{{ event.startTime }}</span>
        </div>
        <!-- 內容 pill -->
        <div
          class="flex-1 flex items-center gap-2 px-3 py-2 rounded-[14px] border-l-[4px] shadow-sm min-w-0"
          :style="{ backgroundColor: getCategoryColor(event.category) + '18', borderLeftColor: getCategoryColor(event.category) }"
        >
          <span class="text-[#231F40] text-[13px] font-black truncate">{{ event.title }}</span>
          <span v-if="tripStore.getResolvedEventLocation(event)" class="text-[10px] text-[#757199] truncate hidden sm:block">
            {{ tripStore.getResolvedEventLocation(event) }}
          </span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '../stores/useTripStore'
import type { EventCategory, TripEvent } from '../types'
import { openGoogleMaps } from '../utils/maps'

const tripStore = useTripStore()
defineEmits(['edit', 'addNew'])

const HOUR_HEIGHT = 100

const currentDayEvents = computed(() =>
  tripStore.events.filter(e => e.day === tripStore.currentDayIndex)
)

const rangeEvents = computed(() =>
  currentDayEvents.value.filter(e => (e.eventType ?? 'range') === 'range')
)

const pointEvents = computed(() =>
  currentDayEvents.value.filter(e => e.eventType === 'point')
)

const openLocationInMaps = (event: TripEvent) => {
  const loc = tripStore.getResolvedEventLocation(event)
  if (loc) openGoogleMaps(loc)
}

// 區段事件：有高度的卡片
const getRangeStyle = (event: TripEvent) => {
  const [startH, startM] = event.startTime.split(':').map(Number)
  const [endH, endM] = event.endTime.split(':').map(Number)
  const top = (startH + startM / 60) * HOUR_HEIGHT + 24
  const durationMin = (endH * 60 + endM) - (startH * 60 + startM)
  const height = (durationMin / 60) * HOUR_HEIGHT
  return {
    top: `${top}px`,
    height: `${Math.max(height, 65)}px`,
    borderLeftColor: getCategoryColor(event.category)
  }
}

// 點狀事件：固定高度的細 pill
const getPointStyle = (event: TripEvent) => {
  const [h, m] = event.startTime.split(':').map(Number)
  const top = (h + m / 60) * HOUR_HEIGHT + 24 - 14  // 垂直置中在時間線上
  return { top: `${top}px` }
}

const getCategoryColor = (cat: EventCategory) => {
  const colors: Record<string, string> = {
    food: '#FFB067', spot: '#7FA9FB', transport: '#8292D1',
    shopping: '#E993D1', hotel: '#6BCB77', todo: '#DEDAF4'
  }
  return colors[cat] || '#DEDAF4'
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
