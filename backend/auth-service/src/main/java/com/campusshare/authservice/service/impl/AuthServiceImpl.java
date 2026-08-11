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
        String generatedEmail = request.getEnrollmentNumber().toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        User existingUser = userRepository.findByEnrollmentNumber(request.getEnrollmentNumber())
                .or(() -> userRepository.findByEmail(generatedEmail))
                .orElse(null);

        if (existingUser != null && existingUser.isVerified()) {
            throw new RuntimeException("Verified user with enrollment number " + request.getEnrollmentNumber() + " already exists. Please log in.");
        }

        String generatedOtp = String.format("%06d", new SecureRandom().nextInt(1000000));

        User user = (existingUser != null) ? existingUser : new User();
        user.setName(request.getName());
        user.setEmail(generatedEmail);
        user.setEnrollmentNumber(request.getEnrollmentNumber());
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
        String generatedEmail = request.getEnrollmentNumber().toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        User existingUser = userRepository.findByEnrollmentNumber(request.getEnrollmentNumber())
                .or(() -> userRepository.findByEmail(generatedEmail))
                .orElse(null);

        if (existingUser != null && existingUser.isVerified()) {
            throw new RuntimeException("Verified user with enrollment number " + request.getEnrollmentNumber() + " already exists. Please log in.");
        }

        User user = (existingUser != null) ? existingUser : new User();
        user.setName(request.getName());
        user.setEmail(generatedEmail);
        user.setEnrollmentNumber(request.getEnrollmentNumber());
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

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByEnrollmentNumber(request.getEmail()))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

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
                .role(user.getRole())
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    @Override
    public User getUserByEnrollmentNumber(String enrollmentNumber) {
        String trimmed = (enrollmentNumber != null) ? enrollmentNumber.trim() : "";
        String generatedEmail = trimmed.toLowerCase() + ".gvp" + GVP_EMAIL_DOMAIN;

        return userRepository.findByEnrollmentNumber(trimmed)
                .or(() -> userRepository.findByEmail(generatedEmail))
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> (u.getEnrollmentNumber() != null && u.getEnrollmentNumber().equalsIgnoreCase(trimmed))
                                  || (u.getEmail() != null && u.getEmail().equalsIgnoreCase(generatedEmail)))
                        .findFirst())
                .orElseThrow(() -> new RuntimeException("No student account found for Enrollment Number: " + enrollmentNumber));
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
}
