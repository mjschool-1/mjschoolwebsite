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

export interface NoticeRecord {
  id: string;
  title: string;
  date: string;
  category: string;
  is_new: boolean;
  grades: string[];
  description: string;
  has_attachment: boolean;
  attachment_url?: string | null;
  file_size?: string | null;
  is_published: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string | null;
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

// Multi-Page Banner Configuration: exact mapping of page keys to routes and descriptions
export interface BannerPageCategory {
  key: string;
  name: string;
  route: string;
  description: string;
}

export const BANNER_PAGE_CATEGORIES: BannerPageCategory[] = [
  {
    key: 'homepage',
    name: 'Homepage',
    route: '/',
    description: 'Main homepage hero carousel',
  },
  {
    key: 'infrastructure',
    name: 'Infrastructure',
    route: '/about/infrastructure',
    description: 'Campus infrastructure & environment page',
  },
  {
    key: 'facilities',
    name: 'Facilities',
    route: '/facilities',
    description: 'School facilities & learning spaces page',
  },
  {
    key: 'faculty_staff',
    name: 'Faculty & Staff',
    route: '/about/faculty-staff/',
    description: 'Academic leadership, teachers & staff page',
  },
  {
    key: 'syllabus',
    name: 'Syllabus',
    route: '/academics/syllabus',
    description: 'Curriculum, learning stages & syllabus page',
  },
  {
    key: 'gallery',
    name: 'Gallery',
    route: '/gallery',
    description: 'School moments, activities & photo gallery page',
  },
  {
    key: 'events_activities',
    name: 'Events & Activities',
    route: '/academics/events-activities',
    description: 'Annual events, festivals & co-curricular clubs page',
  },
];

export const resolveBannerUrl = (path: string, defaultPath: string = '/hero-desktop.png') => {
  if (!path) return `${import.meta.env.BASE_URL}${defaultPath.replace(/^\//, '')}`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
};

// Verified local default assets used as failover for homepage
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
 * Falls back to default local assets for homepage if unconfigured, or empty list for subpages.
 */
export async function getPublishedBanners(pageKey: string = 'homepage'): Promise<SiteBannerRecord[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
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
      return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
    }

    return data.map((b: any, idx: number) => ({
      ...b,
      title: b.title || `${pageKey} Banner ${idx + 1}`,
      display_order: b.display_order ?? idx,
    })) as SiteBannerRecord[];
  } catch (err) {
    console.warn(`[getPublishedBanners] Failover for ${pageKey}:`, err);
    return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
  }
}

/**
 * Fetch the active published banner for a specific page (backward-compatible).
 */
export async function getPublishedBanner(pageKey: string = 'homepage'): Promise<SiteBannerRecord | null> {
  const banners = await getPublishedBanners(pageKey);
  return banners[0] || (pageKey === 'homepage' ? DEFAULT_HOMEPAGE_BANNER : null);
}

/**
 * Fetch all banners (published and drafts) for admin management of a specific page category.
 */
