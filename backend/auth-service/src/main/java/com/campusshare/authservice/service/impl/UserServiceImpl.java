package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.response.UserProfileResponse;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

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

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .enrollmentNumber(user.getEnrollmentNumber())
                .role(roleDisplay)
                .department(user.getDepartment())
                .semester(semesterDisplay)
                .verified(user.isVerified())
                .verificationStatus(statusDisplay)
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
