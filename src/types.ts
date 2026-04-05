/**
 * Routebook 核心型別定義
 * 更新日期：2026-03-27
 */

// 1. 行程分類
export type EventCategory = 'transport' | 'food' | 'spot' | 'hotel' | 'shopping' | 'todo';
export type LocationSource = 'manual' | 'lodging';

/**
 * 2. 完整行程事件 (用於 Store 與 Firestore)
 */
export interface TripEvent {
  id: string;
  title: string;
  startTime: string; // 格式: "HH:mm"
  endTime: string;   // 格式: "HH:mm"
  location: string;
  address?: string;
  category: EventCategory;
  note?: string;
  price: number;
  day: number;
  isHotel?: boolean;
  images: string[];
  time?: string;     // [舊版相容]
  locationSource?: LocationSource; // [舊版相容] 未提供時視為 manual
}

/**
 * 3. 初始行程輸入 (用於 fukuokaData.ts)
 */
export interface InitialTripEvent extends Partial<TripEvent> {
  title: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  day: number;
}

/**
 * 4. 日期區塊定義
 */
export interface TripDay {
  date: string;
  weekday: string;
  displayLabel: string;
  dayTitle: string;
}

/**
 * 5. 清單項目定義
 */
export interface ListItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

/**
 * 6. 住宿資訊定義
 */
export interface HotelInfo {
  name: string;
  address: string;
}

export type SyncStatus = 'local-only' | 'syncing' | 'synced' | 'sync-failed';

/**
 * 7. 預算紀錄 (擴充功能預備)
 */
export interface BudgetRecord {
  id: string;
  eventId?: string;
  category: EventCategory;
  amount: number;
  title: string;
  date: string;
}