export async function getAllBanners(pageKey: string = 'homepage'): Promise<SiteBannerRecord[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
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
      console.warn(`[getAllBanners] Database query error for ${pageKey}, using fallback:`, error.message);
      return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
    }

    if (!data || data.length === 0) {
      return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
    }

    return data.map((b: any, idx: number) => ({
      ...b,
      title: b.title || `${pageKey} Banner ${idx + 1}`,
      display_order: b.display_order ?? idx,
    })) as SiteBannerRecord[];
  } catch (err) {
    console.warn(`[getAllBanners] Exception while fetching banners for ${pageKey}:`, err);
    return pageKey === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : [];
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

// Verified local default notices used as failover and seed reference
export const DEFAULT_NOTICES: NoticeRecord[] = [
  {
    id: 'notice-1',
    title: 'Admission Schedule & Verification Guidelines for Session 2025-26',
    date: 'Oct 04, 2025',
    category: 'Admissions',
    is_new: true,
    grades: ['All Grades'],
    description:
      'Detailed instructions regarding document submission, verification timeline, and registration confirmation for all prospective students for the upcoming academic session 2025-26.',
    has_attachment: false,
    attachment_url: null,
    file_size: null,
    is_published: true,
    display_order: 1,
    created_at: '2025-10-04T00:00:00Z',
    updated_at: '2025-10-04T00:00:00Z',
    updated_by: 'MJ School System',
  },
  {
    id: 'notice-2',
    title: 'Kindergarten Rhyme & Storytelling Celebration 2025',
    date: 'Oct 01, 2025',
    category: 'Events',
    is_new: true,
    grades: ['Jr. KG', 'Sr. KG'],
    description:
      'An interactive stage event celebrating early speech, recitation, and dramatic storytelling for pre-primary scholars. Parents are cordially invited to attend the morning assembly.',
    has_attachment: false,
    attachment_url: null,
    file_size: null,
    is_published: true,
    display_order: 2,
    created_at: '2025-10-01T00:00:00Z',
    updated_at: '2025-10-01T00:00:00Z',
    updated_by: 'MJ School System',
  },
  {
    id: 'notice-3',
    title: 'Datesheet for Half-Yearly Examinations - Grade VI to XII',
    date: 'Sep 28, 2025',
    category: 'Exams',
    is_new: true,
    grades: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    description:
      'Official schedule for the Term-I / Half-Yearly theoretical and practical examinations. Students are advised to review reporting times and syllabus portions with respective subject teachers.',
    has_attachment: false,
    attachment_url: null,
    file_size: null,
    is_published: true,
    display_order: 3,
    created_at: '2025-09-28T00:00:00Z',
    updated_at: '2025-09-28T00:00:00Z',
    updated_by: 'MJ School System',
  },
];

/**
 * Fetch all published notices for public views (homepage and /notices/).
 * Falls back safely to DEFAULT_NOTICES if Supabase is unconfigured, table is missing, or query fails.
 */
export async function getPublishedNotices(): Promise<NoticeRecord[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return DEFAULT_NOTICES;
  }

  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[getPublishedNotices] Database query returned error, using fallback notices:', error.message);
      return DEFAULT_NOTICES;
    }

    if (!data || data.length === 0) {
      return DEFAULT_NOTICES;
    }

    return data.map((n: any, idx: number) => {
      const validUrl = typeof n.attachment_url === 'string' && n.attachment_url.trim() ? n.attachment_url.trim() : null;
      return {
        ...n,
        grades: Array.isArray(n.grades) ? n.grades : ['All Grades'],
        is_new: Boolean(n.is_new),
        has_attachment: Boolean(n.has_attachment && validUrl),
        attachment_url: validUrl,
        is_published: Boolean(n.is_published),
        display_order: typeof n.display_order === 'number' ? n.display_order : idx + 1,
      };
    }) as NoticeRecord[];
  } catch (err) {
    console.warn('[getPublishedNotices] Failover to default notices due to exception:', err);
    return DEFAULT_NOTICES;
  }
}

/**
 * Fetch all notices (both published and drafts) for administrator portal management.
 */
export async function getAllNotices(): Promise<NoticeRecord[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return DEFAULT_NOTICES;
  }

  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[getAllNotices] Database query returned error, using fallback notices:', error.message);
      return DEFAULT_NOTICES;
    }

    if (!data || data.length === 0) {
      return DEFAULT_NOTICES;
    }

    return data.map((n: any, idx: number) => {
      const validUrl = typeof n.attachment_url === 'string' && n.attachment_url.trim() ? n.attachment_url.trim() : null;
      return {
        ...n,
        grades: Array.isArray(n.grades) ? n.grades : ['All Grades'],
        is_new: Boolean(n.is_new),
        has_attachment: Boolean(n.has_attachment && validUrl),
        attachment_url: validUrl,
        file_size: validUrl ? (n.file_size || 'PDF') : null,
        is_published: Boolean(n.is_published),
        display_order: typeof n.display_order === 'number' ? n.display_order : idx + 1,
      };
    }) as NoticeRecord[];
  } catch (err) {
    console.warn('[getAllNotices] Exception while fetching notices, using fallback:', err);
    return DEFAULT_NOTICES;
  }
}

/**
 * Create a new notice record in Supabase.
 */
export async function createNotice(
  notice: Omit<NoticeRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: NoticeRecord; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: notice.title,
        date: notice.date,
        category: notice.category,
        is_new: notice.is_new,
        grades: notice.grades,
        description: notice.description,
        has_attachment: notice.has_attachment,
        attachment_url: notice.attachment_url || null,
        file_size: notice.file_size || null,
        is_published: notice.is_published,
        display_order: notice.display_order,
        updated_by: notice.updated_by || 'Admin',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as NoticeRecord };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create notice.' };
  }
}

/**
 * Update an existing notice record in Supabase.
 */
