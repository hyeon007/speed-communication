import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeadNotifierService } from './lead-notifier.service';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { InMemoryLeadRepository } from './repositories/in-memory-lead.repository';
import { PrismaLeadRepository } from './repositories/prisma-lead.repository';
import { LEAD_REPOSITORY } from './repositories/lead.repository';

@Module({
  imports: [AuthModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadNotifierService,
    InMemoryLeadRepository,
    PrismaLeadRepository,
    {
      provide: LEAD_REPOSITORY,
      inject: [InMemoryLeadRepository, PrismaLeadRepository],
      useFactory: (
        inMemoryRepo: InMemoryLeadRepository,
        prismaRepo: PrismaLeadRepository,
      ) => {
        const storageMode = process.env.LEAD_STORAGE ?? 'memory';
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction && storageMode !== 'prisma') {
          throw new Error(
            'Production mode requires LEAD_STORAGE=prisma. In-memory storage is development-only.',
          );
        }

        if (storageMode === 'prisma') {
          return prismaRepo;
        }

        return inMemoryRepo;
      },
    },
  ],
})
export class LeadsModule {}
