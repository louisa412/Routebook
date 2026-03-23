// src/types.ts

export interface TripDay {
  date: string;      // YYYY-MM-DD
  weekday: string;   // WED, THU...
  displayLabel: string; // 04/08 (WED) <- 新增這個
  dayTitle: string;     // Day 1 <- 新增這個
}

export interface TripEvent {
  id: string;
  title: string;
  location: string;
  hour: number;
  minute: number;
  endHour?: number;
  endMinute?: number;
  category: string;
  budget: number;
  note?: string;
  images: string[]; // 確保這裡有複數圖片陣列
  dateIndex: number;
  isAtAccommodation: boolean;
}

// 如果你有用到 ListItem（購物/待辦清單）也順便檢查一下
export interface ListItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}