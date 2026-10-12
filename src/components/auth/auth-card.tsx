'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}

export default function AuthCard({ children, title, subtitle, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className={className || 'border-border/50 shadow-lg bg-card/80 backdrop-blur-sm'}>
        <CardHeader className="text-center space-y-2 pb-2">
          <CardTitle className="text-2xl font-bold font-heading">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground font-body">
            {subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}