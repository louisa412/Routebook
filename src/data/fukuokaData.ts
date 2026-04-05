// src/data/fukuokaData.ts
import type { InitialTripEvent } from '../types';

export const FUKUOKA_EVENTS: InitialTripEvent[] = [
  // === Day 1 (4/8 三) ===
  { title: '抵達桃機', location: '桃園國際機場 (TPE)', startTime: '14:30', endTime: '15:30', price: 0, category: 'transport', day: 0 },
  { title: '航班起飛', location: '桃園國際機場 (TPE)', startTime: '16:40', endTime: '20:00', price: 0, category: 'transport', day: 0 },
  { title: '機上晚餐', location: '飛機上', startTime: '19:00', endTime: '20:00', price: 0, category: 'food', day: 0 },
  { title: 'FUK 降落', location: '福岡機場 (FUK)', startTime: '20:00', endTime: '21:00', price: 0, category: 'transport', day: 0 },
  { title: '抵達飯店 / 宵夜', location: '博多車站附近', startTime: '21:00', endTime: '22:00', price: 1500, category: 'food', day: 0 },
  { title: '晚安', location: '飯店', startTime: '22:00', endTime: '23:00', price: 0, category: 'hotel', day: 0, locationSource: 'lodging' },

  // === Day 2 (4/9 四) ===
  { title: '起床 / 整理', location: '飯店', startTime: '06:00', endTime: '06:30', price: 0, category: 'todo', day: 1, locationSource: 'lodging' },
  { title: '早餐', location: '飯店', startTime: '06:30', endTime: '07:15', price: 0, category: 'food', day: 1 },
  { title: '出發 / 一日遊(A)集合', location: '博多車站', startTime: '07:15', endTime: '08:00', price: 0, category: 'transport', day: 1 },
  { title: '前往由布院', location: '由布院', startTime: '08:00', endTime: '09:00', price: 0, category: 'transport', day: 1 },
  { title: '由布院探索', location: '由布院', startTime: '09:00', endTime: '10:00', price: 0, category: 'spot', day: 1 },
  { title: '湯之坪街道散步', location: '湯之坪街道', startTime: '10:00', endTime: '11:00', price: 2000, category: 'spot', day: 1 },
  { title: '地雞釜飯午餐', location: '由布院', startTime: '11:00', endTime: '12:00', price: 2500, category: 'food', day: 1 },
  { title: '觀光火車', location: '由布院之森', startTime: '12:00', endTime: '13:00', price: 0, category: 'spot', day: 1 },
  { title: '別府地獄足湯', location: '別府', startTime: '13:00', endTime: '15:00', price: 500, category: 'spot', day: 1 },
  { title: '太宰府天滿宮', location: '太宰府', startTime: '15:00', endTime: '16:00', price: 0, category: 'spot', day: 1 },
  { title: '回到博多', location: '博多', startTime: '16:00', endTime: '17:00', price: 0, category: 'transport', day: 1 },
  { title: '伴手禮採買時間', location: '博多車站', startTime: '17:00', endTime: '18:00', price: 5000, category: 'shopping', day: 1 },
  { title: '搭車返回飯店', location: '博多', startTime: '18:00', endTime: '20:00', price: 0, category: 'transport', day: 1 },
  { title: '散步回飯店', location: '飯店附近', startTime: '20:00', endTime: '21:00', price: 0, category: 'todo', day: 1 },
  { title: '飯店休息 / 泡澡', location: '店', startTime: '21:00', endTime: '22:00', price: 0, category: 'hotel', day: 1, locationSource: 'lodging' },
  { title: '晚安', location: '飯店', startTime: '22:00', endTime: '23:00', price: 0, category: 'hotel', day: 1, locationSource: 'lodging' },

  // === Day 3 (4/10 五) ===
  { title: '起床 / 整理', location: '飯店', startTime: '06:00', endTime: '07:00', price: 0, category: 'todo', day: 2, locationSource: 'lodging' },
  { title: '飯店精緻早餐', location: '飯店', startTime: '07:00', endTime: '08:00', price: 0, category: 'food', day: 2, locationSource: 'lodging' },
  { title: '搭特急前往門司港', location: '門司港車站', startTime: '08:00', endTime: '09:00', price: 1500, category: 'transport', day: 2 },
  { title: '抵達門司港車站', location: '門司港', startTime: '09:00', endTime: '10:00', price: 0, category: 'spot', day: 2 },
  { title: '舊門司稅關 / 建築', location: '舊門司稅關', startTime: '10:00', endTime: '11:00', price: 0, category: 'spot', day: 2 },
  { title: '搭船去下關', location: '下關', startTime: '11:00', endTime: '12:00', price: 400, category: 'transport', day: 2 },
  { title: '唐戶市場午餐', location: '唐戶市場', startTime: '12:00', endTime: '13:00', price: 3500, category: 'food', day: 2 },
  { title: '春帆樓 / 日清館', location: '春帆樓', startTime: '13:00', endTime: '14:00', price: 0, category: 'spot', day: 2 },
  { title: '赤間神宮拍照', location: '赤間神宮', startTime: '14:00', endTime: '15:00', price: 0, category: 'spot', day: 2 },
  { title: '藍翼橋開合秀', location: '藍翼橋', startTime: '15:00', endTime: '16:00', price: 0, category: 'spot', day: 2 },
  { title: '門司港展望台', location: '門司港展望台', startTime: '16:00', endTime: '18:00', price: 300, category: 'spot', day: 2 },
  { title: '返回博多車站', location: '博多車站', startTime: '18:00', endTime: '19:00', price: 0, category: 'transport', day: 2 },
  { title: '車站附近晚餐', location: '博多', startTime: '19:00', endTime: '20:00', price: 2000, category: 'food', day: 2 },
  { title: '散步回飯店', location: '飯店附近', startTime: '20:00', endTime: '21:00', price: 0, category: 'todo', day: 2 },
  { title: '飯店休息 / 泡澡', location: '飯店', startTime: '21:00', endTime: '22:00', price: 0, category: 'hotel', day: 2, locationSource: 'lodging' },
  { title: '晚安', location: '飯店', startTime: '22:00', endTime: '23:00', price: 0, category: 'hotel', day: 2, locationSource: 'lodging' },

  // === Day 4 (4/11 六) ===
  { title: '起床 / 整理', location: '飯店', startTime: '06:00', endTime: '07:00', price: 0, category: 'todo', day: 3, locationSource: 'lodging' },
  { title: '飯店精緻早餐', location: '飯店', startTime: '07:00', endTime: '08:00', price: 0, category: 'food', day: 3, locationSource: 'lodging' },
  { title: '出發 / 一日遊(B)集合', location: '博多', startTime: '08:00', endTime: '09:00', price: 0, category: 'transport', day: 3 },
  { title: '糸島：情侶岩', location: '糸島', startTime: '09:00', endTime: '10:00', price: 0, category: 'spot', day: 3 },
  { title: '櫻井神社 / 白糸瀑布', location: '白糸瀑布', startTime: '10:00', endTime: '11:00', price: 0, category: 'spot', day: 3 },
  { title: '絲島海岸散策', location: '絲島', startTime: '11:00', endTime: '12:00', price: 0, category: 'spot', day: 3 },
  { title: '一蘭之森 / 海鮮定食', location: '一蘭之森', startTime: '12:00', endTime: '14:00', price: 2500, category: 'food', day: 3 },
  { title: '妖怪森林咖啡館', location: '妖怪森林咖啡館', startTime: '14:00', endTime: '16:00', price: 1500, category: 'food', day: 3 },
  { title: '太宰府深度遊：光明禪寺', location: '光明禪寺', startTime: '16:00', endTime: '18:00', price: 500, category: 'spot', day: 3 },
  { title: '藥妝 / Loft 進攻', location: '天神', startTime: '18:00', endTime: '19:00', price: 15000, category: 'shopping', day: 3 },
  { title: '新三浦 博多本店', location: '新三浦 博多本店', startTime: '19:00', endTime: '20:00', price: 4000, category: 'food', day: 3 },
  { title: '散步回飯店', location: '飯店附近', startTime: '20:00', endTime: '21:00', price: 0, category: 'todo', day: 3 },
  { title: '飯店休息 / 泡澡', location: '飯店', startTime: '21:00', endTime: '22:00', price: 0, category: 'hotel', day: 3, locationSource: 'lodging' },
  { title: '晚安', location: '飯店', startTime: '22:00', endTime: '23:00', price: 0, category: 'hotel', day: 3, locationSource: 'lodging' },

  // === Day 5 (4/12 日) ===
  { title: '起床 / 整理', location: '飯店', startTime: '06:00', endTime: '07:00', price: 0, category: 'todo', day: 4, locationSource: 'lodging' },
  { title: '飯店精緻早餐', location: '飯店', startTime: '07:00', endTime: '08:00', price: 0, category: 'food', day: 4, locationSource: 'lodging' },
  { title: '博多千年門散策', location: '博多千年門', startTime: '08:00', endTime: '09:00', price: 0, category: 'spot', day: 4 },
  { title: '東長寺 (大佛)', location: '東長寺', startTime: '09:00', endTime: '10:00', price: 0, category: 'spot', day: 4 },
  { title: '櫛田神社 (山笠)', location: '櫛田神社', startTime: '10:00', endTime: '11:00', price: 0, category: 'spot', day: 4 },
  { title: '川端通商店街', location: '川端通商店街', startTime: '11:00', endTime: '12:00', price: 0, category: 'spot', day: 4 },
  { title: '紅豆年糕湯 / 午餐', location: '川端通', startTime: '12:00', endTime: '13:00', price: 1500, category: 'food', day: 4 },
  { title: '西鐵特急去柳川', location: '西鐵福岡站', startTime: '13:00', endTime: '14:00', price: 1000, category: 'transport', day: 4 },
  { title: '柳川遊船體驗', location: '柳川', startTime: '14:00', endTime: '15:00', price: 1800, category: 'spot', day: 4 },
  { title: '柳川河畔散步', location: '柳川', startTime: '15:00', endTime: '16:00', price: 0, category: 'spot', day: 4 },
  { title: '特急火車回天神', location: '天神', startTime: '16:00', endTime: '17:00', price: 1000, category: 'transport', day: 4 },
  { title: '天神百貨採買', location: '天神', startTime: '17:00', endTime: '19:00', price: 10000, category: 'shopping', day: 4 },
  { title: '本吉屋鰻魚飯', location: '本吉屋', startTime: '19:00', endTime: '21:00', price: 4500, category: 'food', day: 4 },
  { title: '打包行李 / 秤重', location: '飯店', startTime: '21:00', endTime: '22:00', price: 0, category: 'todo', day: 4 },
  { title: '晚安', location: '飯店', startTime: '22:00', endTime: '23:00', price: 0, category: 'hotel', day: 4, locationSource: 'lodging' },

  // === Day 6 (4/13 一) ===
  { title: '起床 / 整理', location: '飯店', startTime: '06:00', endTime: '07:00', price: 0, category: 'todo', day: 5, locationSource: 'lodging' },
  { title: '飯店精緻早餐', location: '飯店', startTime: '07:00', endTime: '08:30', price: 0, category: 'food', day: 5, locationSource: 'lodging' },
  { title: '退房前往機場', location: '福岡機場', startTime: '08:30', endTime: '09:00', price: 500, category: 'transport', day: 5 },
  { title: '機場免稅店衝刺', location: '福岡機場', startTime: '09:00', endTime: '11:00', price: 5000, category: 'shopping', day: 5 },
  { title: 'FUK 起飛', location: '福岡機場 (FUK)', startTime: '11:00', endTime: '12:30', price: 0, category: 'transport', day: 5 },
  { title: 'TPE 降落', location: '桃園國際機場 (TPE)', startTime: '12:30', endTime: '13:30', price: 0, category: 'transport', day: 5 },
  { title: '各自出發搭車', location: '高鐵/客運', startTime: '13:30', endTime: '14:30', price: 1000, category: 'transport', day: 5 },
  { title: '溫暖的家', location: '家', startTime: '14:30', endTime: '15:00', price: 0, category: 'todo', day: 5 },
];

export const FUKUOKA_LODGING: Record<number, { name: string, address: string }> = {
  0: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  1: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  2: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  3: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  4: { name: '福岡皇家花園酒店', address: '福岡市博多區博多站前2-14-15' },
  5: { name: '溫暖的家', address: '' }
};
