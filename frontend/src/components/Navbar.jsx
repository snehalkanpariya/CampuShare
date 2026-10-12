import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, Globe, CheckCheck, MessageSquare, 
  CheckCircle2, XCircle, Clock, Sparkles, ArrowRight, 
  User, RefreshCw, ChevronDown, Check 
} from 'lucide-react';
import CharkhaLogo from './CharkhaLogo';
import { 
  getUserNotifications, 
  getUnreadNotificationCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  NOTIFICATION_TYPES 
} from '../utils/notificationStorage';
import { DEMO_SENIOR, DEMO_JUNIOR, DEMO_USERS } from '../utils/demoUsers';

export default function Navbar({ currentUser, onNavigate, onSwitchUser, lang, setLang }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notifRef = useRef(null);
  const personaRef = useRef(null);

  const refreshNotifications = () => {
    const list = getUserNotifications(currentUser);
    setNotifications(list);
    setUnreadCount(getUnreadNotificationCount(currentUser));
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (personaRef.current && !personaRef.current.contains(event.target)) {
        setShowPersonaMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(currentUser);
    refreshNotifications();
  };

  const handleNotificationClick = (notif) => {
    markNotificationAsRead(notif.id);
    refreshNotifications();
    setShowNotifications(false);
    if (onNavigate) {
      onNavigate('requests');
    }
  };

  // Helper icon for each notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.NEW_REQUEST:
        return <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm shrink-0">🤝</span>;
      case NOTIFICATION_TYPES.REQUEST_ACCEPTED:
        return <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />;
      case NOTIFICATION_TYPES.REQUEST_REJECTED:
        return <XCircle size={18} className="text-rose-500 shrink-0" />;
      case NOTIFICATION_TYPES.NEW_MESSAGE:
        return <MessageSquare size={18} className="text-blue-500 shrink-0" />;
      case NOTIFICATION_TYPES.EXCHANGE_COMPLETED:
        return <Sparkles size={18} className="text-teal-600 shrink-0" />;
      default:
        return <Bell size={18} className="text-stone-500 shrink-0" />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const isSenior = currentUser?.role?.toLowerCase().includes('senior') || 
                   currentUser?.name?.toLowerCase().includes('rahul');

  return (
    <header className="bg-terracotta text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* Brand Header */}
      <div 
        onClick={() => currentUser ? onNavigate('dashboard') : onNavigate('welcome')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <CharkhaLogo size={38} />
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-serif tracking-tight leading-none group-hover:text-amber-200 transition-colors">
            CampuShare | GVP
          </h1>
          <span className="text-[10px] opacity-80 font-medium tracking-wide">
            Gujarat Vidyapith Ecosystem
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-64 md:w-80 lg:w-96 hidden sm:flex items-center">
        <Search size={15} className="absolute left-3.5 text-stone-400" />
        <input
          type="text"
          placeholder={lang === 'gu' ? "શોધો... (Cmd+K)" : "Search items, notes, charkha..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-14 py-1.5 rounded-full bg-white/95 text-stone-800 text-xs font-medium focus:bg-white outline-none transition-all shadow-inner"
        />
        <span className="absolute right-3 text-[9px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold">
          Cmd+K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Quick Role Switcher Pill */}
        {onSwitchUser && (
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-1.5 bg-black/25 hover:bg-black/35 text-white px-2.5 py-1.5 rounded-full text-xs font-bold border border-white/20 transition-all shadow-sm"
              title="Switch between Junior Requester and Senior Owner"
            >
              <span>{isSenior ? '🎓 Senior' : '🎒 Junior'}</span>
              <ChevronDown size={13} className="opacity-70" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 text-stone-800 p-2 z-[110] animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3 py-1.5">
                  Select Active Persona:
                </div>

                <button
                  onClick={() => {
                    onSwitchUser(DEMO_JUNIOR);
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-extrabold text-stone-800">Aarav Shah (Junior)</div>
                    <div className="text-[10px] text-stone-500">1st Year Computer Engg</div>
                  </div>
                  {!isSenior && <Check size={16} className="text-terracotta" />}
                </button>

                <button
                  onClick={() => {
                    onSwitchUser(DEMO_SENIOR);
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="text-xs font-extrabold text-stone-800">Rahul Sharma (Senior)</div>
                    <div className="text-[10px] text-stone-500">4th Year • Listed 4 Items</div>
                  </div>
                  {isSenior && <Check size={16} className="text-terracotta" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-white/15 hover:bg-white/25 text-white p-2 rounded-full transition-all relative focus:outline-none"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-300 text-stone-900 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Menu */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 text-stone-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
              
              {/* Dropdown Header */}
              <div className="p-4 bg-terracotta text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} />
                  <span className="font-extrabold text-sm">Activity & Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-amber-300 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-amber-100 hover:text-white flex items-center gap-1 font-semibold underline"
                  >
                    <CheckCheck size={13} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <span className="text-2xl">🔔</span>
                    <p className="text-xs text-stone-500 font-medium">No notifications right now.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-stone-50 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-amber-50/60' : 'bg-white'
                      }`}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-extrabold text-stone-800 truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-terracotta shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('requests');
                  }}
                  className="text-xs font-bold text-terracotta hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Open Complete Notification Center</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          )}
        </div>

        {/* User Profile Pill */}
        {currentUser ? (
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full cursor-pointer transition-all"
            title="Profile"
          >
            <div className="w-7 h-7 rounded-full bg-white text-terracotta flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold hidden md:inline">
              {currentUser.name ? currentUser.name.split(' ')[0] : 'Student'}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            className="bg-white text-terracotta hover:bg-amber-50 px-4 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
