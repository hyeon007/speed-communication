export type LeadStatus = 'new' | 'in_progress' | 'completed';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  interestDevice: string;
  contactTime: string;
  memo: string | null;
  status: LeadStatus;
  createdAt: Date;
}

export interface LeadStatusAudit {
  id: number;
  leadId: number;
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  changedBy: string;
  changedAt: Date;
}
