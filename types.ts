/**
 * Routebook 核心型別定義
 */

export type EventCategory = 'transport' | 'food' | 'spot' | 'hotel' | 'shopping' | 'todo'
export type LocationSource = 'manual' | 'lodging'
export type EventType = 'range' | 'point'

/**
 * MOZE 預算分類
 * 對應 MOZE app 的支出分類，方便對帳
 */
export type MozeCategory =
  | '交通'
  | '家居'
  | '飲食'
  | '娛樂'
  | '購物'
  | '二三次元周邊'
  | '個人'
  | '醫療'
  | '家庭'
  | '生活'
  | '學習'
  | '其他'

export const MOZE_CATEGORIES: MozeCategory[] = [
  '交通', '家居', '飲食', '娛樂', '購物',
  '二三次元周邊', '個人', '醫療', '家庭', '生活', '學習', '其他'
]

/** EventCategory → 預設對應的 MozeCategory */
export const EVENT_TO_MOZE: Record<EventCategory, MozeCategory> = {
  transport: '交通',
  food:      '飲食',
  spot:      '娛樂',
  hotel:     '生活',
  shopping:  '購物',
  todo:      '其他'
}

export interface TripEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  eventType?: EventType
  location: string
  address?: string
  category: EventCategory
  budgetCategory?: MozeCategory  // 預算分類（MOZE 對接用）
  note?: string
  price: number
  day: number
  isHotel?: boolean
  images: string[]
  time?: string
  locationSource?: LocationSource
}

export interface InitialTripEvent extends Partial<TripEvent> {
  title: string
  startTime: string
  endTime: string
  category: EventCategory
  day: number
}

export interface TripDay {
  date: string
  weekday: string
  displayLabel: string
  dayTitle: string
}

export interface ListItem {
  id: string
  title: string
  category: string
  completed: boolean
  price?: number             // 採購清單用
  budgetCategory?: MozeCategory
}

export interface HotelInfo {
  name: string
  address: string
}

export type SyncStatus = 'local-only' | 'syncing' | 'synced' | 'sync-failed'

export interface BudgetRecord {
  id: string
  eventId?: string
  category: EventCategory
  amount: number
  title: string
  date: string
}
