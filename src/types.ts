/**
 * Routebook 核心型別定義
 * 版本：2026-03-25 (區間時間版)
 */

// 行程分類定義，確保 UI 顏色與圖示連動
export type EventCategory = 'transport' | 'food' | 'spot' | 'hotel' | 'shopping' | 'todo';

/**
 * 基礎行程介面 (Base Interface)
 * 包含所有行程共有的屬性
 */
interface BaseEvent {
  id: string;
  title: string;
  startTime: string; // 格式: "HH:mm" (例如 "09:00")
  endTime: string;   // 格式: "HH:mm" (例如 "10:30")
  location: string;
  address?: string;
  category: EventCategory;
  note?: string;
  price?: number;
  day: number;
  isHotel?: boolean; // 是否為住宿連動項目
}

/**
 * 完整行程事件 (用於 Store 與 Firestore)
 * 確保所有資料都已解耦並具備完整屬性
 */
export interface TripEvent extends BaseEvent {
  images: string[];    // 確保照片欄位永遠存在，預設為空陣列
  time?: string;       // [舊版相容] 暫時保留，之後將棄用
}

/**
 * 初始行程輸入 (用於 fukuokaData.ts)
 * 允許部分欄位選填，由 Store 初始化時補齊
 */
export interface InitialTripEvent extends Partial<BaseEvent> {
  title: string;
  startTime: string;   // 初始資料必須提供開始時間
  endTime: string;     // 初始資料必須提供結束時間
  category: EventCategory;
  day: number;
}

/**
 * 預算與消費紀錄 (用於 BudgetView)
 */
export interface BudgetRecord {
  id: string;
  eventId?: string;    // 若關聯到特定行程
  category: EventCategory;
  amount: number;
  title: string;
  date: string;
}

/**
 * 住宿中心定義 (用於 InfoView)
 */
export interface HotelInfo {
  day: number;
  hotelName: string;
  address: string;
  checkIn: string;
}
