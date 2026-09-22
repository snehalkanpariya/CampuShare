import React from 'react';
import { Home, User, ShieldCheck, BookOpen, Package, MapPin, LogOut, Sparkles, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ currentView, onNavigate, currentUser, onLogout }) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));

  const menuItems = [
    { id: 'dashboard', label: t('marketplace', 'Marketplace'), icon: Home },
    { id: 'profile', label: t('profile', 'Profile'), icon: User },
    { id: 'listings', label: t('listings', 'Campus Listings'), icon: Package },
    { id: 'hostel', label: t('hostelPickups', 'Hostel Pickups'), icon: BookOpen },
    { id: 'exchange-map', label: t('safeExchange', 'Safe Exchange'), icon: MapPin },
  ];

  if (isAdmin) {
    menuItems.unshift({ id: 'admin-dashboard', label: t('adminPortal', 'Admin Authorization'), icon: ShieldAlert });
  }

  return (
    <aside className="w-56 bg-white border-r border-stone-200 p-4 flex flex-col justify-between h-[calc(100vh-62px)] sticky top-[62px]">
      <div>
        {currentUser && (
          <div className={`rounded-xl p-3 mb-5 border ${isAdmin ? 'bg-amber-50 border-amber-300' : currentUser.verified ? 'bg-sage-light border-emerald-200' : 'bg-amber-50 border-amber-200'} flex items-center gap-2.5`}>
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

        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">
          {t('navigation', 'Navigation')}
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm w-full text-left font-semibold ${
                  isActive 
                    ? 'bg-terracotta-light text-terracotta font-bold' 
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-terracotta' : 'text-stone-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="bg-gold-light border border-amber-200/60 rounded-xl p-3.5 mb-3 text-center">
          <Sparkles size={22} className="text-gold mx-auto mb-1" />
          <div className="text-xs font-bold text-amber-900">{t('ecoTitle', 'CampuShare Eco')}</div>
          <div className="text-[11px] text-stone-600 font-medium">{t('itemsRehomed', '1,240 Items Re-homed 🌿')}</div>
        </div>

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
    </aside>
  );
}
