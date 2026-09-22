package com.campusshare.authservice.repository;

import com.campusshare.authservice.entity.AuthorizedStudent;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AuthorizedStudentRepository extends MongoRepository<AuthorizedStudent, String> {
    Optional<AuthorizedStudent> findByEnrollmentNumber(String enrollmentNumber);
    Optional<AuthorizedStudent> findByEnrollmentNumberIgnoreCase(String enrollmentNumber);
    Optional<AuthorizedStudent> findByEmail(String email);
    Optional<AuthorizedStudent> findByEmailIgnoreCase(String email);
    boolean existsByEnrollmentNumber(String enrollmentNumber);
    boolean existsByEmail(String email);
    List<AuthorizedStudent> findByEnrollmentNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(String enrollmentQuery, String emailQuery);
}
