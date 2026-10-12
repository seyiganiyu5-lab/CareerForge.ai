'use client';

import { SectionCard } from './section-card';
import { Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COVER_LETTER_TEMPLATES, ACCENT_PRESETS, FONT_OPTIONS } from '@/lib/cover-letter/template-registry';
import type { CoverLetterCustomization, CoverLetterTemplateId } from '@/types/cover-letter';

interface CustomizationSectionProps {
  customization: CoverLetterCustomization;
  templateId: CoverLetterTemplateId;
  onChange: (patch: Partial<CoverLetterCustomization>) => void;
  onTemplateChange: (id: CoverLetterTemplateId) => void;
}

export function CustomizationSection({
  customization,
  templateId,
  onChange,
  onTemplateChange,
}: CustomizationSectionProps) {
  return (
    <SectionCard
      icon={<Palette className="w-4 h-4" />}
      title="Design & Customization"
      description="Choose template, colors, fonts, and spacing"
      defaultOpen={false}
    >
      <div className="space-y-5">
        {/* Template Selector */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Template</Label>
          <div className="grid grid-cols-2 gap-2">
            {COVER_LETTER_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id as CoverLetterTemplateId)}
                className={`relative flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all duration-200 ${
                  templateId === t.id
                    ? 'border-brand bg-brand/5 ring-1 ring-brand/30 shadow-sm'
                    : 'border-border/40 bg-muted/20 hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.tags[0]}</div>
                </div>
                {t.tier === 'pro' && (
                  <Badge className="text-[8px] px-1 py-0 h-3.5 bg-violet-100 text-violet-700 shrink-0">
                    Pro
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Accent Color */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Accent Color</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c.value}
                onClick={() => onChange({ accentColor: c.value })}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  customization.accentColor === c.value
                    ? 'border-foreground ring-2 ring-foreground/20 scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Font Family</Label>
          <Select value={customization.primaryFont} onValueChange={(v) => onChange({ primaryFont: v })}>
            <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Font Size</Label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {Math.round(customization.fontSize * 100)}%
            </span>
          </div>
          <Slider
            value={[customization.fontSize]}
            min={0.8}
            max={1.4}
            step={0.05}
            onValueChange={([v]) => onChange({ fontSize: v })}
            className="py-1"
          />
        </div>

        {/* Line Spacing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Line Spacing</Label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {customization.lineSpacing.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[customization.lineSpacing]}
            min={1.2}
            max={2.0}
            step={0.1}
            onValueChange={([v]) => onChange({ lineSpacing: v })}
            className="py-1"
          />
        </div>

        {/* Margins */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Page Margins</Label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {customization.pageMargins}px
            </span>
          </div>
          <Slider
            value={[customization.pageMargins]}
            min={30}
            max={80}
            step={2}
            onValueChange={([v]) => onChange({ pageMargins: v })}
            className="py-1"
          />
        </div>

        {/* Date Format */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Date Format</Label>
          <Select
            value={customization.dateFormat}
            onValueChange={(v) => onChange({ dateFormat: v as CoverLetterCustomization['dateFormat'] })}
          >
            <SelectTrigger className="h-9 text-sm bg-muted/30 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full (January 15, 2025)</SelectItem>
              <SelectItem value="short">Short (Jan 15, 2025)</SelectItem>
              <SelectItem value="iso">ISO (2025-01-15)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SectionCard>
  );
}
