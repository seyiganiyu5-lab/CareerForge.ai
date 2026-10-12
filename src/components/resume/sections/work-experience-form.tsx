'use client';

import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { EMPLOYMENT_TYPES } from '@/types/resume';
import { createWorkExperience } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkExperienceFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onAiAssist?: (params: { section: string; content: string; itemId?: string; field?: string }) => void;
}

export function WorkExperienceForm({ resumeData, setResumeData, onAiAssist }: WorkExperienceFormProps) {
  const items = resumeData.workExperience;

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, createWorkExperience()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((e) => e.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        Work Experience
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        List your work history, starting with the most recent position.
      </p>

      <div className="mt-4 space-y-4">
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-body text-sm text-muted-foreground">
              No entries yet. Click the button below to add one.
            </p>
          </div>
        )}

        {items.map((item) => (
          <Card key={item.id} className="relative py-4 transition-shadow hover:shadow-md">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                  aria-label="Delete work experience entry"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Label className="font-body">Company</Label>
                  <Input
                    value={item.company}
                    onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                    placeholder="Google"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Location</Label>
                  <Input
                    value={item.location}
                    onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                    placeholder="Mountain View, CA"
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">Position</Label>
                  <Input
                    value={item.position}
                    onChange={(e) => updateItem(item.id, 'position', e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Employment Type</Label>
                  <Select
                    value={item.employmentType}
                    onValueChange={(v) => updateItem(item.id, 'employmentType', v)}
                  >
                    <SelectTrigger className="mt-1.5 w-full font-body">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">Start Date</Label>
                  <Input
                    type="month"
                    value={item.startDate}
                    onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">End Date</Label>
                  <Input
                    type="month"
                    value={item.endDate}
                    onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                    disabled={item.currentJob}
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`current-${item.id}`}
                  checked={item.currentJob}
                  onCheckedChange={(checked) =>
                    updateItem(item.id, 'currentJob', !!checked)
                  }
                />
                <Label htmlFor={`current-${item.id}`} className="font-body text-sm font-normal">
                  I currently work here
                </Label>
              </div>

              <div>
              <div className="flex items-center justify-between">
                <Label className="font-body">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-8 text-brand hover:text-brand/80 hover:bg-brand/10"
                  onClick={() => onAiAssist?.({
                    section: 'workExperience',
                    content: item.description,
                    itemId: item.id,
                    field: 'description',
                  })}
                  aria-label="AI Assist"
                >
                  <Sparkles className="size-4" />
                </Button>
              </div>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Describe your responsibilities, achievements, and impact..."
                  className="mt-1.5 min-h-[100px] resize-y font-body"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addItem}
          className="w-full font-body"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Experience
        </Button>
      </div>
    </div>
  );
}