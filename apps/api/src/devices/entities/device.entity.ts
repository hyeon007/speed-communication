export type DeviceBrand = 'apple' | 'samsung';
export type DevicePublicationStatus = 'draft' | 'published' | 'archived';

export interface CatalogDevice {
  id: number;
  slug: string;
  brand: DeviceBrand;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  colors: string[];
  storageOptions: string[];
  highlights: string[];
  status: DevicePublicationStatus;
  sortOrder: number;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
