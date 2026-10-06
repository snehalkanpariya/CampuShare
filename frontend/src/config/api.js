const AUTH_URLS = ['http://localhost:8081/api/auth', 'http://localhost:8080/api/auth'];
const ADMIN_URLS = ['http://localhost:8081/api/admin/authorized-students', 'http://localhost:8080/api/admin/authorized-students'];
const USER_URLS = ['http://localhost:8081/api/users', 'http://localhost:8080/api/users'];
const VERIFY_URLS = ['http://localhost:8082/api/verify', 'http://localhost:8080/api/verify'];
const LISTING_URLS = ['http://localhost:8080/api/listings', 'http://localhost:8081/api/listings'];

function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('campus_token');
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchWithFallback(urlList, path, options) {
  let lastError = null;

  for (const baseUrl of urlList) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      if (response.status === 204) {
        return { success: true };
      }
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || resData.error || 'Server returned error status ' + response.status);
      }
      return resData;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(lastError ? lastError.message : 'Backend services are offline. Please ensure auth-service (8081) and api-gateway (8080) are running.');
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

// ADMIN APIS
export async function getAuthorizedStudentsApi(searchQuery = '') {
  const queryParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  return fetchWithFallback(ADMIN_URLS, queryParam, {
    method: 'GET',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function addAuthorizedStudentApi(data) {
  return fetchWithFallback(ADMIN_URLS, '', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
}

export async function revokeAuthorizedStudentApi(id) {
  return fetchWithFallback(ADMIN_URLS, `/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function getUserProfileApi(token) {
  return fetchWithFallback(USER_URLS, '/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
}

export async function resetPasswordApi(data) {
  return fetchWithFallback(AUTH_URLS, '/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function resetPasswordSeniorApi(formData) {
  return fetchWithFallback(AUTH_URLS, '/reset-password/senior', {
    method: 'POST',
    body: formData,
  });
}

export async function changePasswordApi(data) {
  return fetchWithFallback(AUTH_URLS, '/change-password', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
}

export async function getProfileApi() {
  return fetchWithFallback(USER_URLS, '/me', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
}

export async function updateProfileApi(data) {
  return fetchWithFallback(USER_URLS, '/me', {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
}

// ==================== LISTINGS / RESOURCE BROWSING APIS ====================

export async function getListingsApi({
  category = '',
  resourceType = '',
  status = '',
  search = '',
  page = 0,
  size = 8,
  sortBy = 'createdAt',
  sortDir = 'desc'
} = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All' && category !== 'ALL') params.append('category', category);
  if (resourceType && resourceType !== 'ALL') params.append('resourceType', resourceType);
  if (status && status !== 'ALL') params.append('status', status);
  if (search && search.trim()) params.append('search', search.trim());
  params.append('page', page);
  params.append('size', size);
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return fetchWithFallback(LISTING_URLS, queryString, {
    method: 'GET',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function getListingByIdApi(id) {
  return fetchWithFallback(LISTING_URLS, `/${id}`, {
    method: 'GET',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function createListingApi(data) {
  return fetchWithFallback(LISTING_URLS, '', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
}

export async function updateListingStatusApi(id, status) {
  return fetchWithFallback(LISTING_URLS, `/${id}/status?status=${encodeURIComponent(status)}`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function deleteListingApi(id) {
  return fetchWithFallback(LISTING_URLS, `/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function getCategoriesApi() {
  return fetchWithFallback(LISTING_URLS, '/categories', {
    method: 'GET',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function getResourceTypesApi() {
  return fetchWithFallback(LISTING_URLS, '/resource-types', {
    method: 'GET',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
  });
}
