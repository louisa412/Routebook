<template>
  <div class="timeline-container">
    <header class="timeline-header">
      <div class="trip-info" @click="$emit('switch-trip')">
        <h1 class="trip-title">{{ tripStore.tripName || '福岡之旅' }}</h1>
        <span class="trip-chevron">▾</span>
      </div>
      <div class="trip-stats">
        {{ tripStore.days.length }} Days • 預算 ¥{{ (tripStore.totalBudget || 0).toLocaleString() }}
      </div>
    </header>

    <nav class="day-tabs">
      <button 
        v-for="(_, index) in tripStore.days" :key="index"
        :class="{ active: tripStore.currentDayIndex === index }"
        @click="tripStore.currentDayIndex = index"
      >
        <span class="day-label">DAY</span>
        <span class="day-number">{{ index + 1 }}</span>
      </button>
    </nav>

    <main class="full-timeline">
      <div v-for="hour in 24" :key="hour - 1" class="hour-row">
        <div class="time-column">
          <span class="time-text">{{ String(hour - 1).padStart(2, '0') }}:00</span>
          <div class="time-node"></div>
        </div>

        <div class="event-column">
          <template v-if="getEventsByHour(hour - 1).length > 0">
            <div 
              v-for="event in getEventsByHour(hour - 1)" :key="event.id"
              class="event-card" 
              :class="getCategoryClass(event.category)"
              @click="$emit('edit', event)"
            >
              <div class="event-layout">
                <div class="event-main">
                  <h3 class="event-title">{{ event.title }}</h3>
                  <p class="event-location">
                    <span class="icon">📍</span> 
                    {{ event.isAtAccommodation ? (tripStore.lodging[tripStore.currentDayIndex]?.name || '住宿地點') : event.location }}
                  </p>
                  
                  <div v-if="event.images && event.images.length > 0" class="event-attachments">
                    <div 
                      v-for="(img, imgIdx) in event.images.slice(0, 3)" :key="imgIdx"
                      class="img-thumb"
                      :style="{ backgroundImage: `url(${img})` }"
                    ></div>
                    <span v-if="event.images.length > 3" class="img-more">+{{ event.images.length - 3 }}</span>
                  </div>
                </div>

                <div v-if="event.budget > 0" class="event-badge">
                  ¥{{ event.budget.toLocaleString() }}
                </div>
              </div>
            </div>
          </template>

          <div v-else class="empty-slot" @click="addNewAtHour(hour - 1)">
            <span class="plus-icon">+</span>
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

// 邏輯：篩選該小時行程
const getEventsByHour = (h: number) => {
  return tripStore.events.filter(e => 
    e.dateIndex === tripStore.currentDayIndex && e.hour === h
  )
}

// 邏輯：新增行程
const addNewAtHour = (h: number) => {
  emit('addNew', h) 
}

// 樣式映射
const getCategoryClass = (cat: string) => {
  const map: Record<string, string> = {
    '美食': 'cat-food', '景點': 'cat-spot', '交通': 'cat-trans', '購物': 'cat-shop', '飯店': 'cat-hotel'
  }
  return map[cat] || ''
}
</script>

<style scoped>
.timeline-container {
  min-height: 100vh;
  background: var(--rt-bg);
  padding: 20px 16px 120px 16px;
}

/* Header */
.timeline-header { margin-bottom: 24px; padding-left: 8px; }
.trip-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.trip-title { font-size: 24px; font-weight: 800; color: var(--rt-text); margin: 0; }
.trip-chevron { color: var(--rt-primary); font-size: 18px; }
.trip-stats { font-size: 13px; color: var(--rt-muted); margin-top: 4px; font-weight: 600; }

/* Day Tabs */
.day-tabs { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 24px; scrollbar-width: none; }
.day-tabs::-webkit-scrollbar { display: none; }
.day-tabs button {
  flex-shrink: 0; width: 64px; height: 72px; border-radius: 22px; border: none;
  background: white; display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 4px 15px rgba(109, 95, 177, 0.05); transition: 0.3s;
}
.day-tabs button.active { background: var(--rt-primary); transform: translateY(-4px); }
.day-tabs button.active span { color: white; }
.day-label { font-size: 10px; font-weight: 700; color: var(--rt-muted); }
.day-number { font-size: 18px; font-weight: 800; color: var(--rt-text); }

/* Timeline Grid */
.hour-row { display: flex; min-height: 100px; }
.time-column { width: 50px; display: flex; flex-direction: column; align-items: flex-end; padding-right: 15px; position: relative; }
.time-column::after {
  content: ''; position: absolute; right: -1px; top: 15px; bottom: -15px;
  border-right: 2px dashed var(--rt-secondary);
}
.time-text { font-size: 12px; font-weight: 700; color: var(--rt-muted); margin-top: 4px; }
.time-node {
  width: 10px; height: 10px; background: white; border: 2px solid var(--rt-primary);
  border-radius: 50%; position: absolute; right: -5px; top: 6px; z-index: 2;
}

/* Event Card */
.event-column { flex: 1; padding-left: 20px; padding-bottom: 20px; }
.event-card {
  background: white; padding: 16px; border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 25px rgba(109, 95, 177, 0.06);
  transition: transform 0.2s;
}
.event-layout { display: flex; justify-content: space-between; align-items: flex-start; }
.event-main { flex: 1; }
.event-title { font-size: 16px; font-weight: 800; color: var(--rt-text); margin: 0 0 4px 0; }
.event-location { font-size: 12px; color: var(--rt-muted); margin: 0; display: flex; align-items: center; gap: 4px; }

/* 圖片附件樣式 */
.event-attachments { display: flex; gap: 6px; margin-top: 10px; align-items: center; }
.img-thumb {
  width: 44px; height: 44px; border-radius: 10px;
  background-size: cover; background-position: center;
  border: 1px solid var(--rt-bg);
}
.img-more { font-size: 11px; font-weight: 700; color: var(--rt-muted); background: var(--rt-bg); padding: 4px 8px; border-radius: 8px; }

.event-badge {
  background: var(--rt-bg); padding: 4px 10px; border-radius: 12px;
  font-size: 12px; font-weight: 800; color: var(--rt-primary); margin-left: 10px;
}

/* Empty Slot */
.empty-slot {
  height: 48px; border: 2px dashed rgba(109, 95, 177, 0.15); border-radius: 16px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.plus-icon { color: var(--rt-secondary); font-size: 24px; }

/* Category Colors */
.cat-food { border-left: 6px solid #FFB067; }
.cat-spot { border-left: 6px solid #7FA9FB; }
.cat-trans { border-left: 6px solid #8292D1; }
.cat-shop { border-left: 6px solid #E993D1; }
.cat-hotel { border-left: 6px solid #6BCB77; }
</style>