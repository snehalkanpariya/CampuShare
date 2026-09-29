package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.request.AuthorizedStudentRequest;
import com.campusshare.authservice.entity.AuthorizationStatus;
import com.campusshare.authservice.entity.AuthorizedStudent;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.repository.AuthorizedStudentRepository;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.AdminStudentService;
import com.campusshare.authservice.service.KeycloakAdminService;
import com.campusshare.authservice.entity.VerificationMethod;
import com.campusshare.authservice.entity.VerificationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminStudentServiceImpl implements AdminStudentService {

    private final AuthorizedStudentRepository authorizedStudentRepository;
    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthorizedStudent addAuthorizedStudent(AuthorizedStudentRequest request, Principal principal) {
        String trimmedEnrollment = request.getEnrollmentNumber().trim();
        String trimmedEmail = request.getEmail().trim().toLowerCase();
        String adminName = (principal != null) ? principal.getName() : "ADMIN";

        AuthorizedStudent student = authorizedStudentRepository.findByEnrollmentNumberIgnoreCase(trimmedEnrollment)
                .or(() -> authorizedStudentRepository.findByEmailIgnoreCase(trimmedEmail))
                .orElse(null);

        if (student != null) {
            student.setEnrollmentNumber(trimmedEnrollment);
            student.setEmail(trimmedEmail);
            student.setAllowedRole(request.getAllowedRole());
            student.setStatus(request.getStatus() != null ? request.getStatus() : AuthorizationStatus.APPROVED);
            student.setAuthorizedBy(adminName);
            student.setUpdatedAt(LocalDateTime.now());
        } else {
            student = AuthorizedStudent.builder()
                    .enrollmentNumber(trimmedEnrollment)
                    .email(trimmedEmail)
                    .allowedRole(request.getAllowedRole())
                    .status(request.getStatus() != null ? request.getStatus() : AuthorizationStatus.APPROVED)
                    .authorizedBy(adminName)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        AuthorizedStudent saved = authorizedStudentRepository.save(student);

        // Immediately provision verified User account so the student can sign in immediately
        String studentName = (request.getName() != null && !request.getName().isBlank())
                ? request.getName().trim()
                : "Student " + trimmedEnrollment;
        String initialPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                ? request.getPassword().trim()
                : trimmedEnrollment;

        User user = userRepository.findByEnrollmentNumber(trimmedEnrollment)
                .or(() -> userRepository.findByEnrollmentNumberIgnoreCase(trimmedEnrollment))
                .or(() -> userRepository.findByEmail(trimmedEmail))
                .or(() -> userRepository.findByEmailIgnoreCase(trimmedEmail))
                .orElse(null);

        if (user == null) {
            user = new User();
            user.setEnrollmentNumber(trimmedEnrollment);
            user.setEmail(trimmedEmail);
            user.setCreatedAt(LocalDateTime.now());
        }

        user.setName(studentName);
        user.setRole(request.getAllowedRole());
        user.setVerified(true);
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setVerificationMethod(VerificationMethod.ADMIN_AUTHORIZED);
        user.setPasswordHash(passwordEncoder.encode(initialPassword));
        user.setVerifiedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) user.setDepartment(request.getDepartment());
        if (request.getFaculty() != null && !request.getFaculty().isBlank()) user.setFaculty(request.getFaculty());
        if (request.getCourse() != null && !request.getCourse().isBlank()) user.setCourse(request.getCourse());
        if (request.getSemester() != null) user.setSemester(request.getSemester());

        try {
            String kcId = keycloakAdminService.createKeycloakUser(
                    trimmedEnrollment,
                    trimmedEmail,
                    studentName,
                    initialPassword,
                    request.getAllowedRole().name()
            );
            if (kcId != null) {
                user.setKeycloakUserId(kcId);
            }
        } catch (Exception e) {
            log.warn("Keycloak creation skipped for student '{}' (will use local MongoDB account): {}", trimmedEnrollment, e.getMessage());
            if (user.getKeycloakUserId() == null) {
                user.setKeycloakUserId("local-kc-" + trimmedEnrollment);
            }
        }

        userRepository.save(user);
        log.info("Admin '{}' authorized and provisioned student: enrollment={}, email={}, role={}",
                adminName, trimmedEnrollment, trimmedEmail, request.getAllowedRole());

        return saved;
    }

    @Override
    public List<AuthorizedStudent> getAllAuthorizedStudents() {
        return authorizedStudentRepository.findAll();
    }

    @Override
    public AuthorizedStudent getAuthorizedStudentById(String id) {
        return authorizedStudentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Authorized student record not found with ID: " + id));
    }

    @Override
    public List<AuthorizedStudent> searchAuthorizedStudents(String query) {
        if (query == null || query.isBlank()) {
            return getAllAuthorizedStudents();
        }
        String q = query.trim();
        return authorizedStudentRepository.findByEnrollmentNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q);
    }

    @Override
    public AuthorizedStudent updateAuthorizedStudent(String id, AuthorizedStudentRequest request) {
        AuthorizedStudent student = getAuthorizedStudentById(id);

        student.setEnrollmentNumber(request.getEnrollmentNumber().trim());
        student.setEmail(request.getEmail().trim().toLowerCase());
        student.setAllowedRole(request.getAllowedRole());
        if (request.getStatus() != null) {
            student.setStatus(request.getStatus());
        }
        student.setUpdatedAt(LocalDateTime.now());

        return authorizedStudentRepository.save(student);
    }

    @Override
    public AuthorizedStudent revokeAuthorization(String id) {
        AuthorizedStudent student = getAuthorizedStudentById(id);
        student.setStatus(AuthorizationStatus.REVOKED);
        student.setUpdatedAt(LocalDateTime.now());

        AuthorizedStudent updated = authorizedStudentRepository.save(student);

        // If the student already registered, disable their Keycloak account & update MongoDB profile
        Optional<User> existingUserOpt = userRepository.findByEnrollmentNumber(student.getEnrollmentNumber())
                .or(() -> userRepository.findByEmail(student.getEmail()));

        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            user.setVerified(false);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            if (user.getKeycloakUserId() != null) {
                keycloakAdminService.setUserEnabledStatus(user.getKeycloakUserId(), false);
                log.info("Revoked authorization and disabled Keycloak account for user: keycloakUserId={}, enrollment={}",
                        user.getKeycloakUserId(), user.getEnrollmentNumber());
            }
        }

        return updated;
    }
}
