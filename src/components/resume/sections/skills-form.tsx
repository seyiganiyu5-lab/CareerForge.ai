'use client';

import { useState, type KeyboardEvent } from 'react';
import { Plus, X, Sparkles, Code2, Heart, ChevronDown } from 'lucide-react';
import type { ResumeData, SkillType, SkillProficiency } from '@/types/resume';
import { createSkill } from '@/lib/resume/defaults';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROFICIENCY_OPTIONS: { value: SkillProficiency | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'Expert', label: 'Expert' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Basic', label: 'Basic' },
];

const PROFICIENCY_LABELS = ['Expert', 'Advanced', 'Intermediate', 'Basic'] as const;

interface SkillsFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onAiAssist?: (params: { section: string; content: string; itemId?: string; field?: string }) => void;
}

/* ── Proficiency chip selector (inline toggle group) ─────────── */

function ProficiencySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      {PROFICIENCY_LABELS.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(value === label ? 'none' : label)}
          className={`rounded-md px-2 py-0.5 text-[11px] font-body transition-colors ${
            value === label
              ? 'bg-brand/15 text-brand font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── Proficiency popover for existing badges ──────────────────── */

function ProficiencyPopover({
  skillId,
  currentProficiency,
  onUpdate,
}: {
  skillId: string;
  currentProficiency?: SkillProficiency;
  onUpdate: (id: string, proficiency: SkillProficiency | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  const select = (p: SkillProficiency | undefined) => {
    onUpdate(skillId, p);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="ml-0.5 rounded p-0.5 hover:bg-foreground/10 transition-colors text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100"
          aria-label="Change proficiency level"
        >
          <ChevronDown className="size-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1" align="start">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => select(undefined)}
            className={`rounded-md px-3 py-1.5 text-sm font-body text-left transition-colors hover:bg-accent ${
              !currentProficiency ? 'bg-accent font-medium' : ''
            }`}
          >
            None
          </button>
          {PROFICIENCY_LABELS.map((level) => (
            <button
              key={level}
              onClick={() => select(level)}
              className={`rounded-md px-3 py-1.5 text-sm font-body text-left transition-colors hover:bg-accent ${
                currentProficiency === level ? 'bg-accent font-medium' : ''
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Skill input group ────────────────────────────────────────── */

function SkillInputGroup({
  label,
  icon: Icon,
  skillType,
  skills,
  inputValue,
  setInputValue,
  proficiencyValue,
  setProficiencyValue,
  onAdd,
  onRemove,
  onUpdateProficiency,
  placeholder,
  accentColor,
}: {
  label: string;
  icon: React.ElementType;
  skillType: SkillType;
  skills: ResumeData['skills'];
  inputValue: string;
  setInputValue: (v: string) => void;
  proficiencyValue: string;
  setProficiencyValue: (v: string) => void;
  onAdd: (name: string, proficiency?: string) => void;
  onRemove: (id: string) => void;
  onUpdateProficiency: (id: string, proficiency: SkillProficiency | undefined) => void;
  placeholder: string;
  accentColor: string;
}) {
  const filtered = skills.filter((s) => (s.type || 'technical') === skillType);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      onAdd(inputValue, proficiencyValue !== 'none' ? proficiencyValue : undefined);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${accentColor}`} />
        <h4 className="font-heading text-sm font-semibold text-foreground">{label}</h4>
        <Badge variant="secondary" className="text-xs tabular-nums">{filtered.length}</Badge>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="font-body flex-1 min-w-0"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdd(inputValue, proficiencyValue !== 'none' ? proficiencyValue : undefined)}
          disabled={!inputValue.trim()}
          aria-label={`Add ${label.toLowerCase()} skill`}
          className="shrink-0"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Proficiency selector (only shown when input has value) */}
      {inputValue.trim() && (
        <div className="flex items-center gap-2 pl-0.5">
          <span className="text-[11px] text-muted-foreground font-body">Level:</span>
          <ProficiencySelector value={proficiencyValue || 'none'} onChange={setProficiencyValue} />
        </div>
      )}

      {/* Skills list */}
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body">
          No {label.toLowerCase()} added yet. Type above to add one.
        </p>
      ) : (
        <div className="max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="gap-0.5 py-1 px-2.5 font-body text-sm group relative"
              >
                <span>{skill.name}</span>
                {skill.proficiency && (
                  <span className="text-[10px] text-muted-foreground/60 font-normal ml-0.5">
                    {skill.proficiency}
                  </span>
                )}
                <button
                  onClick={() => onRemove(skill.id)}
                  className="ml-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X className="size-3" />
                </button>
                <ProficiencyPopover
                  skillId={skill.id}
                  currentProficiency={skill.proficiency}
                  onUpdate={onUpdateProficiency}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main form ────────────────────────────────────────────────── */

export function SkillsForm({ resumeData, setResumeData, onAiAssist }: SkillsFormProps) {
  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');
  const [techProficiency, setTechProficiency] = useState('none');
  const [softProficiency, setSoftProficiency] = useState('none');
  const [activeTab, setActiveTab] = useState('technical');

  const skills = resumeData.skills;

  const addSkill = (name: string, type: SkillType, proficiency?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, createSkill(trimmed, type, proficiency)],
    }));
    if (type === 'technical') {
      setTechInput('');
      setTechProficiency('none');
    } else {
      setSoftInput('');
      setSoftProficiency('none');
    }
  };

  const removeSkill = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  const updateProficiency = (id: string, proficiency: SkillProficiency | undefined) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) =>
        s.id === id ? { ...s, proficiency } : s
      ),
    }));
  };

  const techCount = skills.filter((s) => (s.type || 'technical') === 'technical').length;
  const softCount = skills.filter((s) => s.type === 'soft').length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Skills
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 text-brand hover:text-brand/80 hover:bg-brand/10"
          onClick={() => onAiAssist?.({
            section: 'skills',
            content: resumeData.skills.map(s => s.name).join(', '),
          })}
          aria-label="AI Assist"
        >
          <Sparkles className="size-4" />
        </Button>
      </div>
      <p className="font-body text-sm text-muted-foreground">
        Add your skills. Set proficiency levels to stand out to recruiters.
      </p>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="technical" className="gap-1.5">
              <Code2 className="size-3.5" />
              Technical
              {techCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs tabular-nums px-1.5 py-0">
                  {techCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="soft" className="gap-1.5">
              <Heart className="size-3.5" />
              Soft Skills
              {softCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs tabular-nums px-1.5 py-0">
                  {softCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="mt-4">
            <SkillInputGroup
              label="Technical Skills"
              icon={Code2}
              skillType="technical"
              skills={skills}
              inputValue={techInput}
              setInputValue={setTechInput}
              proficiencyValue={techProficiency}
              setProficiencyValue={setTechProficiency}
              onAdd={(name, prof) => addSkill(name, 'technical', prof)}
              onRemove={removeSkill}
              onUpdateProficiency={updateProficiency}
              placeholder="e.g. JavaScript, Python, React..."
              accentColor="text-brand"
            />
          </TabsContent>

          <TabsContent value="soft" className="mt-4">
            <SkillInputGroup
              label="Soft Skills"
              icon={Heart}
              skillType="soft"
              skills={skills}
              inputValue={softInput}
              setInputValue={setSoftInput}
              proficiencyValue={softProficiency}
              setProficiencyValue={setSoftProficiency}
              onAdd={(name, prof) => addSkill(name, 'soft', prof)}
              onRemove={removeSkill}
              onUpdateProficiency={updateProficiency}
              placeholder="e.g. Leadership, Communication..."
              accentColor="text-pink-500"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}