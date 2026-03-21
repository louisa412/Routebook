// src/types.ts

export interface TripEvent {
  id: string;
  title: string;
  location: string;
  hour: number;
  minute: number;
  endHour: number;
  endMinute: number;
  budget: number;
  category: string;
  dateIndex: number;
  note: string;
  images: string[];
  isAtAccommodation?: boolean; // 💡 確保這行也在
}

export interface TripDay {
  date: string;
  weekday: string;
}

// 💡 補上這一段，消滅 ListView 的第一個紅點
export interface ListItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}