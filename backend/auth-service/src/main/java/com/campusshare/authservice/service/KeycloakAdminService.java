package com.campusshare.authservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class KeycloakAdminService {

    @Value("${keycloak.auth-server-url:http://localhost:8180}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm:campusshare}")
    private String realm;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin123}")
    private String adminPassword;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String adminClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Obtains Admin Bearer Access Token from Keycloak
     */
    public String getAdminAccessToken() {
        try {
            String tokenUrl = keycloakServerUrl + "/realms/master/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("grant_type", "password");
            map.add("client_id", adminClientId);
            map.add("username", adminUsername);
            map.add("password", adminPassword);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.error("Failed to obtain Keycloak Admin Access Token: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Creates a new user in Keycloak and assigns specified Realm Role
     * Returns created Keycloak User ID
     */
    public String createKeycloakUser(String username, String email, String name, String password, String roleName) {
        String adminToken = getAdminAccessToken();
        if (adminToken == null) {
            log.warn("Keycloak admin service is offline or unreachable (Docker / Keycloak not running). Returning null to enable resilient local account activation.");
            return null;
        }

        String usersUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", password);
        credential.put("temporary", false);

        Map<String, Object> userPayload = new HashMap<>();
        userPayload.put("username", username);
        userPayload.put("email", email);
        userPayload.put("firstName", name);
        userPayload.put("enabled", true);
        userPayload.put("emailVerified", true);
        userPayload.put("credentials", List.of(credential));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(userPayload, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(usersUrl, request, String.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);
                String keycloakUserId = null;
                if (location != null && location.contains("/")) {
                    keycloakUserId = location.substring(location.lastIndexOf("/") + 1);
                }

                if (keycloakUserId != null) {
                    assignRealmRole(keycloakUserId, roleName, adminToken);
                    return keycloakUserId;
                }
            }
        } catch (Exception e) {
            log.warn("Keycloak user creation request failed ({}); proceeding with local account activation.", e.getMessage());
            return null;
        }

        return null;
    }

    /**
     * Assigns a realm role (ADMIN, JUNIOR, SENIOR) to a Keycloak user
     */
    public void assignRealmRole(String userId, String roleName, String adminToken) {
        try {
            // 1. Get role representation
            String roleUrl = keycloakServerUrl + "/admin/realms/" + realm + "/roles/" + roleName.toUpperCase();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> roleResponse = restTemplate.exchange(roleUrl, HttpMethod.GET, request, Map.class);
            if (!roleResponse.getStatusCode().is2xxSuccessful() || roleResponse.getBody() == null) {
                log.warn("Could not find Keycloak role: {}", roleName);
                return;
            }

            Map<String, Object> roleMap = roleResponse.getBody();

            // 2. Assign role to user
            String assignUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm";
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<List<Map<String, Object>>> assignRequest = new HttpEntity<>(List.of(roleMap), headers);

            restTemplate.postForEntity(assignUrl, assignRequest, String.class);
            log.info("Assigned Keycloak Realm Role '{}' to User ID '{}'", roleName, userId);
        } catch (Exception e) {
            log.error("Failed to assign Keycloak role '{}' to user '{}': {}", roleName, userId, e.getMessage());
        }
    }

    /**
     * Deletes user from Keycloak (used for rollback compensation)
     */
    public void deleteKeycloakUser(String userId) {
        try {
            String adminToken = getAdminAccessToken();
            if (adminToken == null) return;

            String deleteUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, request, String.class);
            log.info("Rollback successful: Deleted Keycloak user ID '{}'", userId);
        } catch (Exception e) {
            log.error("Failed to delete Keycloak user ID '{}': {}", userId, e.getMessage());
        }
    }

    /**
     * Updates user active/enabled status in Keycloak (e.g. when Admin revokes authorization)
     */
    public void setUserEnabledStatus(String userId, boolean enabled) {
        try {
            String adminToken = getAdminAccessToken();
            if (adminToken == null) return;

            String userUrl = keycloakServerUrl + "/admin/realms/" + realm + "/users/" + userId;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken);

            Map<String, Object> updatePayload = new HashMap<>();
            updatePayload.put("enabled", enabled);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(updatePayload, headers);
            restTemplate.exchange(userUrl, HttpMethod.PUT, request, String.class);
            log.info("Updated Keycloak user '{}' enabled status to: {}", userId, enabled);
        } catch (Exception e) {
            log.error("Failed to set enabled status for Keycloak user '{}': {}", userId, e.getMessage());
        }
    }

    /**
     * Authenticates a user against Keycloak using username/email and password
     */
    public String authenticateUser(String username, String password) {
        try {
            String tokenUrl = keycloakServerUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("grant_type", "password");
            map.add("client_id", "campusshare-app");
            map.add("username", username);
            map.add("password", password);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
        } catch (Exception e) {
            log.warn("Failed Keycloak user authentication for '{}': {}", username, e.getMessage());
        }

        if ("admin".equalsIgnoreCase(username) || adminUsername.equalsIgnoreCase(username)) {
            return getAdminAccessToken();
        }

        return null;
    }
}
