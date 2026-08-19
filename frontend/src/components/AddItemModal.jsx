import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { getDefaultImageForCategory } from '../utils/itemStorage';

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
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const categories = ['Books', 'Electronics', 'Stationery', 'Bicycles', 'Hostel Needs', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const availabilities = ['Available', 'Reserved', 'Claimed / Unavailable'];

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
      image: formData.image.trim() || getDefaultImageForCategory(formData.category)
    };

    if (editItem) {
      payload.id = editItem.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Close Button */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
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
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-full transition-all flex items-center gap-1 border border-stone-200"
            title="Close Window"
          >
            <X size={16} />
            <span>Close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Item Name */}
          <div>
            <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
              Item Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering Physics Textbook 1st Year"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              placeholder="Provide details about condition, edition, accessories included, or campus pickup points..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all resize-none"
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
                <span className="text-xs font-extrabold text-emerald-700">Give Away For FREE 🎁</span>
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

          {/* Image URL */}
          <div>
            <label className="block text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-1">
              Image URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:border-terracotta"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Leave empty to use category default illustration.</p>
          </div>

          {/* Buttons with explicit Close option */}
          <div className="flex gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all border border-stone-200 flex items-center justify-center gap-1.5"
            >
              <X size={15} />
              <span>Close / Cancel</span>
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
