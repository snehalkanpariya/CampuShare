package com.campusshare.authservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "authorized_students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizedStudent {
    @Id
    private String id;

    @Indexed(unique = true)
    private String enrollmentNumber;

    @Indexed(unique = true)
    private String email;

    private Role allowedRole;

    private AuthorizationStatus status;

    private String authorizedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
