import { Injectable, NotFoundException } from '@nestjs/common';
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
import {
  formatSeoulDateKey,
  getCurrentSeoulDateRange,
  getSeoulRecentDateWindow,
} from '../seoul-time.util';

@Injectable()
export class InMemoryLeadRepository implements LeadRepository {
  private leads: Lead[] = [];
  private sequence = 1;
  private statusAudits: LeadStatusAudit[] = [];
  private auditSequence = 1;

  create(input: CreateLeadDto): Promise<Lead> {
    const lead: Lead = {
      id: this.sequence++,
      name: input.name,
      phone: input.phone,
      interestDevice: input.interestDevice,
      consultationType: input.consultationType ?? null,
      preferredCarrier: input.preferredCarrier ?? null,
      contactTime: input.contactTime,
      memo: null,
      status: 'new',
      createdAt: new Date(),
    };

    this.leads.unshift(lead);
    return Promise.resolve(lead);
  }

  findAll(query: LeadListQuery): Promise<LeadListResult> {
    const sorted = this.filterAndSort(query);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.pageSize;
    const items = sorted.slice(start, start + query.pageSize);

    const recentWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentNewCount = this.leads.filter(
      (lead) => lead.status === 'new' && lead.createdAt >= recentWindowStart,
    ).length;

    return Promise.resolve({
      items,
      total,
      page,
      pageSize: query.pageSize,
      totalPages,
      recentNewCount,
    });
  }

  findForExport(query: LeadExportQuery): Promise<Lead[]> {
    return Promise.resolve(this.filterAndSort(query));
  }

  findStatusAudits(
    leadId: number,
    query: LeadStatusAuditQuery,
  ): Promise<LeadStatusAudit[]> {
    const items = this.statusAudits
      .filter((audit) => audit.leadId === leadId)
      .sort((a, b) => {
        const byDate = b.changedAt.getTime() - a.changedAt.getTime();

        if (byDate !== 0) {
          return byDate;
        }

        return b.id - a.id;
      })
      .slice(0, query.limit);

    return Promise.resolve(items);
  }

  updateStatus(
    id: number,
    input: UpdateLeadStatusDto,
    changedBy: string,
  ): Promise<Lead> {
    const target = this.leads.find((lead) => lead.id === id);

    if (!target) {
      throw new NotFoundException('Lead not found');
    }

    const previousStatus = target.status;
    target.status = input.status;

    this.appendStatusAudit({
      leadId: target.id,
      previousStatus,
      nextStatus: target.status,
      changedBy,
    });

    return Promise.resolve(target);
  }

  updateMemo(id: number, input: UpdateLeadMemoDto): Promise<Lead> {
    const target = this.leads.find((lead) => lead.id === id);

    if (!target) {
      throw new NotFoundException('Lead not found');
    }

    target.memo = input.memo?.trim() || null;
    return Promise.resolve(target);
  }

  bulkUpdateStatus(
    ids: number[],
    status: LeadStatus,
    changedBy: string,
  ): Promise<BulkUpdateStatusResult> {
    const uniqueIds = [...new Set(ids)];
    const updatedIds: number[] = [];
    const notFoundIds: number[] = [];

    uniqueIds.forEach((id) => {
      const target = this.leads.find((lead) => lead.id === id);

      if (!target) {
        notFoundIds.push(id);
        return;
      }

      const previousStatus = target.status;
      target.status = status;

      this.appendStatusAudit({
        leadId: target.id,
        previousStatus,
        nextStatus: target.status,
        changedBy,
      });

      updatedIds.push(id);
    });

    return Promise.resolve({
      requested: uniqueIds.length,
      updated: updatedIds.length,
      updatedIds,
      notFoundIds,
    });
  }

  getStats(): Promise<LeadStats> {
    const { start: startOfToday, end: endOfToday } = getCurrentSeoulDateRange();
    const { start: last7DaysStart } = getSeoulRecentDateWindow(7);

    const total = this.leads.length;
    const newCount = this.leads.filter((lead) => lead.status === 'new').length;
    const inProgressCount = this.leads.filter(
      (lead) => lead.status === 'in_progress',
    ).length;
    const completedCount = this.leads.filter(
      (lead) => lead.status === 'completed',
    ).length;
    const todayCount = this.leads.filter(
      (lead) => lead.createdAt >= startOfToday && lead.createdAt <= endOfToday,
    ).length;
    const last7DaysCount = this.leads.filter(
      (lead) => lead.createdAt >= last7DaysStart && lead.createdAt <= endOfToday,
    ).length;

    return Promise.resolve({
      total,
      newCount,
      inProgressCount,
      completedCount,
      todayCount,
      last7DaysCount,
    });
  }

