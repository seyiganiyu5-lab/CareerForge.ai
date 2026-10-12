'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Palette,
  LayoutTemplate,
  Clock,
  Send,
  Wand2,
  ArrowDownUp,
  Type,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  X,
  Lightbulb,
  Loader2,
  Copy,
} from 'lucide-react';
import { useDocumentStudioStore } from '@/stores/document-studio-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── AI Quick Action Data ──────────────────────────────────────

interface QuickAction {
  label: string;
  icon: React.ElementType;
  description: string;
}

const quickActions: QuickAction[] = [
  { label: 'Rewrite', icon: Wand2, description: 'Rephrase selected text' },
  { label: 'Improve Grammar', icon: CheckCircle2, description: 'Fix grammar & spelling' },
  { label: 'Professional Tone', icon: Type, description: 'Make it more formal' },
  { label: 'Shorten', icon: ArrowDownUp, description: 'Condense the content' },
  { label: 'Expand', icon: MessageSquare, description: 'Add more detail' },
  { label: 'Generate', icon: Sparkles, description: 'Generate new content' },
];

// ─── AI Suggestion Data ────────────────────────────────────────

interface Suggestion {
  text: string;
  type: 'improvement' | 'tip';
}

const aiSuggestions: Suggestion[] = [
  { text: 'Add quantifiable achievements to your experience', type: 'improvement' },
  { text: 'Use stronger action verbs like "spearheaded" and "orchestrated"', type: 'tip' },
  { text: 'Include keywords from the job description for ATS optimization', type: 'improvement' },
  { text: 'Consider adding a summary statement at the top', type: 'tip' },
];

// ─── Accent Colors ─────────────────────────────────────────────

const accentColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Pink', value: '#ec4899' },
];

// ─── Template Data ─────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  description: string;
  colorFrom: string;
  colorTo: string;
}

const templates: Template[] = [
  { id: 'modern', name: 'Modern', description: 'Clean & contemporary', colorFrom: '#6366f1', colorTo: '#8b5cf6' },
  { id: 'classic', name: 'Classic', description: 'Traditional & elegant', colorFrom: '#1e3a5f', colorTo: '#2d5a8e' },
  { id: 'minimal', name: 'Minimal', description: 'Simple & refined', colorFrom: '#374151', colorTo: '#6b7280' },
  { id: 'creative', name: 'Creative', description: 'Bold & expressive', colorFrom: '#f43f5e', colorTo: '#ec4899' },
  { id: 'executive', name: 'Executive', description: 'Professional & authoritative', colorFrom: '#0f172a', colorTo: '#334155' },
  { id: 'tech', name: 'Tech', description: 'Developer-focused layout', colorFrom: '#10b981', colorTo: '#14b8a6' },
];

// ─── Animation Variants ────────────────────────────────────────

const panelVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// ─── Sub-components ────────────────────────────────────────────

function QuickActionButton({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            variants={staggerItem}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-start gap-1 rounded-lg bg-muted/50 p-2.5 text-left transition-colors hover:bg-muted w-full cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-primary/80" />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </div>
            <span className="text-[10px] leading-tight text-muted-foreground">
              {action.description}
            </span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {action.label}: {action.description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.01 }}
      className="group flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/50 p-2.5 transition-colors hover:border-border hover:bg-background"
    >
      <div className="mt-0.5 flex-shrink-0">
        {suggestion.type === 'improvement' ? (
          <Lightbulb className="size-3.5 text-amber-500" />
        ) : (
          <Sparkles className="size-3.5 text-primary/60" />
        )}
      </div>
      <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">
        {suggestion.text}
      </p>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
        aria-label="Copy suggestion"
      >
        <Copy className="size-3 text-muted-foreground" />
      </button>
      {copied && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-0.5 text-[10px] text-emerald-600"
        >
          <CheckCircle2 className="size-3" />
        </motion.span>
      )}
    </motion.div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-2.5 transition-colors hover:border-border hover:bg-background cursor-pointer"
    >
      {/* Color preview bar */}
      <div
        className="h-8 w-full rounded-md"
        style={{
          background: `linear-gradient(135deg, ${template.colorFrom}, ${template.colorTo})`,
        }}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground">{template.name}</p>
          <p className="text-[10px] text-muted-foreground">{template.description}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-medium">
          Use
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────

