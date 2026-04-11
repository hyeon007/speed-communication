import { Inject, Injectable } from '@nestjs/common';
import { BulkUpdateLeadStatusDto } from './dto/bulk-update-lead-status.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetAdminLeadsQueryDto } from './dto/get-admin-leads-query.dto';
import { GetLeadActivityQueryDto } from './dto/get-lead-activity-query.dto';
import { GetLeadStatusAuditsQueryDto } from './dto/get-lead-status-audits-query.dto';
import { GetLeadTrendQueryDto } from './dto/get-lead-trend-query.dto';
import { UpdateLeadMemoDto } from './dto/update-lead-memo.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { Lead } from './entities/lead.entity';
import type { LeadStatusAudit } from './entities/lead.entity';
import { LeadNotifierService } from './lead-notifier.service';
import { LEAD_REPOSITORY } from './repositories/lead.repository';
import type {
  LeadActivityQuery,
  BulkUpdateStatusResult,
  LeadExportQuery,
  LeadListQuery,
  LeadListResult,
  LeadStats,
  LeadActivityResult,
  LeadTrendStats,
  LeadRepository,
} from './repositories/lead.repository';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SEOUL_UTC_OFFSET_HOURS = 9;

@Injectable()
export class LeadsService {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repository: LeadRepository,
    private readonly notifier: LeadNotifierService,
  ) {}

  async create(input: CreateLeadDto): Promise<Lead> {
    const created = await this.repository.create(input);
    await this.notifier.notifyLeadCreated(created);
    return created;
  }

  async findAll(query: GetAdminLeadsQueryDto): Promise<LeadListResult> {
    return this.repository.findAll(this.toLeadListQuery(query));
  }

  async exportLeads(query: GetAdminLeadsQueryDto): Promise<Lead[]> {
    const normalized = this.toLeadExportQuery(query);
    return this.repository.findForExport(normalized);
  }

  async getStats(): Promise<LeadStats> {
    return this.repository.getStats();
  }

  async getTrend(query: GetLeadTrendQueryDto): Promise<LeadTrendStats> {
    return this.repository.getTrend(query.days ?? 7);
  }

  async getActivity(
    query: GetLeadActivityQueryDto,
  ): Promise<LeadActivityResult> {
    return this.repository.getActivity(this.toLeadActivityQuery(query));
  }

  async bulkUpdateStatus(
    input: BulkUpdateLeadStatusDto,
    changedBy: string,
  ): Promise<BulkUpdateStatusResult> {
    const result = await this.repository.bulkUpdateStatus(
      input.ids,
      input.status,
      changedBy,
    );

    await this.notifier.notifyBulkStatusChanged({
      requested: result.requested,
      updated: result.updated,
      updatedIds: result.updatedIds,
      notFoundIds: result.notFoundIds,
      nextStatus: input.status,
      changedBy,
    });

    return result;
  }

  async findStatusAudits(
    leadId: number,
    query: GetLeadStatusAuditsQueryDto,
  ): Promise<LeadStatusAudit[]> {
    return this.repository.findStatusAudits(leadId, {
      limit: query.limit ?? 20,
    });
  }

  async updateStatus(
    id: number,
    input: UpdateLeadStatusDto,
    changedBy: string,
  ): Promise<Lead> {
    const updated = await this.repository.updateStatus(id, input, changedBy);
    const latestAudit = await this.repository.findStatusAudits(id, {
      limit: 1,
    });

    await this.notifier.notifyLeadStatusChanged({
      leadId: id,
      previousStatus: latestAudit[0]?.previousStatus ?? null,
      nextStatus: input.status,
      changedBy,
    });

    return updated;
  }

  async updateMemo(id: number, input: UpdateLeadMemoDto): Promise<Lead> {
    return this.repository.updateMemo(id, input);
  }

  private toLeadListQuery(query: GetAdminLeadsQueryDto): LeadListQuery {
    const base = this.toLeadExportQuery(query);

    return {
      ...base,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    };
  }

  private toLeadExportQuery(query: GetAdminLeadsQueryDto): LeadExportQuery {
    const startDate = query.startDate
      ? this.parseStartDate(query.startDate)
      : undefined;
    const endDate = query.endDate
      ? this.parseEndDate(query.endDate)
      : undefined;

    return {
      status: query.status,
      search: query.search?.trim() || undefined,
      startDate,
      endDate,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? 'desc',
    };
  }

  private toLeadActivityQuery(
    query: GetLeadActivityQueryDto,
  ): LeadActivityQuery {
    const startDate = query.startDate
      ? this.parseStartDate(query.startDate)
      : undefined;
    const endDate = query.endDate
      ? this.parseEndDate(query.endDate)
      : undefined;

    return {
      limit: query.limit ?? 20,
      page: query.page ?? 1,
      changedBy: query.changedBy?.trim() || undefined,
      previousStatus: query.previousStatus,
      nextStatus: query.nextStatus,
      startDate,
      endDate,
    };
  }

  private parseStartDate(input: string): Date {
    const parsedDate = this.parseSeoulDateBoundary(input, 0, 0, 0, 0);

    if (parsedDate) {
      return parsedDate;
    }

    return new Date(input);
  }

  private parseEndDate(input: string): Date {
    const parsedDate = this.parseSeoulDateBoundary(input, 23, 59, 59, 999);

    if (parsedDate) {
      return parsedDate;
    }

    return new Date(input);
  }

  private parseSeoulDateBoundary(
    input: string,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
  ): Date | null {
    if (!DATE_ONLY_PATTERN.test(input)) {
      return null;
    }

    const [year, month, day] = input.split('-').map(Number);

    return new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hours - SEOUL_UTC_OFFSET_HOURS,
        minutes,
        seconds,
        milliseconds,
      ),
    );
  }
}
