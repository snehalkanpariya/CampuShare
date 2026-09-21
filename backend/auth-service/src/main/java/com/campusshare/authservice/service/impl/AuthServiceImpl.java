package com.campusshare.authservice.service.impl;

import com.campusshare.authservice.dto.request.*;
import com.campusshare.authservice.dto.response.LoginResponse;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.entity.*;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.security.JwtService;
import com.campusshare.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final String GVP_EMAIL_DOMAIN = "@gujaratvidyapith.org";

    @Override
    public RegisterResponse registerJunior(JuniorRegisterRequest request) {
        String email = request.getEnrollmentNumber().toLowerCase()
                + ".gvp" + GVP_EMAIL_DOMAIN;

        User user = userRepository.findByEnrollmentNumber(request.getEnrollmentNumber())
                .or(() -> userRepository.findByEmail(email))
                .orElse(new User());

        if (user.getId() != null && user.isVerified()) {
            throw new RuntimeException(
                    "Verified user with enrollment number "
                            + request.getEnrollmentNumber()
                            + " already exists. Please log in.");
        }

        String otp = String.format(
                "%06d",
                new SecureRandom().nextInt(1_000_000)
        );

        user.setName(request.getName());
        user.setEmail(email);
        user.setEnrollmentNumber(request.getEnrollmentNumber());
        user.setDepartment(request.getDepartment());
        user.setYear(request.getYear());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.JUNIOR);
        user.setVerified(false);
        user.setVerificationMethod(VerificationMethod.EMAIL);
        user.setVerificationStatus(VerificationStatus.PENDING);
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        user.setCreatedAt(
                user.getCreatedAt() == null
                        ? LocalDateTime.now()
                        : user.getCreatedAt()
        );
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        try {
            RestTemplate restTemplate = new RestTemplate();

            String url = "http://localhost:8082/api/verify/email/send-otp"
                    + "?email=" + email
                    + "&otp=" + otp;

            restTemplate.postForObject(url, null, String.class);

        } catch (Exception ignored) {
            // OTP email service unavailable
        }

        RegisterResponse response = new RegisterResponse();
        response.setMessage("Junior registration successful. OTP sent to " + email);
        response.setEmail(email);

        return response;
    }

    @Override
    public RegisterResponse registerSenior(SeniorRegisterRequest request) {
        String email = request.getEnrollmentNumber().toLowerCase()
                + ".gvp" + GVP_EMAIL_DOMAIN;

        User user = userRepository.findByEnrollmentNumber(request.getEnrollmentNumber())
                .or(() -> userRepository.findByEmail(email))
                .orElse(new User());

        if (user.getId() != null && user.isVerified()) {
            throw new RuntimeException(
                    "Verified user with enrollment number "
                            + request.getEnrollmentNumber()
                            + " already exists. Please log in.");
        }

        user.setName(request.getName());
        user.setEmail(email);
        user.setEnrollmentNumber(request.getEnrollmentNumber());
        user.setDepartment(request.getDepartment());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.SENIOR);
        user.setVerified(false);
        user.setVerificationMethod(VerificationMethod.MARKSHEET);
        user.setVerificationStatus(VerificationStatus.PENDING);
        user.setCreatedAt(
                user.getCreatedAt() == null
                        ? LocalDateTime.now()
                        : user.getCreatedAt()
        );
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        RegisterResponse response = new RegisterResponse();
        response.setMessage(
                "Senior registration initiated. Please upload your marksheet for verification."
        );
        response.setEmail(email);

        return response;
    }

    @Override
    public RegisterResponse verifyOtp(OtpVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new RuntimeException("No active OTP found for this user");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
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

        RegisterResponse response = new RegisterResponse();
        response.setMessage("OTP verified successfully. Account activated!");
        response.setEmail(user.getEmail());

        return response;
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
            throw new RuntimeException(
                    "Account is not verified yet. Please complete verification before logging in."
            );
        }

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse.UserDto userDto = new LoginResponse.UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userDto);

        return response;
    }

    @Override
    public User getUserByEnrollmentNumber(String enrollmentNumber) {
        String trimmed = enrollmentNumber == null
                ? ""
                : enrollmentNumber.trim();

        String email = trimmed.toLowerCase()
                + ".gvp" + GVP_EMAIL_DOMAIN;

        return userRepository.findByEnrollmentNumber(trimmed)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new RuntimeException(
                        "No student account found for Enrollment Number: "
                                + enrollmentNumber
                ));
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
    }
}