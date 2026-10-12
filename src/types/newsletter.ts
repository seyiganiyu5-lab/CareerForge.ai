export type NewsletterSource = 'landing' | 'blog' | 'help-center' | 'footer';
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced';
export type SubscriberLanguage = 'en' | 'fr';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: SubscriberLanguage;
  status: SubscriberStatus;
  subscribed_at: Date;
  updated_at: Date;
  source: NewsletterSource;
  created_at: Date;
}

export interface SubscribeRequest {
  email: string;
  language: SubscriberLanguage;
  source: NewsletterSource;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

export type NewsletterFormState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'already_subscribed'
  | 'error';

export const NEWSLETTER_SOURCES: Record<NewsletterSource, string> = {
  landing: 'landing',
  blog: 'blog',
  'help-center': 'help-center',
  footer: 'footer',
} as const;