  getTrend(days: number): Promise<LeadTrendStats> {
    const safeDays = Math.max(1, Math.min(days, 90));
    const { start: startDateObj, end: endDateObj, dateKeys } =
      getSeoulRecentDateWindow(safeDays);

    const dailyMap = new Map<string, number>(dateKeys.map((key) => [key, 0]));

    const inRange = this.leads.filter(
      (lead) => lead.createdAt >= startDateObj && lead.createdAt <= endDateObj,
    );

    inRange.forEach((lead) => {
      const key = formatSeoulDateKey(lead.createdAt);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
    });

    return Promise.resolve({
      days: safeDays,
      startDate: dateKeys[0],
      endDate: dateKeys[dateKeys.length - 1],
      daily: dateKeys.map((date) => ({
        date,
        count: dailyMap.get(date) ?? 0,
      })),
      newCount: inRange.filter((lead) => lead.status === 'new').length,
      inProgressCount: inRange.filter((lead) => lead.status === 'in_progress')
        .length,
      completedCount: inRange.filter((lead) => lead.status === 'completed')
        .length,
    });
  }

  getActivity(query: LeadActivityQuery): Promise<LeadActivityResult> {
    const safeLimit = Math.max(1, Math.min(query.limit, 200));
    const safePage = Math.max(1, query.page);
    const changedByKeyword = query.changedBy?.toLowerCase();

    const filtered = this.statusAudits
      .slice()
      .sort((a, b) => {
        const byDate = b.changedAt.getTime() - a.changedAt.getTime();
        if (byDate !== 0) {
          return byDate;
        }

        return b.id - a.id;
      })
      .filter((audit) => {
        const changedByMatched = changedByKeyword
          ? audit.changedBy.toLowerCase().includes(changedByKeyword)
          : true;
        const previousStatusMatched = query.previousStatus
          ? audit.previousStatus === query.previousStatus
          : true;
        const nextStatusMatched = query.nextStatus
          ? audit.nextStatus === query.nextStatus
          : true;
        const startDateMatched = query.startDate
          ? audit.changedAt >= query.startDate
          : true;
        const endDateMatched = query.endDate
          ? audit.changedAt <= query.endDate
          : true;

        return (
          changedByMatched &&
          previousStatusMatched &&
          nextStatusMatched &&
          startDateMatched &&
          endDateMatched
        );
      });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    const page = Math.min(safePage, totalPages);
    const startIndex = (page - 1) * safeLimit;

    const items: LeadActivityItem[] = filtered
      .slice(startIndex, startIndex + safeLimit)
      .map((audit) => {
        const lead = this.leads.find((item) => item.id === audit.leadId);

        return {
          auditId: audit.id,
          leadId: audit.leadId,
          leadName: lead?.name ?? '(deleted)',
          leadPhone: lead?.phone ?? '-',
          previousStatus: audit.previousStatus,
          nextStatus: audit.nextStatus,
          changedBy: audit.changedBy,
          changedAt: audit.changedAt,
        };
      });

    return Promise.resolve({
      items,
      total,
      page,
      pageSize: safeLimit,
      totalPages,
    });
  }

  private appendStatusAudit(input: {
    leadId: number;
    previousStatus: LeadStatus;
    nextStatus: LeadStatus;
    changedBy: string;
  }): void {
    if (input.previousStatus === input.nextStatus) {
      return;
    }

    this.statusAudits.push({
      id: this.auditSequence++,
      leadId: input.leadId,
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
      changedBy: input.changedBy,
      changedAt: new Date(),
    });
  }

  private filterAndSort(
    query: Pick<
      LeadListQuery,
      'search' | 'status' | 'startDate' | 'endDate' | 'sortBy' | 'sortDirection'
    >,
  ): Lead[] {
    const keyword = query.search?.toLowerCase();
    const filtered = this.leads.filter((lead) => {
      const statusMatched = query.status ? lead.status === query.status : true;
      const startDateMatched = query.startDate
        ? lead.createdAt >= query.startDate
        : true;
      const endDateMatched = query.endDate
        ? lead.createdAt <= query.endDate
        : true;

      const searchMatched = keyword
        ? [
            lead.name,
            lead.phone,
            lead.interestDevice,
            lead.consultationType ?? '',
            lead.preferredCarrier ?? '',
            lead.contactTime,
            lead.memo ?? '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        : true;

      return (
        statusMatched && startDateMatched && endDateMatched && searchMatched
      );
    });

    return [...filtered].sort((a, b) => {
      const direction = query.sortDirection === 'asc' ? 1 : -1;

      if (query.sortBy === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }

      if (query.sortBy === 'status') {
        return a.status.localeCompare(b.status) * direction;
      }

      return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
    });
  }
}
