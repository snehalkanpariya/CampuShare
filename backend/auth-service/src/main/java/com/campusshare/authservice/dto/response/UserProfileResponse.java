package com.campusshare.authservice.dto.response;

<<<<<<< Updated upstream
=======
import com.campusshare.authservice.entity.Role;
import com.campusshare.authservice.entity.VerificationStatus;
>>>>>>> Stashed changes
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    private String id;
    private String name;
    private String email;
    private String enrollmentNumber;
<<<<<<< Updated upstream
    private String role;
    private String department;
    private String semester;
    private boolean verified;
    private String verificationStatus;
=======
    private Role role;
    private String department;
    private Integer semester;
    private VerificationStatus verificationStatus;
>>>>>>> Stashed changes
    private String profilePicture;
}
