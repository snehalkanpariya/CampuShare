const AUTH_URLS = ['http://localhost:8081/api/auth', 'http://localhost:8080/api/auth'];
const VERIFY_URLS = ['http://localhost:8082/api/verify', 'http://localhost:8080/api/verify'];
const ITEM_URLS = ['http://localhost:8083/api/items', 'http://localhost:8080/api/items'];

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
