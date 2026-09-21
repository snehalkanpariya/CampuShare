package com.campusshare.authservice.dto.response;

import com.campusshare.authservice.entity.Role;
import lombok.Data;

@Data
public class LoginResponse {

    private String token;
    private UserDto user;

    @Data
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private Role role;
    }
}