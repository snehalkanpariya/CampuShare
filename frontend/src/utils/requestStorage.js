import { getItems, saveItems } from './itemStorage';
import { addNotification, emitToast, NOTIFICATION_TYPES } from './notificationStorage';

const REQUESTS_STORAGE_KEY = 'campus_share_requests_v3';

// Initial seed requests for seamless presentation & testing
const DEFAULT_REQUESTS = [
  {
    id: 'req-seed-1',
    itemId: 'item-1',
    itemName: '2023-24 B.Tech 1st Year Exam Papers & Answer Keys',
    itemImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    itemPrice: '₹150',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    requesterId: 'user-junior-1',
    requesterName: 'Aarav Shah',
    requesterRole: 'Junior (1st Year)',
    requesterDepartment: 'Computer Engineering',
    pickupLocation: 'Central Library Room 2',
    urgency: 'Today afternoon',
    message: 'Hi Rahul, I need these exam papers for the upcoming mid-semester exams. Can we meet this afternoon?',
    status: 'PENDING',
    messages: [
      {
        senderId: 'user-junior-1',
        senderName: 'Aarav Shah',
        text: 'Hi Rahul, can we meet near Central Library gate around 4 PM today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString()
  },
  {
    id: 'req-seed-2',
    itemId: 'item-4',
    itemName: 'Apple MacBook Air M1 (Silver, 8GB/256GB)',
    itemImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    itemPrice: '₹42,000',
    ownerId: 'user-senior-1',
    ownerName: 'Rahul Sharma',
    requesterId: 'user-junior-1',
    requesterName: 'Aarav Shah',
    requesterRole: 'Junior (1st Year)',
    requesterDepartment: 'Computer Engineering',
    pickupLocation: 'Hostel Block A Main Gate',
    urgency: 'Tomorrow during break',
    message: 'Interested in buying for MCA software labs. Let me know when you are free.',
    status: 'ACCEPTED',
    messages: [
      {
        senderId: 'user-senior-1',
        senderName: 'Rahul Sharma',
        text: 'Accepted! You can inspect the laptop condition today near Hostel Block A.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: 'req-seed-3',
    itemId: 'item-3',
    itemName: 'Traditional Wooden Charkha (Spinning Wheel & Yarn Kit)',
    itemImage: 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=600&q=80',
    itemPrice: '₹350',
    ownerId: 'user-senior-3',
    ownerName: 'Aman Verma',
    requesterId: 'user-junior-1',
    requesterName: 'Aarav Shah',
    requesterRole: 'Junior (1st Year)',
    requesterDepartment: 'Computer Engineering',
    pickupLocation: 'Anand Niketan Eco Club Room',
    urgency: 'This weekend',
    message: 'Need this traditional charkha for Gandhian studies session.',
    status: 'COMPLETED',
    messages: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
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

// Helper: build normalized identifier array for a user
function getUserIdentifiers(user) {
  if (!user) return ['user-senior-1', 'rahul sharma'];

  const ids = [
    user.id,
    user.email,
    user.enrollmentNumber,
    user.name,
    user.full_name
  ].filter(Boolean).map(s => String(s).toLowerCase());

  if (user.id === 'user-senior-1' || (user.name && user.name.toLowerCase().includes('rahul'))) {
    ids.push('user-senior-1', 'rahul sharma');
  }
  if (user.id === 'user-junior-1' || (user.name && user.name.toLowerCase().includes('aarav'))) {
    ids.push('user-junior-1', 'aarav shah');
  }

  return ids;
}

// Get requests received by item owner (where user is the OWNER)
export function getRequestsForOwner(user) {
  const all = getStoredRequests();
  const identifiers = getUserIdentifiers(user);

  return all.filter(r => {
    const ownerId = r.ownerId ? String(r.ownerId).toLowerCase() : '';
    const ownerName = r.ownerName ? String(r.ownerName).toLowerCase() : '';
    return identifiers.includes(ownerId) || identifiers.includes(ownerName);
  });
}

// Get requests sent by the current user (where user is the REQUESTER)
export function getRequestsByRequester(user) {
  const all = getStoredRequests();
  const identifiers = getUserIdentifiers(user);

  return all.filter(r => {
    const reqId = r.requesterId ? String(r.requesterId).toLowerCase() : '';
    const reqName = r.requesterName ? String(r.requesterName).toLowerCase() : '';
    return identifiers.includes(reqId) || identifiers.includes(reqName);
  });
}

// Find existing request by this user for a specific item
export function findRequestForItem(itemId, user) {
  if (!itemId || !user) return null;
  const requests = getRequestsByRequester(user);
  return requests.find(r => r.itemId === itemId && r.status !== 'CANCELLED');
}

// 1. Create a new Item Request (Step 2 in flow)
export function createItemRequest(item, requestDetails = {}, currentUser) {
  const all = getStoredRequests();

  const requesterName = currentUser?.name || currentUser?.full_name || 'Aarav Shah';
  const requesterId = currentUser?.id || currentUser?.email || 'user-junior-1';
  const requesterRole = currentUser?.role || 'Junior (1st Year)';
  const requesterDepartment = currentUser?.department || 'Gujarat Vidyapith Student';

  const chosenLocation = requestDetails.pickupLocation?.trim() || item.location || 'Central Library Gate';
  const chosenUrgency = requestDetails.urgency || 'Today afternoon';
  const chosenMessage = requestDetails.message?.trim() || 
    `Hello ${item.ownerName || 'Sharer'}, I am requesting your "${item.name || item.title}". Please accept so we can coordinate campus handover.`;

  const newRequest = {
    id: 'req-' + Date.now(),
    itemId: item.id,
    itemName: item.name || item.title,
    itemImage: item.image,
    itemPrice: item.price,
    ownerId: item.ownerId || 'user-senior-1',
    ownerName: item.ownerName || 'Rahul Sharma',
    requesterId: requesterId,
    requesterName: requesterName,
    requesterRole: requesterRole,
    requesterDepartment: requesterDepartment,
    pickupLocation: chosenLocation,
    urgency: chosenUrgency,
    message: chosenMessage,
    status: 'PENDING',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newRequest, ...all];
  saveRequests(updated);

  // Notify Owner about the new request
  addNotification({
    userId: item.ownerId || 'user-senior-1',
    title: 'New Item Request 🤝',
    message: `${requesterName} (${requesterRole}) requested your item "${item.name || item.title}". Meetup: ${chosenLocation}.`,
    type: NOTIFICATION_TYPES.NEW_REQUEST,
    relatedItemId: item.id,
    relatedRequestId: newRequest.id,
    senderName: requesterName,
    triggerToast: false
  });

  // Emit immediate toast for requester feedback
  emitToast({
    title: 'Request Sent Successfully! 🤝',
    message: `Your request for "${item.name || item.title}" has been sent to ${item.ownerName || 'the owner'}.`,
    type: 'NEW_REQUEST'
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

  // OWNER ACCEPTS REQUEST
  if (upperStatus === 'ACCEPTED') {
    // 1. Mark item as Reserved in catalog
    const items = getItems();
    const itemIndex = items.findIndex(i => i.id === req.itemId);
    if (itemIndex !== -1) {
      items[itemIndex].availability = 'Reserved';
      saveItems(items);
    }

    // 2. Dispatch notification to Requester
    addNotification({
      userId: req.requesterId,
      title: 'Request Accepted! 🎉',
      message: `${req.ownerName} accepted your request for "${req.itemName}". Ready for handover at ${req.pickupLocation}.`,
      type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.ownerName,
      triggerToast: false
    });

    emitToast({
      title: 'Request Accepted! 🎉',
      message: `${req.requesterName} has been notified. You can now chat and coordinate pickup.`,
      type: 'REQUEST_ACCEPTED'
    });
  }

  // OWNER REJECTS REQUEST
  else if (upperStatus === 'REJECTED') {
    addNotification({
      userId: req.requesterId,
      title: 'Request Declined',
      message: `${req.ownerName} was unable to accept your request for "${req.itemName}".`,
      type: NOTIFICATION_TYPES.REQUEST_REJECTED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.ownerName,
      triggerToast: false
    });

    emitToast({
      title: 'Request Declined',
      message: `${req.requesterName} was notified. The item remains available.`,
      type: 'REQUEST_REJECTED'
    });
  }

  // EXCHANGE COMPLETED
  else if (upperStatus === 'COMPLETED') {
    // 1. Mark item as Claimed in catalog
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
      message: `Handover of "${req.itemName}" with ${req.ownerName} is completed. Thank you for circular campus sharing!`,
      type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.ownerName,
      triggerToast: false
    });

    // 3. Notify Owner
    addNotification({
      userId: req.ownerId,
      title: 'Exchange Completed! 🤝',
      message: `Handover of "${req.itemName}" to ${req.requesterName} is marked complete. +50 Campus Eco Karma!`,
      type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
      relatedItemId: req.itemId,
      relatedRequestId: req.id,
      senderName: req.requesterName,
      triggerToast: false
    });

    emitToast({
      title: 'Exchange Completed! 🤝',
      message: `"${req.itemName}" successfully exchanged and re-homed. Both students awarded eco karma!`,
      type: 'EXCHANGE_COMPLETED'
    });
  }

  saveRequests(all);
  return req;
}

// 3. Send message inside a request thread
export function sendRequestMessage(requestId, messageText, currentUser) {
  if (!messageText || !messageText.trim()) return null;

  const all = getStoredRequests();
  const index = all.findIndex(r => r.id === requestId);
  if (index === -1) return null;

  const req = all[index];
  const senderName = currentUser?.name || currentUser?.full_name || 'Campus Student';
  const senderId = currentUser?.id || currentUser?.email || 'user-sender';

  const isOwnerSender = senderId === req.ownerId || senderName === req.ownerName;
  const receiverId = isOwnerSender ? req.requesterId : req.ownerId;
  const receiverName = isOwnerSender ? req.requesterName : req.ownerName;

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

  // Notify recipient of new message
  addNotification({
    userId: receiverId,
    title: `New Message from ${senderName} 💬`,
    message: `"${messageText.trim().substring(0, 90)}${messageText.length > 90 ? '...' : ''}" (Re: ${req.itemName})`,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    relatedItemId: req.itemId,
    relatedRequestId: req.id,
    senderName,
    triggerToast: false
  });

  emitToast({
    title: `Message Sent to ${receiverName} 💬`,
    message: `"${messageText.trim().substring(0, 70)}"`,
    type: 'NEW_MESSAGE'
  });

  return messageObj;
}

// 4. Cancel a pending request
export function cancelItemRequest(requestId) {
  const all = getStoredRequests();
  const index = all.findIndex(r => r.id === requestId);
  if (index === -1) return null;

  all[index].status = 'CANCELLED';
  all[index].updatedAt = new Date().toISOString();
  saveRequests(all);

  emitToast({
    title: 'Request Cancelled',
    message: 'Your item request has been withdrawn.',
    type: 'info'
  });

  return all[index];
}
