import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Lead, LeadStatus } from './entities/lead.entity';

type BaseEmailEvent = {
  event: 'lead.created' | 'lead.status_changed' | 'lead.bulk_status_changed';
  occurredAt: Date;
};

type LeadCreatedEvent = BaseEmailEvent & {
  event: 'lead.created';
  lead: Lead;
};

type LeadStatusChangedEvent = BaseEmailEvent & {
  event: 'lead.status_changed';
  leadId: number;
  previousStatus: LeadStatus | null;
  nextStatus: LeadStatus;
  changedBy: string;
};

type LeadBulkStatusChangedEvent = BaseEmailEvent & {
  event: 'lead.bulk_status_changed';
  requested: number;
  updated: number;
  updatedIds: number[];
  notFoundIds: number[];
  nextStatus: LeadStatus;
  changedBy: string;
};

type LeadEmailEvent =
  LeadCreatedEvent | LeadStatusChangedEvent | LeadBulkStatusChangedEvent;

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatStatusLabel(status: LeadStatus | null): string {
  if (status === null) {
    return '-';
  }

  if (status === 'new') {
    return '신규';
  }

  if (status === 'in_progress') {
    return '진행중';
  }

  return '완료';
}

@Injectable()
export class LeadNotifierService {
  private readonly logger = new Logger(LeadNotifierService.name);
  private transporter: Transporter | null = null;
  private initialized = false;

  async notifyLeadCreated(lead: Lead): Promise<void> {
    await this.send({
      event: 'lead.created',
      occurredAt: new Date(),
      lead,
    });
  }

  async notifyLeadStatusChanged(input: {
    leadId: number;
    previousStatus: LeadStatus | null;
    nextStatus: LeadStatus;
    changedBy: string;
  }): Promise<void> {
    await this.send({
      event: 'lead.status_changed',
      occurredAt: new Date(),
      leadId: input.leadId,
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
      changedBy: input.changedBy,
    });
  }

  async notifyBulkStatusChanged(input: {
    requested: number;
    updated: number;
    updatedIds: number[];
    notFoundIds: number[];
    nextStatus: LeadStatus;
    changedBy: string;
  }): Promise<void> {
    await this.send({
      event: 'lead.bulk_status_changed',
      occurredAt: new Date(),
      requested: input.requested,
      updated: input.updated,
      updatedIds: input.updatedIds,
      notFoundIds: input.notFoundIds,
      nextStatus: input.nextStatus,
      changedBy: input.changedBy,
    });
  }

  private isEmailEnabled(): boolean {
    const raw = process.env.LEAD_NOTIFY_EMAIL_ENABLED?.trim().toLowerCase();
    return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
  }

  private getTimeoutMs(): number {
    const raw = Number(process.env.LEAD_NOTIFY_EMAIL_TIMEOUT_MS ?? 5000);

    if (!Number.isFinite(raw) || raw <= 0) {
      return 5000;
    }

    return Math.min(raw, 20000);
  }

  private getSubjectPrefix(): string {
    return process.env.LEAD_NOTIFY_EMAIL_SUBJECT_PREFIX?.trim() || '[SP]';
  }

  private getRetryCount(): number {
    const raw = Number(process.env.LEAD_NOTIFY_EMAIL_RETRY_COUNT ?? 0);

    if (!Number.isFinite(raw) || raw < 0) {
      return 0;
    }

    return Math.min(Math.trunc(raw), 5);
  }

  private getRetryDelayMs(): number {
    const raw = Number(process.env.LEAD_NOTIFY_EMAIL_RETRY_DELAY_MS ?? 0);

    if (!Number.isFinite(raw) || raw < 0) {
      return 0;
    }

    return Math.min(Math.trunc(raw), 10_000);
  }

  private getFrom(): string | null {
    const value = process.env.LEAD_NOTIFY_EMAIL_FROM?.trim();
    return value && value.length > 0 ? value : null;
  }

  private getTo(): string | null {
    const value = process.env.LEAD_NOTIFY_EMAIL_TO?.trim();
    return value && value.length > 0 ? value : null;
  }

