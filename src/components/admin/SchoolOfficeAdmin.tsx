import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  supabase,
  getAllBanners,
  updateBannerOrders,
  DEFAULT_HOMEPAGE_BANNER,
  SiteBannerRecord,
  verifyStaffAuthorization,
  NoticeRecord,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  BANNER_PAGE_CATEGORIES,
  BannerPageCategory,
  getFacilityImages,
  getFacilityCardConfigs,
  updateFacilityOrders,
  updateFacilityImage,
  removeFacilityImage,
} from '../../lib/supabase';
import { FACILITIES_CARDS, FacilityCardItem } from '../../data/schoolData';
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
  LayoutGrid,
  Search,
  Filter,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Bell,
  FileText,
} from 'lucide-react';

type AdminTab = 'banners' | 'students' | 'receipts' | 'notices' | 'gallery';

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

  // Banners multi-banner data state
  const [selectedBannerCategory, setSelectedBannerCategory] = useState<string>('homepage');
  const [bannersList, setBannersList] = useState<SiteBannerRecord[]>([DEFAULT_HOMEPAGE_BANNER]);
  const [isEditingBanner, setIsEditingBanner] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<SiteBannerRecord | null>(null);
  const [bannerTitle, setBannerTitle] = useState<string>('');
  const [bannerIsPublished, setBannerIsPublished] = useState<boolean>(true);
  const [bannersLoading, setBannersLoading] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteConfirmBanner, setDeleteConfirmBanner] = useState<SiteBannerRecord | null>(null);
  const [isDeletingBanner, setIsDeletingBanner] = useState<boolean>(false);

  // Replacement banner upload state
  const [desktopFile, setDesktopFile] = useState<SelectedImageState | null>(null);
  const [mobileFile, setMobileFile] = useState<SelectedImageState | null>(null);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [saveBannerMessage, setSaveBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notices management state
  const [noticesList, setNoticesList] = useState<NoticeRecord[]>([]);
  const [noticesLoading, setNoticesLoading] = useState<boolean>(false);
  const [isEditingNotice, setIsEditingNotice] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<NoticeRecord | null>(null);
  const [noticeTitle, setNoticeTitle] = useState<string>('');
  const [noticeDate, setNoticeDate] = useState<string>('');
  const [noticeCategory, setNoticeCategory] = useState<string>('General');
  const [noticeDescription, setNoticeDescription] = useState<string>('');
  const [noticeGrades, setNoticeGrades] = useState<string[]>(['All Grades']);
  const [noticeIsNew, setNoticeIsNew] = useState<boolean>(true);
  const [noticeHasAttachment, setNoticeHasAttachment] = useState<boolean>(false);
  const [noticeAttachmentUrl, setNoticeAttachmentUrl] = useState<string>('');
  const [noticeFileSize, setNoticeFileSize] = useState<string>('');
  const [noticeIsPublished, setNoticeIsPublished] = useState<boolean>(true);
  const [noticeDisplayOrder, setNoticeDisplayOrder] = useState<number>(0);
  const [isSavingNotice, setIsSavingNotice] = useState<boolean>(false);
  const [noticeSaveMessage, setNoticeSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmNotice, setDeleteConfirmNotice] = useState<NoticeRecord | null>(null);
  const [isDeletingNotice, setIsDeletingNotice] = useState<boolean>(false);
  const [noticeSearchQuery, setNoticeSearchQuery] = useState<string>('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>('All');

  // Facilities Gallery management & reordering state
  const [orderedFacilityCards, setOrderedFacilityCards] = useState<FacilityCardItem[]>(FACILITIES_CARDS);
  const [facilityImages, setFacilityImages] = useState<Record<string, string>>({});
  const [facilityImagesLoading, setFacilityImagesLoading] = useState<boolean>(false);
  const [facilityDragIndex, setFacilityDragIndex] = useState<number | null>(null);
  const [facilityDragOverIndex, setFacilityDragOverIndex] = useState<number | null>(null);
  const [isReorderingFacilities, setIsReorderingFacilities] = useState<boolean>(false);
  const [galleryGlobalMessage, setGalleryGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFacilityFiles, setSelectedFacilityFiles] = useState<Record<string, SelectedImageState | null>>({});
  const [uploadingFacilityKey, setUploadingFacilityKey] = useState<string | null>(null);
  const [facilityMessages, setFacilityMessages] = useState<Record<string, { type: 'success' | 'error'; text: string } | null>>({});

  const loadFacilityImages = useCallback(async () => {
    setFacilityImagesLoading(true);
    try {
      const configs = await getFacilityCardConfigs();

      // Update image mapping
      const imgMap: Record<string, string> = {};
      for (const [key, val] of Object.entries(configs)) {
        if (val.image_url) {
          imgMap[key] = val.image_url;
        }
      }
      setFacilityImages(imgMap);

      // Sort cards according to saved display_order
      const sortedCards = [...FACILITIES_CARDS].sort((a, b) => {
        const defaultIndexA = FACILITIES_CARDS.findIndex((c) => c.key === a.key);
        const defaultIndexB = FACILITIES_CARDS.findIndex((c) => c.key === b.key);
        const orderA = configs[a.key]?.display_order ?? defaultIndexA;
        const orderB = configs[b.key]?.display_order ?? defaultIndexB;
        return orderA - orderB;
      });
      setOrderedFacilityCards(sortedCards);
    } catch (err) {
      console.warn('[GalleryAdmin] Error loading facility images & order:', err);
    } finally {
      setFacilityImagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'gallery') {
      loadFacilityImages();
    }
  }, [isAuthenticated, activeTab, loadFacilityImages]);

  // Reorder Handlers for Facilities Grid Cards
  const handleFacilityDragStart = (e: React.DragEvent, index: number) => {
    setFacilityDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleFacilityDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (facilityDragIndex === null || facilityDragIndex === index) return;
    setFacilityDragOverIndex(index);
  };

  const handleFacilityDragEnd = () => {
    setFacilityDragIndex(null);
    setFacilityDragOverIndex(null);
  };

  const handleFacilityDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (facilityDragIndex === null || facilityDragIndex === dropIndex) {
      handleFacilityDragEnd();
      return;
    }

    const prevList = [...orderedFacilityCards];
    const updated = [...orderedFacilityCards];
    const [draggedItem] = updated.splice(facilityDragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setOrderedFacilityCards(updated);
    handleFacilityDragEnd();

    setIsReorderingFacilities(true);
    setGalleryGlobalMessage(null);

    const orderedKeys = updated.map((c) => c.key);
    const result = await updateFacilityOrders(orderedKeys, currentUserEmail || 'Admin');
    setIsReorderingFacilities(false);

    if (!result.success) {
      setOrderedFacilityCards(prevList);
      setGalleryGlobalMessage({
        type: 'error',
        text: `Failed to save display order: ${result.error}. Previous order restored.`,
      });
    } else {
      setGalleryGlobalMessage({
        type: 'success',
        text: 'Facilities card display sequence updated and saved to Supabase!',
      });
    }
  };

  const handleFacilityMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedFacilityCards.length) return;

    const prevList = [...orderedFacilityCards];
    const updated = [...orderedFacilityCards];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setOrderedFacilityCards(updated);
    setIsReorderingFacilities(true);
    setGalleryGlobalMessage(null);

    const orderedKeys = updated.map((c) => c.key);
    const result = await updateFacilityOrders(orderedKeys, currentUserEmail || 'Admin');
    setIsReorderingFacilities(false);

    if (!result.success) {
      setOrderedFacilityCards(prevList);
      setGalleryGlobalMessage({
        type: 'error',
        text: `Failed to save display order: ${result.error}. Previous order restored.`,
      });
    } else {
      setGalleryGlobalMessage({
        type: 'success',
        text: 'Facilities card display sequence updated and saved to Supabase!',
      });
    }
  };

  const handleSelectFacilityImage = (cardKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous message for this card
    setFacilityMessages((prev) => ({ ...prev, [cardKey]: null }));

    // Format validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFacilityMessages((prev) => ({
        ...prev,
        [cardKey]: {
          type: 'error',
          text: 'Invalid file format. Please upload a JPG, PNG, or WebP image.',
        },
      }));
      e.target.value = '';
      return;
    }

    // Size validation: max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFacilityMessages((prev) => ({
        ...prev,
        [cardKey]: {
          type: 'error',
          text: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
        },
      }));
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setSelectedFacilityFiles((prev) => ({
        ...prev,
        [cardKey]: {
          file,
          previewUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb: Math.round(file.size / 1024),
        },
      }));
    };
    img.onerror = () => {
      setFacilityMessages((prev) => ({
        ...prev,
        [cardKey]: {
          type: 'error',
          text: 'Failed to read image file. Please try another file.',
        },
      }));
    };
    img.src = previewUrl;
  };

  const handleCancelFacilitySelect = (cardKey: string) => {
    const selected = selectedFacilityFiles[cardKey];
    if (selected?.previewUrl) {
      URL.revokeObjectURL(selected.previewUrl);
    }
    setSelectedFacilityFiles((prev) => ({ ...prev, [cardKey]: null }));
    setFacilityMessages((prev) => ({ ...prev, [cardKey]: null }));
  };

  const handleUploadFacilityImage = async (card: FacilityCardItem) => {
    const selected = selectedFacilityFiles[card.key];
    if (!selected) return;

    if (!supabase || !isSupabaseConfigured()) {
      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: { type: 'error', text: 'Supabase client is not configured.' },
      }));
      return;
    }

    setUploadingFacilityKey(card.key);
    setFacilityMessages((prev) => ({ ...prev, [card.key]: null }));

    try {
      const ext = selected.file.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const storagePath = `facility-${card.key}-${timestamp}.${ext}`;

      // 1. Upload to Supabase Storage bucket 'site-banners'
      const { error: uploadError } = await supabase.storage
        .from('site-banners')
        .upload(storagePath, selected.file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('site-banners')
        .getPublicUrl(storagePath);

      const persistentUrl = publicUrlData?.publicUrl;
      if (!persistentUrl) {
        throw new Error('Failed to resolve public image URL from storage.');
      }

      // 3. Save to database
      const saveRes = await updateFacilityImage(
        card.key,
        persistentUrl,
        card.title,
        currentUserEmail || 'Admin'
      );

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to save image record to database.');
      }

      // 4. Update local state
      setFacilityImages((prev) => ({ ...prev, [card.key]: persistentUrl }));
      setSelectedFacilityFiles((prev) => ({ ...prev, [card.key]: null }));
      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: {
          type: 'success',
          text: `Image for "${card.title}" uploaded and saved successfully!`,
        },
      }));
    } catch (err: any) {
      console.error('[GalleryAdmin] Upload error:', err);
      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: {
          type: 'error',
          text: err.message || 'Image upload failed. Please try again.',
        },
      }));
    } finally {
      setUploadingFacilityKey(null);
    }
  };

  const handleRemoveFacilityImage = async (card: FacilityCardItem) => {
    if (!window.confirm(`Are you sure you want to remove the image for "${card.title}"? This card will display an empty frame on the website.`)) {
      return;
    }

    setUploadingFacilityKey(card.key);
    setFacilityMessages((prev) => ({ ...prev, [card.key]: null }));

    try {
      const res = await removeFacilityImage(card.key, currentUserEmail || 'Admin');
      if (!res.success) {
        throw new Error(res.error || 'Failed to remove image record.');
      }

      setFacilityImages((prev) => {
        const next = { ...prev };
        delete next[card.key];
        return next;
      });
      setSelectedFacilityFiles((prev) => ({ ...prev, [card.key]: null }));
      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: {
          type: 'success',
          text: `Image removed. "${card.title}" now displays an empty frame.`,
        },
      }));
    } catch (err: any) {
      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: {
          type: 'error',
          text: err.message || 'Failed to remove image.',
        },
      }));
    } finally {
      setUploadingFacilityKey(null);
    }
  };

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const isSigningInRef = useRef<boolean>(false);

  const config = getSupabaseConfig();
  const currentCategory = BANNER_PAGE_CATEGORIES.find((c) => c.key === selectedBannerCategory) || BANNER_PAGE_CATEGORIES[0];

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
        console.info('[SchoolOffice:Auth] Checking active Supabase session...');
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

        console.info('[SchoolOffice:Auth] Active session found for email:', session.user.email);
        const authResult = await verifyStaffAuthorization(session.user.id, session.user.email);
        if (!isMounted) return;

        if (authResult.authorized) {
          console.info('[SchoolOffice:Auth] Active session verified as authorized staff.');
          setIsAuthenticated(true);
          setCurrentUserEmail(session.user.email || 'Admin Staff');
          setCurrentUserRole(authResult.role || 'admin');
        } else {
          console.warn('[SchoolOffice:Auth] Active session rejected by authorization check:', authResult.error);
          await supabase?.auth.signOut();
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setAuthError(authResult.error || 'Access Denied: Your account is authenticated, but is not authorized as an MJ School administrator.');
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

        // Skip if handleSignIn is actively processing this transition to prevent race conditions
        if (isSigningInRef.current) {
          return;
        }

        if (event === 'SIGNED_OUT' || !session?.user) {
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setIsCheckingAuth(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.info('[SchoolOffice:Auth] onAuthStateChange event received:', event);
          const authResult = await verifyStaffAuthorization(session.user.id, session.user.email);
          if (!isMounted) return;

          if (authResult.authorized) {
            setIsAuthenticated(true);
            setCurrentUserEmail(session.user.email || 'Admin Staff');
            setCurrentUserRole(authResult.role || 'admin');
            setAuthError(null);
          } else {
            console.warn('[SchoolOffice:Auth] onAuthStateChange rejected user:', authResult.error);
            await supabase?.auth.signOut();
            setIsAuthenticated(false);
            setCurrentUserEmail(null);
            setCurrentUserRole(null);
            setAuthError(authResult.error || 'Access Denied: Your account is authenticated, but is not registered in the school administrative directory.');
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

  // Fetch all banners (published & drafts) for active category when authenticated
  const loadBanners = async (categoryKey?: string) => {
    const cat = categoryKey || selectedBannerCategory;
    setBannersLoading(true);
    try {
      const data = await getAllBanners(cat);
      setBannersList(data);
    } catch (err) {
      console.error('Failed to load banner list for ' + cat + ':', err);
      setBannersList(cat === 'homepage' ? [DEFAULT_HOMEPAGE_BANNER] : []);
    } finally {
      setBannersLoading(false);
    }
  };

  const handleSelectCategory = (catKey: string) => {
    if (catKey === selectedBannerCategory) return;
    if (isEditingBanner) {
      const confirmed = window.confirm(
        'You have unsaved changes in the banner editor. Discard changes and switch category?'
      );
      if (!confirmed) return;
      handleDiscardChanges();
    }
    setSelectedBannerCategory(catKey);
    setSaveBannerMessage(null);
  };

  // Fetch all notices when authenticated
  const loadNotices = async () => {
    setNoticesLoading(true);
    try {
      const data = await getAllNotices();
      setNoticesList(data);
    } catch (err) {
      console.error('Failed to load notices list:', err);
    } finally {
      setNoticesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBanners(selectedBannerCategory);
      loadNotices();
    }
  }, [isAuthenticated, selectedBannerCategory]);

  const handleOpenCreateNotice = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    setEditingNotice(null);
    setNoticeTitle('');
    setNoticeDate(today);
    setNoticeCategory('General');
    setNoticeDescription('');
    setNoticeGrades(['All Grades']);
    setNoticeIsNew(true);
    setNoticeHasAttachment(false);
    setNoticeAttachmentUrl('');
    setNoticeFileSize('300 KB');
    setNoticeIsPublished(true);
    setNoticeDisplayOrder(noticesList.length + 1);
    setNoticeSaveMessage(null);
    setIsEditingNotice(true);
  };

  const handleOpenEditNotice = (n: NoticeRecord) => {
    setEditingNotice(n);
    setNoticeTitle(n.title);
    setNoticeDate(n.date);
    setNoticeCategory(n.category);
    setNoticeDescription(n.description || '');
    setNoticeGrades(Array.isArray(n.grades) ? n.grades : ['All Grades']);
    setNoticeIsNew(Boolean(n.is_new));
    setNoticeHasAttachment(Boolean(n.has_attachment));
    setNoticeAttachmentUrl(n.attachment_url || '');
    setNoticeFileSize(n.file_size || '');
    setNoticeIsPublished(Boolean(n.is_published));
    setNoticeDisplayOrder(n.display_order ?? 0);
    setNoticeSaveMessage(null);
    setIsEditingNotice(true);
  };

  const handleToggleGrade = (grade: string) => {
    if (grade === 'All Grades') {
      setNoticeGrades(['All Grades']);
      return;
    }
    setNoticeGrades((prev) => {
      const withoutAll = prev.filter((g) => g !== 'All Grades');
      if (withoutAll.includes(grade)) {
        const next = withoutAll.filter((g) => g !== grade);
        return next.length === 0 ? ['All Grades'] : next;
      } else {
        return [...withoutAll, grade];
      }
    });
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) {
      setNoticeSaveMessage({ type: 'error', text: 'Please enter a title for the notice.' });
      return;
    }
    if (!noticeDate.trim()) {
      setNoticeSaveMessage({ type: 'error', text: 'Please specify the date for the notice.' });
      return;
    }

    if (noticeHasAttachment && !noticeAttachmentUrl.trim()) {
      setNoticeSaveMessage({ type: 'error', text: 'Please enter a valid Attachment URL for the circular, or uncheck the attachment option.' });
      return;
    }

    const trimmedAttachmentUrl = noticeAttachmentUrl.trim();
    const hasValidAttachment = Boolean(noticeHasAttachment && trimmedAttachmentUrl);

    setIsSavingNotice(true);
    setNoticeSaveMessage(null);

    try {
      if (editingNotice) {
        const res = await updateNotice(editingNotice.id, {
          title: noticeTitle.trim(),
          date: noticeDate.trim(),
          category: noticeCategory.trim(),
          description: noticeDescription.trim(),
          grades: noticeGrades.length > 0 ? noticeGrades : ['All Grades'],
          is_new: noticeIsNew,
          has_attachment: hasValidAttachment,
          attachment_url: hasValidAttachment ? trimmedAttachmentUrl : null,
          file_size: hasValidAttachment ? (noticeFileSize.trim() || 'PDF') : null,
          is_published: noticeIsPublished,
          display_order: Number(noticeDisplayOrder) || 0,
          updated_by: currentUserEmail || 'Admin',
        });
        if (!res.success) {
          throw new Error(res.error || 'Failed to update notice');
        }
      } else {
        const res = await createNotice({
          title: noticeTitle.trim(),
          date: noticeDate.trim(),
          category: noticeCategory.trim(),
          description: noticeDescription.trim(),
          grades: noticeGrades.length > 0 ? noticeGrades : ['All Grades'],
          is_new: noticeIsNew,
          has_attachment: hasValidAttachment,
          attachment_url: hasValidAttachment ? trimmedAttachmentUrl : null,
          file_size: hasValidAttachment ? (noticeFileSize.trim() || 'PDF') : null,
          is_published: noticeIsPublished,
          display_order: Number(noticeDisplayOrder) || noticesList.length + 1,
          updated_by: currentUserEmail || 'Admin',
        });
        if (!res.success) {
          throw new Error(res.error || 'Failed to create notice');
        }
      }

      await loadNotices();
      setIsEditingNotice(false);
    } catch (err: any) {
      setNoticeSaveMessage({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setIsSavingNotice(false);
    }
  };

  const handleTogglePublishNotice = async (n: NoticeRecord) => {
    try {
      const res = await updateNotice(n.id, {
        is_published: !n.is_published,
        updated_by: currentUserEmail || 'Admin',
      });
      if (res.success) {
        await loadNotices();
      } else {
        alert(res.error || 'Failed to toggle publication status.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication status.');
    }
  };

  const handleDeleteNoticeConfirmed = async () => {
    if (!deleteConfirmNotice) return;
    setIsDeletingNotice(true);
    try {
      const res = await deleteNotice(deleteConfirmNotice.id);
      if (res.success) {
        await loadNotices();
        setDeleteConfirmNotice(null);
      } else {
        alert(res.error || 'Failed to delete notice.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete notice.');
    } finally {
      setIsDeletingNotice(false);
    }
  };

  // Handle staff sign-in with database authorization check
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isSupabaseConfigured() || !supabase) {
      setAuthError('Supabase is not configured yet. Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    setAuthLoading(true);
    isSigningInRef.current = true;

    try {
      console.info('[SchoolOffice:SignIn] Attempting sign-in for email:', authEmail.trim().toLowerCase());
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (error) {
        console.warn('[SchoolOffice:SignIn] Supabase Auth returned error:', error.message);
        setAuthError(error.message);
        setIsAuthenticated(false);
        return;
      }

      if (data.user) {
        console.info('[SchoolOffice:SignIn] Supabase Auth credentials validated. Checking admin authorization...');
        const authResult = await verifyStaffAuthorization(data.user.id, data.user.email);

        if (authResult.authorized) {
          console.info('[SchoolOffice:SignIn] Authorization successful! Granted role:', authResult.role);
          setIsAuthenticated(true);
          setCurrentUserEmail(data.user.email || 'Admin Staff');
          setCurrentUserRole(authResult.role || 'admin');
          setAuthPassword(''); // Clear password from component memory
          setAuthError(null);
        } else {
          console.warn('[SchoolOffice:SignIn] Authorization denied:', authResult.error);
          await supabase?.auth.signOut();
          setIsAuthenticated(false);
          setCurrentUserEmail(null);
          setCurrentUserRole(null);
          setAuthError(authResult.error || 'Access Denied: Your login credentials are valid, but your account is not authorized as an MJ School administrator.');
        }
      }
    } catch (err: any) {
      console.error('[SchoolOffice:SignIn] Exception during sign-in:', err?.message);
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      isSigningInRef.current = false;
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
    setIsEditingBanner(false);
    setEditingBanner(null);
  };

  const handleOpenAddBanner = () => {
    const currentCat = BANNER_PAGE_CATEGORIES.find((c) => c.key === selectedBannerCategory);
    setEditingBanner(null);
    setBannerTitle(currentCat ? `${currentCat.name} Hero Banner` : 'Campus Announcement');
    setBannerIsPublished(true);
    clearDesktopSelection();
    clearMobileSelection();
    setSaveBannerMessage(null);
    setIsEditingBanner(true);
  };

  const handleOpenEditBanner = (banner: SiteBannerRecord) => {
    setEditingBanner(banner);
    setBannerTitle(banner.title || 'Page Hero Banner');
    setBannerIsPublished(banner.is_published);
    clearDesktopSelection();
    clearMobileSelection();
    setSaveBannerMessage(null);
    setIsEditingBanner(true);
  };

  const handleTogglePublish = async (banner: SiteBannerRecord) => {
    if (!banner.id) return;

    // Safety constraint: Prevent unpublishing the last active published banner on the homepage only
    if (selectedBannerCategory === 'homepage' && banner.is_published) {
      const activeCount = bannersList.filter((b) => b.is_published).length;
      if (activeCount <= 1) {
        setSaveBannerMessage({
          type: 'error',
          text: 'Cannot unpublish the only active banner. The homepage requires at least one published banner to remain visible.',
        });
        return;
      }
    }

    if (!supabase || !isSupabaseConfigured()) {
      setSaveBannerMessage({ type: 'error', text: 'Supabase client is not configured.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('site_banners')
        .update({
          is_published: !banner.is_published,
          updated_at: new Date().toISOString(),
          updated_by: currentUserEmail || 'Staff Admin',
        })
        .eq('id', banner.id);

      if (error) throw error;

      setSaveBannerMessage({
        type: 'success',
        text: `Banner "${banner.title || 'Untitled'}" is now ${!banner.is_published ? 'Published' : 'saved as Draft'}.`,
      });
      await loadBanners(selectedBannerCategory);
    } catch (err: any) {
      setSaveBannerMessage({
        type: 'error',
        text: `Failed to update banner status: ${err.message}`,
      });
    }
  };

  const handleDeleteBanner = async (banner: SiteBannerRecord) => {
    if (!banner.id) return;

    // Safety constraint: Prevent deletion of the final published banner on homepage only
    if (selectedBannerCategory === 'homepage' && banner.is_published) {
      const activeCount = bannersList.filter((b) => b.is_published).length;
      if (activeCount <= 1) {
        setSaveBannerMessage({
          type: 'error',
          text: 'Deletion blocked: You cannot delete the only active published banner on the homepage. Please publish another banner first to ensure the homepage never becomes blank.',
        });
        setDeleteConfirmBanner(null);
        return;
      }
    }

    if (!supabase || !isSupabaseConfigured()) {
      setSaveBannerMessage({ type: 'error', text: 'Supabase client is not configured.' });
      return;
    }

    setIsDeletingBanner(true);
    try {
      const { error } = await supabase.from('site_banners').delete().eq('id', banner.id);
      if (error) throw error;

      setSaveBannerMessage({
        type: 'success',
        text: `Banner "${banner.title || 'Untitled'}" was deleted successfully.`,
      });
      setDeleteConfirmBanner(null);
      await loadBanners(selectedBannerCategory);
    } catch (err: any) {
      setSaveBannerMessage({
        type: 'error',
        text: `Failed to delete banner: ${err.message}`,
      });
    } finally {
      setIsDeletingBanner(false);
    }
  };

  // Reorder Handlers (HTML5 Drag & Drop + Keyboard accessible Move Up / Move Down)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const prevList = [...bannersList];
    const updated = [...bannersList];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    // Compute updated sequence
    const orderedForDb = updated.map((item, idx) => ({
      id: item.id!,
      display_order: idx,
    }));

    const optimisticList = updated.map((item, idx) => ({ ...item, display_order: idx }));
    setBannersList(optimisticList);
    handleDragEnd();

    setIsReordering(true);
    const result = await updateBannerOrders(orderedForDb);
    setIsReordering(false);

    if (!result.success) {
      setBannersList(prevList);
      setSaveBannerMessage({
        type: 'error',
        text: `Failed to save display order: ${result.error}. Previous order restored.`,
      });
    } else {
      setSaveBannerMessage({
        type: 'success',
        text: 'Carousel display sequence updated and saved successfully!',
      });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bannersList.length) return;

    const prevList = [...bannersList];
    const updated = [...bannersList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const orderedForDb = updated.map((item, idx) => ({
      id: item.id!,
      display_order: idx,
    }));

    const optimisticList = updated.map((item, idx) => ({ ...item, display_order: idx }));
    setBannersList(optimisticList);

    setIsReordering(true);
    const result = await updateBannerOrders(orderedForDb);
    setIsReordering(false);

    if (!result.success) {
      setBannersList(prevList);
      setSaveBannerMessage({
        type: 'error',
        text: `Failed to save display order: ${result.error}. Previous order restored.`,
      });
    } else {
      setSaveBannerMessage({
        type: 'success',
        text: 'Carousel display sequence updated successfully.',
      });
    }
  };

  // Save banner changes (Storage Upload + DB Update / Insert)
  const handleSaveBanner = async () => {
    const isNew = !editingBanner;

    if (isNew && (!desktopFile || !mobileFile)) {
      setSaveBannerMessage({
        type: 'error',
        text: 'Both desktop (1920 × 640) and mobile (535 × 378) images are required when creating a new banner.',
      });
      return;
    }

    if (!isNew && !desktopFile && !mobileFile && bannerTitle === editingBanner.title && bannerIsPublished === editingBanner.is_published) {
      setSaveBannerMessage({ type: 'error', text: 'No changes detected to save.' });
      return;
    }

    const currentCat = BANNER_PAGE_CATEGORIES.find((c) => c.key === selectedBannerCategory);
    const catRoute = currentCat?.route || '/';
    const titleToSave = bannerTitle.trim() || (isNew ? `${currentCat?.name || 'Page'} Hero Banner` : editingBanner?.title || 'Page Banner');

    setIsSavingBanner(true);
    setSaveBannerMessage(null);

    if (!isSupabaseConfigured() || !supabase) {
      setSaveBannerMessage({
        type: 'error',
        text: 'Supabase connection is required to upload assets and update banner records.',
      });
      setIsSavingBanner(false);
      return;
    }

    try {
      let newDesktopUrl = editingBanner?.desktop_image_path || DEFAULT_HOMEPAGE_BANNER.desktop_image_path;
      let newMobileUrl = editingBanner?.mobile_image_path || DEFAULT_HOMEPAGE_BANNER.mobile_image_path;
      const timestamp = Date.now();

      // 1. Upload Desktop Banner if selected
      if (desktopFile) {
        const ext = desktopFile.file.name.split('.').pop() || 'png';
        const desktopPath = `${selectedBannerCategory}-desktop-${timestamp}.${ext}`;
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
        const mobilePath = `${selectedBannerCategory}-mobile-${timestamp}.${ext}`;
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

      // 3. Insert new banner or update existing record
      if (isNew) {
        const newDisplayOrder = bannersList.length;
        const { error: insertError } = await supabase
          .from('site_banners')
          .insert({
            page_key: selectedBannerCategory,
            page_path: catRoute,
            title: titleToSave,
            desktop_image_path: newDesktopUrl,
            mobile_image_path: newMobileUrl,
            is_published: bannerIsPublished,
            display_order: newDisplayOrder,
            updated_at: new Date().toISOString(),
            updated_by: currentUserEmail || 'Staff Admin',
          });

        if (insertError) throw insertError;

        setSaveBannerMessage({
          type: 'success',
          text: `Banner "${titleToSave}" created and saved successfully!`,
        });
      } else {
        const hasValidUuid = Boolean(editingBanner?.id && editingBanner.id !== 'default-homepage-banner' && editingBanner.id.length > 20);
        if (hasValidUuid) {
          const { error: updateError } = await supabase
            .from('site_banners')
            .update({
              title: titleToSave,
              desktop_image_path: newDesktopUrl,
              mobile_image_path: newMobileUrl,
              is_published: bannerIsPublished,
              updated_at: new Date().toISOString(),
              updated_by: currentUserEmail || 'Staff Admin',
            })
            .eq('id', editingBanner.id);

          if (updateError) throw updateError;
        } else {
          // If editing a fallback placeholder without an existing DB record, insert it now
          const { error: insertError } = await supabase
            .from('site_banners')
            .insert({
              page_key: selectedBannerCategory,
              page_path: catRoute,
              title: titleToSave,
              desktop_image_path: newDesktopUrl,
              mobile_image_path: newMobileUrl,
              is_published: bannerIsPublished,
              display_order: 0,
              updated_at: new Date().toISOString(),
              updated_by: currentUserEmail || 'Staff Admin',
            });

          if (insertError) throw insertError;
        }

        setSaveBannerMessage({
          type: 'success',
          text: `Banner "${titleToSave}" updated successfully!`,
        });
      }

      clearDesktopSelection();
      clearMobileSelection();
      setIsEditingBanner(false);
      setEditingBanner(null);
      await loadBanners(selectedBannerCategory);
    } catch (err: any) {
      console.error('[SchoolOfficeAdmin] Banner save failed:', err);
      setSaveBannerMessage({
        type: 'error',
        text: err?.message || 'Failed to save banner changes. Please check database permissions.',
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
                placeholder="staff@mjschool.in"
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
                setIsEditingBanner(false);
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

            <button
              type="button"
              onClick={() => {
                setActiveTab('notices');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
                activeTab === 'notices'
                  ? 'bg-[#C59B27] text-[#0B2545] shadow-sm font-black'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>4. Notices &amp; Events</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('gallery');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors text-left cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#C59B27] text-[#0B2545] shadow-sm font-black'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>5. Gallery</span>
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
        {/* 1. BANNERS SECTION (Multi-Banner Carousel Management)                */}
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
                  Manage desktop and mobile hero banners across 7 school website page categories.
                </p>
              </div>

              {!isEditingBanner && (
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => loadBanners(selectedBannerCategory)}
                    disabled={bannersLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Refresh banners from Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${bannersLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddBanner}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-4 py-2 bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Banner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Page Category Selector (Above configured banners list) */}
            <div className="bg-white border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C59B27]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                    Page Category Selector
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Select a category to view and manage its assigned banners
                </span>
              </div>

              {/* 7 Page Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {BANNER_PAGE_CATEGORIES.map((cat, idx) => {
                  const isSelected = selectedBannerCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleSelectCategory(cat.key)}
                      className={`text-left p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#0B2545] border-[#C59B27] text-white shadow-sm ring-1 ring-[#C59B27]'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[9.5px] font-mono px-1.5 py-0.5 font-bold uppercase rounded-xs ${
                              isSelected ? 'bg-[#C59B27] text-[#0B2545]' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            Page #{idx + 1}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Category" />
                          )}
                        </div>
                        <div className={`font-bold text-xs font-serif leading-tight ${
                          isSelected ? 'text-[#F6D55C]' : 'text-[#0B2545]'
                        }`}>
                          {cat.name}
                        </div>
                      </div>
                      <div className={`text-[10px] font-mono truncate mt-2 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {cat.route}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Category Route Banner Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">Active Page:</span>
                  <span className="font-bold text-[#0B2545]">{currentCategory.name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">Route:</span>
                  <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">
                    {currentCategory.route}
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 hidden md:inline">
                    Desktop: 1920 × 640 (3:1) • Mobile: 535 × 378
                  </span>
                  <a
                    href={currentCategory.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0B2545] hover:text-[#C59B27] font-semibold underline cursor-pointer"
                  >
                    <span>View Live Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
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
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* VIEW A: Multi-Banner Listing & Reordering */}
            {!isEditingBanner && (
              <div className="space-y-4">
                {bannersList.length === 0 ? (
                  /* Empty State when no banners are configured for this category */
                  <div className="bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C59B27]">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h3 className="font-serif font-bold text-lg text-[#0B2545]">
                        No Banners Configured for {currentCategory.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        This page currently displays the clean fallback institutional heading banner.
                        Upload a 1920 × 640 desktop banner and 535 × 378 mobile banner to display a custom hero image.
                      </p>
                      <div className="pt-2">
                        <span className="inline-block bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-mono text-slate-600">
                          Route: {currentCategory.route}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleOpenAddBanner}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider px-5 py-2.5 bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] transition-colors shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Banner for {currentCategory.name}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats & Drag Instruction Bar */}
                    <div className="p-4 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B2545] uppercase tracking-wider">
                          Configured Banners ({bannersList.length})
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-700 font-semibold">
                          {bannersList.filter((b) => b.is_published).length} Published
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-amber-700 font-semibold">
                          {bannersList.filter((b) => !b.is_published).length} Draft
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11.5px]">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                        <span>Drag handle (:::) to reorder, or use Move Up / Down buttons. Updates live page automatically.</span>
                      </div>
                    </div>

                    {/* Banner Cards List */}
                    <div className="space-y-3">
                      {bannersList.map((banner, index) => {
                        const isDragged = draggedIndex === index;
                        const isDragOver = dragOverIndex === index;

                        return (
                          <div
                            key={banner.id || `banner-${index}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`bg-white border p-4 sm:p-5 transition-all duration-150 ${
                              isDragOver
                                ? 'border-[#C59B27] ring-2 ring-[#C59B27]/40 bg-amber-50/20'
                                : isDragged
                                ? 'opacity-40 border-dashed border-[#0B2545]'
                                : 'border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Left: Reorder 2x3 Handle + Position + Title Info */}
                              <div className="flex items-start sm:items-center gap-3 min-w-[280px]">
                                {/* 2x3 Drag Handle (6 dots) */}
                                <div
                                  className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-[#0B2545] hover:bg-slate-100 rounded transition-colors touch-none select-none"
                                  title="Drag 6-dot handle to reorder banner sequence"
                                  aria-label="Drag handle to reorder"
                                >
                                  <GripVertical className="w-5 h-5 text-slate-500" />
                                </div>

                                {/* Position Badge */}
                                <span className="px-2 py-0.5 bg-slate-100 text-[#0B2545] font-black text-xs border border-slate-200 rounded shrink-0">
                                  #{index + 1}
                                </span>

                                {/* Title & Route & Status */}
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold font-serif text-[#0B2545]">
                                      {banner.title || `${currentCategory.name} Banner`}
                                    </h3>
                                    {banner.is_published ? (
                                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                                        <Eye className="w-3 h-3" /> Published
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                                        <EyeOff className="w-3 h-3" /> Draft
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="font-mono">Route: {banner.page_path || currentCategory.route}</span>
                                    <span>•</span>
                                    <span>Updated: {formatDate(banner.updated_at)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Middle: Desktop and Mobile Previews */}
                              <div className="flex items-center gap-3 shrink-0">
                                {/* Desktop preview thumbnail */}
                                <div className="space-y-1">
                                  <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                                    Desktop (1920×640)
                                  </span>
                                  <div className="w-36 sm:w-44 aspect-[1920/640] bg-slate-900 border border-slate-200 overflow-hidden">
                                    <img
                                      src={banner.desktop_image_path}
                                      alt="Desktop preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>

                                {/* Mobile preview thumbnail */}
                                <div className="space-y-1">
                                  <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                                    Mobile (535×378)
                                  </span>
                                  <div className="w-14 sm:w-16 aspect-[535/378] bg-slate-900 border border-slate-200 overflow-hidden">
                                    <img
                                      src={banner.mobile_image_path}
                                      alt="Mobile preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions (Move, Toggle, Edit, Delete) */}
                              <div className="flex items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-wrap">
                                {/* Move Up */}
                                <button
                                  type="button"
                                  onClick={() => handleMoveOrder(index, 'up')}
                                  disabled={index === 0 || isReordering}
                                  className="p-1.5 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer"
                                  title="Move banner earlier in sequence"
                                  aria-label="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>

                                {/* Move Down */}
                                <button
                                  type="button"
                                  onClick={() => handleMoveOrder(index, 'down')}
                                  disabled={index === bannersList.length - 1 || isReordering}
                                  className="p-1.5 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer"
                                  title="Move banner later in sequence"
                                  aria-label="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Toggle Publish / Draft */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(banner)}
                                  className={`px-2.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                    banner.is_published
                                      ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                      : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                  }`}
                                  title={banner.is_published ? 'Unpublish to Draft' : 'Publish to Live Page'}
                                >
                                  {banner.is_published ? (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      <span>Unpublish</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      <span>Publish</span>
                                    </>
                                  )}
                                </button>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditBanner(banner)}
                                  className="px-3 py-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmBanner(banner)}
                                  className="p-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                  title="Delete banner"
                                  aria-label="Delete banner"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* VIEW B: Add / Edit Banner Form */}
            {isEditingBanner && (
              <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
                {/* Header with Back button and Status */}
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
                      {editingBanner ? `Editing: ${editingBanner.title || 'Banner'}` : `Adding New ${currentCategory.name} Banner`}
                    </span>
                  </div>
                </div>

                {/* Banner Details: Title and Publication status */}
                <div className="p-6 border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#0B2545]">
                    Banner Configuration &amp; Metadata
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Banner Title / Internal Label *
                      </label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="e.g., Admissions Open 2026-27 / Annual Day Celebration"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Displayed in the carousel slide accessibility tags and admin portal.
                      </span>
                    </div>

                    {/* Publication Status Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Publication State
                      </label>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="publication-state"
                            checked={bannerIsPublished}
                            onChange={() => setBannerIsPublished(true)}
                            className="text-[#C59B27] focus:ring-[#C59B27]"
                          />
                          <span>Publish Immediately (Visible in carousel)</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="publication-state"
                            checked={!bannerIsPublished}
                            onChange={() => setBannerIsPublished(false)}
                            className="text-[#C59B27] focus:ring-[#C59B27]"
                          />
                          <span>Save as Draft (Private)</span>
                        </label>
                      </div>
                    </div>
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
                        Recommended dimensions: <strong>1920 × 640 px</strong> (3.0:1 aspect ratio). Supported: WebP, JPEG, PNG.
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
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 cursor-pointer"
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
                        {desktopFile ? 'Selected Desktop Image Preview:' : 'Current Desktop Image:'}
                      </span>
                      {desktopFile && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {desktopFile.file.name} ({desktopFile.sizeKb} KB)
                        </span>
                      )}
                    </div>

                    <div className="w-full aspect-[1920/640] bg-slate-900 border-2 border-slate-300 overflow-hidden relative">
                      <img
                        src={desktopFile ? desktopFile.previewUrl : editingBanner ? editingBanner.desktop_image_path : DEFAULT_HOMEPAGE_BANNER.desktop_image_path}
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
                                Recommended is 1920 × 640 px. The image will be rendered using <code>object-cover</code> to prevent distortion.
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
                        Recommended dimensions: <strong>535 × 378 px</strong> (1.42:1 aspect ratio). Supported: WebP, JPEG, PNG.
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
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 cursor-pointer"
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
                        {mobileFile ? 'Selected Mobile Image Preview:' : 'Current Mobile Image:'}
                      </span>
                      {mobileFile && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {mobileFile.file.name} ({mobileFile.sizeKb} KB)
                        </span>
                      )}
                    </div>

                    <div className="max-w-md w-full aspect-[535/378] bg-slate-900 border-2 border-slate-300 overflow-hidden relative">
                      <img
                        src={mobileFile ? mobileFile.previewUrl : editingBanner ? editingBanner.mobile_image_path : DEFAULT_HOMEPAGE_BANNER.mobile_image_path}
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
                                Recommended is 535 × 378 px.
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
                        Pending uploads ready: {desktopFile ? 'Desktop image selected. ' : ''}
                        {mobileFile ? 'Mobile image selected.' : ''}
                      </span>
                    ) : (
                      <span>No new replacement image files selected.</span>
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
                      disabled={isSavingBanner}
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
                          <span>Save Banner</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmBanner && (
              <div className="fixed inset-0 z-50 bg-[#0B2545]/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-300 max-w-md w-full p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h3 className="font-serif font-bold text-lg text-[#0B2545]">
                      Confirm Banner Deletion
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Are you sure you want to permanently delete the banner{' '}
                    <strong>"{deleteConfirmBanner.title || 'Untitled Banner'}"</strong>?
                    This will remove it from the {currentCategory.name} banner sequence and cannot be undone.
                  </p>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmBanner(null)}
                      disabled={isDeletingBanner}
                      className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(deleteConfirmBanner)}
                      disabled={isDeletingBanner}
                      className="px-5 py-2 text-xs font-black text-white bg-rose-700 hover:bg-rose-800 uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isDeletingBanner ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm Delete</span>
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

        {/* 4. NOTICES & EVENTS MANAGEMENT TAB */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            {/* Tab Header with Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B2545]">
                  School Notices &amp; Events Management
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Single source of truth for circulars and announcements synchronized across the homepage and <a href="/notices/" target="_blank" rel="noreferrer" className="text-[#C59B27] font-semibold hover:underline">/notices/</a>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadNotices}
                  disabled={noticesLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-[#0B2545] text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                  title="Refresh Notices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${noticesLoading ? 'animate-spin text-[#C59B27]' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateNotice}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#C59B27]" />
                  <span>Create Notice</span>
                </button>
              </div>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={noticeSearchQuery}
                  onChange={(e) => setNoticeSearchQuery(e.target.value)}
                  placeholder="Search notices by title, category, or description..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={noticeCategoryFilter}
                  onChange={(e) => setNoticeCategoryFilter(e.target.value)}
                  className="border border-slate-300 text-xs px-3 py-2 bg-white text-slate-700 w-full sm:w-auto outline-none focus:border-[#0B2545]"
                >
                  <option value="All">All Categories</option>
                  <option value="Admissions">Admissions</option>
                  <option value="Events">Events</option>
                  <option value="Exams">Exams</option>
                  <option value="Circular">Circular</option>
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Notices Table */}
            <div className="bg-white border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B2545] text-white uppercase text-[10.5px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Date &amp; Cat</th>
                      <th className="py-3.5 px-4">Title &amp; Grades</th>
                      <th className="py-3.5 px-4 text-center">Attachment</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {noticesLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C59B27] mb-2" />
                          <p className="text-xs">Loading notices from database...</p>
                        </td>
                      </tr>
                    ) : noticesList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-sm text-[#0B2545]">No notices recorded yet.</p>
                          <p className="text-xs text-slate-500 mt-1">Click "Create Notice" above to publish your first school circular.</p>
                        </td>
                      </tr>
                    ) : (
                      noticesList
                        .filter((n) => {
                          const matchesSearch =
                            !noticeSearchQuery.trim() ||
                            n.title.toLowerCase().includes(noticeSearchQuery.toLowerCase()) ||
                            n.description?.toLowerCase().includes(noticeSearchQuery.toLowerCase()) ||
                            n.category.toLowerCase().includes(noticeSearchQuery.toLowerCase());
                          const matchesCat =
                            noticeCategoryFilter === 'All' ||
                            n.category.toLowerCase() === noticeCategoryFilter.toLowerCase();
                          return matchesSearch && matchesCat;
                        })
                        .map((n, idx) => (
                          <tr key={n.id || idx} className="hover:bg-amber-50/20 transition-colors">
                            <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                              {n.display_order ?? idx + 1}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="block font-semibold text-slate-900 text-xs">{n.date}</span>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-slate-100 text-[#0B2545]">
                                {n.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {n.title}
                                </span>
                                {n.is_new && (
                                  <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                    New
                                  </span>
                                )}
                              </div>
                              {n.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {n.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {(Array.isArray(n.grades) ? n.grades : ['All Grades']).map((g) => (
                                  <span key={g} className="text-[9.5px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {n.has_attachment && n.attachment_url ? (
                                <a
                                  href={n.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
                                  title={`Open attachment: ${n.attachment_url}`}
                                >
                                  <FileText className="w-3 h-3 text-blue-600" />
                                  <span>{n.file_size || 'PDF'}</span>
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                                  n.is_published
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {n.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublishNotice(n)}
                                  className="p-1.5 text-slate-500 hover:text-[#0B2545] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title={n.is_published ? 'Switch to Draft (Unpublish)' : 'Publish Notice'}
                                  aria-label={n.is_published ? 'Unpublish notice' : 'Publish notice'}
                                >
                                  {n.is_published ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditNotice(n)}
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                  title="Edit Notice"
                                  aria-label="Edit notice"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmNotice(n)}
                                  className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Delete Notice"
                                  aria-label="Delete notice"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create / Edit Notice Modal */}
            {isEditingNotice && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
                onClick={() => !isSavingNotice && setIsEditingNotice(false)}
              >
                <div
                  className="bg-white border border-slate-300 shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative my-8 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-[#C59B27]" />
                      <h3 className="font-serif font-bold text-lg text-[#0B2545]">
                        {editingNotice ? 'Edit Notice & Announcement' : 'Create & Publish Notice'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => !isSavingNotice && setIsEditingNotice(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {noticeSaveMessage && (
                    <div
                      className={`p-3 text-xs mb-4 flex items-center gap-2 ${
                        noticeSaveMessage.type === 'error'
                          ? 'bg-rose-50 border border-rose-200 text-rose-800'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{noticeSaveMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Notice Title <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="e.g., Datesheet for Term Examinations 2026"
                        className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Notice Date <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={noticeDate}
                          onChange={(e) => setNoticeDate(e.target.value)}
                          placeholder="e.g., Oct 18, 2026"
                          className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Category <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={noticeCategory}
                          onChange={(e) => setNoticeCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545] bg-white"
                        >
                          <option value="Admissions">Admissions</option>
                          <option value="Events">Events</option>
                          <option value="Exams">Exams</option>
                          <option value="Circular">Circular</option>
                          <option value="Academic">Academic</option>
                          <option value="Sports">Sports</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Description / Content Details
                      </label>
                      <textarea
                        rows={3}
                        value={noticeDescription}
                        onChange={(e) => setNoticeDescription(e.target.value)}
                        placeholder="Detailed instructions or summary shown in notice expanded view..."
                        className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 outline-none focus:border-[#0B2545]"
                      />
                    </div>

                    {/* Grade Applicability Pills */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Target Grades Applicability
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'All Grades',
                          'Jr. KG',
                          'Sr. KG',
                          'Grade 1',
                          'Grade 2',
                          'Grade 3',
                          'Grade 4',
                          'Grade 5',
                          'Grade 6',
                          'Grade 7',
                          'Grade 8',
                          'Grade 9',
                          'Grade 10',
                          'Grade 11',
                          'Grade 12',
                        ].map((g) => {
                          const isSelected = noticeGrades.includes(g);
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleToggleGrade(g)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0B2545] text-white border-[#0B2545]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Attachment Options */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noticeHasAttachment}
                          onChange={(e) => setNoticeHasAttachment(e.target.checked)}
                          className="w-4 h-4 text-[#0B2545] rounded"
                        />
                        <span className="font-bold text-slate-700 text-xs">Includes Official Circular Attachment (PDF)</span>
                      </label>

                      {noticeHasAttachment && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              File Size Label
                            </label>
                            <input
                              type="text"
                              value={noticeFileSize}
                              onChange={(e) => setNoticeFileSize(e.target.value)}
                              placeholder="e.g., 340 KB"
                              className="w-full px-2.5 py-1.5 border border-slate-300 text-xs text-slate-800 bg-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Attachment URL (Optional Link)
                            </label>
                            <input
                              type="text"
                              value={noticeAttachmentUrl}
                              onChange={(e) => setNoticeAttachmentUrl(e.target.value)}
                              placeholder="https://... or /documents/..."
                              className="w-full px-2.5 py-1.5 border border-slate-300 text-xs text-slate-800 bg-white outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Publish & Ordering Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={noticeIsNew}
                            onChange={(e) => setNoticeIsNew(e.target.checked)}
                            className="w-4 h-4 text-[#0B2545] rounded"
                          />
                          <span className="font-semibold text-slate-700 text-xs">Mark as "New" (shows green badge)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={noticeIsPublished}
                            onChange={(e) => setNoticeIsPublished(e.target.checked)}
                            className="w-4 h-4 text-[#0B2545] rounded"
                          />
                          <span className="font-bold text-slate-800 text-xs">
                            {noticeIsPublished ? 'Publish immediately (Visible to public)' : 'Save as Draft (Admin only)'}
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Display Priority / Order
                        </label>
                        <input
                          type="number"
                          value={noticeDisplayOrder}
                          onChange={(e) => setNoticeDisplayOrder(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-1.5 border border-slate-300 text-xs text-slate-800 outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Lower numbers appear first.</span>
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => !isSavingNotice && setIsEditingNotice(false)}
                        disabled={isSavingNotice}
                        className="px-4 py-2 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingNotice}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        {isSavingNotice ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 text-[#C59B27]" />
                            <span>{editingNotice ? 'Update Notice' : 'Publish Notice'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmNotice && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
                onClick={() => !isDeletingNotice && setDeleteConfirmNotice(null)}
              >
                <div
                  className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 text-rose-600 mb-3">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <h3 className="font-serif font-bold text-base text-[#0B2545]">
                      Confirm Notice Deletion
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Are you sure you want to permanently delete the notice:
                    <strong className="block text-slate-900 mt-1 font-semibold">"{deleteConfirmNotice.title}"</strong>
                    This notice will be removed from both the homepage notice board and the <span className="font-semibold text-[#0B2545]">/notices/</span> archive.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={isDeletingNotice}
                      onClick={() => setDeleteConfirmNotice(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingNotice}
                      onClick={handleDeleteNoticeConfirmed}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      {isDeletingNotice ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 5. Facilities Gallery Management Section */}
        {activeTab === 'gallery' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#C59B27] inline-block" />
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-[#0B2545]">
                    Facilities Gallery &amp; Card Images
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Manage photography and custom display sequence for the four primary facility cards on{' '}
                  <span className="font-semibold text-[#0B2545]">/facilities/</span>.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={loadFacilityImages}
                  disabled={facilityImagesLoading || isReorderingFacilities}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Reload images & order from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${facilityImagesLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <a
                  href="/facilities/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C59B27]" />
                </a>
              </div>
            </div>

            {/* Reorder instructions & status bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 px-4 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <GripVertical className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>
                  <strong>Sequence Control:</strong> Drag the 6-dot handle (:::) on any card or use the Move Up / Down buttons to reorder the 2×2 grid. Changes sync live to <code className="text-[#0B2545] bg-slate-100 px-1 py-0.5 font-bold">/facilities/</code>.
                </span>
              </div>
              {isReorderingFacilities && (
                <div className="flex items-center gap-1.5 text-[#0B2545] font-bold shrink-0">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                  <span>Saving sequence...</span>
                </div>
              )}
            </div>

            {/* Global success / error message */}
            {galleryGlobalMessage && (
              <div
                className={`p-3 text-xs rounded border flex items-start gap-2 ${
                  galleryGlobalMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {galleryGlobalMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="flex-1 font-semibold">{galleryGlobalMessage.text}</span>
              </div>
            )}

            {/* 2x2 Grid of the 4 Facility Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orderedFacilityCards.map((card, idx) => {
                const currentSavedUrl = facilityImages[card.key];
                const selectedFile = selectedFacilityFiles[card.key];
                const isUploading = uploadingFacilityKey === card.key;
                const message = facilityMessages[card.key];
                const fileInputId = `facility-input-${card.key}`;
                const isDragged = facilityDragIndex === idx;
                const isDragOver = facilityDragOverIndex === idx;

                return (
                  <div
                    key={card.key}
                    draggable
                    onDragStart={(e) => handleFacilityDragStart(e, idx)}
                    onDragOver={(e) => handleFacilityDragOver(e, idx)}
                    onDragEnd={handleFacilityDragEnd}
                    onDrop={(e) => handleFacilityDrop(e, idx)}
                    className={`bg-white border shadow-sm flex flex-col justify-between transition-all duration-150 ${
                      isDragOver
                        ? 'border-[#C59B27] ring-2 ring-[#C59B27]/40 bg-amber-50/20'
                        : isDragged
                        ? 'opacity-40 border-dashed border-[#0B2545]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Card Top Header with 6-dot drag handle, Position, Move Buttons & Status */}
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                      <div className="flex items-center gap-2.5">
                        {/* 2x3 Drag Handle (6 dots) */}
                        <div
                          className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-[#0B2545] hover:bg-slate-200/70 rounded transition-colors touch-none select-none"
                          title="Drag 6-dot handle to reorder card sequence"
                          aria-label="Drag handle to reorder"
                        >
                          <GripVertical className="w-5 h-5 text-slate-500" />
                        </div>

                        {/* Position Badge */}
                        <span className="px-2 py-0.5 bg-[#0B2545] text-white font-black text-xs uppercase tracking-wider rounded">
                          #{idx + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm font-serif">
                              {card.title}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded">
                              ID: {card.key}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Move Up / Down Buttons & Published Badge */}
                      <div className="flex items-center gap-2">
                        {/* Move Up Button */}
                        <button
                          type="button"
                          onClick={() => handleFacilityMoveOrder(idx, 'up')}
                          disabled={idx === 0 || isReorderingFacilities}
                          className="p-1.5 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer rounded-xs"
                          title="Move card earlier in sequence"
                          aria-label={`Move ${card.title} up`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down Button */}
                        <button
                          type="button"
                          onClick={() => handleFacilityMoveOrder(idx, 'down')}
                          disabled={idx === orderedFacilityCards.length - 1 || isReorderingFacilities}
                          className="p-1.5 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer rounded-xs"
                          title="Move card later in sequence"
                          aria-label={`Move ${card.title} down`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {currentSavedUrl ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Image Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Empty Frame</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Image Preview Frame (16:9 Aspect Ratio) */}
                    <div className="relative aspect-[16/9] bg-slate-100 border-b border-slate-200 overflow-hidden flex items-center justify-center">
                      {selectedFile ? (
                        <>
                          <img
                            src={selectedFile.previewUrl}
                            alt={`Preview for ${card.title}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Pending Save: {selectedFile.width}×{selectedFile.height} ({selectedFile.sizeKb} KB)
                          </div>
                        </>
                      ) : currentSavedUrl ? (
                        <>
                          <img
                            src={currentSavedUrl}
                            alt={card.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 text-[9.5px] font-bold px-2 py-0.5 rounded shadow">
                            Active Image
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 text-slate-400">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                          <p className="text-xs font-semibold text-slate-500">No image uploaded</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            This card currently displays an empty placeholder frame on the public page.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Content Summary */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {card.desc}
                        </p>
                        <div className="pt-2 flex flex-wrap gap-1.5 mt-2">
                          {card.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[9.5px] font-bold text-[#0B2545] bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Notification */}
                      {message && (
                        <div
                          className={`p-2.5 text-xs rounded border flex items-start gap-2 ${
                            message.type === 'success'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          {message.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <span className="flex-1 font-medium">{message.text}</span>
                        </div>
                      )}

                      {/* Actions Area */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {/* Hidden File Input */}
                        <input
                          id={fileInputId}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => handleSelectFacilityImage(card.key, e)}
                        />

                        {selectedFile ? (
                          // File Selected: Save & Publish or Cancel
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              disabled={isUploading}
                              onClick={() => handleUploadFacilityImage(card)}
                              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              {isUploading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-3.5 h-3.5 text-[#C59B27]" />
                                  <span>Save &amp; Publish Image</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isUploading}
                              onClick={() => handleCancelFacilitySelect(card.key)}
                              className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          // Normal state: Upload / Change Image & Remove Image
                          <div className="flex items-center justify-between w-full">
                            <label
                              htmlFor={fileInputId}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-[#C59B27] hover:text-[#0B2545] text-[#0B2545] text-xs font-bold rounded transition-colors cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{currentSavedUrl ? 'Change Image' : 'Upload Image'}</span>
                            </label>

                            {currentSavedUrl && (
                              <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => handleRemoveFacilityImage(card)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove image and reset to empty frame"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Image</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note & Guidelines footer */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0B2545] shrink-0" />
                <span>
                  <strong>Tip:</strong> Card order is reflected directly in the 2×2 grid on the public page. Upload horizontal photography in 16:9 ratio (e.g. 1280×720 or 1920×1080). JPG, PNG, and WebP up to 5 MB are supported.
                </span>
              </div>
              <a
                href="/facilities/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-bold text-[#0B2545] hover:text-[#C59B27] underline"
              >
                Inspect /facilities/ &rarr;
              </a>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
