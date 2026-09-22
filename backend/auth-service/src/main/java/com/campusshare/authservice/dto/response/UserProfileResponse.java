package com.campusshare.authservice.dto.response;

import com.campusshare.authservice.entity.Role;
import com.campusshare.authservice.entity.VerificationStatus;
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
    private Role role;
    private String faculty;
    private String department;
    private String course;
    private Integer semester;
    private VerificationStatus verificationStatus;
}
