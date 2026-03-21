export interface TripEvent {
  id: string;        // 💡 確保 id 不是選填的
  title: string;
  location: string;
  hour: number;
  minute: number;
  endHour: number;   // 💡 確保有這行
  endMinute: number; // 💡 確保有這行
  budget: number;
  category: string;
  dateIndex: number;
  note: string;      // 💡 確保有這行
  images: string[];  // 💡 確保有這行
}

export interface TripDay {
  date: string;
  weekday: string;
}