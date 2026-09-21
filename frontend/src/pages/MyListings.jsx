import React, { useState, useEffect } from 'react';
import { Plus, Package, Edit3, Trash2, MapPin, Eye, Tag, AlertTriangle } from 'lucide-react';
import { getItems, deleteItem, saveItems } from '../utils/itemStorage';
import AddItemModal from '../components/AddItemModal';
import ViewItemModal from '../components/ViewItemModal';

export default function MyListings({ currentUser, onNavigate }) {
  const [items, setItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const loadListings = () => {
    const allItems = getItems();
    // Filter items belonging to the current user or guest items
    const userItems = allItems.filter(item => 
      currentUser && (
        item.ownerId === currentUser.email || 
        item.ownerId === currentUser.id ||
        item.ownerId === 'guest-user' ||
        item.ownerName === currentUser.name ||
        item.ownerName === currentUser.full_name
      )
    );
    setItems(userItems);
  };

  useEffect(() => {
    loadListings();
  }, [currentUser]);

  const handleSaveItem = (newItemData) => {
    const allItems = getItems();
    let updated;
    if (editingItem) {
      updated = allItems.map(item => item.id === editingItem.id ? { ...item, ...newItemData } : item);
    } else {
      const newItem = {
        id: 'item-' + Date.now(),
        ...newItemData,
        ownerId: currentUser?.email || currentUser?.id || 'guest-user',
        ownerName: currentUser?.name || currentUser?.full_name || 'Campus Student',
        ownerRole: currentUser?.role ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Campus Member',
        verified: currentUser?.verified !== false,
        createdAt: new Date().toISOString()
      };
      updated = [newItem, ...allItems];
    }
    saveItems(updated);
    loadListings();
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    deleteItem(itemId);
    loadListings();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-terracotta to-amber-700 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={24} className="text-amber-200" />
            <h1 className="text-2xl font-extrabold font-serif">My Listed Items</h1>
          </div>
          <p className="text-xs text-amber-100 font-medium max-w-lg">
            Manage your shared campus items, update availability status, or add new items for fellow students.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="bg-white text-terracotta hover:bg-amber-50 px-5 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus size={18} />
          <span>+ Share New Item</span>
        </button>
      </div>

      {/* Listings Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-terracotta">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">No Listed Items Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 font-medium">
              You haven't listed any items for sharing yet. Share your textbooks, calculators, hostel supplies, or sports gear to help the campus community!
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
            className="bg-terracotta hover:bg-terracotta-hover text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md inline-flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            <span>List Your First Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all flex flex-col group relative"
            >
              {/* Image Preview */}
              <div className="relative h-44 bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setViewingItem(item)}>
                <img
                  src={item.image}
                  alt={item.name || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm">
                  {item.category}
                </span>

                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm ${
                  item.availability === 'Available' ? 'bg-emerald-500 text-white' :
                  item.availability === 'Reserved' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {item.availability || 'Available'}
                </span>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="cursor-pointer" onClick={() => setViewingItem(item)}>
                  <h3 className="text-base font-extrabold text-stone-800 line-clamp-1">{item.name || item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-extrabold text-terracotta">{item.price}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      Condition: {item.condition || 'Good'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                    <MapPin size={14} className="text-stone-400" /> {item.location || 'Campus Center'}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsAddModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-terracotta/10 hover:bg-terracotta/20 text-terracotta font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Edit3 size={15} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editItem={editingItem}
      />

      {/* View Modal */}
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
