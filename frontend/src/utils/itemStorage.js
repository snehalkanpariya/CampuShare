const STORAGE_KEY = 'campus_share_items_v4';

export const PRESET_IMAGES = [
  {
    id: 'charkha',
    title: 'Charkha / Handloom Craft',
    category: 'Charkha & Crafts',
    url: 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'macbook',
    title: 'Laptop / MacBook',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'papers',
    title: 'Last Year Question Papers',
    category: 'Last Year Papers',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'notes-spiral',
    title: 'Handwritten Exam Notes',
    category: 'Notes',
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'project-arduino',
    title: 'Robotics / Hardware Project',
    category: 'Projects',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'textbook-engg',
    title: 'Engineering Textbooks',
    category: 'Books',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hostel-kettle',
    title: 'Electric Kettle / Appliance',
    category: 'Hostel Needs',
    url: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'hostel-lamp',
    title: 'Study Desk Lamp',
    category: 'Hostel Needs',
    url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'calculator',
    title: 'Scientific Calculator',
    category: 'Electronics',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'bicycle',
    title: 'Campus Bicycle',
    category: 'Bicycles',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'drafter',
    title: 'Stationery & Drawing Kit',
    category: 'Stationery',
    url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80'
  }
];

const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    name: '2023-24 B.Tech 1st Year Exam Papers & Answer Keys',
    description: 'Complete compiled set of previous year exam question papers with handwritten model solutions for Maths, Physics, Electrical, and C Programming.',
    category: 'Last Year Papers',
    condition: 'Like New',
    availability: 'Available',
    price: '₹150',
    originalPrice: '₹450',
    location: 'Central Library Room 2',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Senior (4th Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'item-2',
    name: 'Handwritten GATE Computer Science Exam Revision Notes',
    description: 'Neatly organized 4-volume handwritten notes covering Data Structures, Algorithms, DBMS, Operating Systems, Networks, and GATE PYQ solutions.',
    category: 'Notes',
    condition: 'Like New',
    availability: 'Available',
    price: '₹200',
    originalPrice: '₹600',
    location: 'Central Library Study Hall',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-2',
    ownerName: 'Priya Patel',
    ownerRole: 'Senior (3rd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'item-3',
    name: 'Traditional Wooden Charkha (Spinning Wheel & Yarn Kit)',
    description: 'Authentic handcrafted eco wooden Charkha model with natural Khadi cotton thread bundle. Perfect for campus heritage decor and room positivity.',
    category: 'Charkha & Crafts',
    condition: 'Like New',
    availability: 'Available',
    price: '₹350',
    originalPrice: '₹1,200',
    location: 'Anand Niketan Eco Club Room',
    image: 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    ownerRole: 'Senior (2nd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'item-4',
    name: 'Apple MacBook Air M1 (Silver, 8GB/256GB)',
    description: 'Perfect working condition MacBook Air M1. Used during B.Tech CS coursework. Comes with original USB-C charger & laptop sleeve.',
    category: 'Electronics',
    condition: 'Like New',
    availability: 'Available',
    price: '₹42,000',
    originalPrice: '₹84,900',
    location: 'Hostel Block A, Room 302',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Senior (4th Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString()
  },
  {
    id: 'item-5',
    name: 'Final Year Arduino Obstacle Avoiding Robot Project Kit',
    description: 'Fully tested robotics project with Arduino UNO, L298N Motor Driver, Ultrasonic Sensors, Chassis, and pre-uploaded C code.',
    category: 'Projects',
    condition: 'Good',
    availability: 'Available',
    price: '₹850',
    originalPrice: '₹2,500',
    location: 'Robotics & Hardware Lab 2',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    ownerRole: 'Senior (4th Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'item-6',
    name: 'Higher Engineering Mathematics & NCERT Physics Books',
    description: 'B.S. Grewal Mathematics & NCERT Physics 1st Year Reference books with solved example problems and highlight marks.',
    category: 'Books',
    condition: 'Good',
    availability: 'Available',
    price: '₹300',
    originalPrice: '₹850',
    location: 'Central Library',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-2',
    ownerName: 'Priya Patel',
    ownerRole: 'Senior (3rd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'item-7',
    name: 'Stainless Steel Hostel Electric Kettle (1.5 Litre)',
    description: 'Instant water boiling & noodle cooker kettle for hostel late-night study sessions. Automatic shutoff protection.',
    category: 'Hostel Needs',
    condition: 'Good',
    availability: 'Available',
    price: '₹400',
    originalPrice: '₹1,100',
    location: 'Hostel Block C',
    image: 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    ownerRole: 'Senior (2nd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString()
  },
  {
    id: 'item-8',
    name: 'Eye-Care LED Study Desk Lamp (3 Color Modes)',
    description: 'Rechargeable touch LED lamp with flexible neck & phone holder slot. Ideal for night reading without disturbing roommates.',
    category: 'Hostel Needs',
    condition: 'Like New',
    availability: 'Available',
    price: '₹250',
    originalPrice: '₹799',
    location: 'Hostel Block B, Room 108',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Senior (3rd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'item-9',
    name: 'Hero Hawk Alloy Frame Campus Bicycle',
    description: '21-speed gears campus bicycle in excellent condition. Dual disc brakes, comfortable saddle, headlight, and solid lock included.',
    category: 'Bicycles',
    condition: 'Good',
    availability: 'Available',
    price: '₹2,800',
    originalPrice: '₹7,500',
    location: 'Campus Cycle Stand #2',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    ownerRole: 'Senior (4th Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'item-10',
    name: 'Mechanical Mini Drafter & Engineering Drawing Set',
    description: 'Complete drawing kit for Mechanical/Civil 1st Year Engineering Graphics. Includes mini drafter, T-scale, set squares, and carry bag.',
    category: 'Stationery',
    condition: 'Good',
    availability: 'Available',
    price: '₹350',
    originalPrice: '₹950',
    location: 'Mechanical Block Workshop',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    ownerRole: 'Senior (3rd Year)',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 3.5).toISOString()
  }
];

