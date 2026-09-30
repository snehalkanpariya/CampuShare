const NOTIF_STORAGE_KEY = 'campus_share_notifications_v2';

// Standard notification types
export const NOTIFICATION_TYPES = {
  NEW_REQUEST: 'NEW_REQUEST',
  REQUEST_ACCEPTED: 'REQUEST_ACCEPTED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  NEW_MESSAGE: 'NEW_MESSAGE',
  EXCHANGE_COMPLETED: 'EXCHANGE_COMPLETED'
};

// Default seed notifications for demo and testing
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'user-senior-1',
    title: 'New Item Request 🤝',
    message: 'Aarav Shah (Junior) requested your "2023-24 B.Tech 1st Year Exam Papers & Answer Keys".',
    type: NOTIFICATION_TYPES.NEW_REQUEST,
    relatedItemId: 'item-1',
    relatedRequestId: 'req-seed-1',
    senderName: 'Aarav Shah',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
  },
  {
    id: 'notif-2',
    userId: 'user-senior-1',
    title: 'New Message 💬',
    message: 'Aarav Shah: "Hi Rahul, can we meet near Central Library gate around 4 PM today?"',
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    relatedItemId: 'item-1',
    relatedRequestId: 'req-seed-1',
    senderName: 'Aarav Shah',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 mins ago
  },
  {
    id: 'notif-3',
    userId: 'guest-user',
    title: 'Request Accepted! 🎉',
    message: 'Rahul Sharma accepted your request for "Apple MacBook Air M1". Meet at Hostel Block A.',
    type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
    relatedItemId: 'item-4',
    relatedRequestId: 'req-seed-2',
    senderName: 'Rahul Sharma',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif-4',
    userId: 'guest-user',
    title: 'Exchange Completed! 🤝',
    message: 'Handover of "Traditional Wooden Charkha" is marked completed. Thank you for campus re-homing!',
    type: NOTIFICATION_TYPES.EXCHANGE_COMPLETED,
    relatedItemId: 'item-3',
    relatedRequestId: 'req-seed-3',
    senderName: 'Aman Verma',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
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

// Get notifications for current user (or demo guest user)
export function getUserNotifications(user) {
  const all = getStoredNotifications();
  if (!user) return all;

  const userIds = [
    user.email,
    user.id,
    user.enrollmentNumber,
    'guest-user'
  ].filter(Boolean);

  return all
    .filter(n => userIds.includes(n.userId) || !n.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get unread notification count
export function getUnreadNotificationCount(user) {
  const notifs = getUserNotifications(user);
  return notifs.filter(n => !n.isRead).length;
}

// Add a new notification
export function addNotification({ userId, title, message, type, relatedItemId, relatedRequestId, senderName }) {
  const all = getStoredNotifications();
  const newNotif = {
    id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    userId: userId || 'guest-user',
    title: title || 'Notification',
    message: message || '',
    type: type || NOTIFICATION_TYPES.NEW_REQUEST,
    relatedItemId: relatedItemId || null,
    relatedRequestId: relatedRequestId || null,
    senderName: senderName || 'Campus User',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const updated = [newNotif, ...all];
  saveNotifications(updated);
  return newNotif;
}

// Mark a single notification as read
export function markNotificationAsRead(id) {
  const all = getStoredNotifications();
  const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
  saveNotifications(updated);
  return updated;
}

// Mark all user notifications as read
export function markAllNotificationsAsRead(user) {
  const all = getStoredNotifications();
  const userIds = user ? [user.email, user.id, user.enrollmentNumber, 'guest-user'].filter(Boolean) : ['guest-user'];
  
  const updated = all.map(n => {
    if (userIds.includes(n.userId) || !n.userId) {
      return { ...n, isRead: true };
    }
    return n;
  });

  saveNotifications(updated);
  return updated;
}