function RightAiPanel() {
  const { rightPanelOpen, rightPanelTab, setRightPanelTab, setRightPanelOpen } =
    useDocumentStudioStore();
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Customize tab state (placeholder)
  const [selectedAccent, setSelectedAccent] = useState('#3b82f6');
  const [selectedFont, setSelectedFont] = useState('inter');
  const [fontSize, setFontSize] = useState([100]);
  const [lineSpacing, setLineSpacing] = useState([150]);
  const [pageMargins, setPageMargins] = useState([24]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      setChatInput('');
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {rightPanelOpen && (
        <motion.aside
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex h-full w-72 flex-col border-l border-border/50 bg-card"
        >
          {/* ── Header with tabs ──────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-border/50 px-2 py-1">
            <Tabs
              value={rightPanelTab}
              onValueChange={(v) => setRightPanelTab(v as typeof rightPanelTab)}
              className="w-full"
            >
              <TabsList className="h-8 w-full rounded-lg bg-transparent p-0 gap-0">
                <TabsTrigger
                  value="ai"
                  className="flex-1 gap-1 rounded-md text-[11px] font-medium data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  <Sparkles className="size-3" />
                  <span>AI</span>
                </TabsTrigger>
                <TabsTrigger
                  value="customize"
                  className="flex-1 gap-1 rounded-md text-[11px] font-medium data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  <Palette className="size-3" />
                  <span>Style</span>
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="flex-1 gap-1 rounded-md text-[11px] font-medium data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  <LayoutTemplate className="size-3" />
                  <span>Templates</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex-1 gap-1 rounded-md text-[11px] font-medium data-[state=active]:bg-muted data-[state=active]:shadow-none"
                >
                  <Clock className="size-3" />
                  <span>History</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Close button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-7 w-7 flex-shrink-0 rounded-md p-0"
                    onClick={() => setRightPanelOpen(false)}
                  >
                    <X className="size-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={4}>
                  Close panel
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ── Tab Content ───────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {/* ─── AI Tab ─────────────────────────────────────── */}
            {rightPanelTab === 'ai' && (
              <motion.div
                key="ai-tab"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-1 flex-col overflow-hidden"
              >
                <ScrollArea className="flex-1">
                  <div className="space-y-4 p-3">
                    {/* Welcome message */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                          <Sparkles className="size-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            AI Assistant
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            I can help you improve your document
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <Separator className="opacity-50" />

                    {/* Quick Actions Grid */}
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {quickActions.map((action) => (
                          <QuickActionButton key={action.label} action={action} />
                        ))}
                      </div>
                    </motion.div>

                    <Separator className="opacity-50" />

                    {/* AI Suggestions */}
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          AI Suggestions
                        </p>
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[10px] font-normal"
                        >
                          {aiSuggestions.length}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        {aiSuggestions.map((suggestion, idx) => (
                          <SuggestionCard key={idx} suggestion={suggestion} />
                        ))}
                      </div>
                    </motion.div>

                    {/* Spacer for fixed input */}
                    <div className="h-4" />
                  </div>
                </ScrollArea>

                {/* Fixed Chat Input */}
                <div className="border-t border-border/50 bg-card p-3">
                  <div className="relative">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask AI to help with your document..."
                      className="min-h-[72px] resize-none rounded-lg border-border/50 bg-muted/30 pr-10 text-xs placeholder:text-muted-foreground/60 focus-visible:ring-primary/20"
                      rows={3}
                    />
                    <div className="absolute bottom-2 right-2">
                      <Button
                        size="sm"
                        onClick={handleSend}
                        disabled={!chatInput.trim() || isGenerating}
                        className="h-7 w-7 rounded-md p-0"
                      >
                        {isGenerating ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Send className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─── Customize Tab ───────────────────────────────── */}
            {rightPanelTab === 'customize' && (
              <motion.div
                key="customize-tab"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="space-y-5 p-3">
                    {/* Accent Color */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="space-y-2.5"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Accent Color
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {accentColors.map((color) => (
                          <TooltipProvider key={color.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setSelectedAccent(color.value)}
                                  className={`relative flex size-8 items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer ${
                                    selectedAccent === color.value
                                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                                      : ''
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  aria-label={`Select ${color.name}`}
                                >
                                  {selectedAccent === color.value && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="flex items-center justify-center"
                                    >
                                      <CheckCircle2 className="size-3 text-white" />
                                    </motion.div>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" sideOffset={4}>
                                {color.name}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </motion.div>

                    <Separator className="opacity-50" />

                    {/* Font Selector */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2.5"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Font Family
                      </p>
                      <Select value={selectedFont} onValueChange={setSelectedFont}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="georgia">Georgia</SelectItem>
                          <SelectItem value="garamond">Garamond</SelectItem>
                          <SelectItem value="merriweather">Merriweather</SelectItem>
                          <SelectItem value="roboto">Roboto</SelectItem>
                          <SelectItem value="lato">Lato</SelectItem>
                          <SelectItem value="calibri">Calibri</SelectItem>
                          <SelectItem value="helvetica">Helvetica</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <Separator className="opacity-50" />

                    {/* Font Size */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Font Size
                        </p>
                        <span className="text-xs font-medium text-primary">
                          {fontSize[0]}%
                        </span>
                      </div>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        min={80}
                        max={140}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground/50">
                        <span>80%</span>
                        <span>140%</span>
                      </div>
                    </motion.div>

                    <Separator className="opacity-50" />

                    {/* Line Spacing */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Line Spacing
                        </p>
                        <span className="text-xs font-medium text-primary">
                          {(lineSpacing[0] / 100).toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={lineSpacing}
                        onValueChange={setLineSpacing}
                        min={100}
                        max={250}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground/50">
                        <span>1.0</span>
                        <span>2.5</span>
                      </div>
                    </motion.div>

                    <Separator className="opacity-50" />

                    {/* Page Margins */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          Page Margins
                        </p>
                        <span className="text-xs font-medium text-primary">
                          {pageMargins[0]}px
                        </span>
                      </div>
                      <Slider
                        value={pageMargins}
                        onValueChange={setPageMargins}
                        min={12}
                        max={48}
                        step={2}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground/50">
                        <span>12px</span>
                        <span>48px</span>
                      </div>
                    </motion.div>
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {/* ─── Templates Tab ───────────────────────────────── */}
            {rightPanelTab === 'templates' && (
              <motion.div
                key="templates-tab"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 overflow-hidden"
              >
                <ScrollArea className="h-full">
                  <div className="space-y-3 p-3">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                        Document Templates
                      </p>
                    </motion.div>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 gap-2"
                    >
                      {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </motion.div>
                  </div>
                </ScrollArea>
              </motion.div>
            )}

            {/* ─── History Tab ─────────────────────────────────── */}
            {rightPanelTab === 'history' && (
              <motion.div
                key="history-tab"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-1 flex-col"
              >
                <div className="flex flex-1 flex-col items-center justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
                      <Clock className="size-7 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-foreground/80">
                        No edits yet
                      </h3>
                      <p className="text-[11px] leading-relaxed text-muted-foreground/60 max-w-[200px]">
                        Your AI-powered edits and changes will appear here as you work on
                        your document.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 h-8 gap-1.5 rounded-lg text-[11px]"
                    >
                      <Sparkles className="size-3" />
                      Start with AI Assistant
                      <ChevronRight className="size-3" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export { RightAiPanel };