  private createOrGetTransporter(): Transporter | null {
    if (this.initialized) {
      return this.transporter;
    }

    this.initialized = true;

    if (!this.isEmailEnabled()) {
      this.logger.log('Email notifier disabled by LEAD_NOTIFY_EMAIL_ENABLED');
      this.transporter = null;
      return this.transporter;
    }

    const host = process.env.LEAD_NOTIFY_EMAIL_SMTP_HOST?.trim();

    if (!host) {
      this.logger.warn('Email notifier enabled but SMTP host is missing');
      this.transporter = null;
      return this.transporter;
    }

    const portRaw = Number(process.env.LEAD_NOTIFY_EMAIL_SMTP_PORT ?? 587);
    const port = Number.isFinite(portRaw) && portRaw > 0 ? portRaw : 587;
    const secureRaw =
      process.env.LEAD_NOTIFY_EMAIL_SMTP_SECURE?.trim().toLowerCase();
    const secure =
      secureRaw === '1' ||
      secureRaw === 'true' ||
      secureRaw === 'yes' ||
      secureRaw === 'on' ||
      (!secureRaw && port === 465);

    const user = process.env.LEAD_NOTIFY_EMAIL_SMTP_USER?.trim();
    const pass = process.env.LEAD_NOTIFY_EMAIL_SMTP_PASS;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      connectionTimeout: this.getTimeoutMs(),
      greetingTimeout: this.getTimeoutMs(),
      socketTimeout: this.getTimeoutMs(),
    });

    return this.transporter;
  }

  private toEmailContent(event: LeadEmailEvent): {
    subject: string;
    text: string;
    html: string;
  } {
    const prefix = this.getSubjectPrefix();

    if (event.event === 'lead.created') {
      const occurredAt = event.occurredAt.toISOString();
      const createdAt = event.lead.createdAt.toISOString();

      return {
        subject: `${prefix} 신규 문의 #${event.lead.id}`,
        text: [
          `event: ${event.event}`,
          `occurredAt: ${occurredAt}`,
          `leadId: ${event.lead.id}`,
          `name: ${event.lead.name}`,
          `phone: ${event.lead.phone}`,
          `interestDevice: ${event.lead.interestDevice}`,
          `contactTime: ${event.lead.contactTime}`,
          `status: ${event.lead.status}`,
          `createdAt: ${createdAt}`,
        ].join('\n'),
        html: [
          '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">',
          `<h2 style="margin:0 0 12px">${escapeHtml(prefix)} 신규 문의 #${event.lead.id}</h2>`,
          '<table style="border-collapse:collapse;width:100%;max-width:640px">',
          `<tr><td style="padding:6px 0;font-weight:700">event</td><td style="padding:6px 0">${event.event}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">occurredAt</td><td style="padding:6px 0">${occurredAt}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">leadId</td><td style="padding:6px 0">${event.lead.id}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">name</td><td style="padding:6px 0">${escapeHtml(event.lead.name)}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">phone</td><td style="padding:6px 0">${escapeHtml(event.lead.phone)}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">interestDevice</td><td style="padding:6px 0">${escapeHtml(event.lead.interestDevice)}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">contactTime</td><td style="padding:6px 0">${escapeHtml(event.lead.contactTime)}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">status</td><td style="padding:6px 0">${formatStatusLabel(event.lead.status)} (${event.lead.status})</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">createdAt</td><td style="padding:6px 0">${createdAt}</td></tr>`,
          '</table>',
          '</div>',
        ].join(''),
      };
    }

    if (event.event === 'lead.status_changed') {
      const occurredAt = event.occurredAt.toISOString();

      return {
        subject: `${prefix} 상태 변경 #${event.leadId}`,
        text: [
          `event: ${event.event}`,
          `occurredAt: ${occurredAt}`,
          `leadId: ${event.leadId}`,
          `previousStatus: ${event.previousStatus ?? '-'}`,
          `nextStatus: ${event.nextStatus}`,
          `changedBy: ${event.changedBy}`,
        ].join('\n'),
        html: [
          '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">',
          `<h2 style="margin:0 0 12px">${escapeHtml(prefix)} 상태 변경 #${event.leadId}</h2>`,
          '<table style="border-collapse:collapse;width:100%;max-width:640px">',
          `<tr><td style="padding:6px 0;font-weight:700">event</td><td style="padding:6px 0">${event.event}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">occurredAt</td><td style="padding:6px 0">${occurredAt}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">leadId</td><td style="padding:6px 0">${event.leadId}</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">previousStatus</td><td style="padding:6px 0">${formatStatusLabel(event.previousStatus)} (${event.previousStatus ?? '-'})</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">nextStatus</td><td style="padding:6px 0">${formatStatusLabel(event.nextStatus)} (${event.nextStatus})</td></tr>`,
          `<tr><td style="padding:6px 0;font-weight:700">changedBy</td><td style="padding:6px 0">${escapeHtml(event.changedBy)}</td></tr>`,
          '</table>',
          '</div>',
        ].join(''),
      };
    }

    const occurredAt = event.occurredAt.toISOString();
    const updatedIds = event.updatedIds.join(',') || '-';
    const notFoundIds = event.notFoundIds.join(',') || '-';

    return {
      subject: `${prefix} 일괄 상태 변경 (${event.updated}/${event.requested})`,
      text: [
        `event: ${event.event}`,
        `occurredAt: ${occurredAt}`,
        `requested: ${event.requested}`,
        `updated: ${event.updated}`,
        `nextStatus: ${event.nextStatus}`,
        `changedBy: ${event.changedBy}`,
        `updatedIds: ${updatedIds}`,
        `notFoundIds: ${notFoundIds}`,
      ].join('\n'),
      html: [
        '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">',
        `<h2 style="margin:0 0 12px">${escapeHtml(prefix)} 일괄 상태 변경 (${event.updated}/${event.requested})</h2>`,
        '<table style="border-collapse:collapse;width:100%;max-width:640px">',
        `<tr><td style="padding:6px 0;font-weight:700">event</td><td style="padding:6px 0">${event.event}</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">occurredAt</td><td style="padding:6px 0">${occurredAt}</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">requested</td><td style="padding:6px 0">${event.requested}</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">updated</td><td style="padding:6px 0">${event.updated}</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">nextStatus</td><td style="padding:6px 0">${formatStatusLabel(event.nextStatus)} (${event.nextStatus})</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">changedBy</td><td style="padding:6px 0">${escapeHtml(event.changedBy)}</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">updatedIds</td><td style="padding:6px 0">${escapeHtml(updatedIds)}</td></tr>`,
        `<tr><td style="padding:6px 0;font-weight:700">notFoundIds</td><td style="padding:6px 0">${escapeHtml(notFoundIds)}</td></tr>`,
        '</table>',
        '</div>',
      ].join(''),
    };
  }

  private wait(durationMs: number): Promise<void> {
    if (durationMs <= 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });
  }

  private async send(event: LeadEmailEvent): Promise<void> {
    const from = this.getFrom();
    const to = this.getTo();

    if (!from || !to) {
      return;
    }

    const transporter = this.createOrGetTransporter();

    if (!transporter) {
      return;
    }

    const email = this.toEmailContent(event);
    const retryCount = this.getRetryCount();
    const retryDelayMs = this.getRetryDelayMs();
    const maxAttempt = retryCount + 1;

    for (let attempt = 1; attempt <= maxAttempt; attempt += 1) {
      try {
        await transporter.sendMail({
          from,
          to,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'unknown error';
        const isLastAttempt = attempt === maxAttempt;

        this.logger.warn(
          `Email delivery error: event=${event.event}, attempt=${attempt}/${maxAttempt}, message=${message}`,
        );

        if (isLastAttempt) {
          return;
        }

        await this.wait(retryDelayMs * attempt);
      }
    }
  }
}
