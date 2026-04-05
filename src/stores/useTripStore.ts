import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripEvent, TripDay } from '../types'
import { FUKUOKA_EVENTS, FUKUOKA_LODGING } from '../data/fukuokaData'
import { resolveEventLocation } from '../utils/location'
import { normalizeEvent, normalizeLodging } from './helpers'

export const useTripStore = defineStore('trip', () => {
  // ── 行程基本資訊 ──────────────────────────────────────────────
  const tripName = ref('福岡春季漫遊 2026')
  const startDate = ref('2026-04-08')
  const totalDays = ref(6)
  const currentDayIndex = ref(0)

  // ── 活動 ──────────────────────────────────────────────────────
  const events = ref<TripEvent[]>(
    FUKUOKA_EVENTS.map((event, index) =>
      normalizeEvent(event, `event-${Date.now()}-${index}`)
    )
  )

  // ── 住宿 ──────────────────────────────────────────────────────
  const lodging = ref<Record<number, { name: string; address: string }>>({
    ...FUKUOKA_LODGING
  })

  // ── 預算 ──────────────────────────────────────────────────────
  const totalBudget = ref(50000)
  const totalSpent = computed(() =>
    events.value.reduce((sum, e) => sum + (Number(e.price) || 0), 0)
  )

  // ── 天數列表（computed）──────────────────────────────────────
  const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const days = computed<TripDay[]>(() =>
    Array.from({ length: totalDays.value }, (_, i) => {
      const d = new Date(startDate.value)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = DAY_LABELS[d.getDay()]
      return {
        date: dateStr,
        weekday: dayLabel,
        displayLabel: `${dateStr.split('-')[1]}/${dateStr.split('-')[2]} (${dayLabel})`,
        dayTitle: `Day ${i + 1}`
      }
    })
  )

  // ── 活動 CRUD ────────────────────────────────────────────────
  let _saveToCloud: () => void = () => {}
  const setSaveToCloud = (fn: () => void) => { _saveToCloud = fn }

  const addEvent = (event: TripEvent) => {
    events.value.push(normalizeEvent(event, `event-${Date.now()}`))
    _saveToCloud()
  }

  const updateEvent = (updatedEvent: TripEvent) => {
    const index = events.value.findIndex((e) => e.id === updatedEvent.id)
    if (index === -1) return
    events.value[index] = normalizeEvent(updatedEvent, updatedEvent.id)
    _saveToCloud()
  }

  const deleteEvent = (id: string) => {
    events.value = events.value.filter((e) => e.id !== id)
    _saveToCloud()
  }

  // ── 住宿 ────────────────────────────────────────────────────
  const updateLodging = (day: number, payload: { name: string; address: string }) => {
    lodging.value = {
      ...lodging.value,
      [day]: { name: payload.name || '', address: payload.address || '' }
    }
    _saveToCloud()
  }

  const getResolvedEventLocation = (event: TripEvent): string =>
    resolveEventLocation(event, lodging.value)

  // ── 從雲端載入（由 useFirebaseSync 呼叫）─────────────────────
  const loadFromCloud = (data: Record<string, any>) => {
    if (data.tripName) tripName.value = data.tripName
    if (data.startDate) startDate.value = data.startDate
    if (data.totalDays) totalDays.value = data.totalDays
    if (data.totalBudget) totalBudget.value = Number(data.totalBudget) || 0
    if (Array.isArray(data.events)) {
      events.value = data.events.map((event: any, i: number) =>
        normalizeEvent(event, `cloud-event-${Date.now()}-${i}`)
      )
    }
    if (data.lodging) lodging.value = normalizeLodging(data.lodging)
  }

  return {
    tripName, startDate, totalDays, currentDayIndex,
    days, events, lodging, totalBudget, totalSpent,
    addEvent, updateEvent, deleteEvent,
    updateLodging, getResolvedEventLocation,
    loadFromCloud,
    setSaveToCloud
  }
}, { persist: true })
