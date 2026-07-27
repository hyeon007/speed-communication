import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import type { CatalogDevice } from './entities/device.entity';
import { DEVICE_REPOSITORY } from './repositories/device.repository';
import type {
  DeviceRepository,
  DeviceWriteInput,
} from './repositories/device.repository';

@Injectable()
export class DevicesService implements OnModuleInit {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly repository: DeviceRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.repository.ensureDefaults();
  }

  findPublic(): Promise<CatalogDevice[]> {
    return this.repository.findPublic();
  }

  async findPublicBySlug(slug: string): Promise<CatalogDevice> {
    const device = await this.repository.findBySlug(slug, true);

    if (!device) {
      throw new NotFoundException('공개된 기기 정보를 찾을 수 없습니다.');
    }

    return device;
  }

  findAll(): Promise<CatalogDevice[]> {
    return this.repository.findAll();
  }

  async create(input: CreateDeviceDto): Promise<CatalogDevice> {
    const existing = await this.repository.findBySlug(input.slug, false);

    if (existing) {
      throw new ConflictException('이미 사용 중인 기기 URL 식별자입니다.');
    }

    return this.repository.create(this.toCreateInput(input));
  }

  async update(slug: string, input: UpdateDeviceDto): Promise<CatalogDevice> {
    if (input.slug && input.slug !== slug) {
      const existing = await this.repository.findBySlug(input.slug, false);

      if (existing) {
        throw new ConflictException('이미 사용 중인 기기 URL 식별자입니다.');
      }
    }

    return this.repository.update(slug, this.toUpdateInput(input));
  }

  private toCreateInput(input: CreateDeviceDto): DeviceWriteInput {
    return {
      slug: input.slug.trim(),
      brand: input.brand,
      name: input.name.trim(),
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      imageUrl: input.imageUrl?.trim() || null,
      sourceUrl: input.sourceUrl?.trim() || null,
      colors: this.cleanList(input.colors),
      storageOptions: this.cleanList(input.storageOptions),
      highlights: this.cleanList(input.highlights),
      status: input.status ?? 'draft',
      sortOrder: input.sortOrder ?? 0,
      releasedAt: input.releasedAt ? new Date(input.releasedAt) : null,
    };
  }

  private toUpdateInput(input: UpdateDeviceDto): Partial<DeviceWriteInput> {
    return {
      ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
      ...(input.brand !== undefined ? { brand: input.brand } : {}),
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.tagline !== undefined ? { tagline: input.tagline.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      ...(input.imageUrl !== undefined
        ? { imageUrl: input.imageUrl.trim() || null }
        : {}),
      ...(input.sourceUrl !== undefined
        ? { sourceUrl: input.sourceUrl.trim() || null }
        : {}),
      ...(input.colors !== undefined
        ? { colors: this.cleanList(input.colors) }
        : {}),
      ...(input.storageOptions !== undefined
        ? { storageOptions: this.cleanList(input.storageOptions) }
        : {}),
      ...(input.highlights !== undefined
        ? { highlights: this.cleanList(input.highlights) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.releasedAt !== undefined
        ? { releasedAt: input.releasedAt ? new Date(input.releasedAt) : null }
        : {}),
    };
  }

  private cleanList(items: string[] | undefined): string[] {
    return (items ?? []).map((item) => item.trim()).filter(Boolean);
  }
}
