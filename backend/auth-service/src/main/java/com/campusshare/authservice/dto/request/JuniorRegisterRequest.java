package com.campusshare.authservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JuniorRegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Enrollment number is required")
    private String enrollmentNumber;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Year is required")
    private String year;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
}
