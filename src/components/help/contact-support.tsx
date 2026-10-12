'use client';

import { motion } from 'framer-motion';
import { Mail, TicketCheck } from 'lucide-react';
import { useLocale } from '@/i18n/provider';

const content = {
  en: {
    title: 'Need more help?',
    description: "Our support team is here to assist you with any questions or issues that aren't covered in our Help Center.",
    email: 'Email Support',
    ticket: 'Open Ticket',
  },
  fr: {
    title: 'Besoin d\'aide supplémentaire ?',
    description: "Notre équipe de support est là pour vous aider avec toutes les questions ou problèmes non couverts dans notre Centre d'Aide.",
    email: 'Support par Email',
    ticket: 'Ouvrir un Ticket',
  },
};

export default function ContactSupport() {
  const { locale } = useLocale();
  const t = content[locale];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-16"
    >
      <div className="rounded-2xl bg-gradient-to-br from-brand/10 via-brand/5 to-transparent border border-brand/20 p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
          {t.title}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 font-body">
          {t.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-brand text-brand-foreground font-medium text-sm hover:bg-brand/90 transition-colors font-body"
          >
            <Mail className="h-4 w-4" />
            {t.email}
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary transition-colors font-body"
          >
            <TicketCheck className="h-4 w-4" />
            {t.ticket}
          </a>
        </div>
      </div>
    </motion.section>
  );
}