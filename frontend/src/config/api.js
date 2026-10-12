const AUTH_URLS = ['http://localhost:8081/api/auth', 'http://localhost:8080/api/auth'];
const VERIFY_URLS = ['http://localhost:8082/api/verify', 'http://localhost:8080/api/verify'];
const ITEM_URLS = ['http://localhost:8083/api/items', 'http://localhost:8080/api/items'];
const REQUEST_URLS = ['http://localhost:8083/api/requests', 'http://localhost:8080/api/requests'];
const NOTIF_URLS = ['http://localhost:8083/api/notifications', 'http://localhost:8080/api/notifications'];

async function fetchWithFallback(urlList, path, options) {
  let lastError = null;

  for (const baseUrl of urlList) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      if (response.status === 204) {
        return true;
      }
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || resData.error || 'Server returned error status ' + response.status);
      }
      return resData;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        // High level server error response (e.g. 400 Bad Request, unverified account)
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(lastError ? lastError.message : 'Backend services are offline.');
}

export async function registerJuniorApi(data) {
  return fetchWithFallback(AUTH_URLS, '/register/junior', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function registerSeniorApi(data) {
  return fetchWithFallback(AUTH_URLS, '/register/senior', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function verifyOtpApi(data) {
  return fetchWithFallback(AUTH_URLS, '/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function verifyMarksheetApi(formData) {
  return fetchWithFallback(VERIFY_URLS, '/ocr/marksheet', {
    method: 'POST',
    body: formData,
  });
}

export async function loginApi(data) {
  return fetchWithFallback(AUTH_URLS, '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Item Service Backend APIs
export async function getItemsApi(category = '', search = '') {
  let path = '';
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  const queryString = params.toString();
  if (queryString) path = `?${queryString}`;

  return fetchWithFallback(ITEM_URLS, path, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function createItemApi(itemData) {
  return fetchWithFallback(ITEM_URLS, '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
}

export async function updateItemApi(id, itemData) {
  return fetchWithFallback(ITEM_URLS, `/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
}

export async function deleteItemApi(id) {
  return fetchWithFallback(ITEM_URLS, `/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
}

// Request & Exchange APIs
export async function createRequestApi(requestData) {
  return fetchWithFallback(REQUEST_URLS, '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
}

export async function getOwnerRequestsApi(ownerId) {
  return fetchWithFallback(REQUEST_URLS, `/owner/${ownerId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function getUserRequestsApi(requesterId) {
  return fetchWithFallback(REQUEST_URLS, `/user/${requesterId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function updateRequestStatusApi(requestId, status, actorId) {
  return fetchWithFallback(REQUEST_URLS, `/${requestId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, actorId }),
  });
}

export async function sendRequestMessageApi(requestId, messageData) {
  return fetchWithFallback(REQUEST_URLS, `/${requestId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  });
}

// Notification APIs
export async function getNotificationsApi(userId) {
  return fetchWithFallback(NOTIF_URLS, `/user/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function markNotificationReadApi(id) {
  return fetchWithFallback(NOTIF_URLS, `/${id}/read`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function markAllNotificationsReadApi(userId) {
  return fetchWithFallback(NOTIF_URLS, `/user/${userId}/read-all`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
}

