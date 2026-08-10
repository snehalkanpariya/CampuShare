package com.campusshare.authservice.repository;

import com.campusshare.authservice.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEnrollmentNumber(String enrollmentNumber);
    boolean existsByEnrollmentNumber(String enrollmentNumber);
}
