'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AIEditAction } from '@/types/cover-letter';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  aiActions?: { action: AIEditAction; label: string; icon: React.ElementType }[];
  onAIAction?: (action: AIEditAction) => void;
  aiLoading?: boolean;
  loadingSection?: string | null;
  children: React.ReactNode;
}

export function SectionCard({
  icon,
  title,
  description,
  defaultOpen = true,
  aiActions,
  onAIAction,
  aiLoading = false,
  loadingSection,
  children,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      layout
      initial={false}
      className="group"
    >
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-sm">
        {/* Collapsible Header */}
        <CardHeader
          className="p-4 cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10 text-brand shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold font-heading text-foreground leading-tight">{title}</h3>
                {description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* AI Actions Button */}
              {aiActions && aiActions.length > 0 && onAIAction && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-brand bg-brand/8 hover:bg-brand/15 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="hidden sm:inline">AI</span>
                      {aiLoading && loadingSection === title && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {aiActions.map(({ action, label, icon: Icon }) => (
                      <DropdownMenuItem
                        key={action}
                        className="text-xs gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAIAction(action);
                        }}
                        disabled={aiLoading}
                      >
                        <Icon className="w-3.5 h-3.5 text-brand" />
                        <span>{label}</span>
                        {aiLoading && loadingSection === title && (
                          <Loader2 className="w-3 h-3 ml-auto animate-spin text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <motion.div
                animate={{ rotate: isOpen ? 0 : -90 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 px-4 pb-4">
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/* ─── AI Action Buttons for Content Sections ─────────────────────── */

interface AIActionButtonProps {
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  onClick: () => void;
}

export function AIActionButton({ icon, label, loading, onClick }: AIActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-brand bg-brand/8 hover:bg-brand/15 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}
