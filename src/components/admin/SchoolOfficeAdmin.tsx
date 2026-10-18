import React, { useState, useEffect, useRef } from 'react';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  supabase,
  getPublishedBanner,
  DEFAULT_HOMEPAGE_BANNER,
  SiteBannerRecord,
  verifyStaffAuthorization,
} from '../../lib/supabase';
import {
  Image as ImageIcon,
  Users,
  Receipt,
  LogOut,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Menu,
  X,
  ExternalLink,
  Shield,
  Lock,
  RefreshCw,
  Save,
  ArrowLeft,
  Calendar,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

type AdminTab = 'banners' | 'students' | 'receipts';

interface SelectedImageState {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}

export const SchoolOfficeAdmin: React.FC = () => {
  // Navigation & Drawer state
  const [activeTab, setActiveTab] = useState<AdminTab>('banners');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication & Authorization state
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Banners data state
  const [bannerRecord, setBannerRecord] = useState<SiteBannerRecord>(DEFAULT_HOMEPAGE_BANNER);
  const [isEditingHomepage, setIsEditingHomepage] = useState(false);
  const [bannersLoading, setBannersLoading] = useState(false);

  // Replacement banner upload state
  const [desktopFile, setDesktopFile] = useState<SelectedImageState | null>(null);
  const [mobileFile, setMobileFile] = useState<SelectedImageState | null>(null);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [saveBannerMessage, setSaveBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const config = getSupabaseConfig();

  // Validate active session & enforce database-backed administrator authorization
  useEffect(() => {
    let isMounted = true;

    const validateActiveSession = async () => {
      if (!supabase || !isSupabaseConfigured()) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          if (isMounted) {
            setIsAuthenticated(false);
            setCurrentUserEmail(null);
            setCurrentUserRole(null);
            setIsCheckingAuth(false);
          }
          return;
        }

        // Verify user exists in admin_users table and is active
        const authResult = await verifyStaffAuthorization(session.user.id);
        if (!isMounted) return;

        if (authResult.authorized) {
          setIsAuthenticated(true);
          setCurrentUserEmail(session.user.email || 'Admin Staff');
          setCurrentUserRole(authResult.role || 'admin');
        } else {
          // Valid Supabase user, but not an authorized administrator
          await supabase?.auth.signOut();
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setAuthError('Access Denied: Your account is authenticated, but is not authorized as an MJ School administrator.');
        }
      } catch (err: any) {
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setAuthError(err?.message || 'Authentication error.');
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    validateActiveSession();

    if (supabase && isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setIsCheckingAuth(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const authResult = await verifyStaffAuthorization(session.user.id);
          if (!isMounted) return;

          if (authResult.authorized) {
            setIsAuthenticated(true);
            setCurrentUserEmail(session.user.email || 'Admin Staff');
            setCurrentUserRole(authResult.role || 'admin');
            setAuthError(null);
          } else {
            await supabase?.auth.signOut();
            setIsAuthenticated(false);
            setCurrentUserEmail(null);
            setCurrentUserRole(null);
            setAuthError('Access Denied: Your account is authenticated, but is not registered in the school administrative directory.');
          }
          setIsCheckingAuth(false);
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    } else {
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Fetch active banner data when authenticated
  const loadBanners = async () => {
    setBannersLoading(true);
    try {
      const data = await getPublishedBanner('homepage');
      setBannerRecord(data);
    } catch (err) {
      console.error('Failed to load banner data:', err);
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBanners();
    }
  }, [isAuthenticated]);

  // Handle staff sign-in with database authorization check
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isSupabaseConfigured() || !supabase) {
      setAuthError('Supabase is not configured yet. Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message);
        setIsAuthenticated(false);
        return;
      }

      if (data.user) {
        // Enforce database-backed administrator authorization
        const authResult = await verifyStaffAuthorization(data.user.id);
        if (authResult.authorized) {
          setIsAuthenticated(true);
          setCurrentUserEmail(data.user.email || 'Admin Staff');
          setCurrentUserRole(authResult.role || 'admin');
          setAuthPassword(''); // Clear password from component memory
          setAuthError(null);
        } else {
          // Valid user in auth.users, but not registered in admin_users
          await supabase?.auth.signOut();
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setAuthError('Access Denied: Your login credentials are valid, but your account is not authorized as an MJ School administrator.');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase && isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setCurrentUserEmail(null);
    setCurrentUserRole(null);
    setAuthError(null);
  };

  // Inspect and select desktop image
  const handleDesktopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid image file (WebP, PNG, or JPEG).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setDesktopFile({
        file,
        previewUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    img.src = previewUrl;
  };

  // Inspect and select mobile image
  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid image file (WebP, PNG, or JPEG).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setMobileFile({
        file,
        previewUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    img.src = previewUrl;
  };

  // Clear selections
  const clearDesktopSelection = () => {
    if (desktopFile?.previewUrl) URL.revokeObjectURL(desktopFile.previewUrl);
    setDesktopFile(null);
    if (desktopInputRef.current) desktopInputRef.current.value = '';
  };

  const clearMobileSelection = () => {
    if (mobileFile?.previewUrl) URL.revokeObjectURL(mobileFile.previewUrl);
    setMobileFile(null);
    if (mobileInputRef.current) mobileInputRef.current.value = '';
  };

  const handleDiscardChanges = () => {
    clearDesktopSelection();
    clearMobileSelection();
    setSaveBannerMessage(null);
    setIsEditingHomepage(false);
  };

  // Save banner changes (Storage Upload + DB Update)
  const handleSaveBanner = async () => {
    if (!desktopFile && !mobileFile) {
      setSaveBannerMessage({ type: 'error', text: 'No image changes to save.' });
      return;
    }

    setIsSavingBanner(true);
    setSaveBannerMessage(null);

    if (!isSupabaseConfigured() || !supabase) {
      setSaveBannerMessage({
        type: 'error',
        text: 'Supabase connection is required to upload assets and update published banner records.',
      });
      setIsSavingBanner(false);
      return;
    }

    try {
      let newDesktopUrl = bannerRecord.desktop_image_path;
      let newMobileUrl = bannerRecord.mobile_image_path;
      const timestamp = Date.now();

      // 1. Upload Desktop Banner if selected
      if (desktopFile) {
        const ext = desktopFile.file.name.split('.').pop() || 'png';
        const desktopPath = `homepage-desktop-${timestamp}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('site-banners')
          .upload(desktopPath, desktopFile.file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Desktop banner upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('site-banners')
          .getPublicUrl(desktopPath);

        newDesktopUrl = publicUrlData.publicUrl;
      }

      // 2. Upload Mobile Banner if selected
      if (mobileFile) {
        const ext = mobileFile.file.name.split('.').pop() || 'png';
        const mobilePath = `homepage-mobile-${timestamp}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('site-banners')
          .upload(mobilePath, mobileFile.file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Mobile banner upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('site-banners')
          .getPublicUrl(mobilePath);

        newMobileUrl = publicUrlData.publicUrl;
      }

      // 3. Upsert into database
      const { data: updatedRecord, error: dbError } = await supabase
        .from('site_banners')
        .upsert(
          {
            page_key: 'homepage',
            page_path: '/',
            desktop_image_path: newDesktopUrl,
            mobile_image_path: newMobileUrl,
            is_published: true,
            updated_at: new Date().toISOString(),
            updated_by: currentUserEmail || 'Staff Admin',
          },
          { onConflict: 'page_key' }
        )
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database record update failed: ${dbError.message}`);
      }

      setBannerRecord(updatedRecord as SiteBannerRecord);
      setSaveBannerMessage({
        type: 'success',
        text: 'Homepage banner successfully updated and published to the live website!',
      });
      clearDesktopSelection();
      clearMobileSelection();
    } catch (err: any) {
      setSaveBannerMessage({
        type: 'error',
        text: err?.message || 'Failed to save banner changes. Please check permissions.',
      });
    } finally {
      setIsSavingBanner(false);
    }
  };

  // Helper to format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Default Asset';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // ============================================================================
  // 1. Initial Session Validation State (Prevents flash of protected content)
  // ============================================================================
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
        <div className="w-full max-w-sm bg-[#07172C] border border-[#C59B27]/40 p-8 flex flex-col items-center text-center shadow-2xl">
          <div className="w-14 h-14 bg-white p-2 border border-slate-300 mb-4 flex items-center justify-center">
            <img src="/logo.png" alt="MJ School Logo" className="w-full h-full object-contain" />
          </div>
          <RefreshCw className="w-6 h-6 text-[#C59B27] animate-spin mb-3" />
          <p className="text-xs uppercase font-serif tracking-widest text-[#F6D55C] font-bold">
            MJ School Office
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. Unauthenticated Staff Sign-In View (Strict Supabase Auth)
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
        <div className="w-full max-w-md bg-[#07172C] border-2 border-[#C59B27] rounded-none shadow-2xl p-6 sm:p-8">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-white p-2 border border-slate-300 mb-3 flex items-center justify-center">
              <img src="/logo.png" alt="MJ School Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-white tracking-wider uppercase">
              MJ School
            </h1>
            <span className="text-xs text-[#C59B27] font-bold uppercase tracking-widest mt-0.5">
              School Office Portal
            </span>
            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              Authorized staff administration for banners, records, and school operations.
            </p>
          </div>

          {/* Configuration status indicator */}
          {!config.configured && (
            <div className="bg-amber-950/70 border border-amber-500/50 p-4 mb-6 text-xs text-amber-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#F6D55C]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#C59B27]" />
                <span>Supabase Configuration Required</span>
              </div>
              <p>
                Environment variables <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">PUBLIC_SUPABASE_URL</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">PUBLIC_SUPABASE_ANON_KEY</code> must be configured in your environment to authenticate staff accounts.
              </p>
            </div>
          )}

          {authError && (
            <div className="bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs p-3.5 mb-5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Staff Sign-In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="staff@mjschoolkalyan.edu.in"
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-[#C59B27] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-[#C59B27] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#C59B27] hover:bg-[#b58b19] disabled:opacity-50 text-[#0B2545] font-black text-xs uppercase tracking-wider py-3 px-4 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#0B2545]" />
                  <span>Sign In to School Office</span>
                </>
              )}
            </button>
          </form>

          {/* Back to public site */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Authenticated School Office Admin Panel
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-[#07172C] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#C59B27] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white p-1 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="MJ School Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif font-black text-sm uppercase tracking-wider block text-white leading-none">
              MJ School
            </span>
            <span className="text-[10px] text-[#C59B27] font-bold uppercase tracking-widest leading-none">
              School Office
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#C59B27]" /> : <Menu className="w-6 h-6 text-[#C59B27]" />}
        </button>
      </header>

      {/* Desktop Sidebar & Mobile Collapsible Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 md:z-30 w-64 bg-[#07172C] text-white border-r-2 border-[#C59B27] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar School Branding */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white p-1.5 shrink-0 shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="MJ School Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-base uppercase tracking-wider text-white leading-none">
                  MJ School
                </span>
                <span className="text-[11px] text-[#C59B27] font-bold uppercase tracking-widest mt-1">
                  School Office
                </span>
              </div>
            </div>
          </div>

          {/* Primary Navigation Items */}
          <nav className="p-4 space-y-1.5" aria-label="School Office Navigation">
            <button
              type="button"
              onClick={() => {
                setActiveTab('banners');
                setIsEditingHomepage(false);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-[#C59B27] text-[#0B2545] shadow-sm font-black'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>1. Banners</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('students');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-[#C59B27] text-[#0B2545] shadow-sm font-black'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2. Student Database</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('receipts');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
                activeTab === 'receipts'
                  ? 'bg-[#C59B27] text-[#0B2545] shadow-sm font-black'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>3. Fee Receipts</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Staff Status and Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-[#040D1A]/50">
          <div className="text-[11px] text-slate-400">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Authenticated Staff</span>
            <span className="truncate block font-medium text-slate-200 mt-0.5" title={currentUserEmail || ''}>
              {currentUserEmail || 'Staff Admin'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9.5px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                {currentUserRole === 'super_admin' ? 'Super Admin' : currentUserRole === 'office_staff' ? 'Office Staff' : 'Verified Admin'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-slate-300 hover:text-[#F6D55C] transition-colors py-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </a>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-rose-300 hover:text-rose-100 transition-colors py-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* ==================================================================== */}
        {/* 1. BANNERS SECTION                                                   */}
        {/* ==================================================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Top Section Header */}
            <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="w-8 h-0.5 bg-[#C59B27] mb-2"></div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B2545]">
                  Website Banners Management
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Manage desktop and mobile hero banners across the MJ School website.
                </p>
              </div>

              {!isEditingHomepage && (
                <button
                  type="button"
                  onClick={loadBanners}
                  disabled={bannersLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bannersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              )}
            </div>

            {/* Notification alert */}
            {saveBannerMessage && (
              <div
                className={`p-4 border text-xs flex items-start gap-2.5 ${
                  saveBannerMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {saveBannerMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium">{saveBannerMessage.text}</div>
                <button
                  type="button"
                  onClick={() => setSaveBannerMessage(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* VIEW A: Banner Listing */}
            {!isEditingHomepage && (
              <div className="bg-white border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                    Configured Page Banners (1)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Additional page banners can be registered dynamically
                  </span>
                </div>

                <div className="p-6">
                  {/* Homepage Banner Card Entry */}
                  <div className="border border-slate-200 p-5 sm:p-6 hover:border-slate-300 transition-colors space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold font-serif text-[#0B2545]">
                            Homepage Hero Banner
                          </h3>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                            {bannerRecord.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">Route: /</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSaveBannerMessage(null);
                          setIsEditingHomepage(true);
                        }}
                        className="bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        Edit / Manage Banners
                      </button>
                    </div>

                    {/* Previews Grid in Card */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                      {/* Desktop Preview */}
                      <div className="md:col-span-8 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Desktop Banner (1920 × 640)</span>
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                            {bannerRecord.desktop_image_path}
                          </span>
                        </div>
                        <div className="w-full aspect-[1920/640] bg-slate-900 border border-slate-200 overflow-hidden">
                          <img
                            src={bannerRecord.desktop_image_path}
                            alt="Desktop Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Mobile Preview */}
                      <div className="md:col-span-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                          <span>Mobile Banner (535 × 378)</span>
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                            {bannerRecord.mobile_image_path}
                          </span>
                        </div>
                        <div className="w-full aspect-[535/378] bg-slate-900 border border-slate-200 overflow-hidden">
                          <img
                            src={bannerRecord.mobile_image_path}
                            alt="Mobile Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                        <span>Last Updated: {formatDate(bannerRecord.updated_at)}</span>
                      </div>
                      <div>
                        <span>Updated By: <strong>{bannerRecord.updated_by || 'Administration'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW B: Homepage Edit / Upload Management */}
            {isEditingHomepage && (
              <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-8">
                {/* Back & Title */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0B2545] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Banner Listing</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                      Editing Homepage Banner
                    </span>
                  </div>
                </div>

                {/* 1. Desktop Banner Section */}
                <div className="p-6 border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B2545]">
                        Desktop Banner Asset
                      </h3>
                      <p className="text-xs text-slate-600">
                        Recommended dimensions: <strong>1920 × 640 px</strong>. Formats supported: WebP, JPEG, PNG.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={desktopInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleDesktopFileChange}
                        className="hidden"
                        id="desktop-banner-input"
                      />
                      <label
                        htmlFor="desktop-banner-input"
                        className="bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select Desktop Image</span>
                      </label>
                      {desktopFile && (
                        <button
                          type="button"
                          onClick={clearDesktopSelection}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold">
                        {desktopFile ? 'Pending Replacement Preview:' : 'Current Live Desktop Banner:'}
                      </span>
                      {desktopFile && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {desktopFile.file.name} ({desktopFile.sizeKb} KB)
                        </span>
                      )}
                    </div>

                    <div className="w-full aspect-[1920/640] bg-slate-900 border-2 border-slate-300 overflow-hidden relative">
                      <img
                        src={desktopFile ? desktopFile.previewUrl : bannerRecord.desktop_image_path}
                        alt="Desktop Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Dimension Validation Warning / Confirmation */}
                    {desktopFile && (
                      <div className="mt-2 text-xs">
                        {desktopFile.width === 1920 && desktopFile.height === 640 ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Optimal dimensions verified: 1920 × 640 px. Perfect match for desktop screens.</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 border border-amber-300 p-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block">Dimension Advisory:</strong>
                              <span>
                                Uploaded image is {desktopFile.width} × {desktopFile.height} px (aspect ratio {(desktopFile.width / desktopFile.height).toFixed(2)}:1).
                                Recommended is 1920 × 640 px (3.0:1). The image will be displayed using <code>object-cover</code> to prevent distortion.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Mobile Banner Section */}
                <div className="p-6 border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B2545]">
                        Mobile Banner Asset
                      </h3>
                      <p className="text-xs text-slate-600">
                        Recommended dimensions: <strong>535 × 378 px</strong>. Formats supported: WebP, JPEG, PNG.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={mobileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleMobileFileChange}
                        className="hidden"
                        id="mobile-banner-input"
                      />
                      <label
                        htmlFor="mobile-banner-input"
                        className="bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select Mobile Image</span>
                      </label>
                      {mobileFile && (
                        <button
                          type="button"
                          onClick={clearMobileSelection}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold">
                        {mobileFile ? 'Pending Replacement Preview:' : 'Current Live Mobile Banner:'}
                      </span>
                      {mobileFile && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {mobileFile.file.name} ({mobileFile.sizeKb} KB)
                        </span>
                      )}
                    </div>

                    <div className="max-w-md w-full aspect-[535/378] bg-slate-900 border-2 border-slate-300 overflow-hidden relative">
                      <img
                        src={mobileFile ? mobileFile.previewUrl : bannerRecord.mobile_image_path}
                        alt="Mobile Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Dimension Validation Warning / Confirmation */}
                    {mobileFile && (
                      <div className="mt-2 text-xs max-w-md">
                        {mobileFile.width === 535 && mobileFile.height === 378 ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Optimal dimensions verified: 535 × 378 px. Perfect match for mobile screens.</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 border border-amber-300 p-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block">Dimension Advisory:</strong>
                              <span>
                                Uploaded image is {mobileFile.width} × {mobileFile.height} px (aspect ratio {(mobileFile.width / mobileFile.height).toFixed(2)}:1).
                                Recommended is 535 × 378 px (1.42:1).
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save / Discard Actions */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    {desktopFile || mobileFile ? (
                      <span className="text-amber-800 font-bold">
                        Unsaved Changes: {desktopFile ? 'Desktop banner replacement selected. ' : ''}
                        {mobileFile ? 'Mobile banner replacement selected.' : ''}
                      </span>
                    ) : (
                      <span>No pending replacement images selected.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDiscardChanges}
                      disabled={isSavingBanner}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Discard / Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveBanner}
                      disabled={(!desktopFile && !mobileFile) || isSavingBanner}
                      className="px-6 py-2.5 bg-[#C59B27] hover:bg-[#b58b19] disabled:opacity-40 text-[#0B2545] text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isSavingBanner ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-[#0B2545]" />
                          <span>Uploading &amp; Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-[#0B2545]" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. STUDENT DATABASE SECTION                                          */}
        {/* ==================================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6">
              <div className="w-8 h-0.5 bg-[#C59B27] mb-2"></div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B2545]">
                Student Records Database
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Authorized access for student admissions, roll registers, and academic documentation.
              </p>
            </div>

            {/* Integration Notice */}
            <div className="bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#0B2545] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block text-[#0B2545]">Student Database Module (Integration Ready)</strong>
                Student records will become available here once the database schema is synchronized with the school admission records. No fabricated records are populated.
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student name or GR number..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545]"
                  disabled
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  disabled
                  className="border border-slate-300 text-xs px-3 py-2 bg-slate-50 text-slate-500 w-full sm:w-auto outline-none"
                >
                  <option>All Classes (Nursery to Grade 12)</option>
                </select>
              </div>
            </div>

            {/* Prepared Table with Empty State */}
            <div className="bg-white border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Student Full Name</th>
                      <th className="py-3.5 px-4">GR / Enrollment No.</th>
                      <th className="py-3.5 px-4">Class &amp; Section</th>
                      <th className="py-3.5 px-4">Academic Year</th>
                      <th className="py-3.5 px-4">Record Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="py-12 px-4 text-center">
                        <div className="max-w-sm mx-auto space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                            <Users className="w-5 h-5 text-[#C59B27]" />
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#0B2545]">
                            No Student Records Published
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Official student database integration is pending school authorization. Authenticated records will securely populate here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. FEE RECEIPTS SECTION                                              */}
        {/* ==================================================================== */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6">
              <div className="w-8 h-0.5 bg-[#C59B27] mb-2"></div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B2545]">
                Fee Receipts &amp; Ledger
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Official institutional fee receipts, counter payments, and transaction records.
              </p>
            </div>

            {/* Integration Notice */}
            <div className="bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#0B2545] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block text-[#0B2545]">Fee Ledger (Payment Gateway Integration Ready)</strong>
                Receipts will automatically generate upon payment gateway activation and counter collection synchronization. No fabricated payments or receipt numbers are shown.
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by receipt or student GR number..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545]"
                  disabled
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  disabled
                  className="border border-slate-300 text-xs px-3 py-2 bg-slate-50 text-slate-500 w-full sm:w-auto outline-none"
                >
                  <option>All Payment Statuses (Confirmed / Pending)</option>
                </select>
              </div>
            </div>

            {/* Prepared Table with Empty State */}
            <div className="bg-white border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Receipt Reference</th>
                      <th className="py-3.5 px-4">Student GR / Name</th>
                      <th className="py-3.5 px-4">Amount Received</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Payment Mode</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center">
                        <div className="max-w-sm mx-auto space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                            <Receipt className="w-5 h-5 text-[#C59B27]" />
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#0B2545]">
                            No Payment Receipts Recorded Yet
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            No transactions have been processed. Once the verified school payment gateway is configured, confirmed payments will appear here with downloadable official receipts.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
