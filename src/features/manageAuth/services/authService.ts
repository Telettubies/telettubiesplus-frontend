import { createClient } from '@supabase/supabase-js';
import { axiosClient } from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { getEnvVar, shouldUseMock } from '@/shared/utils/mockSwitch';
import { MOCK_USERS } from '../mockups/auth.mock';
import type { PerfilMiembro } from '@/api/types';

// S-06: Exclusivamente VITE_SUPABASE_ANON_KEY pública. Jamás se expone la service_role_key.
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://org-co-8001.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'public-anon-key-placeholder';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<{ token: string; profile: PerfilMiembro }> {
    const cleanEmail = email.trim().toLowerCase();

    if (shouldUseMock('VITE_MOCK_AUTH')) {
      await new Promise((res) => setTimeout(res, 320));
      const matched = MOCK_USERS[cleanEmail];
      if (!matched || (password !== matched.password && password !== 'demo')) {
        // HU-F01: Mensaje genérico sin revelar si el correo existe
        throw new Error(
          'Invalid credentials or unauthorized organization domain. Please contact your company administrator.'
        );
      }
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.supabase-jwt-verified',
        profile: matched.profile,
      };
    }

    const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !authData.session) {
      throw new Error(
        'Invalid credentials or unauthorized organization domain. Please contact your company administrator.'
      );
    }

    const { data: profile } = await axiosClient.get<PerfilMiembro>(API_ENDPOINTS.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    });

    return {
      token: authData.session.access_token,
      profile,
    };
  },

  async signOut(): Promise<void> {
    if (!shouldUseMock('VITE_MOCK_AUTH')) {
      await supabaseClient.auth.signOut();
    }
  },
};
