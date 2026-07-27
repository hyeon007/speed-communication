import type {
  CatalogDevice,
  DeviceBrand,
  DevicePublicationStatus,
} from '../entities/device.entity';

export const DEVICE_REPOSITORY = Symbol('DEVICE_REPOSITORY');

export type DeviceWriteInput = {
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
};

export interface DeviceRepository {
  ensureDefaults(): Promise<void>;
  findPublic(): Promise<CatalogDevice[]>;
  findAll(): Promise<CatalogDevice[]>;
  findBySlug(
    slug: string,
    publishedOnly: boolean,
  ): Promise<CatalogDevice | null>;
  create(input: DeviceWriteInput): Promise<CatalogDevice>;
  update(
    slug: string,
    input: Partial<DeviceWriteInput>,
  ): Promise<CatalogDevice>;
}
