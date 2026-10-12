'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  GripVertical, MapPin, DollarSign, ExternalLink,
  Edit, Copy, Archive, Trash2, Sparkles, Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { getStatusConfig, getBorderColor, daysAgo } from './status-config';
import type { JobApplication } from '@/hooks/use-job-tracker';

interface JobCardProps {
  application: JobApplication;
  onEdit: (app: JobApplication) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onAiSuggest: (id: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}

function JobCardInner({
  application,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onAiSuggest,
  isDragging,
  onDragStart,
}: JobCardProps) {
  const statusConfig = getStatusConfig(application.status);
  const borderColor = getBorderColor(application.status);
  const ago = daysAgo(application.applied_at || application.created_at);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card
        draggable
        onDragStart={(e) => onDragStart?.(e, application.id)}
        className={
          `p-3 cursor-grab active:cursor-grabbing border-l-4 ${borderColor} transition-all hover:shadow-md ` +
          (isDragging ? 'opacity-50 scale-95 rotate-2' : '')
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm font-heading text-foreground truncate">
              {application.company_name}
            </p>
            <p className="text-xs text-muted-foreground font-body truncate mt-0.5">
              {application.job_title}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(application)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(application.id)}>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(application.id)}>
                <Archive className="w-4 h-4 mr-2" /> {application.is_archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAiSuggest(application.id)}>
                <Sparkles className="w-4 h-4 mr-2" /> AI Suggestions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(application.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs font-body">
          {application.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.location}</span>
            </div>
          )}
          {application.salary && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.salary}</span>
            </div>
          )}
        </div>

        {/* Badges + Time */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {application.work_mode && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-body">
              {application.work_mode}
            </Badge>
          )}
          {application.employment_type && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-body">
              {application.employment_type}
            </Badge>
          )}
          {application.job_url && (
            <a
              href={application.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-body gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" /> Link
              </Badge>
            </a>
          )}
        </div>

        {/* Time indicator */}
        {ago && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground font-body">
            <Clock className="w-3 h-3" />
            {ago}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export const JobCard = memo(JobCardInner);
