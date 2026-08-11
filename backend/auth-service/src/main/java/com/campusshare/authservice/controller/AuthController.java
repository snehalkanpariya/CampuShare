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
