const STORAGE_KEY = 'campus_share_items_v1';

const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    name: 'Physics Textbook (NCERT & Reference)',
    description: 'Complete physics reference textbook for engineering first year. Includes extra problem sets, solutions, and highlight notes.',
    category: 'Books',
    condition: 'Good',
    availability: 'Available',
    price: '₹250',
    originalPrice: '₹650',
    location: 'Central Library',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Senior (3rd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'item-2',
    name: 'Casio Scientific Calculator FX-991EX',
    description: 'Fully working matrix and integration calculator. Minimal scratch on body, screen is clean and clear with fresh solar cell battery.',
    category: 'Electronics',
    condition: 'Like New',
    availability: 'Available',
    price: '₹450',
    originalPrice: '₹1200',
    location: 'Hostel Block A',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-2',
    ownerName: 'Priya Patel',
    ownerRole: 'Senior (4th Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'item-3',
    name: 'Eco Ganesh Idol & Hostel Desk Decor',
    description: 'Handcrafted eco-friendly clay idol perfect for hostel desk decor and room positivity. Giving away for free to junior students.',
    category: 'Hostel Needs',
    condition: 'New',
    availability: 'Available',
    price: 'Free',
    originalPrice: '₹300',
    location: 'Hostel Block B, Room 204',
    image: 'https://images.unsplash.com/photo-1627894006066-b457a4da3756?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Senior (3rd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'item-4',
    name: 'HP Laptop Charger (65W Smart AC Adapter)',
    description: 'Original HP Blue pin charger. Works great with Pavilion & Envy series. Tested and safe.',
    category: 'Electronics',
    condition: 'Good',
    availability: 'Available',
    price: '₹350',
    originalPrice: '₹1500',
    location: 'Tech Lab 3',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    ownerRole: 'Senior (2nd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export function getItems() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
      return DEFAULT_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading items from localStorage', e);
    return DEFAULT_ITEMS;
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items to localStorage', e);
  }
}

export function addItem(newItemData, currentUser) {
  const items = getItems();
  const newItem = {
    id: 'item-' + Date.now(),
    name: newItemData.name,
    description: newItemData.description || '',
    category: newItemData.category || 'Books',
    condition: newItemData.condition || 'Good',
    availability: newItemData.availability || 'Available',
    price: newItemData.isFree ? 'Free' : (newItemData.price ? (newItemData.price.startsWith('₹') ? newItemData.price : `₹${newItemData.price}`) : 'Free'),
    originalPrice: newItemData.originalPrice ? (newItemData.originalPrice.startsWith('₹') ? newItemData.originalPrice : `₹${newItemData.originalPrice}`) : '',
    location: newItemData.location || 'Campus Main Gate',
    image: newItemData.image || getDefaultImageForCategory(newItemData.category),
    ownerId: currentUser?.email || currentUser?.id || 'guest-user',
    ownerName: currentUser?.name || currentUser?.full_name || 'Campus Student',
    ownerRole: currentUser?.role ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Campus Member',
    verified: currentUser?.verified !== false,
    createdAt: new Date().toISOString()
  };

  const updated = [newItem, ...items];
  saveItems(updated);
  return newItem;
}

export function updateItem(updatedItemData) {
  const items = getItems();
  const index = items.findIndex(item => item.id === updatedItemData.id);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...updatedItemData,
    price: updatedItemData.isFree ? 'Free' : (updatedItemData.price ? (updatedItemData.price.startsWith('₹') ? updatedItemData.price : `₹${updatedItemData.price}`) : items[index].price)
  };

  saveItems(items);
  return items[index];
}

export function deleteItem(itemId) {
  const items = getItems();
  const filtered = items.filter(item => item.id !== itemId);
  saveItems(filtered);
  return filtered;
}

export function getDefaultImageForCategory(category) {
  switch (category) {
    case 'Books':
      return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    case 'Electronics':
      return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
    case 'Stationery':
      return 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80';
    case 'Bicycles':
      return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80';
    case 'Hostel Needs':
      return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80';
    default:
      return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
  }
}
