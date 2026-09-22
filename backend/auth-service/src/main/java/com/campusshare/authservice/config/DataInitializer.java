package com.campusshare.authservice.config;

import com.campusshare.authservice.entity.Role;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.entity.VerificationMethod;
import com.campusshare.authservice.entity.VerificationStatus;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.KeycloakAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@gujaratvidyapith.org";
        String adminEnrollment = "ADMIN001";

        User existingAdmin = userRepository.findByEmail(adminEmail)
                .or(() -> userRepository.findByEnrollmentNumber(adminEnrollment))
                .orElse(null);

        if (existingAdmin == null) {
            log.info("Initializing default Admin account ('admin' / 'admin123')...");
            String keycloakUserId = null;
            try {
                keycloakUserId = keycloakAdminService.createKeycloakUser(
                        "admin",
                        adminEmail,
                        "System Admin",
                        "admin123",
                        "ADMIN"
                );
                log.info("Keycloak Admin user created with ID: {}", keycloakUserId);
            } catch (Exception e) {
                log.warn("Keycloak service unavailable (will use local fallback admin mode): {}", e.getMessage());
            }

            try {
                User adminUser = User.builder()
                        .keycloakUserId(keycloakUserId != null ? keycloakUserId : "keycloak-admin-local")
                        .name("System Admin")
                        .email(adminEmail)
                        .enrollmentNumber(adminEnrollment)
                        .role(Role.ADMIN)
                        .verified(true)
                        .verificationMethod(VerificationMethod.EMAIL)
                        .verificationStatus(VerificationStatus.VERIFIED)
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .verifiedAt(LocalDateTime.now())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                userRepository.save(adminUser);
                log.info("Default Admin account successfully provisioned in MongoDB.");
            } catch (Exception e) {
                log.error("Failed to save Admin account to MongoDB: {}", e.getMessage());
            }
        } else if (existingAdmin.getPasswordHash() == null) {
            existingAdmin.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(existingAdmin);
            log.info("Updated existing Admin account with local password hash fallback.");
        }
    }
}
