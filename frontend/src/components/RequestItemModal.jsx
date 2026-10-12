import React, { useState } from 'react';
import { 
  X, Send, MapPin, ShieldCheck, CheckCircle2, 
  MessageSquare, AlertCircle, Clock, Calendar, Sparkles, User 
} from 'lucide-react';
import { createItemRequest } from '../utils/requestStorage';
import { createRequestApi } from '../config/api';

export default function RequestItemModal({ item, isOpen, onClose, currentUser, onRequestSuccess }) {
  const [pickupLocation, setPickupLocation] = useState('');
  const [urgency, setUrgency] = useState('Today afternoon');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const defaultLocations = [
    item.location || 'Central Library Gate',
    'Sadbhavna Mandap Campus Quad',
    'Hostel Block A Main Gate',
    'Campus Cycle Stand #1',
    'Charkha Bhavan Eco Room'
  ];

  const timingOptions = [
    'Today afternoon (4:00 PM)',
    'Tomorrow during lunch break',
    'This weekend',
    'Flexible / Anytime'
  ];

  const quickMessageSuggestions = [
    'Need these for upcoming semester exams & revisions.',
    'Working on MCA software lab project, can pickup today.',
    'Can meet near hostel gate after 4 PM.',
    'Very interested in campus reuse & circular sharing.'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const chosenLocation = pickupLocation.trim() || item.location || 'Central Library Gate';
    const requestMessage = message.trim() || 
      `Hello ${item.ownerName || 'Senior'}, I am requesting your "${item.name || item.title}". Available to meet at ${chosenLocation}.`;

    try {
      // 1. Create locally in storage and dispatch real-time NEW_REQUEST notification to owner
      const newRequest = createItemRequest(
        item,
        {
          pickupLocation: chosenLocation,
          urgency: urgency,
          message: requestMessage
        },
        currentUser
      );

      // 2. Also attempt to sync with backend API Gateway (without failing offline)
      try {
        await createRequestApi({
          itemId: item.id,
          requesterId: currentUser?.id || currentUser?.email || 'user-junior-1',
          requesterName: currentUser?.name || currentUser?.full_name || 'Aarav Shah',
          requesterRole: currentUser?.role || 'Junior (1st Year)',
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
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to submit request');
      setIsSubmitting(false);
    }
  };

  const requesterName = currentUser?.name || currentUser?.full_name || 'Aarav Shah';
  const requesterRole = currentUser?.role || 'Junior (1st Year)';

  return (
    <div
      className="fixed inset-0 z-[120] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-terracotta via-amber-700 to-terracotta p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h2 className="text-lg font-extrabold font-serif">Request Available Item</h2>
            </div>
            <p className="text-[11px] text-amber-100 font-medium mt-0.5">
              Step 2 • Direct Peer-to-Peer Handover Request
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

        {/* Success Screen */}
        {success ? (
          <div className="p-8 sm:p-10 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-extrabold text-stone-800">Request Sent Successfully! 🤝</h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              <strong>{item.ownerName || 'Rahul Sharma'}</strong> has received your request and an instant notification.
              You will be alerted as soon as they <strong>Accept or Decline</strong>.
            </p>
            <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-200">
              🔔 Notification dispatched to owner's inbox
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            
            {/* Item Summary Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <img
                src={item.image}
                alt={item.name || item.title}
                className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-stone-800 truncate">{item.name || item.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-extrabold text-terracotta">{item.price}</span>
                  <span className="text-[10px] text-stone-400">•</span>
                  <span className="text-[11px] text-stone-500 font-semibold">{item.category}</span>
                </div>
                <div className="text-[11px] text-stone-600 truncate mt-1">
                  Sharer: <strong>{item.ownerName || 'Rahul Sharma'}</strong> ({item.ownerRole || 'Senior'})
                </div>
              </div>
            </div>

            {/* Requesting As Badge */}
            <div className="flex items-center justify-between p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-medium">
                <User size={15} className="text-amber-700 shrink-0" />
                <span>Requesting as: <strong>{requesterName}</strong></span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                {requesterRole}
              </span>
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
                <span>Preferred Campus Handover Spot</span>
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
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                      pickupLocation === loc
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-200'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposed Meetup Timing */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-terracotta" />
                <span>Proposed Meetup Timing</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timingOptions.map((opt, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setUrgency(opt)}
                    className={`text-[11px] p-2 text-left rounded-xl font-semibold transition-all border ${
                      urgency === opt
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Note / Message to Owner */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-terracotta" />
                <span>Message Note to Item Owner</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickMessageSuggestions.map((sug, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setMessage(sug)}
                    className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 rounded-md font-medium transition-all border border-stone-200 text-left line-clamp-1"
                  >
                    "{sug.substring(0, 35)}..."
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Hi, I am looking for this item for Sem 3 coursework. Can we meet today around 4:30 PM?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta shadow-sm resize-none"
              />
            </div>

            {/* Gujarat Vidyapith Trust Code */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
              <span className="text-[11px]">
                Protected under Gujarat Vidyapith Student Trust Code. Both junior and senior verified accounts ensure a safe campus handover.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
