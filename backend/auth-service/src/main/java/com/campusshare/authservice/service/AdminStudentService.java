package com.campusshare.authservice.service;

import com.campusshare.authservice.dto.request.AuthorizedStudentRequest;
import com.campusshare.authservice.entity.AuthorizedStudent;

import java.security.Principal;
import java.util.List;

public interface AdminStudentService {
    AuthorizedStudent addAuthorizedStudent(AuthorizedStudentRequest request, Principal principal);
    List<AuthorizedStudent> getAllAuthorizedStudents();
    AuthorizedStudent getAuthorizedStudentById(String id);
    List<AuthorizedStudent> searchAuthorizedStudents(String query);
    AuthorizedStudent updateAuthorizedStudent(String id, AuthorizedStudentRequest request);
    AuthorizedStudent revokeAuthorization(String id);
}