export function resolveImageForItem(name = '', category = '', customUrl = '') {
  if (customUrl && customUrl.trim().startsWith('http')) {
    return customUrl.trim();
  }

  const query = (name + ' ' + category).toLowerCase();

  if (query.includes('charkha') || query.includes('sharkho') || query.includes('craft') || query.includes('handloom') || query.includes('khadi') || query.includes('yarn')) {
    return 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('paper') || query.includes('pepar') || query.includes('exam paper') || query.includes('question paper') || query.includes('pyq')) {
    return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('note') || query.includes('notes') || query.includes('gate') || query.includes('assignment') || query.includes('handwritten')) {
    return 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('macbook') || query.includes('mac book') || query.includes('laptop') || query.includes('notebook') || query.includes('dell') || query.includes('hp')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('project') || query.includes('arduino') || query.includes('robot') || query.includes('circuit') || query.includes('sensor') || query.includes('iot')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('kettle') || query.includes('heater') || query.includes('boiler')) {
    return 'https://images.unsplash.com/photo-1585670149967-b4f4da88cc9f?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('lamp') || query.includes('light') || query.includes('led')) {
    return 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('calculator') || query.includes('casio')) {
    return 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('cycle') || query.includes('bicycle') || query.includes('bike')) {
    return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('drafter') || query.includes('stationery') || query.includes('drawing')) {
    return 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80';
  }
  if (query.includes('book') || query.includes('textbook') || query.includes('math') || query.includes('physics')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  }

  return getDefaultImageForCategory(category);
}

export function getDefaultImageForCategory(category) {
  switch (category) {
    case 'Books':
      return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
    case 'Notes':
      return 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80';
    case 'Last Year Papers':
      return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
    case 'Charkha & Crafts':
      return 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80';
    case 'Electronics':
      return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
    case 'Projects':
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
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
  const resolvedImg = resolveImageForItem(newItemData.name, newItemData.category, newItemData.image);

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
    image: resolvedImg,
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

  const resolvedImg = resolveImageForItem(
    updatedItemData.name || items[index].name,
    updatedItemData.category || items[index].category,
    updatedItemData.image || items[index].image
  );

  items[index] = {
    ...items[index],
    ...updatedItemData,
    image: resolvedImg,
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
