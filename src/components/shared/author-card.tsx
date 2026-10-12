'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AuthorCardProps {
  author: {
    name: string;
    role: string;
    bio?: string;
  };
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AuthorCard({ author, className }: AuthorCardProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className="h-10 w-10 bg-brand/10 border-0">
        <AvatarFallback className="bg-brand/10 text-brand font-medium text-sm">
          {getInitials(author.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-foreground text-sm">{author.name}</p>
        <p className="text-sm text-muted-foreground">{author.role}</p>
        {author.bio && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{author.bio}</p>
        )}
      </div>
    </div>
  );
}