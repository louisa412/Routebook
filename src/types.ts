// src/types.ts
export type CategoryType = '交通' | '餐飲' | '住宿' | '景點' | '購物' | '其他' | '證件' | '票券' | '日常' | '藥妝' | '伴手禮' | '服飾' | '零食';

export interface TripEvent {
  id?: string; // 💡 變成必填，方便管理圖片
  title: string;
  location: string;
  hour: number;
  minute: number;
  endHour: number;
  endMinute: number;
  budget: number;
  category: string;
  dateIndex: number;
  note?: string;      // 💡 A: 備註
  images?: string[];  // 💡 D: 圖片陣列 (存 Base64 字串)
}

export interface ListItem {
  id: string;
  title: string;
  category: string;
  budget: number;
  isCompleted: boolean;
}