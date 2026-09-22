package com.campusshare.authservice.dto.request;

import com.campusshare.authservice.entity.AuthorizationStatus;
import com.campusshare.authservice.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuthorizedStudentRequest {
    @NotBlank(message = "Enrollment Number is required")
    private String enrollmentNumber;

    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Allowed Role (JUNIOR or SENIOR) is required")
    private Role allowedRole;

    private AuthorizationStatus status = AuthorizationStatus.APPROVED;
}
