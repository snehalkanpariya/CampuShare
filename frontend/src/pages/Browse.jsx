import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Package,
  RotateCcw,
  MapPin,
  Tag,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  DollarSign,
  HeartHandshake,
  Repeat,
  Heart,
  MessageSquare,
  Star,
  UploadCloud,
  Check,
  Send,
  Eye
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getListingsApi,
  createListingApi,
  updateListingStatusApi,
  deleteListingApi
} from '../config/api';
import { INITIAL_CAMPUS_ITEMS } from '../data/mockItems';

const EQUIPMENT_PRESETS = [
  {
    name: 'Charkha 🧵',
    category: 'Charkhas',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    title: 'Traditional Wooden Charkha (યંત્ર રેંટિયો)'
  },
  {
    name: 'Mini Drafter 📐',
    category: 'Drafters',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    title: 'Engineering Mini Drafter & Scale Set'
  },
  {
    name: 'Lab Apron 🥼',
    category: 'Lab Aprons',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    title: 'Microbiology Lab Coat & Apron Kit'
  },
  {
    name: 'Books & Notes 📚',
    category: 'Books',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    title: 'Academic Course Reference Textbooks'
  },
  {
    name: 'Electronics 💻',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    title: 'Solar Scientific Calculator (FX-991EX)'
  },
  {
    name: 'Bicycle 🚲',
    category: 'Bicycles',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    title: 'Hero Commuter Campus Bicycle'
  }
];

