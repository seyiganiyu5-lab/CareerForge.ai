import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase()
    .max(254, 'Email is too long'),
  language: z.enum(['en', 'fr']).default('en'),
  source: z.enum(['landing', 'blog', 'help-center', 'footer']).default('landing'),
});

export type SubscribeFormValues = z.infer<typeof subscribeSchema>;

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;