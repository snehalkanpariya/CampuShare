package com.campusshare.itemservice.service.impl;

import com.campusshare.itemservice.entity.Notification;
import com.campusshare.itemservice.repository.NotificationRepository;
import com.campusshare.itemservice.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public Notification createNotification(
            String userId,
            String title,
            String message,
            String type,
            String relatedItemId,
            String relatedRequestId,
            String senderName) {

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedItemId(relatedItemId);
        notification.setRelatedRequestId(relatedRequestId);
        notification.setSenderName(senderName);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());

        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Notification markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : userNotifications) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