export default function Browse({
  currentUser,
  onNavigate,
  items: parentItems,
  onAddItem,
  onDeleteItem,
  onUpdateItemStatus
}) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedResourceType, setSelectedResourceType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Data & UI States
  const [listings, setListings] = useState([]);
  const [allMasterItems, setAllMasterItems] = useState(parentItems || INITIAL_CAMPUS_ITEMS);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Wishlist / Bookmarks State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('campus_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      // Ignored
    }
  }, [wishlist]);

  // Active User Reservation Tracking
  const [activeReservation, setActiveReservation] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_active_reservation');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Modals
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reservationSuccessModal, setReservationSuccessModal] = useState(null);

  // Chat / Inquiry Modal State
  const [chatModalItem, setChatModalItem] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isTypingReply, setIsTypingReply] = useState(false);

  // New Listing Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Charkhas',
    resourceType: 'SELL',
    price: '',
    originalPrice: '',
    condition: 'Good & Functional',
    location: 'Central Library Foyer',
    hostel: 'Bhadra Boys Hostel',
    description: '',
    imageUrl: EQUIPMENT_PRESETS[0].url
  });

  // Dynamic Categories Definition
  const baseCategories = [
    { id: 'All', label: t('allCategories', 'All Categories') },
    { id: 'Charkhas', label: t('catCharkha', 'Traditional Charkha 🧵') },
    { id: 'Drafters', label: t('catDrafter', 'Engineering Drafter 📐') },
    { id: 'Lab Aprons', label: t('catApron', 'Lab Apron & Kit 🥼') },
    { id: 'Books', label: t('catBooks', 'Books & Notes 📚') },
    { id: 'Electronics', label: t('catElectronics', 'Electronics 💻') },
    { id: 'Hostel Needs', label: t('catHostel', 'Hostel Needs 🎁') },
    { id: 'Bicycles', label: t('catBicycles', 'Bicycles 🚲') },
  ];

  // Calculate live item counts per category
  const categoryCounts = useMemo(() => {
    const counts = { All: allMasterItems.length };
    ['Charkhas', 'Drafters', 'Lab Aprons', 'Books', 'Electronics', 'Hostel Needs', 'Bicycles'].forEach((catId) => {
      counts[catId] = allMasterItems.filter(
        (it) => it.category && it.category.toLowerCase() === catId.toLowerCase()
      ).length;
    });
    return counts;
  }, [allMasterItems]);

  const resourceTypes = [
    { id: 'ALL', label: t('allTypes', 'All Types'), icon: Package },
    { id: 'DONATION', label: t('typeDonation', 'Free Donation 🌿'), icon: HeartHandshake },
    { id: 'SELL', label: t('typeSell', 'For Sale 🏷️'), icon: DollarSign },
    { id: 'RENT', label: t('typeRent', 'For Rent ⏳'), icon: Clock },
    { id: 'EXCHANGE', label: t('typeExchange', 'Item Exchange 🔄'), icon: Repeat },
  ];

  const statuses = [
    { id: 'ALL', label: t('allStatuses', 'All Statuses') },
    { id: 'AVAILABLE', label: t('statusAvailable', 'Available') },
    { id: 'RESERVED', label: t('statusReserved', 'Reserved') },
    { id: 'UNAVAILABLE', label: t('statusUnavailable', 'Unavailable') },
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Toggle Wishlist Bookmark
  const toggleWishlist = (itemId, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.includes(itemId);
      if (exists) {
        showToast(t('removeFromWishlist', 'Removed from wishlist'));
        return prev.filter((id) => id !== itemId);
      } else {
        showToast(t('saveToWishlist', 'Saved to your campus wishlist ❤️'));
        return [...prev, itemId];
      }
    });
  };

  // Fetch listings from backend API with fallback
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const data = await getListingsApi({
        category: selectedCategory === 'All' ? '' : selectedCategory,
        resourceType: selectedResourceType === 'ALL' ? '' : selectedResourceType,
        status: selectedStatus === 'ALL' ? '' : selectedStatus,
        search: searchQuery,
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir
      });

      if (data && data.content) {
        let fetchedListings = data.content;
        if (showWishlistOnly) {
          fetchedListings = fetchedListings.filter((it) => wishlist.includes(it.id));
        }
        setListings(fetchedListings);
        setTotalPages(data.totalPages || 1);
        setTotalElements(showWishlistOnly ? fetchedListings.length : (data.totalElements || 0));
        setAllMasterItems(data.content);
      } else if (Array.isArray(data)) {
        let fetchedListings = data;
        if (showWishlistOnly) {
          fetchedListings = fetchedListings.filter((it) => wishlist.includes(it.id));
        }
        setListings(fetchedListings);
        setTotalPages(1);
        setTotalElements(fetchedListings.length);
        setAllMasterItems(data);
      }
    } catch (err) {
      setErrorNotice(err.message);

      // Client-side fallback filtering using parentItems or INITIAL_CAMPUS_ITEMS
      const sourceItems = parentItems && parentItems.length > 0 ? parentItems : INITIAL_CAMPUS_ITEMS;
      setAllMasterItems(sourceItems);

      let filtered = [...sourceItems];

      if (showWishlistOnly) {
        filtered = filtered.filter((item) => wishlist.includes(item.id));
      }

      if (selectedCategory !== 'All') {
        filtered = filtered.filter((item) =>
          item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      if (selectedResourceType !== 'ALL') {
        if (selectedResourceType === 'DONATION') {
          filtered = filtered.filter(
            (item) => item.resourceType === 'DONATION' || item.price === 'Free' || item.rawPrice === 0 || item.price === 0
          );
        } else if (selectedResourceType === 'SELL') {
          filtered = filtered.filter(
            (item) => item.resourceType === 'SELL' || (item.price !== 'Free' && (item.rawPrice > 0 || item.price > 0))
          );
        } else if (selectedResourceType === 'RENT') {
          filtered = filtered.filter((item) => item.resourceType === 'RENT');
        } else if (selectedResourceType === 'EXCHANGE') {
          filtered = filtered.filter((item) => item.resourceType === 'EXCHANGE');
        }
      }

      if (selectedStatus !== 'ALL') {
        filtered = filtered.filter((item) => (item.status || 'AVAILABLE').toUpperCase() === selectedStatus);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((item) =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.hostel && item.hostel.toLowerCase().includes(q))
        );
      }

      // Sort
      if (sortBy === 'price') {
        filtered.sort((a, b) => {
          const pA = typeof a.price === 'number' ? a.price : a.rawPrice || 0;
          const pB = typeof b.price === 'number' ? b.price : b.rawPrice || 0;
          return sortDir === 'asc' ? pA - pB : pB - pA;
        });
      } else if (sortBy === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      }

      const total = filtered.length;
      const pages = Math.ceil(total / pageSize) || 1;
      const startIndex = currentPage * pageSize;
      const paginated = filtered.slice(startIndex, startIndex + pageSize);

      setListings(paginated);
      setTotalPages(pages);
      setTotalElements(total);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    selectedResourceType,
    selectedStatus,
    showWishlistOnly,
    searchQuery,
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    wishlist,
    parentItems
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedResourceType('ALL');
    setSelectedStatus('ALL');
    setShowWishlistOnly(false);
    setSearchQuery('');
    setCurrentPage(0);
    setSortBy('createdAt');
    setSortDir('desc');
  };

  // Direct Reserve / Request Handover Action
  const handleReserveItem = async (item) => {
    if (!currentUser) {
      showToast('Please log in to reserve or claim campus academic gear.');
      return;
    }

    if (item.sellerName && currentUser.name && item.sellerName.toLowerCase() === currentUser.name.toLowerCase()) {
      showToast('You cannot reserve your own item listing.');
      return;
    }

    // Generate unique 6-digit transaction handshake code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const reservationPayload = {
      itemId: item.id,
      itemTitle: item.title,
      itemPrice: item.price,
      itemImage: item.imageUrl || item.image,
      itemCategory: item.category,
      location: item.location || 'Central Library Foyer',
      hostel: item.hostel || 'Campus Hostel',
      sellerName: item.sellerName || 'Verified Senior',
      sellerEmail: item.sellerEmail || 'senior@gujaratvidyapith.org',
      buyerName: currentUser.name || 'GVP Student',
      buyerEnrollment: currentUser.enrollmentNumber || 'Student',
      handshakeCode: generatedOtp,
      reservedAt: new Date().toLocaleString(),
      status: 'RESERVED'
    };

    try {
      await updateListingStatusApi(item.id, 'RESERVED');
    } catch (e) {
      // Offline fallback
    }

    // Update local state
    setListings((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'RESERVED' } : it))
    );
    if (onUpdateItemStatus) {
      onUpdateItemStatus(item.id, 'RESERVED');
    }

    // Persist active reservation
    localStorage.setItem('campus_active_reservation', JSON.stringify(reservationPayload));
    setActiveReservation(reservationPayload);

    // Show confirmed modal
    setReservationSuccessModal(reservationPayload);
    if (selectedItemForModal && selectedItemForModal.id === item.id) {
      setSelectedItemForModal((prev) => ({ ...prev, status: 'RESERVED' }));
    }

    showToast(t('reserveSuccessToast', 'Resource reserved! 6-digit handshake code generated.'));
  };

  // Cancel User Reservation
  const handleCancelReservation = async (item) => {
    if (!window.confirm(`Cancel reservation for "${item.title}"?`)) return;

    try {
      await updateListingStatusApi(item.id, 'AVAILABLE');
    } catch (e) {
      // Offline fallback
    }

    setListings((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'AVAILABLE' } : it))
    );
    if (onUpdateItemStatus) {
      onUpdateItemStatus(item.id, 'AVAILABLE');
    }

    localStorage.removeItem('campus_active_reservation');
    setActiveReservation(null);
    if (selectedItemForModal && selectedItemForModal.id === item.id) {
      setSelectedItemForModal((prev) => ({ ...prev, status: 'AVAILABLE' }));
    }

    showToast('Reservation cancelled. The item is now available for other students.');
  };

  // Open Chat / Inquiry Modal
  const handleOpenChatModal = (item, e) => {
    if (e) e.stopPropagation();
    setChatModalItem(item);

    // Load saved conversation for this item or initialize
    const savedThread = localStorage.getItem(`campus_chat_${item.id}`);
    if (savedThread) {
      try {
        setChatMessages(JSON.parse(savedThread));
      } catch (err) {
        setChatMessages([]);
      }
    } else {
      const initialMsgs = [
        {
          id: 1,
          sender: 'system',
          text: `Inquiry channel opened for: "${item.title}" (${item.price === 0 || item.price === 'Free' ? 'Free Donation' : '₹' + item.price})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 2,
          sender: 'seller',
          name: item.sellerName || 'Verified Senior',
          text: `Namaste! Feel free to ask any question regarding condition, accessories, or meeting at safe zones.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setChatMessages(initialMsgs);
      localStorage.setItem(`campus_chat_${item.id}`, JSON.stringify(initialMsgs));
    }
  };

  // Send Chat Message
  const handleSendMessage = (messageText) => {
    const textToSend = messageText || chatInputText;
    if (!textToSend.trim() || !chatModalItem) return;

    const newMsg = {
      id: Date.now(),
      sender: 'buyer',
      name: currentUser?.name || 'You',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setChatInputText('');
    localStorage.setItem(`campus_chat_${chatModalItem.id}`, JSON.stringify(updated));

    // Realistic Simulated Senior Response after 900ms
    setIsTypingReply(true);
    setTimeout(() => {
      setIsTypingReply(false);
      const responses = [
        `Yes, "${chatModalItem.title}" is in great condition! We can meet at ${chatModalItem.location || 'Central Library Foyer'} for the physical inspection.`,
        `Sure! Please feel free to reserve it on CampuShare, and we can do the OTP handshake whenever you're free on campus.`,
        `Available! I'm around the department this afternoon. You can inspect it before confirming.`,
        `Checked and functional. It helped me through my previous semester exams.`
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const sellerReply = {
        id: Date.now() + 1,
        sender: 'seller',
        name: chatModalItem.sellerName || 'Verified Senior',
        text: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => {
        const withReply = [...prev, sellerReply];
        localStorage.setItem(`campus_chat_${chatModalItem.id}`, JSON.stringify(withReply));
        return withReply;
      });
    }, 1000);
  };

  // Toggle / Update Listing Status (Admin or Seller)
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await updateListingStatusApi(item.id, newStatus);
      showToast(`Status changed to ${newStatus} for "${item.title}"`);
      fetchListings();
    } catch (err) {
      setListings((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: newStatus } : it))
      );
      if (onUpdateItemStatus) onUpdateItemStatus(item.id, newStatus);
      showToast(`Status updated to ${newStatus}`);
    }
  };

  // Delete Listing (Admin or Seller)
  const handleDeleteListing = async (item) => {
    if (!window.confirm(`Delete listing: "${item.title}"?`)) return;

    try {
      await deleteListingApi(item.id);
      showToast(`Listing "${item.title}" successfully removed.`);
      fetchListings();
    } catch (err) {
      setListings((prev) => prev.filter((it) => it.id !== item.id));
      if (onDeleteItem) onDeleteItem(item.id);
      showToast(`Listing "${item.title}" removed.`);
    }
  };

  // Handle Photo File Upload in Post Form
  const handleImageFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: uploadEvent.target.result
        }));
        showToast('Image uploaded and preview ready!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create Listing
  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const isDonation = formData.resourceType === 'DONATION';
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        resourceType: formData.resourceType,
        price: isDonation ? 0 : parseFloat(formData.price || '0'),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 500,
        condition: formData.condition,
        location: formData.location,
        hostel: formData.hostel,
        description: formData.description,
        imageUrl: formData.imageUrl
      };

      await createListingApi(payload);
      showToast('New campus resource published successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Charkhas',
        resourceType: 'SELL',
        price: '',
        originalPrice: '',
        condition: 'Good & Functional',
        location: 'Central Library Foyer',
        hostel: 'Bhadra Boys Hostel',
        description: '',
        imageUrl: EQUIPMENT_PRESETS[0].url
      });
      fetchListings();
    } catch (err) {
      // Offline fallback item creation
      const newItem = {
        id: 'local-' + Date.now(),
        title: formData.title.trim(),
        category: formData.category,
        resourceType: formData.resourceType,
        status: 'AVAILABLE',
        price: formData.resourceType === 'DONATION' ? 0 : parseFloat(formData.price || '150'),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 500,
        condition: formData.condition,
        location: formData.location,
        hostel: formData.hostel,
        description: formData.description,
        imageUrl: formData.imageUrl,
        sellerName: currentUser?.name || 'GVP Student',
        sellerRole: currentUser?.role || 'SENIOR',
        badge: formData.resourceType === 'DONATION' ? '100% Free Donation 🌿' : 'Campus Listing',
        badgeBg: formData.resourceType === 'DONATION' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700',
        createdAt: new Date().toISOString()
      };

      setListings((prev) => [newItem, ...prev]);
      setAllMasterItems((prev) => [newItem, ...prev]);
      setTotalElements((prev) => prev + 1);
      if (onAddItem) onAddItem(newItem);
      setShowAddModal(false);
      showToast('New campus resource published locally!');
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedResourceType !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    showWishlistOnly ||
    searchQuery.trim().length > 0;

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const s = (status || 'AVAILABLE').toUpperCase();
    if (s === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('statusAvailable', 'Available')}
        </span>
      );
    }
    if (s === 'RESERVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {t('statusReserved', 'Reserved')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-stone-100 text-stone-600 border border-stone-200 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
        {t('statusUnavailable', 'Unavailable')}
      </span>
    );
  };

  // Render Resource Type Badge
  const renderResourceTypeBadge = (type, price) => {
    const tStr = (type || '').toUpperCase();
    if (tStr === 'DONATION' || price === 0 || price === 'Free') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1">
          <HeartHandshake size={11} /> {t('typeDonation', 'Free Donation 🌿')}
        </span>
      );
    }
    if (tStr === 'RENT') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm flex items-center gap-1">
          <Clock size={11} /> {t('typeRent', 'For Rent ⏳')}
        </span>
      );
    }
    if (tStr === 'EXCHANGE') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm flex items-center gap-1">
          <Repeat size={11} /> {t('typeExchange', 'Exchange 🔄')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-900 text-white shadow-sm flex items-center gap-1">
        <DollarSign size={11} /> {t('typeSell', 'For Sale 🏷️')}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-fade-in border border-stone-700">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-terracotta-light text-terracotta rounded-2xl shadow-inner">
              <Package size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-serif text-stone-900 tracking-tight">
                {t('browseTitle', 'Browse Campus Resources')}
              </h1>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {t('browseSubtitle', 'Discover, share, and borrow verified academic gear across Gujarat Vidyapith')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Wishlist Toggle Button */}
          <button
            onClick={() => {
              setShowWishlistOnly((prev) => !prev);
              setCurrentPage(0);
            }}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              showWishlistOnly
                ? 'bg-rose-500 text-white shadow-rose-500/25'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Heart size={14} className={showWishlistOnly ? 'fill-current' : 'text-rose-500'} />
            <span>{t('wishlistTab', 'Saved Wishlist')}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              showWishlistOnly ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              {wishlist.length}
            </span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> {t('resetFilters', 'Reset')}
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial bg-terracotta hover:bg-terracotta-hover text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-terracotta/25 transition-all cursor-pointer"
          >
            <PlusCircle size={16} /> {t('postItemBtn', 'Post Resource')}
          </button>
        </div>
      </div>

      {/* Backend connection note */}
      {errorNotice && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <span>
            Offline Local Mode: Operating on client-synchronized campus repository. Live status updates & reservations remain functional.
          </span>
        </div>
      )}

      {/* Search & Sort Controls Bar */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96 flex items-center">
          <Search size={16} className="absolute left-3.5 text-stone-400" />
          <input
            type="text"
            placeholder={t('searchResourcesPlaceholder', 'Search resources by title, keywords, or location...')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium focus:bg-white focus:border-terracotta outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-stone-400 hover:text-stone-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 whitespace-nowrap">
            <span>{t('statusLabel', 'Status:')}</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold outline-none focus:border-terracotta cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 whitespace-nowrap">
            <ArrowUpDown size={14} />
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
                setCurrentPage(0);
              }}
              className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold outline-none focus:border-terracotta cursor-pointer"
            >
              <option value="createdAt-desc">{t('sortNewest', 'Newest First')}</option>
              <option value="price-asc">{t('sortPriceLow', 'Price: Low to High')}</option>
              <option value="price-desc">{t('sortPriceHigh', 'Price: High to Low')}</option>
              <option value="title-asc">Title: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills with Dynamic Item Counts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            {t('category', 'Category Filter')}
          </span>
          <span className="text-[11px] font-bold text-stone-500">
            {totalElements} {t('showingItems', 'items')}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {baseCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(0);
                }}
                className={`px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-stone-900/20'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Type Tabs Filter */}
      <div className="bg-white rounded-3xl p-2.5 border border-stone-200 shadow-sm flex gap-1.5 overflow-x-auto">
        {resourceTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedResourceType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => {
                setSelectedResourceType(type.id);
                setCurrentPage(0);
              }}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-terracotta text-white shadow-md shadow-terracotta/20'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Icon size={14} />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active User Reservation Quick Card (if exists) */}
      {activeReservation && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                You Have an Active Reservation
              </div>
              <div className="text-xs font-extrabold text-stone-800">
                {activeReservation.itemTitle} • Code: <span className="font-mono text-terracotta text-sm">{activeReservation.handshakeCode}</span>
              </div>
              <div className="text-[11px] text-stone-500">
                Meeting at: {activeReservation.location} with {activeReservation.sellerName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigate && (
              <button
                onClick={() => onNavigate('exchange-map')}
                className="bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <MapPin size={12} /> Safe Exchange
              </button>
            )}
            <button
              onClick={() => setReservationSuccessModal(activeReservation)}
              className="bg-white hover:bg-stone-100 border border-amber-300 text-stone-700 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              View Code
            </button>
          </div>
        </div>
      )}

      {/* Listings Grid / Loading State / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: pageSize }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm p-3 space-y-3 animate-pulse"
            >
              <div className="w-full h-44 bg-stone-200 rounded-2xl"></div>
              <div className="space-y-2 p-1">
                <div className="h-4 bg-stone-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-stone-100 rounded-md w-1/2"></div>
                <div className="h-8 bg-stone-100 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-terracotta rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-stone-800">
              {showWishlistOnly ? t('wishlistEmptyTitle', 'No saved resources yet') : t('noResourcesFoundTitle', 'No resources found')}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-medium">
              {showWishlistOnly
                ? t('wishlistEmptyDesc', 'Click the heart icon on any academic gear to save it to your wishlist.')
                : t('noResourcesFoundDesc', 'Try adjusting your category, resource type, or status filters, or post a new listing!')}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
            >
              {t('resetFilters', 'Reset Filters')}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {t('postItemBtn', 'Post New Resource')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((item) => {
            const priceVal = typeof item.price === 'number' ? item.price : item.rawPrice;
            const isFree = item.resourceType === 'DONATION' || priceVal === 0 || item.price === 'Free';
            const priceDisplay = isFree ? 'Free' : `₹${priceVal || item.price}`;

            const originalVal = typeof item.originalPrice === 'number' ? item.originalPrice : (parseInt(item.originalPrice, 10) || 0);
            const savingsAmount = originalVal && priceVal ? Math.max(0, originalVal - priceVal) : 0;
            const savingsPercent = originalVal && savingsAmount ? Math.round((savingsAmount / originalVal) * 100) : 0;

            const isAvailable = (item.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE';
            const isWishlisted = wishlist.includes(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Image & Overlay Badges */}
                  <div
                    className="relative h-48 bg-stone-100 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItemForModal(item)}
                  >
                    <img
                      src={item.imageUrl || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {renderResourceTypeBadge(item.resourceType, item.price)}
                      {savingsPercent > 0 && !isFree && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                          {savingsPercent}% {t('discountLabel', 'OFF')}
                        </span>
                      )}
                    </div>

                    {/* Top Right Actions: Wishlist Heart & Status */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(item.id, e)}
                        title={isWishlisted ? t('removeFromWishlist', 'Remove') : t('saveToWishlist', 'Save')}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                          isWishlisted
                            ? 'bg-rose-500 text-white hover:bg-rose-600 scale-110'
                            : 'bg-white/85 text-stone-600 hover:text-rose-500 hover:bg-white'
                        }`}
                      >
                        <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                      </button>
                      <div className="shadow-md">
                        {renderStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2.5">
                    <h3
                      onClick={() => setSelectedItemForModal(item)}
                      className="text-base font-extrabold text-stone-900 line-clamp-1 hover:text-terracotta cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>

                    {/* Price & Savings Row */}
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-black ${isFree ? 'text-emerald-600' : 'text-terracotta'}`}>
                          {priceDisplay}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-stone-400 line-through font-semibold">
                            {typeof item.originalPrice === 'number' ? `₹${item.originalPrice}` : item.originalPrice}
                          </span>
                        )}
                      </div>

                      {savingsAmount > 0 && !isFree && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Save ₹{savingsAmount}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-500 line-clamp-2 font-medium leading-relaxed">
                      {item.description || 'Verified academic equipment listed on Gujarat Vidyapith student marketplace.'}
                    </p>

                    {/* Item Meta Tags */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px] font-semibold text-stone-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <Tag size={13} className="text-stone-400 shrink-0" />
                          <span className="truncate">{item.category} • {item.condition || 'Good'}</span>
                        </div>
                        {/* Seller Rating Badge */}
                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                          <Star size={10} className="fill-amber-500 text-amber-500" />
                          <span>4.9</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-stone-400 shrink-0" />
                        <span className="truncate">{item.location || item.hostel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedItemForModal(item)}
                      className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>{t('viewDetails', 'Details')}</span>
                    </button>

                    {/* Direct Quick Action: Message Seller */}
                    <button
                      onClick={(e) => handleOpenChatModal(item, e)}
                      title={t('chatWithSeller', 'Message Seller')}
                      className="px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center"
                    >
                      <MessageSquare size={14} />
                    </button>

                    {/* Direct Quick Action: Reserve or Claim */}
                    {isAvailable && (
                      <button
                        onClick={() => handleReserveItem(item)}
                        title={isFree ? 'Claim Free Donation' : 'Reserve Item'}
                        className={`px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 ${
                          isFree
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-terracotta hover:bg-terracotta-hover text-white'
                        }`}
                      >
                        <Check size={14} />
                        <span className="hidden sm:inline">{isFree ? 'Claim' : 'Reserve'}</span>
                      </button>
                    )}
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-dashed border-stone-200 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-amber-700 flex items-center gap-1">
                        <ShieldAlert size={12} /> Admin
                      </span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={item.status || 'AVAILABLE'}
                          onChange={(e) => handleUpdateStatus(item, e.target.value)}
                          className="text-[10px] font-bold p-1 rounded-lg border border-stone-300 bg-stone-50"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RESERVED">Reserved</option>
                          <option value="UNAVAILABLE">Unavailable</option>
                        </select>
                        <button
                          onClick={() => handleDeleteListing(item)}
                          className="text-rose-600 hover:text-rose-800 font-bold px-1.5 py-0.5 rounded text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs font-semibold text-stone-500">
            {t('showingItems', 'Showing')} <span className="font-bold text-stone-800">{currentPage * pageSize + 1}</span> - <span className="font-bold text-stone-800">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> {t('ofItems', 'of')} <span className="font-bold text-stone-800">{totalElements}</span> {t('browseResources', 'resources')}
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                currentPage === 0
                  ? 'opacity-40 cursor-not-allowed border-stone-200 text-stone-400'
                  : 'border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer'
              }`}
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">{t('prevPage', 'Previous')}</span>
            </button>

            {/* Page Number Chips */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i;
                if (totalPages > 5 && currentPage > 2) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum >= totalPages) pageNum = totalPages - 5 + i;
                }
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                currentPage >= totalPages - 1
                  ? 'opacity-40 cursor-not-allowed border-stone-200 text-stone-400'
                  : 'border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer'
              }`}
            >
              <span className="hidden sm:inline">{t('nextPage', 'Next')}</span>
              <ChevronRight size={16} />
            </button>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="ml-2 p-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50 cursor-pointer outline-none"
            >
              <option value={8}>8 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* ===================== COMPREHENSIVE DETAIL MODAL ===================== */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                {renderResourceTypeBadge(selectedItemForModal.resourceType, selectedItemForModal.price)}
                {renderStatusBadge(selectedItemForModal.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleWishlist(selectedItemForModal.id, e)}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    wishlist.includes(selectedItemForModal.id)
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-stone-200 text-stone-500 hover:text-rose-500'
                  }`}
                >
                  <Heart size={16} className={wishlist.includes(selectedItemForModal.id) ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={() => setSelectedItemForModal(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product Hero Image */}
              <div className="h-60 rounded-2xl overflow-hidden bg-stone-100 shadow-inner relative">
                <img
                  src={selectedItemForModal.imageUrl || selectedItemForModal.image}
                  alt={selectedItemForModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag size={11} />
                  <span>Condition: {selectedItemForModal.condition || 'Good & Functional'}</span>
                </div>
              </div>

              {/* Title & Pricing Breakdown */}
              <div>
                <h2 className="text-xl font-black text-stone-900">{selectedItemForModal.title}</h2>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-2xl font-black text-terracotta">
                    {selectedItemForModal.resourceType === 'DONATION' || selectedItemForModal.price === 0 || selectedItemForModal.price === 'Free'
                      ? 'Free Donation 🌿'
                      : `₹${selectedItemForModal.price}`}
                  </span>
                  {selectedItemForModal.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      Retail: ₹{selectedItemForModal.originalPrice}
                    </span>
                  )}
                  {selectedItemForModal.originalPrice && selectedItemForModal.price && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      You Save ₹{selectedItemForModal.originalPrice - selectedItemForModal.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                <div className="font-bold text-stone-700">Detailed Description:</div>
                <p className="text-stone-600 leading-relaxed">
                  {selectedItemForModal.description || 'Verified academic equipment listed on Gujarat Vidyapith student marketplace.'}
                </p>
              </div>

              {/* Metadata Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Category & Department</span>
                  <span className="font-bold text-stone-800">{selectedItemForModal.category}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Pickup Location / Hostel</span>
                  <span className="font-bold text-stone-800">{selectedItemForModal.location || selectedItemForModal.hostel}</span>
                </div>
              </div>

              {/* Seller Trust & Campus Reputation Card */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] font-bold uppercase block">
                      {t('sellerReputationTitle', 'Seller Trust & Campus Reputation')}
                    </span>
                    <span className="font-extrabold text-stone-800 text-sm">
                      {selectedItemForModal.sellerName || 'Verified Senior Student'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs font-black">
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    <span>4.9 / 5.0 (14 reviews)</span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-600 flex items-center justify-between border-t border-blue-100 pt-2 font-medium">
                  <span className="flex items-center gap-1 text-emerald-800 font-bold">
                    <CheckCircle2 size={13} /> {t('punctualRating', '100% On-Time Handover Rate')}
                  </span>
                  <span className="text-stone-500">
                    {selectedItemForModal.sellerEmail || 'verified@gujaratvidyapith.org'}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {/* Reserve or Claim Primary Button */}
                {(selectedItemForModal.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE' ? (
                  <button
                    onClick={() => handleReserveItem(selectedItemForModal)}
                    className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-2xl font-bold text-xs shadow-md shadow-terracotta/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {selectedItemForModal.resourceType === 'DONATION' || selectedItemForModal.price === 0
                        ? t('claimDonation', 'Claim Free Donation 🌿')
                        : selectedItemForModal.resourceType === 'RENT'
                        ? t('requestRental', 'Request Rental ⏳')
                        : selectedItemForModal.resourceType === 'EXCHANGE'
                        ? t('initiateExchange', 'Initiate Exchange 🔄')
                        : `${t('reserveItem', 'Reserve Resource')} (₹${selectedItemForModal.price})`}
                    </span>
                  </button>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 bg-amber-100 text-amber-800 py-3 rounded-2xl font-bold text-xs text-center border border-amber-300 flex items-center justify-center gap-1.5">
                      <Clock size={16} />
                      <span>{t('alreadyReserved', 'Currently Reserved')}</span>
                    </div>
                    {/* Allow cancel if user made reservation */}
                    {activeReservation && String(activeReservation.itemId) === String(selectedItemForModal.id) && (
                      <button
                        onClick={() => handleCancelReservation(selectedItemForModal)}
                        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                      >
                        {t('cancelReservationBtn', 'Cancel')}
                      </button>
                    )}
                  </div>
                )}

                {/* Message Seller Button */}
                <button
                  onClick={() => handleOpenChatModal(selectedItemForModal)}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageSquare size={16} />
                  <span>{t('chatWithSeller', 'Message')}</span>
                </button>

                {/* Direct Safe Exchange Map Button */}
                {onNavigate && (
                  <button
                    onClick={() => {
                      setSelectedItemForModal(null);
                      onNavigate('exchange-map');
                    }}
                    title={t('quickExchange', 'Safe Exchange')}
                    className="px-4 bg-terracotta-light text-terracotta hover:bg-terracotta hover:text-white rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center"
                  >
                    <MapPin size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== RESERVATION CONFIRMED MODAL ===================== */}
      {reservationSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-bounce-short">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-stone-900">
                {t('reservationDetailsTitle', 'Reservation Confirmed!')}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {t('reservationCodeSubtitle', 'Show this 6-digit handshake code to the seller at the safe exchange zone:')}
              </p>
            </div>

            {/* Prominent 6-Digit Code Display */}
            <div className="bg-stone-900 text-white rounded-2xl p-5 text-center shadow-lg space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                {t('handshakeCodeLabel', 'Active Handshake OTP')}
              </div>
              <div className="text-4xl font-mono font-black tracking-widest text-emerald-400">
                {reservationSuccessModal.handshakeCode}
              </div>
              <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Protected by Gujarat Vidyapith Safe-Exchange Engine</span>
              </div>
            </div>

            {/* Meeting Summary */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs space-y-2 text-stone-700">
              <div className="flex justify-between">
                <span className="font-semibold text-stone-500">Item:</span>
                <span className="font-extrabold">{reservationSuccessModal.itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-500">Seller:</span>
                <span className="font-bold">{reservationSuccessModal.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-500">Recommended Spot:</span>
                <span className="font-bold text-amber-900">{reservationSuccessModal.location}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 text-center font-medium">
              {t('safeZoneNote', 'Meet at the designated CCTV-monitored campus safe zone during daylight hours.')}
            </p>

            <div className="flex gap-2.5 pt-1">
              {onNavigate && (
                <button
                  onClick={() => {
                    setReservationSuccessModal(null);
                    onNavigate('exchange-map');
                  }}
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MapPin size={15} />
                  <span>Go to Safe Exchange</span>
                </button>
              )}
              <button
                onClick={() => setReservationSuccessModal(null)}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PEER CHAT / INQUIRY MODAL ===================== */}
      {chatModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-fade-in flex flex-col h-[580px]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={chatModalItem.imageUrl || chatModalItem.image}
                  alt={chatModalItem.title}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900 line-clamp-1">
                    {chatModalItem.title}
                  </h3>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <span>Seller: {chatModalItem.sellerName || 'Verified Senior'}</span>
                    <span className="text-emerald-600 font-bold">• Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatModalItem(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Inquiry Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {t('quickQuestions', 'Quick Questions:')}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  'Is this still available?',
                  'Can we meet at Central Library?',
                  'Can you do a student discount?',
                  'Is everything in working order?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Message History Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
              {chatMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center text-[10px] text-stone-400 font-bold bg-white/70 py-1 px-3 rounded-full w-fit mx-auto border border-stone-200">
                      {msg.text}
                    </div>
                  );
                }

                const isMe = msg.sender === 'buyer';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-[9px] text-stone-400 font-bold mb-0.5 px-1">{msg.name}</div>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm leading-relaxed ${
                        isMe
                          ? 'bg-terracotta text-white rounded-br-sm'
                          : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-[9px] text-stone-400 mt-0.5 px-1">{msg.timestamp}</div>
                  </div>
                );
              })}

              {isTypingReply && (
                <div className="flex items-center gap-1.5 text-stone-400 text-xs italic px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse"></span>
                  <span>Senior is typing a reply...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 pt-2"
            >
              <input
                type="text"
                placeholder={t('chatPromptPlaceholder', 'Type your question or proposal...')}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className="flex-1 p-3 rounded-2xl border border-stone-200 bg-stone-50 text-xs font-medium outline-none focus:bg-white focus:border-terracotta"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="bg-terracotta hover:bg-terracotta-hover text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== POST NEW RESOURCE MODAL ===================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <PlusCircle size={20} className="text-terracotta" />
                <span>Post Campus Academic Resource</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs font-semibold">
              {/* Preset Equipment Quick Picker */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  {t('choosePresetBadge', 'Or Choose Equipment Preset Photo:')}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {EQUIPMENT_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          title: prev.title || preset.title,
                          category: preset.category,
                          imageUrl: preset.url
                        }));
                        showToast(`Selected preset: ${preset.name}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                        formData.imageUrl === preset.url
                          ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Charkha, Mini Drafter, or Kleinberg Tardos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none"
                />
              </div>

              {/* Category & Resource Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none bg-white cursor-pointer"
                  >
                    <option value="Charkhas">Traditional Charkha 🧵</option>
                    <option value="Drafters">Engineering Drafter 📐</option>
                    <option value="Lab Aprons">Lab Apron & Kit 🥼</option>
                    <option value="Books">Books & Notes 📚</option>
                    <option value="Electronics">Electronics 💻</option>
                    <option value="Hostel Needs">Hostel Needs 🎁</option>
                    <option value="Bicycles">Bicycles 🚲</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none bg-white cursor-pointer"
                  >
                    <option value="SELL">For Sale 🏷️</option>
                    <option value="DONATION">Free Donation 🌿</option>
                    <option value="RENT">For Rent / Borrow ⏳</option>
                    <option value="EXCHANGE">Item Exchange 🔄</option>
                  </select>
                </div>
              </div>

              {/* Price Fields */}
              {formData.resourceType !== 'DONATION' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Your Price (₹)</label>
                    <input
                      type="number"
                      placeholder="150"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Original Retail (₹)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Condition & Hostel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New (Used 1 Semester)">Like New (Used 1 Semester)</option>
                    <option value="Good & Functional">Good & Functional</option>
                    <option value="Fair / Usable">Fair / Usable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Campus Hostel
                  </label>
                  <select
                    value={formData.hostel}
                    onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="Bhadra Boys Hostel">Bhadra Boys Hostel</option>
                    <option value="Kasturba Girls Hostel">Kasturba Girls Hostel</option>
                    <option value="Sadra Campus Chhatralay">Sadra Campus Chhatralay</option>
                    <option value="Randheja Campus Hostel">Randheja Campus Hostel</option>
                  </select>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Pickup Safe Zone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Library Foyer or Gandhi Peace Center"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              {/* Real Photo Upload with Preview */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  {t('uploadItemPhoto', 'Upload Real Item Photo')}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-300 overflow-hidden shrink-0 shadow-inner">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="flex-1 border-2 border-dashed border-stone-300 hover:border-terracotta rounded-2xl p-3 text-center cursor-pointer bg-stone-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <UploadCloud size={20} className="mx-auto text-stone-400 mb-1" />
                    <span className="text-[11px] font-bold text-stone-600 block">
                      {t('dragDropPhoto', 'Click to choose image file from device')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Include details about item condition, included accessories..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish to Campus'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
