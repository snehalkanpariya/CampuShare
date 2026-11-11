import React from 'react';
import { Home, Compass, User, ShieldCheck, BookOpen, Package, MapPin, LogOut, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ currentView, onNavigate, currentUser, onLogout }) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));

  const menuItems = [
    { id: 'dashboard', label: t('marketplace', 'Marketplace'), icon: Home },
    { id: 'browse', label: t('browseResources', 'Browse Resources'), icon: Compass },
    { id: 'profile', label: t('profile', 'Profile'), icon: User },
    { id: 'listings', label: t('listings', 'Campus Listings'), icon: Package },
    { id: 'hostel', label: t('hostelPickups', 'Hostel Pickups'), icon: BookOpen },
    { id: 'exchange-map', label: t('safeExchange', 'Safe Exchange'), icon: MapPin },
  ];

  if (isAdmin) {
    menuItems.unshift({ id: 'admin-dashboard', label: t('adminPortal', 'Admin Authorization'), icon: ShieldAlert });
  }

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-stone-200 bg-white/95 p-1.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(44,34,30,0.08)] backdrop-blur md:sticky md:top-[62px] md:h-[calc(100vh-62px)] md:w-56 md:border-r md:border-t-0 md:p-4 md:shadow-none md:backdrop-blur-none">
      <div className="md:flex md:h-full md:flex-col md:justify-between">
        <div>
        {currentUser && (
          <div className={`hidden md:flex rounded-xl p-3 mb-5 border ${isAdmin ? 'bg-amber-50 border-amber-300' : currentUser.verified ? 'bg-sage-light border-emerald-200' : 'bg-amber-50 border-amber-200'} items-center gap-2.5`}>
            {isAdmin ? (
              <ShieldAlert size={22} className="text-amber-700" />
            ) : (
              <ShieldCheck size={22} className={currentUser.verified ? 'text-sage' : 'text-amber-600'} />
            )}
            <div>
              <div className={`text-xs font-extrabold ${isAdmin ? 'text-amber-900' : currentUser.verified ? 'text-sage' : 'text-amber-800'}`}>
                {isAdmin ? t('adminRole', 'Campus Authority') : (currentUser.verified ? t('verifiedBadge', 'VERIFIED') : t('unverifiedBadge', 'UNVERIFIED'))}
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                {isAdmin ? 'Campus Admin' : (currentUser.role || t('studentRole', 'GVP Student'))}
              </div>
            </div>
          </div>
        )}

        <div className="hidden text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-2 md:block">
          {t('navigation', 'Navigation')}
        </div>

        <nav aria-label={t('navigation', 'Navigation')} className="flex items-stretch gap-1 overflow-x-auto md:flex-col md:gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition-all text-[9px] text-center font-semibold sm:min-w-[62px] sm:text-[10px] md:w-full md:min-w-0 md:flex-row md:flex-initial md:justify-start md:gap-3 md:px-3 md:py-2.5 md:text-left md:text-sm ${
                  isActive 
                    ? 'bg-terracotta-light text-terracotta font-bold' 
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-terracotta' : 'text-stone-400'}`} />
                <span className="max-w-full truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        </div>

        <div className="hidden md:block">
        {currentUser && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs w-full transition-all"
          >
            <LogOut size={16} />
            <span>{t('logout', 'Logout')}</span>
          </button>
        )}
        </div>
      </div>
    </aside>
  );
}
