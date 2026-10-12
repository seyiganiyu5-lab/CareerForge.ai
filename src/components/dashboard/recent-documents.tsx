'use client';

import { useTranslations } from '@/i18n/provider';
import { Eye, Pencil, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type DocStatus = 'draft' | 'completed' | 'published';

const DOCUMENTS = [
  { name: 'Software Engineer Resume', type: 'Resume', updated: '2 hours ago', status: 'completed' as DocStatus },
  { name: 'Cover Letter - Google', type: 'Cover Letter', updated: '1 day ago', status: 'draft' as DocStatus },
  { name: 'Product Manager CV', type: 'Resume', updated: '3 days ago', status: 'published' as DocStatus },
  { name: 'Data Analyst Application', type: 'Cover Letter', updated: '5 days ago', status: 'completed' as DocStatus },
  { name: 'Marketing Resume v2', type: 'Resume', updated: '1 week ago', status: 'draft' as DocStatus },
];

const STATUS_VARIANTS: Record<DocStatus, string> = {
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  published: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

export default function RecentDocuments() {
  const t = useTranslations('dashboard.recentDocuments');

  return (
    <section aria-label={t('title')}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-foreground">
          {t('title')}
        </h2>
        <button className="text-xs font-medium text-brand hover:text-brand/80 font-body transition-colors">
          {t('viewAll')}
        </button>
      </div>
      <div
        className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden opacity-0 animate-[slideUpLg_0.5s_ease-out_0.2s_forwards]"
      >
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground font-body">{t('name')}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground font-body hidden sm:table-cell">{t('type')}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground font-body hidden md:table-cell">{t('lastUpdated')}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground font-body">{t('status')}</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground font-body text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOCUMENTS.map((doc, i) => (
                <tr
                  key={doc.name}
                  style={{ animationDelay: `${250 + i * 50}ms`, animationFillMode: 'both' }}
                  className="border-b-border/50 last:border-0 hover:bg-accent/30 transition-colors opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
                >
                  <TableCell className="font-medium text-sm font-body py-3">
                    {doc.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body hidden sm:table-cell py-3">
                    {doc.type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body hidden md:table-cell py-3">
                    {doc.updated}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant="secondary" className={cn('text-[11px] font-medium font-body border-0', STATUS_VARIANTS[doc.status])}>
                      {t(doc.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t('view')}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t('edit')}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={t('duplicate')}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" aria-label={t('delete')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}