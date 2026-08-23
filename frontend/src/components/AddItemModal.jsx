import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Image as ImageIcon, Check, Upload, Link as LinkIcon } from 'lucide-react';
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
  const [activePhotoTab, setActivePhotoTab] = useState('upload'); // 'upload' | 'gallery' | 'url'

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
    setActivePhotoTab('upload');
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

  // Handle local file upload (device image selection)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Current image preview (user uploaded file/URL, chosen preset, or fallback)
  const currentPreview = formData.image.trim() || resolveImageForItem('', formData.category, '');

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
      image: currentPreview
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

          {/* Manual Product Image Selection & File Upload */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={15} className="text-terracotta" />
                Product Image (Upload / Choose Photo)
              </label>

              {/* Mode Tabs */}
              <div className="flex bg-white rounded-lg p-0.5 border border-stone-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('upload')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    activePhotoTab === 'upload' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Upload size={12} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('gallery')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    activePhotoTab === 'gallery' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon size={12} />
                  <span>Photo Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('url')}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    activePhotoTab === 'url' ? 'bg-terracotta text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LinkIcon size={12} />
                  <span>Web Link</span>
                </button>
              </div>
            </div>

            {/* Main Upload / Selector Controls */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-20 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-300 shadow-sm">
                <img
                  src={currentPreview}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  Preview
                </span>
              </div>

              <div className="flex-1 text-xs">
                {activePhotoTab === 'upload' && (
                  <div className="space-y-1.5">
                    <label className="block cursor-pointer bg-white hover:bg-stone-100 text-stone-800 border border-dashed border-stone-300 rounded-xl p-3 text-center transition-all">
                      <Upload size={16} className="mx-auto text-terracotta mb-1" />
                      <span className="font-bold text-xs">Choose Image File from Computer</span>
                      <span className="block text-[10px] text-stone-400">JPG, PNG, WebP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {activePhotoTab === 'url' && (
                  <div className="space-y-1">
                    <span className="block font-semibold text-stone-700 text-[11px]">Paste Image URL from any website:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-mono focus:outline-none focus:border-terracotta"
                    />
                  </div>
                )}

                {activePhotoTab === 'gallery' && (
                  <span className="block font-semibold text-stone-700 text-[11px]">Click a photo from the gallery below:</span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnail Grid */}
            {activePhotoTab === 'gallery' && (
              <div className="grid grid-cols-5 gap-1.5 max-h-24 overflow-y-auto pt-1 pr-1 border-t border-stone-200/60">
                {PRESET_IMAGES.map((preset) => {
                  const isSelected = formData.image === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`relative h-10 rounded-lg overflow-hidden border transition-all ${
                        isSelected ? 'border-terracotta ring-2 ring-terracotta/30' : 'border-stone-200 hover:border-amber-400'
                      }`}
                      title={preset.title}
                    >
                      <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 bg-terracotta text-white p-0.5 rounded-full">
                          <Check size={8} />
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
