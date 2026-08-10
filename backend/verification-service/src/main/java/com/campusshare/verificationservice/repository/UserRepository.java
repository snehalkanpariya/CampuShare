package com.campusshare.verificationservice.repository;

import com.campusshare.verificationservice.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEnrollmentNumber(String enrollmentNumber);
    Optional<User> findByEnrollmentNumberIgnoreCase(String enrollmentNumber);
}
