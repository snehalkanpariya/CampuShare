import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, MapPin, Send, MessageSquare, 
  User, Check, ShieldCheck, ArrowRight, Package, AlertCircle, 
  Sparkles, Bell, CheckCheck, Trash2, Filter, Calendar 
} from 'lucide-react';
import { 
  getRequestsForOwner, 
  getRequestsByRequester, 
  updateItemRequestStatus, 
  sendRequestMessage,
  cancelItemRequest 
} from '../utils/requestStorage';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearAllNotifications, 
  NOTIFICATION_TYPES,
  getNotificationStats 
} from '../utils/notificationStorage';
import { updateRequestStatusApi, sendRequestMessageApi } from '../config/api';

export default function RequestsExchanges({ currentUser, onNavigate }) {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'notifications'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'
  
  // Notification feed state
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('ALL'); // 'ALL' | 'REQUESTS' | 'MESSAGES' | 'COMPLETED'
  
  // Chat modal state
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  
  // Handover confirmation modal
  const [completeHandoverReq, setCompleteHandoverReq] = useState(null);
  
  // Temporary feedback toast
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Toggle message view per request (hidden by default in detail)
  const [expandedMsgRequests, setExpandedMsgRequests] = useState({});
  // Dedicated Message-only popup modal state
  const [viewMessageModalData, setViewMessageModalData] = useState(null);

  const toggleViewMsg = (requestId) => {
    setExpandedMsgRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const loadData = () => {
    const received = getRequestsForOwner(currentUser);
    const sent = getRequestsByRequester(currentUser);
    const notifs = getUserNotifications(currentUser);
    setReceivedRequests(received);
    setSentRequests(sent);
    setNotifications(notifs);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
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
        currentUser?.id || currentUser?.email || 'user'
      );
    } catch (e) {
      console.log('Backend sync skipped or offline, local status updated.');
    }

    loadData();

    // Feedback banner
    const actionLabel = newStatus === 'ACCEPTED' 
      ? 'Request Accepted! Requester notified & item marked Reserved. 🎉'
      : newStatus === 'REJECTED' 
      ? 'Request Declined. Requester has been notified.' 
      : 'Exchange Marked Completed! 🤝 Both students awarded eco karma points.';
    
    setActionSuccessMessage(actionLabel);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  // Handle Cancel Request (by Requester)
  const handleCancelRequest = (requestId) => {
    cancelItemRequest(requestId);
    loadData();
    setActionSuccessMessage('Request withdrawn.');
    setTimeout(() => setActionSuccessMessage(''), 3000);
  };

  // Handle Send Message inside chat
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatRequest) return;

    const text = messageInput.trim();
    sendRequestMessage(activeChatRequest.id, text, currentUser);

    try {
      const isOwner = currentUser?.id === activeChatRequest.ownerId || currentUser?.name === activeChatRequest.ownerName;
      const receiverId = isOwner ? activeChatRequest.requesterId : activeChatRequest.ownerId;
      await sendRequestMessageApi(activeChatRequest.id, {
        senderId: currentUser?.id || currentUser?.email || 'user',
        senderName: currentUser?.name || 'Campus Student',
        receiverId: receiverId,
        message: text
      });
    } catch (e) {}

    setMessageInput('');
    loadData();
    
    // Refresh the active chat object with the new message
    const all = activeTab === 'received' ? getRequestsForOwner(currentUser) : getRequestsByRequester(currentUser);
    const refreshed = all.find(r => r.id === activeChatRequest.id);
    if (refreshed) setActiveChatRequest(refreshed);
  };

  const handleQuickChatChip = (text) => {
    setMessageInput(text);
  };

  const currentList = activeTab === 'received' ? receivedRequests : sentRequests;
  const filteredList = currentList.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const pendingReceivedCount = receivedRequests.filter(r => r.status === 'PENDING').length;
  const acceptedCount = receivedRequests.filter(r => r.status === 'ACCEPTED').length;
  const completedCount = receivedRequests.filter(r => r.status === 'COMPLETED').length + sentRequests.filter(r => r.status === 'COMPLETED').length;
  const notifStats = getNotificationStats(currentUser);

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'ALL') return true;
    if (notifFilter === 'REQUESTS') {
      return n.type === NOTIFICATION_TYPES.NEW_REQUEST || n.type === NOTIFICATION_TYPES.REQUEST_ACCEPTED || n.type === NOTIFICATION_TYPES.REQUEST_REJECTED;
    }
    if (notifFilter === 'MESSAGES') return n.type === NOTIFICATION_TYPES.NEW_MESSAGE;
    if (notifFilter === 'COMPLETED') return n.type === NOTIFICATION_TYPES.EXCHANGE_COMPLETED;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-terracotta via-amber-700 to-terracotta text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <span>🤝 Peer-to-Peer Campus Exchanges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Requests & Exchanges</h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl font-medium leading-relaxed">
            Manage incoming requests for your listings, track items you requested from seniors, and coordinate safe Gujarat Vidyapith campus handovers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-white text-terracotta hover:bg-amber-50 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all self-start md:self-center shrink-0 flex items-center gap-1.5"
        >
          <span>Explore Marketplace</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pending Review</div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5">{pendingReceivedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base">
            ⏳
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Accepted Handover</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-0.5">{acceptedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
            ✅
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Completed Exchanges</div>
            <div className="text-xl font-extrabold text-blue-600 mt-0.5">{completedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
            🤝
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Unread Alerts</div>
            <div className="text-xl font-extrabold text-terracotta mt-0.5">{notifStats.unread}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-base">
            🔔
          </div>
        </div>
      </div>

      {/* Action Notification Alert Banner */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap gap-2 bg-stone-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => {
              setActiveTab('received');
              setStatusFilter('ALL');
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'received'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>📥 Received Requests (Owner View)</span>
            {pendingReceivedCount > 0 && (
              <span className="bg-terracotta text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingReceivedCount} new
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('sent');
              setStatusFilter('ALL');
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'sent'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>📤 My Sent Requests</span>
            <span className="text-[10px] text-stone-500 font-bold bg-stone-200 px-1.5 py-0.5 rounded-md">
              {sentRequests.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notifications');
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-white text-terracotta shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell size={14} className="text-amber-600" />
            <span>🔔 Notification Feed</span>
            {notifStats.unread > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {notifStats.unread}
              </span>
            )}
          </button>
        </div>

        {/* Filter Badges (Only for received & sent tabs) */}
        {activeTab !== 'notifications' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : 
                 st === 'PENDING' ? '⏳ Pending' : 
                 st === 'ACCEPTED' ? '✅ Accepted' : 
                 st === 'COMPLETED' ? '🤝 Completed' : '❌ Declined'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1 & 2: REQUESTS LIST (RECEIVED & SENT) */}
      {activeTab !== 'notifications' && (
        <>
          {filteredList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
              <div className="text-4xl">📬</div>
              <h3 className="text-base font-bold text-stone-700">
                {activeTab === 'received' 
                  ? (statusFilter === 'ALL' ? 'No incoming requests yet for your items' : `No ${statusFilter.toLowerCase()} received requests`)
                  : (statusFilter === 'ALL' ? 'You have not sent any item requests yet' : `No ${statusFilter.toLowerCase()} sent requests`)}
              </h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                {activeTab === 'received'
                  ? 'When students request items you listed, they will appear here with option to Accept or Decline.'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                            {req.status === 'PENDING' ? '⏳ Pending Review' :
                             req.status === 'ACCEPTED' ? '✅ Accepted' :
                             req.status === 'COMPLETED' ? '🤝 Completed' : '❌ Declined'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-extrabold text-terracotta">{req.itemPrice}</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {isOwnerView ? (
                              <>Requester: <strong className="text-stone-800">{req.requesterName}</strong> ({req.requesterRole})</>
                            ) : (
                              <>Owner: <strong className="text-stone-800">{req.ownerName}</strong></>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium mt-1">
                          <Clock size={12} />
                          <span>{new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Handover Spot & Message Note */}
                    <div className="bg-stone-50 rounded-2xl p-3.5 space-y-2 text-xs border border-stone-200/80">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
                          <MapPin size={13} className="text-terracotta shrink-0" />
                          <span>Handover Spot: <strong>{req.pickupLocation}</strong></span>
                        </div>

                        {req.urgency && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md font-semibold">
                            <Clock size={11} />
                            <span>{req.urgency}</span>
                          </div>
                        )}
                      </div>

                      {/* View Msg Action - Message is NOT displayed in detail by default */}
                      {req.message && (
                        <div className="pt-1 border-t border-stone-200/60">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleViewMsg(req.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                expandedMsgRequests[req.id]
                                  ? 'bg-amber-200 text-amber-950 border border-amber-300'
                                  : 'bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200'
                              }`}
                              title={expandedMsgRequests[req.id] ? 'Hide message (do not display in detail)' : 'View message note'}
                            >
                              <MessageSquare size={13} className="text-terracotta" />
                              <span>{expandedMsgRequests[req.id] ? 'Hide Msg ✕' : 'View Msg 💬'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setViewMessageModalData(req)}
                              className="text-[11px] text-stone-500 hover:text-terracotta font-semibold underline inline-flex items-center gap-1"
                              title="Display message only in popup modal"
                            >
                              <span>View Msg Only (Popup)</span>
                            </button>
                          </div>

                          {/* Display Message Only when View Msg is toggled on */}
                          {expandedMsgRequests[req.id] && (
                            <div className="mt-2.5 p-3 bg-white rounded-xl border border-amber-300 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold border-b border-stone-100 pb-1">
                                <span>
                                  Note from {isOwnerView ? req.requesterName : req.ownerName}:
                                </span>
                                <span className="text-stone-400 font-normal">
                                  {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-stone-700 font-medium italic text-xs leading-relaxed pt-0.5">
                                "{req.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Thread preview */}
                      {req.messages && req.messages.length > 0 && (
                        <div className="pt-1 text-[11px] text-stone-500 font-medium flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} className="text-stone-400" />
                            {req.messages.length} message{req.messages.length > 1 ? 's' : ''} in discussion
                          </span>
                          <button
                            onClick={() => setActiveChatRequest(req)}
                            className="text-terracotta hover:underline font-bold"
                          >
                            Open Chat →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Section */}
                    <div className="pt-1">
                      {/* 1. OWNER ACTIONS FOR PENDING REQUEST */}
                      {isOwnerView && req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={16} />
                            <span>Accept Request ✅</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                            className="flex-1 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={16} />
                            <span>Decline ❌</span>
                          </button>
                        </div>
                      )}

                      {/* 2. OWNER ACTIONS FOR ACCEPTED REQUEST */}
                      {isOwnerView && req.status === 'ACCEPTED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCompleteHandoverReq(req)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={15} />
                            <span>Mark Handover Completed 🤝</span>
                          </button>
                          <button
                            onClick={() => setActiveChatRequest(req)}
                            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center gap-1.5 border border-stone-200"
                            title="Chat with Requester"
                          >
                            <MessageSquare size={14} className="text-terracotta" />
                            <span>Chat</span>
                          </button>
                        </div>
                      )}

                      {/* 3. REQUESTER ACTIONS FOR PENDING REQUEST */}
                      {!isOwnerView && req.status === 'PENDING' && (
                        <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                          <div className="text-amber-800 text-xs font-semibold">
                            ⏳ Waiting for {req.ownerName} to Accept or Decline
                          </div>
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="text-[11px] text-stone-500 hover:text-rose-600 underline font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* 4. REQUESTER ACTIONS FOR ACCEPTED REQUEST */}
                      {!isOwnerView && req.status === 'ACCEPTED' && (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>Accepted! Meet {req.ownerName} at {req.pickupLocation}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCompleteHandoverReq(req)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                              <Check size={14} />
                              <span>Mark Received (Complete) 🤝</span>
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

                      {/* 5. COMPLETED STATUS */}
                      {req.status === 'COMPLETED' && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-center gap-2">
                          <Sparkles size={15} className="text-blue-600" />
                          <span>Exchange Completed Successfully • Item Safely Re-homed 🌿</span>
                        </div>
                      )}

                      {/* 6. DECLINED STATUS */}
                      {req.status === 'REJECTED' && (
                        <div className="p-2.5 bg-stone-100 rounded-xl text-stone-500 text-xs text-center font-medium">
                          Request was declined.
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 3: COMPLETE NOTIFICATION FEED (Feature 6 in User Prompt) */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <h3 className="text-lg font-extrabold font-serif text-stone-800">
                  Campus Activity & Notification Center
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Real-time updates for: New Request, Request Accepted/Rejected, New Message, and Exchange Completed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  markAllNotificationsAsRead(currentUser);
                  loadData();
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={() => {
                  clearAllNotifications(currentUser);
                  loadData();
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Notification Category Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: `All Alerts (${notifications.length})` },
              { id: 'REQUESTS', label: `Requests 🤝 (${notifStats.requests})` },
              { id: 'MESSAGES', label: `Messages 💬 (${notifStats.messages})` },
              { id: 'COMPLETED', label: `Completed 🌿 (${notifStats.completed})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setNotifFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  notifFilter === tab.id
                    ? 'bg-terracotta text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification Cards List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-10 text-center space-y-2 text-stone-400">
              <span className="text-3xl">🔕</span>
              <p className="text-xs font-medium">No notifications in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredNotifications.map((notif) => {
                const getIcon = (type) => {
                  switch (type) {
                    case NOTIFICATION_TYPES.NEW_REQUEST:
                      return <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-base shrink-0">🤝</span>;
                    case NOTIFICATION_TYPES.REQUEST_ACCEPTED:
                      return <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0"><CheckCircle2 size={18} /></span>;
                    case NOTIFICATION_TYPES.REQUEST_REJECTED:
                      return <span className="w-9 h-9 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0"><XCircle size={18} /></span>;
                    case NOTIFICATION_TYPES.NEW_MESSAGE:
                      return <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0"><MessageSquare size={18} /></span>;
                    case NOTIFICATION_TYPES.EXCHANGE_COMPLETED:
                      return <span className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0"><Sparkles size={18} /></span>;
                    default:
                      return <span className="w-9 h-9 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0"><Bell size={18} /></span>;
                  }
                };

                return (
                  <div
                    key={notif.id}
                    className={`py-4 px-3 rounded-2xl flex items-start justify-between gap-4 transition-colors ${
                      !notif.isRead ? 'bg-amber-50/60' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {getIcon(notif.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-stone-800">
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-terracotta" />
                          )}
                        </div>
                        <p className="text-xs text-stone-600 font-medium mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-stone-400 font-medium mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            loadData();
                          }}
                          className="text-[11px] text-stone-500 hover:text-stone-800 font-bold"
                          title="Mark read"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.type === NOTIFICATION_TYPES.NEW_MESSAGE) {
                            const related = [...receivedRequests, ...sentRequests].find(
                              r => r.id === notif.relatedRequestId || r.itemId === notif.relatedItemId
                            );
                            if (related) {
                              setActiveChatRequest(related);
                            } else {
                              setViewMessageModalData({
                                itemName: notif.title,
                                requesterName: notif.senderName || 'Campus Student',
                                requesterRole: 'Student',
                                message: notif.message,
                                createdAt: notif.createdAt
                              });
                            }
                          } else {
                            setActiveTab('received');
                          }
                        }}
                        className="px-3 py-1 bg-terracotta hover:bg-terracotta-hover text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        {notif.type === NOTIFICATION_TYPES.NEW_MESSAGE ? 'View Msg' : 'View'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: INTERACTIVE LIVE CHAT DRAWER */}
      {activeChatRequest && (
        <div
          className="fixed inset-0 z-[130] bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setActiveChatRequest(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto flex flex-col h-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="p-4 bg-terracotta text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-terracotta flex items-center justify-center font-extrabold text-sm">
                  {(activeTab === 'received' ? activeChatRequest.requesterName : activeChatRequest.ownerName || 'C').charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold leading-tight">
                    {activeTab === 'received' ? activeChatRequest.requesterName : activeChatRequest.ownerName}
                  </h3>
                  <p className="text-[11px] text-amber-200 font-medium truncate max-w-[240px]">
                    Re: {activeChatRequest.itemName}
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

            {/* Handover Spot Banner */}
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-terracotta" />
                <span>Pickup Spot: <strong>{activeChatRequest.pickupLocation}</strong></span>
              </span>
              <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full font-bold">
                {activeChatRequest.status}
              </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50">
              {/* Initial Request Note */}
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

              {/* Chat Messages */}
              {activeChatRequest.messages && activeChatRequest.messages.map((msg, i) => {
                const isMe = currentUser && (
                  msg.senderId === currentUser.id ||
                  msg.senderId === currentUser.email ||
                  (currentUser.name && msg.senderName === currentUser.name)
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

            {/* Quick Chips in Chat */}
            <div className="px-3 py-1.5 bg-stone-100 border-t border-stone-200 flex gap-1.5 overflow-x-auto text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickChatChip("I've reached the pickup spot 📍")}
                className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-700 rounded-md font-semibold border border-stone-200 whitespace-nowrap"
              >
                📍 Reached spot
              </button>
              <button
                type="button"
                onClick={() => handleQuickChatChip("Can we meet at 4:30 PM today?")}
                className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-700 rounded-md font-semibold border border-stone-200 whitespace-nowrap"
              >
                🕒 Meet at 4:30 PM?
              </button>
              <button
                type="button"
                onClick={() => handleQuickChatChip("Thank you so much for the item! 🤝")}
                className="px-2 py-1 bg-white hover:bg-amber-100 text-stone-700 rounded-md font-semibold border border-stone-200 whitespace-nowrap"
              >
                🤝 Thank you!
              </button>
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

      {/* MODAL 2: CONFIRM HANDOVER & COMPLETE EXCHANGE */}
      {completeHandoverReq && (
        <div
          className="fixed inset-0 z-[140] bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setCompleteHandoverReq(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              🤝
            </div>

            <h3 className="text-lg font-extrabold text-stone-800">
              Confirm Campus Handover & Complete Exchange
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              Did both students meet at <strong>{completeHandoverReq.pickupLocation}</strong> and complete the handover of <strong>"{completeHandoverReq.itemName}"</strong>?
            </p>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-semibold text-left space-y-1">
              <div>🌿 Item will be marked <strong>Claimed / Unavailable</strong> in marketplace.</div>
              <div>🔔 Both students will receive an <strong>Exchange Completed</strong> notification.</div>
              <div>✨ +50 Campus Eco Karma points awarded to your profile!</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCompleteHandoverReq(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Not Yet
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(completeHandoverReq.id, 'COMPLETED');
                  setCompleteHandoverReq(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Confirm Complete 🤝
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DISPLAY MESSAGE ONLY MODAL */}
      {viewMessageModalData && (
        <div
          className="fixed inset-0 z-[150] bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewMessageModalData(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 p-6 space-y-4 text-stone-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-lg shadow-inner">
                  💬
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-stone-800">
                    Request Message Note
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium">
                    Re: {viewMessageModalData.itemName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewMessageModalData(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-all"
                title="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Message Only Content */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                <span>From: {viewMessageModalData.requesterName} ({viewMessageModalData.requesterRole || 'Student'})</span>
                <span className="text-[10px] text-stone-400 font-medium">
                  {new Date(viewMessageModalData.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-stone-800 font-medium italic leading-relaxed bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
                "{viewMessageModalData.message}"
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewMessageModalData(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all"
              >
                Close (No Display)
              </button>
              <button
                onClick={() => {
                  const target = viewMessageModalData;
                  setViewMessageModalData(null);
                  setActiveChatRequest(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare size={14} />
                <span>Open Chat Thread →</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
