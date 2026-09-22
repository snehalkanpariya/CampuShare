// Keycloak OIDC Authentication Configuration & Utilities

const KEYCLOAK_CONFIG = {
  url: 'http://localhost:8180',
  realm: 'campusshare',
  clientId: 'campusshare-app'
};

export const getKeycloakLoginUrl = (redirectUri = window.location.origin) => {
  const url = new URL(`${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth`);
  url.searchParams.append('client_id', KEYCLOAK_CONFIG.clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid profile email');
  return url.toString();
};

export const parseJwtToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const getUserRolesFromToken = (token) => {
  const parsed = parseJwtToken(token);
  if (!parsed) return [];
  const realmRoles = parsed.realm_access?.roles || [];
  return realmRoles.map((r) => r.toUpperCase());
};

export const hasAdminRole = (token) => {
  const roles = getUserRolesFromToken(token);
  return roles.includes('ADMIN');
};

export const hasJuniorRole = (token) => {
  const roles = getUserRolesFromToken(token);
  return roles.includes('JUNIOR');
};

export const hasSeniorRole = (token) => {
  const roles = getUserRolesFromToken(token);
  return roles.includes('SENIOR');
};
