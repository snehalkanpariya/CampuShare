import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Image as ImageIcon, Check } from 'lucide-react';
import { PRESET_IMAGES, resolveImageForItem } from '../utils/itemStorage';

export default function AddItemModal({ isOpen, onClose, onSave, editItem = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Books',
    condition: 'Good',
    availability: 'Available',
    price: '',
    originalPrice: '',
    isFree: false,
    location: '',
    image: ''
  });

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'presets' | 'custom'

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || editItem.title || '',
        description: editItem.description || '',
        category: editItem.category || 'Books',
        condition: editItem.condition || 'Good',
        availability: editItem.availability || 'Available',
        price: editItem.price === 'Free' ? '' : editItem.price?.replace('₹', '') || '',
        originalPrice: editItem.originalPrice?.replace('₹', '') || '',
        isFree: editItem.price === 'Free',
        location: editItem.location || '',
        image: editItem.image || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'Books',
        condition: 'Good',
        availability: 'Available',
        price: '',
        originalPrice: '',
        isFree: false,
        location: '',
        image: ''
      });
    }
    setError('');
    setActiveTab('auto');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const categories = [
    'Books',
    'Notes',
    'Last Year Papers',
    'Charkha & Crafts',
    'Projects',
    'Electronics',
    'Hostel Needs',
    'Bicycles',
    'Stationery',
    'Other'
  ];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const availabilities = ['Available', 'Reserved', 'Claimed / Unavailable'];

  // Smart resolved image preview
  const previewImage = resolveImageForItem(formData.name, formData.category, formData.image);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide an Item Name.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a brief description.');
      return;
    }
    if (!formData.isFree && !formData.price.trim()) {
      setError('Please enter a price or check "Giving Away For Free".');
      return;
    }

    const payload = {
      ...formData,
      image: previewImage
    };

    if (editItem) {
      payload.id = editItem.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Icon-Only X Cancel Button (No Word Text) */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
              <Sparkles className="text-terracotta" size={20} />
              {editItem ? 'Edit Listed Item' : 'Share / Add New Item'}
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {editItem ? 'Update your item attributes and availability' : 'Help fellow campus members by sharing or listing items'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-all focus:outline-none"
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2 shrink-0">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          
          {/* Item Name */}
          <div>
            <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
              Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Traditional Charkha Craft, Last Year Exam Papers, GATE CS Notes, Arduino Project..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all"
              required
            />
          </div>

          {/* Category & Condition Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 bg-white"
              >
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              placeholder="Provide details about condition, semester, edition, accessories included, or pickup points..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all resize-none"
              required
            />
          </div>

          {/* Availability & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Availability *
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 bg-white"
              >
                {availabilities.map(avail => (
                  <option key={avail} value={avail}>{avail}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Campus Location
              </label>
              <input
                type="text"
                placeholder="e.g. Central Library / Hostel Block A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </div>
          </div>

          {/* Price & Free option */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">Pricing</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                  className="rounded text-terracotta focus:ring-terracotta w-4 h-4"
                />
                <span className="text-xs font-extrabold text-emerald-700">Give Away For FREE / Gift 🎁</span>
              </label>
            </div>

            {!formData.isFree && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="650"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interactive Item Photo Selection */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-terracotta" />
                Item Cover Photo
              </label>
              
              <div className="flex bg-white rounded-lg p-0.5 border border-stone-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('auto')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'auto' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Auto Match
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'presets' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'custom' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  URL
                </button>
              </div>
            </div>

            {/* Live Image Preview & Selector */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-20 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-300 shadow-sm">
                <img
                  src={previewImage}
                  alt="Item Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              </div>

              <div className="flex-1 text-xs text-stone-600 font-medium">
                {activeTab === 'auto' && (
                  <p className="text-[11px] text-stone-600 leading-snug">
                    ✨ <strong>Smart Auto-Match Active</strong>: Auto-detects cover photos for Charkha crafts, last year papers, notes, laptops, & projects based on your item name.
                  </p>
                )}

                {activeTab === 'custom' && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-terracotta bg-white"
                  />
                )}

                {activeTab === 'presets' && (
                  <p className="text-[11px] text-stone-500">Choose a preset photo from the gallery below:</p>
                )}
              </div>
            </div>

            {/* Preset Thumbnails Grid */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-4 gap-2 pt-2 max-h-36 overflow-y-auto pr-1">
                {PRESET_IMAGES.map((preset) => {
                  const isSelected = formData.image === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all group text-left ${
                        isSelected ? 'border-terracotta ring-2 ring-terracotta/30' : 'border-stone-200 hover:border-amber-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-all" />
                      <span className="absolute bottom-0.5 left-1 text-[9px] font-extrabold text-white line-clamp-1 drop-shadow-sm">
                        {preset.title}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-terracotta text-white p-0.5 rounded-full">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all border border-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-terracotta hover:bg-terracotta-hover shadow-md transition-all"
            >
              {editItem ? 'Save Changes' : 'Publish Item Listing'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
