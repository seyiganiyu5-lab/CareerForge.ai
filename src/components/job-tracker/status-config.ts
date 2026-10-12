import {
  Bookmark, Send, Eye, ClipboardCheck, Video, Users,
  Gift, CheckCircle, XCircle, LogOut, type LucideIcon,
} from 'lucide-react';

export type StatusKey =
  | 'wishlist'
  | 'applied'
  | 'viewed'
  | 'assessment'
  | 'interview'
  | 'final_interview'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface StatusConfig {
  key: StatusKey;
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  icon: LucideIcon;
}

export const STATUSES: StatusConfig[] = [
  { key: 'wishlist', label: 'Wishlist', color: 'bg-gray-500', bgLight: 'bg-gray-100 dark:bg-gray-900/40', borderLight: 'border-gray-200 dark:border-gray-800', textLight: 'text-gray-700 dark:text-gray-300', icon: Bookmark },
  { key: 'applied', label: 'Applied', color: 'bg-blue-500', bgLight: 'bg-blue-100 dark:bg-blue-900/40', borderLight: 'border-blue-200 dark:border-blue-800', textLight: 'text-blue-700 dark:text-blue-300', icon: Send },
  { key: 'viewed', label: 'Application Viewed', color: 'bg-indigo-500', bgLight: 'bg-indigo-100 dark:bg-indigo-900/40', borderLight: 'border-indigo-200 dark:border-indigo-800', textLight: 'text-indigo-700 dark:text-indigo-300', icon: Eye },
  { key: 'assessment', label: 'Assessment', color: 'bg-violet-500', bgLight: 'bg-violet-100 dark:bg-violet-900/40', borderLight: 'border-violet-200 dark:border-violet-800', textLight: 'text-violet-700 dark:text-violet-300', icon: ClipboardCheck },
  { key: 'interview', label: 'Interview', color: 'bg-amber-500', bgLight: 'bg-amber-100 dark:bg-amber-900/40', borderLight: 'border-amber-200 dark:border-amber-800', textLight: 'text-amber-700 dark:text-amber-300', icon: Video },
  { key: 'final_interview', label: 'Final Interview', color: 'bg-orange-500', bgLight: 'bg-orange-100 dark:bg-orange-900/40', borderLight: 'border-orange-200 dark:border-orange-800', textLight: 'text-orange-700 dark:text-orange-300', icon: Users },
  { key: 'offer', label: 'Offer', color: 'bg-emerald-500', bgLight: 'bg-emerald-100 dark:bg-emerald-900/40', borderLight: 'border-emerald-200 dark:border-emerald-800', textLight: 'text-emerald-700 dark:text-emerald-300', icon: Gift },
  { key: 'accepted', label: 'Accepted', color: 'bg-green-500', bgLight: 'bg-green-100 dark:bg-green-900/40', borderLight: 'border-green-200 dark:border-green-800', textLight: 'text-green-700 dark:text-green-300', icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-500', bgLight: 'bg-red-100 dark:bg-red-900/40', borderLight: 'border-red-200 dark:border-red-800', textLight: 'text-red-700 dark:text-red-300', icon: XCircle },
  { key: 'withdrawn', label: 'Withdrawn', color: 'bg-slate-500', bgLight: 'bg-slate-100 dark:bg-slate-900/40', borderLight: 'border-slate-200 dark:border-slate-800', textLight: 'text-slate-700 dark:text-slate-300', icon: LogOut },
];

export const STATUS_MAP: Record<StatusKey, StatusConfig> = Object.fromEntries(
  STATUSES.map(s => [s.key, s])
) as Record<StatusKey, StatusConfig>;

export function getStatusConfig(key: string): StatusConfig {
  return STATUS_MAP[key as StatusKey] || STATUSES[0];
}

export function getBorderColor(key: string): string {
  const config = getStatusConfig(key);
  const map: Record<string, string> = {
    'bg-gray-500': 'border-l-gray-500',
    'bg-blue-500': 'border-l-blue-500',
    'bg-indigo-500': 'border-l-indigo-500',
    'bg-violet-500': 'border-l-violet-500',
    'bg-amber-500': 'border-l-amber-500',
    'bg-orange-500': 'border-l-orange-500',
    'bg-emerald-500': 'border-l-emerald-500',
    'bg-green-500': 'border-l-green-500',
    'bg-red-500': 'border-l-red-500',
    'bg-slate-500': 'border-l-slate-500',
  };
  return map[config.color] || 'border-l-gray-500';
}

export function getDotColor(key: string): string {
  const config = getStatusConfig(key);
  return config.color.replace('bg-', 'bg-');
}

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
export const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

export function daysAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'today';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
