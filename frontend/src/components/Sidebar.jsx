import React from 'react';
import { Home, User, ShieldCheck, BookOpen, Package, MapPin, LogOut, Sparkles } from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, currentUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Marketplace', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'listings', label: 'Listings', icon: Package },
    { id: 'hostel', label: 'Hostel Pickups', icon: BookOpen },
    { id: 'exchange-map', label: 'Safe Exchange', icon: MapPin },
  ];

  return (
    <aside className="w-56 bg-white border-r border-stone-200 p-4 flex flex-col justify-between h-[calc(100vh-62px)] sticky top-[62px]">
      <div>
        {currentUser && (
          <div className={`rounded-xl p-3 mb-5 border ${currentUser.verified ? 'bg-sage-light border-emerald-200' : 'bg-amber-50 border-amber-200'} flex items-center gap-2.5`}>
            <ShieldCheck size={22} className={currentUser.verified ? 'text-sage' : 'text-amber-600'} />
            <div>
              <div className={`text-xs font-extrabold ${currentUser.verified ? 'text-sage' : 'text-amber-800'}`}>
                {currentUser.verified ? 'VERIFIED' : 'UNVERIFIED'}
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                {currentUser.role || 'GVP Student'}
              </div>
            </div>
          </div>
        )}

        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">
          Navigation
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
          <div className="text-xs font-bold text-amber-900">CampuShare Eco</div>
          <div className="text-[11px] text-stone-600 font-medium">1,240 Items Re-homed 🌿</div>
        </div>

        {currentUser && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs w-full transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
