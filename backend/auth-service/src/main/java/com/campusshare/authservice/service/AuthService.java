package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.request.RegisterRequest;
import com.campusshare.authservice.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

}