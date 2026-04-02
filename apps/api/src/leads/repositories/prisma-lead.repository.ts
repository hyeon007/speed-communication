import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus as PrismaLeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadMemoDto } from '../dto/update-lead-memo.dto';
import { UpdateLeadStatusDto } from '../dto/update-lead-status.dto';
import { Lead, LeadStatus, LeadStatusAudit } from '../entities/lead.entity';
import {
  BulkUpdateStatusResult,
  LeadActivityItem,
  LeadActivityQuery,
  LeadActivityResult,
  LeadExportQuery,
  LeadStats,
  LeadTrendStats,
  LeadStatusAuditQuery,
  LeadListQuery,
  LeadListResult,
  LeadRepository,
} from './lead.repository';

@Injectable()
export class PrismaLeadRepository implements LeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateLeadDto): Promise<Lead> {
    return this.prisma.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        interestDevice: input.interestDevice,
        contactTime: input.contactTime,
        memo: null,
      },
    });
  }

  async findAll(query: LeadListQuery): Promise<LeadListResult> {
    const where = this.buildWhere(query);
    const total = await this.prisma.lead.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const skip = (page - 1) * query.pageSize;

    const items = await this.prisma.lead.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: {
        [query.sortBy]: query.sortDirection,
      },
    });

    const recentWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNewCount = await this.prisma.lead.count({
      where: {
        status: PrismaLeadStatus.new,
        createdAt: {
          gte: recentWindowStart,
        },
      },
    });

    return {
      items,
      total,
      page,
      pageSize: query.pageSize,
      totalPages,
      recentNewCount,
    };
  }

  async findForExport(query: LeadExportQuery): Promise<Lead[]> {
    const where = this.buildWhere(query);

    return this.prisma.lead.findMany({
      where,
      orderBy: {
        [query.sortBy]: query.sortDirection,
      },
    });
  }

  async findStatusAudits(
    leadId: number,
    query: LeadStatusAuditQuery,
  ): Promise<LeadStatusAudit[]> {
    return this.prisma.leadStatusAudit.findMany({
      where: {
        leadId,
      },
      take: query.limit,
      orderBy: [{ changedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async updateStatus(
    id: number,
    input: UpdateLeadStatusDto,
    changedBy: string,
  ): Promise<Lead> {
    const found = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException('Lead not found');
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        status: input.status as PrismaLeadStatus,
      },
    });

    if (found.status !== updated.status) {
      await this.prisma.leadStatusAudit.create({
        data: {
          leadId: id,
          previousStatus: found.status,
          nextStatus: updated.status,
          changedBy,
        },
      });
    }

    return updated;
  }

  async updateMemo(id: number, input: UpdateLeadMemoDto): Promise<Lead> {
    const found = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.lead.update({
      where: { id },
      data: {
        memo: input.memo?.trim() || null,
      },
    });
  }

  async bulkUpdateStatus(
    ids: number[],
    status: LeadStatus,
    changedBy: string,
  ): Promise<BulkUpdateStatusResult> {
    const uniqueIds = [...new Set(ids)];

    const found = await this.prisma.lead.findMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    const foundIds = found.map((row) => row.id);
    const notFoundIds = uniqueIds.filter((id) => !foundIds.includes(id));

    if (foundIds.length > 0) {
      await this.prisma.lead.updateMany({
        where: {
          id: {
            in: foundIds,
          },
        },
        data: {
          status: status as PrismaLeadStatus,
        },
      });

      const auditRows = found
        .filter((row) => row.status !== (status as PrismaLeadStatus))
        .map((row) => ({
          leadId: row.id,
          previousStatus: row.status,
          nextStatus: status as PrismaLeadStatus,
          changedBy,
        }));

      if (auditRows.length > 0) {
        await this.prisma.leadStatusAudit.createMany({
          data: auditRows,
        });
      }
    }

    return {
      requested: uniqueIds.length,
      updated: foundIds.length,
      updatedIds: foundIds,
      notFoundIds,
    };
  }

  async getStats(): Promise<LeadStats> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      newCount,
      inProgressCount,
      completedCount,
      todayCount,
      last7DaysCount,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: PrismaLeadStatus.new } }),
      this.prisma.lead.count({
        where: { status: PrismaLeadStatus.in_progress },
      }),
      this.prisma.lead.count({
        where: { status: PrismaLeadStatus.completed },
      }),
      this.prisma.lead.count({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      }),
      this.prisma.lead.count({
        where: {
          createdAt: {
            gte: last7DaysStart,
          },
        },
      }),
    ]);

    return {
      total,
      newCount,
      inProgressCount,
      completedCount,
      todayCount,
      last7DaysCount,
    };
  }

  async getTrend(days: number): Promise<LeadTrendStats> {
    const safeDays = Math.max(1, Math.min(days, 90));
    const endDateObj = new Date();
    endDateObj.setHours(23, 59, 59, 999);

    const startDateObj = new Date(endDateObj);
    startDateObj.setDate(startDateObj.getDate() - (safeDays - 1));
    startDateObj.setHours(0, 0, 0, 0);

    const dateKeys = Array.from({ length: safeDays }, (_, index) => {
      const date = new Date(startDateObj);
      date.setDate(startDateObj.getDate() + index);
      return date.toISOString().slice(0, 10);
    });

    const dailyMap = new Map<string, number>(dateKeys.map((key) => [key, 0]));

    const rows = await this.prisma.lead.findMany({
      where: {
        createdAt: {
          gte: startDateObj,
          lte: endDateObj,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    rows.forEach((row) => {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
    });

    return {
      days: safeDays,
      startDate: dateKeys[0] ?? startDateObj.toISOString().slice(0, 10),
      endDate:
        dateKeys[dateKeys.length - 1] ?? endDateObj.toISOString().slice(0, 10),
      daily: dateKeys.map((date) => ({
        date,
        count: dailyMap.get(date) ?? 0,
      })),
      newCount: rows.filter((row) => row.status === PrismaLeadStatus.new)
        .length,
      inProgressCount: rows.filter(
        (row) => row.status === PrismaLeadStatus.in_progress,
      ).length,
      completedCount: rows.filter(
        (row) => row.status === PrismaLeadStatus.completed,
      ).length,
    };
  }

  async getActivity(query: LeadActivityQuery): Promise<LeadActivityResult> {
    const safeLimit = Math.max(1, Math.min(query.limit, 200));
    const safePage = Math.max(1, query.page);
    const where: Prisma.LeadStatusAuditWhereInput = {
      ...(query.changedBy
        ? {
            changedBy: {
              contains: query.changedBy,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.previousStatus
        ? {
            previousStatus: query.previousStatus as PrismaLeadStatus,
          }
        : {}),
      ...(query.nextStatus
        ? {
            nextStatus: query.nextStatus as PrismaLeadStatus,
          }
        : {}),
      ...(query.startDate || query.endDate
        ? {
            changedAt: {
              ...(query.startDate ? { gte: query.startDate } : {}),
              ...(query.endDate ? { lte: query.endDate } : {}),
            },
          }
        : {}),
    };

    const total = await this.prisma.leadStatusAudit.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const page = Math.min(safePage, totalPages);
    const skip = (page - 1) * safeLimit;

    const rows = await this.prisma.leadStatusAudit.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: [{ changedAt: 'desc' }, { id: 'desc' }],
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    const items: LeadActivityItem[] = rows.map((row) => ({
      auditId: row.id,
      leadId: row.leadId,
      leadName: row.lead.name,
      leadPhone: row.lead.phone,
      previousStatus: row.previousStatus,
      nextStatus: row.nextStatus,
      changedBy: row.changedBy,
      changedAt: row.changedAt,
    }));

    return {
      items,
      total,
      page,
      pageSize: safeLimit,
      totalPages,
    };
  }

  private buildWhere(
    query: Pick<
      LeadListQuery,
      'search' | 'status' | 'startDate' | 'endDate' | 'sortBy' | 'sortDirection'
    >,
  ): Prisma.LeadWhereInput {
    const createdAt = {
      ...(query.startDate ? { gte: query.startDate } : {}),
      ...(query.endDate ? { lte: query.endDate } : {}),
    };

    return {
      ...(query.status ? { status: query.status as PrismaLeadStatus } : {}),
      ...(query.startDate || query.endDate ? { createdAt } : {}),
      ...(query.search
        ? {
            OR: [
              {
                name: { contains: query.search, mode: 'insensitive' },
              },
              {
                phone: { contains: query.search, mode: 'insensitive' },
              },
              {
                interestDevice: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                contactTime: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                memo: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };
  }
}
