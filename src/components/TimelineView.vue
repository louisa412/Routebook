<template>
  <div class="timeline-page">
    <div class="day-tabs">
      <button v-for="(day, i) in tripStore.days" :key="i" 
              @click="tripStore.currentDayIndex = i" 
              :class="{ active: tripStore.currentDayIndex === i }">
        <span class="day-weekday">{{ day.weekday }}</span>
        <span class="day-date">{{ formatDate(day.date) }}</span>
      </button>
    </div>

    <div class="timeline-container">
      <div class="timeline-line"></div>
      
      <div v-for="hour in 24" :key="hour" class="hour-row">
        <div class="time-label">{{ (hour - 1).toString().padStart(2, '0') }}:00</div>
        
        <div class="event-box">
          <div v-for="(event, index) in filteredEvents(hour - 1)" 
               :key="event.id || index"
               @click="$emit('edit', event)" 
               class="event-card">
            <div class="timeline-dot"></div>
            
            <div class="card-header">
              <span class="cat-tag">{{ event.category }}</span>
              <span class="time-text-inline">
                {{ event.hour }}:{{ event.minute.toString().padStart(2,'0') }}
              </span>
              <span v-if="event.budget > 0" class="price-tag">¥ {{ event.budget.toLocaleString() }}</span>
            </div>

            <h3 class="event-title">{{ event.title }}</h3>
            
            <p v-if="event.note" class="event-note">{{ event.note }}</p>

            <div v-if="event.images?.length" class="event-images">
              <img v-for="(img, idx) in event.images" :key="idx" 
                   :src="img" @click.stop="previewImg = img" class="thumb" />
            </div>

            <div class="event-footer">
              <span class="loc-text" @click.stop="openMap(event.location)">
                📍 {{ event.location }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="fab-add" @click="$emit('addNew')">+</button>

    <div v-if="previewImg" class="img-modal" @click="previewImg = ''">
      <img :src="previewImg" class="full-img" />
      <p class="close-tip">點擊任何處關閉</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTripStore } from '../stores/tripStore'
import type { TripEvent } from '../types'

const tripStore = useTripStore()
const previewImg = ref('')

// 定義事件發送
defineEmits<{
  (e: 'edit', event: TripEvent): void
  (e: 'addNew'): void
}>()

// 邏輯：過濾該小時行程
const filteredEvents = (hour: number): TripEvent[] => {
  return tripStore.events.filter(e => e.dateIndex === tripStore.currentDayIndex && e.hour === hour)
}

// 邏輯：日期格式化
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return dateString.substring(5).replace('-', '/')
}

// 💡 修正 2：徹底修復 Google Map 連結與語法黃點
const openMap = (location: string): void => {
  if (!location) return
  const encodedLocation = encodeURIComponent(location)
  // 修正變數插值語法，確保使用 ${}
  const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
  window.open(url, '_blank')
}
</script>

<style scoped>
/* 樣式保持 iOS 質感 */
.timeline-page { --rt-primary: #6D5FB1; --rt-secondary: #DEDAF4; --rt-muted: #757199; --rt-text: #231F40; position: relative; }
.day-tabs { display: flex; gap: 10px; padding: 10px 20px; overflow-x: auto; scrollbar-width: none; }
.day-tabs::-webkit-scrollbar { display: none; }
.day-tabs button { padding: 10px; min-width: 65px; border-radius: 16px; border: 1px solid rgba(109, 95, 177, 0.1); background: white; color: var(--rt-muted); cursor: pointer; }
.day-tabs button.active { background: var(--rt-primary); color: white; }
.day-weekday { display: block; font-size: 10px; font-weight: 800; }
.day-date { display: block; font-size: 14px; font-weight: 800; }

.timeline-container { position: relative; padding: 20px; }
.timeline-line { position: absolute; left: 62px; top: 0; bottom: 0; width: 2px; background: var(--rt-secondary); opacity: 0.4; }
.hour-row { display: flex; min-height: 80px; }
.time-label { width: 50px; font-size: 12px; color: var(--rt-primary); font-weight: 800; padding-top: 15px; text-align: right; margin-right: 12px; }
.event-box { flex: 1; padding-left: 25px; }

.event-card { background: white; border-radius: 20px; padding: 16px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(109, 95, 177, 0.05); position: relative; cursor: pointer; }
.timeline-dot { position: absolute; left: -32px; top: 22px; width: 12px; height: 12px; border-radius: 50%; background: white; border: 3px solid var(--rt-primary); z-index: 2; }

.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.cat-tag { background: var(--rt-secondary); color: var(--rt-primary); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; }
.time-text-inline { font-size: 12px; font-weight: 800; color: var(--rt-primary); background: #F0EDFF; padding: 4px 8px; border-radius: 8px; }
.price-tag { margin-left: auto; color: var(--rt-primary); font-weight: 800; font-size: 14px; }

.event-title { font-size: 17px; font-weight: 800; margin: 0 0 8px 0; color: var(--rt-text); }
.event-note { font-size: 13px; color: var(--rt-muted); background: #F8F7FF; padding: 10px; border-radius: 12px; margin-bottom: 10px; line-height: 1.4; border-left: 3px solid var(--rt-secondary); }

.event-images { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; }
.thumb { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }

.event-footer { border-top: 1px solid #F0F0F0; padding-top: 10px; }
.loc-text { font-size: 13px; color: var(--rt-muted); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

.fab-add { position: fixed; bottom: 120px; right: 25px; width: 60px; height: 60px; border-radius: 30px; background: var(--rt-primary); color: white; border: none; font-size: 32px; box-shadow: 0 10px 25px rgba(109, 95, 177, 0.4); cursor: pointer; z-index: 99; }

.img-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; flex-direction: column; justify-content: center; align-items: center; }
.full-img { max-width: 95%; max-height: 85%; border-radius: 12px; }
.close-tip { color: white; margin-top: 20px; opacity: 0.7; }
</style>
<div class="event-location">
  {{ event.isAtAccommodation ? tripStore.lodging[event.dateIndex].name : event.location }}
</div>