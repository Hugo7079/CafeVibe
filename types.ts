export interface FlavorProfile {
  acidity: number;   // 酸度
  bitterness: number;// 苦味
  roast: number;     // 焙度
  sweetness: number; // 甜感
}

export interface SpaceFeatures {
  hasSocket: boolean;      // 有插座
  unlimitedTime: boolean;  // 不限時
  workFriendly: boolean;   // 適合辦公
  hasCat: boolean;         // 有貓
  industrialStyle: boolean;// 工業風
}

export interface Cafe {
  id: string;
  googlePlaceId?: string; // Optional, might be custom
  name: string;
  address: string;
  lat: number;
  lng: number;
  itemNote: string;      // 品項與價格紀錄
  flavor: FlavorProfile;
  features: SpaceFeatures;
  photoUrl?: string;     // User uploaded/placeholder
  rating?: number;       // User rating 1-5
  createdAt: number;
  isCustom: boolean;
}

export interface MapClickEvent {
  lat: number;
  lng: number;
  address?: string;
}
