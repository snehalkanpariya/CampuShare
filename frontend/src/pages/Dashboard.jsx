import React, { useState } from 'react';
import { MapPin, ShieldCheck, ShieldAlert, Trash2, ArrowRight } from 'lucide-react';
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-terracotta text-white shadow-terracotta/25'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Hero Eco Banner & Widget Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Eco Counter Banner */}
        <div className="md:col-span-2 bg-emerald-50 rounded-3xl p-6 border border-emerald-200 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold font-serif text-emerald-900 mb-2">
              {t('ecoCounterTitle', '"Anand Niketan" Eco-Counter')}
            </h2>
            <p className="text-xs text-emerald-700 font-medium">
              Campus circular economy tracker diverting academic gear from landfills.
            </p>
          </div>
          <div className="bg-emerald-700 text-white px-4 py-2 rounded-full font-extrabold text-xs w-fit shadow-md mt-4">
            {t('itemsRehomed', '1,240 Items Re-homed 🌿')} • {t('ecoSaved', 'Saved ₹2.5 Lakhs')}
          </div>
        </div>

        {/* Most Wanted */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
              {t('mostWanted', 'Most Wanted Gear')}
            </h4>
            <div className="text-sm font-bold text-stone-800 mt-1">Charkhas & Mini Drafters</div>
            <p className="text-xs text-stone-500 mt-1">Over 85 incoming students awaiting handovers this week.</p>
          </div>
          <button
            onClick={() => onNavigate('listings')}
            className="text-xs font-bold text-terracotta hover:underline flex items-center gap-1 mt-3"
          >
            View All Listings <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 font-bold text-sm">
          No items found in this category. Check other categories or post a new listing!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${item.badgeBg}`}>
                    {item.badge}
                  </span>

                  {isAdmin && (
                    <span className="absolute top-3 right-3 bg-amber-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldAlert size={12} /> Admin Auth
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-extrabold text-stone-800 line-clamp-1">{item.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-terracotta">{item.price}</span>
                    <span className="text-xs text-stone-400 line-through font-semibold">{item.originalPrice}</span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 font-medium">
                    {item.description}
                  </p>

                  <div className="text-xs font-semibold text-stone-500 flex items-center gap-1 pt-2 border-t border-stone-100">
                    <MapPin size={14} className="text-stone-400 shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
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
                    onClick={() => onNavigate('exchange-map')}
                    className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t('safeExchangeBtn', 'Safe Exchange')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
