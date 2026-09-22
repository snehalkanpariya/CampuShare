package com.campusshare.authservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
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

    @Indexed(unique = true)
    private String keycloakUserId;

    private String name;

    @Indexed(unique = true)
    private String email;

    @Field("enrollmentNumber")
    @Indexed(unique = true)
    private String enrollmentNumber;

    private String faculty;
    private String department;
    private String course;
    private String year;
    private Integer semester;

    private Role role;
    private boolean verified;
    private VerificationMethod verificationMethod;
    private VerificationStatus verificationStatus;
    private LocalDateTime verifiedAt;

    private String otp;
    private LocalDateTime otpExpiry;

    private String passwordHash;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
