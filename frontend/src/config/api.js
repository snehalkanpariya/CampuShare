const AUTH_URLS = ['http://localhost:8081/api/auth', 'http://localhost:8080/api/auth'];
const USER_URLS = ['http://localhost:8081/api/users', 'http://localhost:8080/api/users'];
const VERIFY_URLS = ['http://localhost:8082/api/verify', 'http://localhost:8080/api/verify'];

async function fetchWithFallback(urlList, path, options) {
  let lastError = null;

  for (const baseUrl of urlList) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
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

export async function getUserProfileApi(token) {
  return fetchWithFallback(USER_URLS, '/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
}

