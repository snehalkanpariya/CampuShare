package com.campusshare.authservice.controller;

<<<<<<< Updated upstream
import com.campusshare.authservice.dto.response.UserProfileResponse;
import com.campusshare.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

=======
import com.campusshare.authservice.dto.request.UpdateProfileRequest;
import com.campusshare.authservice.dto.response.UserProfileResponse;
import com.campusshare.authservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

>>>>>>> Stashed changes
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

<<<<<<< Updated upstream
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UserProfileResponse profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
=======
    private String getAuthenticatedUserIdentifier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            throw new RuntimeException("Unauthorized: User is not authenticated");
        }
        return auth.getName();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        String userIdentifier = getAuthenticatedUserIdentifier();
        UserProfileResponse profile = userService.getMyProfile(userIdentifier);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String userIdentifier = getAuthenticatedUserIdentifier();
        UserProfileResponse updatedProfile = userService.updateMyProfile(userIdentifier, request);
        return ResponseEntity.ok(updatedProfile);
    }
>>>>>>> Stashed changes
}
