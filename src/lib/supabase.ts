import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SiteBannerRecord {
  id?: string;
  page_key: string;
  page_path: string;
  desktop_image_path: string;
  mobile_image_path: string;
  is_published: boolean;
  updated_at?: string;
  updated_by?: string;
}

export interface StudentRecord {
  id: string;
  gr_number: string;
  full_name: string;
  grade_class: string;
  academic_year: string;
  status: 'Active' | 'Alumni' | 'Pending Verification';
}

export interface FeeReceiptRecord {
  id: string;
  receipt_number: string;
  gr_number: string;
  student_name: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  status: 'Confirmed' | 'Pending Clearance' | 'Failed';
}

export interface AdminUserRecord {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'office_staff';
  is_active: boolean;
  created_at?: string;
}

// Safely obtain environment variables (compatible with Astro / Vite on Cloudflare)
const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
  );
};

export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  hasKey: Boolean(supabaseAnonKey),
  configured: isSupabaseConfigured(),
});

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Verified local default assets used as failover
export const DEFAULT_HOMEPAGE_BANNER: SiteBannerRecord = {
  page_key: 'homepage',
  page_path: '/',
  desktop_image_path: '/hero-desktop.png',
  mobile_image_path: '/hero-mobile.png',
  is_published: true,
  updated_at: new Date().toISOString(),
  updated_by: 'MJ School System',
};

/**
 * Fetch the active published banner for a specific page.
 * Falls back to default local assets if Supabase is unconfigured, unreachable, or record is missing.
 */
export async function getPublishedBanner(pageKey: string): Promise<SiteBannerRecord> {
  if (!supabase || !isSupabaseConfigured()) {
    return DEFAULT_HOMEPAGE_BANNER;
  }

  try {
    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .eq('page_key', pageKey)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_HOMEPAGE_BANNER;
    }

    return data as SiteBannerRecord;
  } catch (err) {
    console.warn(`[getPublishedBanner] Failover to default banner for ${pageKey}:`, err);
    return DEFAULT_HOMEPAGE_BANNER;
  }
}

/**
 * Verifies if an authenticated user is explicitly authorized in the admin_users table.
 * Supports both RPC verification (bypassing RLS recursion) and direct table lookup.
 */
export async function verifyStaffAuthorization(
  userId: string,
  userEmail?: string
): Promise<{ authorized: boolean; role?: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured() || !userId) {
    console.warn('[SchoolOffice:Auth] Authorization check skipped: Supabase not configured or missing userId.');
    return { authorized: false, error: 'Supabase client is not configured.' };
  }

  const idPrefix = userId.slice(0, 8);
  console.info(`[SchoolOffice:Auth] Starting staff authorization verification for UID prefix: ${idPrefix}...`);

  try {
    // Stage 1: Try secure RPC function (avoids any RLS recursion and handles UUID linking safely)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_staff_authorization_status');

      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0 && rpcData[0].is_authorized) {
        console.info('[SchoolOffice:Auth] Stage 1 (RPC): Authorization confirmed.', {
          role: rpcData[0].role,
        });
        return { authorized: true, role: rpcData[0].role };
      }

      if (rpcError) {
        console.warn('[SchoolOffice:Auth] Stage 1 (RPC) returned error or not deployed yet:', rpcError.message);
      }
    } catch (rpcEx: any) {
      console.warn('[SchoolOffice:Auth] Stage 1 (RPC) exception:', rpcEx?.message);
    }

    // Stage 2: Direct query on admin_users table by User UUID
    console.info(`[SchoolOffice:Auth] Stage 2: Querying public.admin_users by ID (${idPrefix}...)...`);
    const { data: idRecord, error: idError } = await supabase
      .from('admin_users')
      .select('role, is_active, email')
      .eq('id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (idError) {
      console.error('[SchoolOffice:Auth] Stage 2 query returned database error:', {
        code: idError.code,
        message: idError.message,
      });
      return { authorized: false, error: `Database error (${idError.code || 'RLS'}): ${idError.message}` };
    }

    if (idRecord) {
      console.info('[SchoolOffice:Auth] Stage 2: Authorization confirmed by user UUID match.', {
        role: idRecord.role,
      });
      return { authorized: true, role: idRecord.role };
    }

    // Stage 3: Fallback check by verified email if provided
    if (userEmail && userEmail.includes('@')) {
      const sanitizedEmail = userEmail.trim().toLowerCase();
      console.info(`[SchoolOffice:Auth] Stage 3: Checking registered admin by email: ${sanitizedEmail}...`);

      const { data: emailRecord, error: emailError } = await supabase
        .from('admin_users')
        .select('role, is_active, id')
        .ilike('email', sanitizedEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (!emailError && emailRecord) {
        console.warn('[SchoolOffice:Auth] Stage 3: User authorized by email, but admin_users.id needs synchronization with auth.users.id:', {
          role: emailRecord.role,
          registeredIdPrefix: emailRecord.id ? String(emailRecord.id).slice(0, 8) : 'null',
          authUserIdPrefix: idPrefix,
        });
        return { authorized: true, role: emailRecord.role };
      }

      if (emailError) {
        console.error('[SchoolOffice:Auth] Stage 3 email lookup returned error:', {
          code: emailError.code,
          message: emailError.message,
        });
      }
    }

    console.warn('[SchoolOffice:Auth] All authorization stages completed without finding an active administrator record.');
    return {
      authorized: false,
      error: 'Unauthorized: Your account is authenticated, but no active administrator record matches your user credentials in public.admin_users.',
    };
  } catch (err: any) {
    console.error('[SchoolOffice:Auth] Unexpected exception in verifyStaffAuthorization:', err?.message);
    return { authorized: false, error: err?.message || 'Staff authorization check failed.' };
  }
}

