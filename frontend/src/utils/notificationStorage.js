const NOTIF_STORAGE_KEY = 'campus_share_notifications_v3';

// Standard notification types as requested
export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'NEW_REQUEST',
  REQUEST_ACCEPTED: 'REQUEST_ACCEPTED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  NEW_MESSAGE: 'NEW_MESSAGE',
  EXCHANGE_COMPLETED: 'EXCHANGE_COMPLETED'
};

// Dispatch a real-time toast alert to the window
export function emitToast({ title, message, type = 'info', actionLabel, onAction }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campushare-toast', {
      detail: {
        id: 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title,
        message,
        type,
        actionLabel,
        onAction
      }
    }));
  }
}

// Initial seed notifications demonstrating each required event
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-seed-1',
    userId: 'user-senior-1', // Rahul Sharma (Owner)
    title: 'New Item Request 🤝',
    message: 'Aarav Shah (Junior, 1st Year) requested your "2023-24 B.Tech 1st Year Exam Papers & Answer Keys".',
    type: NOTIFICATION_TYPES.NEW_REQUEST,
    relatedItemId: 'item-1',
    relatedRequestId: 'req-seed-1',
    senderName: 'Aarav Shah',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 mins ago
  },
  {
    id: 'notif-seed-2',
    userId: 'user-senior-1', // Rahul Sharma (Owner)
    title: 'New Message 💬',
    message: 'Aarav Shah: "Hi Rahul, can we meet near Central Library gate around 4 PM today?"',
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    relatedItemId: 'item-1',
    relatedRequestId: 'req-seed-1',
    senderName: 'Aarav Shah',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString() // 4 mins ago
  },
  {
    id: 'notif-seed-3',
    userId: 'user-junior-1', // Aarav Shah (Requester)
    title: 'Request Accepted! 🎉',
    message: 'Rahul Sharma accepted your request for "Apple MacBook Air M1". Meet at Hostel Block A.',
    type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
    relatedItemId: 'item-4',
    relatedRequestId: 'req-seed-2',
    senderName: 'Rahul Sharma',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'notif-seed-4',
    userId: 'user-junior-1', // Aarav Shah (Requester)
    title: 'Exchange Completed! 🤝',
    message: 'Handover of "Traditional Wooden Charkha" is marked completed. Eco karma points credited to your profile!',
    type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
    relatedItemId: 'item-3',
    relatedRequestId: 'req-seed-3',
    senderName: 'Aman Verma',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  }
];

// Helper to get all stored notifications
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading notifications', e);
    return DEFAULT_NOTIFICATIONS;
  }
}

// Helper to save notifications
function saveNotifications(notifications) {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications', e);
  }
}

// Helper: check if a notification belongs to a student
function matchesUser(notif, user) {
  if (!user) return true;
  if (!notif.userId) return true;

  const identifiers = [
    user.id,
    user.email,
    user.enrollmentNumber,
    user.name,
    user.full_name
  ].filter(Boolean).map(s => String(s).toLowerCase());

  // Link senior persona
  if (user.id === 'user-senior-1' || (user.name && user.name.toLowerCase().includes('rahul'))) {
    identifiers.push('user-senior-1', 'rahul sharma');
  }

  // Link junior persona
  if (user.id === 'user-junior-1' || (user.name && user.name.toLowerCase().includes('aarav'))) {
    identifiers.push('user-junior-1', 'aarav shah');
  }

  const notifTarget = String(notif.userId).toLowerCase();
  return identifiers.includes(notifTarget);
}

// Get notifications for current active user
export function getUserNotifications(user) {
  const all = getStoredNotifications();
  if (!user) return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return all
    .filter(n => matchesUser(n, user))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get unread notification count
export function getUnreadNotificationCount(user) {
  const notifs = getUserNotifications(user);
  return notifs.filter(n => !n.isRead).length;
}

// Get category counts
export function getNotificationStats(user) {
  const notifs = getUserNotifications(user);
  return {
    total: notifs.length,
    unread: notifs.filter(n => !n.isRead).length,
    requests: notifs.filter(n => n.type === NOTIFICATION_TYPES.NEW_REQUEST || n.type === NOTIFICATION_TYPES.REQUEST_ACCEPTED || n.type === NOTIFICATION_TYPES.REQUEST_REJECTED).length,
    messages: notifs.filter(n => n.type === NOTIFICATION_TYPES.NEW_MESSAGE).length,
    completed: notifs.filter(n => n.type === NOTIFICATION_TYPES.EXCHANGE_COMPLETED).length
  };
}

// Add a new notification and trigger a real-time toast
export function addNotification({ 
  userId, 
  title, 
  message, 
  type = NOTIFICATION_TYPES.NEW_REQUEST, 
  relatedItemId = null, 
  relatedRequestId = null, 
  senderName = 'Campus Student',
  triggerToast = true 
}) {
  const all = getStoredNotifications();
  const newNotif = {
    id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    userId: userId || 'user-senior-1',
    title: title || 'Notification',
    message: message || '',
    type: type,
    relatedItemId: relatedItemId,
    relatedRequestId: relatedRequestId,
    senderName: senderName,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const updated = [newNotif, ...all];
  saveNotifications(updated);

  if (triggerToast) {
    emitToast({
      title,
      message,
      type
    });
  }

  return newNotif;
}

// Mark a single notification as read
export function markNotificationAsRead(id) {
  const all = getStoredNotifications();
  const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
  saveNotifications(updated);
  return updated;
}

// Mark all notifications for current user as read
export function markAllNotificationsAsRead(user) {
  const all = getStoredNotifications();
  const updated = all.map(n => {
    if (matchesUser(n, user)) {
      return { ...n, isRead: true };
    }
    return n;
  });

  saveNotifications(updated);
  return updated;
}

// Delete single notification
export function deleteNotification(id) {
  const all = getStoredNotifications();
  const updated = all.filter(n => n.id !== id);
  saveNotifications(updated);
  return updated;
}

// Clear all notifications for user
export function clearAllNotifications(user) {
  const all = getStoredNotifications();
  const updated = all.filter(n => !matchesUser(n, user));
  saveNotifications(updated);
  return updated;
}