export async function updateNotice(
  id: string,
  updates: Partial<NoticeRecord>
): Promise<{ success: boolean; data?: NoticeRecord; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    delete payload.id;
    delete payload.created_at;

    const { data, error } = await supabase
      .from('notices')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as NoticeRecord };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update notice.' };
  }
}

/**
 * Delete a notice record from Supabase.
 */
export async function deleteNotice(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete notice.' };
  }
}

// ==============================================================================
// Facilities Gallery Management & Reordering
// ==============================================================================

export interface FacilityImageRecord {
  id?: string;
  facility_key: string;
  title?: string;
  image_url: string | null;
  display_order?: number;
  updated_at?: string;
  updated_by?: string | null;
}

export interface FacilityCardConfig {
  image_url: string | null;
  display_order: number;
  title?: string;
  show_title?: boolean;
  page_section?: string;
}

export interface ManagedGalleryItem {
  id?: string;
  facility_key: string;
  title: string;
  image_url: string | null;
  display_order: number;
  page_section: 'facilities' | 'infrastructure' | 'gallery' | string;
  show_title: boolean;
  updated_at?: string;
  updated_by?: string;
}

/**
 * Fetch all facility card configurations (images, titles, visibility & display orders) from Supabase.
 * Returns a key-value map: { [facility_key]: FacilityCardConfig }
 */
export async function getFacilityCardConfigs(): Promise<Record<string, FacilityCardConfig>> {
  if (!supabase || !isSupabaseConfigured()) {
    return {};
  }

  const result: Record<string, FacilityCardConfig> = {};

  try {
    // 1. Primary check: dedicated facility_images table with show_title & title
    let { data, error } = await supabase
      .from('facility_images')
      .select('facility_key, title, image_url, display_order, show_title, page_section')
      .or('page_section.eq.facilities,page_section.is.null')
      .order('display_order', { ascending: true });

    // Fallback if page_section or show_title columns are not yet in schema cache
    if (error && (error.message?.includes('show_title') || error.message?.includes('page_section'))) {
      const fallback = await supabase
        .from('facility_images')
        .select('facility_key, title, image_url, display_order')
        .order('display_order', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data && Array.isArray(data)) {
      data.forEach((row: any, idx: number) => {
        if (row.facility_key) {
          result[row.facility_key] = {
            title: row.title || row.facility_key,
            image_url: row.image_url || null,
            display_order: typeof row.display_order === 'number' ? row.display_order : idx,
            show_title: row.show_title !== false,
            page_section: row.page_section || 'facilities',
          };
        }
      });
      return result;
    }

    // 2. Fallback check: site_banners table with 'facility_item_' prefix
    const { data: bannerData, error: bannerError } = await supabase
      .from('site_banners')
      .select('page_key, title, desktop_image_path, display_order')
      .like('page_key', 'facility_item_%')
      .order('display_order', { ascending: true });

    if (!bannerError && bannerData && Array.isArray(bannerData)) {
      bannerData.forEach((row: any, idx: number) => {
        const key = row.page_key.replace('facility_item_', '');
        if (key) {
          result[key] = {
            title: row.title || key,
            image_url: row.desktop_image_path?.trim() ? row.desktop_image_path.trim() : null,
            display_order: typeof row.display_order === 'number' ? row.display_order : idx,
            show_title: true,
            page_section: 'facilities',
          };
        }
      });
    }

    return result;
  } catch (err) {
    console.warn('[getFacilityCardConfigs] Error retrieving facility configs:', err);
    return result;
  }
}

/**
 * Fetch all gallery items for a specific section ('facilities' | 'infrastructure' | 'gallery').
 */
export async function getGalleryItemsBySection(
  pageSection: 'facilities' | 'infrastructure' | 'gallery' | string
): Promise<ManagedGalleryItem[]> {
  if (!supabase || !isSupabaseConfigured()) {
    return [];
  }

  try {
    let { data, error } = await supabase
      .from('facility_images')
      .select('*')
      .eq('page_section', pageSection)
      .order('display_order', { ascending: true });

    // Fallback if page_section column not yet created
    if (error && error.message?.includes('page_section')) {
      if (pageSection === 'facilities') {
        const fallback = await supabase
          .from('facility_images')
          .select('*')
          .order('display_order', { ascending: true });
        data = fallback.data;
        error = fallback.error;
      } else if (pageSection === 'infrastructure') {
        const fallback = await supabase
          .from('facility_images')
          .select('*')
          .eq('facility_key', 'campus_main')
          .limit(1);
        data = fallback.data;
        error = fallback.error;
      } else {
        data = [];
        error = null;
      }
    }

    if (error || !data) {
      console.warn(`[getGalleryItemsBySection] Error fetching ${pageSection} items:`, error?.message);
      return [];
    }

    return data.map((row: any, idx: number) => ({
      id: row.id,
      facility_key: row.facility_key,
      title: row.title || row.facility_key,
      image_url: row.image_url || null,
      display_order: typeof row.display_order === 'number' ? row.display_order : idx,
      page_section: row.page_section || pageSection,
      show_title: row.show_title !== false,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
    })) as ManagedGalleryItem[];
  } catch (err) {
    console.warn(`[getGalleryItemsBySection] Exception for ${pageSection}:`, err);
    return [];
  }
}

/**
 * Fetch all facility card image mappings from Supabase.
 * Returns a key-value map: { [facility_key]: image_url }
 */
export async function getFacilityImages(): Promise<Record<string, string>> {
  const configs = await getFacilityCardConfigs();
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(configs)) {
    if (val.image_url) {
      result[key] = val.image_url;
    }
  }
  return result;
}

