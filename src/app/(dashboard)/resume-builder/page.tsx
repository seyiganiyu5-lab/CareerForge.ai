'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/i18n/provider';
import { useRelativeTime } from '@/i18n/use-relative-time';
import {
  Plus,
  FileText,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  Clock,
  LayoutTemplate,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { UpgradeModal } from '@/components/billing/upgrade-modal';

interface ResumeListItem {
  id: string;
  title: string;
  template: string;
  status: string;
  updated_at: string;
  created_at: string;
}

const TEMPLATE_NAMES: Record<string, string> = {
  'ats-classic': 'ATS Classic',
  'professional-blue': 'Professional Blue',
  'executive': 'Executive',
  'modern-minimal': 'Modern Minimal',
  'contemporary': 'Contemporary',
  'chronological': 'Chronological',
  'functional': 'Functional',
  'combination': 'Combination',
  'tech-professional': 'Tech Professional',
  'graduate': 'Graduate',
};

function ResumeCard({
  resume,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  resume: ResumeListItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const tc = useTranslations('app.common');
  const formatDate = useRelativeTime();
  const templateName = TEMPLATE_NAMES[resume.template] || resume.template;
  const statusColors: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    published: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };
  const statusColor = statusColors[resume.status] || statusColors.draft;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md hover:border-border transition-all cursor-pointer"
      onClick={onEdit}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-lg bg-brand/10 shrink-0">
            <FileText className="size-5 text-brand" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold text-foreground truncate">
              {resume.title || tc('untitledResume')}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <LayoutTemplate className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-body">{templateName}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" /> {tc('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="size-4" /> {tc('duplicate')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" /> {tc('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3" />
          <span className="text-[11px] font-body">{formatDate(resume.updated_at)}</span>
        </div>
        <Badge className={`${statusColor} text-[10px] border-0 font-body px-2 py-0 h-5`}>
          {resume.status === 'draft' ? tc('draft') : resume.status === 'completed' ? tc('completed') : tc('published')}
        </Badge>
      </div>
    </motion.div>
  );
}

export default function ResumeBuilderPage() {
  const t = useTranslations('app.resumeBuilder');
  const tc = useTranslations('app.common');
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResumeListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/resumes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResumes(data.resumes);
          return;
        }
      }
      setError(t('loadFailed'));
    } catch {
      setError(tc('networkError'));
    } finally {
      setLoading(false);
    }
  }, [t, tc]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: tc('untitledResume') }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/resume-builder/edit#resume=${data.resume.id}`);
        return;
      }
      if (data.error === 'limit_reached') {
        setUpgradeOpen(true);
      }
    } catch {
      setError(t('createFailed'));
    }
    setCreating(false);
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(id);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchResumes();
      }
      if (data.error === 'limit_reached') {
        setUpgradeOpen(true);
      }
    } catch { /* silent */ }
    setDuplicating(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/resumes/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setResumes(prev => prev.filter(r => r.id !== deleteTarget.id));
    } catch { /* silent */ }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleEdit = (id: string) => {
    router.push(`/resume-builder/edit#resume=${id}`);
  };

  const filteredResumes = resumes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Page header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {t('subtitle')}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="bg-brand text-white hover:bg-brand/90 shrink-0 font-body"
          >
            {creating ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Plus className="size-4 mr-2" />
            )}
            {creating ? tc('creating') : t('newResume')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-sm text-destructive font-body mb-3">{error}</p>
              <Button variant="outline" onClick={fetchResumes} className="font-body">{tc('tryAgain')}</Button>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1.5" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-px w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-sm"
            >
              {search ? (
                <>
                  <Search className="size-10 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {t('noResultsTitle')}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {t('noResultsBody', { search })}
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 mx-auto">
                    <FileText className="size-7 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {t('emptyTitle')}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mb-6">
                    {t('emptyBody')}
                  </p>
                  <Button onClick={handleCreate} disabled={creating} className="bg-brand text-white hover:bg-brand/90 font-body">
                    {creating ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                    {creating ? tc('creating') : t('createResume')}
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        ) : (
          <>
            {/* Search bar */}
            {resumes.length > 3 && (
              <div className="mb-5 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm font-body"
                  />
                </div>
              </div>
            )}

            {/* Resume grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredResumes.map(resume => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onEdit={() => handleEdit(resume.id)}
                    onDuplicate={() => handleDuplicate(resume.id)}
                    onDelete={() => setDeleteTarget(resume)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {duplicating && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3 shadow-lg">
                  <Loader2 className="size-4 animate-spin text-brand" />
                  <span className="text-sm font-body">{tc('duplicating')}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t('deleteTitle')}</DialogTitle>
            <DialogDescription className="font-body">
              {t('deleteBody', { title: deleteTarget?.title || tc('untitledResume') })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="font-body">{tc('cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="font-body">
              {deleting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {deleting ? tc('deleting') : tc('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} featureName={t('title')} />
    </div>
  );
}