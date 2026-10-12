'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useTranslations } from '@/i18n/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface PersonalInfoStepProps {
  onNext: (data: { firstName: string; lastName: string; country: string; jobTitle: string }) => void;
  onBack: () => void;
  initialData?: { firstName?: string; lastName?: string; country?: string; jobTitle?: string };
}

const COUNTRY_KEYS = ['ci', 'sn', 'ml', 'bf', 'cm', 'ne', 'tg', 'bj', 'gn', 'td', 'ga', 'cg', 'cd', 'us', 'gb', 'fr', 'ca', 'de', 'ng', 'gh', 'ke', 'za', 'other'] as const;

export default function PersonalInfoStep({ onNext, onBack, initialData }: PersonalInfoStepProps) {
  const t = useTranslations('auth.onboarding.personalInfo');
  const tCommon = useTranslations('auth.common');

  const personalInfoSchema = z.object({
    firstName: z.string().min(1, t('errors.firstNameRequired')),
    lastName: z.string().min(1, t('errors.lastNameRequired')),
    country: z.string().min(1, t('errors.countryRequired')),
    jobTitle: z.string().min(1, t('errors.jobTitleRequired')),
  });

  type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

  const form = useForm<PersonalInfoFormValues>({
    resolver: standardSchemaResolver(personalInfoSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      country: initialData?.country || '',
      jobTitle: initialData?.jobTitle || '',
    },
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  function onSubmit(values: PersonalInfoFormValues) {
    onNext(values);
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
          {t('title')}
        </h2>
        <p className="text-sm text-muted-foreground font-body mt-1">
          {t('subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Name Row */}
            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body text-sm font-medium">
                      {tCommon('firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('firstNamePlaceholder')}
                        autoComplete="given-name"
                        className="h-11 font-body"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body text-sm font-medium">
                      {tCommon('lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('lastNamePlaceholder')}
                        autoComplete="family-name"
                        className="h-11 font-body"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Country */}
            <motion.div variants={staggerItem}>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body text-sm font-medium">
                      {t('countries.select')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full h-11 font-body">
                          <SelectValue placeholder={t('countryPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {COUNTRY_KEYS.map((key) => (
                          <SelectItem key={key} value={key} className="font-body">
                            {t(`countries.${key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Job Title */}
            <motion.div variants={staggerItem}>
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body text-sm font-medium">
                      {t('jobTitlePlaceholder').startsWith('e.g.') ? t('jobTitlePlaceholder').replace(/^e\.g\.\s*,?\s*/i, '') : t('jobTitlePlaceholder')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('jobTitlePlaceholder')}
                        autoComplete="organization-title"
                        className="h-11 font-body"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Buttons */}
            <motion.div variants={staggerItem} className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 h-11 font-body"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {tCommon('back')}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-brand hover:bg-brand/90 text-white font-body font-medium"
              >
                {tCommon('next')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}