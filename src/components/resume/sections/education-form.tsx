'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createEducation } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EducationFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function EducationForm({ resumeData, setResumeData }: EducationFormProps) {
  const items = resumeData.education;

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, createEducation()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        Education
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        Add your educational background, including degrees and certifications.
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
                  aria-label="Delete education entry"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">School</Label>
                  <Input
                    value={item.school}
                    onChange={(e) => updateItem(item.id, 'school', e.target.value)}
                    placeholder="Stanford University"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Location</Label>
                  <Input
                    value={item.location}
                    onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                    placeholder="Stanford, CA"
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">Degree</Label>
                  <Input
                    value={item.degree}
                    onChange={(e) => updateItem(item.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Field of Study</Label>
                  <Input
                    value={item.fieldOfStudy}
                    onChange={(e) => updateItem(item.id, 'fieldOfStudy', e.target.value)}
                    placeholder="Computer Science"
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Grade / GPA</Label>
                  <Input
                    value={item.grade}
                    onChange={(e) => updateItem(item.id, 'grade', e.target.value)}
                    placeholder="3.8 / 4.0"
                    className="mt-1.5 font-body"
                  />
                </div>
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
          Add Education
        </Button>
      </div>
    </div>
  );
}