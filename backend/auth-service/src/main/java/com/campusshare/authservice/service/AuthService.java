package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.request.*;
import com.campusshare.authservice.dto.response.LoginResponse;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.entity.User;

public interface AuthService {
    RegisterResponse registerJunior(JuniorRegisterRequest request);
    RegisterResponse registerSenior(SeniorRegisterRequest request);
    RegisterResponse verifyOtp(OtpVerificationRequest request);
    LoginResponse login(LoginRequest request);

    User getUserByEnrollmentNumber(String enrollmentNumber);
    void activateSenior(String enrollmentNumber);
}