'use client';

import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, Lock, Star, X, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllTemplates, isTemplateFree } from '@/lib/templates/registry';
import { createDefaultCustomization } from '@/lib/templates/defaults';
import { THUMBNAIL_RESUME_DATA } from '@/lib/templates/sample-data';
import type { TemplateId, TemplateCustomization } from '@/types/template';
import { useTranslations } from '@/i18n/provider';
import { useAuth } from '@/lib/auth/context';

// Lazy thumbnail renderer
const TemplateThumbnail = lazy(() =>
  import('@/components/resume/template-engine').then(mod => ({
    default: ({ templateId, customization }: { templateId: TemplateId; customization: TemplateCustomization }) => (
      <mod.TemplateEngine
        data={THUMBNAIL_RESUME_DATA}
        templateId={templateId}
        customization={customization}
      />
    ),
  }))
);

interface TemplateGalleryProps {
  currentTemplateId: TemplateId;
  isProUser: boolean;
  onSelect: (templateId: TemplateId) => void;
  onUpgradeRequest: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AtsStars({ rating }: { rating: number }) {
  const t = useTranslations('app.resumeEditor');
  return (
    <div className="flex items-center gap-0.5" aria-label={t('atsRatingAria', { rating })}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-3"
          style={{
            fill: i < rating ? '#f59e0b' : 'none',
            stroke: i < rating ? '#f59e0b' : '#d1d5db',
            strokeWidth: 1.5,
          }}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  templateId,
  name,
  description,
  atsRating,
  tier,
  isCurrent,
  isProUser,
  onSelect,
  onPreview,
  onUpgradeRequest,
  recommendedBy,
}: {
  recommendedBy?: string;
  templateId: TemplateId;
  name: string;
  description: string;
  atsRating: number;
  tier: string;
  isCurrent: boolean;
  isProUser: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onUpgradeRequest: () => void;
}) {
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  const isLocked = tier === 'pro' && !isProUser;
  const customization = createDefaultCustomization(templateId);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-lg hover:border-border transition-all"
    >
      {/* Thumbnail area */}
      <div className="relative bg-white overflow-hidden" style={{ height: '380px' }}>
        <div
          style={{
            transform: 'scale(0.42)',
            transformOrigin: 'top left',
            width: '794px',
            pointerEvents: 'none',
          }}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center bg-white" style={{ width: '794px', height: '1123px' }}>
              <div className="size-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
            </div>
          }>
            <div style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <TemplateThumbnail templateId={templateId} customization={customization} />
            </div>
          </Suspense>
        </div>

