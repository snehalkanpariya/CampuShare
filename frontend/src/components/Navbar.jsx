import React, { useState } from 'react';
import { Search, Bell, Globe } from 'lucide-react';
import CharkhaLogo from './CharkhaLogo';

export default function Navbar({ currentUser, onNavigate, lang, setLang }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-terracotta text-white px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* Brand Header */}
      <div 
        onClick={() => currentUser ? onNavigate('dashboard') : onNavigate('welcome')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <CharkhaLogo size={42} />
        <div>
          <h1 className="text-xl font-bold font-serif tracking-tight leading-none group-hover:text-amber-200 transition-colors">
            CampuShare | GVP
          </h1>
          <span className="text-[10px] opacity-80 font-medium tracking-wide">
            Gujarat Vidyapith Ecosystem
          </span>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative w-80 md:w-96 flex items-center">
        <Search size={16} className="absolute left-3.5 text-stone-400" />
        <input
          type="text"
          placeholder={lang === 'gu' ? "શોધો... (Cmd+K)" : "Cmd+K Search items..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-16 py-1.5 rounded-full bg-white/95 text-stone-800 text-sm focus:bg-white outline-none transition-all shadow-inner"
        />
        <span className="absolute right-3 text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-semibold">
          Cmd+K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all"
        >
          <Globe size={14} />
          <span>{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
        </button>

        <button className="bg-white/15 hover:bg-white/25 text-white p-2 rounded-full transition-all">
          <Bell size={16} />
        </button>

        {currentUser ? (
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-white text-terracotta flex items-center justify-center font-bold text-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold">
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
