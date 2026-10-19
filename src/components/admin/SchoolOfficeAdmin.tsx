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
  getGalleryItemsBySection,
  saveGalleryItem,
  updateGalleryOrders,
  deleteGalleryItem,
  ManagedGalleryItem,
  getAllGalleryCardImages,
  getGalleryCardImages,
  fetchGalleryCardImages,
  addImagesToGallerySet,
  updateGallerySetImageOrder,
  replaceGallerySetImage,
  deleteGallerySetImage,
  GalleryCardImageItem,
} from '../../lib/supabase';
import { FACILITIES_CARDS, FacilityCardItem } from '../../data/schoolData';
import {
  Image as ImageIcon,
  Images,
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AdminErrorBoundary] Intercepted runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 shadow-xl text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#0B2545] mb-2">
              School Office Portal Notice
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              A temporary display error was intercepted to prevent a blank white screen. You can reload the portal below.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 font-mono text-left overflow-x-auto mb-5">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Reload School Office Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
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

  // Multi-Section Gallery Management State ('facilities' | 'infrastructure' | 'gallery')
  const [gallerySubTab, setGallerySubTab] = useState<'facilities' | 'infrastructure' | 'gallery'>('facilities');

  // Facilities Gallery management & reordering state
  const [orderedFacilityCards, setOrderedFacilityCards] = useState<FacilityCardItem[]>(FACILITIES_CARDS);
  const [facilityImages, setFacilityImages] = useState<Record<string, string>>({});
  const [facilityTitles, setFacilityTitles] = useState<Record<string, string>>({});
  const [facilityShowTitles, setFacilityShowTitles] = useState<Record<string, boolean>>({});
  const [facilityImagesLoading, setFacilityImagesLoading] = useState<boolean>(false);
  const [facilityDragIndex, setFacilityDragIndex] = useState<number | null>(null);
  const [facilityDragOverIndex, setFacilityDragOverIndex] = useState<number | null>(null);
  const [isReorderingFacilities, setIsReorderingFacilities] = useState<boolean>(false);
  const [galleryGlobalMessage, setGalleryGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFacilityFiles, setSelectedFacilityFiles] = useState<Record<string, SelectedImageState | null>>({});
  const [uploadingFacilityKey, setUploadingFacilityKey] = useState<string | null>(null);
  const [facilityMessages, setFacilityMessages] = useState<Record<string, { type: 'success' | 'error'; text: string } | null>>({});

  // Campus Infrastructure image management state
  const [infraItem, setInfraItem] = useState<ManagedGalleryItem | null>(null);
  const [infraTitle, setInfraTitle] = useState<string>('CAMPUS INFRASTRUCTURE');
  const [infraShowTitle, setInfraShowTitle] = useState<boolean>(true);
  const [infraSelectedFile, setInfraSelectedFile] = useState<SelectedImageState | null>(null);
  const [infraUploading, setInfraUploading] = useState<boolean>(false);
  const [infraLoading, setInfraLoading] = useState<boolean>(false);
  const [infraMessage, setInfraMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Public Gallery Page (/gallery/) management & reordering state
  const [galleryPageItems, setGalleryPageItems] = useState<ManagedGalleryItem[]>([]);
  const [galleryPageLoading, setGalleryPageLoading] = useState<boolean>(false);
  const [galleryTitles, setGalleryTitles] = useState<Record<string, string>>({});
  const [galleryShowTitles, setGalleryShowTitles] = useState<Record<string, boolean>>({});
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<Record<string, SelectedImageState | null>>({});
  const [uploadingGalleryKey, setUploadingGalleryKey] = useState<string | null>(null);
  const [galleryItemMessages, setGalleryItemMessages] = useState<Record<string, { type: 'success' | 'error'; text: string } | null>>({});
  const [isReorderingGallery, setIsReorderingGallery] = useState<boolean>(false);
  const [galleryDragIndex, setGalleryDragIndex] = useState<number | null>(null);
  const [galleryDragOverIndex, setGalleryDragOverIndex] = useState<number | null>(null);

  // Gallery Card Image Sets state
  const [galleryCardSets, setGalleryCardSets] = useState<Record<string, GalleryCardImageItem[]>>({});
  const [managingSetCard, setManagingSetCard] = useState<ManagedGalleryItem | null>(null);
  const [setImagesList, setSetImagesList] = useState<GalleryCardImageItem[]>([]);
  const [setModalUploading, setSetModalUploading] = useState<boolean>(false);
  const [setUploadProgress, setSetUploadProgress] = useState<string | null>(null);
  const [setModalMessage, setSetModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmImageId, setDeleteConfirmImageId] = useState<string | null>(null);
  const [setImagesLoading, setSetImagesLoading] = useState<boolean>(false);
  const [setImagesFetchError, setSetImagesFetchError] = useState<string | null>(null);


  const loadFacilityImages = useCallback(async () => {
    setFacilityImagesLoading(true);
    try {
      const configs = await getFacilityCardConfigs();

      // Update image mapping, titles and showTitles
      const imgMap: Record<string, string> = {};
      const titlesMap: Record<string, string> = {};
      const showTitlesMap: Record<string, boolean> = {};

      for (const card of FACILITIES_CARDS) {
        const conf = configs[card.key];
        if (conf?.image_url) {
          imgMap[card.key] = conf.image_url;
        }
        titlesMap[card.key] = conf?.title || card.title;
        showTitlesMap[card.key] = conf?.show_title !== false;
      }

      setFacilityImages(imgMap);
      setFacilityTitles(titlesMap);
      setFacilityShowTitles(showTitlesMap);

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

  const loadInfraImage = useCallback(async () => {
    setInfraLoading(true);
    try {
      const items = await getGalleryItemsBySection('infrastructure');
      if (items && items.length > 0) {
        const item = items[0];
        setInfraItem(item);
        setInfraTitle(item.title || 'CAMPUS INFRASTRUCTURE');
        setInfraShowTitle(item.show_title !== false);
      } else {
        setInfraItem(null);
        setInfraTitle('CAMPUS INFRASTRUCTURE');
        setInfraShowTitle(true);
      }
    } catch (err) {
      console.warn('[GalleryAdmin] Error loading infrastructure image:', err);
    } finally {
      setInfraLoading(false);
    }
  }, []);

  const loadGalleryPageItems = useCallback(async () => {
    setGalleryPageLoading(true);
    try {
      let items = await getGalleryItemsBySection('gallery');
      if (!items || items.length === 0) {
        // Seed default 3 items in UI state if database has none
        items = [
          { facility_key: 'gallery_1', title: 'Everyday Learning', image_url: null, display_order: 0, page_section: 'gallery', show_title: true },
          { facility_key: 'gallery_2', title: 'Learning Beyond Books', image_url: null, display_order: 1, page_section: 'gallery', show_title: true },
          { facility_key: 'gallery_3', title: 'Rooted in Indian Values', image_url: null, display_order: 2, page_section: 'gallery', show_title: true },
        ];
      } else {
        items = [...items].sort((a, b) => a.display_order - b.display_order);
      }

      setGalleryPageItems(items);

      const titlesMap: Record<string, string> = {};
      const showTitlesMap: Record<string, boolean> = {};
      for (const it of items) {
        titlesMap[it.facility_key] = it.title || '';
        showTitlesMap[it.facility_key] = it.show_title !== false;
      }
      setGalleryTitles(titlesMap);
      setGalleryShowTitles(showTitlesMap);

      // Load all card image sets
      const sets = await getAllGalleryCardImages();
      setGalleryCardSets(sets || {});
    } catch (err) {
      console.warn('[GalleryAdmin] Error loading gallery page items:', err);
    } finally {
      setGalleryPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'gallery') {
      loadFacilityImages();
      loadInfraImage();
      loadGalleryPageItems();
    }
  }, [isAuthenticated, activeTab, loadFacilityImages, loadInfraImage, loadGalleryPageItems]);

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
      const cardTitle = facilityTitles[card.key]?.trim() || card.title;
      const showTitle = facilityShowTitles[card.key] !== false;
      const saveRes = await updateFacilityImage(
        card.key,
        persistentUrl,
        cardTitle,
        currentUserEmail || 'Admin',
        showTitle
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
          text: `Image & title for "${cardTitle}" saved successfully!`,
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

  const handleSaveFacilitySettings = async (card: FacilityCardItem) => {
    const selected = selectedFacilityFiles[card.key];
    if (selected) {
      return handleUploadFacilityImage(card);
    }

    const cardTitle = facilityTitles[card.key]?.trim() || card.title;
    const showTitle = facilityShowTitles[card.key] !== false;
    const currentSavedUrl = facilityImages[card.key] || null;

    setUploadingFacilityKey(card.key);
    setFacilityMessages((prev) => ({ ...prev, [card.key]: null }));

    try {
      const saveRes = await updateFacilityImage(
        card.key,
        currentSavedUrl,
        cardTitle,
        currentUserEmail || 'Admin',
        showTitle
      );

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to save settings.');
      }

      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: {
          type: 'success',
          text: `Settings for "${cardTitle}" saved! Title: ${showTitle ? 'Visible' : 'Hidden'}.`,
        },
      }));
    } catch (err: any) {
      setFacilityMessages((prev) => ({
        ...prev,
        [card.key]: {
          type: 'error',
          text: err.message || 'Failed to save settings.',
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
      const cardTitle = facilityTitles[card.key]?.trim() || card.title;
      const showTitle = facilityShowTitles[card.key] !== false;
      const res = await updateFacilityImage(card.key, null, cardTitle, currentUserEmail || 'Admin', showTitle);
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
          text: `Image removed. "${cardTitle}" now displays an empty frame.`,
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

  // ---------------------------------------------------------------------------
  // Campus Infrastructure Image Handlers
  // ---------------------------------------------------------------------------
  const handleSelectInfraImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInfraMessage(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setInfraMessage({
        type: 'error',
        text: 'Please upload a valid image file (JPG, PNG, or WebP).',
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setInfraMessage({
        type: 'error',
        text: 'Image file size must be less than 10 MB.',
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setInfraSelectedFile({
        file,
        previewUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKb: Math.round(file.size / 1024),
      });
    };
    img.src = previewUrl;
  };

  const handleCancelInfraSelect = () => {
    if (infraSelectedFile?.previewUrl) {
      URL.revokeObjectURL(infraSelectedFile.previewUrl);
    }
    setInfraSelectedFile(null);
    setInfraMessage(null);
  };

  const handleSaveInfraImage = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      setInfraMessage({ type: 'error', text: 'Supabase client is not configured.' });
      return;
    }

    setInfraUploading(true);
    setInfraMessage(null);

    try {
      let persistentUrl = infraItem?.image_url || null;

      if (infraSelectedFile) {
        const ext = infraSelectedFile.file.name.split('.').pop()?.toLowerCase() || 'png';
        const timestamp = Date.now();
        const storagePath = `infrastructure-campus-${timestamp}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('site-banners')
          .upload(storagePath, infraSelectedFile.file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('site-banners')
          .getPublicUrl(storagePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Failed to resolve public image URL from storage.');
        }

        persistentUrl = publicUrlData.publicUrl;
      }

      const finalTitle = infraTitle.trim() || 'CAMPUS INFRASTRUCTURE';
      const saveRes = await saveGalleryItem({
        facility_key: 'campus_main',
        title: finalTitle,
        image_url: persistentUrl,
        display_order: 0,
        page_section: 'infrastructure',
        show_title: infraShowTitle,
        updated_by: currentUserEmail || 'Admin',
      });

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to save infrastructure record.');
      }

      setInfraItem({
        facility_key: 'campus_main',
        title: finalTitle,
        image_url: persistentUrl,
        display_order: 0,
        page_section: 'infrastructure',
        show_title: infraShowTitle,
      });
      setInfraSelectedFile(null);
      setInfraMessage({
        type: 'success',
        text: `Campus Infrastructure image and settings saved! Title: ${infraShowTitle ? 'Visible' : 'Hidden'}.`,
      });
    } catch (err: any) {
      console.error('[GalleryAdmin] Infra upload error:', err);
      setInfraMessage({
        type: 'error',
        text: err.message || 'Failed to save infrastructure image.',
      });
    } finally {
      setInfraUploading(false);
    }
  };

  const handleRemoveInfraImage = async () => {
    if (!window.confirm('Are you sure you want to remove the campus infrastructure image? The page will display the placeholder frame.')) {
      return;
    }

    setInfraUploading(true);
    setInfraMessage(null);

    try {
      const finalTitle = infraTitle.trim() || 'CAMPUS INFRASTRUCTURE';
      const res = await saveGalleryItem({
        facility_key: 'campus_main',
        title: finalTitle,
        image_url: null,
        display_order: 0,
        page_section: 'infrastructure',
        show_title: infraShowTitle,
        updated_by: currentUserEmail || 'Admin',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to remove image record.');
      }

      setInfraItem((prev) => (prev ? { ...prev, image_url: null } : null));
      setInfraSelectedFile(null);
      setInfraMessage({
        type: 'success',
        text: 'Campus infrastructure image removed. Frame now displays default placeholder.',
      });
    } catch (err: any) {
      setInfraMessage({
        type: 'error',
        text: err.message || 'Failed to remove infrastructure image.',
      });
    } finally {
      setInfraUploading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Gallery Page Moments (/gallery/) Handlers
  // ---------------------------------------------------------------------------
  const handleSelectGalleryFile = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGalleryItemMessages((prev) => ({ ...prev, [key]: null }));
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setGalleryItemMessages((prev) => ({
        ...prev,
        [key]: { type: 'error', text: 'Please upload a valid image file (JPG, PNG, or WebP).' },
      }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setGalleryItemMessages((prev) => ({
        ...prev,
        [key]: { type: 'error', text: 'Image file size must be less than 8 MB.' },
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setSelectedGalleryFiles((prev) => ({
        ...prev,
        [key]: {
          file,
          previewUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb: Math.round(file.size / 1024),
        },
      }));
    };
    img.src = previewUrl;
  };

  const handleCancelGallerySelect = (key: string) => {
    const selected = selectedGalleryFiles[key];
    if (selected?.previewUrl) {
      URL.revokeObjectURL(selected.previewUrl);
    }
    setSelectedGalleryFiles((prev) => ({ ...prev, [key]: null }));
    setGalleryItemMessages((prev) => ({ ...prev, [key]: null }));
  };

  const handleSaveGalleryItem = async (item: ManagedGalleryItem) => {
    const key = item.facility_key;
    const selected = selectedGalleryFiles[key];
    const cardTitle = galleryTitles[key]?.trim() || item.title || 'Gallery Moment';
    const showTitle = galleryShowTitles[key] !== false;

    setUploadingGalleryKey(key);
    setGalleryItemMessages((prev) => ({ ...prev, [key]: null }));

    try {
      let persistentUrl = item.image_url;

      if (selected) {
        const ext = selected.file.name.split('.').pop()?.toLowerCase() || 'png';
        const timestamp = Date.now();
        const storagePath = `gallery-${key}-${timestamp}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('site-banners')
          .upload(storagePath, selected.file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('site-banners')
          .getPublicUrl(storagePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error('Failed to resolve public image URL from storage.');
        }

        persistentUrl = publicUrlData.publicUrl;
      }

      const saveRes = await saveGalleryItem({
        facility_key: key,
        title: cardTitle,
        image_url: persistentUrl,
        display_order: item.display_order,
        page_section: 'gallery',
        show_title: showTitle,
        updated_by: currentUserEmail || 'Admin',
      });

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to save gallery item.');
      }

      setGalleryPageItems((prev) =>
        prev.map((it) =>
          it.facility_key === key
            ? { ...it, title: cardTitle, image_url: persistentUrl, show_title: showTitle }
            : it
        )
      );
      setSelectedGalleryFiles((prev) => ({ ...prev, [key]: null }));
      setGalleryItemMessages((prev) => ({
        ...prev,
        [key]: {
          type: 'success',
          text: `"${cardTitle}" saved successfully! Title: ${showTitle ? 'Visible' : 'Hidden'}.`,
        },
      }));
    } catch (err: any) {
      console.error('[GalleryAdmin] Gallery card save error:', err);
      setGalleryItemMessages((prev) => ({
        ...prev,
        [key]: {
          type: 'error',
          text: err.message || 'Failed to save gallery card.',
        },
      }));
    } finally {
      setUploadingGalleryKey(null);
    }
  };

  const handleRemoveGalleryImage = async (item: ManagedGalleryItem) => {
    const key = item.facility_key;
    if (!window.confirm(`Are you sure you want to remove the image for "${item.title}"?`)) {
      return;
    }

    setUploadingGalleryKey(key);
    setGalleryItemMessages((prev) => ({ ...prev, [key]: null }));

    try {
      const cardTitle = galleryTitles[key]?.trim() || item.title || 'Gallery Moment';
      const showTitle = galleryShowTitles[key] !== false;

      const res = await saveGalleryItem({
        facility_key: key,
        title: cardTitle,
        image_url: null,
        display_order: item.display_order,
        page_section: 'gallery',
        show_title: showTitle,
        updated_by: currentUserEmail || 'Admin',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to remove image.');
      }

      setGalleryPageItems((prev) =>
        prev.map((it) => (it.facility_key === key ? { ...it, image_url: null } : it))
      );
      setSelectedGalleryFiles((prev) => ({ ...prev, [key]: null }));
      setGalleryItemMessages((prev) => ({
        ...prev,
        [key]: {
          type: 'success',
          text: `Image removed for "${cardTitle}". Card remains on /gallery/.`,
        },
      }));
    } catch (err: any) {
      setGalleryItemMessages((prev) => ({
        ...prev,
        [key]: {
          type: 'error',
          text: err.message || 'Failed to remove image.',
        },
      }));
    } finally {
      setUploadingGalleryKey(null);
    }
  };

  const handleDeleteGalleryCard = async (item: ManagedGalleryItem) => {
    const key = item.facility_key;
    if (!window.confirm(`Are you sure you want to permanently delete the card "${item.title}" from the Gallery page?`)) {
      return;
    }

    setUploadingGalleryKey(key);
    try {
      await deleteGalleryItem(key, currentUserEmail || 'Admin');
      const updated = galleryPageItems.filter((it) => it.facility_key !== key);
      setGalleryPageItems(updated);

      const orderedKeys = updated.map((it) => it.facility_key);
      await updateGalleryOrders(orderedKeys, 'gallery', currentUserEmail || 'Admin');

      setGalleryGlobalMessage({
        type: 'success',
        text: `Card "${item.title}" deleted from Gallery.`,
      });
    } catch (err: any) {
      setGalleryGlobalMessage({
        type: 'error',
        text: err.message || 'Failed to delete gallery card.',
      });
    } finally {
      setUploadingGalleryKey(null);
    }
  };

  const handleAddNewGalleryCard = async () => {
    const newKey = `gallery_${Date.now()}`;
    const newOrder = galleryPageItems.length;
    const newTitle = `Gallery Moment ${newOrder + 1}`;

    const newItem: ManagedGalleryItem = {
      facility_key: newKey,
      title: newTitle,
      image_url: null,
      display_order: newOrder,
      page_section: 'gallery',
      show_title: true,
    };

    const updated = [...galleryPageItems, newItem];
    setGalleryPageItems(updated);
    setGalleryTitles((prev) => ({ ...prev, [newKey]: newTitle }));
    setGalleryShowTitles((prev) => ({ ...prev, [newKey]: true }));

    await saveGalleryItem(newItem);
    setGalleryGlobalMessage({
      type: 'success',
      text: `New Gallery card "${newTitle}" created! You can now upload an image and edit its title.`,
    });
  };

  const handleGalleryDragStart = (e: React.DragEvent, index: number) => {
    setGalleryDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleGalleryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (galleryDragIndex === null || galleryDragIndex === index) return;
    setGalleryDragOverIndex(index);
  };

  const handleGalleryDragEnd = () => {
    setGalleryDragIndex(null);
    setGalleryDragOverIndex(null);
  };

  const handleGalleryDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (galleryDragIndex === null || galleryDragIndex === dropIndex) {
      handleGalleryDragEnd();
      return;
    }

    const prevList = [...galleryPageItems];
    const updated = [...galleryPageItems];
    const [draggedItem] = updated.splice(galleryDragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setGalleryPageItems(updated);
    handleGalleryDragEnd();

    setIsReorderingGallery(true);
    setGalleryGlobalMessage(null);

    const orderedKeys = updated.map((c) => c.facility_key);
    const result = await updateGalleryOrders(orderedKeys, 'gallery', currentUserEmail || 'Admin');
    setIsReorderingGallery(false);

    if (!result.success) {
      setGalleryPageItems(prevList);
      setGalleryGlobalMessage({
        type: 'error',
        text: `Failed to save display order: ${result.error}. Previous order restored.`,
      });
    } else {
      setGalleryGlobalMessage({
        type: 'success',
        text: 'Gallery moments display sequence updated and saved to Supabase!',
      });
    }
  };

  const handleGalleryMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryPageItems.length) return;

    const prevList = [...galleryPageItems];
    const updated = [...galleryPageItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setGalleryPageItems(updated);
    setIsReorderingGallery(true);
    setGalleryGlobalMessage(null);

    const orderedKeys = updated.map((c) => c.facility_key);
    const result = await updateGalleryOrders(orderedKeys, 'gallery', currentUserEmail || 'Admin');
    setIsReorderingGallery(false);

    if (!result.success) {
      setGalleryPageItems(prevList);
      setGalleryGlobalMessage({
        type: 'error',
        text: `Failed to save display order: ${result.error}. Previous order restored.`,
      });
    } else {
      setGalleryGlobalMessage({
        type: 'success',
        text: 'Gallery moments display sequence updated and saved to Supabase!',
      });
    }
  };

  // Image Set Management Handlers
  const handleOpenManageSet = async (card: ManagedGalleryItem) => {
    if (!card || !card.facility_key) {
      console.error('[ManageImageSet] Invalid card passed to handleOpenManageSet:', card);
      return;
    }

    setManagingSetCard(card);
    setSetModalMessage(null);
    setDeleteConfirmImageId(null);
    setSetImagesFetchError(null);
    setSetImagesLoading(true);

    const existing = Array.isArray(galleryCardSets?.[card.facility_key])
      ? galleryCardSets[card.facility_key]
      : [];
    setSetImagesList(existing);

    // Refresh fresh from Supabase with safe error handling
    try {
      const res = await fetchGalleryCardImages(card.facility_key);
      if (res.error) {
        setSetImagesFetchError(res.error);
      } else {
        const safeData = Array.isArray(res.data) ? res.data : [];
        setSetImagesList(safeData);
        setGalleryCardSets((prev) => ({ ...(prev || {}), [card.facility_key]: safeData }));
      }
    } catch (err: any) {
      console.error('[ManageImageSet] Exception fetching fresh set images:', err);
      setSetImagesFetchError(err?.message || 'Failed to connect to database.');
    } finally {
      setSetImagesLoading(false);
    }
  };

  const handleRetryFetchImages = async () => {
    if (!managingSetCard?.facility_key) return;
    setSetImagesLoading(true);
    setSetImagesFetchError(null);
    try {
      const res = await fetchGalleryCardImages(managingSetCard.facility_key);
      if (res.error) {
        setSetImagesFetchError(res.error);
      } else {
        const safeData = Array.isArray(res.data) ? res.data : [];
        setSetImagesList(safeData);
        setGalleryCardSets((prev) => ({ ...(prev || {}), [managingSetCard.facility_key]: safeData }));
      }
    } catch (err: any) {
      setSetImagesFetchError(err?.message || 'Retry failed.');
    } finally {
      setSetImagesLoading(false);
    }
  };

  const handleCloseManageSet = () => {
    setManagingSetCard(null);
    setSetModalMessage(null);
    setDeleteConfirmImageId(null);
    setSetImagesFetchError(null);
    setSetImagesLoading(false);
  };

  // Lock body scroll and listen for Escape key when managingSetCard modal is open
  useEffect(() => {
    if (!managingSetCard) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseManageSet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [managingSetCard]);

  const handleUploadMultipleSetImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !managingSetCard) return;

    setSetModalUploading(true);
    setSetModalMessage(null);
    const cardKey = managingSetCard.facility_key;
    const fileList = Array.from(files);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setSetUploadProgress(`Uploading ${i + 1} of ${fileList.length} (${file.name})...`);

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 5 MB maximum size limit.`);
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const timestamp = Date.now();
        const storagePath = `gallery-set-${cardKey}-${timestamp}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('site-banners')
          .upload(storagePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('site-banners')
          .getPublicUrl(storagePath);

        if (!publicUrlData?.publicUrl) {
          throw new Error(`Failed to resolve public URL for ${file.name}.`);
        }

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setSetUploadProgress('Saving photos to gallery collection...');
      const saveRes = await addImagesToGallerySet(cardKey, uploadedUrls, currentUserEmail || 'Admin');

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Failed to save photos to database.');
      }

      const fresh = await getGalleryCardImages(cardKey);
      setSetImagesList(fresh);
      setGalleryCardSets((prev) => ({ ...prev, [cardKey]: fresh }));
      setSetModalMessage({
        type: 'success',
        text: `Successfully added ${uploadedUrls.length} photo(s) to "${managingSetCard.title}".`,
      });
    } catch (err: any) {
      setSetModalMessage({
        type: 'error',
        text: err?.message || 'Failed to upload photo set.',
      });
    } finally {
      setSetModalUploading(false);
      setSetUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleReplaceSetImage = async (imageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !managingSetCard) return;

    setSetModalUploading(true);
    setSetModalMessage(null);
    const cardKey = managingSetCard.facility_key;

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File "${file.name}" exceeds the 5 MB maximum size limit.`);
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const timestamp = Date.now();
      const storagePath = `gallery-set-${cardKey}-${timestamp}-replaced.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('site-banners')
        .upload(storagePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from('site-banners')
        .getPublicUrl(storagePath);

      if (!publicUrlData?.publicUrl) throw new Error('Failed to resolve image URL.');

      const replaceRes = await replaceGallerySetImage(imageId, publicUrlData.publicUrl, currentUserEmail || 'Admin');
      if (!replaceRes.success) throw new Error(replaceRes.error);

      const fresh = await getGalleryCardImages(cardKey);
      setSetImagesList(fresh);
      setGalleryCardSets((prev) => ({ ...prev, [cardKey]: fresh }));
      setSetModalMessage({ type: 'success', text: 'Photo replaced successfully.' });
    } catch (err: any) {
      setSetModalMessage({ type: 'error', text: err?.message || 'Failed to replace photo.' });
    } finally {
      setSetModalUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteSetImage = async (imageId: string) => {
    if (!managingSetCard) return;
    const cardKey = managingSetCard.facility_key;

    try {
      const res = await deleteGallerySetImage(imageId);
      if (!res.success) throw new Error(res.error);

      const fresh = await getGalleryCardImages(cardKey);
      setSetImagesList(fresh);
      setGalleryCardSets((prev) => ({ ...prev, [cardKey]: fresh }));
      setDeleteConfirmImageId(null);
      setSetModalMessage({ type: 'success', text: 'Photo removed from set.' });
    } catch (err: any) {
      setSetModalMessage({ type: 'error', text: err?.message || 'Failed to remove photo.' });
    }
  };

  const handleMoveSetImage = async (index: number, direction: 'up' | 'down') => {
    if (!managingSetCard) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= setImagesList.length) return;

    const copy = [...setImagesList];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setSetImagesList(copy);

    const cardKey = managingSetCard.facility_key;
    const res = await updateGallerySetImageOrder(cardKey, copy.map((c) => c.id), currentUserEmail || 'Admin');
    if (res.success) {
      setGalleryCardSets((prev) => ({ ...prev, [cardKey]: copy }));
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
    <AdminErrorBoundary>
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

        {/* 5. Comprehensive Gallery Management Section (Facilities, Infrastructure, and Gallery Page) */}
        {activeTab === 'gallery' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Main Header */}
            <div className="bg-white border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#C59B27] inline-block" />
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-[#0B2545]">
                    Gallery &amp; Image Management
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Manage photography, editable titles, visibility, and display sequence for Facilities, Campus Infrastructure, and the public Gallery page.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    loadFacilityImages();
                    loadInfraImage();
                    loadGalleryPageItems();
                  }}
                  disabled={facilityImagesLoading || infraLoading || galleryPageLoading || isReorderingFacilities || isReorderingGallery}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Reload images, titles, and order from Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${facilityImagesLoading || infraLoading || galleryPageLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh All</span>
                </button>
                <a
                  href={
                    gallerySubTab === 'facilities'
                      ? '/facilities/'
                      : gallerySubTab === 'infrastructure'
                      ? '/about/infrastructure/'
                      : '/gallery/'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>
                    View{' '}
                    {gallerySubTab === 'facilities'
                      ? 'Facilities'
                      : gallerySubTab === 'infrastructure'
                      ? 'Infrastructure'
                      : 'Gallery'}{' '}
                    Page
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C59B27]" />
                </a>
              </div>
            </div>

            {/* Sub-Section Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setGallerySubTab('facilities')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition-all flex items-center gap-2 cursor-pointer ${
                  gallerySubTab === 'facilities'
                    ? 'bg-[#0B2545] text-[#F6D55C] shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>1. Facilities Cards (/facilities/)</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold">4 Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setGallerySubTab('infrastructure')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition-all flex items-center gap-2 cursor-pointer ${
                  gallerySubTab === 'infrastructure'
                    ? 'bg-[#0B2545] text-[#F6D55C] shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>2. Campus Infrastructure (/about/infrastructure/)</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold">1 Frame</span>
              </button>

              <button
                type="button"
                onClick={() => setGallerySubTab('gallery')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-md transition-all flex items-center gap-2 cursor-pointer ${
                  gallerySubTab === 'gallery'
                    ? 'bg-[#0B2545] text-[#F6D55C] shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>3. Gallery Page (/gallery/)</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold">
                  {galleryPageItems.length} Cards
                </span>
              </button>
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

            {/* ============================================================= */}
            {/* SUB-SECTION 1: Facilities Cards Management                     */}
            {/* ============================================================= */}
            {gallerySubTab === 'facilities' && (
              <div className="space-y-6 animate-fadeIn">
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
                    const cardTitle = facilityTitles[card.key] ?? card.title;
                    const showTitle = facilityShowTitles[card.key] !== false;

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
                        {/* Card Top Header */}
                        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-[#0B2545] hover:bg-slate-200/70 rounded transition-colors touch-none select-none"
                              title="Drag 6-dot handle to reorder card sequence"
                              aria-label="Drag handle to reorder"
                            >
                              <GripVertical className="w-5 h-5 text-slate-500" />
                            </div>

                            <span className="px-2 py-0.5 bg-[#0B2545] text-white font-black text-xs uppercase tracking-wider rounded">
                              #{idx + 1}
                            </span>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-sm font-serif">
                                  {cardTitle || card.title}
                                </h3>
                                <span className="text-[10px] text-slate-400 font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded">
                                  ID: {card.key}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Move Up / Down Buttons & Published Badge */}
                          <div className="flex items-center gap-2">
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
                                alt={`Preview for ${cardTitle}`}
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
                                alt={cardTitle}
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
                                This card displays an empty placeholder frame on /facilities/.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Title Editing & Visibility Control Block */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3 bg-slate-50/70 p-3.5 rounded border border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                Card Title:
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setFacilityShowTitles((prev) => ({
                                    ...prev,
                                    [card.key]: !showTitle,
                                  }))
                                }
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                                  showTitle
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                                title={showTitle ? 'Click to hide title on website' : 'Click to show title on website'}
                              >
                                {showTitle ? (
                                  <>
                                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Show title (Visible)</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Hide title (Hidden)</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <input
                              type="text"
                              value={cardTitle}
                              onChange={(e) =>
                                setFacilityTitles((prev) => ({
                                  ...prev,
                                  [card.key]: e.target.value,
                                }))
                              }
                              placeholder="Enter custom card title"
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                            />
                            <p className="text-[10.5px] text-slate-500">
                              {showTitle
                                ? 'Title is rendered above the card description on the public page.'
                                : 'Title is suppressed on the public page. The description & image remain intact.'}
                            </p>
                          </div>

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
                            <input
                              id={fileInputId}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => handleSelectFacilityImage(card.key, e)}
                            />

                            {selectedFile ? (
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
                                      <span>Saving...</span>
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
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-2">
                                  <label
                                    htmlFor={fileInputId}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#C59B27] hover:text-[#0B2545] text-[#0B2545] text-xs font-bold rounded transition-colors cursor-pointer"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>{currentSavedUrl ? 'Change Image' : 'Upload Image'}</span>
                                  </label>

                                  <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => handleSaveFacilitySettings(card)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded transition-colors cursor-pointer"
                                    title="Save title and visibility settings to Supabase"
                                  >
                                    <Save className="w-3.5 h-3.5 text-[#C59B27]" />
                                    <span>Save Title</span>
                                  </button>
                                </div>

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
              </div>
            )}

            {/* ============================================================= */}
            {/* SUB-SECTION 2: Campus Infrastructure Image Frame Management   */}
            {/* ============================================================= */}
            {gallerySubTab === 'infrastructure' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Important Distinguishing Banner */}
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded text-xs text-amber-900 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">
                      Campus Infrastructure Photo Frame (1536 × 1024, 3:2 Aspect Ratio)
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      This controls the primary campus photography frame displayed on{' '}
                      <span className="font-semibold underline">/about/infrastructure/</span> below the breadcrumbs and page heading.
                      <strong className="block text-amber-950 mt-1">
                        Note: This is completely separate from the top hero banner managed under the Banners tab.
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Infrastructure Image Card */}
                <div className="bg-white border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold font-serif text-[#0B2545]">
                        Campus Infrastructure Frame Configuration
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Upload high-resolution photography. The frame displays with an aspect ratio of 3:2 (max 1536 × 1024 px on desktop).
                      </p>
                    </div>

                    {infraItem?.image_url ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Active Image Published</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Empty Placeholder Active</span>
                      </span>
                    )}
                  </div>

                  {/* Preview Frame: 3:2 Aspect Ratio matching frontend */}
                  <div className="relative aspect-[3/2] w-full max-w-2xl mx-auto bg-slate-100 border-2 border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                    {infraSelectedFile ? (
                      <>
                        <img
                          src={infraSelectedFile.previewUrl}
                          alt="Pending Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded shadow">
                          Pending Save: {infraSelectedFile.width}×{infraSelectedFile.height} ({infraSelectedFile.sizeKb} KB)
                        </div>
                      </>
                    ) : infraItem?.image_url ? (
                      <>
                        <img
                          src={infraItem.image_url}
                          alt={infraTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 text-xs font-bold px-3 py-1 rounded shadow">
                          Current Active Image
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-8 text-slate-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-1" />
                        <p className="text-sm font-semibold text-slate-600">No Image Uploaded Yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          The infrastructure page currently displays an empty placeholder frame with the title badge.
                        </p>
                      </div>
                    )}

                    {/* Live Preview of Title Badge */}
                    {infraShowTitle && infraTitle && (
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="inline-block bg-[#0B2545] text-[#F6D55C] font-black text-xs uppercase px-3 py-1.5 rounded-lg shadow tracking-wider">
                          {infraTitle}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Visibility Controls */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Infrastructure Image Title / Badge Label:
                      </label>

                      <button
                        type="button"
                        onClick={() => setInfraShowTitle((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                          infraShowTitle
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title={infraShowTitle ? 'Click to hide badge on page' : 'Click to show badge on page'}
                      >
                        {infraShowTitle ? (
                          <>
                            <Eye className="w-4 h-4 text-emerald-600" />
                            <span>Show Title Badge (Visible)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-amber-600" />
                            <span>Hide Title Badge (Hidden)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={infraTitle}
                      onChange={(e) => setInfraTitle(e.target.value)}
                      placeholder="e.g. CAMPUS INFRASTRUCTURE"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                    />

                    <p className="text-xs text-slate-500">
                      {infraShowTitle
                        ? 'The yellow/navy badge is displayed in the bottom-left corner of the campus frame.'
                        : 'The title badge is hidden. The campus image spans the entire frame cleanly.'}
                    </p>
                  </div>

                  {/* Feedback Message */}
                  {infraMessage && (
                    <div
                      className={`p-3 text-xs rounded border flex items-start gap-2 ${
                        infraMessage.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {infraMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span className="flex-1 font-semibold">{infraMessage.text}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <input
                      id="infra-file-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleSelectInfraImage}
                    />

                    <div className="flex items-center gap-2.5">
                      <label
                        htmlFor="infra-file-input"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-[#C59B27] hover:text-[#0B2545] text-[#0B2545] text-xs font-bold rounded transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{infraItem?.image_url ? 'Choose Replacement Image' : 'Select Photo to Upload'}</span>
                      </label>

                      {infraSelectedFile && (
                        <button
                          type="button"
                          onClick={handleCancelInfraSelect}
                          className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {infraItem?.image_url && (
                        <button
                          type="button"
                          disabled={infraUploading}
                          onClick={handleRemoveInfraImage}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Image</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={infraUploading}
                        onClick={handleSaveInfraImage}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer"
                      >
                        {infraUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#C59B27]" />
                            <span>Saving Infrastructure...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-[#C59B27]" />
                            <span>Save Infrastructure Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* SUB-SECTION 3: Public Gallery Page (/gallery/) Management    */}
            {/* ============================================================= */}
            {gallerySubTab === 'gallery' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header bar with Add Card action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-serif">
                      Public Gallery Moments Cards (/gallery/)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage photo cards and full-resolution lightbox moments. Drag the 6-dot handle or use arrows to reorder.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddNewGalleryCard}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] font-bold text-xs uppercase rounded shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Gallery Card</span>
                    </button>
                  </div>
                </div>

                {/* Reorder Status */}
                {isReorderingGallery && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C59B27]" />
                    <span>Saving new card sequence to Supabase...</span>
                  </div>
                )}

                {/* 3-Column / Responsive Grid of Gallery Page Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryPageItems.map((item, idx) => {
                    const key = item.facility_key;
                    const selected = selectedGalleryFiles[key];
                    const isUploading = uploadingGalleryKey === key;
                    const msg = galleryItemMessages[key];
                    const fileInputId = `gallery-input-${key}`;
                    const isDragged = galleryDragIndex === idx;
                    const isDragOver = galleryDragOverIndex === idx;
                    const cardTitle = galleryTitles[key] ?? item.title;
                    const showTitle = galleryShowTitles[key] !== false;

                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={(e) => handleGalleryDragStart(e, idx)}
                        onDragOver={(e) => handleGalleryDragOver(e, idx)}
                        onDragEnd={handleGalleryDragEnd}
                        onDrop={(e) => handleGalleryDrop(e, idx)}
                        className={`bg-white border shadow-sm flex flex-col justify-between transition-all duration-150 ${
                          isDragOver
                            ? 'border-[#C59B27] ring-2 ring-[#C59B27]/40 bg-amber-50/20'
                            : isDragged
                            ? 'opacity-40 border-dashed border-[#0B2545]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Card Header with Drag Handle, Order Badge & Actions */}
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/80">
                          <div className="flex items-center gap-2">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#0B2545] hover:bg-slate-200/70 rounded transition-colors touch-none select-none"
                              title="Drag handle to reorder card sequence"
                              aria-label="Drag handle to reorder"
                            >
                              <GripVertical className="w-4 h-4 text-slate-500" />
                            </div>

                            <span className="px-2 py-0.5 bg-[#0B2545] text-white font-black text-xs uppercase tracking-wider rounded">
                              #{idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleGalleryMoveOrder(idx, 'up')}
                              disabled={idx === 0 || isReorderingGallery}
                              className="p-1 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer rounded-xs"
                              title="Move card earlier in sequence"
                              aria-label="Move card up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleGalleryMoveOrder(idx, 'down')}
                              disabled={idx === galleryPageItems.length - 1 || isReorderingGallery}
                              className="p-1 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer rounded-xs"
                              title="Move card later in sequence"
                              aria-label="Move card down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryCard(item)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete this gallery card completely"
                              aria-label="Delete card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Image Preview Frame (4:3 Aspect Ratio) */}
                        <div className="relative aspect-[4/3] bg-slate-100 border-b border-slate-200 overflow-hidden flex items-center justify-center">
                          {selected ? (
                            <>
                              <img
                                src={selected.previewUrl}
                                alt={`Preview for ${cardTitle}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                Pending: {selected.width}×{selected.height} ({selected.sizeKb} KB)
                              </div>
                            </>
                          ) : item.image_url ? (
                            <>
                              <img
                                src={item.image_url}
                                alt={cardTitle}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 text-[9.5px] font-bold px-2 py-0.5 rounded shadow">
                                Active Photo
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-4 text-slate-400">
                              <ImageIcon className="w-8 h-8 mx-auto mb-1.5 text-slate-300 stroke-1" />
                              <p className="text-xs font-semibold text-slate-500">Empty Photo Card</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Displays as an empty frame on /gallery/.
                              </p>
                            </div>
                          )}

                          {/* Overlaid Title Preview (matching public page) */}
                          {showTitle && cardTitle && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B2545]/90 via-[#0B2545]/50 to-transparent pt-8 pb-3 px-4 flex flex-col justify-end pointer-events-none">
                              <div className="w-6 h-0.5 bg-[#C59B27] mb-1.5" />
                              <h4 className="text-white font-serif font-bold text-xs sm:text-sm tracking-wide leading-snug drop-shadow-sm truncate">
                                {cardTitle}
                              </h4>
                            </div>
                          )}
                        </div>

                        {/* Card Content & Controls */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          {/* Title & Visibility */}
                          <div className="space-y-2.5 bg-slate-50/70 p-3 rounded border border-slate-200">
                            <div className="flex items-center justify-between gap-1.5">
                              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                                Card Title:
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  setGalleryShowTitles((prev) => ({
                                    ...prev,
                                    [key]: !showTitle,
                                  }))
                                }
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-bold rounded transition-colors cursor-pointer ${
                                  showTitle
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                                title={showTitle ? 'Click to hide title on page' : 'Click to show title on page'}
                              >
                                {showTitle ? (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>Show title</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 text-amber-600" />
                                    <span>Hide title</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <input
                              type="text"
                              value={cardTitle}
                              onChange={(e) =>
                                setGalleryTitles((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              placeholder="Enter title for card & lightbox"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                            />
                          </div>

                          {/* Image Set Indicator & Management Trigger */}
                          <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200/80 rounded">
                            <div className="flex items-center gap-1.5 text-xs text-[#0B2545] font-semibold">
                              <Images className="w-4 h-4 text-[#C59B27]" />
                              <span>{(galleryCardSets[key] || []).length} photos in set</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenManageSet(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white text-[11px] font-bold rounded shadow-2xs transition-colors cursor-pointer"
                              title="Manage all photos belonging to this card's lightbox collection"
                            >
                              <Images className="w-3.5 h-3.5 text-[#C59B27]" />
                              <span>Manage Image Set</span>
                            </button>
                          </div>

                          {/* Card Message */}
                          {msg && (
                            <div
                              className={`p-2 text-[11px] rounded border flex items-start gap-1.5 ${
                                msg.type === 'success'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-rose-50 border-rose-200 text-rose-800'
                              }`}
                            >
                              {msg.type === 'success' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              )}
                              <span className="flex-1 font-medium">{msg.text}</span>
                            </div>
                          )}

                          {/* Actions Area */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            <input
                              id={fileInputId}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => handleSelectGalleryFile(key, e)}
                            />

                            {selected ? (
                              <div className="flex items-center gap-2 w-full">
                                <button
                                  type="button"
                                  disabled={isUploading}
                                  onClick={() => handleSaveGalleryItem(item)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                                >
                                  {isUploading ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                                      <span>Saving...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-3.5 h-3.5 text-[#C59B27]" />
                                      <span>Save &amp; Publish</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={isUploading}
                                  onClick={() => handleCancelGallerySelect(key)}
                                  className="px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-1.5">
                                  <label
                                    htmlFor={fileInputId}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-[#C59B27] hover:text-[#0B2545] text-[#0B2545] text-[11px] font-bold rounded transition-colors cursor-pointer"
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>{item.image_url ? 'Change Photo' : 'Upload Photo'}</span>
                                  </label>

                                  <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => handleSaveGalleryItem(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white text-[11px] font-bold rounded transition-colors cursor-pointer"
                                    title="Save title & visibility settings"
                                  >
                                    <Save className="w-3 h-3 text-[#C59B27]" />
                                    <span>Save</span>
                                  </button>
                                </div>

                                {item.image_url && (
                                  <button
                                    type="button"
                                    disabled={isUploading}
                                    onClick={() => handleRemoveGalleryImage(item)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="Remove photo from card"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Clear Photo</span>
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

                {/* Bottom Add Card Button */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleAddNewGalleryCard}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-slate-300 hover:border-[#0B2545] text-slate-700 hover:text-[#0B2545] text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#C59B27]" />
                    <span>+ Add Another Gallery Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================= */}
      {/* MANAGE IMAGE SET MODAL (Root Level Overlay, z-[100])           */}
      {/* ============================================================= */}
      {managingSetCard && (() => {
        const safeCardKey = managingSetCard?.facility_key || '';
        const safeCardTitle = galleryTitles[safeCardKey]?.trim() || managingSetCard?.title || safeCardKey || 'Gallery Card';
        const safeImages = Array.isArray(setImagesList) ? setImagesList : [];

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Manage Image Set for ${safeCardTitle}`}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
            onClick={handleCloseManageSet}
          >
            <div
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Images className="w-5 h-5 text-[#C59B27]" />
                    <h3 className="font-bold text-base sm:text-lg font-serif">
                      Manage Image Set: {safeCardTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C59B27] text-[#0B2545] font-bold text-xs uppercase tracking-wider">
                      {safeImages.length} Photos
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Upload multiple photos, reorder, replace, or remove individual images. These photos appear when visitors click this card on /gallery/.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseManageSet}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close modal (Escape)"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Toolbar & Multi-Upload Bar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    id="multi-set-file-upload"
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={setModalUploading || setImagesLoading}
                    onChange={handleUploadMultipleSetImages}
                  />
                  <label
                    htmlFor="multi-set-file-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer ${
                      setModalUploading || setImagesLoading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4 text-[#C59B27]" />
                    <span>+ Upload Photos (Select Multiple)</span>
                  </label>

                  <span className="text-xs text-slate-500 hidden sm:inline">
                    JPG, PNG, or WebP (max 5 MB each). Hold Shift or Ctrl to select multiple.
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-600">
                  Card Identifier: <span className="text-[#0B2545] font-mono">{safeCardKey}</span>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {setModalUploading && (
                <div className="p-3 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C59B27]" />
                  <span>{setUploadProgress || 'Uploading and saving images to collection...'}</span>
                </div>
              )}

              {/* Action Feedback Messages */}
              {setModalMessage && (
                <div
                  className={`p-3 text-xs font-medium border-b flex items-center justify-between gap-2 ${
                    setModalMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {setModalMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{setModalMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSetModalMessage(null)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Dismiss message"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Main Content Area */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 min-h-[300px]">
                {setImagesLoading ? (
                  <div className="py-16 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#C59B27] mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm">Loading Image Set...</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Retrieving photos for {safeCardTitle} from Supabase.
                    </p>
                  </div>
                ) : setImagesFetchError ? (
                  <div className="py-12 px-4 border border-rose-200 rounded-xl bg-rose-50 text-center max-w-lg mx-auto">
                    <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
                    <h4 className="font-bold text-rose-900 text-sm">Unable to Retrieve Images</h4>
                    <p className="text-xs text-rose-700 mt-1 mb-4 leading-relaxed">
                      {setImagesFetchError}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetryFetchImages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Retry Loading</span>
                    </button>
                  </div>
                ) : safeImages.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                    <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm">No photos in this image set yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                      This card currently falls back to displaying its cover photo. Click the button above to upload photos to this collection.
                    </p>
                    <label
                      htmlFor="multi-set-file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#C59B27]" />
                      <span>+ Upload Photos Now</span>
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {safeImages.map((img, idx) => {
                      if (!img) return null;
                      const imgKey = img.id || `img-${idx}`;
                      const replaceInputId = `replace-set-img-${imgKey}`;
                      const isConfirmingDelete = deleteConfirmImageId === img.id;

                      return (
                        <div
                          key={imgKey}
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between group hover:border-[#C59B27]/60 transition-all"
                        >
                          {/* Top Bar with Order & Move Controls */}
                          <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded text-[10px]">
                              #{idx + 1}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSetImage(idx, 'up')}
                                disabled={idx === 0 || setModalUploading}
                                className="p-1 border border-slate-200 rounded hover:bg-slate-200 disabled:opacity-20 text-slate-600 transition-colors cursor-pointer"
                                title="Move earlier in lightbox order"
                                aria-label="Move earlier"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSetImage(idx, 'down')}
                                disabled={idx === safeImages.length - 1 || setModalUploading}
                                className="p-1 border border-slate-200 rounded hover:bg-slate-200 disabled:opacity-20 text-slate-600 transition-colors cursor-pointer"
                                title="Move later in lightbox order"
                                aria-label="Move later"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Thumbnail Frame */}
                          <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                            {img.image_url ? (
                              <img
                                src={img.image_url}
                                alt={`Set photo #${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Bottom Action Controls */}
                          <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                            <input
                              id={replaceInputId}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={setModalUploading}
                              onChange={(e) => handleReplaceSetImage(img.id, e)}
                            />
                            <label
                              htmlFor={replaceInputId}
                              className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 rounded cursor-pointer font-medium"
                              title="Replace this photo"
                            >
                              <Upload className="w-3 h-3 text-[#C59B27]" />
                              <span>Replace</span>
                            </label>

                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSetImage(img.id)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] cursor-pointer"
                                  title="Confirm delete"
                                >
                                  Confirm?
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmImageId(null)}
                                  className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 rounded text-[10px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmImageId(img.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded font-medium cursor-pointer"
                                title="Remove this photo from set"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Total: <strong className="text-slate-800">{safeImages.length} photos</strong> in this collection
                </span>

                <button
                  type="button"
                  onClick={handleCloseManageSet}
                  className="px-5 py-2 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  </AdminErrorBoundary>
  );
};
