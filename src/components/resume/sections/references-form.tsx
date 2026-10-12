'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';
import { createReference } from '@/lib/resume/defaults';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReferencesFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function ReferencesForm({ resumeData, setResumeData }: ReferencesFormProps) {
  const items = resumeData.references;

  const addItem = () => {
    setResumeData((prev) => ({
      ...prev,
      references: [...prev.references, createReference()],
    }));
  };

  const removeItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      references: prev.references.filter((r) => r.id !== id),
    }));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      references: prev.references.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    }));
  };

  return (
    <div className="space-y-1">
      <h3 className="font-heading text-lg font-semibold text-foreground">
        References
      </h3>
      <p className="font-body text-sm text-muted-foreground">
        Add professional references who can vouch for your qualifications.
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
                  aria-label="Delete reference entry"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="font-body">Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Jane Smith"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Position</Label>
                  <Input
                    value={item.position}
                    onChange={(e) => updateItem(item.id, 'position', e.target.value)}
                    placeholder="Engineering Manager"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Company</Label>
                  <Input
                    value={item.company}
                    onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                    placeholder="Google"
                    className="mt-1.5 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-body">Email</Label>
                  <Input
                    type="email"
                    value={item.email}
                    onChange={(e) => updateItem(item.id, 'email', e.target.value)}
                    placeholder="jane@google.com"
                    className="mt-1.5 font-body"
                  />
                </div>
                <div>
                  <Label className="font-body">Phone</Label>
                  <Input
                    type="tel"
                    value={item.phone}
                    onChange={(e) => updateItem(item.id, 'phone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
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
          Add Reference
        </Button>
      </div>
    </div>
  );
}