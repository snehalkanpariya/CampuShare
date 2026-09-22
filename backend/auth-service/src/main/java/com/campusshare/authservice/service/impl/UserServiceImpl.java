package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.request.UpdateProfileRequest;
import com.campusshare.authservice.dto.response.UserProfileResponse;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.exception.UserNotFoundException;
import com.campusshare.authservice.exception.UnauthorizedException;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private static final String GVP_EMAIL_DOMAIN = "@gujaratvidyapith.org";

    private User findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new UnauthorizedException("Authenticated user identity is missing");
        }
        String trimmed = identifier.trim();
        String generatedEmail = trimmed.contains("@") ? trimmed : trimmed.toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        String extractedEnrollment = trimmed;
        if (extractedEnrollment.contains("@")) {
            extractedEnrollment = extractedEnrollment.substring(0, extractedEnrollment.indexOf("@"));
        }
        if (extractedEnrollment.contains(".gvp")) {
            extractedEnrollment = extractedEnrollment.substring(0, extractedEnrollment.indexOf(".gvp"));
        }
        final String cleanEnrollment = extractedEnrollment;

        return userRepository.findByEmailIgnoreCase(trimmed)
                .or(() -> userRepository.findByEnrollmentNumberIgnoreCase(trimmed))
                .or(() -> userRepository.findByEnrollmentNumberIgnoreCase(cleanEnrollment))
                .or(() -> userRepository.findByEmailIgnoreCase(generatedEmail))
                .or(() -> userRepository.findByEmail(trimmed))
                .or(() -> userRepository.findByEnrollmentNumber(trimmed))
                .or(() -> userRepository.findByEnrollmentNumber(cleanEnrollment))
                .or(() -> userRepository.findById(trimmed))
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> (u.getId() != null && u.getId().equalsIgnoreCase(trimmed))
                                  || (u.getEnrollmentNumber() != null && u.getEnrollmentNumber().equalsIgnoreCase(trimmed))
                                  || (u.getEnrollmentNumber() != null && u.getEnrollmentNumber().equalsIgnoreCase(cleanEnrollment))
                                  || (u.getEmail() != null && u.getEmail().equalsIgnoreCase(trimmed))
                                  || (u.getEmail() != null && u.getEmail().equalsIgnoreCase(generatedEmail))
                                  || (u.getEmail() != null && u.getEmail().toLowerCase().startsWith(cleanEnrollment.toLowerCase())))
                        .findFirst())
                .orElseThrow(() -> new UserNotFoundException("User profile not found for identity: " + identifier));
    }

    @Override
    public UserProfileResponse getMyProfile(String authenticatedIdentifier) {
        User user = findUserByIdentifier(authenticatedIdentifier);
        return mapToProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateMyProfile(String authenticatedIdentifier, UpdateProfileRequest request) {
        User user = findUserByIdentifier(authenticatedIdentifier);

        // Update ONLY safe editable fields
        user.setName(request.getName().trim());
        if (request.getFaculty() != null && !request.getFaculty().isBlank()) {
            user.setFaculty(request.getFaculty().trim());
        }
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getCourse() != null && !request.getCourse().isBlank()) {
            user.setCourse(request.getCourse().trim());
        }
        if (request.getSemester() != null) {
            user.setSemester(request.getSemester());
        }
        user.setUpdatedAt(LocalDateTime.now());

        // Save updated user entity
        User updatedUser = userRepository.save(user);
        log.info("Successfully updated profile for user: email={}, enrollmentNumber={}", updatedUser.getEmail(), updatedUser.getEnrollmentNumber());

        return mapToProfileResponse(updatedUser);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .enrollmentNumber(user.getEnrollmentNumber())
                .role(user.getRole())
                .faculty(user.getFaculty())
                .department(user.getDepartment())
                .course(user.getCourse())
                .semester(user.getSemester())
                .verificationStatus(user.getVerificationStatus())
                .build();
    }
}
