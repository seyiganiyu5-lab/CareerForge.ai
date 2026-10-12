'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { STATUSES } from './status-config';
import { JobCard } from './job-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JobApplication } from '@/hooks/use-job-tracker';

interface KanbanBoardProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAiSuggest: (id: string) => void;
  onChangeStatus: (id: string, status: string) => void;
}

export function KanbanBoard({
  applications,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onAiSuggest,
  onChangeStatus,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dragItemId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, statusKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(statusKey);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, statusKey: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = dragItemId.current || e.dataTransfer.getData('text/plain');
    if (id) {
      onChangeStatus(id, statusKey);
    }
    dragItemId.current = null;
  }, [onChangeStatus]);

  return (
    <div className="overflow-x-auto pb-2 -mx-px">
      <div className="flex gap-3 min-w-max px-0.5">
        {STATUSES.map((status) => {
          const columnApps = applications.filter(a => a.status === status.key);
          const isOver = dragOverColumn === status.key;
          const Icon = status.icon;

          return (
            <div
              key={status.key}
              className={
                `w-[280px] shrink-0 flex flex-col rounded-xl transition-colors ` +
                (isOver
                  ? 'bg-primary/5 ring-2 ring-primary/30'
                  : 'bg-muted/30')
              }
              onDragOver={(e) => handleDragOver(e, status.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status.key)}
            >
              {/* Column Header */}
              <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border/50">
                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium font-heading text-foreground truncate">
                  {status.label}
                </span>
                <span className={
                  'ml-auto text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ' +
                  (columnApps.length > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')
                }>
                  {columnApps.length}
                </span>
              </div>

              {/* Cards */}
              <ScrollArea className="flex-1 max-h-[calc(100vh-380px)]">
                <div className="p-2 space-y-2 min-h-[60px]">
                  <AnimatePresence mode="popLayout">
                    {columnApps.map(app => (
                      <JobCard
                        key={app.id}
                        application={app}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onArchive={onArchive}
                        onDelete={onDelete}
                        onAiSuggest={onAiSuggest}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </AnimatePresence>
                  {columnApps.length === 0 && (
                    <div className={
                      'flex items-center justify-center py-8 rounded-lg border-2 border-dashed transition-colors ' +
                      (isOver
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-transparent')
                    }>
                      <p className="text-[11px] text-muted-foreground font-body">
                        {isOver ? 'Drop here' : 'No applications'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