/**
 * Update the display sequence for cards in Supabase.
 */
export async function updateFacilityOrders(
  orderedKeys: string[],
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  return updateGalleryOrders(orderedKeys, 'facilities', updatedBy);
}

/**
 * Update the display sequence for any page section ('facilities' | 'gallery').
 */
export async function updateGalleryOrders(
  orderedKeys: string[],
  pageSection: string = 'facilities',
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  if (!orderedKeys || orderedKeys.length === 0) {
    return { success: false, error: 'No keys provided to order.' };
  }

  try {
    const timestamp = new Date().toISOString();
    const updater = updatedBy || 'Admin Staff';

    let primarySuccess = true;
    for (let idx = 0; idx < orderedKeys.length; idx++) {
      const key = orderedKeys[idx];
      const { error } = await supabase
        .from('facility_images')
        .update({
          display_order: idx,
          updated_at: timestamp,
          updated_by: updater,
        })
        .eq('facility_key', key);

      if (error) {
        primarySuccess = false;
        break;
      }
    }

    if (primarySuccess) {
      return { success: true };
    }

    return { success: false, error: 'Failed to update item display order.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update display orders.' };
  }
}

/**
 * Save, create, or update any managed gallery item across Facilities, Infrastructure, or Gallery pages.
 */
export async function saveGalleryItem(
  item: {
    facility_key: string;
    title: string;
    image_url: string | null;
    display_order?: number;
    page_section?: 'facilities' | 'infrastructure' | 'gallery' | string;
    show_title?: boolean;
    updated_by?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const payload: any = {
      facility_key: item.facility_key,
      title: item.title,
      image_url: item.image_url,
      updated_at: new Date().toISOString(),
      updated_by: item.updated_by || 'Admin Staff',
    };

    if (typeof item.display_order === 'number') {
      payload.display_order = item.display_order;
    }
    if (item.page_section) {
      payload.page_section = item.page_section;
    }
    if (typeof item.show_title === 'boolean') {
      payload.show_title = item.show_title;
    }

    const { error } = await supabase
      .from('facility_images')
      .upsert(payload, { onConflict: 'facility_key' });

    if (!error) {
      return { success: true };
    }

    // Fallback if show_title or page_section columns missing in database
    if (error.message?.includes('show_title') || error.message?.includes('page_section')) {
      delete payload.show_title;
      delete payload.page_section;
      const fallbackRes = await supabase
        .from('facility_images')
        .upsert(payload, { onConflict: 'facility_key' });
      if (!fallbackRes.error) {
        return { success: true };
      }
    }

    return { success: false, error: error.message };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save gallery item.' };
  }
}

/**
 * Update or save an image for a specific facility card (backward-compatible).
 */
export async function updateFacilityImage(
  facilityKey: string,
  imageUrl: string | null,
  title?: string,
  updatedBy?: string,
  showTitle?: boolean
): Promise<{ success: boolean; error?: string }> {
  return saveGalleryItem({
    facility_key: facilityKey,
    title: title || facilityKey,
    image_url: imageUrl,
    page_section: 'facilities',
    show_title: showTitle ?? true,
    updated_by: updatedBy,
  });
}

/**
 * Remove an image from a facility card (reverts to empty frame placeholder).
 */
export async function removeFacilityImage(
  facilityKey: string,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  return updateFacilityImage(facilityKey, null, undefined, updatedBy);
}

