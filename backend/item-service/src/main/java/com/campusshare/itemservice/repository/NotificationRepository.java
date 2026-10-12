package com.campusshare.itemservice.repository;

import com.campusshare.itemservice.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Get all notifications for a specific user ordered by latest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    // Count unread notifications
    long countByUserIdAndIsReadFalse(String userId);
}
