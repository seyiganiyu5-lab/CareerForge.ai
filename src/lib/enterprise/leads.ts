import { z } from 'zod';

export const ORG_TYPES = ['university', 'school', 'training', 'agency', 'ngo', 'government', 'company', 'other'] as const;
export const TEAM_SIZES = ['1-25', '26-100', '101-500', '500+'] as const;
export const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost'] as const;

export type OrgType = (typeof ORG_TYPES)[number];
export type TeamSize = (typeof TEAM_SIZES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const text = (max: number) => z.string().trim().max(max);

/** The Contact Sales form */
export const enterpriseLeadSchema = z.object({
  name: text(120).min(2),
  email: z.email().max(200),
  organization: text(160).min(2),
  org_type: z.enum(ORG_TYPES),
  team_size: z.enum(TEAM_SIZES),
  country: text(80).optional().default(''),
  phone: text(40).optional().default(''),
  message: text(2000).optional().default(''),
  // Hidden field real people leave empty; bots fill it in
  website: z.string().max(200).optional().default(''),
});

export type EnterpriseLeadInput = z.infer<typeof enterpriseLeadSchema>;
