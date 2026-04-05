import type { TripEvent, ListItem, EventType, MozeCategory, Currency } from '../types'
import { EVENT_TO_MOZE as E2M } from '../types'

export const DEFAULT_TODO_CATEGORIES = ['行前', '證件', '交通', '行李']
export const DEFAULT_SHOPPING_CATEGORIES = ['藥妝', '伴手禮', '服飾', '零食', '電器']
export const DEFAULT_PACKING_CATEGORIES = ['證件 / 金流', '衣物', '盥洗 / 保養', '藥品', '電子用品', '機上隨身', '其他']

export const sanitizeForFirestore = (value: unknown): any => {
  if (value === undefined) return null
  if (value === null) return null
  if (Array.isArray(value)) return value.map(sanitizeForFirestore)
  if (value instanceof Date) return value
  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (nestedValue !== undefined) sanitized[key] = sanitizeForFirestore(nestedValue)
    })
    return sanitized
  }
  return value
}

export const normalizeEvent = (event: Partial<TripEvent>, fallbackId: string): TripEvent => {
  const rawType = (event as any).eventType
  const eventType: EventType = rawType === 'point' ? 'point' : 'range'
  const category = event.category || 'spot'
  const budgetCategory: MozeCategory = (event as any).budgetCategory || E2M[category] || '其他'
  const currency: Currency = (event as any).currency === 'TWD' ? 'TWD' : 'JPY'

  return {
    id: event.id || fallbackId,
    title: event.title || '',
    startTime: event.startTime || '00:00',
    endTime: event.endTime || '01:00',
    eventType,
    location: event.location || '',
    address: event.address || '',
    category,
    budgetCategory,
    note: event.note || '',
    price: Number(event.price) || 0,
    currency,
    day: typeof event.day === 'number' ? event.day : 0,
    isHotel: !!(event.isHotel || event.category === 'hotel' || event.title?.includes('飯店') || event.title?.includes('晚安')),
    images: Array.isArray(event.images) ? event.images : [],
    time: event.time || '',
    locationSource: event.locationSource === 'lodging' ? 'lodging' : 'manual'
  }
}

export const normalizeListItem = (item: Partial<ListItem>, fallbackId: string): ListItem => ({
  id: item.id || fallbackId,
  title: item.title || (item as any).name || '未命名項目',
  category: item.category || '未分類',
  completed: !!item.completed,
  price: Number(item.price) || 0,
  currency: (item as any).currency === 'TWD' ? 'TWD' : 'JPY',
  budgetCategory: item.budgetCategory || '購物'
})

export const normalizeLodging = (raw: unknown): Record<number, { name: string; address: string }> => {
  const safe: Record<number, { name: string; address: string }> = {}
  if (!raw || typeof raw !== 'object') return safe
  Object.entries(raw as Record<string, any>).forEach(([key, value]) => {
    const day = Number(key)
    if (Number.isNaN(day)) return
    safe[day] = { name: value?.name || '', address: value?.address || '' }
  })
  return safe
}

export const buildCategoryList = (baseCategories: string[], items: ListItem[]): string[] => {
  const merged = [...baseCategories]
  items.forEach((item) => {
    const cat = item.category || '未分類'
    if (!merged.includes(cat)) merged.push(cat)
  })
  return merged
}
