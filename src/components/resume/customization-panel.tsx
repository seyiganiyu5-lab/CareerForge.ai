'use client';

import { useState } from 'react';
import { Palette, Type, Maximize, X, Plus, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type TemplateCustomization,
  FONT_OPTIONS,
  ACCENT_PRESETS,
} from '@/types/template';
import { createDefaultCustomization } from '@/lib/templates/defaults';
import type { TemplateId } from '@/types/template';
import { cn } from '@/lib/utils';

interface CustomizationPanelProps {
  customization: TemplateCustomization;
  templateId: TemplateId;
  onChange: (customization: TemplateCustomization) => void;
  onClose?: () => void;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 px-4 text-left hover:bg-accent/30 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold font-heading text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </span>
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-body text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {value.toFixed(step < 1 ? 1 : 0)}{suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

export function CustomizationPanel({
  customization,
  templateId,
  onChange,
  onClose,
}: CustomizationPanelProps) {
  const update = <K extends keyof TemplateCustomization>(
    key: K,
    value: TemplateCustomization[K]
  ) => {
    onChange({ ...customization, [key]: value });
  };

  const reset = () => {
    onChange(createDefaultCustomization(templateId));
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <h3 className="text-sm font-semibold font-heading text-foreground">
          Customize
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground font-body h-7 gap-1 px-2"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-7 text-muted-foreground hover:text-foreground"
              aria-label="Close customization panel"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div>
          {/* Colors */}
          <Section title="Colors" icon={Palette}>
            <div className="space-y-2">
              <Label className="text-xs font-body text-muted-foreground">
                Accent Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => update('accentColor', preset.value)}
                    className={cn(
                      'size-7 rounded-full border-2 transition-all hover:scale-110',
                      customization.accentColor === preset.value
                        ? 'border-foreground ring-2 ring-foreground/20'
                        : 'border-transparent'
                    )}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                    aria-label={`Accent color: ${preset.label}`}
                  />
                ))}
                <label className="relative size-7 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-muted-foreground/70 transition-colors">
                  <Plus className="size-3 text-muted-foreground/60" />
                  <input
                    type="color"
                    value={customization.accentColor}
                    onChange={(e) => update('accentColor', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Custom accent color"
                  />
                </label>
              </div>
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography" icon={Type}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-body text-muted-foreground">
                  Body Font
                </Label>
                <Select
                  value={customization.primaryFont}
                  onValueChange={(v) => update('primaryFont', v)}
                >
                  <SelectTrigger className="h-8 text-xs font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(f => (
                      <SelectItem key={f.value} value={f.value} className="text-xs">
                        <span style={{ fontFamily: f.value }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-body text-muted-foreground">
                  Heading Font
                </Label>
                <Select
                  value={customization.headingFont}
                  onValueChange={(v) => update('headingFont', v)}
                >
                  <SelectTrigger className="h-8 text-xs font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(f => (
                      <SelectItem key={f.value} value={f.value} className="text-xs">
                        <span style={{ fontFamily: f.value }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <SliderField
                label="Font Size"
                value={customization.fontSize}
                min={0.8}
                max={1.4}
                step={0.05}
                onChange={(v) => update('fontSize', v)}
                suffix="×"
              />
              <SliderField
                label="Line Height"
                value={customization.lineHeight}
                min={1.2}
                max={2.0}
                step={0.1}
                onChange={(v) => update('lineHeight', v)}
              />
            </div>
          </Section>

          {/* Layout */}
          <Section title="Layout" icon={Maximize}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-body text-muted-foreground">
                  Header Alignment
                </Label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => update('headerAlignment', align)}
                      className={cn(
                        'flex-1 h-8 rounded-md border text-xs font-body capitalize transition-all',
                        customization.headerAlignment === align
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-accent text-muted-foreground'
                      )}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
              <SliderField
                label="Page Margins"
                value={customization.pageMargins}
                min={30}
                max={80}
                step={2}
                onChange={(v) => update('pageMargins', v)}
                suffix="px"
              />
              <SliderField
                label="Section Spacing"
                value={customization.sectionSpacing}
                min={0.5}
                max={2.0}
                step={0.1}
                onChange={(v) => update('sectionSpacing', v)}
                suffix="×"
              />
              <div className="flex items-center justify-between">
                <Label className="text-xs font-body text-muted-foreground">
                  Section Dividers
                </Label>
                <button
                  role="switch"
                  aria-checked={customization.sectionDividers}
                  onClick={() => update('sectionDividers', !customization.sectionDividers)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    customization.sectionDividers ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none block size-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                      customization.sectionDividers ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-body text-muted-foreground">
                  Page Size
                </Label>
                <div className="flex gap-1">
                  {(['a4', 'letter'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => update('pageSize', size)}
                      className={cn(
                        'flex-1 h-8 rounded-md border text-xs font-body uppercase transition-all',
                        customization.pageSize === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-accent text-muted-foreground'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </ScrollArea>
    </div>
  );
}