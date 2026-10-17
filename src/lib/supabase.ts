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
