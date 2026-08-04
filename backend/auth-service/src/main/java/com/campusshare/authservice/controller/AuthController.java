package com.campusshare.authservice.controller;
import com.campusshare.authservice.dto.request.RegisterRequest;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }
}
