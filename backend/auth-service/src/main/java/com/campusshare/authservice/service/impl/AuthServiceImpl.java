package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.request.*;
import com.campusshare.authservice.dto.response.LoginResponse;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.entity.*;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.security.JwtService;
import com.campusshare.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final String GVP_EMAIL_DOMAIN = "@gujaratvidyapith.org";

    @Override
    public RegisterResponse registerJunior(JuniorRegisterRequest request) {
        if (request.getEnrollmentNumber() == null || !request.getEnrollmentNumber().trim().matches("^\\d{12}$")) {
            throw new RuntimeException("Enrollment number must be exactly 12 digits (e.g. 250160450049)");
        }
        String generatedEmail = request.getEnrollmentNumber().trim().toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        User existingUser = userRepository.findByEnrollmentNumber(request.getEnrollmentNumber().trim())
                .or(() -> userRepository.findByEmail(generatedEmail))
                .orElse(null);

        if (existingUser != null && existingUser.isVerified()) {
            throw new RuntimeException("Verified user with enrollment number " + request.getEnrollmentNumber() + " already exists. Please log in.");
        }

        String generatedOtp = String.format("%06d", new SecureRandom().nextInt(1000000));

        User user = (existingUser != null) ? existingUser : new User();
        user.setName(request.getName());
        user.setEmail(generatedEmail);
        user.setEnrollmentNumber(request.getEnrollmentNumber().trim());
        user.setDepartment(request.getDepartment());
        user.setYear(request.getYear());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.JUNIOR);
        user.setVerified(false);
        user.setVerificationMethod(VerificationMethod.EMAIL);
        user.setVerificationStatus(VerificationStatus.PENDING);
        user.setOtp(generatedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Call verification-service to dispatch OTP email
        try {
            RestTemplate restTemplate = new RestTemplate();
            String sendOtpUrl = "http://localhost:8082/api/verify/email/send-otp?email=" + generatedEmail + "&otp=" + generatedOtp;
            restTemplate.postForObject(sendOtpUrl, null, String.class);
            log.info("Triggered OTP email dispatch via verification-service for {}", generatedEmail);
        } catch (Exception e) {
            log.warn("Could not dispatch OTP email via verification-service: {}", e.getMessage());
        }

        return RegisterResponse.builder()
                .message("Junior registration successful. OTP sent to " + generatedEmail)
                .email(generatedEmail)
                .build();
    }

    @Override
    public RegisterResponse registerSenior(SeniorRegisterRequest request) {
        if (request.getEnrollmentNumber() == null || !request.getEnrollmentNumber().trim().matches("^\\d{12}$")) {
            throw new RuntimeException("Enrollment number must be exactly 12 digits (e.g. 250160450049)");
        }
        String generatedEmail = request.getEnrollmentNumber().trim().toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        User existingUser = userRepository.findByEnrollmentNumber(request.getEnrollmentNumber().trim())
                .or(() -> userRepository.findByEmail(generatedEmail))
                .orElse(null);

        if (existingUser != null && existingUser.isVerified()) {
            throw new RuntimeException("Verified user with enrollment number " + request.getEnrollmentNumber() + " already exists. Please log in.");
        }

        User user = (existingUser != null) ? existingUser : new User();
        user.setName(request.getName());
        user.setEmail(generatedEmail);
        user.setEnrollmentNumber(request.getEnrollmentNumber().trim());
        user.setDepartment(request.getDepartment());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.SENIOR);
        user.setVerified(false);
        user.setVerificationMethod(VerificationMethod.MARKSHEET);
        user.setVerificationStatus(VerificationStatus.PENDING);
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Successfully saved Senior User to MongoDB: id={}, email={}, enrollmentNumber={}, verified={}",
                savedUser.getId(), savedUser.getEmail(), savedUser.getEnrollmentNumber(), savedUser.isVerified());

        return RegisterResponse.builder()
                .message("Senior registration initiated. Please upload your marksheet for verification.")
                .email(generatedEmail)
                .build();
    }

    @Override
    public RegisterResponse verifyOtp(OtpVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new RuntimeException("No active OTP found for this user");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new OTP.");
        }

        if (!user.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setVerified(true);
        user.setVerificationMethod(VerificationMethod.EMAIL);
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setVerifiedAt(LocalDateTime.now());
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return RegisterResponse.builder()
                .message("OTP verified successfully. Account activated!")
                .email(user.getEmail())
                .build();
    }

    private User findUserByEmailOrEnrollment(String input) {
        if (input == null || input.isBlank()) {
            throw new RuntimeException("Email or Enrollment Number is required");
        }
        String trimmed = input.trim();
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
                .orElseThrow(() -> new RuntimeException("No account found for email or enrollment number: " + input));
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = findUserByEmailOrEnrollment(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Account is not verified yet. Please complete verification before logging in.");
        }

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .enrollmentNumber(user.getEnrollmentNumber())
                .department(user.getDepartment())
                .year(user.getYear())
                .role(user.getRole())
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    @Override
    public RegisterResponse forgotPassword(ForgotPasswordRequest request) {
        User user = findUserByEmailOrEnrollment(request.getEmail());

        String generatedOtp = String.format("%06d", new SecureRandom().nextInt(1000000));

        user.setOtp(generatedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Call verification-service to dispatch Password Reset OTP email
        try {
            RestTemplate restTemplate = new RestTemplate();
            String sendOtpUrl = "http://localhost:8082/api/verify/email/send-otp?email=" + user.getEmail() + "&otp=" + generatedOtp + "&type=FORGOT_PASSWORD";
            restTemplate.postForObject(sendOtpUrl, null, String.class);
            log.info("Triggered Password Reset OTP email dispatch via verification-service for {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Could not dispatch Password Reset OTP email via verification-service: {}", e.getMessage());
        }

        return RegisterResponse.builder()
                .message("Password reset OTP sent to " + user.getEmail())
                .email(user.getEmail())
                .build();
    }

    @Override
    public RegisterResponse resetPassword(ResetPasswordRequest request) {
        User user = findUserByEmailOrEnrollment(request.getEmail());

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new RuntimeException("No active password reset OTP found for this user");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new OTP.");
        }

        if (!user.getOtp().equals(request.getOtp().trim())) {
            throw new RuntimeException("Invalid OTP");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return RegisterResponse.builder()
                .message("Password reset successfully. Please log in with your new password.")
                .email(user.getEmail())
                .build();
    }

    @Override
    public RegisterResponse resetPasswordSenior(String enrollmentNumber, String name, String newPassword, org.springframework.web.multipart.MultipartFile file) {
        if (enrollmentNumber == null || !enrollmentNumber.trim().matches("^\\d{12}$")) {
            throw new RuntimeException("Enrollment number must be exactly 12 digits (e.g. 250160450049)");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Marksheet document file is required for Senior password reset");
        }

        String trimmedEnrollment = enrollmentNumber.trim();
        User user = userRepository.findByEnrollmentNumber(trimmedEnrollment)
                .or(() -> userRepository.findByEnrollmentNumberIgnoreCase(trimmedEnrollment))
                .orElseThrow(() -> new RuntimeException("No senior student account found for Enrollment Number: " + trimmedEnrollment));

        if (user.getRole() != Role.SENIOR) {
            throw new RuntimeException("This password reset method is for Senior Students. Junior students must use Email OTP reset.");
        }

        // Call verification-service OCR to verify marksheet
        try {
            RestTemplate restTemplate = new RestTemplate();
            String ocrUrl = "http://localhost:8082/api/verify/ocr/marksheet";

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            body.add("name", (name != null && !name.isBlank()) ? name.trim() : user.getName());
            body.add("enrollmentNumber", trimmedEnrollment);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity(ocrUrl, requestEntity, java.util.Map.class);

            if (response.getBody() == null || !Boolean.TRUE.equals(response.getBody().get("success"))) {
                String msg = (response.getBody() != null && response.getBody().get("message") != null) 
                        ? response.getBody().get("message").toString() 
                        : "Marksheet verification failed";
                throw new RuntimeException("Password reset failed: " + msg);
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error communicating with verification-service during Senior password reset: {}", e.getMessage());
            throw new RuntimeException("Could not verify marksheet with verification-service: " + e.getMessage());
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerified(true);
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setVerifiedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Successfully reset password for Senior User: enrollmentNumber={}", trimmedEnrollment);

        return RegisterResponse.builder()
                .message("Senior student password reset successfully via Marksheet OCR Verification! You can now log in.")
                .email(user.getEmail())
                .build();
    }

    @Override
    public User getUserByEnrollmentNumber(String enrollmentNumber) {
        return findUserByEmailOrEnrollment(enrollmentNumber);
    }

    @Override
    public void activateSenior(String enrollmentNumber) {
        User user = getUserByEnrollmentNumber(enrollmentNumber);
        user.setVerified(true);
        user.setVerificationMethod(VerificationMethod.MARKSHEET_OCR);
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setVerifiedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Activated Senior User in MongoDB: enrollmentNumber={}, email={}, method=MARKSHEET_OCR", enrollmentNumber, user.getEmail());
    }

    @Override
    public RegisterResponse changePassword(ChangePasswordRequest request) {
        if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
            throw new RuntimeException("Current password is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        String userIdentifier = request.getEmail();
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if ((userIdentifier == null || userIdentifier.isBlank() || userIdentifier.equalsIgnoreCase("student@gujaratvidyapith.org")) 
                && auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            userIdentifier = auth.getName();
        }

        if (userIdentifier == null || userIdentifier.isBlank()) {
            throw new RuntimeException("User identity could not be found");
        }

        User user;
        try {
            user = findUserByEmailOrEnrollment(userIdentifier);
        } catch (Exception e) {
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser") && !auth.getName().equalsIgnoreCase(userIdentifier)) {
                user = findUserByEmailOrEnrollment(auth.getName());
            } else {
                throw e;
            }
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Successfully changed password for user: email={}", user.getEmail());

        return RegisterResponse.builder()
                .message("Password changed successfully!")
                .email(user.getEmail())
                .build();
    }
}
