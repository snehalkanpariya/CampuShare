import React, { useState, useEffect } from 'react';
import { MapPin, ShieldCheck, Plus, Search, Tag, Eye } from 'lucide-react';
import { getItems, addItem, updateItem, deleteItem } from '../utils/itemStorage';
import AddItemModal from '../components/AddItemModal';
import ViewItemModal from '../components/ViewItemModal';

export default function Dashboard({ currentUser, onNavigate }) {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultIsFree, setDefaultIsFree] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const categories = [
    { id: 'All', label: 'All Items' },
    { id: 'Books', label: 'Books 📚' },
    { id: 'Notes', label: 'Notes 📝' },
    { id: 'Last Year Papers', label: 'Last Year Papers 📑' },
    { id: 'Charkha & Crafts', label: 'Charkha & Crafts 🧶' },
    { id: 'Projects', label: 'Projects 🤖' },
    { id: 'Electronics', label: 'Electronics 💻' },
    { id: 'Hostel Needs', label: 'Hostel Needs 🎁' },
    { id: 'Bicycles', label: 'Bicycles 🚲' },
    { id: 'Stationery', label: 'Stationery 📐' },
  ];

  const loadAllItems = () => {
    const loaded = getItems();
    setItems(loaded);
  };

  useEffect(() => {
    loadAllItems();
  }, []);

  const handleSaveItem = (newItemData) => {
    if (editingItem) {
      updateItem(newItemData);
    } else {
      addItem(newItemData, currentUser);
    }
    loadAllItems();
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    deleteItem(itemId);
    loadAllItems();
    if (viewingItem && viewingItem.id === itemId) {
      setViewingItem(null);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header & Merged Action Button Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search items by name (Charkha, Papers, Notes, Books...), category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 shadow-sm transition-all"
          />
        </div>

        {/* Merged Action Button */}
        <button
          onClick={() => {
            setEditingItem(null);
            setDefaultIsFree(false);
            setIsAddModalOpen(true);
          }}
          className="bg-terracotta hover:bg-terracotta-hover text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus size={18} />
          <span>+ Share / Add Item</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-terracotta text-white shadow-terracotta/25'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-lg font-extrabold text-stone-800 font-serif">
          {selectedCategory === 'All' ? 'All Shared Items' : `${selectedCategory} Listings`}
          <span className="ml-2 text-xs font-semibold text-stone-400">({filteredItems.length} available)</span>
        </h3>
        
        <button
          onClick={() => onNavigate('listings')}
          className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all border border-stone-200"
        >
          View My Shared Items
        </button>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
          <div className="text-4xl">🔍</div>
          <h4 className="text-base font-bold text-stone-700">No items found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try adjusting your search query or category filter to discover shared items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isOwner = currentUser && (
              item.ownerId === currentUser.email || 
              item.ownerId === currentUser.id ||
              item.ownerId === 'guest-user' ||
              item.ownerName === currentUser.name ||
              item.ownerName === currentUser.full_name
            );

            return (
              <div
                key={item.id}
                onClick={() => setViewingItem(item)}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all flex flex-col group cursor-pointer relative"
              >
                {/* Image & Badges */}
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name || item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${
                    item.verified !== false ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {item.ownerRole || 'Verified Member'}
                  </span>

                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                    item.availability === 'Available' ? 'bg-emerald-500 text-white' :
                    item.availability === 'Reserved' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {item.availability || 'Available'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-extrabold text-stone-800 line-clamp-1">{item.name || item.title}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-extrabold text-terracotta">{item.price}</span>
                      {item.originalPrice && item.price !== 'Free' && (
                        <span className="text-xs text-stone-400 line-through font-semibold">{item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-stone-400" /> {item.location || 'Campus'}
                      </span>
                      <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                        {item.condition || 'Good'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingItem(item);
                      }}
                      className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>{isOwner ? 'View / Edit My Item' : 'View Item Details'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
          setDefaultIsFree(false);
        }}
        onSave={handleSaveItem}
        editItem={editingItem}
        defaultIsFree={defaultIsFree}
      />

      {/* View Item Modal */}
      <ViewItemModal
        item={viewingItem}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        currentUser={currentUser}
        onEdit={(item) => {
          setEditingItem(item);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteItem}
      />

    </div>
  );
}
