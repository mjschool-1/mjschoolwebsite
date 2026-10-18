import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SiteBannerRecord {
  id?: string;
  page_key: string;
  page_path: string;
  title: string;
  desktop_image_path: string;
  mobile_image_path: string;
  is_published: boolean;
  display_order: number;
  created_at?: string;
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
  id: 'default-homepage-banner',
  page_key: 'homepage',
  page_path: '/',
  title: 'Main School Hero Banner',
  desktop_image_path: '/hero-desktop.png',
  mobile_image_path: '/hero-mobile.png',
  is_published: true,
  display_order: 0,
  updated_at: new Date().toISOString(),
  updated_by: 'MJ School System',
};

/**
 * Fetch all active published banners for a specific page, ordered deterministically.
 * Falls back to default local assets if Supabase is unconfigured, unreachable, or records are missing.
 */
export async function getPublishedBanners(pageKey: string = 'homepage'): Promise<SiteBannerRecord[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return [DEFAULT_HOMEPAGE_BANNER];
  }

  try {
    let { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .eq('page_key', pageKey)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    // Fallback if display_order column is not yet in the database or schema cache
    if (error && error.message?.includes('display_order')) {
      console.warn('[getPublishedBanners] display_order column missing in schema cache; querying without display_order.');
      const fallback = await supabase
        .from('site_banners')
        .select('*')
        .eq('page_key', pageKey)
        .eq('is_published', true);
      data = fallback.data;
      error = fallback.error;
    }

    if (error || !data || data.length === 0) {
      return [DEFAULT_HOMEPAGE_BANNER];
    }

    return data.map((b: any, idx: number) => ({
      ...b,
      title: b.title || `Homepage Banner ${idx + 1}`,
      display_order: b.display_order ?? idx,
    })) as SiteBannerRecord[];
  } catch (err) {
    console.warn(`[getPublishedBanners] Failover to default banner for ${pageKey}:`, err);
    return [DEFAULT_HOMEPAGE_BANNER];
  }
}

/**
 * Fetch the active published banner for a specific page (backward-compatible).
 */
export async function getPublishedBanner(pageKey: string = 'homepage'): Promise<SiteBannerRecord> {
  const banners = await getPublishedBanners(pageKey);
  return banners[0] || DEFAULT_HOMEPAGE_BANNER;
}

/**
 * Fetch all banners (published and drafts) for admin management.
 */
export async function getAllBanners(pageKey: string = 'homepage'): Promise<SiteBannerRecord[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return [DEFAULT_HOMEPAGE_BANNER];
  }

  try {
    let { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .eq('page_key', pageKey)
      .order('display_order', { ascending: true });

    // Fallback if display_order column is not yet in the database or schema cache
    if (error && error.message?.includes('display_order')) {
      console.warn('[getAllBanners] display_order column missing in schema cache; querying without display_order.');
      const fallback = await supabase
        .from('site_banners')
        .select('*')
        .eq('page_key', pageKey);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [DEFAULT_HOMEPAGE_BANNER];
    }

    return data.map((b: any, idx: number) => ({
      ...b,
      title: b.title || `Homepage Banner ${idx + 1}`,
      display_order: b.display_order ?? idx,
    })) as SiteBannerRecord[];
  } catch (err) {
    console.error(`[getAllBanners] Failed to fetch banners for ${pageKey}:`, err);
    throw err;
  }
}

/**
 * Persists updated display_order for a list of banners.
 */
export async function updateBannerOrders(
  orderedItems: { id: string; display_order: number }[]
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const updates = orderedItems.map((item) =>
      supabase!
        .from('site_banners')
        .update({
          display_order: item.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed && failed.error) {
      return { success: false, error: failed.error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update banner display order.' };
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

    // If both Stage 1 and Stage 2 complete without an authorized record, access is denied
    console.warn('[SchoolOffice:Auth] Canonical UID check completed without finding an active administrator record.');
    return {
      authorized: false,
      error: 'Unauthorized: Your account is authenticated, but no active administrator record matches your user credentials in public.admin_users.',
    };
  } catch (err: any) {
    console.error('[SchoolOffice:Auth] Unexpected exception in verifyStaffAuthorization:', err?.message);
    return { authorized: false, error: err?.message || 'Staff authorization check failed.' };
  }
}

