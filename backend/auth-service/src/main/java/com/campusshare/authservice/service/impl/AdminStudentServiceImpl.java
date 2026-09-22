package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.request.AuthorizedStudentRequest;
import com.campusshare.authservice.entity.AuthorizationStatus;
import com.campusshare.authservice.entity.AuthorizedStudent;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.repository.AuthorizedStudentRepository;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.AdminStudentService;
import com.campusshare.authservice.service.KeycloakAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Override
    public AuthorizedStudent addAuthorizedStudent(AuthorizedStudentRequest request, Principal principal) {
        String trimmedEnrollment = request.getEnrollmentNumber().trim();
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        if (authorizedStudentRepository.existsByEnrollmentNumber(trimmedEnrollment)) {
            throw new RuntimeException("Student with enrollment number " + trimmedEnrollment + " is already in authorization list.");
        }
        if (authorizedStudentRepository.existsByEmail(trimmedEmail)) {
            throw new RuntimeException("Student with email " + trimmedEmail + " is already in authorization list.");
        }

        String adminName = (principal != null) ? principal.getName() : "ADMIN";

        AuthorizedStudent student = AuthorizedStudent.builder()
                .enrollmentNumber(trimmedEnrollment)
                .email(trimmedEmail)
                .allowedRole(request.getAllowedRole())
                .status(request.getStatus() != null ? request.getStatus() : AuthorizationStatus.APPROVED)
                .authorizedBy(adminName)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        log.info("Admin '{}' authorized student: enrollment={}, email={}, role={}", adminName, trimmedEnrollment, trimmedEmail, request.getAllowedRole());
        return authorizedStudentRepository.save(student);
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
