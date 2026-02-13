import { Cafe, FlavorProfile, SpaceFeatures } from './types';

export const DEFAULT_CENTER = {
  lat: 25.042, // Near Taipei Main Station/Huashan
  lng: 121.530
};

export const DEFAULT_FLAVOR: FlavorProfile = {
  acidity: 3,
  bitterness: 3,
  roast: 3,
  sweetness: 3
};

export const DEFAULT_FEATURES: SpaceFeatures = {
  hasSocket: false,
  unlimitedTime: false,
  workFriendly: false,
  hasCat: false,
  industrialStyle: false
};

// Real logs to start with
export const INITIAL_CAFES: Cafe[] = [
  {
    id: 'real-1',
    name: 'Simple Kaffa 興波咖啡',
    address: '台北市中正區忠孝東路二段27號',
    lat: 25.0442,
    lng: 121.5294,
    itemNote: '皺皺蛋糕 $160, 創意咖啡 $250。世界冠軍咖啡，空間非常大氣，人潮眾多。',
    flavor: { acidity: 4.5, bitterness: 2, roast: 2, sweetness: 4 },
    features: { hasSocket: false, unlimitedTime: false, workFriendly: false, hasCat: false, industrialStyle: true },
    createdAt: Date.now() - 10000000,
    isCustom: true
  },
  {
    id: 'real-2',
    name: 'Fika Fika Cafe',
    address: '台北市中山區伊通街33號',
    lat: 25.0513,
    lng: 121.5345,
    itemNote: '拿鐵 $180, 檸檬塔 $150。北歐烘焙風格，明亮舒適，適合早晨。',
    flavor: { acidity: 4, bitterness: 1.5, roast: 1.5, sweetness: 3.5 },
    features: { hasSocket: true, unlimitedTime: false, workFriendly: true, hasCat: false, industrialStyle: false },
    createdAt: Date.now() - 8000000,
    isCustom: true
  },
  {
    id: 'real-3',
    name: 'Coffee Stopover',
    address: '台中市西區民權路217巷24號',
    lat: 24.1458,
    lng: 120.6697,
    itemNote: '氣泡咖啡 $160。可以選焙度與萃取方式，非常專業的台中名店。',
    flavor: { acidity: 5, bitterness: 2, roast: 2, sweetness: 4 },
    features: { hasSocket: false, unlimitedTime: true, workFriendly: false, hasCat: false, industrialStyle: true },
    createdAt: Date.now() - 6000000,
    isCustom: true
  },
  {
    id: 'real-4',
    name: 'Paripari apt.',
    address: '台南市中西區忠義路二段158巷9號',
    lat: 22.9965,
    lng: 120.2030,
    itemNote: '老宅改建，風格非常復古。二樓是咖啡廳，三樓是民宿。',
    flavor: { acidity: 2, bitterness: 4, roast: 4, sweetness: 3 },
    features: { hasSocket: true, unlimitedTime: false, workFriendly: true, hasCat: true, industrialStyle: false },
    createdAt: Date.now() - 4000000,
    isCustom: true
  },
  {
    id: 'real-5',
    name: 'Ruins Coffee Roasters',
    address: '台北市文山區木柵路三段242號',
    lat: 24.9926,
    lng: 121.5714,
    itemNote: '廢墟風格，木柵必訪。手沖品質很穩，甜點也好吃。',
    flavor: { acidity: 3.5, bitterness: 2.5, roast: 3, sweetness: 3.5 },
    features: { hasSocket: false, unlimitedTime: true, workFriendly: false, hasCat: false, industrialStyle: true },
    createdAt: Date.now() - 2000000,
    isCustom: true
  }
];

export const FEATURE_LABELS: Record<keyof SpaceFeatures, string> = {
  hasSocket: '有插座',
  unlimitedTime: '不限時',
  workFriendly: '適合辦公',
  hasCat: '有貓',
  industrialStyle: '工業風'
};