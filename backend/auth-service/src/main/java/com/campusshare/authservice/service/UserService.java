package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.request.UpdateProfileRequest;
import com.campusshare.authservice.dto.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getMyProfile(String authenticatedIdentifier);

    UserProfileResponse updateMyProfile(String authenticatedIdentifier, UpdateProfileRequest request);
}
