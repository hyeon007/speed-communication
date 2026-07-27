import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_DEVICE_CATALOG,
  getDefaultDeviceDescription,
} from '../default-device-catalog';
import type { CatalogDevice } from '../entities/device.entity';
import type { DeviceRepository, DeviceWriteInput } from './device.repository';

@Injectable()
export class InMemoryDeviceRepository implements DeviceRepository {
  private devices: CatalogDevice[] = [];
  private sequence = 1;

  ensureDefaults(): Promise<void> {
    if (this.devices.length > 0) {
      return Promise.resolve();
    }

    const now = new Date();
    this.devices = DEFAULT_DEVICE_CATALOG.map((device) => ({
      id: this.sequence++,
      ...device,
      description: getDefaultDeviceDescription(device.name),
      colors: [],
      storageOptions: [],
      highlights: [device.tagline, '가격과 지원 혜택은 상담 후 안내'],
      status: 'published',
      releasedAt: null,
      createdAt: now,
      updatedAt: now,
    }));

    return Promise.resolve();
  }

  async findPublic(): Promise<CatalogDevice[]> {
    await this.ensureDefaults();
    return this.sorted(
      this.devices.filter((device) => device.status === 'published'),
    );
  }

  async findAll(): Promise<CatalogDevice[]> {
    await this.ensureDefaults();
    return this.sorted(this.devices);
  }

  async findBySlug(
    slug: string,
    publishedOnly: boolean,
  ): Promise<CatalogDevice | null> {
    await this.ensureDefaults();
    return (
      this.devices.find(
        (device) =>
          device.slug === slug &&
          (!publishedOnly || device.status === 'published'),
      ) ?? null
    );
  }

  async create(input: DeviceWriteInput): Promise<CatalogDevice> {
    await this.ensureDefaults();
    const now = new Date();
    const created: CatalogDevice = {
      id: this.sequence++,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.devices.push(created);
    return created;
  }

  async update(
    slug: string,
    input: Partial<DeviceWriteInput>,
  ): Promise<CatalogDevice> {
    await this.ensureDefaults();
    const target = this.devices.find((device) => device.slug === slug);

    if (!target) {
      throw new NotFoundException('기기 정보를 찾을 수 없습니다.');
    }

    Object.assign(target, input, { updatedAt: new Date() });
    return target;
  }

  private sorted(devices: CatalogDevice[]): CatalogDevice[] {
    return [...devices].sort((left, right) => {
      const byOrder = left.sortOrder - right.sortOrder;
      return byOrder !== 0 ? byOrder : left.name.localeCompare(right.name);
    });
  }
}
