import React, { useState } from 'react';
import { X, Send, MapPin, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { createItemRequest } from '../utils/requestStorage';
import { createRequestApi } from '../config/api';

export default function RequestItemModal({ item, isOpen, onClose, currentUser, onRequestSuccess }) {
  const [pickupLocation, setPickupLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const defaultLocations = [
    item.location || 'Gujarat Vidyapith Central Library Gate',
    'Sadbhavna Mandap Campus Quad',
    'Hostel Block A Common Room Gate',
    'Campus Cycle Stand #1'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const chosenLocation = pickupLocation.trim() || item.location || 'Central Library Gate';
    const requestMessage = message.trim() || `Hello ${item.ownerName || 'Sharer'}, I am interested in requesting your "${item.name || item.title}". Please accept so we can coordinate campus handover.`;

    try {
      // 1. Save in local storage and create owner notification immediately
      const newRequest = createItemRequest(
        item,
        {
          pickupLocation: chosenLocation,
          message: requestMessage
        },
        currentUser
      );

      // 2. Also attempt to sync with backend API (without blocking if offline)
      try {
        await createRequestApi({
          itemId: item.id,
          requesterId: currentUser?.email || currentUser?.id || 'guest-user',
          requesterName: currentUser?.name || currentUser?.full_name || 'Campus Student',
          requesterRole: currentUser?.role || 'Junior Student',
          pickupLocation: chosenLocation,
          message: requestMessage
        });
      } catch (apiErr) {
        console.log('Backend sync skipped or offline, local request stored successfully.');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(false);
        if (onRequestSuccess) onRequestSuccess(newRequest);
        onClose();
      }, 1400);

    } catch (err) {
      setError(err.message || 'Failed to submit request');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-terracotta to-amber-700 p-5 text-white flex items-center justify-between relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h2 className="text-lg font-extrabold font-serif">Request Available Item</h2>
            </div>
            <p className="text-xs text-amber-100 font-medium mt-0.5">
              Direct peer-to-peer campus exchange between students
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Splash */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-extrabold text-stone-800">Request Sent Successfully!</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              <strong>{item.ownerName || 'The owner'}</strong> has received your request and a notification. You will be notified once they Accept or Reject.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Item Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <img
                src={item.image}
                alt={item.name || item.title}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-stone-800 truncate">{item.name || item.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-extrabold text-terracotta">{item.price}</span>
                  <span className="text-[10px] text-stone-400">•</span>
                  <span className="text-[11px] text-stone-500 font-semibold">{item.category}</span>
                </div>
                <div className="text-[11px] text-stone-500 truncate mt-0.5">
                  Owner: <strong>{item.ownerName || 'Senior'}</strong>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pickup Location Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-terracotta" />
                <span>Preferred Handover Spot</span>
              </label>
              <input
                type="text"
                placeholder={item.location || 'e.g. Central Library Gate'}
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta shadow-sm mb-2"
              />
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {defaultLocations.map((loc, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPickupLocation(loc)}
                    className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 rounded-lg font-semibold transition-all border border-stone-200"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Note / Message to Owner */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-terracotta" />
                <span>Message to Item Owner</span>
              </label>
              <textarea
                rows={3}
                placeholder="Hi, I am looking for this item for Sem 3. Can we meet today around 4:30 PM?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta shadow-sm resize-none"
              />
            </div>

            {/* Safe campus promise card */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
              <span>
                Protected under Gujarat Vidyapith student trust code. Owner receives your request instantly.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Sending Request...' : 'Send Request 🤝'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
