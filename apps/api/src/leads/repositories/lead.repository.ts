import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadStatusDto } from '../dto/update-lead-status.dto';
import { UpdateLeadMemoDto } from '../dto/update-lead-memo.dto';
import { Lead } from '../entities/lead.entity';
import type { LeadStatus, LeadStatusAudit } from '../entities/lead.entity';

export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');

export interface LeadListQuery {
  search?: string;
  status?: LeadStatus;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
  sortBy: 'createdAt' | 'name' | 'status';
  sortDirection: 'asc' | 'desc';
}

export interface LeadListResult {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  recentNewCount: number;
}

export interface LeadExportQuery {
  search?: string;
  status?: LeadStatus;
  startDate?: Date;
  endDate?: Date;
  sortBy: 'createdAt' | 'name' | 'status';
  sortDirection: 'asc' | 'desc';
}

export interface BulkUpdateStatusResult {
  requested: number;
  updated: number;
  updatedIds: number[];
  notFoundIds: number[];
}

export interface LeadStatusAuditQuery {
  limit: number;
}

export interface LeadStats {
  total: number;
  newCount: number;
  inProgressCount: number;
  completedCount: number;
  todayCount: number;
  last7DaysCount: number;
}

export interface LeadTrendPoint {
  date: string;
  count: number;
}

export interface LeadTrendStats {
  days: number;
  startDate: string;
  endDate: string;
  daily: LeadTrendPoint[];
  newCount: number;
  inProgressCount: number;
  completedCount: number;
}

export interface LeadActivityItem {
  auditId: number;
  leadId: number;
  leadName: string;
  leadPhone: string;
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  changedBy: string;
  changedAt: Date;
}

export interface LeadActivityQuery {
  limit: number;
  page: number;
  changedBy?: string;
  previousStatus?: LeadStatus;
  nextStatus?: LeadStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface LeadActivityResult {
  items: LeadActivityItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeadRepository {
  create(input: CreateLeadDto): Promise<Lead>;
  findAll(query: LeadListQuery): Promise<LeadListResult>;
  findForExport(query: LeadExportQuery): Promise<Lead[]>;
  findStatusAudits(
    leadId: number,
    query: LeadStatusAuditQuery,
  ): Promise<LeadStatusAudit[]>;
  updateStatus(
    id: number,
    input: UpdateLeadStatusDto,
    changedBy: string,
  ): Promise<Lead>;
  updateMemo(id: number, input: UpdateLeadMemoDto): Promise<Lead>;
  bulkUpdateStatus(
    ids: number[],
    status: LeadStatus,
    changedBy: string,
  ): Promise<BulkUpdateStatusResult>;
  getStats(): Promise<LeadStats>;
  getTrend(days: number): Promise<LeadTrendStats>;
  getActivity(query: LeadActivityQuery): Promise<LeadActivityResult>;
}
