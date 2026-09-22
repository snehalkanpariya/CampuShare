import React, { useState } from 'react';
import { Home, MapPin, Tag, ShieldCheck, Trash2, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HostelPickups({ currentUser, items, onDeleteItem }) {
  const { t } = useLanguage();
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || (currentUser.roles && currentUser.roles.includes('ADMIN')));

  const [selectedHostel, setSelectedHostel] = useState('All');
  const [successToast, setSuccessToast] = useState('');

  const hostels = [
    { id: 'All', label: t('allHostels', 'All Hostels') },
    { id: 'Bhadra Boys Hostel', label: t('bhadraCampus', 'Bhadra Boys Hostel') },
    { id: 'Kasturba Girls Hostel', label: t('kasturbaHostel', 'Kasturba Girls Hostel') },
    { id: 'Sadra Campus Chhatralay', label: t('sadraHostel', 'Sadra Campus Chhatralay') },
    { id: 'Randheja Campus Hostel', label: t('randhejaHostel', 'Randheja Campus Hostel') },
  ];

  const hostelItems = items.filter((item) => {
    if (selectedHostel === 'All') return true;
    return item.hostel?.toLowerCase().includes(selectedHostel.toLowerCase()) ||
           item.location?.toLowerCase().includes(selectedHostel.toLowerCase());
  });

  const handlePickupRequest = (item) => {
    setSuccessToast(`Pickup requested for "${item.title}" at ${item.hostel || item.location}! Room coordinator notified.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Home size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-serif text-stone-800">
              {t('hostelTitle', 'Hostel-to-Hostel Pickups')}
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              {t('hostelSubtitle', 'Urgent moving-out handovers, room appliances, and bulky gear')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold">
          <Clock size={16} /> Fast Room Clearance
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hostel Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hostels.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHostel(h.id)}
            className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
              selectedHostel === h.id
                ? 'bg-amber-800 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {h.label}
          </button>
        ))}
      </div>

      {/* Hostel Items Grid */}
      {hostelItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500 font-bold text-sm">
          No hostel clearance items found for this hostel block.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {hostelItems.map((item) => (
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
                  <span className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                    <Home size={12} /> {item.hostel || 'Hostel Block'}
                  </span>
                  {isAdmin && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldAlert size={11} /> Admin
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-extrabold text-stone-800 line-clamp-1">{item.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-amber-800">{item.price}</span>
                    <span className="text-xs text-stone-400 line-through font-semibold">{item.originalPrice}</span>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 font-medium">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px] font-semibold text-stone-500">
                    <div className="flex items-center gap-1">
                      <Tag size={13} className="text-stone-400" /> {item.condition}
                    </div>
                    <div className="flex items-center gap-1 text-amber-800">
                      <MapPin size={13} /> {item.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete rule-violating listing: "${item.title}"?`)) {
                        onDeleteItem(item.id, 'Hostel policy violation');
                      }
                    }}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 size={14} /> {t('deleteViolation', 'Remove Violation')}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePickupRequest(item)}
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t('requestPickup', 'Request Hostel Pickup')}
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
