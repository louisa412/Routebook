<template>
  <div class="timeline-view">
    <div class="day-tabs">
      <button 
        v-for="(day, index) in tripStore.days" :key="index"
        :class="{ active: tripStore.currentDayIndex === index }"
        @click="tripStore.currentDayIndex = index"
      >
        <span class="day-num">Day {{ index + 1 }}</span>
        <span class="day-date">{{ day.date.split('-')[2] }}</span>
      </button>
    </div>

    <div class="full-timeline">
      <div v-for="hour in 24" :key="hour - 1" class="hour-row">
        <div class="time-label">
          {{ String(hour - 1).padStart(2, '0') }}:00
        </div>

        <div class="event-slot">
          <template v-if="getEventsByHour(hour - 1).length > 0">
            <div 
              v-for="event in getEventsByHour(hour - 1)" :key="event.id"
              class="event-card" 
              :class="getCategoryClass(event.category)"
              @click="$emit('edit', event)"
            >
              <div class="event-main">
                <span class="event-title">{{ event.title }}</span>
                <span class="event-loc">
                  📍 {{ event.isAtAccommodation ? (tripStore.lodging[event.dateIndex]?.name || '飯店') : event.location }}
                </span>
              </div>
              <div v-if="event.budget > 0" class="event-price">¥{{ event.budget.toLocaleString() }}</div>
            </div>
          </template>

          <div v-else class="empty-slot" @click="addNewAtHour(hour - 1)">
            <span class="plus-icon">+</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/tripStore'

const tripStore = useTripStore()
const emit = defineEmits(['edit', 'addNew'])

// 💡 核心邏輯：找出某個小時的所有行程
const getEventsByHour = (h: number) => {
  return tripStore.events.filter(e => 
    e.dateIndex === tripStore.currentDayIndex && e.hour === h
  )
}

// 💡 點擊空白格直接在該時段新增
const addNewAtHour = (h: number) => {
  // 這裡我們需要告訴 App.vue 預設的小時
  tripStore.currentDayIndex = tripStore.currentDayIndex // 確保日期對齊
  emit('addNew', h) 
}

const getCategoryClass = (cat: string) => {
  const map: Record<string, string> = {
    '美食': 'cat-food', '景點': 'cat-spot', '交通': 'cat-trans', '購物': 'cat-shop', '飯店': 'cat-hotel'
  }
  return map[cat] || ''
}
</script>

<style scoped>
.timeline-view { padding: 15px; background: var(--rt-bg); }

/* 日期導覽保持原樣 */
.day-tabs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 20px; }
.day-tabs button {
  flex-shrink: 0; width: 60px; height: 65px; border-radius: 18px; border: none;
  background: white; display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: 0.3s;
}
.day-tabs button.active { background: var(--rt-primary); color: white; transform: translateY(-3px); }

/* 24 小時網格系統 */
.full-timeline { display: flex; flex-direction: column; gap: 0; }
.hour-row { display: flex; min-height: 80px; gap: 15px; }

.time-label {
  width: 45px; font-size: 12px; font-weight: 800; color: var(--rt-muted);
  text-align: right; padding-top: 5px; position: relative;
}
/* 時間軸的小圓點連線 */
.time-label::after {
  content: ''; position: absolute; right: -9px; top: 12px; width: 6px; height: 6px;
  background: var(--rt-secondary); border-radius: 50%;
}

.event-slot {
  flex: 1; padding-bottom: 15px; border-left: 2px solid var(--rt-secondary);
  padding-left: 20px; margin-left: -1px;
}

.event-card {
  background: white; padding: 15px; border-radius: 20px; display: flex;
  justify-content: space-between; align-items: center; margin-bottom: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02); border-left: 5px solid #eee;
}
.event-main { display: flex; flex-direction: column; }
.event-title { font-weight: 800; color: var(--rt-text); font-size: 15px; }
.event-loc { font-size: 12px; color: var(--rt-muted); margin-top: 2px; }
.event-price { font-weight: 800; color: var(--rt-primary); font-size: 13px; }

/* 空白格設計 */
.empty-slot {
  height: 50px; border: 2px dashed rgba(109,95,177,0.1); border-radius: 15px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: 0.3s;
}
.empty-slot:hover { background: rgba(109,95,177,0.03); border-color: var(--rt-primary); }
.plus-icon { color: var(--rt-secondary); font-size: 20px; font-weight: 300; }

/* 分類顏色 */
.cat-food { border-left-color: #FF9F43; }
.cat-spot { border-left-color: #48DBFB; }
.cat-trans { border-left-color: #54a0ff; }
.cat-shop { border-left-color: #ff9ff3; }
.cat-hotel { border-left-color: #1dd1a1; }
</style>