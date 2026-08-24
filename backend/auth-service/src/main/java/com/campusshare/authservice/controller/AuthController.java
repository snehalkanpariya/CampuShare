package com.campusshare.authservice.controller;

import com.campusshare.authservice.dto.request.*;
import com.campusshare.authservice.dto.response.LoginResponse;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/junior")
    public RegisterResponse registerJunior(@Valid @RequestBody JuniorRegisterRequest request) {
        return authService.registerJunior(request);
    }

    @PostMapping("/register/senior")
    public RegisterResponse registerSenior(@Valid @RequestBody SeniorRegisterRequest request) {
        return authService.registerSenior(request);
    }

    @PostMapping("/verify-otp")
    public RegisterResponse verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public RegisterResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public RegisterResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/reset-password/senior")
    public ResponseEntity<RegisterResponse> resetPasswordSenior(
            @RequestParam("enrollmentNumber") String enrollmentNumber,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("file") MultipartFile file) {
        RegisterResponse response = authService.resetPasswordSenior(enrollmentNumber, name, newPassword, file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/internal/user")
    public ResponseEntity<User> getUserByEnrollmentNumber(@RequestParam String enrollmentNumber) {
        User user = authService.getUserByEnrollmentNumber(enrollmentNumber);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/internal/activate-senior")
    public ResponseEntity<String> activateSenior(@RequestParam String enrollmentNumber) {
        authService.activateSenior(enrollmentNumber);
        return ResponseEntity.ok("Senior account activated successfully");
    }
}
