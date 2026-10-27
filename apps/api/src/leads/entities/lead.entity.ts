export type LeadStatus = 'new' | 'in_progress' | 'completed';
export type ConsultationType =
  'number_transfer' | 'device_change' | 'new_subscription' | 'undecided';
export type PreferredCarrier = 'SKT' | 'KT' | 'LGU+' | 'undecided';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  interestDevice: string;
  consultationType: string | null;
  preferredCarrier: string | null;
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
