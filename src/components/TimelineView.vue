<template>
  <div class="timeline-container bg-[#EFEEF7] min-h-screen relative">
    <nav class="sticky top-0 z-30 bg-[#EFEEF7]/90 backdrop-blur-md p-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-[#6D5FB1]/5">
      <button
        v-for="(day, index) in tripStore.days" :key="index"
        class="flex-shrink-0 w-[85px] h-[75px] rounded-[22px] border-none flex flex-col items-center justify-center transition-all duration-300"
        :class="tripStore.currentDayIndex === index ? 'bg-[#6D5FB1] text-white shadow-lg shadow-[#6D5FB1]/20' : 'bg-white text-[#757199]'"
        @click="tripStore.currentDayIndex = index"
      >
        <span class="text-[9px] font-bold opacity-80 uppercase mb-1">{{ day.displayLabel }}</span>
        <span class="text-base font-black">{{ day.dayTitle }}</span>
      </button>
    </nav>

    <main class="px-4 pt-6 pb-40 relative">
      <!-- 時間格線 -->
      <div v-for="hour in 24" :key="hour - 1" class="flex h-[120px] border-t border-[#DEDAF4]/30 relative">
        <div class="w-36 flex flex-col items-end pr-3 flex-shrink-0">
          <span
            v-if="!occupiedHours.has(hour - 1)"
            class="text-[10px] font-black text-[#757199]/60 mt-[-6px] bg-[#EFEEF7] px-1 z-10 relative"
          >
            {{ String(hour - 1).padStart(2, '0') }}:00
          </span>
        </div>
        <div class="flex-1 relative cursor-pointer hover:bg-[#6D5FB1]/5 transition-colors rounded-r-lg"
          @click="$emit('addNew', hour - 1)">
          <div class="absolute left-0 top-0 bottom-0 border-l-2 border-[#DEDAF4]/60"></div>
        </div>
      </div>

      <!-- 區段事件（中線右側） -->
      <div
        v-for="event in rangeEvents" :key="event.id"
        class="absolute left-[148px] right-4 bg-white px-3 py-2.5 rounded-[20px] shadow-lg border-l-[6px] transition-all active:scale-[0.98] z-20 overflow-hidden cursor-pointer"
        :style="getRangeStyle(event)"
        @click.stop="$emit('edit', event)"
      >
        <div class="flex items-center gap-2 min-w-0 mb-1">
          <span class="bg-[#EFEEF7] text-[#6D5FB1] text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
            {{ event.startTime }}–{{ event.endTime }}
          </span>
          <button
            v-if="tripStore.getResolvedEventLocation(event)"
            type="button"
            class="text-[#757199] text-[10px] flex items-center gap-0.5 min-w-0 overflow-hidden flex-1"
            @click.stop="openLocationInMaps(event)"
          >
            <span class="flex-shrink-0">📍</span>
            <span class="truncate ml-0.5">{{ tripStore.getResolvedEventLocation(event) }}</span>
          </button>
        </div>
        <h3 class="text-[#231F40] text-[13px] font-black truncate">{{ event.title }}</h3>
      </div>

      <!-- 點狀事件（中線左側） -->
      <div
        v-for="event in pointEvents" :key="event.id"
        class="absolute left-0 z-20"
        :style="getPointStyle(event)"
      >
        <div
          class="flex flex-col items-end cursor-pointer"
          style="width: 160px;"
          @click.stop="togglePoint(event.id)"
        >
          <span class="text-[11px] font-black pr-2"
            :style="{ color: getCategoryColor(event.category) }">
            {{ event.startTime }}
          </span>
          <span class="text-[10px] font-black text-[#231F40] pr-2 text-right leading-tight truncate w-full">
            {{ event.title }}
          </span>
        </div>
        <!-- 展開地點：出現在時間軸右側 -->
        <div
          v-if="expandedPointId === event.id && tripStore.getResolvedEventLocation(event)"
          class="absolute bg-white rounded-[14px] shadow-lg px-3 py-2.5 text-left z-30 w-44"
          style="left: 168px; top: -4px;"
        >
          <button
            type="button"
            class="text-[10px] text-[#757199] flex items-start gap-1 w-full"
            @click.stop="openLocationInMaps(event)"
          >
            <span class="flex-shrink-0">📍</span>
            <span class="leading-tight">{{ tripStore.getResolvedEventLocation(event) }}</span>
          </button>
          <button
            type="button"
            class="mt-1.5 text-[10px] text-[#6D5FB1] font-bold w-full text-right"
            @click.stop="$emit('edit', event)"
          >編輯 →</button>
        </div>
        <!-- 中線上的點 -->
        <div
          class="absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
          style="right: -5px; top: 4px;"
          :style="{ backgroundColor: getCategoryColor(event.category) }"
        ></div>
      </div>
    </main>

    <button
      @click="$emit('addNew', 9)"
      class="fixed bottom-36 right-6 z-30 w-14 h-14 bg-[#6D5FB1] text-white rounded-full shadow-xl shadow-[#6D5FB1]/30 text-2xl flex items-center justify-center active:scale-90 transition-all"
    >+</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripStore } from '../stores/useTripStore'
import type { EventCategory, TripEvent } from '../types'
import { openGoogleMaps } from '../utils/maps'

const tripStore = useTripStore()
defineEmits(['edit', 'addNew'])

const HOUR_HEIGHT = 120
const expandedPointId = ref<string | null>(null)

const togglePoint = (id: string) => {
  expandedPointId.value = expandedPointId.value === id ? null : id
}

const currentDayEvents = computed(() => tripStore.events.filter(e => e.day === tripStore.currentDayIndex))
const rangeEvents = computed(() => currentDayEvents.value.filter(e => (e.eventType ?? 'range') === 'range'))
const pointEvents = computed(() => currentDayEvents.value.filter(e => e.eventType === 'point'))

const occupiedHours = computed(() =>
  new Set(pointEvents.value.map(e => parseInt(e.startTime.split(':')[0])))
)

const openLocationInMaps = (event: TripEvent) => {
  const loc = tripStore.getResolvedEventLocation(event)
  if (loc) openGoogleMaps(loc)
}

const getRangeStyle = (event: TripEvent) => {
  const [startH, startM] = event.startTime.split(':').map(Number)
  const [endH, endM] = event.endTime.split(':').map(Number)
  const top = (startH + startM / 60) * HOUR_HEIGHT + 24
  const durationMin = (endH * 60 + endM) - (startH * 60 + startM)
  const height = (durationMin / 60) * HOUR_HEIGHT
  return { top: `${top}px`, height: `${Math.max(height, 52)}px`, borderLeftColor: getCategoryColor(event.category) }
}

const getPointStyle = (event: TripEvent) => {
  const [h, m] = event.startTime.split(':').map(Number)
  return { top: `${(h + m / 60) * HOUR_HEIGHT + 24 - 10}px` }
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
