'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown, ArrowUp, ArrowDown, Edit, Copy, Archive, Trash2,
  Sparkles, ExternalLink, Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { getStatusConfig } from './status-config';
import { useJobLabels } from './use-job-labels';
import { useTranslations, useLocale } from '@/i18n/provider';
import type { JobApplication } from '@/hooks/use-job-tracker';

type SortField = 'company_name' | 'job_title' | 'status' | 'location' | 'salary' | 'work_mode' | 'applied_at' | 'updated_at';
type SortDir = 'asc' | 'desc';

interface ListViewProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAiSuggest: (id: string) => void;
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3 ml-1" />
    : <ArrowDown className="w-3 h-3 ml-1" />;
}

export function ListView({ applications, onEdit, onDuplicate, onArchive, onDelete, onAiSuggest }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const t = useTranslations('dashboard.jobTracker');
  const tu = useTranslations('app.jobTrackerUi');
  const tc = useTranslations('app.common');
  const labels = useJobLabels();
  const { locale } = useLocale();

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    return [...applications].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] ?? '';
      const bVal = (b as unknown as Record<string, unknown>)[sortField] ?? '';
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [applications, sortField, sortDir]);

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-heading text-xs cursor-pointer select-none" onClick={() => toggleSort('company_name')}>
                <span className="inline-flex items-center">{tu('colCompany')} <SortIcon field="company_name" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs cursor-pointer select-none" onClick={() => toggleSort('job_title')}>
                <span className="inline-flex items-center">{tu('colTitle')} <SortIcon field="job_title" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs cursor-pointer select-none" onClick={() => toggleSort('status')}>
                <span className="inline-flex items-center">{t('status')} <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort('location')}>
                <span className="inline-flex items-center">{t('location')} <SortIcon field="location" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs hidden md:table-cell cursor-pointer select-none" onClick={() => toggleSort('salary')}>
                <span className="inline-flex items-center">{t('salary')} <SortIcon field="salary" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs hidden xl:table-cell cursor-pointer select-none" onClick={() => toggleSort('work_mode')}>
                <span className="inline-flex items-center">{t('workMode')} <SortIcon field="work_mode" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs hidden md:table-cell cursor-pointer select-none" onClick={() => toggleSort('applied_at')}>
                <span className="inline-flex items-center">{t('applied')} <SortIcon field="applied_at" sortField={sortField} sortDir={sortDir} /></span>
              </TableHead>
              <TableHead className="font-heading text-xs text-right">{tu('colActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {sorted.map((app, idx) => {
                const statusConfig = getStatusConfig(app.status);
                return (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15, delay: idx * 0.02 }}
                    className="border-b last:border-b-0 group cursor-pointer"
                    onClick={() => onEdit(app)}
                  >
                    <TableCell className="font-medium font-body text-sm">
                      <div className="flex items-center gap-1.5">
                        {app.job_url ? (
                          <a
                            href={app.job_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-brand transition-colors inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.company_name}
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </a>
                        ) : app.company_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground">{app.job_title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${statusConfig.bgLight} ${statusConfig.borderLight} ${statusConfig.textLight} border`}
                      >
                        {labels.status(app.status, statusConfig.label)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground font-body">{app.location || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-body">{app.salary || '—'}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {app.work_mode ? (
                        <Badge variant="outline" className="text-[10px] font-body">{labels.workMode(app.work_mode)}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-body">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(app.applied_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(app); }}>
                              <Edit className="w-4 h-4 mr-2" /> {tc('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(app.id); }}>
                              <Copy className="w-4 h-4 mr-2" /> {tc('duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(app.id); }}>
                              <Archive className="w-4 h-4 mr-2" /> {app.is_archived ? t('unarchive') : t('archive')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAiSuggest(app.id); }}>
                              <Sparkles className="w-4 h-4 mr-2" /> {t('aiSuggestions')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); onDelete(app.id); }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> {tc('delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
