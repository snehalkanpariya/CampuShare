package com.campusshare.authservice.service.impl;

<<<<<<< Updated upstream
=======
import com.campusshare.authservice.dto.request.UpdateProfileRequest;
>>>>>>> Stashed changes
import com.campusshare.authservice.dto.response.UserProfileResponse;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

<<<<<<< Updated upstream
=======
import java.time.LocalDateTime;

>>>>>>> Stashed changes
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

<<<<<<< Updated upstream
    @Override
    public UserProfileResponse getUserProfile(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Unauthenticated user email");
        }

        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByEnrollmentNumber(email))
                .orElseThrow(() -> new RuntimeException("User not found for email/enrollment: " + email));

        String semesterDisplay = user.getSemester();
        if (semesterDisplay == null || semesterDisplay.trim().isEmpty()) {
            semesterDisplay = user.getYear() != null ? user.getYear() : "N/A";
        }

        String roleDisplay = user.getRole() != null ? user.getRole().name() : "JUNIOR";
        if ("JUNIOR".equalsIgnoreCase(roleDisplay)) {
            roleDisplay = "Junior";
        } else if ("SENIOR".equalsIgnoreCase(roleDisplay)) {
            roleDisplay = "Senior";
        }

        String statusDisplay = user.getVerificationStatus() != null 
                ? user.getVerificationStatus().name() 
                : (user.isVerified() ? "VERIFIED" : "PENDING");

=======
    private static final String GVP_EMAIL_DOMAIN = "@gujaratvidyapith.org";

    private User findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Authenticated user identity is missing");
        }
        String trimmed = identifier.trim();
        String generatedEmail = trimmed.contains("@") ? trimmed : trimmed.toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        return userRepository.findByEmailIgnoreCase(trimmed)
                .or(() -> userRepository.findByEnrollmentNumberIgnoreCase(trimmed))
                .or(() -> userRepository.findByEmailIgnoreCase(generatedEmail))
                .or(() -> userRepository.findByEmail(trimmed))
                .or(() -> userRepository.findByEnrollmentNumber(trimmed))
                .or(() -> userRepository.findByEmail(generatedEmail))
                .or(() -> userRepository.findById(trimmed))
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> (u.getId() != null && u.getId().equalsIgnoreCase(trimmed))
                                  || (u.getEnrollmentNumber() != null && u.getEnrollmentNumber().equalsIgnoreCase(trimmed))
                                  || (u.getEmail() != null && u.getEmail().equalsIgnoreCase(generatedEmail))
                                  || (u.getEmail() != null && u.getEmail().equalsIgnoreCase(trimmed)))
                        .findFirst())
                .orElseThrow(() -> new RuntimeException("User profile not found for identity: " + identifier));
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
        user.setDepartment(request.getDepartment().trim());
        user.setSemester(request.getSemester());
        user.setUpdatedAt(LocalDateTime.now());

        // Save updated user entity (immutable fields: email, enrollmentNumber, role, verificationStatus, password, id remain untouched)
        User updatedUser = userRepository.save(user);
        log.info("Successfully updated profile for user: email={}, enrollmentNumber={}", updatedUser.getEmail(), updatedUser.getEnrollmentNumber());

        return mapToProfileResponse(updatedUser);
    }

    private UserProfileResponse mapToProfileResponse(User user) {
>>>>>>> Stashed changes
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .enrollmentNumber(user.getEnrollmentNumber())
<<<<<<< Updated upstream
                .role(roleDisplay)
                .department(user.getDepartment())
                .semester(semesterDisplay)
                .verified(user.isVerified())
                .verificationStatus(statusDisplay)
                .profilePicture(user.getProfilePicture())
=======
                .role(user.getRole())
                .department(user.getDepartment())
                .semester(user.getSemester())
                .verificationStatus(user.getVerificationStatus())
                .profilePicture(null)
>>>>>>> Stashed changes
                .build();
    }
}
