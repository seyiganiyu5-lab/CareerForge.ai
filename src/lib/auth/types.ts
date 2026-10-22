export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  auth_provider: string;
  google_id?: string | null;
  google_picture_url?: string | null;
  country: string | null;
  job_title: string | null;
  career_level: CareerLevel | null;
  career_goal: CareerGoal | null;
  language: string;
  theme: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  /** Site admin (ADMIN_EMAILS): sees the Enterprise requests page */
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export type CareerLevel = 'student' | 'graduate' | 'professional' | 'freelancer' | 'career_changer';
export type CareerGoal = 'build_resume' | 'create_cover_letter' | 'improve_resume' | 'track_applications' | 'find_jobs';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** The session couldn't be checked (network / Supabase / database down). Not the same as signed out. */
  connectionError?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface OnboardingData {
  firstName: string;
  lastName: string;
  country: string;
  jobTitle: string;
  careerLevel: CareerLevel;
  careerGoals: CareerGoal[];
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
  /** Set when the user must confirm their email before signing in */
  needsVerification?: boolean;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}