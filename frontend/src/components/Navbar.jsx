import React from 'react';
import { Bell, Globe, LogOut, ShieldAlert } from 'lucide-react';
import CharkhaLogo from './CharkhaLogo';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ currentUser, onNavigate, onLogout }) {
  const { lang, setLang, t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-2 bg-terracotta px-3 py-2.5 text-white shadow-md sm:gap-4 sm:px-6 sm:py-3">
      {/* Brand Header */}
      <div 
        onClick={() => currentUser ? onNavigate(isAdmin ? 'admin-dashboard' : 'dashboard') : onNavigate('welcome')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <CharkhaLogo size={36} />
        <div>
          <h1 className="text-base font-bold font-serif tracking-tight leading-none transition-colors group-hover:text-amber-200 sm:text-xl">
            {t('brandTitle', 'CampuShare | GVP')}
          </h1>
          <span className="hidden text-[10px] font-medium tracking-wide opacity-80 sm:block">
            {t('brandSubtitle', 'Gujarat Vidyapith Ecosystem')}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Full-Page Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
          title="Switch Language / ભાષા બદલો"
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/25 sm:px-3.5"
        >
          <Globe size={14} />
          <span className="hidden sm:inline">{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
        </button>

        {/* Admin Portal Quick Switch */}
        {isAdmin && (
          <button
            onClick={() => onNavigate('admin-dashboard')}
            title="Admin Authorization Portal"
            className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/25 px-2.5 py-1.5 text-xs font-bold text-amber-200 shadow-sm transition-all hover:bg-amber-500/35 sm:px-3"
          >
            <ShieldAlert size={14} className="text-amber-300" />
            <span className="hidden md:inline">Admin Portal</span>
          </button>
        )}

        {/* Notifications - ONLY SHOWN WHEN USER IS LOGGED IN */}
        {currentUser && (
          <button 
            title={t('notifications', 'Notifications')}
            className="bg-white/15 hover:bg-white/25 text-white p-2 rounded-full transition-all relative"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
          </button>
        )}

        {currentUser ? (
          <>
            <div 
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full cursor-pointer transition-all border border-white/20"
            >
              <div className="w-7 h-7 rounded-full bg-white text-terracotta flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden text-xs font-bold sm:inline">
                {currentUser.name ? currentUser.name.split(' ')[0] : (isAdmin ? 'Admin' : 'Student')}
              </span>
            </div>

            <button
              id="navbar-logout-btn"
              onClick={onLogout}
              title={t('logout', 'Logout')}
              aria-label={t('logout', 'Logout')}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all border border-rose-400/50 cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{t('logout', 'Logout')}</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            className="bg-white text-terracotta hover:bg-amber-50 px-5 py-1.5 rounded-full font-bold text-xs shadow-sm transition-all"
          >
            {t('login', 'Login')}
          </button>
        )}
      </div>
    </header>
  );
}
