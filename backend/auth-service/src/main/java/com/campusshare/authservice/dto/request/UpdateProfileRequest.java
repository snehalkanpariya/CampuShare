package com.campusshare.authservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String faculty;

    private String department;

    private String course;

    @Min(value = 1, message = "Semester must be at least 1")
    @Max(value = 10, message = "Semester cannot exceed 10")
    private Integer semester;
}
