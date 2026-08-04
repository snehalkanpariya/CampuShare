package com.campusshare.authservice.service.impl;
import com.campusshare.authservice.dto.request.RegisterRequest;
import com.campusshare.authservice.dto.response.RegisterResponse;
import com.campusshare.authservice.entity.Role;
import com.campusshare.authservice.entity.User;
import com.campusshare.authservice.repository.UserRepository;
import com.campusshare.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{
     private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .enabled(true)
                .build();

        userRepository.save(user);

        return RegisterResponse.builder()
                .message("Registration Successful")
                .email(user.getEmail())
                .build();
    }
}
