import React, { useState } from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';

export default function Dashboard({ currentUser, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Books', label: 'Books 📚' },
    { id: 'Electronics', label: 'Electronics 💻' },
    { id: 'Stationery', label: 'Stationery 📝' },
    { id: 'Bicycles', label: 'Bicycles 🚲' },
    { id: 'Hostel Needs', label: 'Hostel Needs 🎁' },
  ];

  const items = [
    {
      id: 1,
      title: 'Physics Textbook',
      category: 'Books',
      badge: 'Verified Senior',
      badgeBg: 'bg-blue-100 text-blue-700',
      price: '₹250',
      originalPrice: '₹650',
      location: 'Central Library',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'Scientific Calculator',
      category: 'Electronics',
      badge: 'Verified Senior',
      badgeBg: 'bg-blue-100 text-blue-700',
      price: '₹250',
      originalPrice: '₹650',
      location: 'Central Library',
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'Ganesh Idol',
      category: 'Hostel Needs',
      badge: 'Free Gift',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      price: '₹250',
      originalPrice: '₹650',
      location: 'Central Library',
      image: 'https://images.unsplash.com/photo-1627894006066-b457a4da3756?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      title: 'HP Laptop Charger',
      category: 'Electronics',
      badge: 'Verified Senior',
      badgeBg: 'bg-blue-100 text-blue-700',
      price: '₹250',
      originalPrice: '₹650',
      location: 'Central Library',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="p-6 space-y-6">
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
        <div className="md:col-span-2 bg-emerald-50 rounded-3xl p-6 border border-emerald-200 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-extrabold font-serif text-emerald-900 mb-2">
              "Anand Niketan" Eco-Counter
            </h2>
          </div>
          <div className="bg-emerald-700 text-white px-4 py-2 rounded-full font-extrabold text-xs w-fit shadow-md">
            1,240 Items Re-homed 🌿 Saved ₹2.5 Lakhs
          </div>
        </div>

        {/* Most Wanted */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">Hostel Pickups</h4>
          <div className="text-xl font-extrabold text-terracotta">₹250 / ₹650</div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all flex flex-col group"
          >
            <div className="relative h-44 bg-stone-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${item.badgeBg}`}>
                {item.badge}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-stone-800 line-clamp-1">{item.title}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-extrabold text-terracotta">{item.price}</span>
                  <span className="text-xs text-stone-400 line-through font-semibold">{item.originalPrice}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-stone-500 flex items-center gap-1 mb-3">
                  <MapPin size={14} className="text-stone-400" /> {item.location}
                </div>
                <button className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-2 rounded-xl font-bold text-xs shadow-md transition-all">
                  Safe Exchange
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
