const AUTH_URLS = ['http://localhost:8081/api/auth', 'http://localhost:8080/api/auth'];
const VERIFY_URLS = ['http://localhost:8082/api/verify', 'http://localhost:8080/api/verify'];

async function fetchWithFallback(urlList, path, options) {
  let lastError = null;

  for (const baseUrl of urlList) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      const resData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errorMsg = resData.message || resData.error || ('Server returned error status ' + response.status);
        if (response.status === 404) {
          lastError = new Error(errorMsg);
          continue;
        }
        throw new Error(errorMsg);
      }
      return resData;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('404') && !err.message.includes('Not Found')) {
        // High level server error response (e.g. 400 Bad Request, unverified account)
        throw err;
      }
      lastError = err;
    }
  }

  if (lastError && lastError.message && (lastError.message.includes('404') || lastError.message.includes('Not Found'))) {
    throw new Error('Change password endpoint is not loaded on the running backend server. Please restart auth-service (8081).');
  }

  throw new Error(lastError ? lastError.message : 'Backend services are offline. Please ensure auth-service (8081) and verification-service (8082) are running.');
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

export async function forgotPasswordApi(data) {
  return fetchWithFallback(AUTH_URLS, '/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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
  const token = localStorage.getItem('campus_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchWithFallback(AUTH_URLS, '/change-password', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
}
