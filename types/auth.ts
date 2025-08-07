import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    provider?: 'google';
  };
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
} 