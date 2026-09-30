import { getItems, saveItems } from './itemStorage';
import { addNotification, NOTIFICATION_TYPES } from './notificationStorage';

const REQUESTS_STORAGE_KEY = 'campus_share_requests_v2';

// Initial seed requests so demo/presentation has immediate live data
const DEFAULT_REQUESTS = [
  {
    id: 'req-seed-1',
    itemId: 'item-1',
    itemName: '2023-24 B.Tech 1st Year Exam Papers & Answer Keys',
    itemImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    itemPrice: '₹150',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    requesterId: 'guest-user',
    requesterName: 'Aarav Shah',
    requesterRole: 'Junior (1st Year)',
    pickupLocation: 'Central Library Room 2',
    message: 'Hi Rahul, I need these exam papers for the upcoming mid-semester exams. Can we meet this afternoon?',
    status: 'PENDING',
    messages: [
      {
        senderId: 'guest-user',
        senderName: 'Aarav Shah',
        text: 'Hi Rahul, can we meet near Central Library gate around 4 PM today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'req-seed-2',
    itemId: 'item-4',
    itemName: 'Apple MacBook Air M1 (Silver, 8GB/256GB)',
    itemImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    itemPrice: '₹42,000',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    requesterId: 'guest-user',
    requesterName: 'Dhruvi Malaviya',
    requesterRole: 'Senior (3rd Year)',
    pickupLocation: 'Hostel Block A, Room 302',
    message: 'Interested in buying for MCA software labs. Let me know when you are free.',
    status: 'ACCEPTED',
    messages: [
      {
        senderId: 'user-senior-1',
        senderName: 'Rahul Sharma',
        text: 'Accepted! You can check the laptop condition today near Hostel Block A.',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'req-seed-3',
    itemId: 'item-3',
    itemName: 'Traditional Wooden Charkha (Spinning Wheel & Yarn Kit)',
    itemImage: 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    itemPrice: '₹350',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    requesterId: 'guest-user',
    requesterName: 'Dhruvi Malaviya',
    requesterRole: 'Senior (3rd Year)',
    pickupLocation: 'Anand Niketan Eco Club Room',
    message: 'Need this traditional charkha for Gandhian studies session.',
    status: 'COMPLETED',
    messages: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

// Helper to get stored requests
export function getStoredRequests() {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(DEFAULT_REQUESTS));
      return DEFAULT_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading requests', e);
    return DEFAULT_REQUESTS;
  }
}

// Helper to save requests
function saveRequests(requests) {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving requests', e);
  }
}

// Get requests received by item owner
export function getRequestsForOwner(user) {
  const all = getStoredRequests();
  if (!user) return all;

  const identifiers = [
    user.email,
    user.id,
    user.name,
    user.full_name,
    'user-senior-1',
    'guest-user'
  ].filter(Boolean);

  return all.filter(r => identifiers.includes(r.ownerId) || identifiers.includes(r.ownerName));
}

// Get requests made by the current user (as junior/senior requester)
export function getRequestsByRequester(user) {
  const all = getStoredRequests();
  if (!user) return all;

  const identifiers = [
    user.email,
    user.id,
    user.name,
    user.full_name,
    'guest-user'
  ].filter(Boolean);

  return all.filter(r => identifiers.includes(r.requesterId) || identifiers.includes(r.requesterName));
}

// Find existing request by this user for a specific item
export function findRequestForItem(itemId, user) {
  if (!itemId || !user) return null;
  const requests = getRequestsByRequester(user);
  return requests.find(r => r.itemId === itemId && r.status !== 'CANCELLED');
}

// 1. Create a new Item Request
export function createItemRequest(item, requestDetails, currentUser) {
  const all = getStoredRequests();

  const requesterName = currentUser?.name || currentUser?.full_name || 'Student';
  const requesterId = currentUser?.email || currentUser?.id || 'guest-user';
  const requesterRole = currentUser?.role 
    ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) 
    : 'Junior Student';

  const newRequest = {
    id: 'req-' + Date.now(),
    itemId: item.id,
    itemName: item.name || item.title,
    itemImage: item.image,
    itemPrice: item.price,
    ownerId: item.ownerId || 'user-senior-1',
    ownerName: item.ownerName || 'Senior Student',
    requesterId: requesterId,
    requesterName: requesterName,
    requesterRole: requesterRole,
    pickupLocation: requestDetails.pickupLocation || item.location || 'Gujarat Vidyapith Central Library Gate',
    message: requestDetails.message || 'I would like to request this item for campus academic use.',
    status: 'PENDING',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newRequest, ...all];
  saveRequests(updated);

  // Automatically trigger a notification for the Owner!
  addNotification({
    userId: item.ownerId,
    title: 'New Item Request 🤝',
    message: `${requesterName} (${requesterRole}) requested your item "${item.name || item.title}".`,
    type: NOTIFICATION_TYPES.NEW_REQUEST,
    relatedItemId: item.id,
    relatedRequestId: newRequest.id,
    senderName: requesterName
  });

  return newRequest;
}

// 2. Update Request Status (Accept / Reject / Complete)
export function updateItemRequestStatus(requestId, status, currentUser) {
  const all = getStoredRequests();
  const index = all.findIndex(r => r.id === requestId);
  if (index === -1) return null;

  const req = all[index];
  const upperStatus = status.toUpperCase();
  req.status = upperStatus;
  req.updatedAt = new Date().toISOString();

  // If ACCEPTED by owner
  if (upperStatus === 'ACCEPTED') {
    // 1. Update item in catalog to Reserved
    const items = getItems();
    const itemIndex = items.findIndex(i => i.id === req.itemId);
    if (itemIndex !== -1) {
      items[itemIndex].availability = 'Reserved';
      saveItems(items);
    }

    // 2. Dispatch notification to requester
    addNotification({
      userId: req.requesterId,
      title: 'Request Accepted! 🎉',
      message: `${req.ownerName} accepted your request for "${req.itemName}". Ready for handover at ${req.pickupLocation}.`,
      type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.ownerName
    });
  }
  // If REJECTED by owner
  else if (upperStatus === 'REJECTED') {
    addNotification({
      userId: req.requesterId,
      title: 'Request Declined',
      message: `${req.ownerName} was unable to accept your request for "${req.itemName}".`,
      type: NOTIFICATION_TYPES.REQUEST_REJECTED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.ownerName
    });
  }
  // If EXCHANGE COMPLETED
  else if (upperStatus === 'COMPLETED') {
    // 1. Mark item as Claimed
    const items = getItems();
    const itemIndex = items.findIndex(i => i.id === req.itemId);
    if (itemIndex !== -1) {
      items[itemIndex].availability = 'Claimed / Unavailable';
      saveItems(items);
    }

    // 2. Notify Requester
    addNotification({
      userId: req.requesterId,
      title: 'Exchange Completed! 🤝',
      message: `Handover of "${req.itemName}" with ${req.ownerName} is completed. Item safely re-homed!`,
      type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.ownerName
    });

    // 3. Notify Owner
    addNotification({
      userId: req.ownerId,
      title: 'Exchange Completed! 🤝',
      message: `Handover of "${req.itemName}" to ${req.requesterName} is completed. Thank you for contributing to campus circular economy!`,
      type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.requesterName
    });
  }

  saveRequests(all);
  return req;
}

// 3. Send a message on a request
export function sendRequestMessage(requestId, messageText, currentUser) {
  if (!messageText || !messageText.trim()) return;

  const all = getStoredRequests();
  const index = all.findIndex(r => r.id === requestId);
  if (index === -1) return;

  const req = all[index];
  const senderName = currentUser?.name || currentUser?.full_name || 'Campus Student';
  const senderId = currentUser?.email || currentUser?.id || 'guest-user';

  const isOwnerSender = senderId === req.ownerId || senderName === req.ownerName;
  const receiverId = isOwnerSender ? req.requesterId : req.ownerId;

  const messageObj = {
    senderId,
    senderName,
    text: messageText.trim(),
    timestamp: new Date().toISOString()
  };

  if (!req.messages) req.messages = [];
  req.messages.push(messageObj);
  req.updatedAt = new Date().toISOString();

  saveRequests(all);

  // Send NEW_MESSAGE notification to the recipient
  addNotification({
    userId: receiverId,
    title: `New Message from ${senderName} 💬`,
    message: `"${messageText.trim().substring(0, 80)}${messageText.length > 80 ? '...' : ''}"`,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    relatedItemId: req.itemId,
    relatedRequestId: req.id,
    senderName
  });

  return messageObj;
}
