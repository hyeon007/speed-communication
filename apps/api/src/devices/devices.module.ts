import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { InMemoryDeviceRepository } from './repositories/in-memory-device.repository';
import { PrismaDeviceRepository } from './repositories/prisma-device.repository';
import { DEVICE_REPOSITORY } from './repositories/device.repository';

@Module({
  imports: [AuthModule],
  controllers: [DevicesController],
  providers: [
    DevicesService,
    InMemoryDeviceRepository,
    PrismaDeviceRepository,
    {
      provide: DEVICE_REPOSITORY,
      inject: [InMemoryDeviceRepository, PrismaDeviceRepository],
      useFactory: (
        inMemoryRepository: InMemoryDeviceRepository,
        prismaRepository: PrismaDeviceRepository,
      ) => {
        const storageMode = process.env.LEAD_STORAGE ?? 'memory';
        return storageMode === 'prisma' ? prismaRepository : inMemoryRepository;
      },
    },
  ],
})
export class DevicesModule {}
