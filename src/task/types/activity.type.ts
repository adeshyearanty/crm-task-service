export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_DELETED = 'TASK_DELETED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_UPDATED = 'LEAD_UPDATED',
  LEAD_DELETED = 'LEAD_DELETED',
  DEAL_CREATED = 'DEAL_CREATED',
  DEAL_UPDATED = 'DEAL_UPDATED',
  DEAL_DELETED = 'DEAL_DELETED',
  CONTACT_CREATED = 'CONTACT_CREATED',
  CONTACT_UPDATED = 'CONTACT_UPDATED',
  CONTACT_DELETED = 'CONTACT_DELETED',
  CALENDAR_EVENT_CREATED = 'CALENDAR_EVENT_CREATED',
  CALENDAR_EVENT_UPDATED = 'CALENDAR_EVENT_UPDATED',
  CALENDAR_EVENT_DELETED = 'CALENDAR_EVENT_DELETED',
  NOTE_CREATED = 'NOTE_CREATED',
  NOTE_UPDATED = 'NOTE_UPDATED',
  NOTE_DELETED = 'NOTE_DELETED',
  MAIL_CREATED = 'MAIL_CREATED',
  MAIL_UPDATED = 'MAIL_UPDATED',
  MAIL_DELETED = 'MAIL_DELETED',
}

export interface ActivityLogMetadata {
  taskTitle?: string;
  taskType?: string;
  dueDate?: Date;
  leadId?: string;
  dealId?: string;
  contactId?: string;
  eventId?: string;
  noteId?: string;
  mailId?: string;
  taskId?: string;
}

export interface ActivityLogPayload {
  activityType: ActivityType;
  description: string;
  performedBy: string;
  metadata: ActivityLogMetadata;
  taskId: string;
  leadId?: string;
  dealId?: string;
  contactId?: string;
  eventId?: string;
  noteId?: string;
  mailId?: string;
}

export interface TaskActivityData {
  title?: string;
  type?: string;
  dueDate?: Date;
  leadId?: string;
  dealId?: string;
  contactId?: string;
  eventId?: string;
  noteId?: string;
  mailId?: string;
  taskId?: string;
}
