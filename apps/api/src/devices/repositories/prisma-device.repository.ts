import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeviceBrand as PrismaDeviceBrand,
  DevicePublicationStatus as PrismaDevicePublicationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_DEVICE_CATALOG,
  getDefaultDeviceDescription,
} from '../default-device-catalog';
import type { CatalogDevice } from '../entities/device.entity';
import type { DeviceRepository, DeviceWriteInput } from './device.repository';

@Injectable()
export class PrismaDeviceRepository implements DeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults(): Promise<void> {
    const count = await this.prisma.device.count();

    if (count > 0) {
      return;
    }

    await this.prisma.device.createMany({
      data: DEFAULT_DEVICE_CATALOG.map((device) => ({
        ...device,
        description: getDefaultDeviceDescription(device.name),
        colors: [],
        storageOptions: [],
        highlights: [device.tagline, '가격과 지원 혜택은 상담 후 안내'],
        status: PrismaDevicePublicationStatus.published,
      })),
      skipDuplicates: true,
    });
  }

  async findPublic(): Promise<CatalogDevice[]> {
    return this.prisma.device.findMany({
      where: { status: PrismaDevicePublicationStatus.published },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findAll(): Promise<CatalogDevice[]> {
    return this.prisma.device.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBySlug(
    slug: string,
    publishedOnly: boolean,
  ): Promise<CatalogDevice | null> {
    return this.prisma.device.findFirst({
      where: {
        slug,
        ...(publishedOnly
          ? { status: PrismaDevicePublicationStatus.published }
          : {}),
      },
    });
  }

  async create(input: DeviceWriteInput): Promise<CatalogDevice> {
    return this.prisma.device.create({
      data: this.toPrismaCreateInput(input),
    });
  }

  async update(
    slug: string,
    input: Partial<DeviceWriteInput>,
  ): Promise<CatalogDevice> {
    const found = await this.prisma.device.findUnique({ where: { slug } });

    if (!found) {
      throw new NotFoundException('기기 정보를 찾을 수 없습니다.');
    }

    return this.prisma.device.update({
      where: { slug },
      data: this.toPrismaUpdateInput(input),
    });
  }

  private toPrismaCreateInput(
    input: DeviceWriteInput,
  ): Prisma.DeviceCreateInput {
    return {
      ...input,
      brand: input.brand as PrismaDeviceBrand,
      status: input.status as PrismaDevicePublicationStatus,
    };
  }

  private toPrismaUpdateInput(
    input: Partial<DeviceWriteInput>,
  ): Prisma.DeviceUpdateInput {
    return {
      ...input,
      ...(input.brand !== undefined
        ? { brand: input.brand as PrismaDeviceBrand }
        : {}),
      ...(input.status !== undefined
        ? { status: input.status as PrismaDevicePublicationStatus }
        : {}),
    };
  }
}
