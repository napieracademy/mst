export type ResendWebhookEvent = {
  created_at: string;
  data: EmailEventData | ContactEventData | DomainEventData;
  type: WebhookEventType;
};

export type EmailEventData = {
  created_at: string;
  email_id: string;
  from: string;
  to: string;
  subject: string;
  tags?: Record<string, string>;
};

export type ContactEventData = {
  object: 'contact';
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  unsubscribed: boolean;
};

export type DomainEventData = {
  object: 'domain';
  id: string;
  name: string;
  status: 'pending' | 'verified' | 'failed';
  created_at: string;
  region: string;
};

export type WebhookEventType = 
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'
  | 'contact.created'
  | 'contact.deleted'
  | 'contact.updated'
  | 'domain.created'
  | 'domain.deleted'
  | 'domain.updated';