/**
 * Delete a gallery item completely from the database.
 */
export async function deleteGalleryItem(
  facilityKey: string,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('facility_images')
      .delete()
      .eq('facility_key', facilityKey);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete gallery item.' };
  }
}

// ==============================================================================
// Gallery Card Image Sets (Multiple Images Per Card for /gallery/)
// ==============================================================================

export interface GalleryCardImageItem {
  id: string;
  card_key: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface FetchGalleryImagesResult {
  data: GalleryCardImageItem[];
  error?: string | null;
}

/**
 * Fetch all images belonging to a specific gallery card's image set with error details.
 */
export async function fetchGalleryCardImages(cardKey: string): Promise<FetchGalleryImagesResult> {
  if (!cardKey || typeof cardKey !== 'string') {
    return { data: [], error: 'Invalid or missing card key.' };
  }
  if (!supabase || !isSupabaseConfigured()) {
    return { data: [], error: 'Supabase client is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('gallery_card_images')
      .select('*')
      .eq('card_key', cardKey)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn(`[fetchGalleryCardImages] Supabase error for ${cardKey}:`, error.message);
      return { data: [], error: error.message };
    }

    return { data: (data as GalleryCardImageItem[]) || [], error: null };
  } catch (err: any) {
    console.error(`[fetchGalleryCardImages] Exception for ${cardKey}:`, err);
    return { data: [], error: err?.message || 'Network error while fetching images.' };
  }
}

/**
 * Fetch all images belonging to a specific gallery card's image set (array return).
 */
export async function getGalleryCardImages(cardKey: string): Promise<GalleryCardImageItem[]> {
  const res = await fetchGalleryCardImages(cardKey);
  return res.data || [];
}

/**
 * Fetch all card image sets grouped by card_key: { [card_key]: GalleryCardImageItem[] }
 */
export async function getAllGalleryCardImages(): Promise<Record<string, GalleryCardImageItem[]>> {
  if (!supabase || !isSupabaseConfigured()) return {};
  try {
    const { data, error } = await supabase
      .from('gallery_card_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) return {};

    const grouped: Record<string, GalleryCardImageItem[]> = {};
    for (const row of data) {
      if (!grouped[row.card_key]) grouped[row.card_key] = [];
      grouped[row.card_key].push(row as GalleryCardImageItem);
    }
    return grouped;
  } catch (err) {
    console.warn('[getAllGalleryCardImages] Error fetching all set images:', err);
    return {};
  }
}

/**
 * Add multiple images to a gallery card's image set.
 */
export async function addImagesToGallerySet(
  cardKey: string,
  imageUrls: string[],
  updatedBy?: string
): Promise<{ success: boolean; error?: string; inserted?: GalleryCardImageItem[] }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }
  if (!imageUrls || imageUrls.length === 0) {
    return { success: true, inserted: [] };
  }

  try {
    // 1. Get current count / max display_order for this card
    const existing = await getGalleryCardImages(cardKey);
    const startOrder = existing.length;

    const rowsToInsert = imageUrls.map((url, i) => ({
      card_key: cardKey,
      image_url: url,
      display_order: startOrder + i,
      updated_by: updatedBy || 'Admin Staff',
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('gallery_card_images')
      .insert(rowsToInsert)
      .select('*');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, inserted: (data as GalleryCardImageItem[]) || [] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to add images to set.' };
  }
}

/**
 * Persistently update the display order of images within a gallery card set.
 */
export async function updateGallerySetImageOrder(
  cardKey: string,
  orderedImageIds: string[],
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const timestamp = new Date().toISOString();
    const updater = updatedBy || 'Admin Staff';

    for (let idx = 0; idx < orderedImageIds.length; idx++) {
      const id = orderedImageIds[idx];
      const { error } = await supabase
        .from('gallery_card_images')
        .update({
          display_order: idx,
          updated_at: timestamp,
          updated_by: updater,
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reorder image set.' };
  }
}

/**
 * Replace a specific image in a card set.
 */
export async function replaceGallerySetImage(
  imageId: string,
  newImageUrl: string,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('gallery_card_images')
      .update({
        image_url: newImageUrl,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || 'Admin Staff',
      })
      .eq('id', imageId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to replace image.' };
  }
}

/**
 * Delete a specific image from a card set.
 */
export async function deleteGallerySetImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase
      .from('gallery_card_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete image.' };
  }
}





