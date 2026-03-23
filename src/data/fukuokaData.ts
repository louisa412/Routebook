// src/data/fukuokaData.ts
import type { TripEvent } from '../types';

// 1. 定義一個「初始資料專用」型別，排除掉會由 Store 自動補齊的欄位
type InitialTripEvent = Omit<TripEvent, 'id' | 'images' | 'isAtAccommodation'>;

// 2. 💡 關鍵點：在這裡明確指定型別為 InitialTripEvent[] 而不是 TripEvent[]

export const FUKUOKA_EVENTS: InitialTripEvent[] = [
  // === Day 1 (4/8 三) ===
  { title: '抵達桃機', location: '桃園國際機場 (TPE)', hour: 14, minute: 30, endHour: 15, endMinute: 30, budget: 0, category: '交通', dateIndex: 0 },
  { title: '航班起飛', location: '桃園國際機場 (TPE)', hour: 16, minute: 40, endHour: 20, endMinute: 0, budget: 0, category: '交通', dateIndex: 0 },
  { title: '機上晚餐', location: '飛機上', hour: 19, minute: 0, endHour: 20, endMinute: 0, budget: 0, category: '餐飲', dateIndex: 0 },
  { title: 'FUK 降落', location: '福岡機場 (FUK)', hour: 20, minute: 0, endHour: 21, endMinute: 0, budget: 0, category: '交通', dateIndex: 0 },
  { title: '抵達飯店 / 宵夜', location: '博多車站附近', hour: 21, minute: 0, endHour: 22, endMinute: 0, budget: 1500, category: '餐飲', dateIndex: 0 },
  { title: '晚安', location: '飯店', hour: 22, minute: 0, endHour: 23, endMinute: 0, budget: 0, category: '住宿', dateIndex: 0 },

  // === Day 2 (4/9 四) ===
  { title: '起床 / 整理', location: '飯店', hour: 6, minute: 0, endHour: 6, endMinute: 30, budget: 0, category: '其他', dateIndex: 1 },
  { title: '早餐', location: '飯店', hour: 6, minute: 30, endHour: 7, endMinute: 15, budget: 0, category: '餐飲', dateIndex: 1 },
  { title: '出發 / 一日遊(A)集合', location: '博多車站', hour: 7, minute: 15, endHour: 8, endMinute: 0, budget: 0, category: '交通', dateIndex: 1 },
  { title: '前往由布院', location: '由布院', hour: 8, minute: 0, endHour: 9, endMinute: 0, budget: 0, category: '交通', dateIndex: 1 },
  { title: '由布院探索', location: '由布院', hour: 9, minute: 0, endHour: 10, endMinute: 0, budget: 0, category: '景點', dateIndex: 1 },
  { title: '湯之坪街道散步', location: '湯之坪街道', hour: 10, minute: 0, endHour: 11, endMinute: 0, budget: 2000, category: '景點', dateIndex: 1 },
  { title: '地雞釜飯午餐', location: '由布院', hour: 11, minute: 0, endHour: 12, endMinute: 0, budget: 2500, category: '餐飲', dateIndex: 1 },
  { title: '觀光火車', location: '由布院之森', hour: 12, minute: 0, endHour: 13, endMinute: 0, budget: 0, category: '景點', dateIndex: 1 },
  { title: '別府地獄足湯', location: '別府', hour: 13, minute: 0, endHour: 15, endMinute: 0, budget: 500, category: '景點', dateIndex: 1 },
  { title: '太宰府天滿宮', location: '太宰府', hour: 15, minute: 0, endHour: 16, endMinute: 0, budget: 0, category: '景點', dateIndex: 1 },
  { title: '回到博多', location: '博多', hour: 16, minute: 0, endHour: 17, endMinute: 0, budget: 0, category: '交通', dateIndex: 1 },
  { title: '伴手禮採買時間', location: '博多車站', hour: 17, minute: 0, endHour: 18, endMinute: 0, budget: 5000, category: '購物', dateIndex: 1 },
  { title: '搭車返回飯店', location: '博多', hour: 18, minute: 0, endHour: 20, endMinute: 0, budget: 0, category: '交通', dateIndex: 1 },
  { title: '散步回飯店', location: '飯店附近', hour: 20, minute: 0, endHour: 21, endMinute: 0, budget: 0, category: '其他', dateIndex: 1 },
  { title: '飯店休息 / 泡澡', location: '飯店', hour: 21, minute: 0, endHour: 22, endMinute: 0, budget: 0, category: '住宿', dateIndex: 1 },
  { title: '晚安', location: '飯店', hour: 22, minute: 0, endHour: 23, endMinute: 0, budget: 0, category: '住宿', dateIndex: 1 },

  // === Day 3 (4/10 五) ===
  { title: '起床 / 整理', location: '飯店', hour: 6, minute: 0, endHour: 7, endMinute: 0, budget: 0, category: '其他', dateIndex: 2 },
  { title: '飯店精緻早餐', location: '飯店', hour: 7, minute: 0, endHour: 8, endMinute: 0, budget: 0, category: '餐飲', dateIndex: 2 },
  { title: '搭特急前往門司港', location: '門司港車站', hour: 8, minute: 0, endHour: 9, endMinute: 0, budget: 1500, category: '交通', dateIndex: 2 },
  { title: '抵達門司港車站', location: '門司港', hour: 9, minute: 0, endHour: 10, endMinute: 0, budget: 0, category: '景點', dateIndex: 2 },
  { title: '舊門司稅關 / 建築', location: '舊門司稅關', hour: 10, minute: 0, endHour: 11, endMinute: 0, budget: 0, category: '景點', dateIndex: 2 },
  { title: '搭船去下關', location: '下關', hour: 11, minute: 0, endHour: 12, endMinute: 0, budget: 400, category: '交通', dateIndex: 2 },
  { title: '唐戶市場午餐', location: '唐戶市場', hour: 12, minute: 0, endHour: 13, endMinute: 0, budget: 3500, category: '餐飲', dateIndex: 2 },
  { title: '春帆樓 / 日清館', location: '春帆樓', hour: 13, minute: 0, endHour: 14, endMinute: 0, budget: 0, category: '景點', dateIndex: 2 },
  { title: '赤間神宮拍照', location: '赤間神宮', hour: 14, minute: 0, endHour: 15, endMinute: 0, budget: 0, category: '景點', dateIndex: 2 },
  { title: '藍翼橋開合秀', location: '藍翼橋', hour: 15, minute: 0, endHour: 16, endMinute: 0, budget: 0, category: '景點', dateIndex: 2 },
  { title: '門司港展望台', location: '門司港展望台', hour: 16, minute: 0, endHour: 18, endMinute: 0, budget: 300, category: '景點', dateIndex: 2 },
  { title: '返回博多車站', location: '博多車站', hour: 18, minute: 0, endHour: 19, endMinute: 0, budget: 0, category: '交通', dateIndex: 2 },
  { title: '車站附近晚餐', location: '博多', hour: 19, minute: 0, endHour: 20, endMinute: 0, budget: 2000, category: '餐飲', dateIndex: 2 },
  { title: '散步回飯店', location: '飯店附近', hour: 20, minute: 0, endHour: 21, endMinute: 0, budget: 0, category: '其他', dateIndex: 2 },
  { title: '飯店休息 / 泡澡', location: '飯店', hour: 21, minute: 0, endHour: 22, endMinute: 0, budget: 0, category: '住宿', dateIndex: 2 },
  { title: '晚安', location: '飯店', hour: 22, minute: 0, endHour: 23, endMinute: 0, budget: 0, category: '住宿', dateIndex: 2 },

  // === Day 4 (4/11 六) ===
  { title: '起床 / 整理', location: '飯店', hour: 6, minute: 0, endHour: 7, endMinute: 0, budget: 0, category: '其他', dateIndex: 3 },
  { title: '飯店精緻早餐', location: '飯店', hour: 7, minute: 0, endHour: 8, endMinute: 0, budget: 0, category: '餐飲', dateIndex: 3 },
  { title: '出發 / 一日遊(B)集合', location: '博多', hour: 8, minute: 0, endHour: 9, endMinute: 0, budget: 0, category: '交通', dateIndex: 3 },
  { title: '糸島：情侶岩', location: '糸島', hour: 9, minute: 0, endHour: 10, endMinute: 0, budget: 0, category: '景點', dateIndex: 3 },
  { title: '櫻井神社 / 白糸瀑布', location: '白糸瀑布', hour: 10, minute: 0, endHour: 11, endMinute: 0, budget: 0, category: '景點', dateIndex: 3 },
  { title: '絲島海岸散策', location: '絲島', hour: 11, minute: 0, endHour: 12, endMinute: 0, budget: 0, category: '景點', dateIndex: 3 },
  { title: '一蘭之森 / 海鮮定食', location: '一蘭之森', hour: 12, minute: 0, endHour: 14, endMinute: 0, budget: 2500, category: '餐飲', dateIndex: 3 },
  { title: '妖怪森林咖啡館', location: '妖怪森林咖啡館', hour: 14, minute: 0, endHour: 16, endMinute: 0, budget: 1500, category: '餐飲', dateIndex: 3 },
  { title: '太宰府深度遊：光明禪寺', location: '光明禪寺', hour: 16, minute: 0, endHour: 18, endMinute: 0, budget: 500, category: '景點', dateIndex: 3 },
  { title: '藥妝 / Loft 進攻', location: '天神', hour: 18, minute: 0, endHour: 19, endMinute: 0, budget: 15000, category: '購物', dateIndex: 3 },
  { title: '新三浦 博多本店', location: '新三浦 博多本店', hour: 19, minute: 0, endHour: 20, endMinute: 0, budget: 4000, category: '餐飲', dateIndex: 3 },
  { title: '散步回飯店', location: '飯店附近', hour: 20, minute: 0, endHour: 21, endMinute: 0, budget: 0, category: '其他', dateIndex: 3 },
  { title: '飯店休息 / 泡澡', location: '飯店', hour: 21, minute: 0, endHour: 22, endMinute: 0, budget: 0, category: '住宿', dateIndex: 3 },
  { title: '晚安', location: '飯店', hour: 22, minute: 0, endHour: 23, endMinute: 0, budget: 0, category: '住宿', dateIndex: 3 },

  // === Day 5 (4/12 日) ===
  { title: '起床 / 整理', location: '飯店', hour: 6, minute: 0, endHour: 7, endMinute: 0, budget: 0, category: '其他', dateIndex: 4 },
  { title: '飯店精緻早餐', location: '飯店', hour: 7, minute: 0, endHour: 8, endMinute: 0, budget: 0, category: '餐飲', dateIndex: 4 },
  { title: '博多千年門散策', location: '博多千年門', hour: 8, minute: 0, endHour: 9, endMinute: 0, budget: 0, category: '景點', dateIndex: 4 },
  { title: '東長寺 (大佛)', location: '東長寺', hour: 9, minute: 0, endHour: 10, endMinute: 0, budget: 0, category: '景點', dateIndex: 4 },
  { title: '櫛田神社 (山笠)', location: '櫛田神社', hour: 10, minute: 0, endHour: 11, endMinute: 0, budget: 0, category: '景點', dateIndex: 4 },
  { title: '川端通商店街', location: '川端通商店街', hour: 11, minute: 0, endHour: 12, endMinute: 0, budget: 0, category: '景點', dateIndex: 4 },
  { title: '紅豆年糕湯 / 午餐', location: '川端通', hour: 12, minute: 0, endHour: 13, endMinute: 0, budget: 1500, category: '餐飲', dateIndex: 4 },
  { title: '西鐵特急去柳川', location: '西鐵福岡站', hour: 13, minute: 0, endHour: 14, endMinute: 0, budget: 1000, category: '交通', dateIndex: 4 },
  { title: '柳川遊船體驗', location: '柳川', hour: 14, minute: 0, endHour: 15, endMinute: 0, budget: 1800, category: '景點', dateIndex: 4 },
  { title: '柳川河畔散步', location: '柳川', hour: 15, minute: 0, endHour: 16, endMinute: 0, budget: 0, category: '景點', dateIndex: 4 },
  { title: '特急火車回天神', location: '天神', hour: 16, minute: 0, endHour: 17, endMinute: 0, budget: 1000, category: '交通', dateIndex: 4 },
  { title: '天神百貨採買', location: '天神', hour: 17, minute: 0, endHour: 19, endMinute: 0, budget: 10000, category: '購物', dateIndex: 4 },
  { title: '本吉屋鰻魚飯', location: '本吉屋', hour: 19, minute: 0, endHour: 21, endMinute: 0, budget: 4500, category: '餐飲', dateIndex: 4 },
  { title: '打包行李 / 秤重', location: '飯店', hour: 21, minute: 0, endHour: 22, endMinute: 0, budget: 0, category: '其他', dateIndex: 4 },
  { title: '晚安', location: '飯店', hour: 22, minute: 0, endHour: 23, endMinute: 0, budget: 0, category: '住宿', dateIndex: 4 },

  // === Day 6 (4/13 一) ===
  { title: '起床 / 整理', location: '飯店', hour: 6, minute: 0, endHour: 7, endMinute: 0, budget: 0, category: '其他', dateIndex: 5 },
  { title: '飯店精緻早餐', location: '飯店', hour: 7, minute: 0, endHour: 8, endMinute: 30, budget: 0, category: '餐飲', dateIndex: 5 },
  { title: '退房前往機場', location: '福岡機場', hour: 8, minute: 30, endHour: 9, endMinute: 0, budget: 500, category: '交通', dateIndex: 5 },
  { title: '機場免稅店衝刺', location: '福岡機場', hour: 9, minute: 0, endHour: 11, endMinute: 0, budget: 5000, category: '購物', dateIndex: 5 },
  { title: 'FUK 起飛', location: '福岡機場 (FUK)', hour: 11, minute: 0, endHour: 12, endMinute: 30, budget: 0, category: '交通', dateIndex: 5 },
  { title: 'TPE 降落', location: '桃園國際機場 (TPE)', hour: 12, minute: 30, endHour: 13, endMinute: 30, budget: 0, category: '交通', dateIndex: 5 },
  { title: '各自出發搭車', location: '高鐵/客運', hour: 13, minute: 30, endHour: 14, endMinute: 30, budget: 1000, category: '交通', dateIndex: 5 },
  { title: '溫暖的家', location: '家', hour: 14, minute: 30, endHour: 15, endMinute: 0, budget: 0, category: '其他', dateIndex: 5 },
]
// src/data/fukuokaData.ts (最下方新增)

export const FUKUOKA_LODGING: Record<number, { name: string, address: string }> = {
  0: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  1: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  2: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  3: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  4: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  5: { name: '溫暖的家', address: '' }
};