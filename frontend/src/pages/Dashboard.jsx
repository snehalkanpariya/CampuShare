import React, { useState } from 'react';
import { ArrowRight, Compass, MapPin, PlusCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ currentUser, onNavigate, items, onDeleteItem }) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', label: t('allCategories', 'All') },
    { id: 'Charkhas', label: t('catCharkha', 'Traditional Charkha 🧵') },
    { id: 'Drafters', label: t('catDrafter', 'Engineering Drafter 📐') },
    { id: 'Lab Aprons', label: t('catApron', 'Lab Apron & Kit 🥼') },
    { id: 'Books', label: t('catBooks', 'Books 📚') },
    { id: 'Electronics', label: t('catElectronics', 'Electronics 💻') },
    { id: 'Hostel Needs', label: t('catHostel', 'Hostel Needs 🎁') },
    { id: 'Bicycles', label: t('catBicycles', 'Bicycles 🚲') },
  ];

  const currentItems = items || [];
  const filteredItems = selectedCategory === 'All' 
    ? currentItems 
    : currentItems.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-3 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-900 via-stone-800 to-terracotta p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full border-[30px] border-white/5" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100">
              <Compass size={13} /> {t('marketplaceTitle', 'Campus Marketplace')}
            </span>
            <h1 className="font-serif text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t('welcomeBack', 'Welcome back')}{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              {t('marketplaceIntro', 'Find useful campus essentials, or pass along something another student can use.')}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              onClick={() => onNavigate('browse')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-stone-900 shadow-sm transition hover:bg-amber-50"
            >
              <Compass size={15} /> {t('browseResources', 'Browse Resources')}
            </button>
            <button
              onClick={() => onNavigate('listings')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              <PlusCircle size={15} /> {t('shareResource', 'Share a resource')}
            </button>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-extrabold text-stone-900">
              {t('campusResources', 'Resources around campus')}
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              {t('filterByCategory', 'Choose a category to narrow the listings.')}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-stone-600 ring-1 ring-stone-200">
            {filteredItems.length} {t('itemsLabel', 'items')}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-terracotta text-white shadow-terracotta/25'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-terracotta">
            <Compass size={26} />
          </div>
          <h3 className="font-serif text-lg font-extrabold text-stone-800">{t('noResourcesFoundTitle', 'No resources found')}</h3>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">
            {t('dashboardEmpty', 'There are no items in this category yet. Browse all campus resources or share one with students.')}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button onClick={() => onNavigate('browse')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800">
              {t('browseResources', 'Browse Resources')} <ArrowRight size={14} />
            </button>
            <button onClick={() => onNavigate('listings')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50">
              <PlusCircle size={14} /> {t('shareResource', 'Share a resource')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {filteredItems.map((item) => {
            const status = (item.status || 'AVAILABLE').toUpperCase();
            const isAvailable = status === 'AVAILABLE';
            const statusLabel = isAvailable
              ? t('statusAvailable', 'Available')
              : status === 'RESERVED'
              ? t('statusReserved', 'Reserved')
              : t('statusUnavailable', 'Unavailable');
            const badgeLabel = item.badge?.toLowerCase().includes('verified senior')
              ? item.sellerRole === 'SENIOR'
                ? t('seniorStudent', 'Senior student')
                : t('studentRole', 'Student')
              : item.badge;

            return (
            <div
              key={item.id}
              className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${item.badgeBg || 'bg-white text-stone-700'}`}>
                    {badgeLabel}
                  </span>

                  {isAdmin && (
                    <span className="absolute top-3 right-3 bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldAlert size={12} /> Admin Auth
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-extrabold leading-snug text-stone-800">{item.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase ${
                      isAvailable ? 'bg-emerald-50 text-emerald-800' : status === 'RESERVED' ? 'bg-amber-50 text-amber-800' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-extrabold ${item.price === 'Free' || item.resourceType === 'DONATION' ? 'text-emerald-700' : 'text-terracotta'}`}>
                      {item.price === 'Free' || item.resourceType === 'DONATION' ? t('typeDonation', 'Free') : item.price}
                    </span>
                    {item.originalPrice && <span className="text-xs font-semibold text-stone-400 line-through">{item.originalPrice}</span>}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 font-medium">
                    {item.description || t('noDescription', 'No description provided.')}
                  </p>

                  <div className="flex items-center gap-1 border-t border-stone-100 pt-2 text-xs font-semibold text-stone-500">
                    <MapPin size={14} className="text-stone-400 shrink-0" />
                    <span className="line-clamp-1">{item.location || item.hostel || t('campusPickup', 'Campus pickup')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`Admin: Remove rule-violating listing "${item.title}"?`)) {
                        onDeleteItem(item.id, 'Violation deleted from Marketplace');
                      }
                    }}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 size={14} /> {t('deleteViolation', 'Remove Violation')}
                  </button>
                ) : (
                  <button 
                    onClick={() => onNavigate('browse')}
                    className="w-full rounded-xl bg-terracotta py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-terracotta-hover"
                  >
                    {t('browseResources', 'Browse Resources')}
                  </button>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
