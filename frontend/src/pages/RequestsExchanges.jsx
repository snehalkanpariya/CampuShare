import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, MapPin, Send, MessageSquare, 
  User, Check, ShieldCheck, ArrowRight, Package, AlertCircle, Sparkles
} from 'lucide-react';
import { 
  getRequestsForOwner, 
  getRequestsByRequester, 
  updateItemRequestStatus, 
  sendRequestMessage 
} from '../utils/requestStorage';
import { updateRequestStatusApi, sendRequestMessageApi } from '../config/api';

export default function RequestsExchanges({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'
  
  // Chat modal state
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const loadRequests = () => {
    const received = getRequestsForOwner(currentUser);
    const sent = getRequestsByRequester(currentUser);
    setReceivedRequests(received);
    setSentRequests(sent);
  };

  useEffect(() => {
    loadRequests();
  }, [currentUser]);

  // Handle Accept or Reject
  const handleUpdateStatus = async (requestId, newStatus) => {
    // 1. Update in local storage and create notifications
    const updated = updateItemRequestStatus(requestId, newStatus, currentUser);

    // 2. Try backend sync
    try {
      await updateRequestStatusApi(
        requestId, 
        newStatus, 
        currentUser?.email || currentUser?.id || 'current-user'
      );
    } catch (e) {
      console.log('Backend sync skipped or offline, local status updated.');
    }

    loadRequests();

    // Show temporary feedback banner
    const actionLabel = newStatus === 'ACCEPTED' ? 'Request Accepted! Requester notified.' :
                        newStatus === 'REJECTED' ? 'Request Declined. Requester notified.' :
                        'Exchange Marked as Completed! 🤝 Both parties notified.';
    setActionSuccessMessage(actionLabel);
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatRequest) return;

    const text = messageInput.trim();
    sendRequestMessage(activeChatRequest.id, text, currentUser);

    try {
      const isOwner = currentUser?.email === activeChatRequest.ownerId || currentUser?.name === activeChatRequest.ownerName;
      const receiverId = isOwner ? activeChatRequest.requesterId : activeChatRequest.ownerId;
      await sendRequestMessageApi(activeChatRequest.id, {
        senderId: currentUser?.email || currentUser?.id || 'user',
        senderName: currentUser?.name || 'Campus Student',
        receiverId: receiverId,
        message: text
      });
    } catch (e) {}

    setMessageInput('');
    loadRequests();
    
    // Refresh the active chat object with the new message
    const all = activeTab === 'received' ? getRequestsForOwner(currentUser) : getRequestsByRequester(currentUser);
    const refreshed = all.find(r => r.id === activeChatRequest.id);
    if (refreshed) setActiveChatRequest(refreshed);
  };

  const currentList = activeTab === 'received' ? receivedRequests : sentRequests;
  const filteredList = currentList.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const pendingCount = receivedRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-terracotta via-amber-700 to-terracotta text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <span>🤝 Peer-to-Peer Campus Exchanges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Requests & Exchanges</h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl font-medium">
            Manage incoming requests for your listings, track requests you sent to other students, and coordinate safe campus handovers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-white text-terracotta hover:bg-amber-50 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all self-start md:self-center shrink-0 flex items-center gap-1.5"
        >
          <span>Explore More Items</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Tabs (Received Requests vs Sent Requests) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex gap-2 bg-stone-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => {
              setActiveTab('received');
              setStatusFilter('ALL');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'received'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Received Requests (For My Items)</span>
            {pendingCount > 0 && (
              <span className="bg-terracotta text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {pendingCount} new
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('sent');
              setStatusFilter('ALL');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>My Sent Requests</span>
            <span className="text-[10px] text-stone-400 font-semibold">({sentRequests.length})</span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
          <div className="text-4xl">📬</div>
          <h3 className="text-base font-bold text-stone-700">
            {activeTab === 'received' 
              ? (statusFilter === 'ALL' ? 'No incoming requests yet' : `No ${statusFilter.toLowerCase()} received requests`)
              : (statusFilter === 'ALL' ? 'You have not requested any items yet' : `No ${statusFilter.toLowerCase()} sent requests`)}
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {activeTab === 'received'
              ? 'When students request items you listed, they will appear here for you to Accept or Reject.'
              : 'Browse available campus textbooks, notes, and instruments to request them from seniors.'}
          </p>
          {activeTab === 'sent' && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Package size={14} />
              <span>Browse Campus Marketplace</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredList.map((req) => {
            const isOwnerView = activeTab === 'received';

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-md p-5 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
              >
                {/* Header: Item & Status */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={req.itemImage}
                    alt={req.itemName}
                    className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-stone-800 line-clamp-1">
                        {req.itemName}
                      </h3>
                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        req.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}>
                        {req.status === 'PENDING' ? '⏳ Pending' :
                         req.status === 'ACCEPTED' ? '✅ Accepted' :
                         req.status === 'COMPLETED' ? '🤝 Completed' : '❌ Declined'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-extrabold text-terracotta">{req.itemPrice}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {isOwnerView ? (
                          <>Requested by: <strong className="text-stone-700">{req.requesterName}</strong> ({req.requesterRole})</>
                        ) : (
                          <>Owner: <strong className="text-stone-700">{req.ownerName}</strong></>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium mt-1">
                      <Clock size={12} />
                      <span>{new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Pickup Location & Message Note */}
                <div className="bg-stone-50 rounded-2xl p-3.5 space-y-2 text-xs border border-stone-200/80">
                  <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
                    <MapPin size={13} className="text-terracotta shrink-0" />
                    <span>Handover Spot: <strong>{req.pickupLocation}</strong></span>
                  </div>

                  {req.message && (
                    <div className="text-stone-600 font-medium italic bg-white p-2.5 rounded-xl border border-stone-200">
                      "{req.message}"
                    </div>
                  )}

                  {req.messages && req.messages.length > 0 && (
                    <div className="pt-1 text-[11px] text-stone-500 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} className="text-stone-400" />
                        {req.messages.length} message{req.messages.length > 1 ? 's' : ''} in exchange thread
                      </span>
                      <button
                        onClick={() => setActiveChatRequest(req)}
                        className="text-terracotta hover:underline font-bold"
                      >
                        View Chat →
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons based on status and role */}
                <div className="pt-1">
                  {/* OWNER ACTIONS */}
                  {isOwnerView && req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                        className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={15} />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {isOwnerView && req.status === 'ACCEPTED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>Mark Handover Completed 🤝</span>
                      </button>
                      <button
                        onClick={() => setActiveChatRequest(req)}
                        className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center gap-1 border border-stone-200"
                        title="Chat with Requester"
                      >
                        <MessageSquare size={14} className="text-terracotta" />
                        <span>Message</span>
                      </button>
                    </div>
                  )}

                  {/* REQUESTER (SENT) ACTIONS */}
                  {!isOwnerView && req.status === 'PENDING' && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold text-center">
                      Waiting for {req.ownerName} to Accept or Decline your request.
                    </div>
                  )}

                  {!isOwnerView && req.status === 'ACCEPTED' && (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>Accepted! Meet {req.ownerName} at {req.pickupLocation}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>Mark Received (Exchange Complete)</span>
                        </button>
                        <button
                          onClick={() => setActiveChatRequest(req)}
                          className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-200"
                        >
                          <MessageSquare size={14} className="text-terracotta" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {req.status === 'COMPLETED' && (
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-center gap-2">
                      <Sparkles size={14} className="text-blue-600" />
                      <span>Exchange Completed Successfully • Item Re-homed</span>
                    </div>
                  )}

                  {req.status === 'REJECTED' && (
                    <div className="p-2 bg-stone-100 rounded-xl text-stone-500 text-xs text-center font-medium">
                      Request was not accepted.
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Message / Chat Drawer Modal */}
      {activeChatRequest && (
        <div
          className="fixed inset-0 z-[120] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveChatRequest(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto flex flex-col h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="p-4 bg-terracotta text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-terracotta flex items-center justify-center font-extrabold text-sm">
                  {(activeChatRequest.ownerName || 'C').charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold leading-tight">
                    {activeTab === 'received' ? activeChatRequest.requesterName : activeChatRequest.ownerName}
                  </h3>
                  <p className="text-[11px] text-amber-200 font-medium truncate max-w-[240px]">
                    Regarding: {activeChatRequest.itemName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveChatRequest(null)}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50">
              {/* Initial Handover Proposal Note */}
              <div className="text-center">
                <span className="text-[10px] bg-stone-200 text-stone-600 px-3 py-1 rounded-full font-semibold">
                  Handover Spot: {activeChatRequest.pickupLocation}
                </span>
              </div>

              {activeChatRequest.message && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-stone-400 font-bold ml-1 mb-0.5">
                    {activeChatRequest.requesterName} (Initial Request Note)
                  </span>
                  <div className="bg-white text-stone-800 p-3 rounded-2xl rounded-tl-sm border border-stone-200 text-xs shadow-sm max-w-[85%]">
                    {activeChatRequest.message}
                  </div>
                </div>
              )}

              {activeChatRequest.messages && activeChatRequest.messages.map((msg, i) => {
                const isMe = currentUser && (
                  msg.senderId === currentUser.email || 
                  msg.senderId === currentUser.id ||
                  msg.senderName === currentUser.name ||
                  msg.senderName === currentUser.full_name
                );

                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-stone-400 font-bold px-1 mb-0.5">
                      {isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[85%] shadow-sm ${
                        isMe
                          ? 'bg-terracotta text-white rounded-tr-sm'
                          : 'bg-white text-stone-800 rounded-tl-sm border border-stone-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Type your message / coordinate meeting time..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-terracotta"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-4 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
