package com.campusshare.authservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String name;
    private String email;

    @Field("enrollmentNumber")
    private String enrollmentNumber;

    private String department;
    private String year;
    private String password;

    private Role role;
    private boolean verified;
    private VerificationMethod verificationMethod;
    private VerificationStatus verificationStatus;
    private LocalDateTime verifiedAt;

    private String otp;
    private LocalDateTime otpExpiry;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
