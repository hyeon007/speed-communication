import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import type { AdminRequest } from '../auth/admin-auth.guard';
import { AdminBulkWriteGuard } from '../auth/admin-bulk-write.guard';
import { AdminWriteGuard } from '../auth/admin-write.guard';
import {
  AdminBulkWriteRateLimitGuard,
  AdminWriteRateLimitGuard,
  PublicLeadRateLimitGuard,
} from '../auth/rate-limit.guard';
import { BulkUpdateLeadStatusDto } from './dto/bulk-update-lead-status.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { GetAdminLeadsQueryDto } from './dto/get-admin-leads-query.dto';
import { GetLeadActivityQueryDto } from './dto/get-lead-activity-query.dto';
import { GetLeadStatusAuditsQueryDto } from './dto/get-lead-status-audits-query.dto';
import { GetLeadTrendQueryDto } from './dto/get-lead-trend-query.dto';
import { UpdateLeadMemoDto } from './dto/update-lead-memo.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';
import type { Lead } from './entities/lead.entity';

@ApiTags('Leads')
@Controller('api/v1')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  private getAdminUsername(request: AdminRequest): string {
    return request.admin?.username ?? 'admin';
  }

  private escapeCsvCell(value: string | number | null): string {
    if (value === null) {
      return '';
    }

    const normalized = String(value).replace(/\r\n|\r|\n/g, '\\n');
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private toCsv(leads: Lead[]): string {
    const header = [
      'id',
      'name',
      'phone',
      'interestDevice',
      'contactTime',
      'status',
      'memo',
      'createdAt',
    ];

    const rows = leads.map((lead) =>
      [
        lead.id,
        lead.name,
        lead.phone,
        lead.interestDevice,
        lead.contactTime,
        lead.status,
        lead.memo,
        lead.createdAt.toISOString(),
      ]
        .map((cell) => this.escapeCsvCell(cell))
        .join(','),
    );

    return [header.join(','), ...rows].join('\n');
  }

  private toActivityCsv(
    items: Array<{
      auditId: number;
      leadId: number;
      leadName: string;
      leadPhone: string;
      previousStatus: string;
      nextStatus: string;
      changedBy: string;
      changedAt: Date | string;
    }>,
  ): string {
    const header = [
      'auditId',
      'leadId',
      'leadName',
      'leadPhone',
      'previousStatus',
      'nextStatus',
      'changedBy',
      'changedAt',
    ];

    const rows = items.map((item) =>
      [
        item.auditId,
        item.leadId,
        item.leadName,
        item.leadPhone,
        item.previousStatus,
        item.nextStatus,
        item.changedBy,
        item.changedAt instanceof Date
          ? item.changedAt.toISOString()
          : item.changedAt,
      ]
        .map((cell) => this.escapeCsvCell(cell))
        .join(','),
    );

    return [header.join(','), ...rows].join('\n');
  }

  @ApiOperation({ summary: 'Create public lead inquiry' })
  @ApiBody({ type: CreateLeadDto })
  @ApiCreatedResponse({
    description: 'Lead created successfully',
    schema: {
      type: 'object',
      properties: {
        leadId: { type: 'number', example: 1 },
        status: { type: 'string', example: 'received' },
        message: { type: 'string', example: '상담 신청이 접수되었습니다.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            phone: { type: 'string' },
            interestDevice: { type: 'string' },
            contactTime: { type: 'string' },
            memo: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['new', 'in_progress', 'completed'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: [
            'id',
            'name',
            'phone',
            'interestDevice',
            'contactTime',
            'memo',
            'status',
            'createdAt',
          ],
        },
      },
      required: ['leadId', 'status', 'message', 'data'],
    },
  })
  @UseGuards(PublicLeadRateLimitGuard)
  @Post('leads')
  async createLead(@Body() body: CreateLeadDto) {
    const lead = await this.leadsService.create(body);

    return {
      leadId: lead.id,
      status: 'received',
      message: '상담 신청이 접수되었습니다.',
      data: lead,
    };
  }

  @ApiOperation({ summary: 'Get admin lead list with filtering/pagination' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({
    description: 'Lead list response',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
        recentNewCount: { type: 'number' },
        sortBy: { type: 'string', enum: ['createdAt', 'name', 'status'] },
        sortDirection: { type: 'string', enum: ['asc', 'desc'] },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              phone: { type: 'string' },
              interestDevice: { type: 'string' },
              contactTime: { type: 'string' },
              memo: { type: 'string', nullable: true },
              status: {
                type: 'string',
                enum: ['new', 'in_progress', 'completed'],
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'id',
              'name',
              'phone',
              'interestDevice',
              'contactTime',
              'memo',
              'status',
              'createdAt',
            ],
          },
        },
      },
      required: [
        'count',
        'page',
        'pageSize',
        'totalPages',
        'recentNewCount',
        'sortBy',
        'sortDirection',
        'data',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads')
  async getLeads(@Query() query: GetAdminLeadsQueryDto) {
    const result = await this.leadsService.findAll(query);

    return {
      count: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      recentNewCount: result.recentNewCount,
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? 'desc',
      data: result.items,
    };
  }

  @ApiOperation({ summary: 'Get admin lead statistics summary' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({
    description: 'Lead statistics overview',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        newCount: { type: 'number' },
        inProgressCount: { type: 'number' },
        completedCount: { type: 'number' },
        todayCount: { type: 'number' },
        last7DaysCount: { type: 'number' },
      },
      required: [
        'total',
        'newCount',
        'inProgressCount',
        'completedCount',
        'todayCount',
        'last7DaysCount',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads/stats')
  async getLeadStats() {
    return this.leadsService.getStats();
  }

  @ApiOperation({ summary: 'Get recent lead status-change activity feed' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({
    description: 'Recent status-change activity',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              auditId: { type: 'number' },
              leadId: { type: 'number' },
              leadName: { type: 'string' },
              leadPhone: { type: 'string' },
              previousStatus: {
                type: 'string',
                enum: ['new', 'in_progress', 'completed'],
              },
              nextStatus: {
                type: 'string',
                enum: ['new', 'in_progress', 'completed'],
              },
              changedBy: { type: 'string' },
              changedAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'auditId',
              'leadId',
              'leadName',
              'leadPhone',
              'previousStatus',
              'nextStatus',
              'changedBy',
              'changedAt',
            ],
          },
        },
      },
      required: ['count', 'page', 'pageSize', 'totalPages', 'data'],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads/activity')
  async getLeadActivity(@Query() query: GetLeadActivityQueryDto) {
    const result = await this.leadsService.getActivity(query);

    return {
      count: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      data: result.items,
    };
  }

  @ApiOperation({ summary: 'Export lead activity feed to CSV' })
  @ApiBearerAuth('admin-bearer')
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'Activity CSV file content',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads/activity.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="lead-activity.csv"')
  async exportLeadActivityCsv(@Query() query: GetLeadActivityQueryDto) {
    const result = await this.leadsService.getActivity(query);
    return this.toActivityCsv(result.items);
  }

  @ApiOperation({ summary: 'Get admin lead trend statistics by day' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({
    description: 'Lead trend overview for selected day window',
    schema: {
      type: 'object',
      properties: {
        days: { type: 'number' },
        startDate: { type: 'string', example: '2026-04-01' },
        endDate: { type: 'string', example: '2026-04-07' },
        daily: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2026-04-01' },
              count: { type: 'number' },
            },
            required: ['date', 'count'],
          },
        },
        newCount: { type: 'number' },
        inProgressCount: { type: 'number' },
        completedCount: { type: 'number' },
      },
      required: [
        'days',
        'startDate',
        'endDate',
        'daily',
        'newCount',
        'inProgressCount',
        'completedCount',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads/stats/trend')
  async getLeadTrend(@Query() query: GetLeadTrendQueryDto) {
    return this.leadsService.getTrend(query);
  }

  @ApiOperation({ summary: 'Export lead list to CSV' })
  @ApiBearerAuth('admin-bearer')
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'CSV file content',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="leads.csv"')
  async exportLeadsCsv(@Query() query: GetAdminLeadsQueryDto) {
    const leads = await this.leadsService.exportLeads(query);
    return this.toCsv(leads);
  }

  @ApiOperation({ summary: 'Bulk update lead status (editor only)' })
  @ApiBearerAuth('admin-bearer')
  @ApiBody({ type: BulkUpdateLeadStatusDto })
  @ApiOkResponse({
    description: 'Bulk status update result',
    schema: {
      type: 'object',
      properties: {
        requested: { type: 'number' },
        updated: { type: 'number' },
        updatedIds: { type: 'array', items: { type: 'number' } },
        notFoundIds: { type: 'array', items: { type: 'number' } },
      },
      required: ['requested', 'updated', 'updatedIds', 'notFoundIds'],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({
    description: 'Only editor role can perform bulk updates',
  })
  @UseGuards(AdminAuthGuard, AdminBulkWriteRateLimitGuard, AdminBulkWriteGuard)
  @Patch('admin/leads/bulk-status')
  async bulkUpdateLeadStatus(
    @Body() body: BulkUpdateLeadStatusDto,
    @Req() request: AdminRequest,
  ) {
    const result = await this.leadsService.bulkUpdateStatus(
      body,
      this.getAdminUsername(request),
    );

    return {
      requested: result.requested,
      updated: result.updated,
      updatedIds: result.updatedIds,
      notFoundIds: result.notFoundIds,
    };
  }

  @ApiOperation({ summary: 'Update single lead status (editor only)' })
  @ApiBearerAuth('admin-bearer')
  @ApiBody({ type: UpdateLeadStatusDto })
  @ApiOkResponse({
    description: 'Updated lead entity',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        phone: { type: 'string' },
        interestDevice: { type: 'string' },
        contactTime: { type: 'string' },
        memo: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['new', 'in_progress', 'completed'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: [
        'id',
        'name',
        'phone',
        'interestDevice',
        'contactTime',
        'memo',
        'status',
        'createdAt',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({
    description: 'Viewer role cannot perform write actions',
  })
  @UseGuards(AdminAuthGuard, AdminWriteRateLimitGuard, AdminWriteGuard)
  @Patch('admin/leads/:id/status')
  async updateLeadStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeadStatusDto,
    @Req() request: AdminRequest,
  ) {
    return this.leadsService.updateStatus(
      id,
      body,
      this.getAdminUsername(request),
    );
  }

  @ApiOperation({ summary: 'Get lead status change audit history' })
  @ApiBearerAuth('admin-bearer')
  @ApiOkResponse({
    description: 'Lead status audit list',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              leadId: { type: 'number' },
              previousStatus: {
                type: 'string',
                enum: ['new', 'in_progress', 'completed'],
              },
              nextStatus: {
                type: 'string',
                enum: ['new', 'in_progress', 'completed'],
              },
              changedBy: { type: 'string' },
              changedAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'id',
              'leadId',
              'previousStatus',
              'nextStatus',
              'changedBy',
              'changedAt',
            ],
          },
        },
      },
      required: ['count', 'data'],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseGuards(AdminAuthGuard)
  @Get('admin/leads/:id/status-audits')
  async getLeadStatusAudits(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetLeadStatusAuditsQueryDto,
  ) {
    const items = await this.leadsService.findStatusAudits(id, query);

    return {
      count: items.length,
      data: items,
    };
  }

  @ApiOperation({ summary: 'Update lead memo (editor only)' })
  @ApiBearerAuth('admin-bearer')
  @ApiBody({ type: UpdateLeadMemoDto })
  @ApiOkResponse({
    description: 'Updated lead entity',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        phone: { type: 'string' },
        interestDevice: { type: 'string' },
        contactTime: { type: 'string' },
        memo: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['new', 'in_progress', 'completed'] },
        createdAt: { type: 'string', format: 'date-time' },
      },
      required: [
        'id',
        'name',
        'phone',
        'interestDevice',
        'contactTime',
        'memo',
        'status',
        'createdAt',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({
    description: 'Viewer role cannot perform write actions',
  })
  @UseGuards(AdminAuthGuard, AdminWriteRateLimitGuard, AdminWriteGuard)
  @Patch('admin/leads/:id/memo')
  async updateLeadMemo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeadMemoDto,
  ) {
    return this.leadsService.updateMemo(id, body);
  }
}
