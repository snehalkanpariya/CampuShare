import React, { useState } from 'react';
import { Package, PlusCircle, ShieldAlert, Trash2, MapPin, Tag, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Listings({ currentUser, items, onAddItem, onDeleteItem }) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));
  
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState(null);
  const [violationReason, setViolationReason] = useState('violationReason1');
  const [successMessage, setSuccessMessage] = useState('');

  // Add Item Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Charkhas',
    condition: 'Good & Functional',
    isDonation: false,
    price: '',
    originalPrice: '',
    location: 'Central Library Foyer',
    hostel: 'Bhadra Boys Hostel',
    description: '',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  });

  const displayedItems = activeTab === 'my'
    ? items.filter((it) => it.sellerName?.toLowerCase() === currentUser?.name?.toLowerCase())
    : items;

  const handleOpenDeleteModal = (item) => {
    setSelectedItemForDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedItemForDelete) return;
    onDeleteItem(selectedItemForDelete.id, t(violationReason));
    setSuccessMessage(`${t('adminModerated', 'Rule Violation Removed')}: "${selectedItemForDelete.title}"`);
    setShowDeleteModal(false);
    setSelectedItemForDelete(null);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newItem = {
      id: Date.now(),
      title: formData.title.trim(),
      category: formData.category,
      badge: formData.isDonation ? t('donationBadge', 'Donation') : (currentUser?.role || 'GVP Student'),
      badgeBg: formData.isDonation ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-700',
      price: formData.isDonation ? 'Free' : `₹${formData.price || '150'}`,
      rawPrice: formData.isDonation ? 0 : parseInt(formData.price || '150', 10),
      originalPrice: formData.originalPrice ? `₹${formData.originalPrice}` : '₹500',
      location: formData.location,
      hostel: formData.hostel,
      condition: formData.condition,
      sellerName: currentUser?.name || 'GVP Student',
      sellerRole: currentUser?.role || 'STUDENT',
      description: formData.description,
      image: formData.image
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setFormData({
      title: '',
      category: 'Charkhas',
      condition: 'Good & Functional',
      isDonation: false,
      price: '',
      originalPrice: '',
      location: 'Central Library Foyer',
      hostel: 'Bhadra Boys Hostel',
      description: '',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    });
    setSuccessMessage('Listing created successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-terracotta-light text-terracotta rounded-2xl">
              <Package size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-serif text-stone-800">
                {t('listingsTitle', 'Campus Item Listings')}
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                {t('listingsSubtitle', 'Manage and discover reusable academic items across campus')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-terracotta hover:bg-terracotta-hover text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md shadow-terracotta/25 transition-all cursor-pointer"
        >
          <PlusCircle size={16} /> {t('postItemBtn', 'Post New Campus Item')}
        </button>
      </div>

      {/* Audit / Success Toast */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 border-b border-stone-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          {t('allListingsTab', 'All Campus Listings')} ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          {t('myListingsTab', 'My Listed Items')}
        </button>
      </div>

      {/* Listings Grid */}
      {displayedItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 font-bold text-sm">
          {t('noListingsFound', 'No listings found in this category.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${item.badgeBg}`}>
                    {item.badge}
                  </span>

                  {/* Admin Authority Moderation Ribbon */}
                  {isAdmin && (
                    <span className="absolute top-3 right-3 bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldAlert size={12} /> Admin Auth
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-extrabold text-stone-800 line-clamp-1">{item.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-terracotta">{item.price}</span>
                    <span className="text-xs text-stone-400 line-through font-semibold">{item.originalPrice}</span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 font-medium">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px] font-semibold text-stone-500">
                    <div className="flex items-center gap-1">
                      <Tag size={13} className="text-stone-400" /> {item.category} • {item.condition}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-stone-400" /> {item.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                {/* Admin Authority Delete Button */}
                {isAdmin ? (
                  <button
                    onClick={() => handleOpenDeleteModal(item)}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 size={14} /> {t('deleteViolation', 'Remove Violation')}
                  </button>
                ) : (
                  <button className="w-full bg-stone-900 hover:bg-stone-800 text-white py-2 rounded-xl font-bold text-xs shadow-md transition-all">
                    {t('safeExchangeBtn', 'Safe Exchange')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN VIOLATION DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedItemForDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-100 rounded-2xl">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900">
                    {t('adminDeleteModalTitle', 'Admin Rule Violation Removal')}
                  </h3>
                  <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">Campus Authority Control</span>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs font-semibold space-y-1">
              <div className="text-stone-500">Target Item:</div>
              <div className="font-extrabold text-stone-900 text-sm">"{selectedItemForDelete.title}"</div>
              <div className="text-stone-500">Seller: {selectedItemForDelete.sellerName} ({selectedItemForDelete.location})</div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                {t('adminDeletePrompt', 'Select Policy Violation Reason:')}
              </label>
              <select
                value={violationReason}
                onChange={(e) => setViolationReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold outline-none focus:border-rose-500 bg-white"
              >
                <option value="violationReason1">{t('violationReason1', 'Prohibited Commercial Resale / Scalping')}</option>
                <option value="violationReason2">{t('violationReason2', 'Counterfeit or Damaged Academic Gear')}</option>
                <option value="violationReason3">{t('violationReason3', 'Inappropriate / Off-Topic Listing')}</option>
                <option value="violationReason4">{t('violationReason4', 'Misleading Price or False Description')}</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>This listing will be permanently purged from the marketplace with an administrative record.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {t('confirmDelete', 'Confirm & Delete Violation')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW LISTING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <PlusCircle size={20} className="text-terracotta" />
                {t('postItemModalTitle', 'List an Academic Item')}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  {t('itemTitle', 'Item Title')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('itemTitlePlaceholder', 'e.g. Traditional Gandhi Charkha or Engineering Drafter')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    {t('category', 'Category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none bg-white"
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
                    {t('condition', 'Condition')}
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-terracotta outline-none bg-white"
                  >
                    <option value="Brand New">{t('conditionNew', 'Brand New')}</option>
                    <option value="Like New (Used 1 Semester)">{t('conditionLikeNew', 'Like New (Used 1 Semester)')}</option>
                    <option value="Good & Functional">{t('conditionGood', 'Good & Functional')}</option>
                    <option value="Fair / Usable">{t('conditionFair', 'Fair / Usable')}</option>
                  </select>
                </div>
              </div>

              {/* Donation Toggle & Price */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDonation}
                    onChange={(e) => setFormData({ ...formData, isDonation: e.target.checked })}
                    className="rounded text-terracotta"
                  />
                  <span className="font-bold text-stone-800">{t('freeDonation', '100% Free Donation 🌿')}</span>
                </label>

                {!formData.isDonation && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">{t('fixedPrice', 'Price (₹)')}</label>
                      <input
                        type="number"
                        placeholder="250"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">Retail Price (₹)</label>
                      <input
                        type="number"
                        placeholder="650"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Hostel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    {t('pickupLocation', 'Pickup Location')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Central Library Foyer"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
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
                  {t('description', 'Description')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('descriptionPlaceholder', 'Provide details about condition, included accessories...')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {t('submitListing', 'Publish Listing')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