        {/* Top-right badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isLocked ? (
            <Badge className="bg-black/70 text-white text-[10px] border-0 font-body gap-1 backdrop-blur-sm shadow-sm">
              <Lock className="size-2.5" />
              {tc('pro')}
            </Badge>
          ) : isCurrent ? (
            <Badge className="bg-emerald-600 text-white text-[10px] border-0 font-body gap-1 shadow-sm">
              <Check className="size-2.5" />
              {t('active')}
            </Badge>
          ) : (
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] border-0 font-body shadow-sm">
              {t('free')}
            </Badge>
          )}
        </div>

        {/* Bottom slide-out action bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 bg-gray-900/90 backdrop-blur-md px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPreview}
            className="text-white hover:bg-white/20 font-body text-xs gap-1.5 h-8"
          >
            <Eye className="size-3.5" />
            {tc('preview')}
          </Button>
          {isLocked ? (
            <Button
              size="sm"
              onClick={onUpgradeRequest}
              className="bg-amber-500 hover:bg-amber-600 text-white font-body text-xs gap-1.5 h-8"
            >
              <Zap className="size-3.5" />
              {tc('upgrade')}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onSelect}
              className="bg-white text-gray-900 hover:bg-gray-100 font-body text-xs gap-1.5 h-8 font-medium"
            >
              <Check className="size-3.5" />
              {t('useTemplate')}
            </Button>
          )}
        </div>
      </div>

      {/* Info area */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold font-heading text-foreground leading-tight truncate">
            {name}
          </h3>
          <AtsStars rating={atsRating} />
        </div>
        {recommendedBy && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-brand font-body">
            <Building2 className="size-3 shrink-0" /> {t('recommendedBy', { organization: recommendedBy })}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground font-body leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function TemplateGallery({
  currentTemplateId,
  isProUser,
  onSelect,
  onUpgradeRequest,
  open,
  onOpenChange,
}: TemplateGalleryProps) {
  const t = useTranslations('app.resumeEditor');
  const tc = useTranslations('app.common');
  const describe = (id: TemplateId, original: string) => {
    const key = `tpl_${id}_desc`;
    return t.has(key) ? t(key) : original;
  };
  const [previewTemplateId, setPreviewTemplateId] = useState<TemplateId | null>(null);
  const { user } = useAuth();
  // Templates the member's organisation recommends come first
  const org = user?.organization;
  const recommended = org?.recommended_templates ?? [];
  const rank = (id: string) => (recommended.includes(id) ? recommended.indexOf(id) : recommended.length);
  const templates = [...getAllTemplates()].sort((a, b) => rank(a.id) - rank(b.id));
  const previewTemplate = templates.find(t => t.id === previewTemplateId);
  const previewCustomization = previewTemplateId ? createDefaultCustomization(previewTemplateId) : null;

  return (
    <>
      {/* Main Gallery Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="max-w-4xl max-h-[88vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="font-heading text-xl text-foreground">
                  {t('chooseATemplate')}
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-body mt-1.5">
                  {t('galleryDescription')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="size-8 shrink-0 -mt-1 -mr-2"
                aria-label={tc('close')}
              >
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>
          {/* Native scroll instead of Radix ScrollArea — works in fixed Dialog */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 pb-6">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  templateId={template.id}
                  name={template.name}
                  description={describe(template.id, template.description)}
                  atsRating={template.atsRating}
                  tier={template.tier}
                  isCurrent={template.id === currentTemplateId}
                  recommendedBy={org && recommended.includes(template.id) ? org.name : undefined}
                  isProUser={isProUser}
                  onSelect={() => {
                    onSelect(template.id);
                    onOpenChange(false);
                  }}
                  onPreview={() => setPreviewTemplateId(template.id)}
                  onUpgradeRequest={() => {
                    onUpgradeRequest();
                    onOpenChange(false);
                  }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplateId} onOpenChange={() => setPreviewTemplateId(null)}>
        <DialogContent showCloseButton={false} className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="font-heading text-lg text-foreground">
                  {previewTemplate?.name}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1.5">
                  {previewTemplate && <AtsStars rating={previewTemplate.atsRating} />}
                  <span className="text-xs text-muted-foreground font-body">
                    {previewTemplate && describe(previewTemplate.id, previewTemplate.description)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewTemplateId(null)}
                className="size-8 shrink-0 -mt-1 -mr-2"
                aria-label={tc('close')}
              >
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/30 px-6 pb-6">
            <div className="flex justify-center">
              <div
                style={{
                  transform: 'scale(0.55)',
                  transformOrigin: 'top center',
                  width: '794px',
                  height: '1123px',
                  marginBottom: '-500px',
                }}
              >
                {previewTemplateId && previewCustomization && (
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-[1123px] bg-white">
                      <div className="size-6 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                    </div>
                  }>
                    <TemplateThumbnail
                      templateId={previewTemplateId}
                      customization={previewCustomization}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 flex justify-end gap-2 border-t border-border/50 shrink-0 bg-card">
            <Button
              variant="outline"
              onClick={() => setPreviewTemplateId(null)}
              className="font-body"
            >
              {tc('cancel')}
            </Button>
            {previewTemplateId && !isTemplateFree(previewTemplateId) && !isProUser ? (
              <Button
                onClick={() => {
                  onUpgradeRequest();
                  setPreviewTemplateId(null);
                }}
                className="font-body"
              >
                <Zap className="size-4 mr-1.5" />
                {t('upgradeToUse')}
              </Button>
            ) : (
              previewTemplateId && (
                <Button
                  onClick={() => {
                    onSelect(previewTemplateId);
                    setPreviewTemplateId(null);
                    onOpenChange(false);
                  }}
                  className="font-body"
                >
                  <Check className="size-4 mr-1.5" />
                  {t('useThisTemplate')}
                </Button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}