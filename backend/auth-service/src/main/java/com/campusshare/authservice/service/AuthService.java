package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.request.*;
import com.campusshare.authservice.dto.response.LoginResponse;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.entity.User;

import org.springframework.web.multipart.MultipartFile;

public interface AuthService {
    RegisterResponse registerJunior(JuniorRegisterRequest request);
    RegisterResponse registerSenior(SeniorRegisterRequest request);
    RegisterResponse verifyOtp(OtpVerificationRequest request);
    LoginResponse login(LoginRequest request);

    RegisterResponse forgotPassword(ForgotPasswordRequest request);
    RegisterResponse resetPassword(ResetPasswordRequest request);
    RegisterResponse resetPasswordSenior(String enrollmentNumber, String name, String newPassword, MultipartFile file);

    User getUserByEnrollmentNumber(String enrollmentNumber);
    void activateSenior(String enrollmentNumber);
}