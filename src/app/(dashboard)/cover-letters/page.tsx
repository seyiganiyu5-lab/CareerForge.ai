'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FadeInUp, ScaleIn, StaggerItem } from '@/lib/motion';
import {
  Mail,
  Sparkles,
  FileText,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  Search,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UpgradeModal } from '@/components/billing/upgrade-modal';

interface CoverLetterItem {
  id: string;
  title: string;
  template: string;
  status: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// Replaced framer-motion fadeUp variants with CSS animation components from @/lib/motion

export default function CoverLettersPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<CoverLetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await fetch('/api/cover-letters', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setLetters(data.coverLetters);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'Untitled Cover Letter' }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/cover-letters/edit#letter=${data.coverLetter.id}`);
      } else if (data.error === 'limit_reached') {
        setShowUpgrade(true);
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch {
      toast.error('Failed to create cover letter');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/cover-letters/edit#letter=${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/cover-letters/${deleteId}`, { method: 'DELETE', credentials: 'include' });
      setLetters((prev) => prev.filter((l) => l.id !== deleteId));
      toast.success('Cover letter deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/cover-letters/${id}/duplicate`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLetters((prev) => [data.coverLetter, ...prev]);
        toast.success('Duplicated!');
      } else if (data.error === 'limit_reached') {
        setShowUpgrade(true);
      }
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const filteredLetters = letters.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <FadeInUp delay={0} duration={0.45} className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 text-brand shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
              Cover Letters
            </h1>
            <p className="text-muted-foreground mt-1 font-body">
              Create and manage AI-powered cover letters
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="bg-brand hover:bg-brand/90 text-white font-body gap-2 shrink-0">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span className="hidden sm:inline">New Letter</span>
        </Button>
      </FadeInUp>

      {/* Search */}
      {letters.length > 0 && (
        <FadeInUp delay={0.08} duration={0.45}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cover letters..."
              className="pl-10 font-body text-sm"
            />
          </div>
        </FadeInUp>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[160px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Letters Grid */}
      {!loading && filteredLetters.length > 0 && (
        <FadeInUp delay={0.16} duration={0.45} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLetters.map((letter) => (
            <ScaleIn
              key={letter.id}
              duration={0.3}
            >
              <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => handleEdit(letter.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand/10 text-brand shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold font-heading truncate">{letter.title}</h3>
                        <p className="text-xs text-muted-foreground font-body">{formatDate(letter.updated_at)}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="font-body text-sm gap-2" onClick={(e) => { e.stopPropagation(); handleEdit(letter.id); }}>
                          <Eye className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-body text-sm gap-2" onClick={(e) => { e.stopPropagation(); handleDuplicate(letter.id); }}>
                          <Copy className="w-3.5 h-3.5" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-body text-sm gap-2 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(letter.id); setDeleteDialogOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-body capitalize">
                      {letter.template}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-body">
                      {letter.language === 'fr' ? 'French' : 'English'}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-body ${letter.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                      {letter.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>
          ))}
        </FadeInUp>
      )}

      {/* Empty State */}
      {!loading && filteredLetters.length === 0 && (
        <FadeInUp delay={0.16} duration={0.45}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-5">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold font-heading mb-2">
                {search ? 'No Results Found' : 'No Cover Letters Yet'}
              </h3>
              <p className="text-muted-foreground max-w-md font-body text-sm leading-relaxed">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first AI-powered cover letter tailored to any job application.'}
              </p>
              {!search && (
                <Button onClick={handleCreate} disabled={creating} className="mt-6 gap-2 bg-brand hover:bg-brand/90 text-white font-body">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Create Your First Cover Letter
                </Button>
              )}
            </CardContent>
          </Card>
        </FadeInUp>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="font-body">
          <DialogHeader>
            <DialogTitle>Delete Cover Letter</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="font-body">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="font-body">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}
