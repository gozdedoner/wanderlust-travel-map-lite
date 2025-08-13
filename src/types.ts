export type PinStatus = 'visited' | 'wishlist';

export interface Pin {
  id: string;
  name: string;
  status: PinStatus;
  lat: number;
  lng: number;
  createdAt: string; // ISO
}
