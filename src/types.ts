/**
 * Routebook 核心型別定義
 * 更新日期：2026-03-27
 * 變更重點：補齊缺失的 TripDay 與 ListItem 定義，修正 Price 必填項
 */

// 1. 行程分類
export type EventCategory = 'transport' | 'food' | 'spot' | 'hotel' | 'shopping' | 'todo';

/**
 * 2. 完整行程事件 (用於 Store 與 Firestore)
 * 為了計算安全，price 與 day 設為必填
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
  price: number;     // 對齊新版資料結構
  day: number;       // 對齊新版資料結構
  isHotel?: boolean;
  images: string[];
  time?: string;     // [舊版相容]
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
 * 4. 日期區塊定義 (解決 Store 報錯關鍵)
 */
export interface TripDay {
  date: string;
  weekday: string;
  displayLabel: string;
  dayTitle: string;
}

/**
 * 5. 清單項目定義 (解決 ListView 報錯關鍵)
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
