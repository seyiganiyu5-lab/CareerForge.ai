'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { FadeInUp } from '@/lib/motion';
import { useAuth } from '@/lib/auth/context';
import type { CareerLevel, CareerGoal } from '@/lib/auth/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Globe,
  Shield,
  Calendar,
  Save,
  Loader2,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const CAREER_LEVEL_OPTIONS: { value: CareerLevel; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'professional', label: 'Professional' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'career_changer', label: 'Career Changer' },
];

const CAREER_GOAL_OPTIONS: { value: CareerGoal; label: string }[] = [
  { value: 'build_resume', label: 'Build Resume' },
  { value: 'create_cover_letter', label: 'Create Cover Letter' },
  { value: 'improve_resume', label: 'Improve Resume' },
  { value: 'track_applications', label: 'Track Applications' },
  { value: 'find_jobs', label: 'Find Jobs' },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  email: string;
  country: string | null;
  job_title: string | null;
  career_level: CareerLevel | null;
  career_goal: CareerGoal | null;
  auth_provider: string;
  google_picture_url: string | null;
  email_verified: boolean;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? '';
  const l = lastName?.charAt(0)?.toUpperCase() ?? '';
  return f + l || '?';
}

function getCareerLevelLabel(value: CareerLevel | null): string {
  return CAREER_LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? 'Not set';
}

function getCareerGoalLabel(value: CareerGoal | null): string {
  return CAREER_GOAL_OPTIONS.find((o) => o.value === value)?.label ?? 'Not set';
}

// ── Animation ────────────────────────────────────────────────────────────────

// Replaced framer-motion variants with FadeInUp from @/lib/motion

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [careerLevel, setCareerLevel] = useState<string>('');
  const [careerGoal, setCareerGoal] = useState<string>('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user as ProfileData;
        setProfile(u);
        setFirstName(u.first_name ?? '');
        setLastName(u.last_name ?? '');
        setCountry(u.country ?? '');
        setJobTitle(u.job_title ?? '');
        setCareerLevel(u.career_level ?? '');
        setCareerGoal(u.career_goal ?? '');
      } else {
        toast.error(data.error || 'Failed to load profile');
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          country,
          job_title: jobTitle,
          career_level: careerLevel || null,
          career_goal: careerGoal || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) =>
          prev ? { ...prev, ...data.user } : prev
        );
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground font-body">
          Unable to load profile data.
        </p>
      </div>
    );
  }

  const initials = getInitials(profile.first_name, profile.last_name);

  return (
    <FadeInUp className="space-y-6 max-w-3xl mx-auto" duration={0.4}>
      {/* ── Avatar & Quick Info ──────────────────────────────────────────── */}
      <FadeInUp
        className="flex items-center gap-5"
        delay={0}
      >
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-brand text-primary-foreground text-2xl font-bold font-heading shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-heading truncate">
            {profile.first_name || profile.last_name
              ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
              : 'Your Profile'}
          </h1>
          <p className="text-muted-foreground font-body text-sm truncate">
            {profile.email}
          </p>
        </div>
      </FadeInUp>

      {/* ── Edit Profile Card ────────────────────────────────────────────── */}
      <FadeInUp delay={0.08 * 1}>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              Edit Profile
            </CardTitle>
            <CardDescription className="font-body">
              Update your personal information and career details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="first_name"
                  className="font-body"
                >
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-9 font-body"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="last_name"
                  className="font-body"
                >
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-9 font-body"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-body"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile.email}
                    readOnly
                    disabled
                    className="pl-9 bg-muted font-body"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="font-body"
                >
                  Country
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="country"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="pl-9 font-body"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="job_title"
                  className="font-body"
                >
                  Job Title
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="job_title"
                    placeholder="Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="pl-9 font-body"
                  />
                </div>
              </div>

              {/* Career Level */}
              <div className="space-y-2">
                <Label className="font-body">
                  Career Level
                </Label>
                <Select value={careerLevel} onValueChange={setCareerLevel}>
                  <SelectTrigger className="w-full font-body">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Career Goal */}
              <div className="space-y-2">
                <Label className="font-body">
                  Career Goal
                </Label>
                <Select value={careerGoal} onValueChange={setCareerGoal}>
                  <SelectTrigger className="w-full font-body">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_GOAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand hover:bg-brand/90 text-primary-foreground font-body"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Save className="size-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>

      {/* ── Account Info Card ────────────────────────────────────────────── */}
      <FadeInUp delay={0.08 * 2}>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              Account Information
            </CardTitle>
            <CardDescription className="font-body">
              Details about your account and membership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Member Since */}
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium font-body">
                  Member Since
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Auth Provider */}
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium font-body">
                  Auth Provider
                </p>
                <p className="text-sm text-muted-foreground font-body capitalize">
                  {profile.auth_provider === 'google'
                    ? 'Google'
                    : profile.auth_provider === 'email'
                      ? 'Email & Password'
                      : profile.auth_provider}
                </p>
              </div>
            </div>

            <Separator />

            {/* Email Verified */}
            <div className="flex items-center gap-3">
              <Globe className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium font-body">
                  Email Verified
                </p>
              </div>
              {profile.email_verified ? (
                <Badge className="bg-emerald/15 text-emerald border-emerald/25 font-body">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="font-body">
                  Not Verified
                </Badge>
              )}
            </div>

            <Separator />

            {/* Career Level Display */}
            <div className="flex items-center gap-3">
              <Briefcase className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium font-body">
                  Career Level
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  {getCareerLevelLabel(profile.career_level)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Career Goal Display */}
            <div className="flex items-center gap-3">
              <Briefcase className="size-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium font-body">
                  Career Goal
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  {getCareerGoalLabel(profile.career_goal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeInUp>
    </FadeInUp>
  );
}