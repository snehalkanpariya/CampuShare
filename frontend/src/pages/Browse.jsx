import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Package,
  RotateCcw,
  Sparkles,
  MapPin,
  Tag,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  DollarSign,
  HeartHandshake,
  Repeat
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getListingsApi,
  createListingApi,
  updateListingStatusApi,
  deleteListingApi
} from '../config/api';
import { INITIAL_CAMPUS_ITEMS } from '../data/mockItems';

export default function Browse({ currentUser, onNavigate }) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedResourceType, setSelectedResourceType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
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
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Listing Form
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
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  });

  const categories = [
    { id: 'All', label: t('allCategories', 'All Categories') },
    { id: 'Charkhas', label: t('catCharkha', 'Traditional Charkha 🧵') },
    { id: 'Drafters', label: t('catDrafter', 'Engineering Drafter 📐') },
    { id: 'Lab Aprons', label: t('catApron', 'Lab Apron & Kit 🥼') },
    { id: 'Books', label: t('catBooks', 'Books & Notes 📚') },
    { id: 'Electronics', label: t('catElectronics', 'Electronics 💻') },
    { id: 'Hostel Needs', label: t('catHostel', 'Hostel Needs 🎁') },
    { id: 'Bicycles', label: t('catBicycles', 'Bicycles 🚲') },
  ];

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

  // Fetch listings from backend API
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
        setListings(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setListings(data);
        setTotalPages(1);
        setTotalElements(data.length);
      }
    } catch (err) {
      console.warn('Backend API request fallback to client-side data:', err.message);
      setErrorNotice(err.message);

      // Graceful offline fallback filtering using INITIAL_CAMPUS_ITEMS
      let filtered = [...INITIAL_CAMPUS_ITEMS];

      if (selectedCategory !== 'All') {
        filtered = filtered.filter(item =>
          item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      if (selectedResourceType !== 'ALL') {
        if (selectedResourceType === 'DONATION') {
          filtered = filtered.filter(item => item.price === 'Free' || item.rawPrice === 0);
        } else if (selectedResourceType === 'SELL') {
          filtered = filtered.filter(item => item.price !== 'Free' && item.rawPrice > 0);
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q))
        );
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
  }, [selectedCategory, selectedResourceType, selectedStatus, searchQuery, currentPage, pageSize, sortBy, sortDir]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedResourceType('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setCurrentPage(0);
    setSortBy('createdAt');
    setSortDir('desc');
  };

  // Toggle or Update Item Status
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await updateListingStatusApi(item.id, newStatus);
      showToast(`Status changed to ${newStatus} for "${item.title}"`);
      fetchListings();
    } catch (err) {
      // Local state fallback update
      setListings(prev =>
        prev.map(it => it.id === item.id ? { ...it, status: newStatus } : it)
      );
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
      setListings(prev => prev.filter(it => it.id !== item.id));
      showToast(`Listing "${item.title}" removed.`);
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
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
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
        sellerRole: currentUser?.role || 'STUDENT',
        badge: formData.resourceType === 'DONATION' ? '100% Free Donation 🌿' : 'Campus Listing',
        badgeBg: formData.resourceType === 'DONATION' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700',
        createdAt: new Date().toISOString()
      };

      setListings(prev => [newItem, ...prev]);
      setTotalElements(prev => prev + 1);
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
    searchQuery.trim().length > 0;

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const s = (status || 'AVAILABLE').toUpperCase();
    if (s === 'AVAILABLE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('statusAvailable', 'Available')}
        </span>
      );
    }
    if (s === 'RESERVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {t('statusReserved', 'Reserved')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-stone-100 text-stone-600 border border-stone-200">
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
          <HeartHandshake size={11} /> {t('typeDonation', 'Free Donation')}
        </span>
      );
    }
    if (tStr === 'RENT') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm flex items-center gap-1">
          <Clock size={11} /> {t('typeRent', 'For Rent')}
        </span>
      );
    }
    if (tStr === 'EXCHANGE') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-sm flex items-center gap-1">
          <Repeat size={11} /> {t('typeExchange', 'Exchange')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-800 text-white shadow-sm flex items-center gap-1">
        <DollarSign size={11} /> {t('typeSell', 'For Sale')}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={18} />
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

        <div className="flex items-center gap-3 w-full md:w-auto">
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

      {/* Backend connection notice (if using offline mock fallback) */}
      {errorNotice && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <span>
            API Gateway note: Running on client-fallback cache. Start backend services (`api-gateway` on 8080 or `auth-service` on 8081) for live MongoDB queries.
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
            className="w-full pl-9 pr-9 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium focus:bg-white focus:border-terracotta outline-none transition-all"
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
              {statuses.map(s => (
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

      {/* Category Filter Pills */}
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
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-stone-900/20'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
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

      {/* Listings Grid / Loading State / Empty State */}
      {loading ? (
        /* LOADING SKELETON STATE */
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
        /* EMPTY STATE */
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-terracotta rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-stone-800">
              {t('noResourcesFoundTitle', 'No resources found matching your criteria')}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-medium">
              {t('noResourcesFoundDesc', 'Try adjusting your category, resource type, or status filters, or post a new listing!')}
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
        /* RESOURCE LISTINGS GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((item) => {
            const priceDisplay =
              item.resourceType === 'DONATION' || item.price === 0 || item.price === 'Free'
                ? 'Free'
                : typeof item.price === 'number'
                ? `₹${item.price}`
                : item.price;

            const isAvailable = (item.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image & Badges */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setSelectedItemForModal(item)}>
                    <img
                      src={item.imageUrl || item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Left Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      {renderResourceTypeBadge(item.resourceType, item.price)}
                      {item.badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm ${item.badgeBg || 'bg-white/90 text-stone-800'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Top Right Status Pill */}
                    <div className="absolute top-3 right-3 shadow-md">
                      {renderStatusBadge(item.status)}
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

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xl font-black ${priceDisplay === 'Free' ? 'text-emerald-600' : 'text-terracotta'}`}>
                        {priceDisplay}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-stone-400 line-through font-semibold">
                          {typeof item.originalPrice === 'number' ? `₹${item.originalPrice}` : item.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-500 line-clamp-2 font-medium leading-relaxed">
                      {item.description || 'No detailed description provided for this campus resource.'}
                    </p>

                    {/* Item Meta Tags */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px] font-semibold text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Tag size={13} className="text-stone-400 shrink-0" />
                        <span className="truncate">{item.category} • {item.condition || 'Good'}</span>
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
                      className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                    >
                      {t('viewDetails', 'View Details')}
                    </button>

                    {isAvailable && onNavigate && (
                      <button
                        onClick={() => onNavigate('exchange-map')}
                        title={t('quickExchange', 'Safe Exchange')}
                        className="px-3 bg-terracotta-light text-terracotta hover:bg-terracotta hover:text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                      >
                        <MapPin size={14} />
                      </button>
                    )}
                  </div>

                  {/* Admin or Authority Controls */}
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
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
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

      {/* DETAIL MODAL */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                {renderResourceTypeBadge(selectedItemForModal.resourceType, selectedItemForModal.price)}
                {renderStatusBadge(selectedItemForModal.status)}
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="h-56 rounded-2xl overflow-hidden bg-stone-100 shadow-inner">
                <img
                  src={selectedItemForModal.imageUrl || selectedItemForModal.image}
                  alt={selectedItemForModal.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-xl font-black text-stone-900">{selectedItemForModal.title}</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-terracotta">
                    {selectedItemForModal.resourceType === 'DONATION' || selectedItemForModal.price === 0 || selectedItemForModal.price === 'Free'
                      ? 'Free Donation'
                      : `₹${selectedItemForModal.price}`}
                  </span>
                  {selectedItemForModal.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      Retail: ₹{selectedItemForModal.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                <div className="font-bold text-stone-700">Description:</div>
                <p className="text-stone-600 leading-relaxed">
                  {selectedItemForModal.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Category & Condition</span>
                  <span className="font-bold text-stone-800">{selectedItemForModal.category} • {selectedItemForModal.condition || 'Good'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Pickup Location</span>
                  <span className="font-bold text-stone-800">{selectedItemForModal.location || selectedItemForModal.hostel}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Seller / Lister</span>
                  <span className="font-bold text-stone-800">{selectedItemForModal.sellerName || 'Campus Student'}</span>
                  {selectedItemForModal.sellerEmail && (
                    <span className="text-[11px] text-stone-500 block">{selectedItemForModal.sellerEmail}</span>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                  {selectedItemForModal.sellerRole || 'GVP Student'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                {onNavigate && (
                  <button
                    onClick={() => {
                      setSelectedItemForModal(null);
                      onNavigate('exchange-map');
                    }}
                    className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={16} />
                    <span>Proceed to Safe Exchange Point</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedItemForModal(null)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST NEW RESOURCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <PlusCircle size={20} className="text-terracotta" />
                <span>Post Campus Academic Resource</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gandhi Charkha, Mini Drafter, or Kleinberg Tardos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none"
                />
              </div>

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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Library Foyer or Gandhi Bhavan"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

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
