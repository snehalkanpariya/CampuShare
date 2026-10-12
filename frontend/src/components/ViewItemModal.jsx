import React, { useState } from 'react';
import { 
  X, MapPin, ShieldCheck, Edit3, Trash2, Tag, Clock, 
  AlertTriangle, Shield, Check, Send, CheckCircle2, MessageSquare, ArrowRight 
} from 'lucide-react';
import RequestItemModal from './RequestItemModal';
import { findRequestForItem } from '../utils/requestStorage';

export default function ViewItemModal({ item, isOpen, onClose, currentUser, onEdit, onDelete, onNavigate }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [localRefreshTick, setLocalRefreshTick] = useState(0);
  const [showRequestMsg, setShowRequestMsg] = useState(false);

  if (!isOpen || !item) return null;

  // Accurate ownership check: only owner if user ID, email, or exact name matches
  const isOwner = currentUser && (
    (currentUser.id && item.ownerId && currentUser.id === item.ownerId) ||
    (currentUser.email && item.ownerId && currentUser.email === item.ownerId) ||
    (currentUser.name && item.ownerName && currentUser.name.toLowerCase() === item.ownerName.toLowerCase()) ||
    (currentUser.full_name && item.ownerName && currentUser.full_name.toLowerCase() === item.ownerName.toLowerCase())
  );

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'New': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Like New': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fair': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  const getAvailabilityColor = (avail) => {
    switch (avail) {
      case 'Available': return 'bg-emerald-500 text-white';
      case 'Reserved': return 'bg-amber-500 text-white';
      case 'Claimed / Unavailable': return 'bg-rose-500 text-white';
      default: return 'bg-stone-500 text-white';
    }
  };

  const handleDeleteClick = () => {
    if (showConfirmDelete) {
      onDelete(item.id);
      setShowConfirmDelete(false);
      onClose();
    } else {
      setShowConfirmDelete(true);
    }
  };

  const existingRequest = findRequestForItem(item.id, currentUser);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Image Preview */}
        <div className="relative h-60 sm:h-64 bg-stone-900 overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.name || item.title}
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-black/30" />
          
          {/* Top-Right Clean Icon-Only X Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-stone-900/80 hover:bg-stone-950 text-white rounded-full transition-all backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 focus:outline-none z-10"
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${getAvailabilityColor(item.availability)}`}>
              {item.availability || 'Available'}
            </span>
            <span className="bg-white/95 backdrop-blur-md text-stone-800 px-3 py-1 rounded-full text-xs font-extrabold shadow-md">
              {item.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl font-extrabold line-clamp-1 drop-shadow-md">
              {item.name || item.title}
            </h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-300 drop-shadow-sm">
                {item.price}
              </span>
              {item.originalPrice && item.price !== 'Free' && (
                <span className="text-xs text-stone-300 line-through font-semibold">
                  Original: {item.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Key Attributes Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getConditionColor(item.condition)} flex items-center gap-1.5`}>
              <Tag size={13} />
              <span>Condition: <strong>{item.condition || 'Good'}</strong></span>
            </div>

            <div className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1.5">
              <MapPin size={13} className="text-terracotta" />
              <span>{item.location || 'Gujarat Vidyapith Campus'}</span>
            </div>

            {item.createdAt && (
              <div className="px-3 py-1 rounded-full text-xs font-medium text-stone-500 flex items-center gap-1.5 ml-auto">
                <Clock size={13} />
                <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">Description</h4>
            <p className="text-xs sm:text-sm font-medium text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              {item.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Sharer Details & Safe Exchange Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                  {(item.ownerName || 'S').charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-stone-800">{item.ownerName || 'Rahul Sharma'}</span>
                    <ShieldCheck size={16} className="text-emerald-600" title="Verified Gujarat Vidyapith Student" />
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">
                    {item.ownerRole || 'Senior (4th Year)'} • GVP Verified
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                  <Shield size={12} className="text-emerald-700" />
                  <span>Campus Safe Exchange</span>
                </span>
              </div>
            </div>

            {/* Safe Exchange Guarantees */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-emerald-900 font-semibold border-t border-emerald-200/70">
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span>Zero Scams • Campus ID Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-emerald-600 shrink-0" />
                <span>Public Campus Handover Spots</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="pt-2">
            {isOwner ? (
              /* OWNER ACTIONS */
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold text-center">
                  👑 You listed this item ({currentUser?.name || 'Rahul Sharma'})
                </div>

                {showConfirmDelete && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs font-bold text-red-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      <span>Are you sure you want to delete this listing?</span>
                    </div>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="text-stone-500 hover:text-stone-800 underline text-xs ml-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onEdit(item);
                      onClose();
                    }}
                    className="flex-1 py-3 rounded-xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center gap-2 transition-all border border-stone-200"
                  >
                    <Edit3 size={15} className="text-terracotta" />
                    <span>Edit Listing</span>
                  </button>

                  <button
                    onClick={handleDeleteClick}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                      showConfirmDelete 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    <Trash2 size={15} />
                    <span>{showConfirmDelete ? 'Confirm Delete' : 'Delete Listing'}</span>
                  </button>
                </div>
              </div>
            ) : (() => {
              /* NON-OWNER / JUNIOR / SENIOR REQUESTER ACTIONS */
              
              if (existingRequest && existingRequest.status === 'PENDING') {
                return (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-amber-800 font-extrabold text-xs">
                      <Clock size={16} className="text-amber-600 animate-pulse" />
                      <span>Request Sent • Pending Owner Review</span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium">
                      You requested this item for pickup at <strong>{existingRequest.pickupLocation}</strong>. Waiting for {item.ownerName || 'Rahul'} to Accept or Decline.
                    </p>
                    {existingRequest.message && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowRequestMsg(!showRequestMsg)}
                          className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline inline-flex items-center gap-1"
                        >
                          <MessageSquare size={12} className="text-terracotta" />
                          <span>{showRequestMsg ? 'Hide Msg ✕' : 'View Msg 💬'}</span>
                        </button>
                        {showRequestMsg && (
                          <div className="mt-1.5 p-2.5 bg-white rounded-xl border border-amber-300 text-xs italic text-stone-700 animate-in fade-in duration-150 text-left">
                            "{existingRequest.message}"
                          </div>
                        )}
                      </div>
                    )}
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('requests');
                        }}
                        className="text-xs font-bold text-amber-900 hover:text-amber-950 underline mt-1 inline-flex items-center gap-1"
                      >
                        <span>Track in My Requests & Exchanges</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                );
              }

              if (existingRequest && existingRequest.status === 'ACCEPTED') {
                return (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-xs">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>🎉 Request Accepted! Ready for Campus Handover</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Meeting spot: <strong>{existingRequest.pickupLocation}</strong>. Chat is open with {item.ownerName || 'owner'}.
                    </p>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('requests');
                        }}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
                      >
                        <MessageSquare size={14} />
                        <span>Coordinate Pickup in Chat →</span>
                      </button>
                    )}
                  </div>
                );
              }

              if (existingRequest && existingRequest.status === 'COMPLETED') {
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-center text-xs font-bold text-blue-800 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600" />
                    <span>🤝 Exchange Completed! Item successfully handed over.</span>
                  </div>
                );
              }

              if (item.availability === 'Reserved') {
                return (
                  <div className="bg-stone-100 border border-stone-300 rounded-2xl p-4 text-center space-y-1">
                    <div className="text-xs font-bold text-stone-700">⏳ Currently Reserved</div>
                    <p className="text-[11px] text-stone-500">
                      Another student has requested this item and the owner accepted.
                    </p>
                  </div>
                );
              }

              if (item.availability === 'Claimed / Unavailable') {
                return (
                  <div className="bg-stone-100 border border-stone-300 rounded-2xl p-4 text-center space-y-1">
                    <div className="text-xs font-bold text-stone-700">❌ Item Already Claimed</div>
                    <p className="text-[11px] text-stone-500">
                      This item was successfully exchanged and re-homed.
                    </p>
                  </div>
                );
              }

              // ITEM IS AVAILABLE -> PROMINENT "REQUEST THIS ITEM" CTA
              return (
                <div className="space-y-2.5">
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-terracotta via-amber-700 to-terracotta hover:opacity-95 shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <Send size={16} />
                    <span>Request This Item 🤝</span>
                  </button>
                  <p className="text-center text-[11px] text-stone-500 font-medium">
                    Junior & Senior students can request available items. Owner will be notified instantly!
                  </p>
                </div>
              );
            })()}
          </div>

        </div>

      </div>

      {/* Step 2: Request Item Modal */}
      <RequestItemModal
        item={item}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        onRequestSuccess={() => {
          setIsRequestModalOpen(false);
          setLocalRefreshTick(t => t + 1);
        }}
      />
    </div>
  );
}
