package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String email);
}
