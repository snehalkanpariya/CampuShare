package com.campusshare.itemservice.service;

import com.campusshare.itemservice.entity.Notification;
import java.util.List;

public interface NotificationService {

    Notification createNotification(
            String userId,
            String title,
            String message,
            String type,
            String relatedItemId,
            String relatedRequestId,
            String senderName
    );

    List<Notification> getNotificationsForUser(String userId);

    Notification markAsRead(String id);

    void markAllAsRead(String userId);

    long getUnreadCount(String userId);
}
