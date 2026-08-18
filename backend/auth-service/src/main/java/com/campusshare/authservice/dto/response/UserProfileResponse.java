package com.campusshare.authservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private String enrollmentNumber;
    private String role;
    private String department;
    private String semester;
    private boolean verified;
    private String verificationStatus;
    private String profilePicture;
}
