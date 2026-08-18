package com.campusshare.authservice.controller;

import com.campusshare.authservice.dto.response.UserProfileResponse;
import com.campusshare.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        UserProfileResponse profile = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }
}
