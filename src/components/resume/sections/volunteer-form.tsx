'use client';

import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createVolunteerExperience } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface VolunteerFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onAiAssist?: (params: { section: string; content: string; itemId?: string; field?: string }) => void;
}

export function VolunteerForm({ resumeData, setResumeData, onAiAssist }: VolunteerFormProps) {
  const items = resumeData.volunteerExperience;

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      volunteerExperience: [...prev.volunteerExperience, createVolunteerExperience()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteerExperience: prev.volunteerExperience.filter((v) => v.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteerExperience: prev.volunteerExperience.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        Volunteer Experience
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        Highlight your volunteer work and community involvement.
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
                  aria-label="Delete volunteer experience entry"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">Organization</Label>
                  <Input
                    value={item.organization}
                    onChange={(e) => updateItem(item.id, 'organization', e.target.value)}
                    placeholder="Red Cross"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Role</Label>
                  <Input
                    value={item.role}
                    onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                    placeholder="Community Outreach Coordinator"
                    className="mt-1.5 font-body"
                  />
                </div>
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
                    section: 'volunteerExperience',
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
                  placeholder="Describe your volunteer activities and impact..."
                  className="mt-1.5 min-h-[80px] resize-y font-body"
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
          Add Volunteer Experience
        </Button>
      </div>
    </div>
  );
}